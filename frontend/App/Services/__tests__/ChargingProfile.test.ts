import {
  getDefaultProfile,
  getPredefinedProfileNameBySetup,
  getProfileDefaultSetup,
  getProfileNameBySetup,
  isPredefinedProfile,
} from 'App/Services/ChargingProfile';
import { ChargeProfileType } from 'App/Types/ChargeProfile';
import { CHARGING_PROFILES_SETUP } from 'App/Config/ChargingProfile';

describe('ChargingProfile', () => {
  describe('getDefaultProfile', () => {
    test('should return the default profile when profileName is an empty string', () => {
      const profile = ChargeProfileType.Performance;
      const result = getDefaultProfile('', profile);

      expect(result).toBe(profile);
    });

    test('should return selected profile', () => {
      const profile = ChargeProfileType.Balanced;
      const result = getDefaultProfile(profile);

      expect(result).toEqual(CHARGING_PROFILES_SETUP[profile]);
    });

    test('should return undefined when profileName is not provided', () => {
      const result = getDefaultProfile(undefined);

      expect(result).toBeUndefined();
    });
  });

  describe('isPredefinedProfile', () => {
    test('should return true for a predefined profile', () => {
      const result = isPredefinedProfile(ChargeProfileType.Balanced);

      expect(result).toBeTruthy();
    });

    test('should return false for a non-predefined profile', () => {
      const result = isPredefinedProfile(ChargeProfileType.Custom);

      expect(result).toBeFalsy();
    });

    test('should return false for an unknown profile', () => {
      const result = isPredefinedProfile('unknown');

      expect(result).toBeUndefined();
    });
  });

  describe('getProfileDefaultSetup', () => {
    test('should return the default setup for a valid profile', () => {
      const result = getProfileDefaultSetup(ChargeProfileType.BatterySaver);

      expect(result).toBe(CHARGING_PROFILES_SETUP[ChargeProfileType.BatterySaver].setup);
    });

    test('should return undefined for an unknown profile', () => {
      const result = getProfileDefaultSetup('unknownProfile');

      expect(result).toBeUndefined();
    });
  });

  describe('getPredefinedProfileNameBySetup', () => {
    test('should return the profile name by setup', () => {
      const result = getPredefinedProfileNameBySetup({ min: 2, max: 95, re: 90 });

      expect(result).toBe(ChargeProfileType.Balanced);
    });

    test('should return undefined for a non-matching setup', () => {
      const result = getPredefinedProfileNameBySetup({ min: 0, max: 0, re: 0 });

      expect(result).toBeUndefined();
    });
  });

  describe('getProfileNameBySetup', () => {
    test('should return the predefined profile name for a matching setup', () => {
      const result = getProfileNameBySetup({ min: 0, max: 100, re: 95 });

      expect(result).toEqual(ChargeProfileType.Performance);
    });

    test('should return ChargeProfileType.Custom for a non-matching setup', () => {
      const result = getProfileNameBySetup(null);

      expect(result).toEqual(ChargeProfileType.Custom);
    });
  });
});
