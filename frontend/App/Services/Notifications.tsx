import { SeverityColors, SeverityTopLineColors } from 'App/Config/Severity';

import { Colors } from 'App/Themes';
import { SeverityType } from 'App/Types/Notification';

import ErrorIcon from 'App/Images/Icons/cancel.svg';
import WarningIcon from 'App/Images/Icons/warningNotification.svg';
import InfoIcon from 'App/Images/Icons/info.svg';
import NoticeIcon from 'App/Images/Icons/logo.svg';
import { LegacyYetiNotifications, NotificationType, Y4000Notifications } from 'App/Config/Notifications';

export const isNotificationEnabled = (
  enabledState: number | number[],
  notificationValue: number,
  isYeti6G: boolean,
): boolean => {
  if (isYeti6G) {
    const arr = [...(enabledState as number[])];
    const ind = ~~(notificationValue / 32);
    const val = notificationValue - 32 * ind;
    const bitVal = 1 << val;
    const res = arr[ind] & bitVal;
    return res === bitVal;
  }
  return ((enabledState as number) & (1 << notificationValue)) === 1 << notificationValue;
};

export const toggleNotificationValue = (
  enabledState: number | number[],
  notificationValue: number,
  isYeti6G: boolean,
): number | number[] => {
  if (isYeti6G) {
    const arr = [...(enabledState as number[])];
    const ind = ~~(notificationValue / 32);
    const val = notificationValue - 32 * ind;
    const bitVal = 1 << val;
    const res = arr[ind] ^ bitVal;
    arr.splice(ind, 1, res);
    return arr as number[];
  }
  return (enabledState as number) ^ (1 << notificationValue);
};

export const getSeverityColor = (severity: SeverityType) => SeverityColors[severity] || Colors.severity.gray;

export const getSeverityTopLineColor = (severity: SeverityType) =>
  SeverityTopLineColors[severity] || Colors.severity.gray;

export const getSeverityTitle = (severity: SeverityType) => {
  switch (severity) {
    case SeverityType.ERROR:
    case SeverityType.EMERGENCY:
      return 'Critical';

    case SeverityType.NOTICE:
      return 'Insight';

    case SeverityType.WARNING:
      return 'Warning';

    default:
    case SeverityType.INFO:
      return 'Information';
  }
};

export const getSeverityIcon = (severity: SeverityType) => {
  switch (severity) {
    case SeverityType.ERROR:
    case SeverityType.EMERGENCY:
      return <ErrorIcon />;

    case SeverityType.NOTICE:
      return <NoticeIcon />;

    case SeverityType.WARNING:
      return <WarningIcon />;

    default:
    case SeverityType.INFO:
      return <InfoIcon />;
  }
};

export const convertSeverityToCommonFormat = (
  notificationType: string,
  severity: string = SeverityType.WARNING,
): string => {
  const severityNotificationType = [...Y4000Notifications, ...LegacyYetiNotifications].find(
    ({ typeId }) => typeId === notificationType,
  )?.type;

  let formattedSeverityMap = new Map([
    [NotificationType.ALERT, SeverityType.ERROR],
    [NotificationType.WARNING, SeverityType.WARNING],
    [NotificationType.INFORMATION, SeverityType.NOTICE],
    [NotificationType.INFORMATION, SeverityType.INFO],
  ]);

  return severityNotificationType ? formattedSeverityMap.get(severityNotificationType) || severity : severity;
};
