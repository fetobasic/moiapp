/* eslint-disable @typescript-eslint/no-unused-vars */
import { runSaga } from 'redux-saga';
import {
  addNotification,
  changeEnabled,
  changeViewedState,
  removeAllNotifications,
  removeNotification,
  setToken,
} from 'App/Store/Notification/sagas';
import * as actions from 'App/Store/Notification/actions';
import { getToken, getNotifications } from 'App/Store/Notification/selectors';
import { initialState } from 'App/Store/Notification/reducers';
import shortid from 'shortid';
import { devicesSelectors } from 'App/Store/Devices';

jest.useFakeTimers();
jest.setSystemTime(1606348800);

beforeEach(() => jest.clearAllMocks());

describe('Notification sagas', () => {
  test('should add a notification', async () => {
    shortid.generate = jest.fn(() => 123);

    const notification = { thingName: 'DeviceA', type: 'Info', severity: 'warn', timestamp: 1606348800 };
    const notifications = [
      {
        id: 123,
        date: new Date(notification.timestamp * 1000),
        thingName: 'DeviceA',
        type: 'Info',
        title: '',
        severity: 'warn',
        message: '',
      },
    ];

    getNotifications = jest.fn(() => notifications);

    const dispatched: [] = [];
    await runSaga(
      { dispatch: (action) => dispatched.push(action), getState: () => initialState },
      addNotification,
      actions.notificationAdd.request({ notification }),
    ).toPromise();

    expect(dispatched[0]).toEqual(actions.notificationAdd.success({ notifications }));
  });

  describe('removeNotification', () => {
    test('should remove a notification by ID', async () => {
      const notifications = [{ id: '1' }, { id: '2' }, { id: '3' }];

      getNotifications = jest.fn(() => notifications);

      const dispatched: [] = [];
      await runSaga(
        { dispatch: (action) => dispatched.push(action), getState: () => initialState },
        removeNotification,
        actions.notificationRemove({ id: '2' }),
      ).toPromise();

      expect(dispatched).toEqual([
        actions.notificationAdd.success({ notifications: notifications.filter(({ id }) => id !== '2') }),
      ]);
    });

    test('should call notificationDismiss with empty notification', async () => {
      getNotifications = jest.fn(() => []);

      const dispatched: [] = [];

      await runSaga(
        { dispatch: (action) => dispatched.push(action), getState: () => initialState },
        removeNotification,
        actions.notificationRemove({ id: '2' }),
      ).toPromise();

      expect(dispatched).toEqual([actions.notificationDismiss()]);
    });
  });

  describe('setToken', () => {
    const mockedApi = { registerPhoneNotifications: jest.fn(() => ({ ok: true })) };
    const token = 'gndfhjghnsdfogjhosdfbjgfi';

    test('should call dismiss notifications when localToken exists', async () => {
      devicesSelectors.getDevicesInfoData = jest.fn(() => []);
      getToken = jest.fn(() => 'hgdsfujghobisdfyhgnposdfumbt0');

      const dispatched: [] = [];

      await runSaga(
        { dispatch: (action) => dispatched.push(action), getState: () => initialState },
        setToken,
        mockedApi,
        actions.notificationSetToken.request({ token: 'newToken' }),
      ).toPromise();

      expect(dispatched).toEqual([actions.notificationDismiss()]);
    });

    test('should call notificationSetToken thinks does not empty', async () => {
      getToken = jest.fn(() => '');
      devicesSelectors.getDevicesInfoData = jest.fn(() => []);

      const dispatched: [] = [];

      await runSaga(
        { dispatch: (action) => dispatched.push(action), getState: () => initialState },
        setToken,
        mockedApi,
        actions.notificationSetToken.request({ token }),
      ).toPromise();

      expect(dispatched).toEqual([actions.notificationSetToken.success({ token })]);
    });

    test('should call notificationSetToken if api call success', async () => {
      getToken = jest.fn(() => '');
      devicesSelectors.getDevicesInfoData = jest.fn(() => [{ thingName: 'thingName' }]);

      const dispatched: [] = [];

      await runSaga(
        { dispatch: (action) => dispatched.push(action), getState: () => initialState },
        setToken,
        mockedApi,
        actions.notificationSetToken.request({ token }),
      ).toPromise();

      expect(dispatched).toEqual([actions.notificationSetToken.success({ token })]);
    });

    test('should call notificationSetToken if api call failure', async () => {
      const mockedApiFailure = { registerPhoneNotifications: jest.fn(() => ({ ok: false })) };
      getToken = jest.fn(() => '');
      devicesSelectors.getDevicesInfoData = jest.fn(() => [{ thingName: 'thingName' }]);

      const dispatched: [] = [];

      await runSaga(
        { dispatch: (action) => dispatched.push(action), getState: () => initialState },
        setToken,
        mockedApiFailure,
        actions.notificationSetToken.request({ token }),
      ).toPromise();

      expect(dispatched).toEqual([actions.notificationDismiss()]);
    });
  });

  describe('changeEnabled', () => {
    test('should enable phone notifications', async () => {
      const mockedApi = { subPhoneForNotifications: jest.fn(() => ({ ok: true })) };

      const dispatched: [] = [];

      await runSaga(
        { dispatch: (action) => dispatched.push(action), getState: () => initialState },
        changeEnabled,
        mockedApi,
        actions.notificationToggle.request({ isEnabled: true }),
      ).toPromise();

      expect(dispatched).toEqual([actions.notificationToggle.success({ isEnabled: true })]);
    });

    test('should disable phone notifications', async () => {
      const mockedApi = { unsubPhoneForNotifications: jest.fn(() => ({ ok: true })) };

      const dispatched: [] = [];

      await runSaga(
        { dispatch: (action) => dispatched.push(action), getState: () => initialState },
        changeEnabled,
        mockedApi,
        actions.notificationToggle.request({ isEnabled: false }),
      ).toPromise();

      expect(dispatched).toEqual([actions.notificationToggle.success({ isEnabled: false })]);
    });

    test('should dismiss notifications when an API error occurs', async () => {
      const mockedApi = { subPhoneForNotifications: jest.fn(() => ({ ok: false })) };

      const dispatched: [] = [];

      await runSaga(
        { dispatch: (action) => dispatched.push(action), getState: () => initialState },
        changeEnabled,
        mockedApi,
        actions.notificationToggle.request({ isEnabled: true }),
      ).toPromise();

      expect(dispatched).toEqual([actions.notificationDismiss()]);
    });
  });

  test('should change the viewed state of notifications and update the badge number', async () => {
    const notifications = [
      { id: '1', thingName: 'yeti1', viewed: false },
      { id: '2', thingName: 'yeti2', viewed: false },
      { id: '3', thingName: 'yeti3', viewed: false },
    ];

    getNotifications = jest.fn(() => notifications);

    const dispatched: [] = [];

    await runSaga(
      { dispatch: (action) => dispatched.push(action), getState: () => initialState },
      changeViewedState,
      actions.notificationsViewed({ thingNames: notifications.map(({ thingName }) => thingName) }),
    ).toPromise();

    expect(dispatched).toEqual([
      actions.notificationAdd.success({
        notifications: notifications.map((notification) => ({ ...notification, viewed: true })),
      }),
    ]);
  });
});
