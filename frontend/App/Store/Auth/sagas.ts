import { put, call, all, select, takeLatest, delay } from '@redux-saga/core/effects';
import { SagaIterator } from '@redux-saga/types';
import { Platform } from 'react-native';
import { capitalize, map } from 'lodash';
import DeviceInfo from 'react-native-device-info';
import * as RNLocalize from 'react-native-localize';
import { ApiResponse } from 'apisauce';

import * as actions from './actions';
import { BackendApiType } from '../rootSaga';

import AppConfig, { phoneId } from 'App/Config/AppConfig';
import {
  AuthResponse,
  DeleteRequestType,
  ErrorResponse,
  LoginRequestType,
  PhoneInfo,
  SignUpRequestType,
  UserInfo,
} from 'App/Types/User';
import { isIOS } from 'App/Themes';
import { notificationSelectors } from 'App/Store/Notification';
import { authSelectors } from 'App/Store/Auth';
import { devicesActions, devicesSagas } from 'App/Store/Devices';
import { showSnackbarMessage } from 'App/Services/Alert';
import { getDevicesInfoData } from 'App/Store/Devices/selectors';
import { applicationActions } from 'App/Store/Application';
import { addThing } from 'App/Services/Aws';
import { isLegacyThing, parseModelFromHostId } from 'App/Services/ThingHelper';
import { getDeviceType } from 'App/Transforms/getDeviceType';
import { getVoltage } from 'App/Services/Yeti';
import { firmwareUpdateActions } from 'App/Store/FirmwareUpdate';
import { DeviceState } from 'App/Types/Devices';

function* getPhoneInfo() {
  const token: string = yield select(notificationSelectors.getToken);

  return {
    id: phoneId,
    platform: Platform.OS,
    app: 'goalzero',
    model: `${
      isIOS ? 'Apple' : capitalize(DeviceInfo.getBrand())
    } ${DeviceInfo.getModel()} (${DeviceInfo.getDeviceId()})`,
    country: RNLocalize.getCountry(),
    isTablet: DeviceInfo.isTablet(),
    token,
  };
}

// User Sign Up
export function* signUp(api: BackendApiType, { payload }: ReturnType<typeof actions.signUp.request>): SagaIterator {
  const phone: PhoneInfo = yield call(getPhoneInfo);
  const requestBody: SignUpRequestType = {
    ...payload,
    phone,
  };

  const response: ApiResponse<AuthResponse, ErrorResponse> = yield call(api.userSignUp, requestBody);

  if (response.ok && response.data) {
    const { data } = response;

    yield call(api.setAuthToken, data.auth.accessToken);
    yield call(api.subPhoneForNotifications, phoneId);

    yield put(actions.signUp.success(data));
  } else {
    yield put(
      actions.signUp.failure({ error: (response.data as string) || 'Something went wrong. Please try again later.' }),
    );
  }
}

// User Login
export function* login(api: BackendApiType, { payload }: ReturnType<typeof actions.login.request>): SagaIterator {
  const phone: PhoneInfo = yield call(getPhoneInfo);
  const requestBody: LoginRequestType = {
    ...payload,
    phone,
  };

  const response: ApiResponse<AuthResponse, ErrorResponse> = yield call(api.userLogin, requestBody);

  if (response.ok && response.data) {
    const things: Array<DeviceState> = yield select(getDevicesInfoData);
    const { data } = response;

    if (data.things?.length) {
      yield all(
        map(data.things, (thing) => {
          const thingName = thing?.thingName;

          // If thing exists and in direct connection mode, then skip it
          const localThing = things.find((item) => item.thingName === thingName);

          if (localThing?.isDirectConnection) {
            return call(() => {});
          }

          let model = thing?.model;

          if (!model) {
            model = parseModelFromHostId(thing?.hostId);
          }

          let thingData = {
            thingName,
            name: thing.yetiName || thingName,
            model,
            isDirectConnection: false,
            usedAnywhereConnect: true,
            isConnected: true,
            isLockAllPorts: false,
            isLockAllNotifications: false,
            isLockAllBatteryItems: false,
            isLockChangeAcsryTankCapacity: false,
            isLockChangeAcsryMode: false,
            isLockChangeChargingProfile: false,
            isShowFirmwareUpdateNotifications: isLegacyThing(thingName),
            deviceType: getDeviceType(thingName),
            settings: {
              temperature: 'FAHRENHEIT',
              voltage: getVoltage(model, thing?.hostId),
            },
          };

          if (isLegacyThing(thingName)) {
            thingData = {
              ...thingData,
              ...thing.status,
            };
          } else {
            thingData = {
              ...thingData,
              ...thing,
            };
          }

          addThing(thingName, undefined, undefined, true);

          // @ts-ignore we likely can't ensure TS that `thingData` is YetiState or Yeti6GState
          return call(devicesSagas.addOrUpdateDevice, {
            type: '@DEVICES/DEVICES_ADD_UPDATE_REQUEST',
            payload: { thingName, data: thingData },
          });
        }),
      );
    }

    yield call(api.setAuthToken, data.auth.accessToken);
    yield call(api.subPhoneForNotifications, phoneId);

    yield put(actions.login.success(data));

    // Wait for 5 second for correct device state update from AWS
    yield delay(AppConfig.checkForNewFWDelay);

    // Get Firmware Versions for all devices
    yield put(firmwareUpdateActions.firmwareCheckUpdates.request());
  } else {
    showSnackbarMessage((response.data as ErrorResponse) || 'Something went wrong. Please try again later.', true);
    yield put(actions.login.failure());
  }
}

