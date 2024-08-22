/*eslint no-bitwise: "off"*/

import { SeverityType, StoredNotificationType } from 'App/Types/Notification';
import {
  convertSeverityToCommonFormat,
  getSeverityColor,
  getSeverityIcon,
  getSeverityTitle,
  getSeverityTopLineColor,
  isNotificationEnabled,
  toggleNotificationValue,
} from 'App/Services/Notifications';
import { Colors } from 'App/Themes';
import ErrorIcon from 'App/Images/Icons/cancel.svg';
import WarningIcon from 'App/Images/Icons/warningNotification.svg';
import InfoIcon from 'App/Images/Icons/info.svg';
import NoticeIcon from 'App/Images/Icons/logo.svg';
import { NotificationType } from 'App/Config/Notifications';

jest.useFakeTimers();

const bit5 = 5;
const bit35 = 35;

describe('Notifications', () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('test isNotificationEnabled', () => {
    describe('legacy', () => {
      test('should be false', () => {
        const isEnabled = isNotificationEnabled(0, bit5, false);
        expect(isEnabled).toEqual(false);
      });

      test('should be true', () => {
        const notifyState = 0;
        const addToNotifyState = notifyState ^ (2 ** bit5);
        const isEnabled = isNotificationEnabled(addToNotifyState, bit5, false);
        expect(isEnabled).toEqual(true);
      });
    });

    describe('yeti6g', () => {
      test('should be false for Yeti 6g, bit <= 32', () => {
        const isEnabled = isNotificationEnabled([0, 0], bit5, true);
        expect(isEnabled).toEqual(false);
      });

      test('should be true for Yeti 6g, bit <= 32', () => {
        const notifyState = 0;
        const addToNotifyState: number[] = [notifyState ^ (2 ** bit5), 0];
        const isEnabled = isNotificationEnabled(addToNotifyState, bit5, true);
        expect(isEnabled).toEqual(true);
      });

      test('should be true for Yeti 6g, bit > 32', () => {
        const notifyState = 0;
        const val = bit35 - 32;
        const addToNotifyState: number[] = [0, notifyState ^ (2 ** val)];
        const isEnabled = isNotificationEnabled(addToNotifyState, bit35, true);
        expect(isEnabled).toEqual(true);
      });
    });
  });

  describe('test toggleNotificationValue', () => {
    describe('legacy', () => {
      test('toggle value is 5', () => {
        const toggleVal = toggleNotificationValue(0, bit5, false);
        expect(toggleVal).toEqual(2 ** bit5);
      });

      test('toggle/untoggle value is initial 0', () => {
        const toggleVal = toggleNotificationValue(0, bit5, false);
        const initVal = toggleNotificationValue(toggleVal, bit5, false);

        expect(initVal).toEqual(0);
      });
    });

    describe('yeti6g', () => {
      test('toggle value is 5, bit <= 32', () => {
        const toggleVal = toggleNotificationValue([0, 0], bit5, true);
        expect(toggleVal).toEqual([32, 0]);
      });

      test('toggle/untoggle value is 5 (<= 32), initial 0', () => {
        const toggleVal = toggleNotificationValue([0, 0], bit5, true);
        const initVal = toggleNotificationValue(toggleVal, bit5, true);

        expect(initVal).toEqual([0, 0]);
      });

      test('toggle value is 35, bit <= 32', () => {
        const toggleVal = toggleNotificationValue([0, 0], bit35, true);
        expect(toggleVal).toEqual([0, 2 ** 3]);
      });

      test('toggle/untoggle value is 35 (>32), initial 0', () => {
        const toggleVal = toggleNotificationValue([0, 0], bit35, true);
        const initVal = toggleNotificationValue(toggleVal, bit35, true);

        expect(initVal).toEqual([0, 0]);
      });
    });
  });

  describe('test convertSeverityToCommonFormat', () => {
    test('should returns warn when passed HIGH_AC_PORT_CURRENT', () => {
      const result = convertSeverityToCommonFormat('HIGH_AC_PORT_CURRENT');
      expect(result).toEqual('warn');
    });

    test('should returns error when passed HIGH_AC_PORT_CURRENT', () => {
      const result = convertSeverityToCommonFormat('AC_PORT_OVERLOAD_PROTECT');
      expect(result).toEqual('error');
    });

    test('should returns info when passed highPowerOut', () => {
      const result = convertSeverityToCommonFormat('highPowerOut');
      expect(result).toEqual('info');
    });
  });

  describe('getSeverityColor', () => {
    test('should return the correct color for a valid severity', () => {
      const result = getSeverityColor(SeverityType.NOTICE);

      expect(result).toBe(Colors.severity.green);
    });

    test('should return the default color for an invalid severity', () => {
      const result = getSeverityColor('invalidSeverity');

      expect(result).toBe(Colors.severity.gray);
    });
  });

  describe('getSeverityTopLineColor', () => {
    test('should return the correct top line color for a valid severity', () => {
      const result = getSeverityTopLineColor(SeverityType.INFO);

      expect(result).toBe(Colors.notification.lightBlue);
    });

    test('should return the default color for an invalid severity', () => {
      const result = getSeverityTopLineColor('invalidSeverity');

      expect(result).toBe(Colors.severity.gray);
    });
  });

  describe('getSeverityTitle', () => {
    test('should return "Critical" for SeverityType.ERROR', () => {
      const result = getSeverityTitle(SeverityType.ERROR);
      expect(result).toBe('Critical');
    });

    test('should return "Critical" for SeverityType.EMERGENCY', () => {
      const result = getSeverityTitle(SeverityType.EMERGENCY);
      expect(result).toBe('Critical');
    });

    test('should return "Insight" for SeverityType.NOTICE', () => {
      const result = getSeverityTitle(SeverityType.NOTICE);
      expect(result).toBe('Insight');
    });

    test('should return "Warning" for SeverityType.WARNING', () => {
      const result = getSeverityTitle(SeverityType.WARNING);
      expect(result).toBe('Warning');
    });

    test('should return "Information" for any other severity type', () => {
      const result = getSeverityTitle(SeverityType.INFO);
      expect(result).toBe('Information');
    });

    test('should return "Information" for an unknown severity type', () => {
      const result = getSeverityTitle('UnknownSeverityType');
      expect(result).toBe('Information');
    });
  });

  describe('getSeverityIcon', () => {
    test('should return an ErrorIcon for ERROR and EMERGENCY severity', () => {
      const errorIcon = getSeverityIcon(SeverityType.ERROR);
      const emergencyIcon = getSeverityIcon(SeverityType.EMERGENCY);

      expect(errorIcon.type).toBe(ErrorIcon);
      expect(emergencyIcon.type).toBe(ErrorIcon);
    });

    test('should return a NoticeIcon for NOTICE severity', () => {
      const noticeIcon = getSeverityIcon(SeverityType.NOTICE);

      expect(noticeIcon.type).toBe(NoticeIcon);
    });

    test('should return a WarningIcon for WARNING severity', () => {
      const warningIcon = getSeverityIcon(SeverityType.WARNING);

      expect(warningIcon.type).toBe(WarningIcon);
    });

    test('should return an InfoIcon for INFO and other severities', () => {
      const infoIcon = getSeverityIcon(SeverityType.INFO);
      const otherSeverityIcon = getSeverityIcon('SOME_OTHER_SEVERITY');

      expect(infoIcon.type).toBe(InfoIcon);
      expect(otherSeverityIcon.type).toBe(InfoIcon);
    });
  });

  describe('convertSeverityToCommonFormat', () => {
    test('should return SeverityType.ERROR for NotificationType.ALERT', () => {
      const result = convertSeverityToCommonFormat(StoredNotificationType.FIRMWARE_UPDATE_AVAILABLE);

      expect(result).toBe(SeverityType.INFO);
    });

    test('should return SeverityType.INFO for NotificationType.WARNING', () => {
      const result = convertSeverityToCommonFormat(
        StoredNotificationType.FIRMWARE_UPDATE_AVAILABLE,
        NotificationType.WARNING,
      );

      expect(result).toBe(SeverityType.INFO);
    });

    test('should return SeverityType.WARNING for NotificationType.INFORMATION', () => {
      const result = convertSeverityToCommonFormat(NotificationType.INFORMATION);

      expect(result).toBe(SeverityType.WARNING);
    });

    test('should return provided severity for unknown notification type', () => {
      const result = convertSeverityToCommonFormat('UNKNOWN_TYPE', SeverityType.INFO);

      expect(result).toBe(SeverityType.INFO);
    });

    test('should return provided severity for undefined notification type', () => {
      const result = convertSeverityToCommonFormat(undefined, SeverityType.INFO);

      expect(result).toBe(SeverityType.INFO);
    });
  });
});
