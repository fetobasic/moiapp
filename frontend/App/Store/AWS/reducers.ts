import { createReducer, ActionType } from 'typesafe-actions';

import * as actions from './actions';

type ActionTypes = ActionType<typeof actions>;
type StateType = {
  isConnected: boolean;
};

export const initialState: StateType = {
  isConnected: false,
};

const appReducers = createReducer<StateType, ActionTypes>(initialState).handleAction(
  actions.awsChangeState.success,
  (state, { payload }) => ({
    ...state,
    isConnected: payload,
  }),
);

export default appReducers;
