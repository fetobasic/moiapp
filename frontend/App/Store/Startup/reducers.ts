import { createReducer, ActionType } from 'typesafe-actions';

import * as actions from './actions';

type ActionTypes = ActionType<typeof actions>;
type StateType = {
  isAppLoaded: boolean;
};

export const initialState: StateType = {
  isAppLoaded: false,
};

const appReducers = createReducer<StateType, ActionTypes>(initialState).handleAction(actions.finish, (state) => ({
  ...state,
  isAppLoaded: true,
}));

export default appReducers;
