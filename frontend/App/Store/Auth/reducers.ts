import { createReducer, ActionType } from 'typesafe-actions';

import * as actions from './actions';
import { UserInfo, AuthType } from 'App/Types/User';

type ActionTypes = ActionType<typeof actions>;
type StateType = {
  isSignedIn: boolean;
  user?: UserInfo;
  auth?: AuthType;
  resetPasswordRequestSuccess?: boolean;
  updateUserRequestSuccess?: boolean;
  deleteUserRequestSuccess?: boolean;
  requests?: {
    signUp?: boolean;
    login?: boolean;
    forgotPassword?: boolean;
    updateUser?: boolean;
    deleteUser?: boolean;
  };
  errors?: {
    signUp?: string;
    updateUser?: string;
    deleteUser?: string;
  };
};

export const initialState: StateType = {
  isSignedIn: false,
  user: undefined,
  auth: undefined,
  resetPasswordRequestSuccess: false,
  updateUserRequestSuccess: false,
  requests: {
    signUp: false,
    login: false,
    forgotPassword: false,
    updateUser: false,
    deleteUser: false,
  },
  errors: {
    signUp: undefined,
    updateUser: undefined,
  },
};

const authReducers = createReducer<StateType, ActionTypes>(initialState)
  .handleAction(actions.signUp.request, (state) => ({
    ...state,
    requests: {
      ...state.requests,
      signUp: true,
    },
    errors: {
      ...state.errors,
      signUp: undefined,
    },
  }))
  .handleAction(actions.signUp.success, (state, { payload }) => ({
    ...state,
    ...payload,
    requests: {
      ...state.requests,
      signUp: false,
    },
  }))
  .handleAction(actions.signUp.failure, (state, { payload }) => ({
    ...state,
    requests: {
      ...state.requests,
      signUp: false,
    },
    errors: {
      ...state.errors,
      signUp: payload.error,
    },
  }))
  .handleAction(actions.login.request, (state) => ({
    ...state,
    requests: {
      ...state.requests,
      login: true,
    },
  }))
  .handleAction(actions.login.success, (state, { payload }) => ({
    ...state,
    ...payload,
    isSignedIn: true,
    requests: {
      ...state.requests,
      login: false,
    },
  }))
  .handleAction(actions.login.failure, (state) => ({
    ...state,
    requests: {
      ...state.requests,
      login: false,
    },
  }))
  .handleAction(actions.loginRenew.success, (state, { payload }) => ({
    ...state,
    auth: payload,
  }))
  .handleAction(actions.resetPassword.request, (state) => ({
    ...state,
    resetPasswordRequestSuccess: false,
    requests: {
      ...state.requests,
      forgotPassword: true,
    },
  }))
  .handleAction(actions.resetPassword.success, (state) => ({
    ...state,
    resetPasswordRequestSuccess: true,
    requests: {
      ...state.requests,
      forgotPassword: false,
    },
  }))
  .handleAction(actions.resetPassword.failure, (state) => ({
    ...state,
    requests: {
      ...state.requests,
      forgotPassword: false,
    },
  }))
  .handleAction(actions.updateUser.request, (state) => ({
    ...state,
    updateUserRequestSuccess: false,
    requests: {
      ...state.requests,
      updateUser: true,
    },
    errors: {
      ...state.errors,
      updateUser: undefined,
    },
  }))
  .handleAction(actions.updateUser.success, (state, { payload }) => ({
    ...state,
    updateUserRequestSuccess: true,
    requests: {
      ...state.requests,
      updateUser: false,
    },
    user: {
      ...state.user,
      ...payload,
    },
  }))
  .handleAction(actions.updateUser.failure, (state, { payload }) => ({
    ...state,
    updateUserRequestSuccess: false,
    requests: {
      ...state.requests,
      updateUser: false,
    },
    errors: {
      ...state.errors,
      updateUser: payload.error,
    },
  }))
  .handleAction(actions.setSignInState, (state, { payload }) => ({
    ...state,
    isSignedIn: payload,
  }))
  .handleAction(actions.logout.success, (state) => ({
    ...state,
    isSignedIn: false,
    auth: undefined,
    user: undefined,
  }))
  .handleAction(actions.clearRequests, (state) => ({
    ...state,
    requests: initialState.requests,
    resetPasswordRequestSuccess: initialState.resetPasswordRequestSuccess,
    updateUserRequestSuccess: initialState.resetPasswordRequestSuccess,
    deleteUserRequestSuccess: initialState.deleteUserRequestSuccess,
    errors: initialState.errors,
  }))
  .handleAction(actions.deleteUser.request, (state) => ({
    ...state,
    deleteUserRequestSuccess: false,
    requests: {
      ...state.requests,
      deleteUser: true,
    },
    errors: {
      ...state.errors,
      deleteUser: undefined,
    },
  }))
  .handleAction(actions.deleteUser.success, (state) => ({
    ...state,
    deleteUserRequestSuccess: true,
    requests: {
      ...state.requests,
      deleteUser: false,
    },
  }))
  .handleAction(actions.deleteUser.failure, (state) => ({
    ...state,
    deleteUserRequestSuccess: false,
    requests: {
      ...state.requests,
      deleteUser: false,
    },
    errors: {
      ...state.errors,
    },
  }));

export default authReducers;
