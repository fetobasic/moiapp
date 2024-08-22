import { DataTransferType } from './ConnectionType';
import { DeviceType, DeviceInfo } from './Devices';

export const enum PortStatus {
  Inactive = 0,
  Detected = 1,
  Charging = 2,
  Error = 3,
}

export enum YetiModel {
  YETI_1400 = 'Yeti 1400',
  YETI_3000 = 'Yeti 3000',
  YETI_1000X_120V = 'Yeti 1000X (120V)',
  YETI_1000X_230V = 'Yeti 1000X (230V)',
  YETI_1500X_120V = 'Yeti 1500X (120V)',
  YETI_1500X_230V = 'Yeti 1500X (230V)',
  YETI_3000X_120V = 'Yeti 3000X (120V)',
  YETI_3000X_230V = 'Yeti 3000X (230V)',
  YETI_6000X_120V = 'Yeti 6000X (120V)',
  YETI_6000X_230V = 'Yeti 6000X (230V)',
  YETI_300_120V = 'Yeti 300 120V',
  YETI_300_230V = 'Yeti 300 230V',
  YETI_500_120V = 'Yeti 500 120V',
  YETI_500_230V = 'Yeti 500 230V',
  YETI_700_120V = 'Yeti 700 120V',
  YETI_700_230V = 'Yeti 700 230V',
  YETI_PRO_4000 = 'Yeti PRO 4000',
  YETI_PRO_4000_120V = 'Yeti PRO 4000 120V',
  YETI_PRO_4000_230V = 'Yeti PRO 4000 230V',
  YETI_1000_120V = 'Yeti 1000 120V',
  YETI_1000_230V = 'Yeti 1000 230V',
  YETI_1500_120V = 'Yeti 1500 120V',
  YETI_1500_230V = 'Yeti 1500 230V',
  YETI_2000_120V = 'Yeti PRO 2000 120V',
  YETI_2000_230V = 'Yeti PRO 2000 230V',
}

export enum YetiCloudConnectMessage {
  SENDING_CREDENTIALS = 'Sending Yeti credentials...',
  CHECKING_CONNECTION = 'Checking Yeti connection...',
  CONNECTING_YETI_TO_CLOUD = 'Yeti connecting to cloud...',
  CONNECTING_APP_TO_CLOUD = 'App finding Yeti/Cloud connection...',
  PAIRING_TO_ACCOUNT = 'Pairing Yeti to your account...',
  CLOUD_CONNECTED = 'Cloud Connected!',
}

export type ChargeProfile = {
  min: number;
  max: number;
  re: number;
};

export type ForeignAcsry = {
  model: string;
  firmwareVersion: string;
  mode: number;
  tankCapacity: number;
};

export type Notify = {
  enabled: number;
  trigger?: number;
};

export type YetiState = {
  thingName?: string;
  peripheralId?: string;
  deviceType?: DeviceType;
  dateSync?: string;
  v12PortStatus?: number;
  usbPortStatus?: number;
  acPortStatus?: number;
  backlight?: number;
  app_online?: number;
  wattsIn?: number;
  ampsIn?: number;
  wattsOut?: number;
  ampsOut?: number;
  whOut?: number;
  whStored?: number;
  volts?: number;
  socPercent?: number;
  isCharging?: number;
  inputDetected?: number;
  timeToEmptyFull?: number;
  temperature?: number;
  wifiStrength?: number;
  ssid?: string;
  ipAddr?: string;
  timestamp?: number;
  firmwareVersion?: string;
  version?: string;
  chargeProfile?: ChargeProfile;
  ota?: {
    delay: number;
    status: string;
  };
  notify?: Notify;
  foreignAcsry?: ForeignAcsry;

  // Local only
  name?: string;
  model?: YetiModel;
  isDirectConnection?: boolean;
  isUsedDirectConnect?: boolean;
  usedAnywhereConnect?: boolean;
  isLockAllNotifications?: boolean;
  isShowFirmwareUpdateNotifications?: boolean;
  isConnected?: boolean;
  dataTransferType?: DataTransferType;
  isLockAllPorts?: boolean;
  isLockAllBatteryItems?: boolean;
  settings?: {
    temperature: 'FAHRENHEIT' | 'CELSIUS';
    voltage: 'V120' | 'V230';
  };
  directFirmwareUpdateStartTime?: number;
  lastNotification?: {
    version?: string;
    time: Date;
  };

  // according to the future doc:
  // https://github.com/GoalZero26503/docs-iot-architecture/blob/docs/gen6/latest/yeti-300-500-700/device/README.md
  device?: { identity?: { thingName?: string }; fw: string };
};

