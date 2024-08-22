import { RootState } from 'typesafe-actions';
import { isEqual } from 'lodash';
import { DEFAULT_PROFILE_NAME } from 'App/Config/ChargingProfile';
import { devicesSelectors } from '../Devices';
import { getPredefinedProfileNameBySetup } from 'App/Services/ChargingProfile';
import { ChargeProfileType } from 'App/Types/ChargeProfile';
import { isLegacyYeti } from 'App/Services/Yeti';
import { ChargeProfile as ChargeProfileSetupType, Yeti6GState, YetiState } from 'App/Types/Yeti';
import { DeviceState } from 'App/Types/Devices';

export const getActiveProfileName = (state: any, thingName: string) =>
  state?.activeProfiles?.[thingName]?.name || DEFAULT_PROFILE_NAME;

export const getCustomStoredProfile = (
  state: any,
  thingName: string,
  chargeProfileSetup?: Partial<ChargeProfileSetupType>,
) => {
  return (
    state?.customProfiles?.[thingName] || {
      setup: chargeProfileSetup,
    }
  );
};

export const getProfileInfo = (thingName: string) => (state: RootState) => {
  const storedActiveProfileName = getActiveProfileName(state.chargingProfile, thingName);
  const deviceInfo = devicesSelectors.getDeviceInfo(state.devicesInfo, thingName);

  let chargeProfileSetup: Partial<ChargeProfileSetupType> = {
    min: (deviceInfo as Yeti6GState)?.config?.chgPrfl?.min,
    max: (deviceInfo as Yeti6GState)?.config?.chgPrfl?.max,
    re: (deviceInfo as Yeti6GState)?.config?.chgPrfl?.rchg,
  };

  if (isLegacyYeti(thingName)) {
    chargeProfileSetup = { ...(deviceInfo as YetiState)?.chargeProfile };
  }

  const { setup: storedCustomSetup } = getCustomStoredProfile(state.chargingProfile, thingName, chargeProfileSetup);

  const predefinedProfileName = getPredefinedProfileNameBySetup(chargeProfileSetup as ChargeProfileSetupType);
  const customReportedAndStored =
    isEqual(chargeProfileSetup, storedCustomSetup) && storedActiveProfileName === ChargeProfileType.Custom;
  // it's custom if any of two cases
  // - stored custom setup matches device's one and active profile name is custom
  // - device setup doesn't match any of predefined
  const deviceProfileName =
    customReportedAndStored || !predefinedProfileName ? ChargeProfileType.Custom : predefinedProfileName;

  return {
    deviceProfileName,
    deviceProfileSetup: chargeProfileSetup,
    storedActiveProfileName,
    storedCustomSetup,
    isConnected: (deviceInfo as DeviceState)?.isConnected,
  };
};
