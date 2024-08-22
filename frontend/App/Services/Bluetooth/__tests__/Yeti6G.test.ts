import { Bluetooth } from 'App/Containers/Home/HomeScreen';
import {
  checkForError,
  getAllStates,
  getCloudConnectedNetwork,
  getDeviceState,
  getWifiList,
  joinDirect,
  joinWifi,
} from 'App/Services/Bluetooth/Yeti6G';
import * as Common from 'App/Services/Bluetooth/Common';

import { yeti6GState } from 'App/Fixtures/yeti6GState';
import { YetiModel } from 'App/Types/Yeti';
import { parseModelFromHostId } from 'App/Services/ThingHelper';

const peripheralId: string = '123';

beforeEach(() => {
  Bluetooth.connectIfNeeded = jest.fn().mockResolvedValue(true);
});

describe('getAllStates', () => {
  test('should return "Undefined" when can`t connect to device', async () => {
    Bluetooth.connectIfNeeded = jest.fn().mockResolvedValueOnce(false);

    const result = await getAllStates(peripheralId);

    expect(result).toBeUndefined();
  });

  test('should return "Undefined" when getDeviceInfo request is failed', async () => {
    jest.spyOn(Common, 'getDeviceInfo').mockImplementation(() => Promise.resolve({ ok: false }));

    const result = await getAllStates(peripheralId);

    expect(result).toBeUndefined();
  });

  test('should return "Undefined" when getDeviceStatus request is failed', async () => {
    jest.spyOn(Common, 'getDeviceInfo').mockImplementation(() => Promise.resolve({ ok: true }));

    jest.spyOn(Common, 'getDeviceStatus').mockImplementation(() => Promise.resolve({ ok: false }));

    const result = await getAllStates(peripheralId);

    expect(result).toBeUndefined();
  });

  test('should return "Undefined" when getDeviceConfig request is failed', async () => {
    jest.spyOn(Common, 'getDeviceInfo').mockImplementation(() => Promise.resolve({ ok: true }));
    jest.spyOn(Common, 'getDeviceStatus').mockImplementation(() => Promise.resolve({ ok: true }));

    jest.spyOn(Common, 'getDeviceConfig').mockImplementation(() => Promise.resolve({ ok: false }));

    const result = await getAllStates(peripheralId);

    expect(result).toBeUndefined();
  });

  test('should return "Undefined" when getDeviceOta request is failed', async () => {
    jest.spyOn(Common, 'getDeviceInfo').mockImplementation(() => Promise.resolve({ ok: true }));
    jest.spyOn(Common, 'getDeviceStatus').mockImplementation(() => Promise.resolve({ ok: true }));
    jest.spyOn(Common, 'getDeviceConfig').mockImplementation(() => Promise.resolve({ ok: true }));

    jest.spyOn(Common, 'getDeviceOta').mockImplementation(() => Promise.resolve({ ok: false }));

    const result = await getAllStates(peripheralId);

    expect(result).toBeUndefined();
  });

  test('should return "Undefined" when getDeviceLifetime request is failed', async () => {
    jest.spyOn(Common, 'getDeviceInfo').mockImplementation(() => Promise.resolve({ ok: true }));
    jest.spyOn(Common, 'getDeviceStatus').mockImplementation(() => Promise.resolve({ ok: true }));
    jest.spyOn(Common, 'getDeviceConfig').mockImplementation(() => Promise.resolve({ ok: true }));
    jest.spyOn(Common, 'getDeviceOta').mockImplementation(() => Promise.resolve({ ok: true }));

    jest.spyOn(Common, 'getDeviceLifetime').mockImplementation(() => Promise.resolve({ ok: false }));

    const result = await getAllStates(peripheralId);

    expect(result).toBeUndefined();
  });

  test('should return correct Yeti6GState', async () => {
    jest
      .spyOn(Common, 'getDeviceInfo')
      .mockImplementation(() => Promise.resolve({ ok: true, data: yeti6GState.device }));
    jest
      .spyOn(Common, 'getDeviceStatus')
      .mockImplementation(() => Promise.resolve({ ok: true, data: yeti6GState.status }));
    jest
      .spyOn(Common, 'getDeviceConfig')
      .mockImplementation(() => Promise.resolve({ ok: true, data: yeti6GState.config }));
    jest.spyOn(Common, 'getDeviceOta').mockImplementation(() => Promise.resolve({ ok: true, data: yeti6GState.ota }));
    jest
      .spyOn(Common, 'getDeviceLifetime')
      .mockImplementation(() => Promise.resolve({ ok: true, data: yeti6GState.lifetime }));

    const result = await getAllStates(peripheralId);

    expect(result).toEqual({
      device: yeti6GState.device,
      status: yeti6GState.status,
      config: yeti6GState.config,
      ota: yeti6GState.ota,
      lifetime: yeti6GState.lifetime,
    });
  });
});