export type YetiConnectionCredentials = {
  wifi: {
    name: string;
    pass?: string | null;
  };
  iot: {
    env: string;
    hostname: string;
    endpoint: string;
  };
};

export type Yeti6GConnectionCredentials = {
  iot: {
    sta: {
      m: number;
      wlan: {
        ssid: string;
        pass?: string | null;
      };
      cloud: {
        env: string;
        mqtt: string;
        api: string;
      };
    };
  };
};

export type AwsState = {
  state: {
    reported?: YetiState | Yeti6GState;
    desired?: YetiState | Yeti6GState;
  };
};

// Response from Yeti

export type YetiSysInfo = {
  name: string;
  model: YetiModel;
  firmwareVersion: string;
  macAddress: string;
  platform: string;
  hostId?: string;
};

export type YetiDirectInfo = YetiSysInfo & { state: YetiState; foreignAcsry: ForeignAcsry; notify: Notify };

// Example: { "vjt-44472":{"db":-63}, "FRITZ!Box 7360 PRC":{"db":-86}, "wdm-55481":{"db":-90}, "mav-01339":{"db":-93} }
export type WiFiListObj = {
  [key: string]: { db: number; saved?: boolean };
};

export type WiFiList = {
  name: string;
  db: number;
  saved?: boolean;
};

export type BluetoothResponseType<T> = {
  id: number;
  src: string;
  result: {
    id: number;
    status_msg: string;
    status_code: number;
    body: T;
  };
};

// Yeti 6G
export type Batt6G = {
  whIn: number; // User watt-hours in counter that can be reset for simple tracking of usage.
  whOut: number; // User watt-hours out counter that can be reset for simple tracking of usage.
  cyc: number; // The user's cycle counter (like a car odometer). Can be reset to 0 by the user.
  soh: number; // The Battery State of Health.
  soc: number; // The Battery State of Charge.
  whCap: number; // The Watt-Hour Total Capacity of the Battery.
  whRem: number; // The Watt-Hour Remaining Capacity of the Battery.
  v: number; // The Battery voltage
  aNetAvg: number; // The Battery average Net Amperage
  aNet: number; // The Battery current Net Amperage
  cTmp: number; // The battery protection circuit temperature. The battery protection circuit temperature.
  mTtef: number; // The Battery Time to Empty (if negative) or Time to Full (if positive) in minutes
  WNetAvg: number; // The Battery average Net Wattage -- NOTE: the firmware had a typo here so it's WNetAvg instead of wNetAvg (TODO: need this for yeti4000 compatibility)
  WNet: number; // The Battery current Net Wattage -- NOTE: the firmware had a typo here so it's WNet instead of wNet (TODO: need this for yeti4000 compatibility)
  wNetAvg: number; // The Battery average Net Wattage
  wNet: number; // The Battery current Net Wattage
  pctHtsRh: number; // The Environment humidity in percent (determined by a Humidity/Temperature sensor)
  cHtsTmp: number; // The Environment temperature in celsius (determined by a Humidity/Temperature sensor).
};

