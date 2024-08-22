import { createAction, createAsyncAction } from 'typesafe-actions';
import { DeviceState, DeviceType } from 'App/Types/Devices';

export const devicesCheck = createAction('@DEVICES/DEVICES_CHECK')();
export const devicesExists = createAction('@DEVICES/DEVICES_EXISTS')();
export const devicesEmpty = createAction('@DEVICES/DEVICES_EMPTY')();
export const devicesFailure = createAction('@DEVICES/DEVICES_FAILURE')();

export const devicesChangeName = createAction('@DEVICES/DEVICES_CHANGE_NAME')<{
  thingName: string;
  name: string;
  cb?: () => void;
}>();

export const devicesAddUpdate = createAsyncAction(
  '@DEVICES/DEVICES_ADD_UPDATE_REQUEST',
  '@DEVICES/DEVICES_ADD_UPDATE_SUCCESS',
  '@DEVICES/DEVICES_ADD_UPDATE_FAILURE',
)<
  {
    thingName: string;
    data: DeviceState;
    withReplace?: boolean;
  },
  { data: Array<DeviceState> },
  undefined
>();

export const devicesUpdateAll = createAsyncAction(
  '@DEVICES/DEVICES_UPDATE_ALL_REQUEST',
  '@DEVICES/DEVICES_UPDATE_ALL_SUCCESS',
  '@DEVICES/DEVICES_UPDATE_ALL_FAILURE',
)<{ data: Array<DeviceState> }, { data: Array<DeviceState> }, undefined>();

export const devicesRemove = createAction('@DEVICES/DEVICES_REMOVE')<{
  thingName: string;
}>();

export const checkYetiState = createAction('@DEVICES/CHECK_YETI_STATE_REQUEST')<{
  peripheralId: string;
  thingName: string;
  deviceType: DeviceType;
}>();

export const checkPairedThings = createAsyncAction(
  '@DEVICES/CHECK_PAIRED_THINGS_REQUEST',
  '@DEVICES/CHECK_PAIRED_THINGS_SUCCESS',
  '@DEVICES/CHECK_PAIRED_THINGS_FAILURE',
)<undefined, undefined, undefined>();

export const changeSettings = createAction('@DEVICES/CHANGE_SETTINGS')<{
  thingName: string;
  param: 'temperature' | 'voltage';
  state: 'FAHRENHEIT' | 'CELSIUS' | 'V120' | 'V230';
}>();
export const blockAllPorts = createAction('@DEVICES/BLOCK_ALL_PORTS')<{
  thingName: string;
  state: boolean;
}>();
export const blockAllNotifications = createAction('@DEVICES/BLOCK_ALL_NOTIFICATIONS')<{
  thingName: string;
  state: boolean;
}>();
export const blockAllBatteryItems = createAction('@DEVICES/BLOCK_ALL_BATTERY_ITEMS')<{
  thingName: string;
  state: boolean;
}>();
export const blockChargingProfile = createAction('@DEVICES/BLOCK_CHARGING_PROFILE')<{
  thingName: string;
  state: boolean;
}>();
export const firmwareUpdateToggled = createAction('@DEVICES/FIRMWARE_UPDATE_TOGGLED')<{
  thingName: string;
  state: any;
}>();
export const lockAcsryCapacity = createAction('@DEVICES/LOCK_ACSRY_CAPACITY')<{
  thingName: string;
  state: boolean;
}>();
export const lockAcsryMode = createAction('@DEVICES/LOCK_ACSRY_MODE')<{
  thingName: string;
  state: boolean;
}>();

export const unpair = createAsyncAction(
  '@DEVICES/UNPAIR_REQUEST',
  '@DEVICES/UNPAIR_SUCCESS',
  '@DEVICES/UNPAIR_FAILURE',
)<{ thingName: string }, undefined, undefined>();
