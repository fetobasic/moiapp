import { createReducer, ActionType } from 'typesafe-actions';

import * as actions from './actions';

type ActionTypes = ActionType<typeof actions>;
type StateType = {
  appRateInfo: {
    isBlockedShowAppRate: boolean;
    isReadyToShowAppRate: boolean;
  };
};

export const initialState: StateType = {
  appRateInfo: {
    isBlockedShowAppRate: false,
    isReadyToShowAppRate: false,
  },
};

const appReducers = createReducer<StateType, ActionTypes>(initialState).handleAction(
  actions.changeAppRateInfo,
  (state, { payload }) => ({
    ...state,
    appRateInfo: {
      ...state.appRateInfo,
      isBlockedShowAppRate: payload.isBlockedShowAppRate || state.appRateInfo.isBlockedShowAppRate,
      isReadyToShowAppRate: payload.isReadyToShowAppRate || state.appRateInfo.isReadyToShowAppRate,
    },
  }),
);

export default appReducers;
