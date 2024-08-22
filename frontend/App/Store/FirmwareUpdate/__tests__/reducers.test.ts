import { firmwareUpdateReducers } from 'App/Store/FirmwareUpdate';
import { initialState } from 'App/Store/FirmwareUpdate/reducers';
import * as actions from 'App/Store/FirmwareUpdate/actions';

describe('FirmwareUpdate reducers', () => {
  describe('firmwareUpdate', () => {
    test('should handle actions.firmwareUpdate.request', () => {
      const thingName = 'device123';
      const newState = firmwareUpdateReducers(initialState, actions.firmwareUpdate.request({ thingName }));

      expect(newState).toEqual({
        ...initialState,
        data: {
          ...initialState.data,
          [thingName]: {
            fetching: true,
            scheduling: false,
            updating: false,
            fetchError: null,
            scheduleError: null,
            updateError: null,
            jobId: null,
            info: null,
            progress: 0,
          },
        },
      });
    });

    test('should handle actions.firmwareUpdate.success', () => {
      const data = { thing123: {} };

      const newState = firmwareUpdateReducers(initialState, actions.firmwareUpdate.success({ data }));

      expect(newState).toEqual({ ...initialState, data });
    });
  });

  test('should handle actions.firmwareUpdateCanceled', () => {
    const data = { thingName: {} };

    const newState = firmwareUpdateReducers(initialState, actions.firmwareUpdateCanceled({ data }));

    expect(newState).toEqual({ ...initialState, data });
  });

  test('should handle actions.firmwareUpdateNow', () => {
    const thingName = 'device123';

    const newState = firmwareUpdateReducers(initialState, actions.firmwareUpdateNow({ thingName }));

    expect(newState).toEqual({
      ...initialState,
      data: {
        ...initialState.data,
        [thingName]: {
          scheduling: true,
          updating: false,
          successUpdated: false,
          scheduleError: null,
          jobId: null,
          progress: 0,
        },
      },
    });
  });

  test('should handle actions.firmwareClearUpdateInfo', () => {
    const thingName = 'device123';

    const newState = firmwareUpdateReducers(initialState, actions.firmwareClearUpdateInfo({ thingName }));

    expect(newState).toEqual({ ...initialState, successOta: false, data: {} });
  });

  test('should handle actions.firmwareVersions.success', () => {
    const deviceType = 'deviceType1';
    const firmwareVersions = { version1: '1.0', version2: '2.0' };

    const newState = firmwareUpdateReducers(
      initialState,
      actions.firmwareVersions.success({ deviceType, firmwareVersions }),
    );

    expect(newState).toEqual({
      ...initialState,
      firmwareVersions: {
        deviceType1: {
          version1: '1.0',
          version2: '2.0',
        },
      },
    });
  });

  describe('updateOta', () => {
    test('should handle actions.updateOta.request', () => {
      const newState = firmwareUpdateReducers(initialState, actions.updateOta.request());

      expect(newState).toEqual({ ...initialState, startOta: true, successOta: false });
    });

    test('should handle actions.updateOta.success', () => {
      const newState = firmwareUpdateReducers(initialState, actions.updateOta.success());

      expect(newState).toEqual({ ...initialState, startOta: false, successOta: true });
    });

    test('should handle actions.updateOta.failure', () => {
      const newState = firmwareUpdateReducers(initialState, actions.updateOta.failure());

      expect(newState).toEqual({ ...initialState, startOta: false, successOta: false });
    });
  });
});
