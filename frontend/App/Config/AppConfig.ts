import DeviceInfo from 'react-native-device-info';
import Env from './Environments';
import { isIOS } from 'App/Themes';

export const env = Env.DEV;

export const isDev = env === Env.DEV;
export const isTest = env === Env.TEST;
export const isAlpha = env === Env.ALPHA;
export const isBeta = env === Env.BETA;
export const isStage = env === Env.STAGE;
export const isProduction = env === Env.PROD;

export const isDebug = __DEV__; // switch to false to test disabling debug features locally
export const phoneId = DeviceInfo.getUniqueIdSync();
export const appVersion = DeviceInfo.getReadableVersion();

// Simple React Native specific changes
export default {
  // font scaling override - RN default is on
  allowTextFontScaling: true,
  enableBackendLogging: true,
  minFirmwareVersionForDirectConnect: '0.4.26',
  minFirmwareVersionForUsageHistory: '1.5.0',
  minFirmwareVersionY6gY4kEnergyHistory: isDev ? '0.0.0' : '1.5.0',
  minFirmwareVersionForCorrectPassthroughWatts: '1.5.5',
  invalidY6gY4kSerialNumber: 'SKU-Rev-YYMxxxxx',
  androidAForceWifiTimeout: 1500,
  zero: 0,
  checkInternetTimeout: 10 * 1000, // 10 sec
  batteryBlink: 1000, // 1 sec
  checkPairingWiFiTimeout: 2 * 60 * 1000, // 2 min
  checkPairingBluetoothTimeout: 150 * 1000, // 2 min 30 sec
  checkResponseTimeout: 30 * 1000, // 30 sec
  chargeProfileCheckTimeout: 15 * 1000, // 15 sec
  dialogWaitingTimeout: 30 * 1000, // 30 sec
  awsIotReconnectTimeout: 5 * 1000, // 5 sec
  refreshWifiTimeout: 5 * 1000, // 5 sec
  loadYetiInfoTimeout: 10 * 1000, // 10 sec
  loadYetiInfoMaxRetryAttempts: 3,
  awsIotMaxRetryAttempts: 3,
  pairThingMaxRetryAttempts: 6,
  bluetoothResponseMaxRetryAttempts: 5,
  bluetoothResponseDelay: 500, // 500 ms
  pairThingTimeoutInterval: 1500,
  splashScreenHideTime: 500, // delay to load application
  disconnectedTimeout: 15 * 1000, // 15 sec
  debounceTimeout: 750, // 750 ms
  debounceLongTimeout: 2 * 1000, // 2 sec
  defaultYeti6g12vConstantVoltage: 13.48,
  portSwitchTimeout: 2 * 1000, // 2 sec
  directGetStateTimeout: 5 * 1000, // 5 sec
  directBltGetStateTimeout: 5 * 1000, // 5 sec
  checkUpdatesInterval: 60 * 60 * 1000, // 1 hour
  checkUpdatesTimeout: 24 * 60 * 60 * 1000, // 24 hours
  wifiIconBlinkInterval: 1000,
  bluetoothSecondsToScan: isIOS ? 30 : -1, // iOS doesn't allow to set infinite BT scan
  bluetoothMaxAttemptsToConnect: 3,
  unlockTimeout: 7 * 1000, // 7 sec
  firmwareVersionInterval: isProduction
    ? 6 * 60 * 60 * 1000 // 6 hours
    : 10 * 60 * 1000, // 10 min
  unpairModalDelay: 500, // 500 ms
  genericModalDelay: 500, // 500 ms
  defaultDelay: 1000, // 1 sec
  smallDelay: 500, // 500 ms
  chargingBatteryDuration: 5 * 1000, // 5 sec
  batteryAnimationDelay: 1000, // 1 sec
  directFirmwareUpdateStateReceiveDelay: 15, // 15 sec
  directFirmwareUpdateMaxTime: 5, // 5 min
  deviationYetiSyncTime: 5, // 5 sec
  sendOnlineStateAfterReconnectDelay: 3 * 1000, // 3 seconds
  appRateCheckDelay: 60 * 1000, // 1 min
  appRateShowDelay: 5 * 1000, // 5 seconds
  appRateWaitAfterCancel: isDev
    ? 10 * 60 * 1000 // 10 minutes
    : 61 * 24 * 60 * 60 * 1000, // 61 days
  androidNotificationChannelId: 'yeti',
  defaultAnimationDuration: 300,
  quickAnimationDuration: 150,
  showConnectToWiFiDelay: 5 * 1000, // 5 seconds
  hideProgressBarDelay: 2 * 1000, // 2 seconds
  bluetoothConnectTimeout: 2 * 1000, // 2 seconds
  passwordLength: 8,
  maxTextInputLength: 50,
  tokenExpirationDays: 5, // 5 hour
  awsKeyRetryDelay: 15 * 1000, // 15 seconds
  lockStateChangesTimeout: 5 * 1000, // 5 seconds
  awsKeyTtl: isProduction
    ? 2 * 24 * 60 * 60 * 1000 // 2 days
    : 10 * 60 * 1000, // 10 min
  checkForErrorsInterval: 10 * 1000, // 10 seconds
  appLoadTime: 5 * 1000, // 5 seconds
  yetiTemperatureThreshold: {
    cold: 3,
    hot: 40,
  },
  bleCheckStateIntervals: {
    status: 5 * 1000, // 5 seconds
    device: 30 * 1000, // 30 seconds
    config: 30 * 1000, // 30 seconds
    ota: 5 * 1000, // 5 seconds
    lifetime: 60 * 1000, // 1 minute
  },
  loaderHideTime: 10 * 1000, // 10 seconds
  writeToFileInterval: 5 * 1000, // 5 seconds
  checkForNewFWDelay: 5 * 1000, // 5 seconds
};
