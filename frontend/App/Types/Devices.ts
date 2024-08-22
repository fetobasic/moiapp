import { FridgeState } from './Fridge';
import { XNodes, Yeti6GState, YetiState } from './Yeti';

export type DeviceType =
  | 'Y6G_4000'
  | 'Y6G_300'
  | 'Y6G_500'
  | 'Y6G_700'
  | 'Y6G_1000'
  | 'Y6G_1500'
  | 'Y6G_2000'
  | 'YETI'
  | 'ALTA_45_FRIDGE'
  | 'ALTA_50_FRIDGE'
  | 'ALTA_80_FRIDGE'
  | 'GENERIC_FRIDGE';

export type DeviceState = YetiState | Yeti6GState | FridgeState;

export type Model = {
  name: string;
  description: string;
};

export type TimeInfo = {
  sys: number;
  up: number;
};

export type NetworkInfo = {
  ssid: string;
  conn: number;
};

export type ScannedWiFi = {
  ssid: string;
  rssi: number;
  known: boolean;
};

export type WLanInfo = {
  s: number;
  err: number;
  ssid: string;
  rssi: number;
  ip: string;
  known: { [key: string]: NetworkInfo };
  scanned?: ScannedWiFi[];
};

export type CloudInfo = {
  s: number;
  err: number;
  env: string;
  mqtt: string;
  api: string;
};

export type IoTInfo = {
  ble: {
    m: number;
    rm: number;
    c: number;
  };
  ap: {
    m: number;
    rm: number;
    c: number;
  };
  sta: {
    m: number;
    rm: number;
    wlan: WLanInfo;
    cloud: CloudInfo;
  };
};

export type ReqInfo = {
  reboot: number;
  reset: number;
  chkUpd: number;
};

export type ActInfo = {
  s: number;
  req: ReqInfo;
};

export type iNodesInfo = { [key: string]: { fw: string } };

export type xNodesInfo = {
  [key: string]: {
    hostId: string;
    fw: string;
    tConn: number;
    tLost: number;
    sn: string;
    whCap: number;
  };
};

export type DeviceInfo = {
  _version: number;
  fw: string;
  thingName: string;
  local: string;
  lbl: string;
  hostId: string;
  sn: string;
  mac: string;
  time: TimeInfo;
  iot: IoTInfo;
  act: ActInfo;
  iNodes: iNodesInfo;
  xNodes: XNodes;
  identity: {
    thingName: string;
    local: string;
    lbl: string;
    hostId: string;
    sn: string;
    mac: string;
    model?: string;
  };
  batt: {
    sn: string;
    whCap: number;
    mfDate: string;
    mfName: string;
  };
};
