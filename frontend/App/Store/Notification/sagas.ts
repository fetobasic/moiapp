import { call, put, select, all, takeLatest } from 'redux-saga/effects';
import { SagaIterator } from '@redux-saga/types';
import { isEmpty, filter, map, reject } from 'ramda';
import shortid from 'shortid';
import { ApiResponse } from 'apisauce';
import { format } from 'date-fns';

import { setBadgeNumber } from 'App/Services/PushNotification';

import { phoneId } from 'App/Config/AppConfig';

import * as actions from './actions';
import { getToken, getNotifications, getLastGetDate } from './selectors';

import { devicesSelectors } from 'App/Store/Devices';
import { NotificationsResponse, SeverityType, StoredNotification } from 'App/Types/Notification';
import { convertSeverityToCommonFormat } from 'App/Services/Notifications';
import { BackendApiType } from 'App/Store/rootSaga';
import { fileLogger } from 'App/Services/FileLogger';

export function* addNotification({ payload: { notification } }: ReturnType<typeof actions.notificationAdd.request>) {
  let notifications = [...((yield select(getNotifications)) as StoredNotification[])];

  const thingName = notification?.data?.thingName || notification.thingName;
  const type = notification?.data?.type || notification.type;
  const severity = convertSeverityToCommonFormat(type, notification?.data?.severity || SeverityType.WARNING);
  const message = notification?.data?.message || notification.message || (notification.alert as any)?.body || '';
  const title = notification?.data?.title || notification?.title || (notification?.alert as any)?.title || '';
  const timestamp =
    notification?.data?.timestamp ||
    notification?.timestamp ||
    (notification?.alert as any)?.timestamp ||
    Math.round(Date.now() / 1000);

  const copy = {
    id: shortid.generate(),
    date: new Date(timestamp * 1000),
    thingName,
    type,
    title,
    message,
    severity,
  };

  notifications = reject((n: StoredNotification) => n.type === type && n.thingName === thingName, notifications);

  notifications.push(copy as StoredNotification);

  setBadgeNumber(notifications);
  yield put(actions.notificationAdd.success({ notifications }));
}

export function* removeNotification({ payload: { id } }: ReturnType<typeof actions.notificationRemove>) {
  const notifications: StoredNotification[] = yield select(getNotifications);

  if (isEmpty(notifications)) {
    yield put(actions.notificationDismiss());
  } else {
    const newNotifications = filter((n) => n.id !== id, notifications);

    yield put(actions.notificationAdd.success({ notifications: newNotifications }));
  }
}

export function* removeAllNotifications({ payload }: ReturnType<typeof actions.notificationRemoveAll>) {
  if (payload) {
    const { things, types } = payload;
    let notifications: StoredNotification[] = yield select(getNotifications);

    if (isEmpty(notifications)) {
      yield put(actions.notificationDismiss());
    } else {
      notifications = filter((n) => !(things.includes(n.thingName) && types.includes(n.severity)), notifications);

      yield put(actions.notificationAdd.success({ notifications }));
    }
  } else {
    yield put(actions.notificationAdd.success({ notifications: [] }));
  }
}

export function* setToken(
  api: BackendApiType,
  { payload: { token } }: ReturnType<typeof actions.notificationSetToken.request>,
): SagaIterator {
  const localToken = yield select(getToken);
  const things = yield select(devicesSelectors.getDevicesInfoData);

  if (localToken) {
    yield put(actions.notificationDismiss());
  } else if (isEmpty(things)) {
    yield put(actions.notificationSetToken.success({ token }));
  } else {
    const response = yield call(api.registerPhoneNotifications, phoneId, token);

    if (response.ok) {
      yield put(actions.notificationSetToken.success({ token }));
    } else {
      yield put(actions.notificationDismiss());
    }
  }
}

export function* changeEnabled(
  api: BackendApiType,
  { payload: { isEnabled } }: ReturnType<typeof actions.notificationToggle.request>,
): SagaIterator {
  let response;

  if (isEnabled) {
    response = yield call(api.subPhoneForNotifications, phoneId);
  } else {
    response = yield call(api.unsubPhoneForNotifications, phoneId);
  }

  if (response.ok) {
    yield put(actions.notificationToggle.success({ isEnabled }));
  } else {
    yield put(actions.notificationDismiss());
  }
}

export function* changeViewedState({
  payload: { thingNames, markAll },
}: ReturnType<typeof actions.notificationsViewed>) {
  let notifications: StoredNotification[] = yield select(getNotifications);

  notifications = map((notification) => {
    if (markAll || (thingNames?.length > 0 && thingNames.includes(notification.thingName))) {
      return { ...notification, viewed: true };
    }
    return notification;
  }, notifications);

  setBadgeNumber(notifications);
  yield put(actions.notificationAdd.success({ notifications }));
}

export function* getNotificationsFromAPI(
  api: BackendApiType,
  { payload: { thingNames, notificationTypes } }: ReturnType<typeof actions.getNotifications.request>,
) {
  const lastGetDate: string | undefined = yield select(getLastGetDate);

  fileLogger.addLog('getNotificationsFromAPI. thingNames: ', thingNames.join(', '));
  fileLogger.addLog('getNotificationsFromAPI. lastGetDate: ', lastGetDate || 'undefined');

  const response: ApiResponse<NotificationsResponse> = yield call(api.getNotifications, {
    thingNames,
    notificationTypes,
    from: lastGetDate && format(new Date(lastGetDate.slice(0, -1)), "yyyy-MM-dd'T'HH:mm:ss'Z'"),
  });

  fileLogger.addLog('getNotificationsFromAPI. response: ', JSON.stringify(response.data));

  if (response.ok && response.data) {
    const newNotifications = response.data;
    let notifications: StoredNotification[] = yield select(getNotifications);

    thingNames.forEach((thingName) => {
      const thingNameNotifications = newNotifications[thingName];

      if (thingNameNotifications?.length > 0) {
        thingNameNotifications.forEach((thingNameNotification) => {
          const notificationIndex = notifications.findIndex(
            (n) => n.thingName === thingName && n.type === thingNameNotification.type,
          );

          if (notificationIndex > -1) {
            notifications[notificationIndex].date = new Date(thingNameNotification.createdAt);
            notifications[notificationIndex].viewed = false;
          } else {
            const notification = {
              id: shortid.generate(),
              date: new Date(thingNameNotification.createdAt),
              thingName,
              type: thingNameNotification.type,
              title: thingNameNotification.title,
              message: thingNameNotification.content,
              severity: convertSeverityToCommonFormat(thingNameNotification.type, SeverityType.WARNING),
            };

            notifications.push(notification as StoredNotification);
          }
        });
      }
    });

    setBadgeNumber(notifications);
    yield put(actions.getNotifications.success({ notifications, lastGetDate: new Date().toISOString() }));
  } else {
    yield put(actions.getNotifications.failure());
  }
}

export default function* notificationSaga(backendApi: any): SagaIterator {
  yield all([
    takeLatest(actions.notificationAdd.request, addNotification),
    takeLatest(actions.notificationRemove, removeNotification),
    takeLatest(actions.notificationRemoveAll, removeAllNotifications),
    takeLatest(actions.notificationsViewed, changeViewedState),

    /** AWS API */
    takeLatest(actions.notificationSetToken.request, setToken, backendApi),
    takeLatest(actions.notificationToggle.request, changeEnabled, backendApi),
    takeLatest(actions.getNotifications.request, getNotificationsFromAPI, backendApi),
  ]);
}