export type Yeti6GConfig = {
  notify: number[];
  chgPrfl: {
    min: number; // The minimal level of state of charge, to which the Yeti battery may be discharged.
    max: number; // The maximum level of state of charge, to which the Yeti battery may be charged.
    rchg: number; // The level of state of charge, to which the Yeti battery should be discharged before it is allowed to charge back again.
  };
  ports: {
    acIn: {
      plus: {
        aLmt: number;
      };
      wall: {
        aLmt: number;
        aChgLmt: number;
      };
    };
  };
  inv: {
    v: number;
    hz: number;
  };
  xNodes: Partial<XNodes>;
  fwAutoUpd: number;
};

export type Yeti6GStatus = {
  appOn: number;
  shdw: {
    device: number;
    config: number;
    ota: number;
    lifetime: number;
  };
  batt: Batt6G;
  btn: {
    pwr: number;
  };
  inv: {
    cTmp: number;
  };
  ports: {
    acOut: {
      // AC output port
      s: number; // port status // type 'number' // units=none // range [0=disabled,1=enabled,>2=alt/error] // read/write - caller can write s=0 to disable, s=1 to enable
      w: number; // power Watts // type 'number' (unsigned int) // units=watts // range [0-2^32-1] // read-only
      v: number; // Port Volts // type 'number' (float, 10ths precision) // units=v // range [0.0-500.0] // read-only
      a: number; // Current Amps // type 'number' (float, 10ths precision) // units=amps // range [0.0-100.0] // read-only
    };
    v12Out: {
      // 12V output port
      s: number; // port status // type 'number' // units=none // range [0=disabled,1=enabled,>2=alt/error] // read/write - caller can write s=0 to disable, s=1 to enable
      v: number; // Port Volts // type 'number' (float, 10ths precision) // units=v // range [0.0-500.0] // read-only
      w: number; // power Watts // type 'number' (unsigned int) // units=watts // range [0-2^32-1] // read-only
      a: number; // Current Amps // type 'number' (float, 10ths precision) // units=amps // range [0.0-100.0] // read-only
    };
    usbOut: {
      // USB output port
      s: number; // port status // type 'number' // units=none // range [0=disabled,1=enabled,>2=alt/error] // read/write - caller can write s=0 to disable, s=1 to enable
      w: number; // power Watts // type 'number' (unsigned int) // units=watts // range [0-2^32-1] // read-only
    };
    acIn: {
      // AC input ports combined
      v: number; // Port Volts // type 'number' (float, 10ths precision) // units=v // range [0.0-500.0] // read-only
      a: number; // Current Amps // type 'number' (float, 10ths precision) // units=amps // range [0.0-100.0] // read-only
      w: number; // power Watts // type 'number' (unsigned int) // units=watts // range [0-2^32-1] // read-only
      fastChg: number; // Fast Charge // type 'number' // units=none // range [0=disabled,1=enabled] // read-only
      s: number;
      hLmt: number;
    };
    lvDcIn: {
      // Low Voltage DC input port
      v: number; // Port Volts // type 'number' (float, 10ths precision) // units=v // range [0.0-500.0] // read-only
      a: number; // Current Amps // type 'number' (float, 10ths precision) // units=amps // range [0.0-100.0] // read-only
      w: number; // power Watts // type 'number' (unsigned int) // units=watts // range [0-2^32-1] // read-only
      s: number;
    };
    hvDcIn: {
      // High Voltage DC input port
      v: number; // Port Volts // type 'number' (float, 10ths precision) // units=v // range [0.0-500.0] // read-only
      a: number; // Current Amps // type 'number' (float, 10ths precision) // units=amps // range [0.0-100.0] // read-only
      w: number; // power Watts // type 'number' (unsigned int) // units=watts // range [0-2^32-1] // read-only
      s: number;
    };
    aux: {
      // Aux in/out port
      v: number; // Port Volts // type 'number' (float, 10ths precision) // units=v // range [0.0-500.0] // read-only
      a: number; // Current Amps (signed, negative means output) // type 'number' (float, 10ths precision) // units=amps // range [-100.0-100.0] // read-only
      w: number; // power Watts (signed, negative means output) // type 'number' (signed int) // units=watts // range [-2^31,2^31-1] // read-only
      s: number;
    };
  };
  wifiRssi: number;
  xNodes: XNodes;
};

