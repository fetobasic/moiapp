import React, { useCallback, useEffect, useRef, useState } from 'react';
import { View, StatusBar, Linking, StyleSheet } from 'react-native';
import { isEmpty, pathOr } from 'ramda';
import { isNumber } from 'lodash';
import { setJSExceptionHandler, setNativeExceptionHandler } from 'react-native-exception-handler';
import Modal from 'react-native-modal';
import { useAppState, useBackHandler } from '@react-native-community/hooks';
import { wait } from 'App/Services/Wait';
import ModalContent from 'App/Components/Modal';
import Config from 'App/Config/AppConfig';
import { Notification } from 'App/Config/PushConfig';
import Navigator, { isPairingRoutes, navigationGoBack } from 'App/Navigation/AppNavigation';

import { subscribe, stateChanges, reconnect, get, UNNAMED } from 'App/Services/Aws';
import Logger from 'App/Services/Logger';
import { sendOnlineStates, updateStateToDisconnectedAfterTimeout } from 'App/Services/Heartbeating';
import { disableForceWifiUsage } from 'App/Services/AndroidWifi';
import { openDeepLinkUrl } from 'App/Services/Linking';
import { showUpdateIncompleteDialog } from 'App/Services/Alert';
import { minsToFormattedTime } from 'App/Transforms/minsToFormattedTime';
import { update } from 'App/Services/ConnectionControler';
import { useAppDispatch, useAppSelector, useEvents, useMount, usePrevious } from 'App/Hooks';
import { awsActions } from 'App/Store/AWS';
import { firmwareUpdateActions } from 'App/Store/FirmwareUpdate';
import { devicesActions, devicesSelectors } from 'App/Store/Devices';
import { notificationActions } from 'App/Store/Notification';
import { Colors, Metrics } from 'App/Themes';
import { store } from 'App/Store';
import { cacheActions } from 'App/Store/Cache';
import { isAllowedToShowAppRate } from 'App/Services/AppRate';
import { modalActions } from 'App/Store/Modal';
import { ReceivedStateObject } from 'App/Types/AWS';
import { Yeti6GState } from 'App/Types/Yeti';
import { registerDevices } from 'App/Services/Yeti';
import { isLegacyThing } from 'App/Services/ThingHelper';
import { SHADOW_NAMES } from 'App/Services/Aws';
import { DeviceState } from 'App/Types/Devices';
import { fileLogger } from 'App/Services/FileLogger';

const errorHandler = (error: any) => {
  Logger.error(`Error Handle: ${JSON.stringify(error)}`);
};

setJSExceptionHandler(errorHandler);
setNativeExceptionHandler(errorHandler);

