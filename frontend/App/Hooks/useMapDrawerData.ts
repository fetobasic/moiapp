import { getYetiThingName, isYetiThing } from 'App/Services/ThingHelper';
import { DeviceState, DeviceType } from 'App/Types/Devices';
import { YetiState } from 'App/Types/Yeti';

export type ChildItem = {
  thingName: string;
  batteryPercentage: number;
  model: string;
  numberOfHoursLeft: number;
  fullDeviceInfo: DeviceState | undefined;
  dateSync: Date | undefined;
};

type DrawerData =
  | Array<{
      main: YetiState;
      childDevices: ChildItem[];
    }>
  | [];

export const isYeti = (device: DeviceState): device is YetiState =>
  isYetiThing(getYetiThingName(device)) || isFridge(device?.deviceType); // TEMPORARY check for fridge

export const isFridge = (deviceType?: DeviceType) =>
  deviceType === 'ALTA_50_FRIDGE' ||
  deviceType === 'ALTA_45_FRIDGE' ||
  deviceType === 'ALTA_80_FRIDGE' ||
  deviceType === 'GENERIC_FRIDGE';

const useMapDrawerData = (devices: DeviceState[]): DrawerData => {
  const data = devices
    .map((device) => {
      if (isYeti(device) && (device?.name || device?.model)) {
        return { main: device, childDevices: [] };
      }
      return null;
    })
    .filter((device) => !!device) as DrawerData;

  return data ? data : [];
};

export default useMapDrawerData;
