import { call, put, select, all, takeLatest } from 'redux-saga/effects';
import { SagaIterator } from '@redux-saga/types';
import { map, isEmpty, update, mergeRight } from 'ramda';
import { ApiResponse } from 'apisauce';

import { JOB_STATUS_CANCELED, JOB_STATUS_IN_PROGRESS, JOB_STATUS_SUCCEEDED } from 'App/Config/Aws';

import { showError, showErrorDialogWithContactUs } from 'App/Services/Alert';

import { isLatestVersion, isCheckUpdateTimedOut, isSupportDirectConnection } from 'App/Services/FirmwareUpdates';
import { showLocalNotification } from 'App/Services/PushNotification';

import * as actions from './actions';
import { getFirmwareUpdateData, getFirmwareVersions } from './selectors';
import { devicesActions, devicesSelectors } from 'App/Store/Devices';
import { notificationSagas, notificationSelectors } from 'App/Store/Notification';
import { navigate } from 'App/Navigation/AppNavigation';
import { SubjectType } from 'App/Types/FeedbackForm';
import { SeverityType, StoredNotification } from 'App/Types/Notification';
import { BackendApiType, DirectApiType } from 'App/Store/rootSaga';
import { Yeti6GState, YetiState } from 'App/Types/Yeti';
import {
  Firmware6GVersion,
  FirmwareUpdateDataType,
  FirmwareVersion,
  StartOtaResponse,
  UpdateFirmwareResponse,
} from 'App/Types/FirmwareUpdate';
import { CommonError } from 'App/Types/BackendApi';
import { Bluetooth } from 'App/Containers/Home/HomeScreen';
import { DataTransferType } from 'App/Types/ConnectionType';
import { applicationSelectors } from '../Application';
import { FridgeState } from 'App/Types/Fridge';
import { DeviceState } from 'App/Types/Devices';
import { getUnixTime } from 'date-fns';

export function* checkUpdates(
  api: BackendApiType,
  { payload: { thingName } }: ReturnType<typeof actions.firmwareUpdate.request>,
) {
  const response: ApiResponse<FirmwareVersion> = yield call(api.checkForUpdates);

  const firmwareUpdatesInfo: FirmwareUpdateDataType = { ...(yield select(getFirmwareUpdateData)) };
  const info = response?.data;

  let fetchError = null;

  if (!response.ok) {
    fetchError = (info as CommonError)?.message || 'Firmware update error. Try again later.';
  }

  firmwareUpdatesInfo[thingName] = mergeRight(firmwareUpdatesInfo[thingName], {
    fetching: false,
    fetchError,
    info,
  });

  yield put(actions.firmwareUpdate.success({ data: firmwareUpdatesInfo }));
}

export function* checkForNewUpdates(api: BackendApiType) {
  const isNotificationsEnabled: boolean = yield select(notificationSelectors.getIsNotificationsEnabled);
  let things: Array<DeviceState> = yield select(devicesSelectors.getDevicesInfoData);

  if (!isEmpty(things)) {
    yield all(
      map(
        (thing) =>
          // @ts-ignore we likely can't ensure TS that types are correct here
          call(uploadFirmwareVersionByType, api, {
            payload: {
              deviceType: thing.deviceType,
              hostId: (thing as Yeti6GState).hostId || (thing as Yeti6GState).device?.identity?.hostId || '',
            },
            type: '@FIRMWARE_UPDATE/FIRMWARE_CHECK_UPDATES_BY_TYPE_REQUEST',
          }),
        things,
      ),
    );

    const firmwareVersions: { [deviceType: string]: FirmwareVersion[] } = yield select(getFirmwareVersions);
    const notifications: StoredNotification[] = [];

    //Update things after getting firmware versions because it's taking some time
    things = yield select(devicesSelectors.getDevicesInfoData);

    things = map((thing) => {
      type Copy = typeof thing & {
        lastNotification?: {
          version?: string;
          time: Date;
        };
      };

      const copy: Copy = { ...thing };
      const info = firmwareVersions[thing?.deviceType || '']?.[0];
      const firmwareVersion = (thing as YetiState)?.firmwareVersion || (thing as Yeti6GState)?.device?.fw || '';

      if (
        isNotificationsEnabled &&
        Boolean(info?.version) &&
        (thing as Exclude<DeviceState, FridgeState>).isShowFirmwareUpdateNotifications &&
        !isLatestVersion(firmwareVersion, info) &&
        isCheckUpdateTimedOut(thing, info)
      ) {
        let hintText = '';

        if (!isSupportDirectConnection(firmwareVersion)) {
          hintText = '. Please update to continue receiving notifications.';
        }

        const now = new Date();
        const notification: Omit<StoredNotification, 'title'> = {
          id: '0',
          thingName: thing.thingName || '',
          type: 'firmwareUpdate',
          message: `New version of firmware is available: ${info?.version}${hintText}`,
          date: now,
          timestamp: Math.round(now.getTime() / 1000),
          severity: SeverityType.NOTICE,
        };

        showLocalNotification(notification.message, notification.thingName, notification.type);

        copy.lastNotification = {
          version: info?.version,
          time: now,
        };

        notifications.push(notification as StoredNotification);
      }

      return copy;
    }, things);

    if (!isEmpty(notifications)) {
      yield all(
        map(
          (notification) =>
            // @ts-ignore we likely can't ensure TS that types are correct here
            call(notificationSagas.addNotification, {
              payload: { notification },
              type: '@NOTIFICATION/NOTIFICATION_ADD_REQUEST',
            }),
          notifications,
        ),
      );
    }

    // Update only lastNotification field
    yield all(
      map((thing) => {
        // @ts-ignore
        if (thing.lastNotification) {
          return put(
            devicesActions.devicesAddUpdate.request({
              thingName: thing.thingName || '',
              // @ts-ignore
              data: { lastNotification: thing.lastNotification },
            }),
          );
        }

        return null;
      }, things),
    );

    yield put(actions.firmwareCheckUpdates.success());
  } else {
    yield put(actions.firmwareCheckUpdates.failure());
  }
}

