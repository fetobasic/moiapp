import { createReducer, ActionType } from 'typesafe-actions';
import * as actions from './actions';

import { DeviceState } from 'App/Types/Devices';

type ActionTypes = ActionType<typeof actions>;
type StateType = {
  data: Array<DeviceState>;
  startUnpair: boolean;
  error: any;
};

export const initialState: StateType = {
  error: null,
  data: [],
  startUnpair: false,
};

const devicesReducers = createReducer<StateType, ActionTypes>(initialState)
  .handleAction(actions.devicesExists, (state) => ({
    ...state,
    error: null,
  }))
  .handleAction(actions.devicesEmpty, (state) => ({
    ...state,
    error: null,
    data: [],
  }))
  .handleAction(actions.devicesAddUpdate.success, (state, { payload: { data } }) => ({
    ...state,
    error: null,
    data,
  }))
  .handleAction(actions.devicesUpdateAll.success, (state, { payload: { data } }) => ({
    ...state,
    error: null,
    data,
  }))
  .handleAction(actions.devicesFailure, (state) => ({
    ...state,
    error: true,
  }))
  .handleAction(actions.unpair.request, (state) => ({
    ...state,
    startUnpair: true,
  }))
  .handleAction(actions.unpair.success, (state) => ({
    ...state,
    startUnpair: false,
  }));

export default devicesReducers;
