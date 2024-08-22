import PushNotification, { ReceivedNotification } from 'react-native-push-notification';
import PushNotificationIOS from '@react-native-community/push-notification-ios';
import { filter, pathOr } from 'ramda';

import { NOTIFICATIONS } from 'App/Config/NavigationRoutes';

import { navigate } from 'App/Navigation/AppNavigation';
import { isAndroid } from 'App/Themes';
import AppConfig from 'App/Config/AppConfig';
import Logger from './Logger';
import type { SeverityType, StoredNotification } from 'App/Types/Notification';
import { devicesSelectors } from 'App/Store/Devices';
import { store } from 'App/Store';

export type AppPushNotification = Omit<ReceivedNotification, 'userInfo'> & {
  thingName?: string;
  type?: string;
  timestamp?: number;
  title: string;
};

const onRegister = ({ token }: { token: string }, setToket: (token: string) => void) => {
  setToket(token);
};

const onNotification = (
  notification: AppPushNotification,
  addNotification: (notification: AppPushNotification) => void,
) => {
  Logger.dev('onNotification', notification);

  const thingName = pathOr(notification.thingName || '', ['data', 'thingName'], notification);
  const userInteraction = pathOr(isAndroid && notification.userInteraction, ['data', 'userInteraction'], notification);
  const device = devicesSelectors.getCurrentDevice(thingName)(store.getState());

  addNotification(notification);

  if (userInteraction) {
    navigate(NOTIFICATIONS, { device });
  }

  notification?.finish?.(PushNotificationIOS.FetchResult.NoData);
};

const showLocalNotification = (message: string, thingName: string, type: string, severity?: SeverityType) => {
  PushNotification.localNotification({
    message,
    channelId: AppConfig.androidNotificationChannelId,
    userInfo: {
      thingName,
      type,
      severity,
    },
  });
};

const setBadgeNumber = (notifications: StoredNotification[]) => {
  const badgeNumber = filter((n) => !n.viewed, notifications).length;

  PushNotification.setApplicationIconBadgeNumber(badgeNumber);
};

export { onRegister, onNotification, showLocalNotification, setBadgeNumber };
