import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { View, Text, ScrollView, StyleSheet, Pressable as RNPressable } from 'react-native';
import { useFeatureFlagWithPayload } from 'posthog-react-native';
import { ApplicationStyles, Colors, Fonts, Metrics } from 'App/Themes';
import { Button, HeaderSimple as Header, Pressable, ProgressLoader, SwitchRow, Spinner } from 'App/Components';
import { WithTopBorder } from 'App/Hoc';
import UpdateIcon from 'App/Images/Icons/update.svg';
import InfoIcon from 'App/Images/Icons/information.svg';
import CloseImg from 'App/Images/Icons/close.svg';
import AutoUpdate from 'App/Images/Icons/autoUpdate.svg';
import { useAppSelector, useEvents, useMount, usePrevious } from 'App/Hooks';
import { useAppState } from '@react-native-community/hooks';
import { useDispatch, useSelector } from 'react-redux';
import { getCurrentDevice } from 'App/Store/Devices/selectors';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { SettingsStackParamList } from 'App/Types/NavigationStackParamList';
import { Yeti6GState, YetiModel, YetiState } from 'App/Types/Yeti';
import { checkOTA, isLegacyYeti, isModelX } from 'App/Services/Yeti';
import { getYetiSize, isYeti300500700, isYeti20004000, isYeti6GThing, isYeti10001500 } from 'App/Services/ThingHelper';
import LINKS from 'App/Config/Links';
import { openLink } from 'App/Services/Linking';
import { firmwareUpdateActions } from 'App/Store/FirmwareUpdate';
import { env, isDev, isAlpha, isTest, phoneId } from 'App/Config/AppConfig';
import { subscribeToJob, get } from 'App/Services/Aws';
import { UpdateFirmwareResponse } from 'App/Types/FirmwareUpdate';
import { getNodeName, getUpdateStatus, getUpdateErrorMsg, isLatestVersion } from 'App/Services/FirmwareUpdates';
import { showInfo } from 'App/Services/Alert';
import { navigationGoBack } from 'App/Navigation/AppNavigation';
import ConnectNetwork from 'App/Components/Settings/ConnectNetwork';
import { format, parseISO } from 'date-fns';
import Config from 'App/Config/AppConfig';
import { DeviceType } from 'App/Types/Devices';
import { devicesActions } from 'App/Store/Devices';
import { Bluetooth } from 'App/Containers/Home/HomeScreen';
import AwsConfig from 'aws/aws-config';
import { applicationActions } from 'App/Store/Application';
import { thingUpdaters, update } from 'App/Services/ConnectionControler';
import Row from 'App/Components/Pairing/InfoRow';
import renderElement from 'App/Services/RenderElement';
import { isEqual } from 'lodash';

type Props = NativeStackScreenProps<SettingsStackParamList, 'UpdateFirmware'>;

const NUMBER_OF_CLICKS = 5;

