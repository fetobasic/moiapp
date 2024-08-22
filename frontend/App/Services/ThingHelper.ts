import { DeviceState } from 'App/Types/Devices';
import { FridgeState } from 'App/Types/Fridge';
import { Yeti6GState, YetiModel, YetiState } from 'App/Types/Yeti';
import { isModelX } from './Yeti';

export const YETI_PREFIX = 'gzy';
export const YETI_LEGACY_PREFIX = 'yeti';
export const YETI_LEGACY = 'YETI_LEGACY';
export const YETI = 'YETI';
export const UNKNOWN_THING = 'UNKNOWN_THING';

export const SKU_MODEL_MAP = {
  37500: 'Yeti PRO 4000 120V',
  37510: 'Yeti PRO 4000 230V',
  23110: 'Tank PRO 4000',
  23115: 'Tank PRO 1000',
  45005: 'Yeti Escape Remote Display',
  36900: 'Yeti 300 120V',
  36910: 'Yeti 300 230V',
  37000: 'Yeti 500 120V',
  37010: 'Yeti 500 230V',
  37100: 'Yeti 700 120V',
  37110: 'Yeti 700 230V',
  94025: 'Alta 50 Fridge 120V',
  94030: 'Alta 50 Fridge 230V',
  94035: 'Alta 80 Fridge 120V',
  94040: 'Alta 80 Fridge 230V',
  37200: 'Yeti 1000 120V',
  37300: 'Yeti 1500 120V',
  37400: 'Yeti PRO 2000 120V',
  37210: 'Yeti 1000 230V',
  37310: 'Yeti 1500 230V',
  37410: 'Yeti PRO 2000 230V',
  98106: 'Yeti Series Combiner Accessory',
};

export const v120SKUModels = [37500, 36900, 37000, 37100, 94025, 94035, 37200, 37300, 37400];
export const v230SKUModels = [37510, 36910, 37010, 37110, 94030, 94040, 37210, 37310, 37410];

export const parseSKUFromHostId = (hostId: string = '') => {
  const re = /^H-(\d+)(-[ABCD]\d+)*$/;
  const match = re.exec(hostId);

  return match?.[1] || '';
};

export const parseModelFromHostId = (hostId: string) => {
  const sku = parseSKUFromHostId(hostId);

  return (SKU_MODEL_MAP as any)[sku] || '';
};

export const getThingType = (thingName: string = '') => {
  if (thingName.startsWith(YETI_PREFIX)) {
    return YETI;
  }
  if (thingName.startsWith(YETI_LEGACY_PREFIX)) {
    return YETI_LEGACY;
  }
  return UNKNOWN_THING;
};

export const isLegacyThing = (thingName: string = '') => getThingType(thingName) === YETI_LEGACY;

export const isYeti6GThing = (thingName: string = '') => getThingType(thingName) === YETI;

export const isYeti300 = (device: DeviceState): boolean => {
  const hostId = (device as Yeti6GState)?.device?.identity?.hostId;
  if (hostId) {
    const sku = parseSKUFromHostId(hostId);
    return ['36900', '36910'].includes(sku);
  }
  return false;
};

export const isYeti500 = (device: DeviceState): boolean => {
  const hostId = (device as Yeti6GState)?.device?.identity?.hostId;
  if (hostId) {
    const sku = parseSKUFromHostId(hostId);
    return ['37000', '37010'].includes(sku);
  }
  return false;
};

export const isYeti700 = (device: DeviceState): boolean => {
  const hostId = (device as Yeti6GState)?.device?.identity?.hostId;
  if (hostId) {
    const sku = parseSKUFromHostId(hostId);
    return ['37100', '37110'].includes(sku);
  }
  return false;
};

export const isYeti300500700 = (device: DeviceState): boolean => {
  const hostId = (device as Yeti6GState)?.device?.identity?.hostId;
  if (hostId) {
    const sku = parseSKUFromHostId(hostId);
    return ['36900', '36910', '37000', '37010', '37100', '37110'].includes(sku);
  }
  return false;
};

export const isYeti1000 = (device: DeviceState): boolean => {
  const hostId = (device as Yeti6GState)?.hostId || (device as Yeti6GState)?.device?.identity?.hostId;

  if (hostId) {
    const sku = parseSKUFromHostId(hostId);
    return ['23115', '37200', '37210'].includes(sku);
  }
  return false;
};

export const isYeti1500 = (device: DeviceState): boolean => {
  const hostId = (device as Yeti6GState)?.hostId || (device as Yeti6GState)?.device?.identity?.hostId;

  if (hostId) {
    const sku = parseSKUFromHostId(hostId);
    return ['37300', '37310'].includes(sku);
  }
  return false;
};

export const isYeti10001500 = (device: DeviceState): boolean => {
  const hostId = (device as Yeti6GState)?.hostId || (device as Yeti6GState)?.device?.identity?.hostId;

  if (hostId) {
    const sku = parseSKUFromHostId(hostId);
    return ['23115', '37200', '37210', '37300', '37310'].includes(sku);
  }
  return false;
};

export const isYeti20004000 = (device: DeviceState): boolean => {
  const hostId = (device as Yeti6GState)?.hostId || (device as Yeti6GState)?.device?.identity?.hostId;

  if (hostId) {
    const sku = parseSKUFromHostId(hostId);
    return ['37400', '37410', '37500', '37510'].includes(sku);
  }
  return false;
};

export const isYeti2000 = (device: DeviceState): boolean => {
  const hostId = (device as Yeti6GState)?.hostId || (device as Yeti6GState)?.device?.identity?.hostId;

  if (hostId) {
    const sku = parseSKUFromHostId(hostId);
    return ['37400', '37410'].includes(sku);
  }
  return false;
};

export const getYetiSize = (device: DeviceState): '6G_SM' | '6G_MD' | '6G_LG' | '6G_XL' | 'Legacy' | '' => {
  if (isYeti300500700(device)) {
    return '6G_SM';
  }

  if (isYeti10001500(device)) {
    return '6G_MD';
  }

  if (isYeti2000(device)) {
    return '6G_LG';
  }

  if (isYeti4000(device)) {
    return '6G_XL';
  }

  if (isYetiLegacy(device)) {
    return 'Legacy';
  }

  return '';
};

export const isYetiLegacy = (device: DeviceState): boolean => {
  const thingName = getYetiThingName(device);
  return isLegacyThing(thingName);
};

export const isYeti4000 = (device: DeviceState): boolean => {
  const hostId = (device as Yeti6GState)?.hostId || (device as Yeti6GState)?.device?.identity?.hostId;

  if (hostId) {
    const sku = parseSKUFromHostId(hostId);
    return ['37500', '37510'].includes(sku);
  }
  return false;
};

export const getYetiGeneration = (thingName: string = '', model?: string) => {
  if (isYeti6GThing(thingName)) {
    return 6;
  }

  if (isModelX(model as YetiModel)) {
    return 5;
  }

  if (isLegacyThing(thingName)) {
    return 4;
  }

  return 0;
};

export const isYetiThing = (thingName: string) => isLegacyThing(thingName) || isYeti6GThing(thingName);

export const getYetiThingName = (device: DeviceState) =>
  (device as YetiState | FridgeState)?.thingName || (device as Yeti6GState)?.device?.identity?.thingName || '';
