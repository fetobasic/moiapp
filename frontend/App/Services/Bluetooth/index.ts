import { chunk, noop, isUndefined, isEmpty } from 'lodash';
import {
  NativeModules,
  NativeEventEmitter,
  Platform,
  PermissionsAndroid,
  PermissionStatus,
  Linking,
} from 'react-native';
import BleManager from 'react-native-ble-manager';
import BluetoothStateManager from 'react-native-bluetooth-state-manager';
import { ApiErrorResponse } from 'apisauce';

import Config, { isBeta, isStage, isProduction } from 'App/Config/AppConfig';
import { store } from 'App/Store';

import { yetiActions } from 'App/Store/Yeti';

import {
  MOS_RPC_SVC_ID,
  MOS_RPC_TX_CTL_ID,
  REQUEST_MTU,
  MOS_RPC_DATA_ID,
  MOS_RPC_RX_CTL_ID,
  METHOD_STATE,
  EVENT_DISCOVER_PERIPHERAL,
  EVENT_DISCONNECT_PERIPHERAL,
  METHOD_STATUS,
  EVENT_DID_UPDATE_VALUE,
  FRIDGE_SERVICE_UUID,
  FRIDGE_NOTIFICATION_UUID,
} from 'App/Config/Bluetooth';
import {
  stringToUtf8ByteArray,
  numberToBigEndianBytes,
  utf8ByteArrayToString,
  bigEndianBytesToNumber,
} from 'App/Transforms/bytes';
import Logger from 'App/Services/Logger';
import { isAndroid } from 'App/Themes';
import { wait } from 'App/Services/Wait';
import { BluetoothState } from 'App/Types/BluetoothState';
import { BluetoothConnectedType, BluetoothDevice } from 'App/Types/BluetoothDevices';

import { applicationActions } from 'App/Store/Application';

import * as YetiLegacy from './YetiLegacy';
import * as Yeti6G from './Yeti6G';
import * as Common from './Common';
import { DeviceState, DeviceType } from 'App/Types/Devices';
import Models from 'App/Config/Models';
import { Yeti6GConnectionCredentials, YetiConnectionCredentials } from 'App/Types/Yeti';
import Fridge from 'App/Services/Fridge';
import { isFridge } from 'App/Hooks/useMapDrawerData';

type BleEventHandler = { remove: () => void };
type BleRequest = { id: number; method: string; args?: any; params?: any };
type RequestQueue = {
  peripheralId: string;
  method: string;
  body: any;
  attempts: number;
  onResponse: null | ((response: any) => void);
  onFailure: null | (() => void);
  id: null | number;
  isNewDeviceType: boolean;
}[];
export type CheckProps = {
  actionGoToSettings?: () => void;
  actionWiFi: () => void;
  actionStartScan: () => void;
};

const BleManagerModule = NativeModules.BleManager;
const bleManagerEmitter = new NativeEventEmitter(BleManagerModule);

