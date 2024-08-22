import { authSelectors } from 'App/Store/Auth';
import { runSaga } from 'redux-saga';
import { startup } from 'App/Store/Startup/sagas';
import { initialState } from 'App/Store/Startup/reducers';
import * as actions from 'App/Store/Startup/actions';
import { applicationSelectors } from 'App/Store/Application';
import { devicesSelectors } from 'App/Store/Devices';
import { yeti6G, yetiLegacy } from 'App/Fixtures/mocks/mockedState';
import { notificationSagas, notificationSelectors } from 'App/Store/Notification';

describe('startup saga', () => {
  jest.spyOn(devicesSelectors, 'getDevicesInfoData').mockReturnValue([yeti6G]);
  applicationSelectors.getIsShowOnboarding = jest.fn(() => true);
  applicationSelectors.getConnectedPeripheralIds = jest.fn(() => ['testConnectedPeripheralIds']);
  jest.spyOn(notificationSelectors, 'getToken').mockReturnValue('testToken');
  jest
    .spyOn(authSelectors, 'getAuthInfo')
    .mockReturnValue({ accessToken: 'testAccessToken', expiresAt: '2022-12-11T15:36:13Z' });

  const api = {
    setAuthToken: jest.fn(() => ({ ok: true, data: {} })),
    getThingsWithDetails: jest.fn(() => ({ ok: true, data: [] })),
    registerPhoneNotifications: jest.fn(() => ({ ok: true })),
    log: jest.fn(),
  };

  test('should handle startup correctly', async () => {
    const dispatched: [] = [];

    await runSaga(
      { dispatch: (action) => dispatched.push(action), getState: () => initialState },
      startup,
      api,
    ).toPromise();

    expect(dispatched).toContainEqual(actions.finish());
  });

  test('should handle startup when received things', async () => {
    const mockApi = { ...api, getThingsWithDetails: jest.fn(() => ({ ok: true, data: [yetiLegacy] })) };

    notificationSagas.changeEnabled = jest.fn();

    const dispatched: [] = [];

    await runSaga(
      { dispatch: (action) => dispatched.push(action), getState: () => initialState },
      startup,
      mockApi,
    ).toPromise();

    expect(dispatched).toContainEqual(actions.finish());
  });

  test('should handle startup when response is false', async () => {
    const mockApi = { ...api, getThingsWithDetails: jest.fn(() => ({ ok: false, data: [] })) };

    const dispatched: [] = [];

    await runSaga(
      { dispatch: (action) => dispatched.push(action), getState: () => initialState },
      startup,
      mockApi,
    ).toPromise();

    expect(dispatched).toContainEqual(actions.finish());
  });
});
