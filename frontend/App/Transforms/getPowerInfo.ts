import semver from 'semver';

import AppConfig from 'App/Config/AppConfig';
import { Yeti6GState } from 'App/Types/Yeti';

export const getPowerInValue = (device: Yeti6GState): number =>
  (device?.status?.ports?.acIn?.w || 0) +
  (device?.status?.ports?.lvDcIn?.w || 0) +
  (device?.status?.ports?.hvDcIn?.w || 0) +
  (device?.status?.ports?.aux?.w > 0 ? device?.status?.ports?.aux?.w : 0) +
  (semver.lt(device?.device?.fw || '0.0.0', AppConfig.minFirmwareVersionForCorrectPassthroughWatts) &&
  device?.status?.ports?.acOut?.s === 2 &&
  (device?.status?.ports?.acIn?.s === 0 || device?.status?.ports?.acIn?.s === 2)
    ? device?.status?.ports?.acOut?.w
    : 0);

export const getPowerOutValue = (device: Yeti6GState): number =>
  device?.status?.ports?.acOut?.w +
  device?.status?.ports?.v12Out?.w +
  device?.status?.ports?.usbOut?.w +
  (device?.status?.ports?.aux?.w < 0 ? Math.abs(device?.status?.ports?.aux?.w) : 0);
