import {
  getGroupedNotifications,
  getIsNotificationsEnabled,
  getNotifications,
  getToken,
} from 'App/Store/Notification/selectors';
import { mockedState } from 'App/Fixtures/mocks/mockedState';
import { initialState } from 'App/Store/Notification/reducers';

describe('Notification selectors', () => {
  test('should return the token from the state', () => {
    const selectedToken = getToken(mockedState);

    expect(selectedToken).toEqual(mockedState.notification.token);
  });

  test('should return the isEnabled value from the state', () => {
    const selectedValue = getIsNotificationsEnabled(mockedState);

    expect(selectedValue).toEqual(mockedState.notification.isEnabled);
  });

  describe('getNotifications', () => {
    test('should return the notifications array from the state', () => {
      const selectedNotifications = getNotifications(mockedState);

      expect(selectedNotifications).toEqual(mockedState.notification.notifications);
    });

    test('should return an empty array if notifications are not present in the state', () => {
      const state = { notification: {} };
      const selectedNotifications = getNotifications(state);

      expect(selectedNotifications).toEqual([]);
    });
  });

  describe('getGroupedNotifications', () => {
    it('should return grouped notifications based on selected devices and types', () => {
      const selectedDevices = ['DeviceA', 'DeviceB'];
      const selectedNotificationTypes = ['Info', 'Warning', 'Error'];

      getNotifications = jest.fn(() => [
        { thingName: 'DeviceA', severity: 'Info', viewed: true },
        { thingName: 'DeviceB', severity: 'Warning', viewed: true },
        { thingName: 'DeviceA', severity: 'Error', viewed: false },
        { thingName: 'DeviceC', severity: 'Info', viewed: false },
      ]);

      const groupedNotifications = getGroupedNotifications(selectedDevices, selectedNotificationTypes)(initialState);

      expect(groupedNotifications.viewed).toEqual([
        { thingName: 'DeviceA', severity: 'Info', viewed: true },
        { thingName: 'DeviceB', severity: 'Warning', viewed: true },
      ]);
      expect(groupedNotifications.unviewed).toEqual([{ thingName: 'DeviceA', severity: 'Error', viewed: false }]);
    });
  });
});