describe('joinDirect', () => {
  test('should return "responseError" when error in getAllStates', async () => {
    Bluetooth.connectIfNeeded = jest.fn().mockResolvedValueOnce(false);

    const result = await joinDirect(peripheralId);

    expect(result).toEqual(Bluetooth.responseError);
  });

  test('should return success', async () => {
    jest.spyOn(Common, 'changeState').mockImplementation(() => Promise.resolve({ ok: true }));
    jest
      .spyOn(Common, 'getDeviceInfo')
      .mockImplementation(() => Promise.resolve({ ok: true, data: yeti6GState.device }));
    jest
      .spyOn(Common, 'getDeviceStatus')
      .mockImplementation(() => Promise.resolve({ ok: true, data: yeti6GState.status }));
    jest
      .spyOn(Common, 'getDeviceConfig')
      .mockImplementation(() => Promise.resolve({ ok: true, data: yeti6GState.config }));
    jest.spyOn(Common, 'getDeviceOta').mockImplementation(() => Promise.resolve({ ok: true, data: yeti6GState.ota }));
    jest
      .spyOn(Common, 'getDeviceLifetime')
      .mockImplementation(() => Promise.resolve({ ok: true, data: yeti6GState.lifetime }));

    const result = await joinDirect(peripheralId);

    expect(result).toBeUndefined();
  });
});

describe('getDeviceState', () => {
  test('should return "responseError" when falied connected to device', async () => {
    Bluetooth.connectIfNeeded = jest.fn().mockResolvedValueOnce(false);

    const result = await getDeviceState(peripheralId);

    expect(result).toEqual(Bluetooth.responseError);
  });

  test('should return "responseError" when getDeviceStatus return error ', async () => {
    jest.spyOn(Common, 'getDeviceStatus').mockImplementation(() => Promise.resolve({ ok: false }));

    const result = await getDeviceState(peripheralId);

    expect(result).toEqual(Bluetooth.responseError);
  });

  test('should return success', async () => {
    jest
      .spyOn(Common, 'getDeviceStatus')
      .mockImplementation(() => Promise.resolve({ ok: true, data: yeti6GState.status }));

    const result = await getDeviceState(peripheralId);

    expect(result).toEqual({ data: { status: yeti6GState.status }, ok: true });
  });
});

