import BleManager from 'react-native-ble-manager';

import Config from 'App/Config/AppConfig';
import { Bluetooth } from 'App/Containers/Home/HomeScreen';
import { stringToUtf8ByteArray } from 'App/Transforms/bytes';
import {
  changeState,
  connectOta,
  getDeviceState,
  getSysInfo,
  getWifiList,
  joinDirect,
  joinWifi,
  startPairing,
} from '../YetiLegacy';
import AppConfig from 'App/Config/AppConfig';
import { yetiLegacy } from 'App/Fixtures/mocks/mockedState';

const peripheralId: string = '123';

const baseWrite = BleManager.write;
const connectIfNeeded = Bluetooth.connectIfNeeded;

let readId = 1;

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

  const message = stringToUtf8ByteArray(`{"id":${readId},"result":{"body": {}}}`);

  BleManager.read = jest
    .fn()
    .mockResolvedValueOnce([0, 0, 0, message.length]) // readResponseSize
    .mockResolvedValueOnce(message) // readResponse
    .mockResolvedValueOnce([0, 0, 0, message.length]) // For second request
    .mockResolvedValueOnce(message);
});

afterEach(() => {
  BleManager.write = baseWrite;
  Bluetooth.connectIfNeeded = connectIfNeeded;
});

describe('getSysInfo', () => {
  test('should return { ok: false } when can`t connect to device', async () => {
    Bluetooth.connectIfNeeded = jest.fn().mockResolvedValueOnce(false);

    const result: { ok: boolean } = await getSysInfo(peripheralId, { id: readId });

    expect(result).toEqual(Bluetooth.responseError);
  });

  test('should return { ok: false } when the request is failed', async () => {
    BleManager.write = jest.fn().mockRejectedValue('Error');

    const result: { ok: boolean } = await getSysInfo(peripheralId, {
      attempts: Config.bluetoothResponseMaxRetryAttempts - 1,
      id: readId,
    });

    expect(result).toEqual(Bluetooth.responseError);
  });

  test('should return { ok: true } when the request is successful', async () => {
    const result: { ok: boolean } = await getSysInfo(peripheralId, { id: readId });
    const expected = {
      ok: true,
      data: {},
      originalError: null,
      problem: null,
    };

    expect(result).toEqual(expected);
  });
});

describe('joinDirect', () => {
  test('should return success join', async () => {
    const result = await joinDirect(peripheralId, { id: readId });

    expect(result).toBeUndefined();
  });
});

describe('joinWifi', () => {
  test('should return { ok: false } when can`t get getSysInfo', async () => {
    Bluetooth.connectIfNeeded = jest.fn().mockResolvedValueOnce(false);
    const body = {
      wifi: {
        name: '123',
      },
      iot: {
        env: 'qwe',
        hostname: 'qwe',
        endpoint: 'qwe',
      },
    };

    const result = await joinWifi(peripheralId, body, {
      attempts: AppConfig.bluetoothResponseMaxRetryAttempts - 1,
      id: readId,
    });

    expect(result).toEqual(Bluetooth.responseError);
  });

  test('should return success join', async () => {
    const body = {
      wifi: {
        name: '123',
      },
      iot: {
        env: 'qwe',
        hostname: 'qwe',
        endpoint: 'qwe',
      },
    };

    const result = await joinWifi(peripheralId, body, { id: readId });

    expect(result).toEqual({
      ok: true,
      data: {},
      originalError: null,
      problem: null,
    });
  });
});

describe('startPairing', () => {
  test('should return responseError', async () => {
    Bluetooth.connectIfNeeded = jest.fn().mockResolvedValueOnce(false);
    const result = await startPairing(peripheralId, {
      attempts: AppConfig.bluetoothResponseMaxRetryAttempts - 1,
      id: readId,
    });

    expect(result).toEqual(Bluetooth.responseError);
  });

  test('should return success', async () => {
    const result = await startPairing(peripheralId, { id: readId });

    expect(result).toEqual({ ok: true, status: 200, problem: null, originalError: null });
  });
});

describe('getDeviceState', () => {
  test('should return responseError on connect Device', async () => {
    Bluetooth.connectIfNeeded = jest.fn().mockResolvedValueOnce(false);
    const result = await getDeviceState(peripheralId, {
      attempts: AppConfig.bluetoothResponseMaxRetryAttempts - 1,
      id: readId,
    });

    expect(result).toEqual(Bluetooth.responseError);
  });

  test('should return responseError on response', async () => {
    BleManager.write = jest.fn().mockRejectedValue('Error');

    const result = await getDeviceState(peripheralId, {
      attempts: AppConfig.bluetoothResponseMaxRetryAttempts - 1,
      id: readId,
    });

    expect(result).toEqual(Bluetooth.responseError);
  });

  test('should return success', async () => {
    const result = await getDeviceState(peripheralId, { id: readId });

    expect(result).toEqual({ ok: true, data: {} });
  });
});

describe('connectOta', () => {
  const body = {
    url: 'http://qwe.com',
    ssid: 'qwe',
    pass: 'qwe',
    urlSignature: 'qwe',
    keyId: 'qwe',
  };

  test('should return responseError on connect Device', async () => {
    Bluetooth.connectIfNeeded = jest.fn().mockResolvedValueOnce(false);
    const result = await connectOta(body, peripheralId, {
      attempts: AppConfig.bluetoothResponseMaxRetryAttempts - 1,
      id: readId,
    });

    expect(result).toEqual(Bluetooth.responseError);
  });

  test('should return responseError on response', async () => {
    BleManager.write = jest.fn().mockRejectedValue('Error');

    const result = await connectOta(body, peripheralId, {
      attempts: AppConfig.bluetoothResponseMaxRetryAttempts - 1,
      id: readId,
    });

    expect(result).toEqual(Bluetooth.responseError);
  });

  test('should return success', async () => {
    const result = await connectOta(body, peripheralId, { id: readId });

    expect(result).toEqual({ ok: true, data: {} });
  });
});

describe('changeState', () => {
  test('should return responseError on connect Device', async () => {
    Bluetooth.connectIfNeeded = jest.fn().mockResolvedValueOnce(false);
    const result = await changeState(peripheralId, yetiLegacy, {
      attempts: AppConfig.bluetoothResponseMaxRetryAttempts - 1,
      id: readId,
    });

    expect(result).toEqual(Bluetooth.responseError);
  });

  test('should return responseError on response', async () => {
    BleManager.write = jest.fn().mockRejectedValue('Error');

    const result = await changeState(peripheralId, yetiLegacy, {
      attempts: AppConfig.bluetoothResponseMaxRetryAttempts - 1,
      id: readId,
    });

    expect(result).toEqual(Bluetooth.responseError);
  });

  test('should return success', async () => {
    const result = await changeState(peripheralId, yetiLegacy, { id: readId });

    expect(result).toEqual({ ok: true, data: {}, problem: null, originalError: null });
  });
});

describe('getWifiList', () => {
  test('should return responseError on response', async () => {
    BleManager.write = jest.fn().mockRejectedValue('Error');

    const result = await getWifiList(peripheralId, {
      attempts: AppConfig.bluetoothResponseMaxRetryAttempts - 1,
      id: readId,
    });

    expect(result).toEqual(null);
  });

  test('should return success', async () => {
    const result = await getWifiList(peripheralId, { id: readId });

    expect(result).toEqual(null);
  });
});
