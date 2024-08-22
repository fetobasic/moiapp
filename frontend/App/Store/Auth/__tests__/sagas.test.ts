/* eslint-disable @typescript-eslint/no-unused-vars */
import { runSaga } from 'redux-saga';
import { deleteUser, login, loginRenew, logout, resetPassword, signUp, updateUser } from 'App/Store/Auth/sagas';
import * as actions from 'App/Store/Auth/actions';
import { initialState } from 'App/Store/Auth/reducers';
import { notificationSelectors } from 'App/Store/Notification';
import { getDevicesInfoData } from 'App/Store/Devices/selectors';
import { addThing } from 'App/Services/Aws';
import { authSelectors } from 'App/Store/Auth';
import { applicationActions } from 'App/Store/Application';
import { devicesActions } from 'App/Store/Devices';

notificationSelectors.getToken = jest.fn(() => 'dgkfhbfvgisdrf9');
const deviceData = (thingName: string, isDirectConnection?: boolean = false) =>
  (getDevicesInfoData = jest.fn(() => [{ thingName, isDirectConnection }]));

describe('Auth sagas', () => {
  describe('signUp saga', () => {
    const payload = { username: 'testUser', password: 'testPassword' };

    const phone = {
      app: 'goalzero',
      country: 'USA',
      id: 'unknown',
      isTablet: false,
      model: 'Apple unknown (unknown)',
      platform: 'ios',
      token: 'dgkfhbfvgisdrf9',
    };

    const authResponse = { auth: { accessToken: 'testAccessToken' } };

    const mockApi = {
      userSignUp: jest.fn(() => ({ ok: true, data: authResponse })),
      subPhoneForNotifications: jest.fn(),
      setAuthToken: jest.fn(),
    };

    test('should sign up the user successfully', async () => {
      const dispatched: [] = [];

      await runSaga(
        { dispatch: (action) => dispatched.push(action), getState: () => initialState },
        signUp,
        mockApi,
        actions.signUp.request(payload),
      ).toPromise();

      expect(mockApi.userSignUp).toHaveBeenCalledWith({ ...payload, phone });
      expect(mockApi.setAuthToken).toHaveBeenCalledWith(authResponse.auth.accessToken);
      expect(dispatched).toEqual([actions.signUp.success(authResponse)]);
    });

    test('should sign up the user failure', async () => {
      const error = 'Some error message';
      const mockApiFailure = { userSignUp: jest.fn(() => ({ ok: false, data: error })) };

      const dispatched: [] = [];

      await runSaga(
        { dispatch: (action) => dispatched.push(action), getState: () => initialState },
        signUp,
        mockApiFailure,
        actions.signUp.request(payload),
      ).toPromise();

      expect(dispatched).toEqual([actions.signUp.failure({ error })]);
    });

    test('should sign up the user failure without error message', async () => {
      const mockApiFailure = { userSignUp: jest.fn(() => ({ ok: false })) };

      const dispatched: [] = [];

      await runSaga(
        { dispatch: (action) => dispatched.push(action), getState: () => initialState },
        signUp,
        mockApiFailure,
        actions.signUp.request(payload),
      ).toPromise();

      expect(dispatched).toEqual([actions.signUp.failure({ error: 'Something went wrong. Please try again later.' })]);
    });
  });

  describe('login', () => {
    const expectData = {
      name: 'testName',
      password: 'testPassword',
      phone: {
        app: 'goalzero',
        country: 'USA',
        id: 'unknown',
        isTablet: false,
        model: 'Apple unknown (unknown)',
        platform: 'ios',
        token: 'dgkfhbfvgisdrf9',
      },
    };

    addThing = jest.fn();

    const apiResponse = (thingName: string, ok: boolean = true) => ({
      ok,
      data: {
        things: [{ device: { identity: { thingName } } }],
        auth: { accessToken: 'ghfdjknhgodbifugd8bgd' },
      },
    });

    test('should handle a successful login with legacy thing', async () => {
      deviceData('yetiThingName');

      const mockApi = {
        userLogin: jest.fn(() => apiResponse('yetiThingName')),
        subPhoneForNotifications: jest.fn(),
        setAuthToken: jest.fn(),
      };

      const dispatched: [] = [];

      await runSaga(
        { dispatch: (action) => dispatched.push(action), getState: () => initialState },
        login,
        mockApi,
        actions.login.request({ name: 'testName', password: 'testPassword' }),
      ).toPromise();

      expect(mockApi.userLogin).toHaveBeenCalledWith(expectData);
    });

    test('should handle a successful login with 6G thing', async () => {
      deviceData('gzy-1-ThingName');

      const mockApi = {
        userLogin: jest.fn(() => apiResponse('gzy-1-ThingName')),
        subPhoneForNotifications: jest.fn(),
        setAuthToken: jest.fn(),
      };

      const dispatched: [] = [];

      await runSaga(
        { dispatch: (action) => dispatched.push(action), getState: () => initialState },
        login,
        mockApi,
        actions.login.request({ name: 'testName', password: 'testPassword' }),
      ).toPromise();

      expect(mockApi.userLogin).toHaveBeenCalledWith(expectData);
    });

    test('should handle a failed login', async () => {
      deviceData('gzy-1-ThingName');

      const mockApi = {
        userLogin: jest.fn(() => apiResponse('gzy-1-ThingName', false)),
      };

      const dispatched: [] = [];

      await runSaga(
        { dispatch: (action) => dispatched.push(action), getState: () => initialState },
        login,
        mockApi,
        actions.login.request({ name: 'testName', password: 'testPassword' }),
      ).toPromise();

      expect(dispatched).toEqual([actions.login.failure()]);
    });
  });

  describe('deleteUser', () => {
    const userInfo = { email: 'test@example.com' };
    authSelectors.getUserInfo = jest.fn(() => userInfo);
    deviceData('gzy-1-thing', true);

    test('should delete a user and log out on success', async () => {
      const mockApi = {
        userDelete: jest.fn(() => ({ ok: true })),
        unsubPhoneForNotifications: jest.fn(),
        clearAuthToken: jest.fn(),
      };

      const dispatched: [] = [];

      await runSaga(
        { dispatch: (action) => dispatched.push(action), getState: () => initialState },
        deleteUser,
        mockApi,
      ).toPromise();

      expect(dispatched).toEqual([
        applicationActions.setLastDevice(''),
        devicesActions.devicesAddUpdate.success({ data: [] }),
        actions.logout.success(),
        actions.deleteUser.success(),
      ]);
    });

    test('should delete a user and log out on failed', async () => {
      const mockApi = { userDelete: jest.fn(() => ({ ok: false })) };

      const dispatched: [] = [];

      await runSaga(
        { dispatch: (action) => dispatched.push(action), getState: () => initialState },
        deleteUser,
        mockApi,
      ).toPromise();

      expect(dispatched).toEqual([actions.deleteUser.failure()]);
    });
  });

  describe('loginRenew', () => {
    test('should renew login successfully', async () => {
      const authResponse = { accessToken: 'newAccessToken' };
      const mockApi = {
        userLoginRenew: jest.fn(() => ({ data: { auth: authResponse }, ok: true })),
        setAuthToken: jest.fn(),
      };

      const dispatched: [] = [];

      await runSaga({ dispatch: (action) => dispatched.push(action) }, loginRenew, mockApi).toPromise();

      expect(mockApi.userLoginRenew).toHaveBeenCalled();
      expect(dispatched).toEqual([actions.loginRenew.success(authResponse)]);
    });

    test('should handle a failure', async () => {
      const mockApi = { userLoginRenew: jest.fn(() => ({ ok: false })) };

      const dispatched: [] = [];

      await runSaga({ dispatch: (action) => dispatched.push(action) }, loginRenew, mockApi).toPromise();

      expect(dispatched).toEqual([actions.logout.request(), actions.loginRenew.failure()]);
    });
  });

  describe('resetPassword Saga', () => {
    const email = 'test@example.com';

    test('should reset password successfully', async () => {
      const mockApi = { userResetPassword: jest.fn(() => ({ ok: true })) };

      const dispatched: [] = [];

      await runSaga(
        { dispatch: (action) => dispatched.push(action) },
        resetPassword,
        mockApi,
        actions.resetPassword.request({ email }),
      ).toPromise();

      expect(mockApi.userResetPassword).toHaveBeenCalledWith(email);
      expect(dispatched).toEqual([actions.resetPassword.success()]);
    });

    test('should handle a failure', async () => {
      const mockApi = { userResetPassword: jest.fn(() => ({ ok: false, data: 'Error message' })) };

      const dispatched: [] = [];

      await runSaga(
        { dispatch: (action) => dispatched.push(action) },
        resetPassword,
        mockApi,
        actions.resetPassword.request({ email }),
      ).toPromise();

      expect(mockApi.userResetPassword).toHaveBeenCalledWith(email);
      expect(dispatched).toContainEqual(actions.resetPassword.failure());
    });

    test('should handle a failure without error message', async () => {
      const mockApi = { userResetPassword: jest.fn(() => ({ ok: false })) };

      const dispatched: [] = [];

      await runSaga(
        { dispatch: (action) => dispatched.push(action) },
        resetPassword,
        mockApi,
        actions.resetPassword.request({ email }),
      ).toPromise();

      expect(mockApi.userResetPassword).toHaveBeenCalledWith(email);
      expect(dispatched).toContainEqual(actions.resetPassword.failure());
    });
  });

  describe('updateUser', () => {
    const payload = { userName: 'Test user name' };
    test('should update user successfully', async () => {
      const mockApi = { userUpdate: jest.fn(() => ({ ok: true })) };

      const dispatched: [] = [];

      await runSaga(
        { dispatch: (action) => dispatched.push(action) },
        updateUser,
        mockApi,
        actions.updateUser.request(payload),
      ).toPromise();

      expect(mockApi.userUpdate).toHaveBeenCalledWith(payload);
      expect(dispatched).toContainEqual(actions.updateUser.success(payload));
    });

    test('should handle a failure', async () => {
      const data = 'Error message';
      const mockApi = { userUpdate: jest.fn(() => ({ ok: false, data })) };

      const dispatched: [] = [];

      await runSaga(
        { dispatch: (action) => dispatched.push(action) },
        updateUser,
        mockApi,
        actions.updateUser.request(payload),
      ).toPromise();

      expect(mockApi.userUpdate).toHaveBeenCalledWith(payload);
      expect(dispatched).toContainEqual(actions.updateUser.failure({ error: data }));
    });

    test('should handle a failure without error message', async () => {
      const mockApi = { userUpdate: jest.fn(() => ({ ok: false })) };

      const dispatched: [] = [];

      await runSaga(
        { dispatch: (action) => dispatched.push(action) },
        updateUser,
        mockApi,
        actions.updateUser.request(payload),
      ).toPromise();

      expect(mockApi.userUpdate).toHaveBeenCalledWith(payload);
      expect(dispatched).toContainEqual(
        actions.updateUser.failure({ error: 'Something went wrong. Please try again later.' }),
      );
    });
  });

  test('should log out successfully', async () => {
    const mockApi = {
      clearAuthToken: jest.fn(),
      unsubPhoneForNotifications: jest.fn(),
    };
    deviceData('gzy-1-thing', true);

    const dispatched: [] = [];
    await runSaga(
      { dispatch: (action) => dispatched.push(action), getState: () => initialState },
      logout,
      mockApi,
    ).toPromise();

    expect(dispatched).toContainEqual(actions.logout.success());
  });
});
