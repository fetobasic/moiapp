import { put, delay, select, call, all, takeLatest, takeEvery } from '@redux-saga/core/effects';
import { SagaIterator } from '@redux-saga/types';
import { ApiResponse } from 'apisauce';

import { map } from 'lodash';
import { isEmpty, mergeRight, mergeDeepRight, findIndex, propEq, update, find, pathOr } from 'ramda';
import { differenceInMinutes } from 'date-fns';

import Config, { phoneId } from 'App/Config/AppConfig';

import { clearTimerId } from 'App/Services/Heartbeating';
import { unregister } from 'App/Services/Aws';

import * as actions from './actions';
import { getDevicesInfoData } from './selectors';
import { applicationActions } from 'App/Store/Application';
import { notificationActions } from 'App/Store/Notification';
import { Bluetooth } from 'App/Containers/Home/HomeScreen';
import { YetiState } from 'App/Types/Yeti';
import { BackendApiType, DirectApiType } from 'App/Store/rootSaga';
import { DeviceState } from 'App/Types/Devices';
import { showError, showInfo } from 'App/Services/Alert';
import { SeverityType } from 'App/Types/Notification';

/* ------------- Add or Update thing ------------- */
// update redux state with Yeti's state
export function* addOrUpdateDevice({
  payload: { thingName, data, withReplace },
}: ReturnType<typeof actions.devicesAddUpdate.request>): SagaIterator {
  let things: Array<DeviceState> = [...(yield select(getDevicesInfoData))];

  /* ------------- Check if data is empty ------------- */
  if (things.length === 0 && !thingName) {
    yield put(actions.devicesAddUpdate.failure());
    return;
  }

  const index = findIndex(propEq('thingName', thingName))(things as { thingName: string }[]);

  // Check if thingName not exists then:
  /* ------------- Add thing ------------- */
  if (index === -1) {
    things.push(data);
  } else {
    /* ----------- Update thing ---------- */
    let changedThing;
    if (withReplace) {
      changedThing = { ...things[index], ...data };
    } else {
      changedThing = mergeDeepRight(things[index], data);
    }

    things = update(index, changedThing, things) as Array<DeviceState>;
  }

  yield put(actions.devicesAddUpdate.success({ data: things }));
}

/* ------------- Update all things ------------- */
export function* updateAllDevice({ payload: { data } }: ReturnType<typeof actions.devicesUpdateAll.request>) {
  yield put(actions.devicesAddUpdate.success({ data }));
}

/* ------------- Remove thing ------------- */
export function* removeDevice({ payload: { thingName } }: ReturnType<typeof actions.devicesRemove>) {
  const things: Array<YetiState> = yield select(getDevicesInfoData);
  const thing = things.find((t) => t.thingName === thingName);

  if (!thing) {
    yield put(actions.devicesFailure());
  } else {
    const changes = things.filter((t) => t.thingName !== thingName);
    unregister(thingName);
    clearTimerId(thingName);

    // Remove thing from Bluetooth list
    yield put(applicationActions.removeConnectedPeripheralId(thing.peripheralId || ''));

    if (isEmpty(changes)) {
      // Disabled and clear notifications
      yield put(notificationActions.notificationToggle.success({ isEnabled: false }));
      yield put(
        notificationActions.notificationRemoveAll({
          things: [thing.thingName || ''],
          types: Object.values(SeverityType),
        }),
      );
      // Turn off Direct connection mode
      yield put(applicationActions.changeDirectConnectionState(false));
      yield put(applicationActions.setLastDevice(''));

      yield put(actions.devicesEmpty());
    } else {
      yield put(actions.devicesAddUpdate.success({ data: changes }));
    }
  }
}

/* ------------- Check is exists thing ------------- */
export function* checkDevices() {
  const things: Array<YetiState> = yield select(getDevicesInfoData);

  if (things && !isEmpty(things)) {
    yield put(actions.devicesExists());
  } else {
    yield put(actions.devicesEmpty());
  }
}

