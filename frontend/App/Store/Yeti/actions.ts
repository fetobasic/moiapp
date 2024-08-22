import { createAction, createAsyncAction } from 'typesafe-actions';
import { BluetoothDevice } from 'App/Types/BluetoothDevices';
import { YetiSysInfo, YetiDirectInfo, YetiConnectionCredentials, Yeti6GState } from 'App/Types/Yeti';
import { DeviceType } from 'App/Types/Devices';

export const yetiJoin = createAsyncAction(
  '@YETI/YETI_JOIN_REQUEST',
  '@YETI/YETI_JOIN_SUCCESS',
  '@YETI/YETI_JOIN_FAILURE',
)<{ req: YetiConnectionCredentials }, { data: YetiSysInfo }, undefined>();

export const yetiReset = createAction('@YETI/YETI_RESET')();

export const yetiInfo = createAsyncAction(
  '@YETI/YETI_INFO_REQUEST',
  '@YETI/YETI_INFO_SUCCESS',
  '@YETI/YETI_INFO_FAILURE',
)<{ peripheralId: string }, { data: any }, undefined>();

export const yetiSetPassword = createAsyncAction(
  '@YETI/YETI_SET_PASSWORD_REQUEST',
  '@YETI/YETI_SET_PASSWORD_SUCCESS',
  '@YETI/YETI_SET_PASSWORD_FAILURE',
)<{ password: string }, undefined, { error: any }>();

export const directConnect = createAsyncAction(
  '@YETI/DIRECT_CONNECT_REQUEST',
  '@YETI/DIRECT_CONNECT_SUCCESS',
  '@YETI/DIRECT_CONNECT_FAILURE',
)<{ deviceType?: DeviceType }, { directData: YetiDirectInfo | Yeti6GState }, undefined>();

export const startPair = createAsyncAction(
  '@YETI/START_PAIR_REQUEST',
  '@YETI/START_PAIR_SUCCESS',
  '@YETI/START_PAIR_FAILURE',
)<{ peripheralId: string }, undefined, undefined>();

export const discoveredDevices = createAsyncAction(
  '@YETI/DISCOVERED_DEVICES_REQUEST',
  '@YETI/DISCOVERED_DEVICES_SUCCESS',
  '@YETI/DISCOVERED_DEVICES_FAILURE',
)<{ peripheral: BluetoothDevice }, { discoveredDevices: BluetoothDevice[] }, undefined>();

export const clearDiscoveredDevices = createAction('@YETI/CLEAR_DISCOVERED_DEVICES')();
export const clearDirectData = createAction('@YETI/CLEAR_DIRECT_DATA')();

export const bluetoothStopScan = createAction('@YETI/BLUETOOTH_STOP_SCAN')();

export const bluetoothReceiveYetiInfo = createAction('@YETI/BLUETOOTH_RECEIVE_YETI_INFO')<{
  data: YetiSysInfo;
}>();
