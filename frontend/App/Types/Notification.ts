export enum SeverityType {
  EMERGENCY = 'emergency',
  ERROR = 'error',
  WARNING = 'warn',
  NOTICE = 'notice',
  INFO = 'info',
  DEBUG = 'debug',
}

export enum StoredNotificationType {
  FIRMWARE_UPDATE_AVAILABLE = 'FIRMWARE_UPDATE_AVAILABLE',
  FIRMWARE_UPDATE_COMPLETE = 'FIRMWARE_UPDATE_COMPLETE',
  FIRMWARE_UPDATE_ERROR = 'FIRMWARE_UPDATE_ERROR',
  AC_PORT_OVERLOAD_PROTECT = 'AC_PORT_OVERLOAD_PROTECT',
  AC_PORT_SHORT_CIRCUIT_PROTECT = 'AC_PORT_SHORT_CIRCUIT_PROTECT',
  HIGH_AC_PORT_CURRENT = 'HIGH_AC_PORT_CURRENT',
  USB_PORT_OVERLOAD_PROTECT = 'USB_PORT_OVERLOAD_PROTECT',
  V_12_PORT_OVERLOAD_PROTECT = 'V_12_PORT_OVERLOAD_PROTECT',
  V_12_PORT_SHORT_CIRCUIT_PROTECT = 'V_12_PORT_SHORT_CIRCUIT_PROTECT',
  TO_EMPTY_30_MIN = 'TO_EMPTY_30_MIN',
  TO_EMPTY_1_HOUR = 'TO_EMPTY_1_HOUR',
  TO_EMPTY_2_HOUR = 'TO_EMPTY_2_HOUR',
  BATTERY_REMAINING_5_PERCENT = 'BATTERY_REMAINING_5_PERCENT',
  BATTERY_REMAINING_10_PERCENT = 'BATTERY_REMAINING_10_PERCENT',
  BATTERY_REMAINING_20_PERCENT = 'BATTERY_REMAINING_20_PERCENT',
  BATTERY_CHARGE_COMPLETE = 'BATTERY_CHARGE_COMPLETE',
  BATTERY_OVER_TEMP_PROTECT = 'BATTERY_OVER_TEMP_PROTECT',
  BATTERY_HIGH_TEMP = 'BATTERY_HIGH_TEMP',
  BATTERY_UNDER_TEMP_PROTECT = 'BATTERY_UNDER_TEMP_PROTECT',
  BATTERY_LOW_TEMP = 'BATTERY_LOW_TEMP',
  INVERTER_OVER_TEMP_PROTECT = 'INVERTER_OVER_TEMP_PROTECT',
  INVERTER_TEMP_HIGH = 'INVERTER_TEMP_HIGH',
  HVDC_INPUT_OVER_VOLTAGE_PROTECT = 'HVDC_INPUT_OVER_VOLTAGE_PROTECT',
  HVDC_INPUT_HIGH_VOLTAGE = 'HVDC_INPUT_HIGH_VOLTAGE',
  HVDC_INPUT_UNDER_VOLTAGE_PROTECT = 'HVDC_INPUT_UNDER_VOLTAGE_PROTECT',
  HVDC_INPUT_OVERLOAD_PROTECT = 'HVDC_INPUT_OVERLOAD_PROTECT',
  HVDC_INPUT_OVER_TEMP_PROTECT = 'HVDC_INPUT_OVER_TEMP_PROTECT',
  HVDC_INPUT_HARD_FAULT_PROTECT = 'HVDC_INPUT_HARD_FAULT_PROTECT',
  LV_DC_INPUT_OVER_VOLTAGE_PROTECT = 'LV_DC_INPUT_OVER_VOLTAGE_PROTECT',
  LV_DC_INPUT_UNDER_VOLTAGE_PROTECT = 'LV_DC_INPUT_UNDER_VOLTAGE_PROTECT',
  INVERTER_OVER_VOLTAGE_PROTECT = 'INVERTER_OVER_VOLTAGE_PROTECT',
  INVERTER_SHORT_CIRCUIT_PROTECT = 'INVERTER_SHORT_CIRCUIT_PROTECT',
  INVERTER_HARD_FAULT_PROTECT = 'INVERTER_HARD_FAULT_PROTECT',
  INVERTER_UNDER_VOLTAGE_PROTECT = 'INVERTER_UNDER_VOLTAGE_PROTECT',
  INVERTER_AC_SYNC_FAILURE = 'INVERTER_AC_SYNC_FAILURE',
  BATTERY_REACHED_MINIMUM_CHARGE = 'BATTERY_REACHED_MINIMUM_CHARGE',
  LOW_BATTERY_VOLTAGE = 'LOW_BATTERY_VOLTAGE',
  LOW_BATTERY_HEALTH = 'LOW_BATTERY_HEALTH',
  BATTERY_HEALTH_WARRANTY_ENDED = 'BATTERY_HEALTH_WARRANTY_ENDED',
  BATTERY_HEALTH_TERMINAL = 'BATTERY_HEALTH_TERMINAL',
  INPUT_POWER_CONNECTION = 'INPUT_POWER_CONNECTION',
  INPUT_POWER_LOST = 'INPUT_POWER_LOST',
  INPUT_LIMIT_EXCEEDED = 'INPUT_LIMIT_EXCEEDED',
}

export enum CloudNotificationType {
  deviceDisconnect = 'iotDisconnect',
  deviceConnect = 'iotReconnect',
}

export enum LegacyStoredNotificationType {
  firmwareUpdate = 'firmwareUpdate',
  fwUpdateSuccess = 'fwUpdateSuccess',
  acOverload = 'acOverload',
  usbOverload = 'usbOverload',
  v12Overload = 'v12Overload',
  lowTTE = 'lowTTE',
  battFull = 'battFull',
  overTemp = 'overTemp',
  underTemp = 'underTemp',
  acLowBattOff = 'acLowBattOff',
  acLowBattWarn = 'acLowBattWarn',
  highPowerOut = 'highPowerOut',
  discharging = 'discharging',
  lowBatteryWarn = 'lowBatteryWarn',
  lowBatteryOff = 'lowBatteryOff',
  lowBatteryHealth = 'lowBatteryHealth',
  charging = 'charging',
  powerDisconnect = 'powerDisconnect',
  powerReconnect = 'powerReconnect',
  acsryUpdating = 'acsryUpdating',
  acsryUpdateSuccess = 'acsryUpdateSuccess',
  acsryUpdateFailure = 'acsryUpdateFailure',
}

export type StoredNotification = {
  id: string;
  date: Date;
  thingName: string;
  type: StoredNotificationType | LegacyStoredNotificationType | CloudNotificationType | string;
  title: string;
  message: string;
  timestamp: number;
  severity: SeverityType;
  viewed?: boolean;
};

export type NotificationsResponse = {
  [key: string]: {
    type: string;
    content: string;
    title: string;
    createdAt: string;
  }[];
};