/* ------------- Change device Name ------------- */
export function* changeName(
  api: BackendApiType,
  { payload: { thingName, name, cb } }: ReturnType<typeof actions.devicesChangeName>,
): SagaIterator {
  let things: Array<YetiState> = [...(yield select(getDevicesInfoData))];
  const index = findIndex(propEq('thingName', thingName))(things as { thingName: string }[]);
  const isDirectConnection: boolean = things.find((t) => t.thingName === thingName)?.isDirectConnection || false;

  let response: { ok?: boolean } | ApiResponse<any> = {};

  if (!isDirectConnection) {
    response = yield call(api.alterYetiName, phoneId, thingName, name);
  }

  /*
    TODO: send request to backend when internet connection becomes available
    (may be be needed for User-Layer in future)
  */
  if (response?.ok || isDirectConnection) {
    const changedThing = mergeRight(things[index], { name });
    things = update(index, changedThing, things);

    yield put(actions.devicesAddUpdate.success({ data: things }));
    cb?.();
  } else {
    yield put(actions.devicesFailure());
  }
}

/* ------------- Check Yeti state in Direct connection mode ------------- */
// this saga runs every directGetStateTimeout (5s for WiFi, 7s for Bluetooth)
export function* checkCurrentState(
  api: DirectApiType,
  { payload: { peripheralId, deviceType, thingName } }: ReturnType<typeof actions.checkYetiState>,
) {
  let things: Array<DeviceState> = yield select(getDevicesInfoData);
  const device = things.find((t) => {
    if (t.dataTransferType === 'bluetooth') {
      return t?.peripheralId === peripheralId;
    }
    return t?.thingName === thingName;
  });
  const isBluetoothConnection = device?.dataTransferType === 'bluetooth';

  if (isEmpty(things) || !device || !device?.isDirectConnection) {
    yield put(actions.devicesFailure());
    return;
  }

  const requestFunction = isBluetoothConnection ? Bluetooth.getDeviceState : api.checkState;

  const response: ApiResponse<YetiState> = yield call(requestFunction, deviceType, peripheralId);

  let index = -1;
  let newState = {};
  // Get things state after request needs to get actual state
  // because in response can take 2-3 seconds
  things = yield select(getDevicesInfoData);
  let directFirmwareUpdateStartTime = (device as YetiState)?.directFirmwareUpdateStartTime || 0;

  if (
    directFirmwareUpdateStartTime &&
    differenceInMinutes(new Date(), new Date(directFirmwareUpdateStartTime * 1000)) > Config.directFirmwareUpdateMaxTime
  ) {
    directFirmwareUpdateStartTime = 0;
    showError('Please reconnect and check update status.', () => {}, 'Unable to verify update');
  }

  if (response?.ok && response?.data) {
    const { data } = response;
    // Find thing by thingName
    index = things.findIndex(
      (t) => (t.thingName === data.thingName || t.peripheralId === peripheralId) && t.model && t.isDirectConnection,
    );

    if (
      data.firmwareVersion &&
      data.firmwareVersion !== (things[index] as YetiState)?.firmwareVersion &&
      data.firmwareVersion !== 'undefined'
    ) {
      directFirmwareUpdateStartTime = 0;
      showInfo('Updated successfully.', `Version ${data.firmwareVersion}`);
    }

    const isConnected =
      differenceInMinutes(new Date(), new Date(directFirmwareUpdateStartTime * 1000)) >
      Config.directFirmwareUpdateMaxTime;

    newState = {
      ...data,
      isConnected,
      isLockAllPorts: false,
      isLockAllNotifications: false,
      isLockAllBatteryItems: false,
      isLockChangeAcsryTankCapacity: false,
      isLockChangeAcsryMode: false,
      isLockChangeChargingProfile: false,
      directFirmwareUpdateStartTime,
      dateSync: new Date().toISOString(), //update dateSync to current time, to keep track of when the last time we received a state update while in direct connection mode
    };
  }

  /*
   *  If can`t get response from Yeti after 3 attempts
   *  then try find Yeti by "isDirectConnection" state and set "isConnected" state to false
   */
  if (index === -1) {
    index = things.findIndex((t) => {
      if (isBluetoothConnection) {
        return t.peripheralId === peripheralId;
      }

      return t.isDirectConnection;
    });

    newState = {
      isConnected: false,
      isLockAllPorts: true,
      isLockAllNotifications: true,
      isLockChangeChargingProfile: true,
      isLockAllBatteryItems: true,
      directFirmwareUpdateStartTime,
    };
  }

  if (index !== -1) {
    const changedThing = mergeRight(things[index], newState);
    things = update(index, changedThing, things);
  }

  yield put(actions.devicesAddUpdate.success({ data: things }));
}

