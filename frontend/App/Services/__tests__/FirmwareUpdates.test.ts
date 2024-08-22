import {
  getNodeName,
  getUpdateStatus,
  isCheckUpdateTimedOut,
  isLatestVersion,
  isSupportDirectConnection,
  removeVersionLeadingZeros,
} from 'App/Services/FirmwareUpdates';
import semver from 'semver';

describe('FirmwareUpdates', () => {
  afterEach(() => {
    jest.restoreAllMocks();
  });

  describe('removeVersionLeadingZeros', () => {
    test('should remove leading zeros from version numbers', () => {
      expect(removeVersionLeadingZeros('1.08.7')).toBe('1.8.7');
    });

    test('should handle empty input', () => {
      expect(removeVersionLeadingZeros()).toBe('0.0.0');
    });
  });

  describe('isLatestVersion', () => {
    test('should return true if the current version is greater than or equal to the updatesInfo version', () => {
      expect(isLatestVersion('1.0.0', { version: '0.9.9' })).toBeTruthy();
    });

    test('should return false if the current version is less than the updatesInfo version', () => {
      expect(isLatestVersion('0.9.9', { version: '1.0.0' })).toBeFalsy();
    });

    test('should return false if an error occurs', () => {
      jest.spyOn(semver, 'gte').mockImplementation(() => {
        throw new Error('Some error');
      });
      const result = isLatestVersion('1.0.0', { version: '2.0.0' });
      expect(result).toBeFalsy();
    });
  });

  describe('isCheckUpdateTimedOut', () => {
    test('should return true if lastNotification is missing', () => {
      const thing = { lastNotification: null };
      const info = { version: '1.0.0' };

      const result = isCheckUpdateTimedOut(thing, info);
      expect(result).toBeTruthy();
    });

    test('should return true if version is missing', () => {
      const thing = { lastNotification: null };
      const info = { version: null };

      const result = isCheckUpdateTimedOut(thing, info);
      expect(result).toBeTruthy();
    });

    test('should return true if the version is not the latest', () => {
      const thing = { lastNotification: { version: '0.9.0', time: new Date() } };
      const info = { version: '1.0.0' };

      const result = isCheckUpdateTimedOut(thing, info);
      expect(result).toBeTruthy();
    });

    test('should return false if none of the timeout conditions are met', () => {
      const currentDateTime = new Date();
      const lastNotificationTime = new Date(currentDateTime - 1000);
      const thing = { lastNotification: { version: '1.0.0', time: lastNotificationTime } };
      const info = { version: '1.0.0' };

      const result = isCheckUpdateTimedOut(thing, info);
      expect(result).toBeFalsy();
    });
  });

  describe('isSupportDirectConnection', () => {
    test('should return true when version is greater than minFirmwareVersionForDirectConnect', () => {
      const version = '1.0.0';
      const minFirmwareVersionForDirectConnect = '0.5.0';

      const result = isSupportDirectConnection(version, minFirmwareVersionForDirectConnect);
      expect(result).toBeTruthy();
    });

    test('should return true when version is equal to minFirmwareVersionForDirectConnect', () => {
      const version = '1.0.0';
      const minFirmwareVersionForDirectConnect = '1.0.0';

      const result = isSupportDirectConnection(version, minFirmwareVersionForDirectConnect);
      expect(result).toBeTruthy();
    });

    test('should return false when an error occurs during version comparison', () => {
      const version = 'invalid';
      const minFirmwareVersionForDirectConnect = '0.5.0';

      const result = isSupportDirectConnection(version, minFirmwareVersionForDirectConnect);
      expect(result).toBeFalsy();
    });

    test('should return false when version is less than minFirmwareVersionForDirectConnect', () => {
      const version = '0.2.0';
      const minFirmwareVersionForDirectConnect = '0.5.0';

      const result = isSupportDirectConnection(version, minFirmwareVersionForDirectConnect);
      expect(result).toBe(false);
    });
  });

  describe('getUpdateStatus', () => {
    test('returns the correct status for a valid code', () => {
      const code = 53;
      const expectedStatus = 'OTA failed';

      const result = getUpdateStatus(code);
      expect(result).toBe(expectedStatus);
    });

    test('returns null for an unknown code', () => {
      const code = 123;
      const result = getUpdateStatus(code);
      expect(result).toBeNull();
    });

    test('returns null for a negative code', () => {
      const code = -1;

      const result = getUpdateStatus(code);
      expect(result).toBeNull();
    });
  });

  describe('getNodeName', () => {
    test('should return "PCU" for a key matching /A\\d+-1/g', () => {
      const key = 'N-37500-A1-1-123';
      const result = getNodeName(key);
      expect(result).toBe('PCU');
    });

    test('should return "WMU" for a key matching /A\\d+-2/g', () => {
      const key = 'N-37500-A2-2-456';
      const result = getNodeName(key);
      expect(result).toBe('WMU');
    });

    test('should return "BMS" for a key matching /B\\d+-1/g', () => {
      const key = 'N-37500-B1-1-789';
      const result = getNodeName(key);
      expect(result).toBe('BMS');
    });

    test('should return "MPPT" for a key matching /C\\d+-1/g', () => {
      const key = 'N-37500-C1-1-987';
      const result = getNodeName(key);
      expect(result).toBe('MPPT');
    });

    test('should return "InvLv" for a key matching /D\\d+-1/g', () => {
      const key = 'N-37500-D1-1-654';
      const result = getNodeName(key);
      expect(result).toBe('InvLv');
    });

    test('should return "InvHv" for a key matching /D\\d+-2/g', () => {
      const key = 'N-37500-D2-2-321';
      const result = getNodeName(key);
      expect(result).toBe('InvHv');
    });

    test('should return "Node" for an unknown key format', () => {
      const key = 'N-37500-X3-3-123'; // This key doesn't match any of the defined formats
      const result = getNodeName(key);
      expect(result).toBe('Node');
    });

    test('should return "Node" for an empty key', () => {
      const key = 'N-37500-';
      const result = getNodeName(key);
      expect(result).toBe('Node');
    });

    test('should return "Node" for a key without a hyphen', () => {
      const key = 'N-37500-E7123'; // This key doesn't match any of the defined formats
      const result = getNodeName(key);
      expect(result).toBe('Node');
    });
  });
});
