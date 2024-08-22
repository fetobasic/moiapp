import { cacheReducers } from 'App/Store/Cache';
import { initialState } from 'App/Store/Cache/reducers';
import * as actions from 'App/Store/Cache/actions';

describe('Cache reducers', () => {
  test('should handle CHANGE_APP_RATE_INFO action', () => {
    const payload = { isBlockedShowAppRate: true, isReadyToShowAppRate: true };

    const newState = cacheReducers(initialState, actions.changeAppRateInfo(payload));

    expect(newState).toEqual({ ...initialState, appRateInfo: { ...initialState.appRateInfo, ...payload } });
  });

  test('should handle CHANGE_APP_RATE_INFO action with partial payload', () => {
    const payload = { isReadyToShowAppRate: true };

    const newState = cacheReducers(initialState, actions.changeAppRateInfo(payload));

    expect(newState).toEqual({ ...initialState, appRateInfo: { ...initialState.appRateInfo, ...payload } });
  });
});
