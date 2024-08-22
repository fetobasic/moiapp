import { wifiActions } from 'App/Store/WifiList';
import {
  METHOD_WIFI,
  METHOD_JOIN,
  METHOD_SYSINFO,
  METHOD_STATE,
  METHOD_JOIN_DIRECT,
  METHOD_START_PAIR,
  METHOD_OTA,
} from 'App/Config/Bluetooth';
import {
  BluetoothResponseType,
  WiFiListObj,
  YetiConnectionCredentials,
  YetiDirectInfo,
  YetiState,
  YetiSysInfo,
} from 'App/Types/Yeti';
import { ApiResponse } from 'apisauce';
import { StartOtaResponse } from 'App/Types/FirmwareUpdate';
import { wait } from 'App/Services/Wait';
import Config from 'App/Config/AppConfig';
import { store } from 'App/Store';

import { Bluetooth } from 'App/Containers/Home/HomeScreen';
import { yetiActions } from 'App/Store/Yeti';

type ParamsTypes = {
  attempts?: number;
  id?: number;
};

const getSysInfo = (peripheralId: string, params?: ParamsTypes): Promise<ApiResponse<YetiSysInfo>> =>
  new Promise(async (resolve) => {
    const isSuccessConnected = await Bluetooth.connectIfNeeded(peripheralId);

    if (!isSuccessConnected) {
      return resolve(Bluetooth.responseError);
    }

    Bluetooth.sendRequest(
      peripheralId,
      METHOD_SYSINFO,
      null,
      params?.attempts,
      (response: BluetoothResponseType<YetiSysInfo>) => {
        resolve({ data: response.result.body, ok: true, problem: null, originalError: null });
      },
      () => {
        resolve(Bluetooth.responseError);
      },
      params?.id,
    );
  });

const joinWifi = async (peripheralId: string, body: YetiConnectionCredentials, params?: ParamsTypes) => {
  const response = await getSysInfo(peripheralId, params);

  if (response.ok && response.data) {
    await wait(Config.defaultDelay);
    await Bluetooth.sendRequest(peripheralId, METHOD_JOIN, body, params?.attempts, null, null, params?.id);

    store.dispatch(yetiActions.bluetoothReceiveYetiInfo({ data: response.data }));
  }

  return response;
};

const joinDirect = (peripheralId: string, params?: ParamsTypes) => {
  return Bluetooth.sendRequest(
    peripheralId,
    METHOD_JOIN_DIRECT,
    null,
    params?.attempts,
    (response: BluetoothResponseType<YetiDirectInfo>) => {
      store.dispatch(yetiActions.directConnect.success({ directData: response?.result?.body }));
    },
    null,
    params?.id,
  );
};

const startPairing = (peripheralId: string, params?: ParamsTypes) =>
  new Promise(async (resolve) => {
    await Bluetooth.connectIfNeeded(peripheralId);

    Bluetooth.sendRequest(
      peripheralId,
      METHOD_START_PAIR,
      null,
      params?.attempts,
      () => resolve({ ok: true, status: 200, problem: null, originalError: null }),
      () => resolve(Bluetooth.responseError),
      params?.id,
    );
  });

const getDeviceState = (peripheralId: string, params?: ParamsTypes) =>
  new Promise(async (resolve) => {
    const isSuccessConnected = await Bluetooth.connectIfNeeded(peripheralId);

    if (!isSuccessConnected) {
      return resolve(Bluetooth.responseError);
    }

    Bluetooth.sendRequest(
      peripheralId,
      METHOD_STATE,
      null,
      params?.attempts,
      (response: BluetoothResponseType<YetiState>) => {
        resolve({ data: response?.result?.body, ok: true });
      },
      () => {
        resolve(Bluetooth.responseError);
      },
      params?.id,
    );
  });

const connectOta = (
  body: {
    url: string;
    ssid: string;
    pass: string | null;
    urlSignature: string;
    keyId: string;
  },
  peripheralId: string,
  params?: ParamsTypes,
) =>
  new Promise(async (resolve) => {
    const isSuccessConnected = await Bluetooth.connectIfNeeded(peripheralId);

    if (!isSuccessConnected) {
      return resolve(Bluetooth.responseError);
    }

    Bluetooth.sendRequest(
      peripheralId,
      METHOD_OTA,
      body,
      params?.attempts,
      (response: BluetoothResponseType<StartOtaResponse>) => {
        resolve({ data: response.result.body, ok: true });
      },
      () => resolve(Bluetooth.responseError),
      params?.id,
    );
  });

const changeState = (peripheralId: string, data: YetiState, params?: ParamsTypes): Promise<ApiResponse<YetiState>> =>
  new Promise(async (resolve) => {
    const isSuccessConnected = await Bluetooth.connectIfNeeded(peripheralId);

    if (!isSuccessConnected) {
      return resolve(Bluetooth.responseError);
    }

    Bluetooth.sendRequest(
      peripheralId,
      METHOD_STATE,
      data,
      params?.attempts,
      (response: BluetoothResponseType<YetiState>) => {
        resolve({ data: response.result.body, ok: true, problem: null, originalError: null });
      },
      () => resolve(Bluetooth.responseError),
      params?.id,
    );
  });

const getWifiList = (peripheralId: string, params?: ParamsTypes) =>
  new Promise((resolve) =>
    Bluetooth.sendRequest(
      peripheralId,
      METHOD_WIFI,
      null,
      params?.attempts,
      (response: BluetoothResponseType<WiFiListObj>) => {
        store.dispatch(wifiActions.bluetoothWifi({ response: response?.result?.body }));
        resolve(null);
      },
      () => {
        resolve(null);
      },
      params?.id,
    ),
  );

export { joinWifi, joinDirect, getWifiList, getSysInfo, connectOta, startPairing, changeState, getDeviceState };
