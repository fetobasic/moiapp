import { useCallback, useEffect, useRef, useState } from 'react';
import { Platform } from 'react-native';
import AwsConfig from 'aws/aws-config';
import { isEmpty, isNil } from 'lodash';
import DeviceInfo from 'react-native-device-info';
import * as RNLocalize from 'react-native-localize';
import { getUnixTime } from 'date-fns';

import { useAppDispatch, useAppSelector, useMount } from 'App/Hooks/commonHooks';
import { Bluetooth } from 'App/Containers/Home/HomeScreen';
import {
  YetiState,
  Yeti6GConnectionCredentials,
  YetiConnectionCredentials,
  YetiSysInfo,
  YetiCloudConnectMessage,
} from 'App/Types/Yeti';
import { yetiActions } from 'App/Store/Yeti';
import { deviceExists, doesThingNameExist, setAnywhereConnect } from 'App/Services/Devices';
import { devicesActions } from 'App/Store/Devices';
import { getVoltage } from 'App/Services/Yeti';
import { applicationActions } from 'App/Store/Application';
import { enableForceWifiUsage, disableForceWifiUsage } from 'App/Services/AndroidWifi';
import AppConfig, { phoneId } from 'App/Config/AppConfig';
import { addThing, reconnectAndRegisterThing } from 'App/Services/Aws';
import Logger from 'App/Services/Logger';
import { notificationActions } from 'App/Store/Notification';
import { PairThingRequest } from 'App/Types/BackendApi';
import { store } from 'App/Store';
import { sendOnlineState, sendBleToBroadcast } from 'App/Services/Heartbeating';
import { isYeti6GThing } from 'App/Services/ThingHelper';
import { PairingStackParamList } from 'App/Types/NavigationStackParamList';
import { DeviceState } from 'App/Types/Devices';
import { backendApi } from 'App/Store/rootSaga';
import { fileLogger } from 'App/Services/FileLogger';

type Props = PairingStackParamList['ConnectYeti'];

