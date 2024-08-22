import { createReducer, ActionType } from 'typesafe-actions';
import { BluetoothDevice } from 'App/Types/BluetoothDevices';

import * as actions from './actions';
import { YetiDirectInfo, YetiSysInfo, Yeti6GState } from 'App/Types/Yeti';

type ActionTypes = ActionType<typeof actions>;
type StateType = {
  fetching: any;
  error: any;
  data: any;
  joinData?: YetiSysInfo;
  passwordChange: {
    inProgress: boolean | null;
    error: any;
  };
  directData?: YetiDirectInfo | Yeti6GState;
  startPairConfirmed: boolean;
  startPairError: boolean;
  discoveredDevices: BluetoothDevice[];
  fetchingYetiInfo: boolean;
};

export const initialState: StateType = {
  fetching: null,
  error: null,
  data: null,
  joinData: undefined,

  passwordChange: {
    inProgress: null,
    error: null,
  },

  directData: undefined,

  startPairConfirmed: false,
  startPairError: false,

  discoveredDevices: [],

  fetchingYetiInfo: false,
};

const appReducers = createReducer<StateType, ActionTypes>(initialState)
  .handleAction(actions.yetiJoin.request, (state) => ({
    ...state,
    fetching: true,
    error: false,
    joinData: undefined,
  }))
  .handleAction(actions.yetiJoin.success, (state, { payload: { data } }) => ({
    ...state,
    fetching: false,
    error: null,
    joinData: data,
  }))
  .handleAction(actions.yetiJoin.failure, (state) => ({
    ...state,
    fetching: false,
    error: true,
    joinData: undefined,
  }))
  .handleAction(actions.yetiReset, (state) => ({
    ...state,
    joinData: undefined,
    data: null,
  }))
  .handleAction(actions.yetiInfo.request, (state) => ({
    ...state,
    fetchingYetiInfo: true,
    data: null,
  }))
  .handleAction(actions.yetiInfo.success, (state, { payload: { data } }) => ({
    ...state,
    fetchingYetiInfo: false,
    data,
  }))
  .handleAction(actions.yetiInfo.failure, (state) => ({
    ...state,
    fetchingYetiInfo: false,
    data: null,
  }))
  .handleAction(actions.yetiSetPassword.request, (state) => ({
    ...state,
    passwordChange: {
      inProgress: true,
      error: null,
    },
  }))
  .handleAction(actions.yetiSetPassword.success, (state) => ({
    ...state,
    passwordChange: {
      inProgress: false,
      error: null,
    },
  }))
  .handleAction(actions.yetiSetPassword.failure, (state, { payload: { error } }) => ({
    ...state,
    passwordChange: {
      inProgress: false,
      error,
    },
  }))
  .handleAction(actions.directConnect.request, (state) => ({
    ...state,
    directData: undefined,
  }))
  .handleAction(actions.directConnect.success, (state, { payload: { directData } }) => ({
    ...state,
    fetching: false,
    error: null,
    directData,
  }))
  .handleAction(actions.directConnect.failure, (state) => ({
    ...state,
    fetching: false,
    error: true,
    directData: undefined,
  }))
  .handleAction(actions.clearDirectData, (state) => ({
    ...state,
    directData: undefined,
  }))
  .handleAction(actions.startPair.request, (state) => ({
    ...state,
    startPairConfirmed: false,
    startPairError: false,
  }))
  .handleAction(actions.startPair.success, (state) => ({
    ...state,
    startPairConfirmed: true,
    startPairError: false,
  }))
  .handleAction(actions.startPair.failure, (state) => ({
    ...state,
    startPairConfirmed: false,
    startPairError: true,
  }))
  .handleAction(actions.discoveredDevices.success, (state, { payload: { discoveredDevices } }) => ({
    ...state,
    discoveredDevices,
  }));

export default appReducers;