export function* updateFirmware(
  api: BackendApiType,
  { payload: { thingName, phoneId, oldVersion, newVersion } }: ReturnType<typeof actions.firmwareUpdateNow>,
) {
  const response: ApiResponse<UpdateFirmwareResponse> = yield call(
    api.updateFirmware,
    thingName,
    phoneId,
    oldVersion,
    newVersion,
  );

  const firmwareUpdatesInfo: FirmwareUpdateDataType = { ...(yield select(getFirmwareUpdateData)) };
  let info = response?.data;

  let scheduleError = null;

  if (!response.ok) {
    const defaultError = 'Could not schedule the update. Try again later.';
    if (Array.isArray(info) && info.length > 0 && info[0].startsWith('Similar job was created:')) {
      scheduleError = 'A similar update has already been scheduled.';
    } else {
      scheduleError =
        response.status && response.status >= 500
          ? defaultError
          : info?.jobId || (info as CommonError)?.message || defaultError;
    }
  }

  let jobId = null;
  let updating = false;

  if (info && info.jobId) {
    ({ jobId } = info);
    updating = true;
  }

  if (scheduleError && !info) {
    info = {
      jobId: null,
      newVersion,
    };
  }

  firmwareUpdatesInfo[thingName] = mergeRight(firmwareUpdatesInfo[thingName], {
    scheduling: false,
    updating,
    scheduleError,
    jobId,
    info,
  });

  yield put(actions.firmwareUpdate.success({ data: firmwareUpdatesInfo }));
}

export function* updateCompleted({
  payload: { status, jobInfo, progress },
}: ReturnType<typeof actions.firmwareUpdateCompleted>) {
  const firmwareUpdatesInfo: FirmwareUpdateDataType = { ...(yield select(getFirmwareUpdateData)) };
  const index = Object.values(firmwareUpdatesInfo).findIndex((e) => e.jobId === jobInfo.jobId);

  if (index === -1) {
    showErrorDialogWithContactUs('Could not update the firmware. Try again later.', () => {
      navigate('EmailUs', {
        feedbackSubject: SubjectType.FIRMWARE_UPDATE_FAILURE,
        firmwareVersionFailed: jobInfo.version,
        thingName: jobInfo.thingName,
      });
    });
    yield put(actions.firmwareUpdate.failure());
    return;
  }

  const thingName = Object.keys(firmwareUpdatesInfo)[index];

  if (status === JOB_STATUS_CANCELED) {
    const updateError = 'Could not update the firmware. Try again later.';

    firmwareUpdatesInfo[thingName] = mergeRight(firmwareUpdatesInfo[thingName], {
      updating: false,
      updateError,
    });

    yield put(actions.firmwareUpdateCanceled({ data: firmwareUpdatesInfo }));
    return;
  }

  if (status === JOB_STATUS_SUCCEEDED || progress === 100) {
    const firmwareVersion = (firmwareUpdatesInfo?.[thingName]?.info as UpdateFirmwareResponse)?.newVersion;
    const data = {
      firmwareVersion,
    };

    yield put(devicesActions.devicesAddUpdate.request({ thingName, data }));

    firmwareUpdatesInfo[thingName] = mergeRight(firmwareUpdatesInfo[thingName], {
      updating: false,
      progress: 0,
      successUpdated: true,
    });

    yield put(actions.firmwareUpdate.success({ data: firmwareUpdatesInfo }));
    return;
  }

  if (status === JOB_STATUS_IN_PROGRESS) {
    firmwareUpdatesInfo[thingName] = mergeRight(firmwareUpdatesInfo[thingName], {
      progress,
    });

    yield put(actions.firmwareUpdate.success({ data: firmwareUpdatesInfo }));
  }
}

