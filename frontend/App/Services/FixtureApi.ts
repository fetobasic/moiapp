export default {
  getWifiList: () => ({
    ok: true,
    data: require('../Fixtures/wifiList.json'),
  }),
  getYetiInfo: () => ({
    ok: true,
    data: require('../Fixtures/yetiInfo.json'),
  }),
  postToYeti: () => ({
    ok: true,
    data: require('../Fixtures/yetiInfo.json'),
  }),
  setPassword: () => ({
    ok: true,
    data: { msg: 'AP password change successful' },
  }),
  directConnect: () => ({
    ok: true,
    data: require('../Fixtures/yetiDirectInfo.json'),
  }),
  checkState: () => ({
    ok: true,
    data: require('../Fixtures/yetiDirectInfo.json').state,
  }),
  changeState: () => ({
    ok: true,
    data: require('../Fixtures/yetiDirectInfo.json').state,
  }),
  startPair: () => ({
    ok: true,
    status: 200,
    data: null,
  }),
  pairThing: () => ({
    ok: true,
    data: require('../Fixtures/devices.json'),
  }),
  unpairPhoneFromThing: () => ({
    ok: true,
    data: null,
  }),
  alterYetiName: () => ({
    ok: true,
    data: null,
  }),
  registerPhoneNotifications: () => ({
    ok: true,
    data: null,
  }),
  subPhoneForNotifications: () => ({
    ok: true,
    data: null,
  }),
  unsubPhoneForNotifications: () => ({
    ok: true,
    data: null,
  }),
  checkForUpdates: () => ({
    ok: true,
    data: require('../Fixtures/firmwareCheckForUpdates.json'),
  }),
  updateFirmware: () => ({
    ok: true,
    data: require('../Fixtures/updateFirmware.json'),
  }),
  getThings: () => ({
    ok: true,
    data: [],
  }),
  getThingsWithDetails: () => ({
    ok: true,
    data: [],
  }),
  getFirmwareVersions: () => ({
    ok: true,
    data: require('../Fixtures/firmwareVersions.json'),
  }),
  updateYetiOta: () => ({
    ok: true,
    data: null,
  }),
  sendFeedbackForm: () => ({
    ok: false,
    data: null,
  }),
  getUsageReportUrl: () => ({
    ok: false,
    data: null,
  }),
  getInsightsReportUrl: () => ({
    ok: false,
    data: null,
  }),
  downloadUsageReport: () => ({
    ok: false,
    data: null,
  }),
  downloadInsightsReport: () => ({
    ok: false,
    data: null,
  }),
  userSignUp: () => ({
    ok: true,
    data: null,
  }),
  userLogin: () => ({
    ok: true,
    data: null,
  }),
  userDelete: () => ({
    ok: true,
    data: null,
  }),
  userLoginRenew: () => ({
    ok: true,
    data: null,
  }),
  userResetPassword: () => ({
    ok: true,
    data: null,
  }),
  userUpdate: () => ({
    ok: true,
    data: null,
  }),
  setAuthToken: () => ({
    ok: true,
    data: null,
  }),
  clearAuthToken: () => ({
    ok: true,
    data: null,
  }),
  get6GFirmwareVersions: () => ({
    ok: true,
    data: null,
  }),
  pairThingWithRetries: (): Promise<Error | null> => new Promise((resolve) => resolve(null)),
  log: () => ({ ok: true, data: null }),
  logError: () => ({ ok: true, data: null }),
  logWarning: () => ({ ok: true, data: null }),
  logInfo: () => ({ ok: true, data: null }),
  logDebug: () => ({ ok: true, data: null }),
  getNotifications: () => ({
    ok: true,
    data: require('../Fixtures/notificationsResponse.json'),
  }),
};
