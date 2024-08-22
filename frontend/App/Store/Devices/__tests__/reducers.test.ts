import devicesReducers, { initialState } from 'App/Store/Devices/reducers';
import * as actions from 'App/Store/Devices/actions';

describe('Devices reducers', () => {
  test('should handle devicesExists action', () => {
    const nextState = devicesReducers(initialState, actions.devicesExists());

    expect(nextState).toEqual({ ...initialState, error: null });
  });

  test('should handle devicesEmpty action', () => {
    const nextState = devicesReducers(initialState, actions.devicesEmpty());

    expect(nextState).toEqual({ ...initialState, error: null, data: [] });
  });

  test('should handle devicesAddUpdate success action', () => {
    const payload = { data: [{ thinkName: 'testThinkName' }] };

    const newState = devicesReducers(initialState, actions.devicesAddUpdate.success(payload));

    expect(newState).toEqual({ ...initialState, error: null, data: payload.data });
  });

  test('should handle devicesUpdateAll success action', () => {
    const payload = { data: 'New data' };

    const newState = devicesReducers(initialState, actions.devicesUpdateAll.success(payload));

    expect(newState).toEqual({ ...initialState, error: null, data: payload.data });
  });

  test('should handle devicesFailure action', () => {
    const newState = devicesReducers(initialState, actions.devicesFailure());

    expect(newState).toEqual({ ...initialState, error: true });
  });

  describe('unpair', () => {
    test('should handle unpair request action', () => {
      const newState = devicesReducers(initialState, actions.unpair.request());

      expect(newState).toEqual({ ...initialState, startUnpair: true });
    });

    test('should handle unpair success action', () => {
      const newState = devicesReducers(initialState, actions.unpair.success());

      expect(newState).toEqual({ ...initialState, startUnpair: false });
    });
  });
});
