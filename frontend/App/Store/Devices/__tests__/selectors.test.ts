import { mockedState } from 'App/Fixtures/mocks/mockedState';
import {
  getChargingProfileSetup,
  getConnectedState,
  getCurrentDevice,
  getDeviceInfo,
  getDevicesInfoData,
} from 'App/Store/Devices/selectors';

describe('Devices selectors', () => {
  test('should return the data property from the state', () => {
    const result = getDevicesInfoData(mockedState);

    expect(result).toBe(mockedState.devicesInfo.data);
  });

  describe('getDeviceInfo selector', () => {
    test('should return device information based on thingName', () => {
      const { thingName } = mockedState.devicesInfo.data[1];

      const result = getDeviceInfo(mockedState.devicesInfo, thingName);

      expect(result).toEqual(mockedState.devicesInfo.data.find((device) => device.thingName === thingName));
    });

    test('should return an empty object for an unknown thingName', () => {
      const result = getDeviceInfo(mockedState.devicesInfo, 'unknownThingName');

      expect(result).toEqual({});
    });
  });

  describe('getChargingProfileSetup selector', () => {
    test('should return charging profile for a legacy Yeti device', () => {
      const { thingName } = mockedState.devicesInfo.data[0];

      const result = getChargingProfileSetup(mockedState.devicesInfo, thingName);

      expect(result).toEqual(
        mockedState.devicesInfo.data.find((device) => device.thingName === thingName)?.chargeProfile,
      );
    });

    test('should return charging profile setup for a non-legacy device', () => {
      const { thingName } = mockedState.devicesInfo.data[1];

      const result = getChargingProfileSetup(mockedState.devicesInfo, thingName);

      expect(result).toEqual({ max: 100, min: 0, re: 95 });
    });

    test('should return an empty object for an unknown device', () => {
      // Arrange: Create a mock devicesInfo data
      const devicesInfo = {
        data: [
          { thingName: 'Device1' /* Other properties */ },
          { thingName: 'Device2' /* Other properties */ },
          // Add more device objects as needed
        ],
      };

      const unknownThingName = 'UnknownDevice'; // A thingName that doesn't exist

      // Act: Call the selector function with the mock data and the unknown thingName
      const result = getChargingProfileSetup(devicesInfo, unknownThingName);

      // Assert: Check that the selector returns an empty object for an unknown device
      expect(result).toEqual({});
    });
  });

  test('should return the connected state for a connected device', () => {
    const { thingName } = mockedState.devicesInfo.data[1];

    const result = getConnectedState(mockedState.devicesInfo, thingName);

    expect(result).toBe(true);
  });

  describe('getCurrentDevice selector', () => {
    test('should return the current device when it exists', () => {
      const { data } = mockedState.devicesInfo;

      const result = getCurrentDevice(data[0].thingName)?.(mockedState);

      expect(result).toEqual(data[0]);
    });

    test('should return an empty object for an unknown thingName', () => {
      const result = getCurrentDevice('unknownThingName')?.(mockedState);

      expect(result).toEqual({});
    });
  });
});