export function* uploadFirmwareVersionByType(
  api: BackendApiType,
  { payload: { deviceType, hostId } }: ReturnType<typeof actions.firmwareCheckUpdatesByType.request>,
) {
  const response: ApiResponse<FirmwareVersion[] | Firmware6GVersion[]> =
    deviceType === 'YETI'
      ? yield call(api.getFirmwareVersions, -1, 10)
      : yield call(api.get6GFirmwareVersions, hostId, 10);

  if (response.ok) {
    const data = response.data || [];

    yield put(actions.firmwareVersions.success({ deviceType, firmwareVersions: data }));
  } else {
    yield put(actions.firmwareVersions.failure());
  }
}

export function* startOtaUpdate(api: DirectApiType, { payload }: ReturnType<typeof actions.updateOta.request>) {
  const dataTransferType: DataTransferType = yield select(applicationSelectors.getDataTransferType);
  const isBluetoothConnection = dataTransferType === 'bluetooth';

  const requestFunction = isBluetoothConnection ? Bluetooth.connectOta : api.updateYetiOta;

  //@ts-ignore
  const response: ApiResponse<StartOtaResponse> = yield call(requestFunction, payload, payload.peripheralId);

  if (response.ok) {
    yield put(actions.updateOta.success());

    /** Set Disconnected state and Lock all ports */
    let things: YetiState[] = yield select(devicesSelectors.getDevicesInfoData);
    const index = things.findIndex((thing) => thing.isDirectConnection);

    if (index === -1) {
      return;
    }

    const newState = {
      isConnected: false,
      isLockAllPorts: true,
      directFirmwareUpdateStartTime: getUnixTime(new Date()),
    };

    const changedThing = mergeRight(things[index], newState);
    things = update(index, changedThing, things);

    yield put(devicesActions.devicesAddUpdate.success({ data: things }));
  } else {
    yield put(actions.updateOta.failure());
    showError('The configured network requires a password or the password was incorrect. Please try again.');
  }
}

export function* checkFirmwareVersions({
  payload: { thingName, oldVersion },
}: ReturnType<typeof actions.firmwareUpdateCheckVersions>) {
  const firmwareUpdatesInfo: FirmwareUpdateDataType = { ...(yield select(getFirmwareUpdateData)) };
  const updating = firmwareUpdatesInfo?.[thingName]?.updating || false;
  const newVersion = (firmwareUpdatesInfo?.[thingName]?.info as UpdateFirmwareResponse)?.newVersion || '0.0.1';

  if (!updating || oldVersion !== newVersion) {
    return;
  }

  firmwareUpdatesInfo[thingName] = mergeRight(firmwareUpdatesInfo[thingName], {
    updating: false,
  });

  yield put(actions.firmwareUpdate.success({ data: firmwareUpdatesInfo }));
}

export default function* firmwareUpdateSaga(directApi: DirectApiType, backendApi: BackendApiType): SagaIterator {
  yield all([
    takeLatest(actions.firmwareUpdateCompleted, updateCompleted),
    takeLatest(actions.firmwareUpdateCheckVersions, checkFirmwareVersions),

    /** AWS API */
    takeLatest(actions.firmwareUpdate.request, checkUpdates, backendApi),
    takeLatest(actions.firmwareUpdateNow, updateFirmware, backendApi),
    takeLatest(actions.firmwareCheckUpdates.request, checkForNewUpdates, backendApi),
    takeLatest(actions.firmwareCheckUpdatesByType.request, uploadFirmwareVersionByType, backendApi),

    /** Direct API */
    takeLatest(actions.updateOta.request, startOtaUpdate, directApi),
  ]);
}
