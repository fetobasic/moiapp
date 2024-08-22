import { YetiModel, YetiState } from 'App/Types/Yeti';
import { fridgeAlta50State, fridgeAlta80State } from '../fridgeState';

export const mockedNavigation = {
  navigate: jest.fn(),
  dispatch: jest.fn(),
  reset: jest.fn(),
  goBack: jest.fn(),
  isFocused: jest.fn(),
  canGoBack: jest.fn(),
  getId: jest.fn(),
  getParent: jest.fn(),
  getState: jest.fn(),
  emit: jest.fn(),
  setParams: jest.fn(),
  jumpTo: jest.fn(),
  openDrawer: jest.fn(),
  closeDrawer: jest.fn(),
  toggleDrawer: jest.fn(),
  setOptions: jest.fn(),
  addListener: jest.fn(),
  removeListener: jest.fn(),
};

export const yetiLegacy: YetiState = {
  thingName: 'yeti083af2ae2330',
  deviceType: 'YETI',
  ampsOut: 0,
  chargeProfile: { max: 95, min: 2, re: 90 },
  wattsIn: 0,
  isCharging: 0,
  temperature: 25,
  wattsOut: 0,
  usbPortStatus: 0,
  timeToEmptyFull: -1,
  ampsIn: 0,
  volts: 11.9,
  socPercent: 86,
  version: '3',
  whStored: 1260,
  ipAddr: '192.168.0.156',
  notify: { enabled: 1048575, trigger: 0 },
  timestamp: 3088647,
  inputDetected: 0,
  whOut: 331,
  firmwareVersion: '1.8.7',
  wifiStrength: -61,
  v12PortStatus: 0,
  app_online: 0,
  ssid: 'netis271',
  acPortStatus: 0,
  ota: { delay: 0, status: '000-000-100_001-000-100_002-000-100_003-000-100' },
  backlight: 1,
  model: YetiModel.YETI_1500X_120V,
  name: 'yeti083af2ae2330',
  isDirectConnection: false,
  usedAnywhereConnect: true,
  isConnected: false,
  isShowFirmwareUpdateNotifications: true,
  settings: { temperature: 'FAHRENHEIT', voltage: 'V120' },
  peripheralId: '0568E86A-7591-9CB2-2ACC-26A11E2076E6',
};

export const yeti6G = {
  device: {
    _version: 1,
    identity: {
      thingName: 'gzy1-b8d61a5c0804',
      localName: 'gzy1-5c0804',
      label: 'My Yeti 4000 Pro',
      modelName: 'Yeti 4000 Pro',
      model: 0,
      sn: null,
      macAddr: 'B8D61A5C0804',
      nodes: null,
    },
    time: { sys: 1690382156, up: 3709 },
  },
  thingName: 'gzy1-b8d61a5c0804',
  model: 'Y6G_4000',
  deviceType: 'Y6G_4000',
  directFirmwareUpdateStartTime: 0,
  isDirectConnection: true,
  isUsedDirectConnect: true,
  isConnected: false,
  dataTransferType: 'bluetooth',
  usedAnywhereConnect: false,
  connectedAt: '2023-07-26T14:36:04.498Z',
  name: 'gzy1-b8d61a5c0804',
  isLockAllPorts: true,
  isLockAllNotifications: true,
  isLockChangeChargingProfile: true,
  isLockAllBatteryItems: true,
  peripheralId: '0568E86A-7591-9CB2-2ACC-26A11E2076E6',
  firmwareVersion: '1.3.7',
};

