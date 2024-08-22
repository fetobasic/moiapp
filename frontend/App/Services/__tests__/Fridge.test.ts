import { store } from 'App/Store';
import Fridge from '../Fridge';
import { FridgeData } from 'App/Types/Fridge';

describe('getResponseType', () => {
  test('should return UNKNOWN when byte0 and byte1 are not 0xfe', () => {
    const data = [0x00, 0x00, 0x21, 0x01];
    const result = Fridge.getResponseType(data);
    expect(result).toBe('UNKNOWN');
  });

  test('should return UNKNOWN when byte2 and byte3 are not known', () => {
    const data = [0xfe, 0xfe, 0x00, 0x00];
    const result = Fridge.getResponseType(data);
    expect(result).toBe('UNKNOWN');
  });

  test('should return BIND when byte2 is 0x04 and byte3 is 0x00', () => {
    const data = [0xfe, 0xfe, 0x04, 0x00];
    const result = Fridge.getResponseType(data);
    expect(result).toBe('BIND');
  });

  test('should return GET_SETTING when byte2 is 0x21 and byte3 is 0x01', () => {
    const data = [0xfe, 0xfe, 0x21, 0x01];
    const result = Fridge.getResponseType(data);
    expect(result).toBe('GET_SETTING');
  });

  test('should return SET_SETTING when byte2 is 0x21 and byte3 is 0x02', () => {
    const data = [0xfe, 0xfe, 0x21, 0x02];
    const result = Fridge.getResponseType(data);
    expect(result).toBe('SET_SETTING');
  });

  test('should return RESTORE_FACTORY_SETTING when byte2 is 0x21 and byte3 is 0x04', () => {
    const data = [0xfe, 0xfe, 0x21, 0x04];
    const result = Fridge.getResponseType(data);
    expect(result).toBe('RESTORE_FACTORY_SETTING');
  });

  test('should return LEFT_SET_TEMP when byte2 is 0x04 and byte3 is 0x05', () => {
    const data = [0xfe, 0xfe, 0x04, 0x05];
    const result = Fridge.getResponseType(data);
    expect(result).toBe('LEFT_SET_TEMP');
  });

  test('should return RIGHT_SET_TEMP when byte2 is 0x04 and byte3 is 0x06', () => {
    const data = [0xfe, 0xfe, 0x04, 0x06];
    const result = Fridge.getResponseType(data);
    expect(result).toBe('RIGHT_SET_TEMP');
  });
});

describe('storeData', () => {
  test('should store data when data length is equal to CHUNK_SIZE', () => {
    const name = 'Fridge';
    const peripheralId = '123';
    const rawData = [
      0xfe, 0xfe, 0x21, 0x01, 0xfe, 0xfe, 0x04, 0x06, 0xfe, 0xfe, 0x04, 0x06, 0xfe, 0x00, 0xfe, 0x04, 0x06, 0xfe, 0x00,
      0x00,
    ];

    Fridge.storeData(name, peripheralId, rawData);
    expect(Fridge.getLatestData()).toEqual(rawData);
  });

  test('should return GET_SETTING state', () => {
    const name = 'gzf1-80';
    const peripheralId = '123';
    const rawData = [0xfe, 0xfe, 0x04, 0x06, 0xfe, 0xfe, 0x04, 0x06, 0xfe, 0xfe, 0x04, 0x06, 0xfe, 0x00, 0xfe, 0x04];

    Fridge.storeData(name, peripheralId, rawData);
    expect(Fridge.getLatestData()).toEqual([]);
  });

  test('should return SET_SETTING state', () => {
    const name = 'gzf1-50';
    const peripheralId = '123';
    const firstChunck = [
      0xfe, 0xfe, 0x21, 0x02, 0xfe, 0xfe, 0x04, 0x06, 0xfe, 0xfe, 0x04, 0x06, 0xfe, 0x00, 0xfe, 0x04, 0x06, 0xfe, 0x00,
      0x00,
    ];
    Fridge.storeData(name, peripheralId, firstChunck);

    const rawData = [0xfe, 0xfe, 0x04, 0x06, 0xfe, 0xfe, 0x04, 0x06, 0xfe, 0xfe, 0x04, 0x06, 0xfe, 0x00, 0xfe, 0x04];
    Fridge.storeData(name, peripheralId, rawData);
    expect(Fridge.getLatestData()).toEqual([]);
  });

  test('should return RESTORE_FACTORY_SETTING state', () => {
    jest.spyOn(store, 'getState').mockReturnValue({
      // @ts-ignore
      devicesInfo: {
        data: [
          {
            thingName: 'a1-',
            model: 'a1-',
            peripheralId: '123',
            isConnected: true,
            dateSync: new Date().toString(),
            data: {} as FridgeData,
          },
        ],
      },
    });
    const name = 'a1-';
    const peripheralId = '123';
    const firstChunck = [
      0xfe, 0xfe, 0x21, 0x04, 0xfe, 0xfe, 0x04, 0x06, 0xfe, 0xfe, 0x04, 0x06, 0xfe, 0x00, 0xfe, 0x04, 0x06, 0xfe, 0x00,
      0x00,
    ];
    Fridge.storeData(name, peripheralId, firstChunck);

    const rawData = [0xfe, 0xfe, 0x04, 0x06, 0xfe, 0xfe, 0x04, 0x06, 0xfe, 0xfe, 0x04, 0x06, 0xfe, 0x00, 0xfe, 0x04];
    Fridge.storeData(name, peripheralId, rawData);
    expect(Fridge.getLatestData()).toEqual([]);
  });

  test('should return Undefined because can`t find device', () => {
    const name = 'gzf1-80';
    const peripheralId = '123';

    const rawData = [0xfe, 0xfe, 0x04, 0x06, 0xfe, 0xfe, 0x04];
    const result = Fridge.storeData(name, peripheralId, rawData);
    expect(result).toBeUndefined();
  });

  test('should return LEFT_SET_TEMP state', () => {
    jest.spyOn(store, 'getState').mockReturnValue({
      // @ts-ignore
      devicesInfo: {
        data: [
          {
            thingName: 'gzf1-80',
            model: 'gzf1-80',
            peripheralId: '123',
            isConnected: true,
            dateSync: new Date().toString(),
            data: {} as FridgeData,
          },
        ],
      },
    });

    const name = 'gzf1-80';
    const peripheralId = '123';

    const rawData = [0xfe, 0xfe, 0x04, 0x05, 0xfe, 0xfe, 0x04];
    Fridge.storeData(name, peripheralId, rawData);
    expect(Fridge.getLatestData()).toEqual([]);
  });

  test('should return RIGHT_SET_TEMP state', () => {
    jest.spyOn(store, 'getState').mockReturnValue({
      // @ts-ignore
      devicesInfo: {
        data: [
          {
            thingName: 'gzf1-50',
            model: 'gzf1-50',
            peripheralId: '123',
            isConnected: true,
            dateSync: new Date().toString(),
            data: {} as FridgeData,
          },
        ],
      },
    });

    const name = 'gzf1-50';
    const peripheralId = '123';

    const rawData = [0xfe, 0xfe, 0x04, 0x06, 0xfe, 0xfe, 0x04];
    Fridge.storeData(name, peripheralId, rawData);
    expect(Fridge.getLatestData()).toEqual([]);
  });
});
