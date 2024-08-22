import { ApiResponse } from 'apisauce';

import { METHOD_DEVICE, METHOD_CONFIG, METHOD_STATUS, METHOD_OTA, METHOD_LIFETIME } from 'App/Config/Bluetooth';
import { BluetoothResponseType, Yeti6GStatus, Yeti6GConfig, YetiOtaType, Yeti6GLifetime } from 'App/Types/Yeti';
import { DeviceInfo } from 'App/Types/Devices';

import { Bluetooth } from 'App/Containers/Home/HomeScreen';
import Logger from 'App/Services/Logger';

const getDeviceInfo = (peripheralId: string, attempts: number = 0): Promise<{ ok: boolean; data?: DeviceInfo }> =>
  new Promise(async (resolve) => {
    const isSuccessConnected = await Bluetooth.connectIfNeeded(peripheralId);

    if (!isSuccessConnected) {
      return resolve(Bluetooth.responseError);
    }

    Bluetooth.sendRequest(
      peripheralId,
      METHOD_DEVICE,
      null,
      attempts,
      (response: BluetoothResponseType<DeviceInfo>) => {
        resolve({ data: response.result.body, ok: true });
      },
      () => {
        resolve(Bluetooth.responseError);
      },
      null,
      true,
    );
  });

const getDeviceConfig = (peripheralId: string, attempts: number = 0): Promise<{ ok: boolean; data?: Yeti6GConfig }> =>
  new Promise(async (resolve) => {
    const isSuccessConnected = await Bluetooth.connectIfNeeded(peripheralId);

    if (!isSuccessConnected) {
      return resolve(Bluetooth.responseError);
    }

    Bluetooth.sendRequest(
      peripheralId,
      METHOD_CONFIG,
      null,
      attempts,
      (response: BluetoothResponseType<Yeti6GConfig>) => {
        resolve({ data: response.result.body, ok: true });
      },
      () => {
        resolve(Bluetooth.responseError);
      },
      null,
      true,
    );
  });

const getDeviceOta = (peripheralId: string, attempts: number = 0): Promise<{ ok: boolean; data?: YetiOtaType }> =>
  new Promise(async (resolve) => {
    const isSuccessConnected = await Bluetooth.connectIfNeeded(peripheralId);

    if (!isSuccessConnected) {
      return resolve(Bluetooth.responseError);
    }

    Bluetooth.sendRequest(
      peripheralId,
      METHOD_OTA,
      null,
      attempts,
      (response: BluetoothResponseType<YetiOtaType>) => {
        resolve({ data: response.result.body, ok: true });
      },
      () => {
        resolve(Bluetooth.responseError);
      },
      null,
      true,
    );
  });

const getDeviceLifetime = (
  peripheralId: string,
  attempts: number = 0,
): Promise<{ ok: boolean; data?: Yeti6GLifetime }> =>
  new Promise(async (resolve) => {
    const isSuccessConnected = await Bluetooth.connectIfNeeded(peripheralId);

    if (!isSuccessConnected) {
      return resolve(Bluetooth.responseError);
    }

    Bluetooth.sendRequest(
      peripheralId,
      METHOD_LIFETIME,
      null,
      attempts,
      (response: BluetoothResponseType<Yeti6GLifetime>) => {
        resolve({ data: response.result.body, ok: true });
      },
      () => {
        resolve(Bluetooth.responseError);
      },
      null,
      true,
    );
  });

const getDeviceStatus = (peripheralId: string, attempts: number = 0): Promise<{ ok: boolean; data?: Yeti6GStatus }> =>
  new Promise(async (resolve) => {
    const isSuccessConnected = await Bluetooth.connectIfNeeded(peripheralId);

    if (!isSuccessConnected) {
      return resolve(Bluetooth.responseError);
    }

    Bluetooth.sendRequest(
      peripheralId,
      METHOD_STATUS,
      null,
      attempts,
      (response: BluetoothResponseType<Yeti6GStatus>) => {
        resolve({ data: response.result.body, ok: true });
      },
      () => {
        resolve(Bluetooth.responseError);
      },
      null,
      true,
    );
  });

const changeState = (
  peripheralId: string,
  method: string,
  data: any,
  attempts: number = 0,
): Promise<ApiResponse<any>> =>
  new Promise(async (resolve) => {
    const isSuccessConnected = await Bluetooth.connectIfNeeded(peripheralId);

    if (!isSuccessConnected) {
      return resolve(Bluetooth.responseError);
    }

    const params = {
      action: 'PATCH',
      body: data,
    };

    Bluetooth.sendRequest(
      peripheralId,
      method,
      params,
      attempts,
      (response: BluetoothResponseType<any>) => {
        Logger.dev('Change State response ok', JSON.stringify(response?.result?.body), method);
        resolve({ data: { [method]: response?.result?.body }, ok: true, problem: null, originalError: null });
      },
      () => {
        Logger.dev('Change State response error', JSON.stringify({ peripheralId, method, params }));
        resolve(Bluetooth.responseError);
      },
      null,
      true,
    );
  });

export { getDeviceInfo, getDeviceConfig, getDeviceStatus, getDeviceOta, getDeviceLifetime, changeState };
