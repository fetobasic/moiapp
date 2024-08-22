import { RootState } from 'typesafe-actions';

export const getAppRateInfo = (state: RootState) => state.cache.appRateInfo;