const UpdateFirmware = ({ route }: Props) => {
  const { thingName, goBack } = route.params;
  const { firmwareUpdate, currUpdatesInfo, eventParams } = useAppSelector((state) => ({
    firmwareUpdate: state.firmwareUpdate,
    currUpdatesInfo: state.firmwareUpdate.data[thingName],
    eventParams: state.application.eventParams?.[thingName],
  }));
  const [isFeatureEnabled, supportedModels] = useFeatureFlagWithPayload(`${env}-firmware-autoupdate`);
  const { track } = useEvents();
  const [clicks, setClicks] = useState<number>(0);
  const [showConnectModal, setShowConnectModal] = useState<boolean>(false);
  const currentAppState = useAppState();
  const device = useSelector(getCurrentDevice(thingName));
  const prevDevice = usePrevious(device);
  const updProgress = currUpdatesInfo?.progress || (device as Yeti6GState)?.ota?.p;
  const isYeti6GDevice = isYeti6GThing(device?.thingName);
  const dispatch = useDispatch();
  const dateNow = useRef(Math.floor(Date.now() / 1000));
  const deviceType = device?.deviceType as DeviceType;
  const isUpdateAvailable = !isLatestVersion(
    (device as YetiState)?.firmwareVersion || (device as Yeti6GState)?.device?.fw || '0.0.0',
    firmwareUpdate.firmwareVersions?.[deviceType]?.[0],
  );
  const [versionToInstallDirect, setVersionToInstallDirect] = useState(
    firmwareUpdate.firmwareVersions?.[deviceType]?.[0],
  );
  const [showLoader, setShowLoader] = useState(false);
  const [isAutoUpdOn, setIsAutoUpdOn] = useState(Boolean((device as Yeti6GState)?.config?.fwAutoUpd));
  const [isAutoUpdLock, setIsAutoUpdLock] = useState(false);
  const updater = thingUpdaters[thingName || ''];
  const isDirectConnection = device?.isDirectConnection;
  const isDisabled = useMemo(() => isDirectConnection && isYeti6GDevice, [isDirectConnection, isYeti6GDevice]);
  const secretUpdStatus =
    // @ts-ignore TODO: need to validate `currUpdatesInfo?.info?.[0]`, this behavior is not documented as it used here
    getUpdateStatus((device as Yeti6GState)?.ota?.s) || currUpdatesInfo?.info?.[0] || currUpdatesInfo?.scheduleError;
  const [updateErrorMsg, setUpdateErrorMsg] = useState(getUpdateErrorMsg((device as Yeti6GState)?.ota?.errC));
  const [isUpdateStarted, setUpdateStarted] = useState<boolean>(
    updProgress > 0 && updProgress < 100 && !secretUpdStatus && !updateErrorMsg && !currUpdatesInfo?.updateError,
  );
  const prevUpdateStarted = usePrevious(isUpdateStarted);
  const isOldUpdate = (device as Yeti6GState)?.ota?.tEnd < dateNow.current;
  const isUpdateSuccess =
    currUpdatesInfo?.successUpdated ||
    (((device as Yeti6GState)?.ota?.s === 207 || (device as Yeti6GState)?.ota?.p === 100) && !isOldUpdate);
  const clearFWUpdateInfo = useCallback(
    () => dispatch(firmwareUpdateActions.firmwareClearUpdateInfo({ thingName })),
    [dispatch, thingName],
  );
  const oldVersion = useRef('');
  const newVersion = useRef('');
  const failureEventSent = useRef(false);
  const successEventSent = useRef(false);
  const errorTriggered = useRef(false);

  useMount(() => {
    if ((isDirectConnection && !isYeti6GDevice) || !device?.isConnected) {
      return;
    }

    checkOTA(device);

    if (isYeti6GDevice) {
      get(thingName, undefined, 'ota');
      get(thingName, undefined, 'device');
    }

    const intervalId = setInterval(() => checkOTA(device), Config.bleCheckStateIntervals.ota);

    return () => {
      clearInterval(intervalId);
      if (errorTriggered.current) {
        clearFWUpdateInfo();
      }
    };
  });

  useEffect(() => {
    if (isLegacyYeti(thingName) && isDirectConnection) {
      setShowLoader(firmwareUpdate.startOta && !firmwareUpdate.successOta);
    }
  }, [firmwareUpdate.startOta, firmwareUpdate.successOta, isDirectConnection, thingName]);

  useEffect(() => {
    if (isUpdateSuccess && !successEventSent.current) {
      successEventSent.current = true;

      if (!oldVersion.current || !newVersion.current) {
        oldVersion.current = eventParams?.oldFirmwareVersion || '';
        newVersion.current = eventParams?.newFirmwareVersion || '';
      }

      if (oldVersion.current && newVersion.current) {
        track('firmware_update_success', {
          thingName,
          mode: isDirectConnection ? 'direct' : 'cloud',
          oldVersion: oldVersion.current,
          newVersion: newVersion.current,
        });
      }

      // Reset event flag after 5 seconds
      setTimeout(() => {
        successEventSent.current = false;
      }, 5000);
    }
  }, [
    eventParams?.newFirmwareVersion,
    eventParams?.oldFirmwareVersion,
    isDirectConnection,
    isUpdateSuccess,
    thingName,
    track,
  ]);

  useEffect(() => {
    if ((currUpdatesInfo?.scheduleError || secretUpdStatus) && !failureEventSent.current) {
      failureEventSent.current = true;
      setUpdateErrorMsg(getUpdateErrorMsg((device as Yeti6GState)?.ota?.errC));

      if (!oldVersion.current || !newVersion.current) {
        oldVersion.current = eventParams?.oldFirmwareVersion || '';
        newVersion.current = eventParams?.newFirmwareVersion || '';
      }

      if (oldVersion.current && newVersion.current) {
        track('firmware_update_failure', {
          thingName,
          mode: isDirectConnection ? 'direct' : 'cloud',
          oldVersion: oldVersion.current,
          newVersion: newVersion.current,
        });
      }

      // Reset event flag after 5 seconds
      setTimeout(() => {
        failureEventSent.current = false;
      }, 5000);
    }
  }, [
    currUpdatesInfo?.scheduleError,
    device,
    eventParams?.newFirmwareVersion,
    eventParams?.oldFirmwareVersion,
    isDirectConnection,
    secretUpdStatus,
    thingName,
    track,
  ]);

  useEffect(() => {
    // @ts-ignore TODO: need to validate `currUpdatesInfo?.info?.[0]`, this behavior is not documented as it used here
    if (currUpdatesInfo?.scheduleError || currUpdatesInfo?.updateError || currUpdatesInfo?.info?.[0]) {
      errorTriggered.current = true;
      setUpdateStarted(false);
      return;
    }

    if (currUpdatesInfo?.updating && isLegacyYeti(device.thingName)) {
      subscribeToJob(
        currUpdatesInfo?.jobId || '',
        device.thingName || '',
        (currUpdatesInfo?.info as UpdateFirmwareResponse)?.newVersion || '',
      );
    }
  }, [
    currUpdatesInfo?.updating,
    currUpdatesInfo?.scheduleError,
    currUpdatesInfo?.updateError,
    currUpdatesInfo?.info,
    currUpdatesInfo?.jobId,
    device.thingName,
  ]);

  useEffect(() => {
    if (!updater?.scheduling && isAutoUpdLock) {
      setIsAutoUpdLock(false);
      setIsAutoUpdOn(Boolean((device as Yeti6GState)?.config?.fwAutoUpd));
    }
  }, [device, isAutoUpdLock, isAutoUpdOn, updater?.scheduling]);

  useEffect(() => {
    if (isLegacyYeti(thingName) && isDirectConnection && firmwareUpdate.successOta) {
      showInfo(
        <Text style={Fonts.font.base.bodyOne}>
          You will be disconnected from <Text style={ApplicationStyles.textGreen}>{device.thingName}</Text> when the
          update starts. You won't see any update progress in the app. Please reconnect to{' '}
          <Text style={ApplicationStyles.textGreen}>{device.thingName}</Text> after it stops beeping. The process
          usually takes about 5 minutes.
        </Text>,
        '',
        () => {
          dispatch(firmwareUpdateActions.firmwareClearUpdateInfo({ thingName }));
          navigationGoBack();
          navigationGoBack();
        },
      );
      return;
    }
    if (isUpdateSuccess) {
      setUpdateStarted(false);
      showInfo(
        'Updated successfully.',
        `Version ${(device as YetiState)?.firmwareVersion || (device as Yeti6GState)?.device?.fw}`,
        () => {
          clearFWUpdateInfo();
          if (goBack) {
            goBack();
            return;
          }
          navigationGoBack();
        },
      );
    }
  }, [
    clearFWUpdateInfo,
    device,
    dispatch,
    firmwareUpdate.successOta,
    goBack,
    isDirectConnection,
    isUpdateSuccess,
    thingName,
  ]);

  useEffect(() => {
    if (!isYeti6GDevice) {
      return;
    }

    // ignore the change of isUpdateStarted, we only care about the change of the progress and OTA statuses
    if (isUpdateStarted !== prevUpdateStarted) {
      return;
    }
    let isStarted = isUpdateStarted;
    if (isYeti6GDevice) {
      const currentOtaState = {
        s: (device as Yeti6GState)?.ota?.s,
        tBgn: (device as Yeti6GState)?.ota?.tBgn,
        tEnd: (device as Yeti6GState)?.ota?.tEnd,
        p: (device as Yeti6GState)?.ota?.p,
      };
      const prevOtaState = {
        s: (prevDevice as Yeti6GState)?.ota?.s,
        tBgn: (prevDevice as Yeti6GState)?.ota?.tBgn,
        tEnd: (prevDevice as Yeti6GState)?.ota?.tEnd,
        p: (prevDevice as Yeti6GState)?.ota?.p,
      };
      if (isEqual(currentOtaState, prevOtaState)) {
        return;
      }
      isStarted =
        isStarted &&
        ![53, 207].includes((device as Yeti6GState)?.ota?.s) &&
        (device as Yeti6GState)?.ota?.tBgn > 0 &&
        (device as Yeti6GState)?.ota?.tEnd === 0 &&
        updProgress > 0 &&
        updProgress < 100;
    }
    setUpdateStarted(isStarted);
  }, [isUpdateStarted, prevUpdateStarted, device, prevDevice, isYeti6GDevice, updProgress]);

  useEffect(() => {
    if (currentAppState === 'active') {
      get(thingName, undefined, 'ota');
      get(thingName, undefined, 'device');
    }
  }, [currentAppState, thingName]);

  const onChangeAutoUpdateHandler = (value: boolean) => {
    const data = { config: { fwAutoUpd: value ? 168 : 0 } };
    setIsAutoUpdLock(true);
    setIsAutoUpdOn(value);

    update({
      thingName: thingName || '',
      stateObject: {
        state: {
          // @ts-ignore
          desired: data.config,
        },
      },
      isDirectConnection: device?.isDirectConnection || false,
      updateDeviceState: (_thingName, _data) =>
        dispatch(devicesActions.devicesAddUpdate.request({ thingName: _thingName, data: _data })),
      changeSwitchState: () => {},
      method: 'config',
    });
  };

  const onClickSecretHandler = () => {
    if (!isLegacyYeti(thingName)) {
      clicks < NUMBER_OF_CLICKS && setClicks(clicks + 1);
    }
  };

  const isUpdateError = () => {
    return currUpdatesInfo?.scheduleError || updateErrorMsg || secretUpdStatus || currUpdatesInfo?.updateError;
  };

  const onUpdateHandler = (version?: string) => {
    dispatch(firmwareUpdateActions.firmwareClearUpdateInfo({ thingName }));
    if (!device.isConnected) {
      showInfo('You are not connected to Yeti. Please reconnect and try again.');
      return;
    }
    if (isDirectConnection) {
      setShowConnectModal(true);
      return;
    }
    setUpdateStarted(true);
    // Reset the failure event flag
    failureEventSent.current = false;
    setUpdateErrorMsg(null);

    oldVersion.current = (device as YetiState)?.firmwareVersion || (device as Yeti6GState)?.device?.fw;
    newVersion.current = version || firmwareUpdate.firmwareVersions?.[deviceType]?.[0].version;

    dispatch(
      applicationActions.setEventParams({
        thingName,
        oldFirmwareVersion: oldVersion.current,
        newFirmwareVersion: newVersion.current,
      }),
    );

    dispatch(
      firmwareUpdateActions.firmwareUpdateNow({
        thingName: device.thingName || '',
        phoneId,
        oldVersion: oldVersion.current,
        newVersion: newVersion.current,
      }),
    );
  };

  const { description, subTitle } = useMemo(() => {
    if (isUpdateAvailable) {
      if (isDirectConnection) {
        return {
          subTitle: (
            <View style={[styles.fwvContainer, isDisabled ? { backgroundColor: Colors.grayDisable } : null]}>
              <Text style={styles.firmwareVersion}>
                NEW {firmwareUpdate.firmwareVersions?.[deviceType]?.[0].version}
              </Text>
            </View>
          ),
          description: (
            <Text style={styles.updDescription}>
              {isDisabled
                ? 'Your device must be Cloud Connected to install new updates.'
                : "Device direct connected, you'll be prompted to connect to a network to update to the latest version."}
            </Text>
          ),
        };
      }

      return {
        subTitle: !isUpdateStarted ? (
          <>
            <View style={styles.fwvContainer}>
              <Text style={styles.firmwareVersion}>
                NEW {firmwareUpdate.firmwareVersions?.[deviceType]?.[0].version}
              </Text>
            </View>
            {isAutoUpdOn && (
              <Text style={styles.newVersionInfo}>
                {format(parseISO(firmwareUpdate.firmwareVersions?.[deviceType]?.[0]?.date), "PP 'at' h:mm bbb")}
              </Text>
            )}
          </>
        ) : (
          <Text style={styles.downloading}>Downloading new version.</Text>
        ),
        description: !isUpdateStarted && (
          <Text style={styles.updDescription}>Your current version is out of date.</Text>
        ),
      };
    }

    return {};
  }, [
    isUpdateAvailable,
    isDirectConnection,
    isUpdateStarted,
    firmwareUpdate.firmwareVersions,
    deviceType,
    isAutoUpdOn,
    isDisabled,
  ]);

  return (
    <View style={ApplicationStyles.mainContainer}>
      <Header title="Firmware Version" onBackPress={() => (goBack ? goBack() : navigationGoBack())} />
      <ProgressLoader
        isFinished={
          (!isUpdateStarted || (isUpdateStarted && !currUpdatesInfo?.updating && isUpdateError())) as
            | boolean
            | undefined
        }
        progress={updProgress * 4}
      />
      <ScrollView style={styles.container} contentContainerStyle={styles.scrollContent}>
        {isYeti6GDevice && isFeatureEnabled && supportedModels?.[getYetiSize(device)] && (
          <>
            <SwitchRow
              icon={<AutoUpdate />}
              title="Automatic Updates"
              value={isAutoUpdOn}
              disabled={isAutoUpdLock}
              onChange={onChangeAutoUpdateHandler}
            />
            <Text style={styles.autoUpdDescription}>
              Automatically receive the latest version when Cloud Connected. You will receive notifications when updates
              are installed.
            </Text>
          </>
        )}
        <WithTopBorder
          withBorder={
            ((isUpdateAvailable && !isUpdateStarted) ||
              (isUpdateStarted && currUpdatesInfo?.updating !== true && isUpdateError())) as boolean | undefined
          }>
          <RNPressable onPress={onClickSecretHandler}>
            <View style={styles.updWrapper}>
              <View style={styles.updateIcon}>
                <UpdateIcon color={isUpdateAvailable && !isDisabled ? Colors.green : Colors.grayDisable} />
              </View>
              <View style={styles.content}>
                <View style={styles.title}>
                  <>
                    {isUpdateAvailable || isUpdateStarted ? (
                      <>
                        <Text style={Fonts.font.base.bodyTwo}>Update firmware</Text>
                        {!isUpdateStarted ||
                        (isUpdateStarted && currUpdatesInfo?.updating !== true && isUpdateError()) ? (
                          <Pressable
                            onPress={() => onUpdateHandler()}
                            disabled={(isUpdateStarted && !isUpdateError()) || isDisabled}>
                            <Text style={[styles.install, isDisabled ? { color: Colors.grayDisable } : null]}>
                              {isUpdateError() ? 'Retry' : 'Install Now'}
                            </Text>
                          </Pressable>
                        ) : (
                          <Text style={styles.install}>{`In Progress - ${
                            (device as Yeti6GState)?.ota?.s === 207 ? 0 : currUpdatesInfo?.progress || updProgress || 0
                          }%`}</Text>
                        )}
                      </>
                    ) : (
                      <Text style={Fonts.font.base.bodyTwo}>Firmware up to date</Text>
                    )}
                  </>
                </View>
                <Text style={{ ...styles.updDescription, marginTop: Metrics.smallMargin / 2 }}>
                  Current version {(device as YetiState)?.firmwareVersion || (device as Yeti6GState)?.device?.fw}
                </Text>
                {subTitle && !currUpdatesInfo?.scheduleError && <View style={styles.newVersion}>{subTitle}</View>}
                {!isUpdateStarted && !isUpdateSuccess && updateErrorMsg ? (
                  <Text style={styles.errorMsg}>Update failed. {updateErrorMsg}</Text>
                ) : (
                  !isUpdateStarted &&
                  !isUpdateSuccess &&
                  isUpdateError() && (
                    <Text style={styles.errorMsg}>
                      Update failed. Try again later.{' '}
                      {currUpdatesInfo?.scheduleError ? currUpdatesInfo?.scheduleError : ''}
                    </Text>
                  )
                )}
              </View>
            </View>
          </RNPressable>
        </WithTopBorder>
        {description && !currUpdatesInfo?.scheduleError && description && (
          <View>
            <Row withBorder={false} icon={renderElement(<InfoIcon />)} body={renderElement(<>{description}</>)} />
          </View>
        )}
        {clicks === NUMBER_OF_CLICKS && (
          <View style={styles.secretWrapper}>
            <View style={styles.secretTitle}>
              <Text style={Fonts.font.base.bodyTwo}>Secret Firmware Settings</Text>
              <Pressable onPress={() => setClicks(0)}>
                <CloseImg color={Colors.transparentWhite('0.87')} />
              </Pressable>
            </View>
            <View style={styles.secretRow}>
              <Text style={Fonts.font.base.bodyTwo}>Update Status</Text>
              {currUpdatesInfo?.scheduleError || secretUpdStatus ? (
                <Text style={styles.errorMsg}>{secretUpdStatus}</Text>
              ) : (
                <Text style={Fonts.font.base.bodyTwo}>
                  {isUpdateStarted ? 'In Progress' : `${isUpdateSuccess ? 'Success' : 'Idle'}`}
                </Text>
              )}
            </View>
            {Object.entries((device as Yeti6GState)?.device?.iNodes || []).map(
              ([key, info]: [string, { fw: string }]) => {
                const nodeName = getNodeName(key);

                return (
                  nodeName && (
                    <View key={key} style={styles.secretRow}>
                      <Text style={Fonts.font.base.bodyTwo}>{nodeName}</Text>
                      <Text style={Fonts.font.base.bodyTwo}>{info.fw}</Text>
                    </View>
                  )
                );
              },
            )}
          </View>
        )}
        {(isDev || isAlpha || isTest) &&
          firmwareUpdate.firmwareVersions?.[deviceType]?.map((firmwareVersion) => {
            const currentVersion =
              firmwareVersion.version ===
              ((device as YetiState)?.firmwareVersion || (device as Yeti6GState)?.device?.fw);
            let newestVersion = firmwareUpdate.firmwareVersions?.[deviceType]?.[0].version === firmwareVersion.version;

            return (
              <Pressable
                key={firmwareVersion.version}
                style={styles.firmwareRow}
                onPress={() => {
                  setVersionToInstallDirect(firmwareVersion);
                  onUpdateHandler(firmwareVersion.version);
                }}
                disabled={(isUpdateStarted && !currUpdatesInfo?.scheduleError) || isDisabled}>
                <Text style={Fonts.font.base.bodyTwo}>
                  Version {firmwareVersion.version}
                  <Text style={styles.fwDescription}>
                    {currentVersion ? ' (current)' : newestVersion ? ' (newest)' : ''}
                  </Text>
                </Text>
                <Text style={[Fonts.font.base.bodyTwo, isDisabled ? { color: Colors.grayDisable } : null]}>
                  {currentVersion ? 'Installed' : 'Install'}
                </Text>
              </Pressable>
            );
          })}
      </ScrollView>
      <View style={styles.btnWrapper}>
        <Button
          inverse
          style={styles.saveBtn}
          title="firmware release notes"
          onPress={() => {
            if (isYeti300500700(device) || isYeti10001500(device)) {
              openLink(LINKS.yeti6gSmallReleaseNotesPage);
              return;
            }
            if (isYeti20004000(device)) {
              openLink(LINKS.yeti4000ReleaseNotesPage);
              return;
            }
            const model = device?.model || YetiModel.YETI_1500X_120V;
            const link = isModelX(model as YetiModel) ? LINKS.yetiXReleaseNotesPage : LINKS.yetiV2ReleaseNotesPage;
            openLink(link);
          }}
        />
      </View>
      {showConnectModal && (
        <ConnectNetwork
          deviceType={device.deviceType as DeviceType}
          peripheralId={device?.peripheralId || ''}
          connectedSSID={{
            name: (device as YetiState).ssid || (device as Yeti6GState)?.device?.iot?.sta?.wlan?.ssid,
            db: (device as YetiState)?.wifiStrength || (device as Yeti6GState)?.status?.wifiRssi || 0,
          }}
          onConnect={async ({ ssid, pass }) => {
            const data = versionToInstallDirect;
            const peripheralId = device?.peripheralId || '';
            const url = data.url || '';
            const urlSignature = data.urlSignature || '';
            const keyId = data.keyId || '';

            if (!isLegacyYeti(device?.thingName)) {
              await Bluetooth.changeState(
                peripheralId,
                deviceType,
                { fw: data.version, iot: { sta: { wlan: { ssid, pass }, cloud: { api: AwsConfig.apiHost } } } },
                'device',
              );
            } else {
              dispatch(
                firmwareUpdateActions.updateOta.request({
                  url,
                  ssid,
                  pass,
                  urlSignature,
                  keyId,
                  peripheralId,
                }),
              );
            }
          }}
          onClose={() => setShowConnectModal(false)}
        />
      )}
      <Spinner visible={showLoader} />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: Metrics.baseMargin,
    paddingVertical: Metrics.marginSection,
    marginBottom: 72,
  },
  scrollContent: {
    paddingBottom: 50,
  },
  autoUpdDescription: {
    ...Fonts.font.base.caption,
    marginTop: Metrics.smallMargin,
    marginBottom: Metrics.marginSection,
  },
  updWrapper: {
    flexDirection: 'row',
    marginLeft: Metrics.smallMargin / 2,
  },
  content: {
    marginHorizontal: Metrics.halfMargin,
    flex: 1,
  },
  title: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 2,
  },
  install: {
    ...Fonts.font.base.bodyTwo,
    color: Colors.green,
    marginLeft: 10,
  },
  fwvContainer: {
    backgroundColor: Colors.green,
    borderRadius: 24,
    paddingVertical: 4,
    paddingHorizontal: 7,
    marginTop: Metrics.halfMargin,
  },
  firmwareVersion: {
    ...Fonts.font.base.caption,
    color: Colors.background,
    fontWeight: '500',
    opacity: 1,
  },
  firmwareRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginVertical: Metrics.halfMargin,
    marginHorizontal: Metrics.smallMargin,
  },
  newVersion: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginLeft: Metrics.smallMargin / 2,
  },
  newVersionInfo: {
    ...Fonts.font.base.caption,
    color: Colors.green,
  },
  downloading: {
    ...Fonts.font.base.caption,
    color: Colors.green,
    marginTop: Metrics.halfMargin,
  },
  updDescription: {
    ...Fonts.font.base.caption,
    marginTop: Metrics.smallMargin,
    marginLeft: Metrics.smallMargin / 2,
  },
  updateIcon: {
    marginTop: 3,
    marginRight: -3,
  },
  errorMsg: {
    ...Fonts.font.base.caption,
    color: Colors.portError,
    marginTop: Metrics.halfMargin,
    marginLeft: Metrics.smallMargin / 2,
  },
  secretWrapper: {
    borderColor: Colors.border,
    borderWidth: 1,
    borderRadius: 16,
    marginVertical: Metrics.marginSection,
  },
  secretTitle: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: Metrics.marginSection,
    paddingLeft: Metrics.halfMargin,
  },
  secretRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: Metrics.marginSection,
    paddingHorizontal: Metrics.halfMargin,
    borderTopColor: Colors.border,
    borderTopWidth: 1,
  },
  btnWrapper: {
    paddingHorizontal: Metrics.baseMargin,
    alignItems: 'center',
  },
  saveBtn: {
    position: 'absolute',
    bottom: Metrics.baseMargin,
    width: '100%',
  },
  fwDescription: {
    ...Fonts.font.base.caption,
    lineHeight: Fonts.font.base.bodyTwo.lineHeight,
  },
});

export default UpdateFirmware;
