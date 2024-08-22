import { filter, isEmpty, isNil, map } from 'ramda';
import { Yeti6GState, YetiState } from 'App/Types/Yeti';
import { DeviceState } from 'App/Types/Devices';

export const deviceExists = (devices: Array<DeviceState>, thingName: string) => {
  if (isEmpty(devices)) {
    return false;
  }

  return !isEmpty(filter((t) => t.thingName === thingName, devices));
};

const doesParameterInThingExist = (
  devices: Array<DeviceState>,
  thingName: string,
  parameter: keyof YetiState | keyof Yeti6GState,
) => {
  if (isEmpty(devices)) {
    return false;
  }

  const thing = devices.find((e) => e.thingName === thingName) as YetiState;

  if (!thing) {
    return false;
  }

  return !isNil(thing[parameter as keyof YetiState]);
};

/**
 * Remove thing if don't have Model in params.
 * This means that Yeti info is corrupted.
 * */
export const removeInvalidThings = (things: Array<DeviceState> = []) =>
  things.filter((thing) => (thing as YetiState).model);

export const doesThingNameExist = (devices: Array<DeviceState>, thingName: string) =>
  doesParameterInThingExist(devices, thingName, 'name');

export const doesUsedAnywhereConnectExist = (devices: Array<DeviceState>, thingName: string) =>
  doesParameterInThingExist(devices, thingName, 'usedAnywhereConnect');

export const setDirectConnectByName = (devices: Array<DeviceState>, thingName: string) =>
  map((d) => {
    const item = { ...d };
    // ONLY change state of devices with the same thingName or wifi devices. Leave other bluetooth devices alone, those could still be connected via bluetooth.
    if (item.thingName === thingName || item.dataTransferType === 'wifi') {
      item.isDirectConnection = item.thingName === thingName;
      item.isConnected = item.thingName === thingName;
    }

    return item;
  }, devices);

export const setAnywhereConnect = (devices: Array<DeviceState>) =>
  map((d) => {
    const item = { ...d };

    if (item.dataTransferType === 'wifi') {
      item.isDirectConnection = false;
    }

    return item;
  }, devices);
