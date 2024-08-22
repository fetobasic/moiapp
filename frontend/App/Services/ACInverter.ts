import { Yeti6GState, YetiModel } from 'App/Types/Yeti';
import { getVoltage } from './Yeti';
import { isYeti1000, isYeti1500, isYeti2000, isYeti4000, isYeti500, isYeti700 } from './ThingHelper';

export const getPowerLimits = (device: Yeti6GState) => {
  const isV120 = getVoltage(device?.model as YetiModel, device?.device?.identity?.hostId) === 'V120';
  const usAcVoltage = isV120 ? 120 : 230;
  const minLimitA = 3.3;
  let maxLimitA = isV120 ? 9.5 : 4.9;
  let maxChgLimitA = isV120 ? 3.5 : 1.8;

  if (isYeti500(device) || isYeti700(device)) {
    maxChgLimitA = isV120 ? 4.2 : 2.2;
  } else if (isYeti1000(device)) {
    maxLimitA = isV120 ? 16.7 : 8.7;
    maxChgLimitA = isV120 ? 9 : 4.3;
  } else if (isYeti1500(device)) {
    maxLimitA = isV120 ? 16.7 : 8.7;
    maxChgLimitA = isV120 ? 14.6 : 6.5;
  } else if (isYeti2000(device)) {
    maxLimitA = isV120 ? 20 : 10.4;
    maxChgLimitA = isV120 ? 16.7 : 8.7;
  } else if (isYeti4000(device)) {
    maxLimitA = isV120 ? 15 : 7.8;
    maxChgLimitA = isV120 ? 15 : 7.8;
  }

  const minLimitW = minLimitA * usAcVoltage;
  const maxLimitW = maxLimitA * usAcVoltage;

  return {
    minLimitA,
    maxLimitA,
    minLimitW,
    maxLimitW,
    maxChgLimitA,
  };
};

export const getPowerPortsLimits = (device: Yeti6GState) => {
  const isV120 = getVoltage(device?.model as YetiModel, device?.device?.identity?.hostId) === 'V120';
  const usAcVoltage = isV120 ? 120 : 230;
  const minLimitA = 3.3;
  let maxLimitA = isV120 ? 30 : 15.6;
  let maxChgLimitA = isV120 ? 16.7 : 8.7;

  if (isYeti4000(device)) {
    maxChgLimitA = isV120 ? 25 : 13;
  }

  const minLimitW = minLimitA * usAcVoltage;
  const maxLimitW = maxLimitA * usAcVoltage;

  return {
    minLimitA,
    maxLimitA,
    minLimitW,
    maxLimitW,
    maxChgLimitA,
  };
};
