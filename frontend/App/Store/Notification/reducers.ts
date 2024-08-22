import { createReducer, ActionType } from 'typesafe-actions';
import { StoredNotification } from 'App/Types/Notification';

import * as actions from './actions';

type ActionTypes = ActionType<typeof actions>;
type StateType = {
  token: string | null;
  isEnabled: boolean;
  notifications: StoredNotification[];
  lastGetDate?: string;
};

export const initialState: StateType = {
  token: null,
  isEnabled: false,
  notifications: [],
  lastGetDate: undefined,
};

const appReducers = createReducer<StateType, ActionTypes>(initialState)
  .handleAction(actions.notificationSetToken.success, (state, { payload: { token } }) => ({
    ...state,
    token,
  }))
  .handleAction(actions.notificationToggle.success, (state, { payload: { isEnabled } }) => ({
    ...state,
    isEnabled,
  }))
  .handleAction(actions.notificationAdd.success, (state, { payload: { notifications } }) => ({
    ...state,
    notifications,
  }))
  .handleAction(actions.getNotifications.success, (state, { payload: { notifications, lastGetDate } }) => ({
    ...state,
    notifications,
    lastGetDate,
  }));

export default appReducers;
