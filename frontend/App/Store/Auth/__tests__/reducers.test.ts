import authReducers, { initialState } from 'App/Store/Auth/reducers';
import * as actions from 'App/Store/Auth/actions';

describe('Auth reducers', () => {
  describe('signUp', () => {
    test('should handle signUp.request action', () => {
      const nextState = authReducers(initialState, actions.signUp.request());

      expect(nextState).toEqual({
        ...initialState,
        requests: { ...initialState.requests, signUp: true },
        errors: { ...initialState.errors, signUp: undefined },
      });
    });

    test('should handle signUp.success action', () => {
      const payload = { user: { name: 'Test User' } };
      const nextState = authReducers(initialState, actions.signUp.success(payload));

      expect(nextState).toEqual({ ...initialState, ...payload, requests: { ...initialState.requests, signUp: false } });
    });

    test('should handle signUp.failure action', () => {
      const payload = { error: 'Some test error' };
      const nextState = authReducers(initialState, actions.signUp.failure(payload));

      expect(nextState).toEqual({
        ...initialState,
        requests: { ...initialState.requests, signUp: false },
        errors: { ...initialState.errors, signUp: payload.error },
      });
    });
  });

  describe('login', () => {
    test('should handle login.request action', () => {
      const nextState = authReducers(initialState, actions.login.request());

      expect(nextState).toEqual({ ...initialState, requests: { ...initialState.requests, login: true } });
    });

    test('should handle login.success action', () => {
      const payload = { user: { userToken: 'dvohdnhfgvouidshyvt847weyvt7yovyw' } };
      const nextState = authReducers(initialState, actions.login.success(payload));

      expect(nextState).toEqual({
        ...initialState,
        ...payload,
        isSignedIn: true,
        requests: { ...initialState.requests, login: false },
      });
    });

    test('should handle login.failure action', () => {
      const nextState = authReducers(initialState, actions.login.failure());

      expect(nextState).toEqual({ ...initialState, requests: { ...initialState.requests, login: false } });
    });
  });

  test('should handle loginRenew.success action', () => {
    const payload = { user: { newAuthToken: 'cum09aw4ynv0ew9gdfc0gdfj9' } };
    const nextState = authReducers(initialState, actions.loginRenew.success(payload));

    expect(nextState).toEqual({ ...initialState, auth: payload });
  });

  describe('resetPassword', () => {
    test('should handle resetPassword.request action', () => {
      const nextState = authReducers(initialState, actions.resetPassword.request());

      expect(nextState).toEqual({
        ...initialState,
        resetPasswordRequestSuccess: false,
        requests: { ...initialState.requests, forgotPassword: true },
      });
    });

    test('should handle resetPassword.success action', () => {
      const nextState = authReducers(initialState, actions.resetPassword.success());

      expect(nextState).toEqual({
        ...initialState,
        resetPasswordRequestSuccess: true,
        requests: { ...initialState.requests, forgotPassword: false },
      });
    });

    test('should handle resetPassword.failure action', () => {
      const nextState = authReducers(initialState, actions.resetPassword.failure());

      expect(nextState).toEqual({ ...initialState, requests: { ...initialState.requests, forgotPassword: false } });
    });
  });

  describe('updateUser', () => {
    test('should handle updateUser.request action', () => {
      const nextState = authReducers(initialState, actions.updateUser.request());

      expect(nextState).toEqual({
        ...initialState,
        updateUserRequestSuccess: false,
        requests: { ...initialState.requests, updateUser: true },
        errors: { ...initialState.errors, updateUser: undefined },
      });
    });

    test('should handle updateUser.success action', () => {
      const payload = { user: { name: 'New name' } };
      const nextState = authReducers(initialState, actions.updateUser.success(payload));

      expect(nextState).toEqual({
        ...initialState,
        updateUserRequestSuccess: true,
        requests: { ...initialState.requests, updateUser: false },
        user: { ...initialState.user, ...payload },
      });
    });

    test('should handle updateUser.failure action', () => {
      const payload = { error: 'Some test error' };
      const nextState = authReducers(initialState, actions.updateUser.failure(payload));

      expect(nextState).toEqual({
        ...initialState,
        updateUserRequestSuccess: false,
        requests: { ...initialState.requests, updateUser: false },
        errors: { ...initialState.errors, updateUser: payload.error },
      });
    });
  });

  test('should handle setSignInState action', () => {
    const payload = true;
    const nextState = authReducers(initialState, actions.setSignInState(payload));

    expect(nextState).toEqual({ ...initialState, isSignedIn: payload });
  });

  test('should handle logout.success action', () => {
    const nextState = authReducers(initialState, actions.logout.success());

    expect(nextState).toEqual({
      ...initialState,
      isSignedIn: false,
      auth: undefined,
      user: undefined,
    });
  });

  test('should handle clearRequests action', () => {
    const nextState = authReducers(initialState, actions.clearRequests());

    expect(nextState).toEqual({
      ...initialState,
      requests: initialState.requests,
      resetPasswordRequestSuccess: initialState.resetPasswordRequestSuccess,
      updateUserRequestSuccess: initialState.updateUserRequestSuccess,
      deleteUserRequestSuccess: initialState.deleteUserRequestSuccess,
      errors: initialState.errors,
    });
  });

  describe('deleteUser', () => {
    test('should handle deleteUser.request action', () => {
      const nextState = authReducers(initialState, actions.deleteUser.request());

      expect(nextState).toEqual({
        ...initialState,
        deleteUserRequestSuccess: false,
        requests: { ...initialState.requests, deleteUser: true },
        errors: { ...initialState.errors, deleteUser: undefined },
      });
    });

    test('should handle deleteUser.success action', () => {
      const nextState = authReducers(initialState, actions.deleteUser.success());

      expect(nextState).toEqual({
        ...initialState,
        deleteUserRequestSuccess: true,
        requests: { ...initialState.requests, deleteUser: false },
      });
    });

    test('should handle deleteUser.failure action', () => {
      const nextState = authReducers(initialState, actions.deleteUser.failure());

      expect(nextState).toEqual({
        ...initialState,
        deleteUserRequestSuccess: false,
        requests: { ...initialState.requests, deleteUser: false },
        errors: { ...initialState.errors },
      });
    });
  });
});
