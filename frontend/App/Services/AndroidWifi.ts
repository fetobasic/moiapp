import RNAndroidWifi from 'react-native-wifi-reborn';
import { isFunction } from 'lodash';

import Config from 'App/Config/AppConfig';
import { isAndroid } from 'App/Themes';

let disableTimeout: ReturnType<typeof setTimeout> | null = null;
let forceWifiEnabled = false;

function canControlWifiUsage() {
  return isAndroid && RNAndroidWifi && isFunction(RNAndroidWifi.forceWifiUsageWithOptions);
}

function clearDisableTimer() {
  if (disableTimeout) {
    clearTimeout(disableTimeout);
  }
  disableTimeout = null;
}

/**
 * @returns {boolean} Whether or not the force usage was enabled
 */
export function enableForceWifiUsage() {
  if (!canControlWifiUsage()) {
    return false;
  }

  clearDisableTimer();

  forceWifiEnabled = true;
  return RNAndroidWifi.forceWifiUsageWithOptions(true, { noInternet: true });
}

/**
 * @param {int} timeout
 * @returns {boolean} Whether or not the force usage was disabled
 */
export function disableForceWifiUsage(timeout = Config.androidAForceWifiTimeout) {
  if (!canControlWifiUsage()) {
    return false;
  }

  clearDisableTimer();

  if (forceWifiEnabled && timeout) {
    disableTimeout = setTimeout(() => {
      RNAndroidWifi.forceWifiUsageWithOptions(false, { noInternet: true });
      forceWifiEnabled = false;
      clearDisableTimer();
    }, timeout);
  } else {
    RNAndroidWifi.forceWifiUsageWithOptions(false, { noInternet: true });
    forceWifiEnabled = false;
  }

  return true;
}
