import { Colors } from 'App/Themes';
import { SeverityType } from 'App/Types/Notification';

export const SeverityColors = {
  [SeverityType.EMERGENCY]: Colors.severity.red,
  [SeverityType.ERROR]: Colors.severity.red,
  [SeverityType.WARNING]: Colors.severity.yellow,
  [SeverityType.NOTICE]: Colors.severity.green,
  [SeverityType.INFO]: Colors.severity.blue,
  [SeverityType.DEBUG]: Colors.severity.gray,
};

export const SeverityTopLineColors = {
  [SeverityType.EMERGENCY]: Colors.notification.lightOrange,
  [SeverityType.ERROR]: Colors.notification.lightOrange,
  [SeverityType.WARNING]: Colors.notification.lightYellow,
  [SeverityType.NOTICE]: Colors.notification.lightYellow,
  [SeverityType.INFO]: Colors.notification.lightBlue,
  [SeverityType.DEBUG]: Colors.white,
};