export type Yeti6GLifetime = {
  wmu: {
    reset: number;
    mUp: number;
    fwUpd: number;
    confWr: number;
    crash: number;
  };
  batt: {
    cyc: number;
    soh: number;
    whIn: number;
    whOut: number;
    uvp: number;
    ovp: number;
    otp: number;
    ocp: number;
    utp: number;
    mht: number;
    mlt: number;
    mlv: number;
    cTmpMax: number;
    cTmpMin: number;
  };
  hts: {
    pctRhMax: number;
    cTmpMax: number;
    cTmpMin: number;
  };
  inv: {
    otp: number;
    mht: number;
    ovp: number;
    uvp: number;
    scp: number;
  };
  ports: {
    acIn: {
      wMax: number;
      wh: number;
      ovp: number;
      uvp: number;
      ocp: number;
    };
    lvDcIn: {
      wMax: number;
      wh: number;
      ovp: number;
      ocp: number;
      uvp: number;
    };
    hvDcIn: {
      wMax: number;
      wh: number;
      ovp: number;
      ocp: number;
      uvp: number;
    };
    acOut: {
      wMax: number;
      wh: number;
      scp: number;
      ocp: number;
    };
    usbOut: {
      wMax: number;
      wh: number;
      scp: number;
      ocp: number;
    };
    v12Out: {
      wMax: number;
      wh: number;
      scp: number;
      ocp: number;
    };
  };
  btn: {
    ac: number;
    v12: number;
    usb: number;
    pair: number;
    lght: number;
    stng: number;
  };
};

export type YetiOtaType = {
  _version: number;
  msg: string;
  jobId: string;
  tBgn: number;
  tEnd: number;
  fw: string;
  p: number;
  s: number;
  errS: number;
  errC: number;
  iNodes: INodes;
  xNodes: XNodes;
};

export type INodes = {
  [key: string]: {
    fw: string;
    p: number;
    s: number;
  };
};

export type XNodes = {
  [key: string]: xNode;
};

export type xNode = {
  hostId: string;
  fw: string;
  sn?: string;
  tConn: number;
  tLost: number;
  soc: number;
  soh: number;
  cTmp: number;
  pctHtsRh: number;
  whIn: number;
  whOut: number;
  whRem: number;
  whCap: number;
  wNet: number;
  cyc: number;
  v: number;
  s?: number;
  pair?: string;
  wIn?: number;
  wOut?: number;
  mTtef?: number;
  model?: string;
  wL1?: number;
  wL2?: number;
  dsp: {
    brt: number;
    tOut: number;
  };
};

export type Yeti6GState = {
  device: DeviceInfo;
  status: Yeti6GStatus;
  config: Yeti6GConfig;
  ota: YetiOtaType;
  lifetime: Yeti6GLifetime;

  thingName: string;
  peripheralId?: string;
  model: string;
  name?: string;
  hostId?: string;
  dateSync?: string;
  connectedAt?: string;
  deviceType?: DeviceType;
  isDirectConnection?: boolean;
  isUsedDirectConnect?: boolean;
  isConnected?: boolean;
  usedAnywhereConnect?: boolean;
  isShowFirmwareUpdateNotifications?: boolean;
  dataTransferType?: DataTransferType;
  isLockAllPorts?: boolean;
  fw?: string;
  settings?: {
    temperature: 'FAHRENHEIT' | 'CELSIUS';
    voltage: 'V120' | 'V230';
  };
  lastNotification?: {
    version?: string;
    time: Date;
  };
};
