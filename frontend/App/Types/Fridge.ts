import { DataTransferType } from './ConnectionType';

export type FridgeType = 'ALTA_50_FRIDGE' | 'ALTA_80_FRIDGE';
export type FridgeResponse = { ok: boolean };
export type FridgeResponseType =
  | 'UNKNOWN'
  | 'BIND'
  | 'GET_SETTING'
  | 'SET_SETTING'
  | 'RESTORE_FACTORY_SETTING'
  | 'LEFT_SET_TEMP'
  | 'RIGHT_SET_TEMP';

export enum FRIDGE_BIND_MODE {
  DISALLOW = 0,
  ALLOW = 1,
}

export enum FRIDGE_SWITCH_MODE {
  OFF = 0,
  ON = 1,
}

export enum FridgeCompressorMode {
  MAX = 0,
  ECO = 1,
}

export enum FridgeBatteryProtection {
  LOW = 0,
  MEDIUM = 1,
  HIGH = 2,
}

export enum FridgeUnits {
  CELSIUS = 0,
  FAHRENHEIT = 1,
}

export enum FridgeModel {
  OLD = 0,
  ALTA50 = 1, // C15
  SINGLE_HOT = 2, // C10
  ALTA80 = 3, // CR65, BCD35, R40
  SINGLE_COLD_HOT = 4,
}

export type FridgeData = {
  /* [byte 04] */ lock: number;
  /* [byte 05] */ switch: FRIDGE_SWITCH_MODE;
  /* [byte 06] */ compressorMode: FridgeCompressorMode;
  /* [byte 07] */ batteryProtection: FridgeBatteryProtection;
  /* [byte 08] */ leftBoxTempSet: number;
  /* [byte 09] */ maxControlRange: number;
  /* [byte 10] */ minControlRange: number;
  /* [byte 11] */ leftBoxTempDiff: number;
  /* [byte 12] */ startDelay: number;
  /* [byte 13] */ units: FridgeUnits;
  /* [byte 14] */ leftTempComp1: number;
  /* [byte 15] */ leftTempComp2: number;
  /* [byte 16] */ leftTempComp3: number;
  /* [byte 17] */ leftTempCompShutdown: number;
  /* [byte 18] */ leftTempActual: number;
  /* [byte 19] */ percentOfBatteryCharge: number;
  /* [byte 20] */ batteryVoltageInt: number;
  /* [byte 21] */ batteryVoltageDec: number;
  /* [byte 22] */ rightBoxTempSet: number;
  /* [byte 23] */ maxControlRangeForModel3: number;
  /* [byte 24] */ minControlRangeForModel3: number;
  /* [byte 25] */ rightBoxTempDiff: number;
  /* [byte 26] */ rightTempComp1: number;
  /* [byte 27] */ rightTempComp2: number;
  /* [byte 28] */ rightTempComp3: number;
  /* [byte 29] */ rightTempCompShutdown: number;
  /* [byte 30] */ rightTempActual: number;
  /* [byte 31] */ runningStatesOfBoxes: number;
  /* [byte 32] */ fridgeModel: FridgeModel;
  /* [byte 33] */ heatingTemp: number;
};

export type FridgeState = {
  thingName: string;
  model: string;
  name?: string;
  peripheralId: string;
  connectedAt?: string;
  deviceType?: FridgeType;
  isConnected?: boolean;
  isDirectConnection?: boolean;
  dateSync?: string;
  dataTransferType?: DataTransferType;
  data: FridgeData;
};
