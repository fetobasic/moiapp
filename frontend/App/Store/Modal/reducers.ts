import { createReducer, ActionType } from 'typesafe-actions';
import { ModalParams } from 'App/Types/modalTypes';

import * as actions from './actions';

type ActionTypes = ActionType<typeof actions>;
type StateType = {
  isVisible: boolean;
  params: ModalParams;
};

export const initialState: StateType = {
  isVisible: false,
  params: {} as ModalParams,
};

const appReducers = createReducer<StateType, ActionTypes>(initialState).handleAction(
  actions.modalToggle,
  (state, { payload: { isVisible, params = {} as ModalParams } }) => ({
    ...state,
    isVisible,
    params,
  }),
);

export default appReducers;
