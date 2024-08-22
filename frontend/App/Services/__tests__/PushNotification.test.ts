import AppConfig from 'App/Config/AppConfig';
import { onNotification, onRegister, setBadgeNumber, showLocalNotification } from 'App/Services/PushNotification';
import { NOTIFICATIONS } from 'App/Config/NavigationRoutes';

jest.mock('App/Navigation/AppNavigation', () => ({
  navigate: jest.fn(),
}));

describe('PushNotification', () => {
  test('should call setToken with the provided token', () => {
    const setToken = jest.fn();
    const token = 'iaufvyse69gv876958ha897d6arsge98756qw40r67qw';
    onRegister({ token }, setToken);

    expect(setToken).toHaveBeenCalledWith(token);
  });

  describe('onNotification', () => {
    test('should navigate to NOTIFICATIONS when userInteraction is true', () => {
      const { navigate } = require('App/Navigation/AppNavigation');
      const notification = { data: { userInteraction: true, thingName: 'ThingName' } };
      onNotification(notification, navigate);

      expect(navigate).toHaveBeenCalledWith(NOTIFICATIONS, { device: {} });
    });

    test('should call addNotification when userInteraction is false', () => {
      const addNotification = jest.fn();
      const notification = { data: { userInteraction: false, thingName: 'ThingName' } };
      onNotification(notification, addNotification);

      expect(addNotification).toHaveBeenCalledWith(notification);
    });
  });

  test('should call localNotification with the expected arguments', () => {
    const message = 'Message';
    const thingName = 'Thing Name';
    const type = 'Type';
    const severity = 'Severity';

    showLocalNotification(message, thingName, type, severity);
    const { localNotification } = require('react-native-push-notification');

    expect(localNotification).toHaveBeenCalledWith({
      message,
      channelId: AppConfig.androidNotificationChannelId,
      userInfo: {
        thingName,
        type,
        severity,
      },
    });
  });

  test('should set the application icon badge number based on unread notifications', () => {
    const notifications = [
      { id: 1, viewed: true },
      { id: 2, viewed: false },
      { id: 3, viewed: false },
    ];

    setBadgeNumber(notifications);
    const { setApplicationIconBadgeNumber } = require('react-native-push-notification');

    expect(setApplicationIconBadgeNumber).toHaveBeenCalledWith(2);
  });
});
