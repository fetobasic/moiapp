import { RootState } from 'typesafe-actions';
import { createSelector } from 'reselect';
import { StoredNotification } from 'App/Types/Notification';

export const getToken = (state: RootState) => state.notification.token;
export const getIsNotificationsEnabled = (state: RootState) => state.notification.isEnabled;
export const getLastGetDate = (state: RootState) => state.notification.lastGetDate;
export const getNotifications = (state: RootState) => state.notification?.notifications || [];
export const getGroupedNotifications = (selectedDevices: string[], selectedNotificationTypes: string[]) =>
  createSelector(getNotifications, (notifications) =>
    notifications
      .filter((n) => selectedDevices.includes(n.thingName) && selectedNotificationTypes.includes(n.severity))
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
      .reduce(
        (acc, notification) => {
          const group = notification.viewed ? 'viewed' : 'unviewed';
          acc[group].push(notification);

          return acc;
        },
        { viewed: [] as StoredNotification[], unviewed: [] as StoredNotification[] },
      ),
  );
