import { LegacyStoredNotificationType, StoredNotificationType } from 'App/Types/Notification';

interface INotification {
  title: string;
  enabledByDefault: boolean;
  type: NotificationType;
  value: number | undefined;
  typeId: StoredNotificationType | LegacyStoredNotificationType;
}

interface IGroupedNotifications {
  CriticalNotifications: INotification[];
  WarningNotifications: INotification[];
  InformationNotifications: INotification[];
}

export enum NotificationType {
  ALERT = 'ALERT',
  WARNING = 'WARNING',
  INFORMATION = 'INFORMATION',
}

const Notification = (
  title: string,
  bit: number | undefined,
  type: NotificationType,
  typeId: StoredNotificationType | LegacyStoredNotificationType,
  enabledByDefault = true,
): INotification => ({
  title,
  enabledByDefault,
  type,
  typeId,
  value: bit === undefined ? undefined : bit,
});

export const LegacyYetiNotifications = [
  // alert
  Notification('AC output overload', 0, NotificationType.ALERT, LegacyStoredNotificationType.acOverload),
  Notification('USB output overload', 1, NotificationType.ALERT, LegacyStoredNotificationType.usbOverload),
  Notification('12V output overload', 2, NotificationType.ALERT, LegacyStoredNotificationType.v12Overload),
  Notification('Battery over temp', 5, NotificationType.ALERT, LegacyStoredNotificationType.overTemp),
  Notification('Battery under temp', 6, NotificationType.ALERT, LegacyStoredNotificationType.underTemp),
  Notification('Inverter low battery off', 7, NotificationType.ALERT, LegacyStoredNotificationType.acLowBattOff),
  Notification('Low battery voltage', 13, NotificationType.ALERT, LegacyStoredNotificationType.lowBatteryHealth),
  // warn
  Notification(
    'Firmware update error',
    undefined,
    NotificationType.WARNING,
    LegacyStoredNotificationType.firmwareUpdate,
  ),
  Notification('30 minutes to empty', 8, NotificationType.WARNING, LegacyStoredNotificationType.acLowBattWarn),
  Notification('Inverter low battery warning', 3, NotificationType.WARNING, LegacyStoredNotificationType.lowTTE),
  Notification('20% battery remaining', 12, NotificationType.WARNING, LegacyStoredNotificationType.lowBatteryOff),
  Notification(
    'Battery reached minimum charge',
    11,
    NotificationType.WARNING,
    LegacyStoredNotificationType.lowBatteryWarn,
  ),
  Notification(
    'Accessory update failure',
    17,
    NotificationType.WARNING,
    LegacyStoredNotificationType.acsryUpdateFailure,
  ),
  // info
  Notification('Battery charge complete', 4, NotificationType.INFORMATION, LegacyStoredNotificationType.battFull),
  Notification('High output detected', 9, NotificationType.INFORMATION, LegacyStoredNotificationType.highPowerOut),
  Notification('Discharging', 10, NotificationType.INFORMATION, LegacyStoredNotificationType.discharging),
  Notification('Charging', 14, NotificationType.INFORMATION, LegacyStoredNotificationType.charging),
  Notification('Accessory is updating', 15, NotificationType.INFORMATION, LegacyStoredNotificationType.acsryUpdating),
  Notification(
    'Accessory update complete',
    16,
    NotificationType.INFORMATION,
    LegacyStoredNotificationType.acsryUpdateSuccess,
  ),
];

