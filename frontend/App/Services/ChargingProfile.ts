import { equals } from 'ramda';
import { CHARGING_PROFILES_SETUP, CHARGING_PROFILES_LIST } from 'App/Config/ChargingProfile';
import { ChargeProfileType } from 'App/Types/ChargeProfile';
import { ChargeProfile as ChargeProfileSetupType } from 'App/Types/Yeti';

const getDefaultProfile = (profileName: ChargeProfileType | '', unknownProfile = undefined) =>
  (profileName && CHARGING_PROFILES_SETUP[profileName]) || unknownProfile;

const isPredefinedProfile = (profileName: ChargeProfileType) => getDefaultProfile(profileName)?.isPredefined;

const getProfileDefaultSetup = (profileName: ChargeProfileType) => getDefaultProfile(profileName)?.setup;

const getPredefinedProfileNameBySetup = (profileSetup: ChargeProfileSetupType) =>
  CHARGING_PROFILES_LIST.find((profileName) => {
    const defaultProfile = getDefaultProfile(profileName);

    return defaultProfile?.isPredefined && equals(defaultProfile.setup, profileSetup);
  });

const getProfileNameBySetup = (profileSetup: ChargeProfileSetupType) =>
  getPredefinedProfileNameBySetup(profileSetup) || ChargeProfileType.Custom;

export {
  isPredefinedProfile,
  getProfileDefaultSetup,
  getDefaultProfile,
  getPredefinedProfileNameBySetup,
  getProfileNameBySetup,
};
