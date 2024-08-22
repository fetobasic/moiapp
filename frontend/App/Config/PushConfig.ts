import { PermissionsAndroid } from 'react-native';
import PushNotification from 'react-native-push-notification';

import { onRegister, onNotification, AppPushNotification } from 'App/Services/PushNotification';
import { isAndroid } from 'App/Themes';
import Logger from 'App/Services/Logger';
import AppConfig from './AppConfig';

// https://github.com/zo0r/react-native-push-notification
export const Notification = (
  setToket: (token: string) => void,
  addNotification: (notification: AppPushNotification) => void,
) => {
  PushNotification.configure({
    // (optional) Called when Token is generated (iOS and Android)
    onRegister: (obj) => onRegister(obj, setToket),
    // (required) Called when a remote or local notification is opened or received
    onNotification: (notification: unknown) => onNotification(notification as AppPushNotification, addNotification),

    // IOS ONLY (optional): default: all - Permissions to register.
    permissions: {
      alert: true,
      badge: true,
      sound: true,
    },

    // Should the initial notification be popped automatically
    // default: true
    // Leave this off unless you have good reason.
    popInitialNotification: isAndroid,

    requestPermissions: true,
  });

  if (isAndroid) {
    PushNotification.channelExists(AppConfig.androidNotificationChannelId, (exists) => {
      if (!exists) {
        PushNotification.createChannel(
          {
            channelId: AppConfig.androidNotificationChannelId,
            channelName: 'MoiApp',
          },
          () => Logger.debug('Android Channel Created'),
        );
      }
    });

    PermissionsAndroid.request(PermissionsAndroid.PERMISSIONS.POST_NOTIFICATIONS);
  }
};