/* ------------- Get All Things Which Pairing with Phone ------------- */
export function* checkPairedThings(api: BackendApiType) {
  const response: ApiResponse<Array<YetiState>> = yield call(api.getThings, phoneId);

  if (response.ok || response.status === 404) {
    const data = pathOr([], ['data'], response);
    const things: Array<YetiState> = yield select(getDevicesInfoData);

    yield all(
      things.map((thing) => {
        const isExists = find((d) => thing.thingName === d)(data);

        // If not exists remove Thing
        if (!isExists && thing.usedAnywhereConnect) {
          // @ts-ignore as we probably can't narrow type here
          return call(removeDevice, {
            payload: { thingName: thing.thingName },
            type: '@DEVICES/DEVICES_REMOVE',
          });
        }

        return thing;
      }),
    );

    yield put(actions.checkPairedThings.success());
  } else {
    yield put(actions.checkPairedThings.failure());
  }
}

/* ------------- Common change state function ------------- */
function* changeDeviceDataState({ thingName, key, state }: { thingName: string; key: string; state: boolean }) {
  let things: Array<YetiState> = yield select(getDevicesInfoData);
  const index = findIndex(propEq('thingName', thingName))(things as { thingName: string }[]);

  if (index === -1) {
    yield put(actions.devicesFailure());
  } else {
    const changedThing = mergeDeepRight(things[index], { [key]: state });
    // @ts-ignore as we probably can't narrow type here
    things = update(index, changedThing, things);

    yield put(actions.devicesAddUpdate.success({ data: things }));
  }
}

/* ------------- Change All Ports disabled state ------------- */
export function* changeAllPortsState({ payload: { thingName, state } }: ReturnType<typeof actions.blockAllPorts>) {
  yield changeDeviceDataState({ thingName, key: 'isLockAllPorts', state });
}

/* ------------- Change All Notifications block state ------------- */
export function* changeAllNotificationsState({
  payload: { thingName, state },
}: ReturnType<typeof actions.blockAllNotifications>) {
  yield changeDeviceDataState({
    thingName,
    key: 'isLockAllNotifications',
    state,
  });
}

/* ------------- Change All battery items to block state ------------- */
export function* changeAllBatteryItemsState({
  payload: { thingName, state },
}: ReturnType<typeof actions.blockAllBatteryItems>) {
  yield changeDeviceDataState({
    thingName,
    key: 'isLockAllBatteryItems',
    state,
  });
}

/* ------------- Change Firmware Update Notification State ------------- */
export function* changeFirmwareUpdateNotificationState({
  payload: { thingName, state },
}: ReturnType<typeof actions.firmwareUpdateToggled>) {
  yield changeDeviceDataState({
    thingName,
    key: 'isShowFirmwareUpdateNotifications',
    state,
  });
}

/* ------------- Change Acsry Tank Capacity State ------------- */
export function* changeAcsryTankCapacityState({
  payload: { thingName, state },
}: ReturnType<typeof actions.lockAcsryCapacity>) {
  yield changeDeviceDataState({
    thingName,
    key: 'isLockChangeAcsryTankCapacity',
    state,
  });
}