describe('getCloudConnectedNetwork', () => {
  test('should return "responseError" when getDeviceInfo return error', async () => {
    jest.spyOn(Common, 'getDeviceInfo').mockImplementation(() => Promise.resolve({ ok: false }));

    const result = await getCloudConnectedNetwork(peripheralId);

    expect(result).toEqual(Bluetooth.responseError);
  });

  test('should return "responseError" when not connected to the cloud', async () => {
    jest.spyOn(Common, 'getDeviceInfo').mockImplementation(() =>
      Promise.resolve({
        ok: true,
        data: yeti6GState.device,
      }),
    );

    const result = await getCloudConnectedNetwork(peripheralId);

    expect(result).toEqual(Bluetooth.responseError);
  });

  test('should return "responseError" when not have wlan ssid', async () => {
    jest.spyOn(Common, 'getDeviceInfo').mockImplementation(() =>
      Promise.resolve({
        ok: true,
        data: {
          ...yeti6GState.device,
          iot: {
            ...yeti6GState.device.iot,
            sta: {
              ...yeti6GState.device.iot.sta,
              wlan: {
                ...yeti6GState.device.iot.sta.wlan,
                ssid: '',
              },
              cloud: { ...yeti6GState.device.iot.sta.cloud, s: 1 },
            },
          },
        },
      }),
    );

    const result = await getCloudConnectedNetwork(peripheralId);

    expect(result).toEqual(Bluetooth.responseError);
  });

  test('should return network successful', async () => {
    jest.spyOn(Common, 'getDeviceInfo').mockImplementation(() =>
      Promise.resolve({
        ok: true,
        data: {
          ...yeti6GState.device,
          iot: {
            ...yeti6GState.device.iot,
            sta: {
              ...yeti6GState.device.iot.sta,
              cloud: { ...yeti6GState.device.iot.sta.cloud, s: 1 },
            },
          },
        },
      }),
    );

    const result = await getCloudConnectedNetwork(peripheralId);

    expect(result).toEqual({ ok: true, data: { network: yeti6GState.device.iot.sta.wlan.ssid } });
  });
});

describe('getWifiList', () => {
  test('should return "responseError" if can`t connect to device', async () => {
    Bluetooth.connectIfNeeded = jest.fn().mockResolvedValueOnce(false);

    const result = await getWifiList(peripheralId, false);

    expect(result).toEqual(Bluetooth.responseError);
  });

  test('should return "responseError" if can`t get getDeviceInfo', async () => {
    jest.spyOn(Common, 'getDeviceInfo').mockImplementation(() =>
      Promise.resolve({
        ok: false,
      }),
    );

    const result = await getWifiList(peripheralId, false);

    expect(result).toEqual(Bluetooth.responseError);
  });

  test('should return data if connected to the wlan', async () => {
    const deviceInfo = {
      ...yeti6GState.device,
      iot: {
        ...yeti6GState.device.iot,
        sta: {
          ...yeti6GState.device.iot.sta,
          wlan: { ...yeti6GState.device.iot.sta.wlan, s: 1 },
        },
      },
    };
    jest.spyOn(Common, 'getDeviceInfo').mockImplementation(() =>
      Promise.resolve({
        ok: true,
        data: deviceInfo,
      }),
    );
    jest.spyOn(Common, 'getDeviceStatus').mockImplementation(() =>
      Promise.resolve({
        ok: true,
        data: {
          ...yeti6GState.status,
          appOn: 1,
        },
      }),
    );

    const result = await getWifiList(peripheralId, false);

    expect(result).toEqual({ skipConnectToWifi: true, data: deviceInfo });
  });

  test('should return scanned networks', async () => {
    const deviceInfo = {
      ...yeti6GState.device,
      iot: {
        ...yeti6GState.device.iot,
        sta: {
          ...yeti6GState.device.iot.sta,
          m: 1,
        },
      },
    };
    jest.spyOn(Common, 'getDeviceInfo').mockImplementation(() =>
      Promise.resolve({
        ok: true,
        data: deviceInfo,
      }),
    );

    const result = await getWifiList(peripheralId, true);

    expect(result).toEqual({ data: deviceInfo.iot.sta.wlan.scanned });
  });

  test('should return empty list of scanned networks', async () => {
    const deviceInfo = {
      ...yeti6GState.device,
      iot: {
        ...yeti6GState.device.iot,
        sta: {
          ...yeti6GState.device.iot.sta,
          m: 1,
          wlan: {
            ...yeti6GState.device.iot.sta.wlan,
            scanned: undefined,
          },
        },
      },
    };
    jest.spyOn(Common, 'getDeviceInfo').mockImplementation(() =>
      Promise.resolve({
        ok: true,
        data: deviceInfo,
      }),
    );

    const result = await getWifiList(peripheralId, true);

    expect(result).toEqual({ data: undefined });
  });

  test('should return scanned networks after changeState', async () => {
    const deviceInfo = {
      ...yeti6GState.device,
      iot: {
        ...yeti6GState.device.iot,
        sta: {
          ...yeti6GState.device.iot.sta,
          m: 0,
        },
      },
    };
    jest.spyOn(Common, 'getDeviceInfo').mockImplementation(() =>
      Promise.resolve({
        ok: true,
        data: deviceInfo,
      }),
    );
    jest.spyOn(Common, 'changeState').mockImplementation(() =>
      Promise.resolve({
        ok: true,
        problem: null,
        originalError: null,
      }),
    );

    const result = await getWifiList(peripheralId, true);

    expect(result).toEqual({ data: deviceInfo });
  });
});