export const yeti6GLatestFW = {
  thingName: 'gzy1-b8d61a5c0804',
  isConnected: true,
  deviceType: 'Y6G_4000',
  device: {
    _version: 1,
    fw: '1.3.7',
    identity: {
      thingName: 'gzy1-b8d61a5c0804',
    },
  },
  status: {
    inv: {
      cTmp: 150,
    },
    batt: {
      whRem: 1000,
      whCap: 20000,

      cyc: 999999,
      soc: 85,
      v: 54.4,
      aNetAvg: 100,
      aNet: -100,
      cTmp: 14,
      mTtef: 144000,
      WNetAvg: -9999,
      WNet: 9999,
      wNetAvg: -9999,
      wNet: 9999,
      pctHtsRh: 100,
      cHtsTmp: -100,
      whIn: 41515,
      whOut: 41515,
    },
    ports: {
      acOut: {
        s: 0,
        w: 0,
        v: 0,
        a: 0,
      },
      v12Out: {
        s: 0,
        w: 0,
        a: 0,
      },
      usbOut: {
        s: 0,
        w: 0,
      },
      acIn: {
        s: 0,
        v: 0,
        a: 0,
        w: 0,
        hLmt: 0,
      },
      lvDcIn: {
        s: 0,
        v: 0,
        a: 0,
        w: 0,
      },
      hvDcIn: {
        s: 0,
        v: 55.1,
        a: 3.9,
        w: 220,
      },
      aux: {
        v: 0,
        a: 0,
        w: 0,
      },
    },
  },
  lifetime: {
    wmu: {
      reset: 0,
      mUp: 0,
      fwUpd: 0,
      confWr: 0,
      crash: 0,
    },
    batt: {
      cyc: 999999,
      soh: 100,
      whIn: 999999,
      whOut: 999999,
      uvp: 999999,
      ovp: 999999,
      otp: 999999,
      ocp: 999999,
      utp: 999999,
      mht: 999999,
      mlt: 999999,
      mlv: 999999,
      cTmpMax: 999,
      cTmpMin: 999,
    },
    hts: {
      pctRhMax: 100,
      cTmpMax: 999.9,
      cTmpMin: 999.9,
    },
    inv: {
      otp: 999999,
      mht: 999999,
      ovp: 999999,
      uvp: 999999,
      scp: 999999,
    },
    ports: {
      acIn: {
        wMax: 999999,
        wh: 999999,
        ovp: 999999,
        uvp: 999999,
        ocp: 999999,
      },
      lvDcIn: {
        wMax: 999999,
        wh: 999999,
        ovp: 999999,
        ocp: 999999,
        uvp: 999999,
      },
      hvDcIn: {
        wMax: 999999,
        wh: 999999,
        ovp: 999999,
        ocp: 999999,
        uvp: 999999,
      },
      acOut: {
        wMax: 999999,
        wh: 999999,
        scp: 999999,
        ocp: 999999,
      },
      usbOut: {
        wMax: 999999,
        wh: 999999,
        scp: 999999,
        ocp: 999999,
      },
      v12Out: {
        wMax: 999999,
        wh: 999999,
        scp: 999999,
        ocp: 999999,
      },
    },
    btn: {
      ac: 999999,
      v12: 999999,
      usb: 999999,
      pair: 999999,
      lght: 999999,
      stng: 999999,
    },
  },
  config: {
    chgPrfl: {
      min: 0,
      max: 100,
      rchg: 95,
    },
  },
  isShowFirmwareUpdateNotifications: true,
  isDirectConnection: true,
};

export const mockedInitState = {
  devicesInfo: {
    data: [],
  },
  notification: {
    notifications: [],
  },
  application: {
    dataTransferType: 'bluetooth',
  },
  auth: {},
};

export const mockedState = {
  activeProfiles: {
    ['gzy1-b8d61a5c0804']: {
      name: 'balanced',
    },
  },
  customProfiles: {
    ['gzy1-b8d61a5c0804']: {
      name: 'balanced',
    },
  },
  application: {
    isDirectConnection: true,
    isShowOnboarding: false,
    dataTransferType: 'bluetooth',
    connectedPeripheralIds: ['id1', 'id2'],
    feedbackFormInfo: { isError: false, isSuccess: false },
    appRateInfo: { shownAppRateDate: '1970-01-01T00:00:00.000Z' },
    units: { temperature: 'fahrenheit' },
  },
  auth: {
    isSignedIn: true,
    user: { firstName: 'testemail@example.com', lastName: 'testemail@example.com', email: 'testemail@example.com' },
    auth: { accessToken: 'testAccessToken', expiresAt: '2023-09-06T14:31:30Z' },
    resetPasswordRequestSuccess: false,
    updateUserRequestSuccess: false,
    requests: { signUp: false, login: false, forgotPassword: false, updateUser: false },
    errors: {},
    things: [],
  },
  aws: { isConnected: false },
  cache: { appRateInfo: { isBlockedShowAppRate: false, isReadyToShowAppRate: false } },
  chargingProfile: { activeProfiles: {}, customProfiles: {}, fetching: false, error: '' },
  devicesInfo: {
    error: null,
    data: [yetiLegacy, yeti6GLatestFW, fridgeAlta50State, fridgeAlta80State],
    startUnpair: true,
  },
  firmwareUpdate: { data: {}, firmwareVersions: { YETI: [{ version: '2.3.4' }] }, startOta: false, successOta: false },
  modal: { isVisible: false, params: {} },
  notification: {
    token: 'testToken',
    isEnabled: true,
    notifications: [],
  },
  startup: { isAppLoaded: true },
  usageReport: {
    reportUrl: {
      'gzy1-b8d61a5c0804': {
        hourly: 'https:hourly',
      },
    },
    fetching: false,
    reportData: {
      'gzy1-b8d61a5c0804': {
        hourly: {
          data: 'testData',
          timestamp: 1690386943,
        },
      },
    },
    error: null,
    showEnergyInChart: 'ON',
    showEnergyOutChart: 'ON',
    showBatteryChart: 'ON',
    chartType: 'PAST_MONTH',
  },
  yetiWifiList: { fetching: false, error: false, data: [] },
  yetiInfo: {
    fetching: null,
    error: null,
    data: null,
    passwordChange: { inProgress: null, error: null },
    startPairConfirmed: false,
    startPairError: false,
    discoveredDevices: [],
    fetchingYetiInfo: false,
  },
  network: { isConnected: false, actionQueue: [], isQueuePaused: false },
  _persist: { version: -1, rehydrated: true },
};