const useAnywhereConnect = (props: Props) => {
  const dispatch = useAppDispatch();
  const { connectionType, dataTransferType, ssid, wifiPassword, device, deviceType } = props;
  const isBluetoothConnect = dataTransferType === 'bluetooth';

  const [isConnected, setIsConnected] = useState(false);
  const [yetiInfo, setYetiInfo] = useState<YetiSysInfo | undefined>();
  const [isLock, setIsLock] = useState(false);
  const [isError, setIsError] = useState(false);
  const [isBleError, setIsBleError] = useState(false);
  const [errorCode, setErrorCode] = useState<number>(0);
  const [deviceThingName, setThingName] = useState('');
  const [networkCheckCode, setNetworkCheckCode] = useState(0);
  const [connectionStatusText, setConnectionStatusText] = useState('');

  const isConnectedToYeti = useRef(false);
  const isBluetoothDisabled = useRef(false);
  const pairThingPromise = useRef<Promise<Error | null> | null>(null);
  const sendWiFiCredentialsTime = useRef<number>(0);
  const loadInfoTimeoutId = useRef<NodeJS.Timeout | null>(null);
  const reconnectTimerId = useRef<NodeJS.Timeout | null>(null);
  const checkErrorTimerId = useRef<NodeJS.Timeout | null>(null);

  const { yetiSysInfo, devices, isConnectedToInternet, notificationToken } = useAppSelector((state) => ({
    yetiSysInfo: state.yetiInfo.joinData,
    devices: state.devicesInfo.data,
    isConnectedToInternet: state.network.isConnected,
    notificationToken: state.notification.token,
  }));

  const loadYetiInfo = useCallback(
    async (load: () => Promise<any>, attempt = 0) => {
      const _yetiSysInfo = store.getState().yetiInfo.joinData;

      if ((_yetiSysInfo && !isEmpty(_yetiSysInfo)) || attempt >= AppConfig.loadYetiInfoMaxRetryAttempts) {
        if (loadInfoTimeoutId.current) {
          clearTimeout(loadInfoTimeoutId.current);
          loadInfoTimeoutId.current = null;
        }
        disableForceWifiUsage();
        return;
      }

      setConnectionStatusText(`${YetiCloudConnectMessage.SENDING_CREDENTIALS} (attempt ${attempt + 1})`);
      fileLogger.addLog('useAnywhereConnect', `loadYetiInfo attempt ${attempt + 1}`);
      if (!isBluetoothConnect) {
        enableForceWifiUsage();
      }
      await load();

      if (!sendWiFiCredentialsTime.current) {
        sendWiFiCredentialsTime.current = getUnixTime(new Date());
      }

      loadInfoTimeoutId.current = setTimeout(() => loadYetiInfo(load, attempt + 1), AppConfig.loadYetiInfoTimeout);
    },
    [isBluetoothConnect],
  );

  const checkForNetwork = useCallback(async () => {
    if (deviceType?.startsWith('Y6G')) {
      const { data } = await Bluetooth.getDeviceInfo(device?.id || '');

      let connectionStatus = `${YetiCloudConnectMessage.CHECKING_CONNECTION}`;
      if (data?.iot.sta.wlan.err !== 0) {
        connectionStatus = `${YetiCloudConnectMessage.CONNECTING_YETI_TO_CLOUD} (code ${data?.iot.sta.wlan.err})`;
        setIsError(true);
      }

      setConnectionStatusText(connectionStatus);
      setNetworkCheckCode(data?.iot.sta.wlan.err || 1);
    }
  }, [device?.id, deviceType]);

  const checkForError = useCallback(async () => {
    if (checkErrorTimerId.current) {
      clearTimeout(checkErrorTimerId.current);
      checkErrorTimerId.current = null;
    }

    if (isConnectedToYeti.current) {
      return;
    }

    const response = await Bluetooth.checkForError(device?.id || '');
    fileLogger.addLog(
      'useAnywhereConnect',
      `checkForError status: ${response.ok}, isBleError: ${response.isBleError}, response.data: ${JSON.stringify(
        response.data,
      )}`,
    );
    if ((response.ok && response.data?.isError) || response.isBleError) {
      setNetworkCheckCode(response.data?.wlanErrorCode || 0);
      setErrorCode(response.data?.cloudErrorCode || 0);
      setIsBleError(response.isBleError || false);
      setIsError(true);
      isConnectedToYeti.current = false;
      if (reconnectTimerId.current) {
        clearTimeout(reconnectTimerId.current);
        reconnectTimerId.current = null;
      }
      setConnectionStatusText(
        `${YetiCloudConnectMessage.CONNECTING_YETI_TO_CLOUD} (code ${response.data?.wlanErrorCode || 0}
          ${response.data?.cloudErrorCode || 0})`,
      );
      return;
    }

    setConnectionStatusText(`${YetiCloudConnectMessage.CHECKING_CONNECTION}`);
    checkErrorTimerId.current = setTimeout(() => checkForError(), AppConfig.checkForErrorsInterval);
  }, [device?.id]);

  const connectYeti6G = useCallback(() => {
    const data: Yeti6GConnectionCredentials = {
      iot: {
        sta: {
          m: 3,
          wlan: {
            ssid: ssid || '',
          },
          cloud: {
            env: AwsConfig.env,
            mqtt: AwsConfig.iotHost,
            api: AwsConfig.apiHost,
          },
        },
      },
    };

    if (!isNil(wifiPassword)) {
      data.iot.sta.wlan.pass = wifiPassword;
    }

    pairThingPromise.current = null;
    fileLogger.addLog('useAnywhereConnect', `connectYeti6G data: ${JSON.stringify(data)}`);
    loadYetiInfo(() => Bluetooth.joinWifi(device?.id || '', 'Y6G_4000', data));

    checkErrorTimerId.current = setTimeout(() => checkForError(), AppConfig.checkForErrorsInterval);
  }, [checkForError, device?.id, loadYetiInfo, ssid, wifiPassword]);

  useMount(() => {
    if (connectionType === 'cloud') {
      if (!isBluetoothConnect) {
        enableForceWifiUsage();
      }

      if (deviceType?.startsWith('Y6G')) {
        connectYeti6G();
      } else {
        const data: YetiConnectionCredentials = {
          wifi: {
            name: ssid ?? '',
          },
          iot: {
            env: AwsConfig.env,
            hostname: AwsConfig.iotHost,
            endpoint: `${AwsConfig.apiBaseUrl}/thing`,
          },
        };

        if (!isNil(wifiPassword)) {
          data.wifi.pass = wifiPassword;
        }

        pairThingPromise.current = null;
        fileLogger.addLog('useAnywhereConnect', `useMount data: ${JSON.stringify(data)}`);
        const load = isBluetoothConnect
          ? () => Bluetooth.joinWifi(device?.id || '', 'YETI', data)
          : () => dispatch(yetiActions.yetiJoin.request({ req: data }));

        loadYetiInfo(load);
      }
    }

    return () => {
      dispatch(yetiActions.yetiReset());
    };
  });

  const addDevice = useCallback(
    (deviceData: YetiState, _devices: YetiState[], thingName?: string) => {
      if (!thingName) {
        return;
      }

      const data = {
        ...deviceData,
        connectedAt: new Date().toISOString(),
      };

      if (!doesThingNameExist(_devices, thingName)) {
        data.name = thingName;
      }
      fileLogger.addLog('useAnywhereConnect', `addDevice data: ${JSON.stringify(data)}`);
      dispatch(devicesActions.devicesAddUpdate.request({ thingName, data }));
    },
    [dispatch],
  );

  const sendToApiGateway = useCallback(
    (thingName: string) => {
      const token = notificationToken;

      const data: PairThingRequest = {
        thingName,
        phoneId,
        platform: Platform.OS,
        app: 'goalzero',
        model: DeviceInfo.getModel(),
        country: RNLocalize.getCountry(),
        isTablet: DeviceInfo.isTablet(),
      };

      if (token) {
        data.token = token;
      }

      fileLogger.addLog('useAnywhereConnect', `sendToApiGateway data: ${JSON.stringify(data)}`);
      setConnectionStatusText(`${YetiCloudConnectMessage.PAIRING_TO_ACCOUNT}`);
      return backendApi.pairThingWithRetries(data, {
        retryCount: AppConfig.pairThingMaxRetryAttempts,
        retryTimeout: AppConfig.pairThingTimeoutInterval,
      });
    },
    [notificationToken],
  );

  const anywhereConnectSuccess = useCallback(
    async (_devices: YetiState[], thingName: string) => {
      const changedDevices = setAnywhereConnect(devices as Array<DeviceState>);
      dispatch(devicesActions.devicesUpdateAll.request({ data: changedDevices }));

      const data: YetiState = {
        model: yetiSysInfo?.model,
        isDirectConnection: false,
        usedAnywhereConnect: true,
        isConnected: true,
        isShowFirmwareUpdateNotifications: !isYeti6GThing(thingName),
        peripheralId: device?.id,
        deviceType,
        dataTransferType,
        app_online: 1,
        settings: {
          temperature: 'FAHRENHEIT',
          voltage: getVoltage(yetiSysInfo?.model, yetiSysInfo?.hostId),
        },
      };
      fileLogger.addLog('useAnywhereConnect', `anywhereConnectSuccess data: ${JSON.stringify(data)}`);

      setConnectionStatusText(`${YetiCloudConnectMessage.PAIRING_TO_ACCOUNT}`);
      // Update thing info
      addDevice(data, _devices, thingName);

      // Send to API Gateway
      try {
        if (!pairThingPromise.current) {
          pairThingPromise.current = sendToApiGateway(thingName);
        }
        await pairThingPromise.current;
      } catch (e: any) {
        Logger.error(e.message);
        await checkForNetwork();
        setIsError(true);
        return;
      }

      // Enable notifications
      dispatch(notificationActions.notificationToggle.request({ isEnabled: true }));

      /**
       * When we switch a thing from Direct to Anywhere mode,
       * sometimes the thing turned out to be not registered
       * (the reason is unknown and we don't have time to find it at the moment...)
       * As an immediate workaround, we call the addThing function one more time
       * at the end of the re-pairing process to be sure the thing gets registered.
       */
      addThing(thingName, undefined, undefined, true);
      sendOnlineState(thingName); //just in case
      // ONLY set ble.m = 2 (broadcast state) when device type is a Yeti 4000
      if (deviceType === 'Y6G_4000') {
        sendBleToBroadcast(thingName);
      }
      setConnectionStatusText(`${YetiCloudConnectMessage.CLOUD_CONNECTED}`);
      setThingName(thingName);
      setIsError(false);
      setErrorCode(0);
      setIsConnected(true);
    },
    [
      addDevice,
      checkForNetwork,
      dataTransferType,
      device?.id,
      deviceType,
      devices,
      dispatch,
      sendToApiGateway,
      yetiSysInfo?.hostId,
      yetiSysInfo?.model,
    ],
  );

  const registerThing = useCallback(
    (thingName: string, _isConnectedToInternet: boolean) => {
      const unlock = () =>
        setTimeout(() => {
          setIsLock(false);
        }, AppConfig.unlockTimeout);

      // Reconnect to AWS IoT if reconnected to Internet
      if (!_isConnectedToInternet) {
        if (reconnectTimerId.current) {
          clearTimeout(reconnectTimerId.current);
          reconnectTimerId.current = null;
        }

        reconnectTimerId.current = setTimeout(() => {
          if (deviceType?.startsWith('Y6G')) {
            sendOnlineState(thingName);
          }
          reconnectTimerId.current = null;
          setConnectionStatusText(`${YetiCloudConnectMessage.CONNECTING_APP_TO_CLOUD} (retry)`);
          reconnectAndRegisterThing(thingName, undefined, undefined, true);
          unlock();
        }, AppConfig.awsIotReconnectTimeout);
      } else {
        setConnectionStatusText(`${YetiCloudConnectMessage.CONNECTING_APP_TO_CLOUD}`);
        reconnectAndRegisterThing(thingName, undefined, undefined, true);
        unlock();
      }
    },
    [deviceType],
  );

  useEffect(() => {
    if (isConnectedToYeti.current) {
      return;
    }

    if (connectionType === 'cloud' && yetiSysInfo && isConnectedToInternet && !pairThingPromise.current && !isLock) {
      setIsLock(true);
      setYetiInfo(yetiSysInfo);

      fileLogger.addLog('useAnywhereConnect', `yetiSysInfo: ${JSON.stringify(yetiSysInfo)}`);

      if (isBluetoothConnect && !isBluetoothDisabled.current) {
        isBluetoothDisabled.current = true;
        Bluetooth.stop();
      }

      if (!isBluetoothConnect) {
        disableForceWifiUsage();
      }

      const thingName = yetiSysInfo.name?.toLowerCase();

      if (!thingName) {
        return;
      }

      const thing = devices.find((d) => d.thingName === thingName);
      const dateSync = (thing as YetiState)?.dateSync || 0;

      fileLogger.addLog(
        'useAnywhereConnect',
        `thing: ${JSON.stringify(thing)}, devices: ${JSON.stringify(
          devices,
        )} dateSync: ${dateSync}, sendWiFiCredentialsTime: ${sendWiFiCredentialsTime.current}`,
      );

      if (deviceExists(devices, thingName) && getUnixTime(new Date(dateSync)) > sendWiFiCredentialsTime.current) {
        isConnectedToYeti.current = true;
        dispatch(applicationActions.changeDirectConnectionState(false));
        anywhereConnectSuccess(devices as Array<YetiState>, thingName);
      } else {
        registerThing(thingName, isConnectedToInternet);
      }
    }
  }, [
    anywhereConnectSuccess,
    connectionType,
    devices,
    dispatch,
    isBluetoothConnect,
    isConnectedToInternet,
    isLock,
    registerThing,
    yetiSysInfo,
  ]);

  return {
    isConnected,
    yetiInfo,
    isError,
    errorCode,
    deviceThingName,
    networkCheckCode,
    isBleError,
    connectionStatusText,
  };
};

export default useAnywhereConnect;