export const Y4000Notifications = [
  Notification(
    'Firmware update available',
    0,
    NotificationType.INFORMATION,
    StoredNotificationType.FIRMWARE_UPDATE_AVAILABLE,
  ),
  Notification(
    'Firmware update complete',
    1,
    NotificationType.INFORMATION,
    StoredNotificationType.FIRMWARE_UPDATE_COMPLETE,
  ),
  Notification('Firmware update error', 2, NotificationType.WARNING, StoredNotificationType.FIRMWARE_UPDATE_ERROR),
  Notification('AC output overload', 3, NotificationType.ALERT, StoredNotificationType.AC_PORT_OVERLOAD_PROTECT),
  Notification(
    'AC output short circuit',
    4,
    NotificationType.ALERT,
    StoredNotificationType.AC_PORT_SHORT_CIRCUIT_PROTECT,
  ),
  Notification('AC output high current', 5, NotificationType.WARNING, StoredNotificationType.HIGH_AC_PORT_CURRENT),
  Notification('USB output overload', 6, NotificationType.ALERT, StoredNotificationType.USB_PORT_OVERLOAD_PROTECT),
  Notification('12V output overload', 7, NotificationType.ALERT, StoredNotificationType.V_12_PORT_OVERLOAD_PROTECT),
  Notification(
    '12V output short circuit',
    8,
    NotificationType.ALERT,
    StoredNotificationType.V_12_PORT_SHORT_CIRCUIT_PROTECT,
  ),
  // Notification('<UNUSED>', 9, <NotificationType.UNUSED>, <StoredNotificationType.UNUSED>),
  // Notification('<UNUSED>', 10, <NotificationType.UNUSED>, <StoredNotificationType.UNUSED>),
  Notification('30 minutes to empty', 11, NotificationType.WARNING, StoredNotificationType.TO_EMPTY_30_MIN, false),
  Notification('1 hour to empty', 12, NotificationType.WARNING, StoredNotificationType.TO_EMPTY_1_HOUR),
  Notification('2 hours to empty', 13, NotificationType.WARNING, StoredNotificationType.TO_EMPTY_2_HOUR, false),
  Notification(
    '5% battery remaining',
    14,
    NotificationType.WARNING,
    StoredNotificationType.BATTERY_REMAINING_5_PERCENT,
    false,
  ),
  Notification(
    '10% battery remaining',
    15,
    NotificationType.WARNING,
    StoredNotificationType.BATTERY_REMAINING_10_PERCENT,
  ),
  Notification(
    '20% battery remaining',
    16,
    NotificationType.WARNING,
    StoredNotificationType.BATTERY_REMAINING_20_PERCENT,
    false,
  ),
  Notification(
    'Battery charge complete',
    17,
    NotificationType.INFORMATION,
    StoredNotificationType.BATTERY_CHARGE_COMPLETE,
    false,
  ),
  Notification('Battery over temp', 18, NotificationType.ALERT, StoredNotificationType.BATTERY_OVER_TEMP_PROTECT),
  Notification('Battery high temp', 19, NotificationType.WARNING, StoredNotificationType.BATTERY_HIGH_TEMP),
  Notification('Battery under temp', 20, NotificationType.ALERT, StoredNotificationType.BATTERY_UNDER_TEMP_PROTECT),
  Notification('Battery low temp', 21, NotificationType.WARNING, StoredNotificationType.BATTERY_LOW_TEMP),
  Notification('Inverter over temp', 22, NotificationType.ALERT, StoredNotificationType.INVERTER_OVER_TEMP_PROTECT),
  Notification('Inverter high temp', 23, NotificationType.WARNING, StoredNotificationType.INVERTER_TEMP_HIGH),
  Notification(
    'HV DC input overvoltage',
    24,
    NotificationType.ALERT,
    StoredNotificationType.HVDC_INPUT_OVER_VOLTAGE_PROTECT,
  ),
  Notification(
    'HV DC input high voltage',
    25,
    NotificationType.WARNING,
    StoredNotificationType.HVDC_INPUT_HIGH_VOLTAGE,
  ),
  Notification(
    'HV DC input undervoltage',
    26,
    NotificationType.ALERT,
    StoredNotificationType.HVDC_INPUT_UNDER_VOLTAGE_PROTECT,
  ),
  Notification('HV DC input overload', 27, NotificationType.ALERT, StoredNotificationType.HVDC_INPUT_OVERLOAD_PROTECT),
  Notification(
    'HV DC input over temp',
    28,
    NotificationType.ALERT,
    StoredNotificationType.HVDC_INPUT_OVER_TEMP_PROTECT,
  ),
  Notification(
    'HV DC input hard fault',
    29,
    NotificationType.ALERT,
    StoredNotificationType.HVDC_INPUT_HARD_FAULT_PROTECT,
  ),
  Notification(
    'LV DC input overvoltage',
    30,
    NotificationType.ALERT,
    StoredNotificationType.LV_DC_INPUT_OVER_VOLTAGE_PROTECT,
  ),
  Notification(
    'LV DC input undervoltage',
    31,
    NotificationType.ALERT,
    StoredNotificationType.LV_DC_INPUT_UNDER_VOLTAGE_PROTECT,
  ),
  Notification(
    'Inverter overvoltage',
    32,
    NotificationType.ALERT,
    StoredNotificationType.INVERTER_OVER_VOLTAGE_PROTECT,
  ),
  Notification(
    'Inverter short circuit',
    33,
    NotificationType.ALERT,
    StoredNotificationType.INVERTER_SHORT_CIRCUIT_PROTECT,
  ),
  Notification('Inverter hard fault', 34, NotificationType.ALERT, StoredNotificationType.INVERTER_HARD_FAULT_PROTECT),
  Notification(
    'Inverter undervoltage',
    35,
    NotificationType.ALERT,
    StoredNotificationType.INVERTER_UNDER_VOLTAGE_PROTECT,
  ),
  Notification('Inverter AC sync failure', 36, NotificationType.ALERT, StoredNotificationType.INVERTER_AC_SYNC_FAILURE),
  Notification(
    'Battery reached minimum charge',
    37,
    NotificationType.WARNING,
    StoredNotificationType.BATTERY_REACHED_MINIMUM_CHARGE,
  ),
  Notification('Low battery voltage', 38, NotificationType.ALERT, StoredNotificationType.LOW_BATTERY_VOLTAGE),
  Notification('Low battery health', 39, NotificationType.ALERT, StoredNotificationType.LOW_BATTERY_HEALTH),
  Notification(
    'Battery health warranty ended',
    40,
    NotificationType.ALERT,
    StoredNotificationType.BATTERY_HEALTH_WARRANTY_ENDED,
  ),
  Notification('Battery health terminal', 41, NotificationType.ALERT, StoredNotificationType.BATTERY_HEALTH_TERMINAL),
  Notification(
    'Input power detected',
    42,
    NotificationType.INFORMATION,
    StoredNotificationType.INPUT_POWER_CONNECTION,
    false,
  ),
  Notification('Input power lost', 43, NotificationType.INFORMATION, StoredNotificationType.INPUT_POWER_LOST, false),
  Notification('Input limit exceeded', 44, NotificationType.ALERT, StoredNotificationType.INPUT_LIMIT_EXCEEDED),
];

