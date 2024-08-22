import { RootState } from 'typesafe-actions';

export const getIsLoading = (state: RootState) => state.startup.isAppLoaded;
