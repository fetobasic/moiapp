import { yetiReducers } from 'App/Store/Yeti';
import { initialState } from 'App/Store/Yeti/reducers';
import * as actions from 'App/Store/Yeti/actions';

describe('Yeti reducers', () => {
  describe('yetiJoin', () => {
    test('should handle yetiJoin.request correctly', () => {
      const newState = yetiReducers(initialState, actions.yetiJoin.request());

      expect(newState).toEqual({ ...initialState, fetching: true, error: false, joinData: undefined });
    });

    test('should handle yetiJoin.success correctly', () => {
      const payload = { data: 'testData' };
      const newState = yetiReducers(initialState, actions.yetiJoin.success(payload));

      expect(newState).toEqual({ ...initialState, fetching: false, error: null, joinData: payload.data });
    });

    test('should handle yetiJoin.failure correctly', () => {
      const newState = yetiReducers(initialState, actions.yetiJoin.failure());

      expect(newState).toEqual({ ...initialState, fetching: false, error: true, joinData: undefined });
    });
  });

  test('should handle yetiReset correctly', () => {
    const newState = yetiReducers(initialState, actions.yetiReset());

    expect(newState).toEqual({ ...initialState, joinData: undefined, data: null });
  });

  describe('yetiInfo', () => {
    test('should handle yetiInfo.request correctly', () => {
      const newState = yetiReducers(initialState, actions.yetiInfo.request());

      expect(newState).toEqual({ ...initialState, fetchingYetiInfo: true, data: null });
    });

    test('should handle yetiInfo.success correctly', () => {
      const payload = { data: 'testData' };
      const newState = yetiReducers(initialState, actions.yetiInfo.success(payload));

      expect(newState).toEqual({ ...initialState, fetchingYetiInfo: false, data: payload.data });
    });

    test('should handle yetiInfo.failure correctly', () => {
      const newState = yetiReducers(initialState, actions.yetiInfo.failure());

      expect(newState).toEqual({ ...initialState, fetchingYetiInfo: false, data: null });
    });
  });

  describe('yetiSetPassword', () => {
    test('should handle yetiSetPassword.request correctly', () => {
      const newState = yetiReducers(initialState, actions.yetiSetPassword.request());

      expect(newState).toEqual({ ...initialState, passwordChange: { inProgress: true, error: null } });
    });

    test('should handle yetiSetPassword.success correctly', () => {
      const newState = yetiReducers(initialState, actions.yetiSetPassword.success());

      expect(newState).toEqual({ ...initialState, passwordChange: { inProgress: false, error: null } });
    });

    test('should handle yetiSetPassword.failure correctly', () => {
      const error = { message: 'Password change failed' };
      const newState = yetiReducers(initialState, actions.yetiSetPassword.failure({ error }));

      expect(newState).toEqual({ ...initialState, passwordChange: { inProgress: false, error } });
    });
  });

  describe('directConnect', () => {
    test('should handle directConnect.request correctly', () => {
      const newState = yetiReducers(initialState, actions.directConnect.request());

      expect(newState).toEqual({ ...initialState, directData: undefined });
    });

    test('should handle directConnect.success correctly', () => {
      const directData = { data: 'testData' };
      const newState = yetiReducers(initialState, actions.directConnect.success({ directData }));

      expect(newState).toEqual({ ...initialState, fetching: false, error: null, directData });
    });

    test('should handle directConnect.failure correctly', () => {
      const newState = yetiReducers(initialState, actions.directConnect.failure());

      expect(newState).toEqual({ ...initialState, fetching: false, error: true, directData: undefined });
    });
  });

  test('should handle clearDirectData correctly', () => {
    const newState = yetiReducers(initialState, actions.clearDirectData());

    expect(newState).toEqual({ ...initialState, directData: undefined });
  });

  describe('startPair', () => {
    test('should handle startPair.request correctly', () => {
      const newState = yetiReducers(initialState, actions.startPair.request());

      expect(newState).toEqual({ ...initialState, startPairConfirmed: false, startPairError: false });
    });

    test('should handle startPair.success correctly', () => {
      const newState = yetiReducers(initialState, actions.startPair.success());

      expect(newState).toEqual({ ...initialState, startPairConfirmed: true, startPairError: false });
    });

    test('should handle startPair.failure correctly', () => {
      const newState = yetiReducers(initialState, actions.startPair.failure());

      expect(newState).toEqual({ ...initialState, startPairConfirmed: false, startPairError: true });
    });
  });

  test('should handle discoveredDevices.success correctly', () => {
    const discoveredDevices = { devices: ['device1', 'device2'] };
    const newState = yetiReducers(initialState, actions.discoveredDevices.success({ discoveredDevices }));

    expect(newState).toEqual({ ...initialState, discoveredDevices });
  });
});
