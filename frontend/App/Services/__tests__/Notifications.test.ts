import {
  convertSeverityToCommonFormat,
  isNotificationEnabled,
  toggleNotificationValue,
} from 'App/Services/Notifications';

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
});
