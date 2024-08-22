import { RootState } from 'typesafe-actions';
import { find, propEq } from 'ramda';
import { YetiState, Yeti6GState } from 'App/Types/Yeti';
import { getYetiThingName } from 'App/Services/ThingHelper';
import { isLegacyYeti } from 'App/Services/Yeti';
import { DeviceState } from 'App/Types/Devices';

export const getDevicesInfoData = (state: RootState) => state.devicesInfo.data;

export const getDeviceInfo = (devicesInfo: any, thingName: string): DeviceState =>
  find(propEq('thingName', thingName), devicesInfo?.data) || {};

export const getChargingProfileSetup = (devicesInfo: any, thingName: string) => {
  const deviceInfo = getDeviceInfo(devicesInfo, thingName);

  if (isLegacyYeti(thingName)) {
    return (deviceInfo as YetiState)?.chargeProfile;
  }

  return {
    min: (deviceInfo as Yeti6GState)?.config?.chgPrfl?.min,
    max: (deviceInfo as Yeti6GState)?.config?.chgPrfl?.max,
    re: (deviceInfo as Yeti6GState)?.config?.chgPrfl?.rchg,
  };
};

export const getConnectedState = (devicesInfo: any, thingName: string) =>
  getDeviceInfo(devicesInfo, thingName)?.isConnected;

export const getCurrentDevice = (thingName: string) => (state: RootState) =>
  state.devicesInfo.data.find((device) => getYetiThingName(device) === thingName) || {};
