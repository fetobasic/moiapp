import {
  deviceExists,
  doesThingNameExist,
  doesUsedAnywhereConnectExist,
  removeInvalidThings,
  setAnywhereConnect,
  setDirectConnectByName,
} from 'App/Services/Devices';

describe('Devices', () => {
  describe('deviceExists', () => {
    test('should return false when the devices array is empty', () => {
      const devices = [];
      const thingName = 'device123';

      const result = deviceExists(devices, thingName);

      expect(result).toBeFalsy();
    });

    test('should return true when the device exists in the devices array', () => {
      const devices = [
        { thingName: 'device123', otherProperty: 'value1' },
        { thingName: 'device456', otherProperty: 'value2' },
      ];
      const thingName = 'device123';

      const result = deviceExists(devices, thingName);

      expect(result).toBeTruthy();
    });

    test('should return false when the device does not exist in the devices array', () => {
      const devices = [
        { thingName: 'device789', otherProperty: 'value3' },
        { thingName: 'device987', otherProperty: 'value4' },
      ];
      const thingName = 'device123';

      const result = deviceExists(devices, thingName);

      expect(result).toBeFalsy();
    });
  });

  describe('removeInvalidThings', () => {
    test('should return an empty array if no things are provided', () => {
      const things = [];

      const result = removeInvalidThings(things);

      expect(result).toEqual([]);
    });

    test('should remove things with a falsy model property', () => {
      const things = [
        { model: 'validModel', otherProperty: 'value1' },
        { model: '', otherProperty: 'value2' },
        { model: 'validModel', otherProperty: 'value3' },
      ];

      const result = removeInvalidThings(things);

      expect(result).toEqual([things[0], things[2]]);
    });
  });

  describe('doesThingNameExist', () => {
    const sampleDevices = [
      { thingName: 'device123', name: 'Name 1' },
      { thingName: 'device456', name: 'Name 2' },
      { thingName: 'device789', name: 'Name 3' },
    ];

    test('should return false when the devices array is empty', () => {
      const devices = [];
      const thingName = 'device123';

      const result = doesThingNameExist(devices, thingName);

      expect(result).toBeFalsy();
    });

    test('should return false when the thingName does not exist in the devices array', () => {
      const devices = sampleDevices;
      const thingName = 'nonExistentDevice';

      const result = doesThingNameExist(devices, thingName);

      expect(result).toBe(false);
    });

    test('should return true when the thingName exists in the devices array', () => {
      const devices = sampleDevices;
      const thingName = 'device123';

      const result = doesThingNameExist(devices, thingName);

      expect(result).toBe(true);
    });
  });

  describe('doesUsedAnywhereConnectExist', () => {
    const sampleDevices = [
      { thingName: 'device123', usedAnywhereConnect: true },
      { thingName: 'device456', usedAnywhereConnect: false },
      { thingName: 'device789', usedAnywhereConnect: null },
    ];

    test('should return false when the devices array is empty', () => {
      const devices = [];
      const thingName = 'device123';

      const result = doesUsedAnywhereConnectExist(devices, thingName);

      expect(result).toBe(false);
    });

    test('should return false when the thingName does not exist in the devices array', () => {
      const devices = sampleDevices;
      const thingName = 'nonExistentDevice';

      const result = doesUsedAnywhereConnectExist(devices, thingName);

      expect(result).toBe(false);
    });

    test('should return false when the usedAnywhereConnect parameter does not exist in the device', () => {
      const devices = sampleDevices;
      const thingName = 'device789';

      const result = doesUsedAnywhereConnectExist(devices, thingName);

      expect(result).toBe(false);
    });

    test('should return true when the usedAnywhereConnect parameter exists and is truthy in the device', () => {
      const devices = sampleDevices;
      const thingName = 'device123';

      const result = doesUsedAnywhereConnectExist(devices, thingName);

      expect(result).toBe(true);
    });
  });

  describe('setDirectConnectByName', () => {
    const sampleDevices = [
      { thingName: 'device123', isDirectConnection: false, isConnected: false },
      { thingName: 'device456', isDirectConnection: false, isConnected: false },
      { thingName: 'device789', isDirectConnection: false, isConnected: false },
    ];

    test('should not modify the devices when the provided thingName is not found', () => {
      const devices = sampleDevices;
      const thingName = 'nonExistentDevice';

      const result = setDirectConnectByName(devices, thingName);

      expect(result).toEqual(devices);
    });

    test('should set isDirectConnection and isConnected to true for the specified thingName', () => {
      const devices = sampleDevices;
      const thingName = 'device456';

      const result = setDirectConnectByName(devices, thingName);

      const expectedDevices = [
        { thingName: 'device123', isDirectConnection: false, isConnected: false },
        { thingName: 'device456', isDirectConnection: true, isConnected: true },
        { thingName: 'device789', isDirectConnection: false, isConnected: false },
      ];

      expect(result).toEqual(expectedDevices);
    });

    test('should set isDirectConnection and isConnected to true for the specified thingName in a different set of devices', () => {
      const devices = [
        { thingName: 'deviceABC', isDirectConnection: false, isConnected: false },
        { thingName: 'deviceXYZ', isDirectConnection: false, isConnected: false },
        { thingName: 'device123', isDirectConnection: false, isConnected: false },
      ];
      const thingName = 'deviceXYZ';

      const result = setDirectConnectByName(devices, thingName);

      const expectedDevices = [
        { thingName: 'deviceABC', isDirectConnection: false, isConnected: false },
        { thingName: 'deviceXYZ', isDirectConnection: true, isConnected: true },
        { thingName: 'device123', isDirectConnection: false, isConnected: false },
      ];

      expect(result).toEqual(expectedDevices);
    });
  });

  describe('setAnywhereConnect', () => {
    const sampleDevices = [
      { thingName: 'device123', dataTransferType: 'wifi', isDirectConnection: true },
      { thingName: 'device456', dataTransferType: 'cellular', isDirectConnection: true },
      { thingName: 'device789', dataTransferType: 'wifi', isDirectConnection: false },
    ];

    test('should set isDirectConnection to false for devices with dataTransferType "wifi"', () => {
      const result = setAnywhereConnect(sampleDevices);

      const expectedDevices = [
        { thingName: 'device123', dataTransferType: 'wifi', isDirectConnection: false },
        { thingName: 'device456', dataTransferType: 'cellular', isDirectConnection: true },
        { thingName: 'device789', dataTransferType: 'wifi', isDirectConnection: false },
      ];

      expect(result).toEqual(expectedDevices);
    });

    test('should not modify devices with dataTransferType other than "wifi"', () => {
      sampleDevices[0].dataTransferType = 'cellular';
      sampleDevices[2].dataTransferType = 'bluetooth';

      const result = setAnywhereConnect(sampleDevices);

      const expectedDevices = [
        { thingName: 'device123', dataTransferType: 'cellular', isDirectConnection: true },
        { thingName: 'device456', dataTransferType: 'cellular', isDirectConnection: true },
        { thingName: 'device789', dataTransferType: 'bluetooth', isDirectConnection: false },
      ];

      expect(result).toEqual(expectedDevices);
    });

    test('should not modify an empty array of devices', () => {
      const devices = [];

      const result = setAnywhereConnect(devices);

      expect(result).toEqual([]);
    });
  });
});
