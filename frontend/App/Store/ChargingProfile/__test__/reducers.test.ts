import { chargingProfileReducers } from 'App/Store/ChargingProfile';
import { initialState } from 'App/Store/ChargingProfile/reducers';
import * as actions from 'App/Store/ChargingProfile/actions';

describe('ChargingProfile reducers', () => {
  test('should handle chargingProfileSetActiveProfile action', () => {
    const payload = { thingName: 'Test thing name', profile: { name: 'Test profile name' } };

    const newState = chargingProfileReducers(
      initialState,
      actions.chargingProfileSetActiveProfile(payload.thingName, payload.profile),
    );

    expect(newState).toEqual({
      ...initialState,
      activeProfiles: { [payload.thingName]: { name: payload.profile.name } },
    });
  });

  test('should handle chargingProfileUpdateCustomProfile action', () => {
    const payload = { thingName: 'Test thing name', profile: { setup: 'Test setup value' } };

    const newState = chargingProfileReducers(
      initialState,
      actions.chargingProfileUpdateCustomProfile(payload.thingName, payload.profile),
    );

    expect(newState).toEqual({
      ...initialState,
      customProfiles: { [payload.thingName]: { setup: payload.profile.setup } },
    });
  });

  test('should handle chargingProfileFailure action', () => {
    const payload = 'Test error message';

    const newState = chargingProfileReducers(initialState, actions.chargingProfileFailure(payload));

    expect(newState).toEqual({ ...initialState, fetching: false, error: payload });
  });
});
