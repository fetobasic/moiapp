import { createAction } from 'typesafe-actions';

export const chargingProfileSetActiveProfile = createAction(
  '@CHANGING_PROFILE/CHARGING_PROFILE_SET_ACTIVE_PROFILE',
  (thingName: string, profile: any) => ({ thingName, profile }),
)();

export const chargingProfileUpdateCustomProfile = createAction(
  '@CHANGING_PROFILE/CHARGING_PROFILE_UPDATE_CUSTOM_PROFILE',
  (thingName: string, profile: any) => ({ thingName, profile }),
)();

export const chargingProfileFailure = createAction(
  '@CHANGING_PROFILE/CHARGING_PROFILE_FAILURE',
  (error: string) => error,
)();
