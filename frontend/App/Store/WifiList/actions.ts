import { createAction, createAsyncAction } from 'typesafe-actions';
import { WiFiListObj, WiFiList } from 'App/Types/Yeti';

export const wifi = createAsyncAction('@WIFI/WIFI_REQUEST', '@WIFI/WIFI_SUCCESS', '@WIFI/WIFI_FAILURE')<
  undefined,
  { data: WiFiList[] },
  undefined
>();

export const bluetoothWifi = createAction('@WIFI/BLUETOOTH_WIFI_REQUEST')<{
  response: WiFiListObj;
}>();

export const clearWifiList = createAction('@WIFI/CLEAR_WIFI_LIST')();
