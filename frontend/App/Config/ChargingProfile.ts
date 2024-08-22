import { ChargeProfileType } from 'App/Types/ChargeProfile';

// setup for predefined profiles
export const CHARGING_PROFILES_SETUP = {
  [ChargeProfileType.Performance]: {
    title: 'Performance',
    description: "Performance allows full use of the Yeti's capacity",
    setup: {
      min: 0,
      max: 100,
      re: 95,
    },
    isPredefined: true,
  },
  [ChargeProfileType.BatterySaver]: {
    title: 'Battery Saver',
    description: "Preserve the longevity of your Yeti's battery",
    setup: {
      min: 15,
      max: 85,
      re: 80,
    },
    isPredefined: true,
  },
  [ChargeProfileType.Balanced]: {
    title: 'Balanced',
    description: "Extend the Battery's life without sacrificing performance",
    setup: {
      min: 2,
      max: 95,
      re: 90,
    },
    isPredefined: true,
  },
  [ChargeProfileType.Custom]: {
    title: 'Custom',
    description: 'Create a profile that best fits your usage',
    // custom profile setup should default to previously selected when selected the first time
    setup: {
      min: 10,
      max: 100,
      re: 80,
    },
    isPredefined: false,
  },
};

// profile applied when somehow no profile setting at all
export const DEFAULT_PROFILE_NAME = ChargeProfileType.Performance;

// export the list and do not rely on outer
// ECMAScript2015 preserves order of keys if they are strings
export const CHARGING_PROFILES_LIST = Object.values(ChargeProfileType);

// minimum difference between charge and discharge level (percents)
export const MIN_CHARGE_DISCHARGE_DIFF = 10;

// minimum allowed difference between charge and recharge levels (percents)
// ie, max_recharge_value cannot exceed max_charge_value - MIN_ALLOWED_CHARGE_RECHARGE_DIFF
// this is to avoid setting recharge point to max charge, so Yeti's always charging
export const MIN_ALLOWED_CHARGE_RECHARGE_DIFF = 1;

// minimum and maximum charge possible, in percent
export const MAX_CHARGE_SCALE = 100;
export const MIN_CHARGE_SCALE = 0;
