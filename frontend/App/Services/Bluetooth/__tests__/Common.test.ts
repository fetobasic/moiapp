import BleManager from 'react-native-ble-manager';

import Config from 'App/Config/AppConfig';
import { Bluetooth } from 'App/Containers/Home/HomeScreen';
import { stringToUtf8ByteArray } from 'App/Transforms/bytes';
import {
  getDeviceInfo,
  getDeviceConfig,
  getDeviceOta,
  getDeviceLifetime,
  getDeviceStatus,
  changeState,
} from 'App/Services/Bluetooth/Common';

const peripheralId: string = '123';

const baseWrite = BleManager.write;
const connectIfNeeded = Bluetooth.connectIfNeeded;

beforeEach(() => {
  BleManager.start = jest.fn().mockResolvedValueOnce(true);
  BleManager.connect = jest.fn().mockResolvedValueOnce(true);
  BleManager.stopScan = jest.fn().mockResolvedValueOnce(true);
  BleManager.disconnect = jest.fn().mockResolvedValueOnce(true);
  BleManager.stopNotification = jest.fn().mockResolvedValueOnce(true);
  BleManager.retrieveServices = jest.fn().mockResolvedValueOnce(true);
  BleManager.startNotification = jest.fn().mockResolvedValueOnce(true);
  BleManager.requestMTU = jest.fn().mockResolvedValueOnce(true);
  BleManager.write = jest.fn().mockImplementation(() => Promise.resolve());

  const message = stringToUtf8ByteArray('{"id":1,"result":{"body": {}}}');

  BleManager.read = jest
    .fn()
    .mockResolvedValueOnce([0, 0, 0, message.length]) // readResponseSize
    .mockResolvedValueOnce(message); // readResponse
});

afterEach(() => {
  BleManager.write = baseWrite;
  Bluetooth.connectIfNeeded = connectIfNeeded;
});

describe('getDeviceInfo', () => {
  test('should return { ok: false } when can`t connect to device', async () => {
    Bluetooth.connectIfNeeded = jest.fn().mockResolvedValueOnce(false);

    const result: { ok: boolean } = await getDeviceInfo(peripheralId);

    expect(result).toEqual(Bluetooth.responseError);
  });

  test('should return { ok: false } when the request is failed', async () => {
    BleManager.write = jest.fn().mockRejectedValue('Error');

    const result: { ok: boolean } = await getDeviceInfo(peripheralId, Config.bluetoothResponseMaxRetryAttempts - 1);

    expect(result).toEqual(Bluetooth.responseError);
  });

  test('should return { ok: true } when the request is successful', async () => {
    const result: { ok: boolean } = await getDeviceInfo(peripheralId);
    const expected: { ok: boolean; data: any } = {
      ok: true,
      data: {},
    };

    expect(result).toEqual(expected);
  });
});

describe('getDeviceConfig', () => {
  test('should return { ok: false } when can`t connect to device', async () => {
    Bluetooth.connectIfNeeded = jest.fn().mockResolvedValueOnce(false);

    const result: { ok: boolean } = await getDeviceConfig(peripheralId);

    expect(result).toEqual(Bluetooth.responseError);
  });

  test('should return { ok: false } when the request is failed', async () => {
    BleManager.write = jest.fn().mockRejectedValue('Error');

    const result: { ok: boolean } = await getDeviceConfig(peripheralId, Config.bluetoothResponseMaxRetryAttempts - 1);

    expect(result).toEqual(Bluetooth.responseError);
  });

  test('should return { ok: true } when the request is successful', async () => {
    const result: { ok: boolean } = await getDeviceConfig(peripheralId);
    const expected: { ok: boolean; data: any } = {
      ok: true,
      data: {},
    };

    expect(result).toEqual(expected);
  });
});

describe('getDeviceOta', () => {
  test('should return { ok: false } when can`t connect to device', async () => {
    Bluetooth.connectIfNeeded = jest.fn().mockResolvedValueOnce(false);

    const result: { ok: boolean } = await getDeviceOta(peripheralId);

    expect(result).toEqual(Bluetooth.responseError);
  });

  test('should return { ok: false } when the request is failed', async () => {
    BleManager.write = jest.fn().mockRejectedValue('Error');

    const result: { ok: boolean } = await getDeviceOta(peripheralId, Config.bluetoothResponseMaxRetryAttempts - 1);

    expect(result).toEqual(Bluetooth.responseError);
  });

  test('should return { ok: true } when the request is successful', async () => {
    const result: { ok: boolean } = await getDeviceOta(peripheralId);
    const expected: { ok: boolean; data: any } = {
      ok: true,
      data: {},
    };

    expect(result).toEqual(expected);
  });
});

describe('getDeviceLifetime', () => {
  test('should return { ok: false } when can`t connect to device', async () => {
    Bluetooth.connectIfNeeded = jest.fn().mockResolvedValueOnce(false);

    const result: { ok: boolean } = await getDeviceLifetime(peripheralId);

    expect(result).toEqual(Bluetooth.responseError);
  });

  test('should return { ok: false } when the request is failed', async () => {
    BleManager.write = jest.fn().mockRejectedValue('Error');

    const result: { ok: boolean } = await getDeviceLifetime(peripheralId, Config.bluetoothResponseMaxRetryAttempts - 1);

    expect(result).toEqual(Bluetooth.responseError);
  });

  test('should return { ok: true } when the request is successful', async () => {
    const result: { ok: boolean } = await getDeviceLifetime(peripheralId);
    const expected: { ok: boolean; data: any } = {
      ok: true,
      data: {},
    };

    expect(result).toEqual(expected);
  });
});

describe('getDeviceStatus', () => {
  test('should return { ok: false } when can`t connect to device', async () => {
    Bluetooth.connectIfNeeded = jest.fn().mockResolvedValueOnce(false);

    const result: { ok: boolean } = await getDeviceStatus(peripheralId);

    expect(result).toEqual(Bluetooth.responseError);
  });

  test('should return { ok: false } when the request is failed', async () => {
    BleManager.write = jest.fn().mockRejectedValue('Error');

    const result: { ok: boolean } = await getDeviceStatus(peripheralId, Config.bluetoothResponseMaxRetryAttempts - 1);

    expect(result).toEqual(Bluetooth.responseError);
  });

  test('should return { ok: true } when the request is successful', async () => {
    const result: { ok: boolean } = await getDeviceStatus(peripheralId);
    const expected: { ok: boolean; data: any } = {
      ok: true,
      data: {},
    };

    expect(result).toEqual(expected);
  });
});

describe('changeState', () => {
  test('should return { ok: false } when can`t connect to device', async () => {
    Bluetooth.connectIfNeeded = jest.fn().mockResolvedValueOnce(false);

    const result: { ok: boolean } = await changeState(peripheralId, 'device', {});

    expect(result).toEqual(Bluetooth.responseError);
  });

  test('should return { ok: false } when the request is failed', async () => {
    BleManager.write = jest.fn().mockRejectedValue('Error');

    const result: { ok: boolean } = await changeState(
      peripheralId,
      'device',
      {},
      Config.bluetoothResponseMaxRetryAttempts - 1,
    );

    expect(result).toEqual(Bluetooth.responseError);
  });

  test('should return { ok: true } when the request is successful', async () => {
    const result: { ok: boolean } = await changeState(peripheralId, 'device', {});
    const expected: { ok: boolean; data: any; problem: any; originalError: any } = {
      ok: true,
      data: { device: {} },
      problem: null,
      originalError: null,
    };

    expect(result).toEqual(expected);
  });
});
