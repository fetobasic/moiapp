/* eslint-disable @typescript-eslint/no-unused-vars */
import { runSaga } from 'redux-saga';
import {
  checkFirmwareVersions,
  checkForNewUpdates,
  checkUpdates,
  startOtaUpdate,
  updateCompleted,
  updateFirmware,
  uploadFirmwareVersionByType,
} from 'App/Store/FirmwareUpdate/sagas';
import * as actions from 'App/Store/FirmwareUpdate/actions';
import { initialState } from 'App/Store/FirmwareUpdate/reducers';
import { notificationSelectors } from 'App/Store/Notification';
import { devicesActions, devicesSelectors } from 'App/Store/Devices';
import { mockedState, yeti6GLatestFW } from 'App/Fixtures/mocks/mockedState';
import { getFirmwareUpdateData, getFirmwareVersions } from 'App/Store/FirmwareUpdate/selectors';
import { isSupportDirectConnection } from 'App/Services/FirmwareUpdates';
import { JOB_STATUS_CANCELED, JOB_STATUS_IN_PROGRESS } from 'App/Config/Aws';
import { showErrorDialogWithContactUs } from 'App/Services/Alert';
import { applicationSelectors } from 'App/Store/Application';
import { Bluetooth } from 'App/Containers/Home/HomeScreen';

const thingName = 'testThingName';

jest.mock('App/Store/FirmwareUpdate/selectors', () => ({
  getFirmwareUpdateData: jest.fn(() => ({ [thingName]: { jobId: '123' } })),
}));

