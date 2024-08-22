import { RootState } from 'typesafe-actions';

export const getIsSignedIn = (state: RootState) => state.auth.isSignedIn;
export const getAuthInfo = (state: RootState) => state.auth.auth;
export const getUserInfo = (state: RootState) => state.auth.user;
