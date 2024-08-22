import { createReducer, ActionType } from 'typesafe-actions';

import * as actions from './actions';

type ActionTypes = ActionType<typeof actions>;
type StateType = {
  activeProfiles: any;
  customProfiles: any;
  fetching: boolean;
  error: string;
};

// device state contains only charge profile setup
// but we need to know what profile name selected
// and what custom setup user made for Yeti
export const initialState: StateType = {
  // currently selected profiles
  activeProfiles: {},
  // setting for custom profiles that user made
  // so the last setup is shown and they do not need to remember the values
  customProfiles: {},
  fetching: false,
  error: '',
};

const appReducers = createReducer<StateType, ActionTypes>(initialState)
  .handleAction(
    actions.chargingProfileSetActiveProfile,
    (
      state,
      {
        payload: {
          thingName,
          profile: { name },
        },
      },
    ) => ({
      ...state,
      activeProfiles: {
        [thingName]: {
          ...state.activeProfiles[thingName],
          name,
        },
      },
      fetching: false,
      error: '',
    }),
  )
  .handleAction(
    actions.chargingProfileUpdateCustomProfile,
    (
      state,
      {
        payload: {
          thingName,
          profile: { setup },
        },
      },
    ) => ({
      ...state,
      customProfiles: {
        [thingName]: {
          ...state.customProfiles[thingName],
          setup,
        },
      },
      fetching: false,
      error: '',
    }),
  )
  .handleAction(actions.chargingProfileFailure, (state, { payload: error }) => ({
    ...state,
    fetching: false,
    error,
  }));

export default appReducers;