describe('FirmwareUpdate sagas', () => {
  describe('checkUpdates', () => {
    const state = { ...initialState, firmwareUpdate: { data: { [thingName]: {} } } };

    test('should handle checking updates successfully', async () => {
      const mockApi = { checkForUpdates: jest.fn(() => ({ ok: true, data: {} })) };
      const dispatched: [] = [];

      await runSaga(
        { dispatch: (action) => dispatched.push(action), getState: () => state },
        checkUpdates,
        mockApi,
        actions.firmwareUpdate.request(thingName),
      ).toPromise();

      expect(dispatched).toEqual([
        actions.firmwareUpdate.success({
          data: { [thingName]: { jobId: '123' }, undefined: { fetchError: null, fetching: false, info: {} } },
        }),
      ]);
    });
    test('should handle checking updates with an error', async () => {
      const errorError = 'Error message';
      const mockApi = { checkForUpdates: jest.fn(() => ({ ok: false, data: { message: errorError } })) };

      const dispatched: [] = [];

      await runSaga(
        { dispatch: (action) => dispatched.push(action), getState: () => state },
        checkUpdates,
        mockApi,
        actions.firmwareUpdate.request(thingName),
      ).toPromise();

      expect(dispatched).toEqual([
        actions.firmwareUpdate.success({
          data: {
            undefined: { fetchError: errorError, fetching: false, info: { message: errorError } },
            [thingName]: { jobId: '123' },
          },
        }),
      ]);
    });
  });

  describe('checkForNewUpdates', () => {
    notificationSelectors.getIsNotificationsEnabled = jest.fn(() => true);
    const mockApi = {
      uploadFirmwareVersionByType: jest.fn(),
      getFirmwareVersions: jest.fn(() => ({ ok: true })),
      get6GFirmwareVersions: jest.fn(() => ({ ok: true })),
    };

    test('should handle updates when devices are not empty', async () => {
      devicesSelectors.getDevicesInfoData = jest.fn(() => mockedState.devicesInfo.data);
      getFirmwareVersions = jest.fn(() => mockedState.firmwareUpdate.firmwareVersions);
      isSupportDirectConnection = jest.fn(() => false);

      const dispatched: [] = [];

      await runSaga(
        { dispatch: (action) => dispatched.push(action), getState: () => initialState },
        checkForNewUpdates,
        mockApi,
      ).toPromise();

      expect(dispatched).toContainEqual(actions.firmwareCheckUpdates.success());
    });

    test('should handle updates when devices are empty', async () => {
      devicesSelectors.getDevicesInfoData = jest.fn(() => []);

      const dispatched: [] = [];

      await runSaga(
        { dispatch: (action) => dispatched.push(action), getState: () => initialState },
        checkForNewUpdates,
        mockApi,
      ).toPromise();

      expect(dispatched).toContainEqual(actions.firmwareCheckUpdates.failure());
    });
  });

  describe('updateFirmware', () => {
    const payload = { thingName, phoneId: 'phoneId', oldVersion: '1.0.0', newVersion: '1.1.1' };

    test('should handle a successful firmware update', async () => {
      const mockApi = { updateFirmware: jest.fn(() => ({ ok: true, data: { jobId: '123', newVersion: '1.1.1' } })) };

      const dispatched: [] = [];

      await runSaga(
        { dispatch: (action) => dispatched.push(action), getState: () => initialState },
        updateFirmware,
        mockApi,
        actions.firmwareUpdateNow({ payload }),
      ).toPromise();

      expect(dispatched).toEqual([
        actions.firmwareUpdate.success({
          data: {
            [thingName]: {
              jobId: '123',
            },
            undefined: {
              info: { jobId: '123', newVersion: '1.1.1' },
              jobId: '123',
              scheduleError: null,
              scheduling: false,
              updating: true,
            },
          },
        }),
      ]);
    });

    test('should handle a failed firmware update', async () => {
      const mockApi = { updateFirmware: jest.fn(() => ({ ok: false, data: '' })) };

      const dispatched: [] = [];

      await runSaga(
        { dispatch: (action) => dispatched.push(action), getState: () => initialState },
        updateFirmware,
        mockApi,
        actions.firmwareUpdateNow({ payload }),
      ).toPromise();

      expect(dispatched).toEqual([
        actions.firmwareUpdate.success({
          data: {
            [thingName]: {
              jobId: '123',
            },
            undefined: {
              info: { jobId: null, newVersion: undefined },
              jobId: null,
              scheduleError: 'Could not schedule the update. Try again later.',
              scheduling: false,
              updating: false,
            },
          },
        }),
      ]);
    });
  });

  describe('updateCompleted', () => {
    const jobInfo = { jobId: '123', version: '1.1.1', thingName };

    test('should handle a completed firmware update', async () => {
      const dispatched: [] = [];

      await runSaga(
        { dispatch: (action) => dispatched.push(action), getState: () => initialState },
        updateCompleted,
        actions.firmwareUpdateCompleted({ jobInfo, progress: 100 }),
      ).toPromise();

      expect(dispatched).toEqual([
        devicesActions.devicesAddUpdate.request({ data: { firmwareVersion: undefined }, thingName }),
        actions.firmwareUpdate.success({
          data: { [thingName]: { jobId: '123', progress: 0, successUpdated: true, updating: false } },
        }),
      ]);
    });

    test('should handle a canceled firmware update', async () => {
      const dispatched: [] = [];

      await runSaga(
        { dispatch: (action) => dispatched.push(action), getState: () => initialState },
        updateCompleted,
        actions.firmwareUpdateCompleted({ status: JOB_STATUS_CANCELED, jobInfo, progress: 0 }),
      ).toPromise();

      expect(dispatched).toEqual([
        actions.firmwareUpdateCanceled({
          data: {
            [thingName]: {
              updating: false,
              updateError: 'Could not update the firmware. Try again later.',
              jobId: '123',
            },
          },
        }),
      ]);
    });

    test('should handle an in-progress firmware update', async () => {
      const dispatched: [] = [];

      await runSaga(
        { dispatch: (action) => dispatched.push(action), getState: () => initialState },
        updateCompleted,
        actions.firmwareUpdateCompleted({ status: JOB_STATUS_IN_PROGRESS, jobInfo, progress: 75 }),
      ).toPromise();

      expect(dispatched).toEqual([
        actions.firmwareUpdate.success({ data: { [thingName]: { jobId: '123', progress: 75 } } }),
      ]);
    });

    test('should handle an update failure with contact information', async () => {
      getFirmwareUpdateData = jest.fn(() => ({ [thingName]: { jobId: '' } }));
      const dispatched: [] = [];

      showErrorDialogWithContactUs = jest.fn((message, callback) => {
        callback();
      });

      await runSaga(
        { dispatch: (action) => dispatched.push(action), getState: () => initialState },
        updateCompleted,
        actions.firmwareUpdateCompleted({ status: '', jobInfo, progress: 75 }),
      ).toPromise();

      expect(dispatched).toContainEqual(actions.firmwareUpdate.failure());
    });
  });

  describe('uploadFirmwareVersionByType', () => {
    const mockApi = {
      getFirmwareVersions: jest.fn(() => ({ ok: true, data: [{ version: '1.0.0' }] })),
      get6GFirmwareVersions: jest.fn(() => ({ ok: true, data: [{ version: '1.0.0' }] })),
    };
    const payload = { deviceType: 'Y6G', hostId: 'testHostId' };

    test('should handle a successful firmware version upload for YETI', async () => {
      const dispatched: [] = [];

      await runSaga(
        { dispatch: (action) => dispatched.push(action) },
        uploadFirmwareVersionByType,
        mockApi,
        actions.firmwareCheckUpdatesByType.request({ ...payload, deviceType: 'YETI' }),
      ).toPromise();

      expect(dispatched).toEqual([
        actions.firmwareVersions.success({ deviceType: 'YETI', firmwareVersions: [{ version: '1.0.0' }] }),
      ]);
    });

    test('should handle a successful firmware version upload for 6G', async () => {
      const dispatched: [] = [];

      await runSaga(
        { dispatch: (action) => dispatched.push(action) },
        uploadFirmwareVersionByType,
        mockApi,
        actions.firmwareCheckUpdatesByType.request(payload),
      ).toPromise();

      expect(dispatched).toEqual([
        actions.firmwareVersions.success({ deviceType: 'Y6G', firmwareVersions: [{ version: '1.0.0' }] }),
      ]);
    });

    test('should handle a failed firmware version upload', async () => {
      const _mockApi = { ...mockApi, get6GFirmwareVersions: jest.fn(() => ({ ok: false })) };
      const dispatched: [] = [];

      await runSaga(
        { dispatch: (action) => dispatched.push(action) },
        uploadFirmwareVersionByType,
        _mockApi,
        actions.firmwareCheckUpdatesByType.request(payload),
      ).toPromise();

      expect(dispatched).toContainEqual(actions.firmwareVersions.failure());
    });
  });

  describe('startOtaUpdate ', () => {
    const mockApi = { updateYetiOta: jest.fn(() => ({ ok: true })) };
    Bluetooth.connectOta = jest.fn(() => ({ ok: true }));

    test('should handle a successful OTA update via Bluetooth', async () => {
      devicesSelectors.getDevicesInfoData = jest.fn(() => [yeti6GLatestFW]);
      applicationSelectors.getDataTransferType = jest.fn(() => 'bluetooth');

      const dispatched: [] = [];

      await runSaga(
        { dispatch: (action) => dispatched.push(action), getState: () => initialState },
        startOtaUpdate,
        mockApi,
        actions.updateOta.request({}),
      ).toPromise();

      expect(dispatched).toContainEqual(actions.updateOta.success());
    });

    test('should handle a failed OTA update via Bluetooth', async () => {
      Bluetooth.connectOta = jest.fn(() => ({ ok: false }));

      const dispatched: [] = [];

      await runSaga(
        { dispatch: (action) => dispatched.push(action), getState: () => initialState },
        startOtaUpdate,
        mockApi,
        actions.updateOta.request({}),
      ).toPromise();

      expect(dispatched).toContainEqual(actions.updateOta.failure());
    });

    test('should handle an OTA update when connected via Wi-Fi', async () => {
      applicationSelectors.getDataTransferType = jest.fn(() => 'wi-fi');
      const dispatched: [] = [];

      await runSaga(
        { dispatch: (action) => dispatched.push(action), getState: () => initialState },
        startOtaUpdate,
        mockApi,
        actions.updateOta.request({}),
      ).toPromise();

      expect(dispatched).toContainEqual(actions.updateOta.success());
    });

    test('should handle cloud connect', async () => {
      devicesSelectors.getDevicesInfoData = jest.fn(() => [{ isDirectConnection: false }]);
      const dispatched: [] = [];

      await runSaga(
        { dispatch: (action) => dispatched.push(action), getState: () => initialState },
        startOtaUpdate,
        mockApi,
        actions.updateOta.request({}),
      ).toPromise();

      expect(dispatched).toContainEqual(actions.updateOta.success());
    });
  });

  describe('checkFirmwareVersions Saga', () => {
    test('should handle firmware versions check when old version is different', async () => {
      const payload = { thingName, oldVersion: '1.0.0' };

      const dispatched: [] = [];

      await runSaga(
        { dispatch: (action) => dispatched.push(action), getState: () => initialState },
        checkFirmwareVersions,
        actions.firmwareUpdateCheckVersions(payload),
      ).toPromise();

      expect(dispatched).toHaveLength(0);
    });

    test('should handle firmware versions check when updating and old version matches new version', async () => {
      const payload = { thingName, oldVersion: '0.0.1' };
      getFirmwareUpdateData = jest.fn(() => ({ [thingName]: { updating: true } }));

      const dispatched: [] = [];

      await runSaga(
        { dispatch: (action) => dispatched.push(action), getState: () => initialState },
        checkFirmwareVersions,
        actions.firmwareUpdateCheckVersions(payload),
      ).toPromise();

      expect(dispatched).toEqual([actions.firmwareUpdate.success({ data: { [thingName]: { updating: false } } })]);
    });
  });
});
