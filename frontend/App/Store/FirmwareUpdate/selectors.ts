import { RootState } from 'typesafe-actions';

export const getFirmwareUpdateData = (state: RootState) => state.firmwareUpdate.data;
export const getFirmwareVersions = (state: RootState) => state.firmwareUpdate.firmwareVersions;
