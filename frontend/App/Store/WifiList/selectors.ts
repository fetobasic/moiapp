import { RootState } from 'typesafe-actions';

export const getWifiList = (state: RootState) => state.yetiWifiList.data;
