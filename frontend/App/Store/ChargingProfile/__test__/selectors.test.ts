import { getActiveProfileName, getCustomStoredProfile, getProfileInfo } from 'App/Store/ChargingProfile/selectors';
import { mockedState } from 'App/Fixtures/mocks/mockedState';
import { DEFAULT_PROFILE_NAME } from 'App/Config/ChargingProfile';
import { ChargeProfileType } from 'App/Types/ChargeProfile';

describe('ChargingProfile selectors', () => {
  const yeti6GName = mockedState.devicesInfo.data[1].thingName;
  describe('getActiveProfileName selector', () => {
    test('should return the active profile name from state', () => {
      const result = getActiveProfileName(mockedState, yeti6GName);

      expect(result).toBe(mockedState.activeProfiles[yeti6GName].name);
    });

    test('should return the default profile name if the profile is not found', () => {
      const result = getActiveProfileName(mockedState, 'fakeName');

      expect(result).toBe(DEFAULT_PROFILE_NAME);
    });
  });

  describe('getCustomStoredProfile selector', () => {
    test('should return the custom stored profile for a specific thingName', () => {
      const result = getCustomStoredProfile(mockedState, yeti6GName, mockedState.chargingProfile);

      expect(result).toEqual(mockedState.customProfiles[yeti6GName]);
    });

    test('should return a new custom stored profile if the thingName is not found', () => {
      const result = getCustomStoredProfile(mockedState, 'fakeName', mockedState.chargingProfile);

      expect(result).toEqual({ setup: mockedState.chargingProfile });
    });
  });

  describe('getProfileInfo selector', () => {
    test('should return profile info for a non-legacy Yeti device with predefined profile', () => {
      const result = getProfileInfo(yeti6GName)?.(mockedState);

      expect(result?.deviceProfileName).toBe(ChargeProfileType.Performance);
      expect(result?.deviceProfileSetup).toEqual({ min: 0, max: 100, re: 95 });
      expect(result?.storedActiveProfileName).toBe(ChargeProfileType.Performance);
      expect(result?.storedCustomSetup).toEqual({ min: 0, max: 100, re: 95 });
      expect(result?.isConnected).toBe(true);
    });

    test('should return profile info for a legacy Yeti device', () => {
      const result = getProfileInfo(mockedState.devicesInfo.data[0].thingName)?.(mockedState);

      expect(result?.deviceProfileName).toBe(ChargeProfileType.Balanced);
      expect(result?.deviceProfileSetup).toEqual({ min: 2, max: 95, re: 90 });
      expect(result?.storedActiveProfileName).toBe(ChargeProfileType.Performance);
      expect(result?.storedCustomSetup).toEqual({ min: 2, max: 95, re: 90 });
      expect(result?.isConnected).toBe(false);
    });
  });
});
