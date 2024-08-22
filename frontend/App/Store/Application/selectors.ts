import { RootState } from 'typesafe-actions';

export const getIsShowOnboarding = (state: RootState) => state.application.isShowOnboarding;
export const getIsDirectConnection = (state: RootState) => state.application.isDirectConnection;
export const getDataTransferType = (state: RootState) => state.application.dataTransferType;
export const getConnectedPeripheralIds = (state: RootState) => state.application.connectedPeripheralIds;
