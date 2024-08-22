import { createAction, createAsyncAction } from 'typesafe-actions';
import { FirmwareUpdateDataType, FirmwareVersion } from 'App/Types/FirmwareUpdate';
import { DeviceType } from 'App/Types/Devices';

export const firmwareUpdate = createAsyncAction(
  '@FIRMWARE_UPDATE/FIRMWARE_UPDATE_REQUEST',
  '@FIRMWARE_UPDATE/FIRMWARE_UPDATE_SUCCESS',
  '@FIRMWARE_UPDATE/FIRMWARE_UPDATE_FAILURE',
)<{ thingName: string }, { data: FirmwareUpdateDataType }, undefined>();
export const firmwareUpdateCanceled = createAction('@FIRMWARE_UPDATE/FIRMWARE_CANCELED')<{
  data: FirmwareUpdateDataType;
}>();

export const firmwareUpdateNow = createAction('@FIRMWARE_UPDATE/FIRMWARE_UPDATE_NOW')<{
  thingName: string;
  phoneId: string;
  oldVersion: string;
  newVersion: string;
}>();

export const firmwareUpdateCompleted = createAction('@FIRMWARE_UPDATE/FIRMWARE_UPDATE_COMPLETED')<{
  status: string;
  jobInfo: {
    version: string;
    thingName: string;
    jobId: string;
  };
  progress: number;
}>();

export const firmwareUpdateCheckVersions = createAction('@FIRMWARE_UPDATE/FIRMWARE_UPDATE_CHECK_VERSIONS')<{
  thingName: string;
  oldVersion: string;
}>();

export const firmwareClearUpdateInfo = createAction('@FIRMWARE_UPDATE/FIRMWARE_CLEAR_UPDATE_INFO')<{
  thingName: string;
}>();

export const firmwareCheckUpdates = createAsyncAction(
  '@FIRMWARE_UPDATE/FIRMWARE_CHECK_UPDATES_REQUEST',
  '@FIRMWARE_UPDATE/FIRMWARE_CHECK_UPDATES_SUCCESS',
  '@FIRMWARE_UPDATE/FIRMWARE_CHECK_UPDATES_FAILURE',
)<undefined, undefined, undefined>();

export const firmwareCheckUpdatesByType = createAsyncAction(
  '@FIRMWARE_UPDATE/FIRMWARE_CHECK_UPDATES_BY_TYPE_REQUEST',
  '@FIRMWARE_UPDATE/FIRMWARE_CHECK_UPDATES_BY_TYPE_SUCCESS',
  '@FIRMWARE_UPDATE/FIRMWARE_CHECK_UPDATES_BY_TYPE_FAILURE',
)<{ deviceType: DeviceType; hostId: string }, undefined, undefined>();

export const firmwareVersions = createAsyncAction(
  '@FIRMWARE_UPDATE/FIRMWARE_VERSIONS_REQUEST',
  '@FIRMWARE_UPDATE/FIRMWARE_VERSIONS_SUCCESS',
  '@FIRMWARE_UPDATE/FIRMWARE_VERSIONS_FAILURE',
)<undefined, { deviceType: DeviceType; firmwareVersions: FirmwareVersion[] }, undefined>();

export const updateOta = createAsyncAction(
  '@FIRMWARE_UPDATE/UPDATE_OTA_REQUEST',
  '@FIRMWARE_UPDATE/UPDATE_OTA_SUCCESS',
  '@FIRMWARE_UPDATE/UPDATE_OTA_FAILURE',
)<
  {
    url: string;
    ssid: string;
    pass: string | null | undefined;
    urlSignature: string;
    keyId: string;
    peripheralId: string;
  },
  undefined,
  undefined
>();
