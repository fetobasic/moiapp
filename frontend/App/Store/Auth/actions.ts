import { createAction, createAsyncAction } from 'typesafe-actions';
import { AuthType, UserInfo, LoginType, SignUpType } from 'App/Types/User';

export const signUp = createAsyncAction('@AUTH/SIGNUP_REQUEST', '@AUTH/SIGNUP_SUCCESS', '@AUTH/SIGNUP_FAILURE')<
  SignUpType,
  { auth: AuthType; user: UserInfo },
  { error: string }
>();

export const login = createAsyncAction('@AUTH/LOGIN_REQUEST', '@AUTH/LOGIN_SUCCESS', '@AUTH/LOGIN_FAILURE')<
  LoginType,
  { auth: AuthType; user: UserInfo },
  undefined
>();

export const deleteUser = createAsyncAction(
  '@AUTH/DELETE_USER_REQUEST',
  '@AUTH/DELETE_USER_SUCCESS',
  '@AUTH/DELETE_USER_FAILURE',
)<undefined, undefined, undefined>();

export const loginRenew = createAsyncAction(
  '@AUTH/LOGIN_RENEW_REQUEST',
  '@AUTH/LOGIN_RENEW_SUCCESS',
  '@AUTH/LOGIN_RENEW_FAILURE',
)<undefined, AuthType, undefined>();

export const resetPassword = createAsyncAction(
  '@AUTH/RESET_PASSWORD_REQUEST',
  '@AUTH/RESET_PASSWORD_SUCCESS',
  '@AUTH/RESET_PASSWORD_FAILURE',
)<{ email: string }, undefined, undefined>();

export const updateUser = createAsyncAction(
  '@AUTH/UPDATE_USER_REQUEST',
  '@AUTH/UPDATE_USER_SUCCESS',
  '@AUTH/UPDATE_USER_FAILURE',
)<UserInfo, UserInfo, { error: string }>();

export const logout = createAsyncAction('@AUTH/LOGOUT_REQUEST', '@AUTH/LOGOUT_SUCCESS', '@AUTH/LOGOUT_FAILURE')<
  undefined,
  undefined,
  undefined
>();

export const setSignInState = createAction('@AUTH/SET_SIGN_IN_STATE')<boolean>();
export const clearRequests = createAction('@AUTH/CLEAR_REQUESTS')<undefined>();
