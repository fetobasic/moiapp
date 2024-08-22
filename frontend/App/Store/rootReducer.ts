import { combineReducers } from 'redux';
import { reducer as network } from 'react-native-offline';

import { applicationReducers } from './Application';
import { authReducers } from './Auth';
import { awsReducers } from './AWS';
import { cacheReducers } from './Cache';
import { chargingProfileReducers } from './ChargingProfile';
import devicesReducers from './Devices/reducers'; // For some reason, this import from './Devices' return warning for Jest
import { firmwareUpdateReducers } from './FirmwareUpdate';
import { modalReducers } from './Modal';
import { notificationReducers } from './Notification';
import { sturtupReducers } from './Startup';
import { usageReportReducers } from './UsageReport';
import { wifiReducers } from './WifiList';
import { yetiReducers } from './Yeti';

export default combineReducers({
  application: applicationReducers,
  auth: authReducers,
  aws: awsReducers,
  cache: cacheReducers,
  chargingProfile: chargingProfileReducers,
  devicesInfo: devicesReducers,
  firmwareUpdate: firmwareUpdateReducers,
  modal: modalReducers,
  notification: notificationReducers,
  startup: sturtupReducers,
  usageReport: usageReportReducers,
  yetiWifiList: wifiReducers,
  yetiInfo: yetiReducers,
  network,
});