describe('joinWifi', () => {
  test('should return yeti info and connect to WiFi', async () => {
    jest.spyOn(Common, 'changeState').mockImplementation(() =>
      Promise.resolve({
        ok: true,
        data: {
          device: yeti6GState.device,
        },
        problem: null,
        originalError: null,
      }),
    );

    const result = await joinWifi(peripheralId, {
      iot: {
        sta: {
          m: 3,
          wlan: {
            ssid: '123',
            pass: '123',
          },
          cloud: {
            env: 'qwe',
            mqtt: 'qwe',
            api: 'qwe',
          },
        },
      },
    });

    expect(result).toEqual({
      ok: true,
      data: {
        name: yeti6GState.device?.identity?.thingName,
        model: parseModelFromHostId(yeti6GState.device?.identity?.hostId) || YetiModel.YETI_PRO_4000,
        hostId: yeti6GState.device?.identity?.hostId,
        macAddress: yeti6GState.device?.identity?.mac,
        platform: yeti6GState.device?.identity?.sn,
      },
    });
  });
});

describe('checkForError', () => {
  test('should return "responseError" if getDeviceInfo return error', async () => {
    jest.spyOn(Common, 'getDeviceInfo').mockImplementation(() =>
      Promise.resolve({
        ok: false,
      }),
    );

    const result = await checkForError(peripheralId);

    expect(result).toEqual({ ok: false, isBleError: true });
  });

  test('should return success error code', async () => {
    jest.spyOn(Common, 'getDeviceInfo').mockImplementation(() =>
      Promise.resolve({
        ok: true,
        data: {
          ...yeti6GState.device,
          iot: {
            ...yeti6GState.device.iot,
            sta: {
              ...yeti6GState.device.iot.sta,
              cloud: { ...yeti6GState.device.iot.sta.cloud, err: 1 },
              wlan: { ...yeti6GState.device.iot.sta.wlan, err: 1 },
            },
          },
        },
      }),
    );

    const result = await checkForError(peripheralId);

    expect(result).toEqual({ ok: true, data: { isError: true, cloudErrorCode: 1, wlanErrorCode: 1 } });
  });

  test('should return success no error code', async () => {
    jest.spyOn(Common, 'getDeviceInfo').mockImplementation(() =>
      Promise.resolve({
        ok: true,
        data: {
          ...yeti6GState.device,
          iot: {
            ...yeti6GState.device.iot,
            sta: {
              ...yeti6GState.device.iot.sta,
              cloud: { ...yeti6GState.device.iot.sta.cloud, err: 0 },
              wlan: { ...yeti6GState.device.iot.sta.wlan, err: 0 },
            },
          },
        },
      }),
    );

    const result = await checkForError(peripheralId);

    expect(result).toEqual({ ok: true, data: { isError: false, cloudErrorCode: 0, wlanErrorCode: 0 } });
  });
});
