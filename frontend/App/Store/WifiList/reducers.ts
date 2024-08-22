import { createReducer, ActionType } from 'typesafe-actions';
import { WiFiList } from 'App/Types/Yeti';

import * as actions from './actions';

type ActionTypes = ActionType<typeof actions>;
type StateType = {
  fetching: boolean;
  error: boolean;
  data: WiFiList[];
};

export const initialState: StateType = {
  fetching: false,
  error: false,
  data: [],
};

const appReducers = createReducer<StateType, ActionTypes>(initialState)
  .handleAction(actions.wifi.request, (state) => ({
    ...state,
    fetching: true,
  }))
  .handleAction(actions.wifi.success, (state, { payload: { data } }) => ({
    ...state,
    fetching: false,
    error: false,
    data,
  }))
  .handleAction(actions.wifi.failure, (state) => ({
    ...state,
    fetching: false,
    error: true,
    data: [],
  }))
  .handleAction(actions.clearWifiList, (state) => ({
    ...state,
    fetching: false,
    error: false,
    data: [],
  }))
  .handleAction(actions.bluetoothWifi, (state) => ({
    ...state,
    fetching: true,
  }));

export default appReducers;