const Y300500700_ALLOWED_BITS: (number | undefined)[] = [
  0, 1, 2, 3, 4, 5, 6, 7, 8, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23, 25, 32, 33, 34, 35, 37, 38, 39, 40,
  41, 42, 43, 44,
];

export const Y300500700Notifications = Y4000Notifications.filter((notification) =>
  Y300500700_ALLOWED_BITS.includes(notification?.value),
);

function groupByType(notifications: INotification[]) {
  const groupedNotifications: IGroupedNotifications = {
    CriticalNotifications: [],
    WarningNotifications: [],
    InformationNotifications: [],
  };

  for (const notification of notifications) {
    if (notification.type === NotificationType.ALERT) {
      groupedNotifications.CriticalNotifications.push(notification);
    }

    if (notification.type === NotificationType.WARNING) {
      groupedNotifications.WarningNotifications.push(notification);
    }

    if (notification.type === NotificationType.INFORMATION) {
      groupedNotifications.InformationNotifications.push(notification);
    }
  }

  return groupedNotifications;
}

export const LegacyYetiNotificationsGrouped = groupByType(LegacyYetiNotifications);
export const Y4000NotificationsGrouped = groupByType(Y4000Notifications);
export const Y300500700NotificationsGrouped = groupByType(Y300500700Notifications);
