import { call, put, select, all, delay, takeLatest } from 'redux-saga/effects';
import { SagaIterator } from 'redux-saga';
import DeviceInfo from 'react-native-device-info';
import { Platform } from 'react-native';
import * as RNLocalize from 'react-native-localize';
import { differenceInDays } from 'date-fns';

import { isEmpty, map, find, filter, propEq, uniqWith, eqProps } from 'ramda';
import BootSplash from 'react-native-bootsplash';

import Config, { phoneId } from 'App/Config/AppConfig';
import { getVoltage } from 'App/Services/Yeti';

import { removeInvalidThings } from 'App/Services/Devices';

import * as actions from './actions';
import { applicationSelectors, applicationActions } from 'App/Store/Application';
import { devicesActions, devicesSelectors } from 'App/Store/Devices';
import { notificationSagas, notificationSelectors } from 'App/Store/Notification';
import { authActions, authSelectors } from 'App/Store/Auth';
import { AuthType } from 'App/Types/User';
import { BackendApiType } from 'App/Store/rootSaga';
import { YetiState } from 'App/Types/Yeti';
import { isYeti6GThing } from 'App/Services/ThingHelper';
import { DeviceState } from 'App/Types/Devices';
import Logger from 'App/Services/Logger';

/** If Things Exists then set showOnboarding to false */
function* setShowOnboarding(things: any) {
  const isShowOnboarding: boolean = yield select(applicationSelectors.getIsShowOnboarding);

  if (isShowOnboarding && !isEmpty(things)) {
    yield put(applicationActions.changeOnboardingState(false));
  }
}

function* checkPeripheralList() {
  const connectedPeripheralIds: string[] = yield select(applicationSelectors.getConnectedPeripheralIds);
  const devices: Array<DeviceState> = yield select(devicesSelectors.getDevicesInfoData);

  const newPeripheralIdsList = connectedPeripheralIds?.filter((id) =>
    devices.find((device) => device.peripheralId === id),
  );

  yield put(applicationActions.updateConnectedPeripheralId(newPeripheralIdsList));
}

function* checkThings(api: BackendApiType): SagaIterator {
  const response = yield call(api.getThingsWithDetails, phoneId);
  const localThings: Array<YetiState> = yield select(devicesSelectors.getDevicesInfoData);
  const isShowOnboarding: boolean = yield select(applicationSelectors.getIsShowOnboarding);

  if (response.ok) {
    const receivedThings = response.data || [];

    if (isEmpty(receivedThings)) {
      const newThings = removeInvalidThings(localThings);
      yield put(devicesActions.devicesUpdateAll.success({ data: newThings }));

      yield call(setShowOnboarding, newThings);

      return;
    }

    /** Turn on Notifications if local storage was reseted */
    if (isShowOnboarding) {
      const token: string = yield select(notificationSelectors.getToken);

      if (token) {
        yield call(api.registerPhoneNotifications, phoneId, token);
      }

      yield call(notificationSagas.changeEnabled, api, {
        payload: { isEnabled: true },
        type: '@NOTIFICATION/NOTIFICATION_TOGGLE_REQUEST',
      });
    }

    /** Add Things from Backend */
    let newThings = map((thing) => {
      const localThing = find(propEq('thingName', thing.thingName))(localThings as Record<'thingName', any>[]);

      let data = { ...thing, ...thing.status, ...localThing };

      if (!localThing) {
        data = {
          ...data,
          model: thing.model,
          name: thing.yetiName || thing.label || thing.thingName,
          isDirectConnection: false,
          usedAnywhereConnect: true,
          isConnected: false,
          isShowFirmwareUpdateNotifications: !isYeti6GThing(thing.yetiName || thing.thingName),
          settings: {
            temperature: 'FAHRENHEIT',
            voltage: getVoltage(thing.model, thing?.hostId),
          },
        };
      }

      return data;
    }, receivedThings);

    /** Add if exists Things in Direct Mode or never was in Anywhere Mode */
    const thingInDirectMode = filter((thing: YetiState) => thing.isDirectConnection || !thing.usedAnywhereConnect)(
      localThings,
    );

    if (thingInDirectMode) {
      newThings = [...newThings, ...thingInDirectMode];
    }

    /** Remove simular devices if exist */
    newThings = uniqWith(eqProps('thingName'), newThings);

    /** If newThings is not empty - set isShowOnboarding to FALSE state */
    yield call(setShowOnboarding, newThings);

    yield put(devicesActions.devicesUpdateAll.success({ data: newThings }));
  } else {
    const newThings = removeInvalidThings(localThings);

    yield call(setShowOnboarding, newThings);

    yield put(devicesActions.devicesUpdateAll.success({ data: newThings }));
  }
}

// process STARTUP actions
export function* startup(api: BackendApiType) {
  try {
    if (__DEV__ && console.tron) {
      console.tron.display({
        name: '🔵 Phone Info 🔵',
        value: {
          phoneId,
          platform: Platform.OS,
          model: DeviceInfo.getModel(),
          country: RNLocalize.getCountry(),
          isTablet: DeviceInfo.isTablet(),
        },
      });
    }

    const authInfo: AuthType = yield select(authSelectors.getAuthInfo);

    if (authInfo) {
      yield call(api.setAuthToken, authInfo.accessToken);

      yield call(checkThings, api);

      if (differenceInDays(new Date(authInfo.expiresAt), new Date()) < Config.tokenExpirationDays) {
        yield put(authActions.loginRenew.request());
      }
    }

    yield call(checkPeripheralList);
  } catch (error) {
    Logger.error(error);
  } finally {
    yield put(actions.finish());

    yield delay(Config.splashScreenHideTime);
    yield call(BootSplash.hide, { fade: true });
  }
}

export default function* startupSaga(backendApi: BackendApiType): SagaIterator {
  yield all([takeLatest(actions.startup, startup, backendApi)]);
}