// User Delete
export function* deleteUser(api: BackendApiType): SagaIterator {
  const userInfo: UserInfo = yield select(authSelectors.getUserInfo);
  const requestBody: DeleteRequestType = {
    email: userInfo.email,
  };
  const response: ApiResponse<AuthResponse, ErrorResponse> = yield call(api.userDelete, requestBody);

  if (response.ok) {
    yield call(logout, api);
    yield put(actions.deleteUser.success());
  } else {
    showSnackbarMessage((response.data as ErrorResponse) || 'Something went wrong. Please try again later.', true);
    yield put(actions.deleteUser.failure());
  }
}

// User Login Renew
export function* loginRenew(api: BackendApiType): SagaIterator {
  const response: ApiResponse<AuthResponse> = yield call(api.userLoginRenew);

  if (response.ok && response.data) {
    const auth = response.data.auth;

    yield call(api.setAuthToken, auth.accessToken);

    yield put(actions.loginRenew.success(auth));
  } else {
    yield put(actions.logout.request());

    yield put(actions.loginRenew.failure());
  }
}

// User reset password
export function* resetPassword(
  api: BackendApiType,
  { payload }: ReturnType<typeof actions.resetPassword.request>,
): SagaIterator {
  const response: ApiResponse<any> = yield call(api.userResetPassword, payload.email);

  if (response.ok) {
    yield put(actions.resetPassword.success());
  } else {
    showSnackbarMessage(response.data || 'Something went wrong. Please try again later.', true);
    yield put(actions.resetPassword.failure());
  }
}

// User update
export function* updateUser(
  api: BackendApiType,
  { payload }: ReturnType<typeof actions.updateUser.request>,
): SagaIterator {
  const response: ApiResponse<any> = yield call(api.userUpdate, payload);

  if (response.ok) {
    yield put(actions.updateUser.success(payload));
  } else {
    yield put(
      actions.updateUser.failure({
        error: (response.data as string) || 'Something went wrong. Please try again later.',
      }),
    );
  }
}

// User Logout
export function* logout(api: BackendApiType): SagaIterator {
  let things: Array<DeviceState> = [...(yield select(getDevicesInfoData))];
  things = things.filter((item) => item.isDirectConnection);

  yield call(api.unsubPhoneForNotifications, phoneId);

  yield put(applicationActions.setLastDevice(''));
  yield put(devicesActions.devicesAddUpdate.success({ data: things }));

  yield call(api.clearAuthToken);
  yield put(actions.logout.success());
}

export default function* devicesSaga(backendApi: BackendApiType): SagaIterator {
  yield all([
    takeLatest(actions.signUp.request, signUp, backendApi),
    takeLatest(actions.login.request, login, backendApi),
    takeLatest(actions.loginRenew.request, loginRenew, backendApi),
    takeLatest(actions.resetPassword.request, resetPassword, backendApi),
    takeLatest(actions.updateUser.request, updateUser, backendApi),
    takeLatest(actions.deleteUser.request, deleteUser, backendApi),
    takeLatest(actions.logout.request, logout, backendApi),
  ]);
}
