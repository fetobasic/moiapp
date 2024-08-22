import BleManager from 'react-native-ble-manager';
import {
  changeBindMode,
  changeSettings,
  csum,
  getSettings,
  restoreFactorySettings,
  sendBinding,
  setLeftTemperature,
  setRightTemperature,
  setTemperature,
} from 'App/Services/Bluetooth/Fridge';
import { FRIDGE_BIND_MODE, FridgeData } from 'App/Types/Fridge';
import { Bluetooth } from 'App/Containers/Home/HomeScreen';

const peripheralId: string = '123';
const fridgeData: FridgeData = {
  lock: 0,
  switch: 0,
  compressorMode: 0,
  batteryProtection: 0,
  leftBoxTempSet: 0,
  maxControlRange: 0,
  minControlRange: 0,
  leftBoxTempDiff: 0,
  startDelay: 0,
  units: 0,
  leftTempComp1: 0,
  leftTempComp2: 0,
  leftTempComp3: 0,
  leftTempCompShutdown: 0,
  leftTempActual: 0,
  percentOfBatteryCharge: 0,
  batteryVoltageInt: 0,
  batteryVoltageDec: 0,
  rightBoxTempSet: 0,
  maxControlRangeForModel3: 0,
  minControlRangeForModel3: 0,
  rightBoxTempDiff: 0,
  rightTempComp1: 0,
  rightTempComp2: 0,
  rightTempComp3: 0,
  rightTempCompShutdown: 0,
  rightTempActual: 0,
  runningStatesOfBoxes: 0,
  fridgeModel: 0,
  heatingTemp: 0,
};

const baseWrite = BleManager.writeWithoutResponse;

afterEach(() => {
  BleManager.writeWithoutResponse = baseWrite;
});

describe('csum function', () => {
  // Test case 1: Empty array
  test('should return [0, 0] for an empty array', () => {
    const data: number[] = [];
    const result: number[] = csum(data);
    const expected: number[] = [0, 0];
    expect(result).toEqual(expected);
  });

  // Test case 2: Array with positive numbers
  test('should return correct byte array for an array with positive numbers', () => {
    const data: number[] = [10, 20, 30, 40];
    const result: number[] = csum(data);
    const expected: number[] = [10, 20, 30, 40, 0, 100]; // Total is 100 (0x0064 in hex)
    expect(result).toEqual(expected);
  });

  // Test case 3: Array with negative numbers
  test('should return correct byte array for an array with negative numbers', () => {
    const data: number[] = [-5, 10, -15];
    const result: number[] = csum(data);
    const expected: number[] = [-5, 10, -15, 0xff, 0xf6]; // Total is -10 (0xFFF6 in hex)
    expect(result).toEqual(expected);
  });

  // Test case 4: Array with mixed positive and negative numbers
  test('should return correct byte array for an array with mixed positive and negative numbers', () => {
    const data: number[] = [5, -10, 15, -20];
    const result: number[] = csum(data);
    const expected: number[] = [5, -10, 15, -20, 0xff, 0xf6]; // Total is -10 (0xFFF6 in hex)
    expect(result).toEqual(expected);
  });

  // Test case 5: Array with hex values
  test('should return correct byte array for an array with hexadecimal values', () => {
    const data: number[] = [0x10, 0xff, 0x00];
    const result: number[] = csum(data);
    const expected: number[] = [0x10, 0xff, 0x00, 0x01, 0x0f]; // Total is 271 (0x010F in hex)
    expect(result).toEqual(expected);
  });
});

