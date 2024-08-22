import { createReducer, ActionType } from 'typesafe-actions';
import { FirmwareUpdateDataType, FirmwareVersion } from 'App/Types/FirmwareUpdate';

import * as actions from './actions';

type ActionTypes = ActionType<typeof actions>;
type StateType = {
  data: FirmwareUpdateDataType;
  firmwareVersions: { [deviceType: string]: FirmwareVersion[] };
  startOta: boolean;
  successOta: boolean;
  updating?: boolean;
};

export const initialState: StateType = {
  data: {},
  firmwareVersions: {},
  startOta: false,
  successOta: false,
};

const appReducers = createReducer<StateType, ActionTypes>(initialState)
  .handleAction(actions.firmwareUpdate.request, (state, { payload: { thingName } }) => ({
    ...state,
    data: {
      ...state.data,
      [thingName]: {
        ...state.data[thingName],
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
  }))
  .handleAction(actions.firmwareUpdate.success, (state, { payload: { data } }) => ({
    ...state,
    data,
  }))
  .handleAction(actions.firmwareUpdateCanceled, (state, { payload: { data } }) => ({
    ...state,
    data,
  }))
  .handleAction(actions.firmwareUpdateNow, (state, { payload: { thingName } }) => ({
    ...state,
    data: {
      ...state.data,
      [thingName]: {
        ...state.data[thingName],
        scheduling: true,
        updating: false,
        successUpdated: false,
        scheduleError: null,
        jobId: null,
        progress: 0,
      },
    },
  }))
  .handleAction(actions.firmwareClearUpdateInfo, (state, { payload: { thingName } }) => {
    const data = { ...state.data };
    delete data[thingName];

    return {
      ...state,
      successOta: false,
      data,
    };
  })
  .handleAction(actions.firmwareVersions.success, (state, { payload: { deviceType, firmwareVersions } }) => ({
    ...state,
    firmwareVersions: {
      ...state.firmwareVersions,
      [deviceType]: firmwareVersions,
    },
  }))
  .handleAction(actions.updateOta.request, (state) => ({
    ...state,
    startOta: true,
    successOta: false,
  }))
  .handleAction(actions.updateOta.success, (state) => ({
    ...state,
    startOta: false,
    successOta: true,
  }))
  .handleAction(actions.updateOta.failure, (state) => ({
    ...state,
    startOta: false,
    successOta: false,
  }));

export default appReducers;