/* ------------- Change Acsry Mode State ------------- */
export function* changeAcsryModeState({ payload: { thingName, state } }: ReturnType<typeof actions.lockAcsryMode>) {
  yield changeDeviceDataState({
    thingName,
    key: 'isLockChangeAcsryMode',
    state,
  });
  yield changeDeviceDataState({
    thingName,
    key: 'isLockChangeAcsryTankCapacity',
    state,
  });
}

/* ------------- Change Charging Profile State ------------- */
export function* changeChargingProfileState({
  payload: { thingName, state },
}: ReturnType<typeof actions.blockChargingProfile>) {
  yield changeDeviceDataState({
    thingName,
    key: 'isLockChangeChargingProfile',
    state,
  });
}

/* ------------- Change settings ------------- */
export function* changeSettings({ payload: { thingName, param, state } }: ReturnType<typeof actions.changeSettings>) {
  let things: Array<YetiState> = yield select(getDevicesInfoData);
  const index = findIndex(propEq('thingName', thingName))(things as { thingName: string }[]);

  if (index === -1) {
    yield put(actions.devicesFailure());
  } else {
    /* ----------- Update thing ---------- */
    const data = {
      settings: {
        [param]: state,
      },
    };
    const changedThing = mergeDeepRight(things[index], data);
    // @ts-ignore as we probably can't narrow type here
    things = update(index, changedThing, things);

    yield put(actions.devicesAddUpdate.success({ data: things }));
  }
}

/* ------------- Unpair Phone from Thing ------------- */
export function* unpairPhone(
  api: BackendApiType,
  { payload: { thingName } }: ReturnType<typeof actions.unpair.request>,
) {
  const things: Array<YetiState> = yield select(getDevicesInfoData);
  const isDirectConnection: boolean = things.find((t) => t.thingName === thingName)?.isDirectConnection || false;

  if (!isDirectConnection) {
    yield call(api.unpairPhoneFromThing, phoneId, thingName);
  } else {
    // Delay for correct change startUnpair state
    // If saga will be run very fast then state will not be changed
    yield delay(500);
  }

  yield call(removeDevice, {
    payload: { thingName },
    type: '@DEVICES/DEVICES_REMOVE',
  });
  yield put(actions.unpair.success());
}

export function* unpairAllDevices(api: BackendApiType) {
  const things: Array<DeviceState> = yield select(getDevicesInfoData);

  yield all(
    map(things, (thing: DeviceState) =>
      // @ts-ignore as we probably can't narrow type here
      call(unpairPhone, api, {
        type: '@DEVICES/UNPAIR_REQUEST',
        payload: { thingName: thing.thingName },
      }),
    ),
  );
}

export function* devicesSagas(directApi: DirectApiType, backendApi: BackendApiType): SagaIterator {
  yield all([
    takeLatest(actions.devicesCheck, checkDevices),
    takeLatest(actions.devicesAddUpdate.request, addOrUpdateDevice),
    takeLatest(actions.devicesUpdateAll.request, updateAllDevice),
    takeLatest(actions.devicesRemove, removeDevice),
    takeLatest(actions.changeSettings, changeSettings),
    takeLatest(actions.blockAllPorts, changeAllPortsState),
    takeLatest(actions.blockAllNotifications, changeAllNotificationsState),
    takeLatest(actions.blockChargingProfile, changeChargingProfileState),
    takeLatest(actions.blockAllBatteryItems, changeAllBatteryItemsState),

    takeLatest(actions.firmwareUpdateToggled, changeFirmwareUpdateNotificationState),
    takeLatest(actions.lockAcsryCapacity, changeAcsryTankCapacityState),
    takeLatest(actions.lockAcsryMode, changeAcsryModeState),

    /** AWS API */
    takeLatest(actions.devicesChangeName, changeName, backendApi),
    takeLatest(actions.unpair.request, unpairPhone, backendApi),
    takeLatest(actions.checkPairedThings.request, checkPairedThings, backendApi),

    /** Direct API */
    takeEvery(actions.checkYetiState, checkCurrentState, directApi),
  ]);
}