const RootContainer = () => {
  const dispatch = useAppDispatch();
  const currentAppState = useAppState();
  const prevAppState = usePrevious(currentAppState);
  const appLoadedTime = useRef(Date.now());
  const events = useEvents();

  const [outOfSyncDialogIsShown, setOutOfSyncDialogIsShown] = useState(false);
  const checkFirmwareUpdatesTimerId = useRef<ReturnType<typeof setInterval>>();
  const firmwareVersionsTimerId = useRef<ReturnType<typeof setInterval>>();
  const appRateTimerId = useRef<ReturnType<typeof setTimeout>>();

  const { devices, isConnected, isDirectConnection, modal, isAppLoaded, isBlockedShowAppRate } = useAppSelector(
    (state) => ({
      devices: state.devicesInfo.data,
      isConnected: state.network.isConnected,
      isDirectConnection: state.application.isDirectConnection,
      modal: state.modal,
      isAppLoaded: state.startup.isAppLoaded,
      isBlockedShowAppRate: state.cache.appRateInfo.isBlockedShowAppRate,
    }),
  );
  const prevIsConnected = usePrevious(isConnected);

  useBackHandler(() => {
    if (!isPairingRoutes()) {
      navigationGoBack();
    }

    return true;
  });

  const prevDevicesLength = usePrevious(devices.length) as number;

  const subscribeThing = useCallback(
    (
      thingName: string,
      stateObject: ReceivedStateObject,
      shadowName: (typeof SHADOW_NAMES)[number] | typeof UNNAMED,
    ) => {
      const data = stateObject?.state?.reported;
      const currentDevice = devicesSelectors.getCurrentDevice(thingName)(store.getState());
      let timestamp: number | undefined;
      let isSkipInsertAppOnlineState = false;
      const isLegacy = isLegacyThing(currentDevice.thingName || '');

      if (isLegacy) {
        timestamp = stateObject?.metadata?.reported?.thingName?.timestamp;
      } else {
        // Get timestamp only from STATUS shadow because it's updated more often and includes online state
        // If we receive states from other shadows, we need to skip insert isConnected state
        if (shadowName === 'status') {
          timestamp = stateObject?.metadata?.reported?._version?.timestamp;
        } else {
          isSkipInsertAppOnlineState = true;
        }
      }

      // If app loaded less than 5s ago, we need to set isConnected state to true
      // Because we don't know if device is online or not
      // The first state we recieve with old timestamp and after sending app online state
      // need some time to receive actual state with new timestamp
      let _isConnected = appLoadedTime.current > Date.now() - Config.appLoadTime;

      // If we receive only desired state, we need to skip insert isConnected state
      if (!timestamp && !stateObject?.state?.reported) {
        isSkipInsertAppOnlineState = true;
      }

      let dateSync = null;

      if (timestamp) {
        dateSync = new Date(timestamp * 1000);
        _isConnected = _isConnected || dateSync.getTime() > new Date().getTime() - Config.disconnectedTimeout;
      }

      if (data && (currentDevice?.thingName || isPairingRoutes())) {
        let thingData: DeviceState = {
          thingName,
        };

        if (!isSkipInsertAppOnlineState) {
          thingData = {
            ...thingData,
            isConnected: _isConnected,
            dateSync: dateSync?.toString(),
          };
        }

        if (shadowName && shadowName !== UNNAMED) {
          // @ts-ignore TODO: try to ensure TS that this is Y6G only
          thingData[shadowName] = data;

          if (shadowName === 'device' && data?.identity?.lbl) {
            thingData = {
              ...thingData,
              name: data?.identity?.lbl,
            };
          }
        } else {
          thingData = {
            ...thingData,
            ...data,
          };
        }

        dispatch(
          devicesActions.devicesAddUpdate.request({
            thingName,
            data: thingData,
          }),
        );

        if (isLegacy || shadowName === 'status') {
          dispatch(devicesActions.blockAllPorts({ thingName, state: false }));
          dispatch(
            firmwareUpdateActions.firmwareUpdateCheckVersions({
              thingName: data.thingName,
              oldVersion: data.firmwareVersion,
            }),
          );
        }

        if (_isConnected) {
          updateStateToDisconnectedAfterTimeout(thingName, (_thingName, _data) =>
            dispatch(
              devicesActions.devicesAddUpdate.request({
                thingName: _thingName,
                data: _data,
              }),
            ),
          );
        }
      }
    },
    [dispatch],
  );

  const sendOnlineStateToAllDevices = useCallback(
    async ({ withReconnect }: { withReconnect?: boolean }) => {
      if (!isDirectConnection && !isEmpty(devices)) {
        if (withReconnect) {
          await reconnect();
        }

        await wait(Config.sendOnlineStateAfterReconnectDelay);

        devices.forEach((thing) => {
          if (!thing.isDirectConnection) {
            get(thing.thingName || '');
          }
        });
        sendOnlineStates(devices);
      }
    },
    [devices, isDirectConnection],
  );

  const checkFirmwareUpdates = useCallback(() => {
    if (checkFirmwareUpdatesTimerId.current) {
      clearInterval(checkFirmwareUpdatesTimerId.current);
    }

    dispatch(firmwareUpdateActions.firmwareCheckUpdates.request());
    checkFirmwareUpdatesTimerId.current = setInterval(
      () => dispatch(firmwareUpdateActions.firmwareCheckUpdates.request()),
      Config.checkUpdatesInterval,
    );
  }, [dispatch]);

  const openDeepLink = async () => {
    const url = (await Linking.getInitialURL()) as string;
    fileLogger.addLog('DeepLink', url);
    openDeepLinkUrl({ url });
  };

  const showAppRate = useCallback(() => {
    if (appRateTimerId.current) {
      clearTimeout(appRateTimerId.current);
      appRateTimerId.current = undefined;
    }

    if (!isAllowedToShowAppRate()) {
      return;
    }

    appRateTimerId.current = setTimeout(
      () => dispatch(cacheActions.changeAppRateInfo({ isReadyToShowAppRate: true })),
      Config.appRateCheckDelay,
    );
  }, [dispatch]);

  const checkShowOtaOutOfSync = useCallback(
    (thing: Yeti6GState) => {
      // check if there's an ota delay in the thing state
      // @ts-ignore TODO: ensure it is valid code, as this field `delay` is not documented
      const delay = thing?.ota?.delay || 0;
      // if the delay is set, we've not yet been notified about it, and we aren't actively showing the same dialog
      // @ts-ignore TODO: ensure it is valid code, as this field `isOtaDelayAcknowledged` is not documented
      if (isNumber(delay) && delay > 0 && thing.isOtaDelayAcknowledged === 0 && !outOfSyncDialogIsShown) {
        let [days, hours, minutes] = minsToFormattedTime(delay);
        // we're about to show the dialog, so block any more from showing
        setOutOfSyncDialogIsShown(true);
        // show the incomplete update dialog
        showUpdateIncompleteDialog(
          `${pathOr('Your Yeti', ['name'], thing)} was unable to finish the update. It will try again in ${
            days > 0 ? `${days}d ` : ''
          }${hours > 0 ? `${hours}h ` : ''}${days > 0 ? '' : `${minutes}m`}.`,
          () => {
            // on "Try Now"
            // when the user says "Try Now", we clear the delay in the shadow
            update({
              thingName: thing.thingName,
              stateObject: {
                state: {
                  desired: {
                    // @ts-ignore TODO: ensure it is valid code, as this field `delay` is not documented
                    ota: { delay: 0 },
                  },
                },
              },
              isDirectConnection,
              updateDeviceState: (thingName, data) =>
                dispatch(devicesActions.devicesAddUpdate.request({ thingName, data })),
              changeSwitchState: (thingName, state) =>
                dispatch(devicesActions.blockAllNotifications({ thingName, state })),
            });
            // we set that we've acknowledged the delay in the local state
            // the value is a counter to debounce any race conditions of setting the acknowledgement, and clearing the delay
            dispatch(
              devicesActions.devicesAddUpdate.request({
                thingName: thing.thingName,
                data: {
                  // @ts-ignore TODO: ensure it is valid code, as this field `isOtaDelayAcknowledged` is not documented
                  isOtaDelayAcknowledged: 2,
                },
              }),
            );
            // we're no longer showing the dialog
            setOutOfSyncDialogIsShown(false);
          },
          () => {
            // on "OK"
            // if user presses "OK", we set the delay as acknowledged in the device's local state
            dispatch(
              devicesActions.devicesAddUpdate.request({
                thingName: thing.thingName,
                data: {
                  // @ts-ignore TODO: ensure it is valid code, as this field `isOtaDelayAcknowledged` is not documented
                  isOtaDelayAcknowledged: 2,
                },
              }),
            );
            // and we're no longer showing the dialog
            setOutOfSyncDialogIsShown(false);
          },
        );
        // return true to indicate that we found a Yeti that has an active OTA delay
        return true;
        // if the yeti doesn't have an active delay, but it's been acknowledged
        // @ts-ignore TODO: ensure it is valid code, as this field `isOtaDelayAcknowledged` is not documented
      } else if (isNumber(delay) && delay === 0 && thing.isOtaDelayAcknowledged > 0) {
        // decrement the debounce of the acknowledgement
        dispatch(
          devicesActions.devicesAddUpdate.request({
            thingName: thing.thingName,
            data: {
              // @ts-ignore TODO: ensure it is valid code, as this field `isOtaDelayAcknowledged` is not documented
              isOtaDelayAcknowledged: thing.isOtaDelayAcknowledged - 1,
            },
          }),
        );
      }
      return false; // no delay dialogs shown yet
    },
    [dispatch, isDirectConnection, outOfSyncDialogIsShown],
  );

  useEffect(() => {
    // Internet On
    if (isConnected && !prevIsConnected) {
      sendOnlineStates(devices);
    }

    // Internet Off
    if (prevIsConnected && !isConnected && !isDirectConnection) {
      devices.forEach((thing) =>
        dispatch(
          devicesActions.devicesAddUpdate.request({
            thingName: thing.thingName || '',
            data: {
              isConnected: false,
            },
          }),
        ),
      );
    }
  }, [isConnected, isDirectConnection, devices, dispatch, prevIsConnected]);

  useEffect(() => {
    // check for any Yetis with an Out of Sync OTA
    // if any returns true, `some` will short circuit the search
    // @ts-ignore we probably can't ensure TS that `checkShowOtaOutOfSync` is valid handler function for `array.some`
    devices?.some(checkShowOtaOutOfSync);
  }, [checkShowOtaOutOfSync, devices]);

  useEffect(() => {
    fileLogger.addLog('AppState', `${prevAppState} -> ${currentAppState}`);

    if ((prevAppState === 'inactive' || prevAppState === 'background') && currentAppState === 'active') {
      appLoadedTime.current = Date.now();
      sendOnlineStateToAllDevices({ withReconnect: true });

      // Get Notifications
      const thingNames = devices.map((d) => d.thingName ?? '');
      dispatch(notificationActions.getNotifications.request({ thingNames }));

      // Check actual Things
      if (!isPairingRoutes()) {
        dispatch(devicesActions.checkPairedThings.request());
      }
    }
  }, [prevAppState, currentAppState, sendOnlineStateToAllDevices, dispatch, devices]);

  useEffect(() => {
    if (isBlockedShowAppRate && appRateTimerId.current) {
      clearTimeout(appRateTimerId.current);
      appRateTimerId.current = undefined;
    }
  }, [isBlockedShowAppRate]);

  useEffect(() => {
    if (!isEmpty(devices) && devices.length > prevDevicesLength) {
      /** Show App Rate after success pairing */
      showAppRate();
    }
  }, [devices, prevDevicesLength, showAppRate]);

  useEffect(() => {
    if (isAppLoaded) {
      fileLogger.addLog('AppLoaded', 'true');
      events.identify();

      appLoadedTime.current = Date.now();

      /** AWS */
      subscribe(subscribeThing, (status, jobInfo, progress) =>
        dispatch(
          firmwareUpdateActions.firmwareUpdateCompleted({
            status,
            jobInfo,
            progress,
          }),
        ),
      );

      /** Register Devices */
      registerDevices();

      /**  Get Notifications */
      const thingNames = store.getState().devicesInfo.data.map((d: DeviceState) => d.thingName ?? '');
      dispatch(notificationActions.getNotifications.request({ thingNames }));

      /** Check new firmware */
      checkFirmwareUpdates();

      /** Send Online State */
      sendOnlineStateToAllDevices({ withReconnect: false });

      /** Deep Links */
      openDeepLink();

      /** Show App Rate */
      if (!isEmpty(devices)) {
        showAppRate();
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [checkFirmwareUpdates, dispatch, isAppLoaded, showAppRate, subscribeThing]);

  useMount(() => {
    /** AWS */
    stateChanges((state) => {
      fileLogger.addLog('AWS State Change', JSON.stringify(state));
      dispatch(awsActions.awsChangeState.request(state));
    });

    /** Push Notifications */
    Notification(
      (token) => {
        fileLogger.addLog('NotificationToken', token);
        dispatch(notificationActions.notificationSetToken.request({ token }));
      },
      (notification) => {
        fileLogger.addLog('Notification', JSON.stringify(notification));
        dispatch(notificationActions.notificationAdd.request({ notification }));
      },
    );

    /** Check actual Things */
    dispatch(devicesActions.checkPairedThings.request());

    return () => {
      fileLogger.clearTimer();

      if (checkFirmwareUpdatesTimerId.current) {
        clearInterval(checkFirmwareUpdatesTimerId.current);
      }

      if (firmwareVersionsTimerId.current) {
        clearInterval(firmwareVersionsTimerId.current);
      }

      if (appRateTimerId.current) {
        clearTimeout(appRateTimerId.current);
      }

      disableForceWifiUsage();
    };
  });

  return (
    <View style={styles.applicationView}>
      <StatusBar barStyle="light-content" backgroundColor={Colors.dark} />
      <Navigator />
      <Modal
        style={styles.modal}
        useNativeDriver={false}
        isVisible={modal.isVisible}
        animationIn="fadeInUp"
        animationOut="fadeInUp"
        backdropTransitionOutTiming={0}>
        <ModalContent
          {...modal.params}
          isVisible={modal.isVisible}
          onClose={() => dispatch(modalActions.modalToggle({ isVisible: false }))}
        />
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  applicationView: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  container: {
    flex: 1,
    justifyContent: 'center',
    backgroundColor: Colors.background,
  },
  modal: {
    position: 'absolute',
    bottom: -50,
    width: Metrics.screenWidth - 40,
  },
});

export default RootContainer;
