import { createAction, createAsyncAction } from 'typesafe-actions';
import { StoredNotification } from 'App/Types/Notification';
import type { AppPushNotification } from 'App/Services/PushNotification';

export const getNotifications = createAsyncAction(
  '@NOTIFICATION/GET_NOTIFICATIONS_REQUEST',
  '@NOTIFICATION/GET_NOTIFICATIONS_SUCCESS',
  '@NOTIFICATION/GET_NOTIFICATIONS_FAILURE',
)<
  { thingNames: string[]; notificationTypes?: string[] },
  { notifications: StoredNotification[]; lastGetDate: string },
  undefined
>();

export const notificationSetToken = createAsyncAction(
  '@NOTIFICATION/NOTIFICATION_SET_TOKEN_REQUEST',
  '@NOTIFICATION/NOTIFICATION_SET_TOKEN_SUCCESS',
  '@NOTIFICATION/NOTIFICATION_SET_TOKEN_FAILURE',
)<{ token: string }, { token: string }, undefined>();

export const notificationToggle = createAsyncAction(
  '@NOTIFICATION/NOTIFICATION_TOGGLE_REQUEST',
  '@NOTIFICATION/NOTIFICATION_TOGGLE_SUCCESS',
  '@NOTIFICATION/NOTIFICATION_TOGGLE_FAILURE',
)<{ isEnabled: boolean }, { isEnabled: boolean }, undefined>();

export const notificationAdd = createAsyncAction(
  '@NOTIFICATION/NOTIFICATION_ADD_REQUEST',
  '@NOTIFICATION/NOTIFICATION_ADD_SUCCESS',
  '@NOTIFICATION/NOTIFICATION_ADD_FAILURE',
)<{ notification: AppPushNotification }, { notifications: StoredNotification[] }, undefined>();

export const notificationRemove = createAction('@NOTIFICATION/NOTIFICATION_REMOVE')<{ id: string }>();

export const notificationRemoveAll = createAction('@NOTIFICATION/NOTIFICATION_REMOVE_ALL')<{
  things: string[];
  types: string[];
} | null>();

export const notificationDismiss = createAction('@NOTIFICATION/NOTIFICATION_DISMISS')<undefined>();

export const notificationsViewed = createAction('@NOTIFICATION/NOTIFICATIONS_VIEWED')<{
  thingNames: string[];
  markAll?: boolean;
}>();