describe('sendBinding function', () => {
  test('should return { ok: true } when the request is successful', async () => {
    Bluetooth.connectIfNeeded = jest.fn().mockResolvedValueOnce(true);

    const result: { ok: boolean } = await sendBinding(peripheralId);
    const expected: { ok: boolean } = { ok: true };
    expect(result).toEqual(expected);
  });

  test('should return { ok: false } when the request is unsuccessful', async () => {
    BleManager.writeWithoutResponse = jest.fn().mockRejectedValueOnce('Error');
    Bluetooth.connectIfNeeded = jest.fn().mockResolvedValueOnce(true);

    const result: { ok: boolean } = await sendBinding(peripheralId);
    const expected: { ok: boolean } = { ok: false };
    expect(result).toEqual(expected);
  });

  test('should return { ok: false } when peripheralId is missing', async () => {
    BleManager.writeWithoutResponse = jest.fn().mockRejectedValueOnce('Error');
    Bluetooth.connectIfNeeded = jest.fn().mockResolvedValueOnce(true);

    const result: { ok: boolean } = await sendBinding('');
    const expected: { ok: boolean } = { ok: false };
    expect(result).toEqual(expected);
  });

  test('should return { ok: false } when Bluetooth can`t connected to device', async () => {
    BleManager.writeWithoutResponse = jest.fn().mockRejectedValueOnce('Error');
    Bluetooth.connectIfNeeded = jest.fn().mockResolvedValueOnce(false);

    const result: { ok: boolean } = await sendBinding(peripheralId);
    const expected: { ok: boolean } = { ok: false };
    expect(result).toEqual(expected);
  });
});

describe('changeBindMode function', () => {
  test('should return { ok: true } when the change bind mode to ALLOW', async () => {
    Bluetooth.connectIfNeeded = jest.fn().mockResolvedValueOnce(true);

    const result: { ok: boolean } = await changeBindMode(peripheralId, FRIDGE_BIND_MODE.ALLOW);
    const expected: { ok: boolean } = {
      ok: true,
    };
    expect(result).toEqual(expected);
  });

  test('should return { ok: true } when the change bind mode to DISALLOW', async () => {
    Bluetooth.connectIfNeeded = jest.fn().mockResolvedValueOnce(true);

    const result: { ok: boolean } = await changeBindMode(peripheralId, FRIDGE_BIND_MODE.DISALLOW);
    const expected: { ok: boolean } = {
      ok: true,
    };
    expect(result).toEqual(expected);
  });
});

describe('getSettings function', () => {
  test('should return { ok: true } when the request is successful', async () => {
    Bluetooth.connectIfNeeded = jest.fn().mockResolvedValueOnce(true);

    const result: { ok: boolean } = await getSettings(peripheralId);
    const expected: { ok: boolean } = {
      ok: true,
    };
    expect(result).toEqual(expected);
  });
});

describe('changeSettings function', () => {
  test('should return { ok: true } when the request is successful', async () => {
    Bluetooth.connectIfNeeded = jest.fn().mockResolvedValueOnce(true);
    const changedData = { ...fridgeData, maxControlRange: 10 };

    const result: { ok: boolean } = await changeSettings(peripheralId, changedData);
    const expected: { ok: boolean } = {
      ok: true,
    };
    expect(result).toEqual(expected);
  });
});

describe('restoreFactorySettings function', () => {
  test('should return { ok: true } when the request is successful', async () => {
    Bluetooth.connectIfNeeded = jest.fn().mockResolvedValueOnce(true);

    const result: { ok: boolean } = await restoreFactorySettings(peripheralId);
    const expected: { ok: boolean } = {
      ok: true,
    };
    expect(result).toEqual(expected);
  });
});

describe('setLeftTemperature function', () => {
  test('should return { ok: true } when the request is successful', async () => {
    Bluetooth.connectIfNeeded = jest.fn().mockResolvedValueOnce(true);

    const result: { ok: boolean } = await setLeftTemperature(peripheralId, 10);
    const expected: { ok: boolean } = {
      ok: true,
    };
    expect(result).toEqual(expected);
  });
});

describe('setRightTemperature function', () => {
  test('should return { ok: true } when the request is successful', async () => {
    Bluetooth.connectIfNeeded = jest.fn().mockResolvedValueOnce(true);

    const result: { ok: boolean } = await setRightTemperature(peripheralId, 10);
    const expected: { ok: boolean } = {
      ok: true,
    };
    expect(result).toEqual(expected);
  });
});

describe('setTemperature function', () => {
  test('should return { ok: true } when the request is successful', async () => {
    Bluetooth.connectIfNeeded = jest.fn().mockResolvedValueOnce(true);

    const result: { ok: boolean } = await setTemperature(peripheralId, 10);
    const expected: { ok: boolean } = {
      ok: true,
    };
    expect(result).toEqual(expected);
  });
});