const init = () => {
  let activeRequestId: { [peripheralId: string]: number } = {};
  let latestRequestId: { [peripheralId: string]: number } = {};
  let isStarted = false;
  let isScanning = false;
  let devicesInfo: {
    [peripheralId: string]: {
      isConnected: boolean;
      isNotifying: boolean;
      deviceType?: BluetoothConnectedType;
      name?: string;
    };
  } = {};
  let handlerDiscover: BleEventHandler | null;
  let handlerDisconnect: BleEventHandler | null;
  let handlerNotifications: BleEventHandler | null;
  let androidPermission: PermissionStatus = 'denied';
  let checkAndroidPermissionStarted = false;
  let requestQueue: { [peripheralId: string]: RequestQueue } = {};

  const scan = async () => {
    if (!isScanning) {
      isScanning = true;

      BleManager.scan([], Config.bluetoothSecondsToScan, true).catch((error: any) => {
        Logger.dev('Bluetooth scan', error);
        isScanning = false;
      });
    }
  };

  const connectToAllDevices = () => {
    const connectedPeripheralIds: string[] = store?.getState().application.connectedPeripheralIds || [];
    const devices: Array<DeviceState> = store?.getState().devicesInfo.data || [];

    Logger?.dev('Bluetooth connectToAllDevices', connectedPeripheralIds);
    connectedPeripheralIds.forEach(async (peripheralId) => {
      const device = devices.find((d) => d.peripheralId === peripheralId);
      const isDeviceFridge = isFridge(device?.deviceType);
      let serviceUUID, characteristicUUID;

      if (isDeviceFridge) {
        serviceUUID = FRIDGE_SERVICE_UUID;
        characteristicUUID = FRIDGE_NOTIFICATION_UUID;
      }

      connect(
        peripheralId,
        Config.bluetoothMaxAttemptsToConnect - 1,
        serviceUUID,
        characteristicUUID,
        isDeviceFridge ? 'FRIDGE' : 'YETI',
        device?.name,
      );
      await wait(Config.defaultDelay);
    });
  };

  const clearDiscoveredDevicesList = () => store.dispatch(yetiActions.clearDiscoveredDevices());

  const connect = async (
    peripheralId: string | null,
    attempts = 0,
    serviceUUID = MOS_RPC_SVC_ID,
    characteristicUUID = MOS_RPC_RX_CTL_ID,
    connectedDeviceType?: BluetoothConnectedType,
    name: string = '',
  ): Promise<boolean> => {
    if (!peripheralId || attempts > Config.bluetoothMaxAttemptsToConnect) {
      return false;
    }

    if (!devicesInfo[peripheralId]) {
      devicesInfo[peripheralId] = {
        isConnected: false,
        isNotifying: false,
      };
    }

    try {
      if (isScanning) {
        await BleManager.stopScan();
        isScanning = false;
      }

      if (peripheralId && devicesInfo[peripheralId]?.isConnected) {
        if (devicesInfo[peripheralId]?.isNotifying) {
          await BleManager.stopNotification(peripheralId, serviceUUID, characteristicUUID).catch(noop);

          devicesInfo[peripheralId].isNotifying = false;
        }

        await BleManager.disconnect(peripheralId, /* force: */ true).catch(noop);
        await wait(Config.defaultDelay);
      }

      const connectSuccess = await Promise.race([
        new Promise((resolve) => {
          BleManager.connect(peripheralId)
            .then(() => {
              resolve(true);
            })
            .catch(() => resolve(false));
        }),
        new Promise((resolve) => {
          setTimeout(() => {
            resolve(false);
          }, Config.bluetoothConnectTimeout);
        }),
      ]);

      if (!connectSuccess) {
        throw new Error('Bluetooth connect timeout');
      }
      Logger.dev('Bluetooth connected', peripheralId);
      clearQueue(peripheralId);
      devicesInfo[peripheralId].isConnected = true;
      devicesInfo[peripheralId].deviceType = connectedDeviceType;
      if (name === '' && connectedDeviceType === 'FRIDGE') {
        name =
          store.getState().devicesInfo.data.find((d: { peripheralId: string }) => d.peripheralId === peripheralId)
            ?.name || '';
      }
      devicesInfo[peripheralId].name = name;

      await BleManager.retrieveServices(peripheralId);
      await BleManager.startNotification(peripheralId, serviceUUID, characteristicUUID);

      devicesInfo[peripheralId].isNotifying = true;

      // Change read chunk size (Android only)
      await BleManager.requestMTU(peripheralId, 512).catch(noop);

      store.dispatch(applicationActions.addConnectedPeripheralId(peripheralId));
    } catch (error: any) {
      Logger.dev('Bluetooth connect error:', error?.message, peripheralId);

      await wait(Config.defaultDelay);
      return connect(peripheralId, attempts + 1, serviceUUID, characteristicUUID, connectedDeviceType, name);
    }

    return true;
  };

  const readResponseSize = async (peripheralId: string): Promise<number> => {
    if (!peripheralId) {
      return 0;
    }

    const buffer = await BleManager.read(peripheralId, MOS_RPC_SVC_ID, MOS_RPC_RX_CTL_ID);

    return buffer && buffer.length === 4 ? bigEndianBytesToNumber(buffer) : 0;
  };

  const readResponse = async (peripheralId: string, responseSize: number) => {
    if (!peripheralId) {
      return null;
    }

    let numberOfReadBytes = 0;
    let response = '';

    while (numberOfReadBytes < responseSize) {
      const buffer = await BleManager.read(peripheralId, MOS_RPC_SVC_ID, MOS_RPC_DATA_ID);

      if (!buffer) {
        break;
      }

      const bytes = new Uint8Array(buffer);

      numberOfReadBytes += bytes.length;
      response += utf8ByteArrayToString(bytes);
    }

    return response ? JSON.parse(response) : null;
  };

  // Check every time before sending request to get actual state or update it
  const connectIfNeeded = async (peripheralId: string, deviceType: BluetoothConnectedType = 'YETI') => {
    if (!isStarted) {
      await start();
    }

    if (!devicesInfo[peripheralId]?.isConnected) {
      const isDeviceFridge = devicesInfo[peripheralId]?.deviceType === 'FRIDGE' || deviceType === 'FRIDGE';
      let serviceUUID, characteristicUUID;

      if (isDeviceFridge) {
        serviceUUID = FRIDGE_SERVICE_UUID;
        characteristicUUID = FRIDGE_NOTIFICATION_UUID;
      }

      await connect(
        peripheralId,
        Config.bluetoothMaxAttemptsToConnect - 1,
        serviceUUID,
        characteristicUUID,
        isDeviceFridge ? 'FRIDGE' : 'YETI',
        devicesInfo[peripheralId]?.name,
      );
    }

    return isStarted && devicesInfo[peripheralId]?.isConnected;
  };

  const waitForResponse = (
    peripheralId: string,
    id: number,
    readAttempts = 0,
  ): Promise<{ status: boolean; response?: any }> =>
    new Promise((resolve) => {
      if (
        !peripheralId ||
        activeRequestId[peripheralId] !== id ||
        readAttempts >= Config.bluetoothResponseMaxRetryAttempts
      ) {
        return resolve({ status: false });
      }

      setTimeout(async () => {
        if (activeRequestId[peripheralId] !== id) {
          return resolve({ status: false });
        }
        try {
          const responseSize = await readResponseSize(peripheralId);
          if (!responseSize) {
            return resolve(waitForResponse(peripheralId, id, readAttempts + 1));
          }

          if (activeRequestId[peripheralId] !== id) {
            return resolve({ status: false });
          }

          const response = await readResponse(peripheralId, responseSize);

          if (!response) {
            return resolve({ status: false });
          }

          if (response.id === id) {
            return resolve({ status: true, response });
          }

          // We have read the response but it looks to be a response for the previous request, so wait again...
          return resolve(waitForResponse(peripheralId, id, readAttempts + 1));
        } catch (error: any) {
          Logger.dev('Bluetooth read response error:', error?.message);
        }

        resolve({ status: false });
      }, Config.bluetoothResponseDelay);
    });

  const responseError = { ok: false, problem: 'NETWORK_ERROR', originalError: new Error() } as ApiErrorResponse<any>;

  const sendNextRequestFromQueue = (peripheralId: string) => {
    if (!peripheralId || !requestQueue[peripheralId] || !requestQueue[peripheralId].length) {
      return;
    }

    const nextRequest = requestQueue[peripheralId].shift();

    if (nextRequest) {
      sendRequest(
        nextRequest.peripheralId,
        nextRequest.method,
        nextRequest.body,
        nextRequest.attempts,
        nextRequest.onResponse,
        nextRequest.onFailure,
        nextRequest.id,
        nextRequest.isNewDeviceType,
      );
    }
  };

  const sendRequest = async (
    peripheralId: string,
    method: string,
    body: any = null,
    attempts: number = 0,
    onResponse: null | ((response: any) => void) = null,
    onFailure: null | (() => void) = null,
    id: null | number = null,
    isNewDeviceType: boolean = false,
  ): Promise<void> => {
    Logger.dev(`Bluetooth sendRequest. Attempts: ${attempts + 1}.`, {
      peripheralId,
      method,
      body,
      id,
      isNewDeviceType,
      devicesInfo,
    });

    const next = () => {
      if (!peripheralId) {
        return;
      }

      if (id && id === activeRequestId[peripheralId]) {
        activeRequestId[peripheralId] = 0;
      }

      sendNextRequestFromQueue(peripheralId);
    };

    const failure = () => {
      try {
        if (onFailure) {
          onFailure();
        }
      } finally {
        next();
      }
    };

    if (!peripheralId || attempts >= Config.bluetoothResponseMaxRetryAttempts) {
      devicesInfo[peripheralId].isConnected = false;
      return failure();
    }

    if (isUndefined(latestRequestId[peripheralId])) {
      latestRequestId[peripheralId] = 0;
    }

    id = id ?? ++latestRequestId[peripheralId];

    if (activeRequestId[peripheralId] && id !== activeRequestId[peripheralId]) {
      if (!requestQueue[peripheralId]) {
        requestQueue[peripheralId] = [];
      }

      if (activeRequestId[peripheralId] - id > 5) {
        devicesInfo[peripheralId].isConnected = false;
      }

      const queue = requestQueue[peripheralId];
      const req = queue.find((request) => request.id === id);

      //
      // If the request is already in the queue, don't add it again
      // And don't add request for getting state / status
      //
      if (!req && !([METHOD_STATE, METHOD_STATUS].includes(method) && body === null)) {
        queue.push({
          peripheralId,
          method,
          body,
          attempts,
          onResponse,
          onFailure,
          id,
          isNewDeviceType,
        });

        Logger.dev('Bluetooth sendRequest queued...:', { peripheralId, method, body, attempts, id });
      }

      return;
    }

    activeRequestId[peripheralId] = id;
    const request: BleRequest = { id, method };

    if (body) {
      if (isNewDeviceType) {
        request.params = body;
      } else {
        request.args = body;
      }
    }

    if (attempts > 0) {
      const delay = attempts > 0 ? Config.smallDelay * (attempts + 1) : 0;
      await wait(delay);
    }

    try {
      const requestString = JSON.stringify(request);
      const requestBytes = stringToUtf8ByteArray(requestString);

      Logger.dev('Preparing to send BT request', peripheralId, id, requestString, requestBytes.length);

      const requestSize = requestBytes.length;
      const requestSizeBigEndian = numberToBigEndianBytes(requestSize);

      if (activeRequestId[peripheralId] !== id) {
        Logger.dev(`request/response id mismatch on initial write... ${activeRequestId[peripheralId]} != ${id}`);
        return failure();
      }

      await BleManager.write(peripheralId || '', MOS_RPC_SVC_ID, MOS_RPC_TX_CTL_ID, requestSizeBigEndian);

      for (const [i, packet] of chunk(requestBytes, REQUEST_MTU).entries()) {
        Logger.dev(`{${id}} sending packet [${i}] to ${peripheralId}: [${packet.join(', ')}]`);
        await wait(10);
        await BleManager.write(peripheralId || '', MOS_RPC_SVC_ID, MOS_RPC_DATA_ID, packet);

        if (activeRequestId[peripheralId] !== id) {
          Logger.dev('request/response id mismatch on chunk write...');
          return failure();
        }
      }
    } catch (error) {
      Logger.dev('Bluetooth sendRequest error: ', error);
      Logger.dev(`Trying again. Attempt: ${attempts + 1}`);
      return sendRequest(peripheralId, method, body, attempts + 1, onResponse, onFailure, id, isNewDeviceType);
    }

    waitForResponse(peripheralId, id).then(({ status, response }) => {
      if (!status && onResponse) {
        // retry only if we are interested in response
        sendRequest(peripheralId, method, body, attempts + 1, onResponse, onFailure, id, isNewDeviceType);
        return;
      }

      try {
        if (status) {
          if (onResponse) {
            onResponse(response);
          }
        } else {
          if (onFailure) {
            onFailure();
          }
        }
      } finally {
        next();
      }
    });
  };

  const handleDisconnectPeripheral = ({ peripheral }: { peripheral: string }) => {
    if (peripheral) {
      if (!devicesInfo[peripheral]) {
        devicesInfo[peripheral] = {
          isConnected: false,
          isNotifying: false,
        };
      } else {
        devicesInfo[peripheral].isConnected = false;
        devicesInfo[peripheral].isNotifying = false;
      }
    }
  };

  const handleDiscoverPeripheral = (peripheral: BluetoothDevice) => {
    if (peripheral.advertising.localName && peripheral.advertising.localName !== peripheral.name) {
      peripheral.name = peripheral.advertising.localName;
    }

    const pattern = Object.values(Models)
      .filter((model) => {
        if (isBeta || isStage || isProduction) {
          return model.name !== 'a1-';
        }

        return model;
      })
      .map((model) => `^${model.name}`)
      .join('|');

    if (new RegExp(pattern).test(peripheral?.name?.toLowerCase())) {
      store.dispatch(yetiActions.discoveredDevices.request({ peripheral }));
    }
  };

  const handleNotifications = (props: {
    value: number[];
    peripheral: string;
    characteristic: string;
    service: string;
  }) => {
    Logger.dev(`[handleNotifications] Received ${JSON.stringify(props)};`);

    if (devicesInfo[props.peripheral]?.deviceType === 'FRIDGE') {
      Fridge.storeData(devicesInfo[props.peripheral].name || props.peripheral, props.peripheral, props.value);
    }
  };

  const stop = () => {
    isScanning = false;
    clearDiscoveredDevicesList();
    BleManager.stopScan().catch(noop);
  };

  const getState = async (): Promise<BluetoothState | undefined> => {
    // When android check permissions App state every time changes
    // from background to foreground
    // So don't call checkState if requestPermissions is in progress
    if (isAndroid && checkAndroidPermissionStarted) {
      return;
    }

    // Request permissions on Android
    if (isAndroid) {
      checkAndroidPermissionStarted = true;

      if (Number(Platform.Version) >= 31) {
        androidPermission = await PermissionsAndroid.request(PermissionsAndroid.PERMISSIONS.BLUETOOTH_SCAN);

        if (androidPermission === PermissionsAndroid.RESULTS.GRANTED) {
          await PermissionsAndroid.request(PermissionsAndroid.PERMISSIONS.BLUETOOTH_CONNECT);
        }
      } else if (Number(Platform.Version) >= 23 && Number(Platform.Version) <= 30) {
        androidPermission = await PermissionsAndroid.request(PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION);

        if (androidPermission === PermissionsAndroid.RESULTS.GRANTED) {
          await PermissionsAndroid.request(PermissionsAndroid.PERMISSIONS.ACCESS_COARSE_LOCATION);
        }
      }

      checkAndroidPermissionStarted = false;
    }

    // Check if bluetooth is enabled
    const bluetoothState = await BluetoothStateManager.getState();

    // PoweredOff - Bluetooth is disabled on the device
    if (bluetoothState === 'PoweredOff') {
      return BluetoothState.DisabledGlobally;
    }

    if ((isAndroid && androidPermission !== 'granted') || bluetoothState === 'Unauthorized') {
      return BluetoothState.NeedAccess;
    }

    return BluetoothState.Enabled;
  };

  const enable = async (state?: BluetoothState) => {
    if (state === BluetoothState.DisabledGlobally) {
      if (isAndroid) {
        let isBluetoothEnabled: Boolean = false;

        if (androidPermission === 'granted') {
          isBluetoothEnabled = await BluetoothStateManager.requestToEnable();
        }

        if (!isBluetoothEnabled) {
          BluetoothStateManager.openSettings();
        }
      } else {
        Linking.openURL('App-Prefs:Bluetooth');
      }
    }

    if (state === BluetoothState.NeedAccess) {
      Linking.openSettings();
    }
  };

  const start = async () => {
    try {
      if (!isStarted) {
        await BleManager.start({ showAlert: false, forceLegacy: true }).catch(noop);
        isStarted = true;
      }

      removeHandlers();

      handlerDiscover = bleManagerEmitter.addListener(EVENT_DISCOVER_PERIPHERAL, handleDiscoverPeripheral);
      handlerDisconnect = bleManagerEmitter.addListener(EVENT_DISCONNECT_PERIPHERAL, handleDisconnectPeripheral);
      handlerNotifications = bleManagerEmitter.addListener(EVENT_DID_UPDATE_VALUE, handleNotifications);
    } catch (error) {
      Logger.dev('Bluetooth Start Error: ', error);
      return false;
    }

    return true;
  };

  const removeHandlers = () => {
    if (handlerDiscover) {
      handlerDiscover.remove();
      handlerDiscover = null;
    }
    if (handlerDisconnect) {
      handlerDisconnect.remove();
      handlerDisconnect = null;
    }
    if (handlerNotifications) {
      handlerNotifications.remove();
      handlerNotifications = null;
    }
  };

  const getIsConnected = (peripheralId: string) => {
    return devicesInfo[peripheralId]?.isConnected === true;
  };

  const disconnect = async (peripheralId: string) => {
    clearQueue(peripheralId);
    Logger.dev('Bluetooth disconnect requested', peripheralId);
    if (peripheralId && !isEmpty(peripheralId)) {
      if (!devicesInfo[peripheralId]) {
        devicesInfo[peripheralId] = {
          isConnected: false,
          isNotifying: false,
        };
      } else {
        devicesInfo[peripheralId].isConnected = false;
        devicesInfo[peripheralId].isNotifying = false;
      }
      await BleManager.disconnect(peripheralId, /* force: */ true).catch(noop);
    }
  };

  //#region Requests

  const getSysInfo = YetiLegacy.getSysInfo;
  const getDeviceInfo = Common.getDeviceInfo;
  const getConfig = Common.getDeviceConfig;
  const getStatus = Common.getDeviceStatus;
  const startPairing = YetiLegacy.startPairing;
  const connectOta = YetiLegacy.connectOta;
  const getCloudConnectedNetwork = Yeti6G.getCloudConnectedNetwork;
  const checkForError = Yeti6G.checkForError;
  const getDeviceOta = Common.getDeviceOta;
  const getDeviceLifetime = Common.getDeviceLifetime;
  const getAllStates = Yeti6G.getAllStates;

  const joinDirect = async (peripheralId: string, deviceType?: DeviceType) => {
    switch (deviceType) {
      case 'Y6G_300':
      case 'Y6G_500':
      case 'Y6G_700':
      case 'Y6G_1000':
      case 'Y6G_1500':
      case 'Y6G_2000':
      case 'Y6G_4000':
        return Yeti6G.joinDirect(peripheralId, deviceType);
      case 'YETI':
        return YetiLegacy.joinDirect(peripheralId);
    }
  };

  const joinWifi = async (
    peripheralId: string,
    deviceType: DeviceType,
    body: YetiConnectionCredentials | Yeti6GConnectionCredentials,
  ): Promise<{ ok: boolean; data?: any } | undefined> => {
    switch (deviceType) {
      case 'Y6G_300':
      case 'Y6G_500':
      case 'Y6G_700':
      case 'Y6G_1000':
      case 'Y6G_1500':
      case 'Y6G_2000':
      case 'Y6G_4000':
        return Yeti6G.joinWifi(peripheralId, body as Yeti6GConnectionCredentials);
      case 'YETI':
        return YetiLegacy.joinWifi(peripheralId, body as YetiConnectionCredentials);
    }
  };

  const getDeviceState = (deviceType: DeviceType = 'YETI', peripheralId: string) => {
    switch (deviceType) {
      case 'Y6G_300':
      case 'Y6G_500':
      case 'Y6G_700':
      case 'Y6G_1000':
      case 'Y6G_1500':
      case 'Y6G_2000':
      case 'Y6G_4000':
        return Yeti6G.getDeviceState(peripheralId);
      case 'YETI':
        return YetiLegacy.getDeviceState(peripheralId);
    }
  };

  const changeState = (peripheralId: string, deviceType: DeviceType, data: any, method: string = '') => {
    switch (deviceType) {
      case 'Y6G_300':
      case 'Y6G_500':
      case 'Y6G_700':
      case 'Y6G_1000':
      case 'Y6G_1500':
      case 'Y6G_2000':
      case 'Y6G_4000':
        return Common.changeState(peripheralId, method, data);
      case 'YETI':
        return YetiLegacy.changeState(peripheralId, data);
    }
  };

  const getWifiList = (peripheralId: string, deviceType: DeviceType, skipCheckToConnectToCloud: boolean) => {
    switch (deviceType) {
      case 'Y6G_300':
      case 'Y6G_500':
      case 'Y6G_700':
      case 'Y6G_1000':
      case 'Y6G_1500':
      case 'Y6G_2000':
      case 'Y6G_4000':
        return Yeti6G.getWifiList(peripheralId, skipCheckToConnectToCloud);
      case 'YETI':
        return YetiLegacy.getWifiList(peripheralId);
    }
  };

  const clearQueue = (peripheralId?: string) => {
    if (peripheralId) {
      requestQueue[peripheralId] = [];
      activeRequestId[peripheralId] = 0;
      latestRequestId[peripheralId] = 0;
    } else {
      requestQueue = {};
    }
  };

  //#endregion

  // Connect to all devices on start
  connectToAllDevices();

  return {
    start,
    scan,
    stop,
    connect,
    joinWifi,
    joinDirect,
    getWifiList,
    getState,
    getSysInfo,
    connectOta,
    startPairing,
    changeState,
    getDeviceState,
    clearDiscoveredDevicesList,
    enable,
    connectIfNeeded,
    getIsConnected,
    responseError,
    sendRequest,
    getDeviceInfo,
    getConfig,
    getStatus,
    getCloudConnectedNetwork,
    getDeviceOta,
    getDeviceLifetime,
    getAllStates,
    connectToAllDevices,
    checkForError,
    disconnect,

    // For tests
    waitForResponse,
    clearQueue,
  };
};

export default {
  init,
};
