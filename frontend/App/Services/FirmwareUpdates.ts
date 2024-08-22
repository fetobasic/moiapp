import semver from 'semver';
import { differenceInMilliseconds } from 'date-fns';

import Config from 'App/Config/AppConfig';
import { FirmwareVersion } from 'App/Types/FirmwareUpdate';
import { DeviceState } from 'App/Types/Devices';
import { FridgeState } from 'App/Types/Fridge';

export const removeVersionLeadingZeros = (version = '0.0.0') => version.replace(/(\d)\.0+(\d)/g, '$1.$2');

export const isLatestVersion = (currentVersion: string, updatesInfo?: FirmwareVersion) => {
  try {
    return semver.gte(removeVersionLeadingZeros(currentVersion), removeVersionLeadingZeros(updatesInfo?.version));
  } catch {
    return false;
  }
};

export const isCheckUpdateTimedOut = (thing: DeviceState, info?: FirmwareVersion) => {
  const { lastNotification } = thing as Exclude<DeviceState, FridgeState>;
  if (!lastNotification) {
    return true;
  }

  if (!isLatestVersion(lastNotification.version || '0.0.0', info)) {
    return true;
  }

  return differenceInMilliseconds(new Date(), new Date(lastNotification.time)) >= Config.checkUpdatesTimeout;
};

export const isSupportDirectConnection = (version: string = '0.0.0') => {
  try {
    return semver.gt(
      removeVersionLeadingZeros(version),
      removeVersionLeadingZeros(Config.minFirmwareVersionForDirectConnect),
    );
  } catch {
    return false;
  }
};

export const getUpdateStatus = (code: number) => {
  const statuses: { [key: number]: string } = {
    53: 'OTA failed',
  };

  return statuses[code] || null;
};

export const getUpdateErrorMsg = (code: number) => {
  if (!code) {
    return null;
  }

  let message = 'Error';
  if ([2, 3, 4, 5, 6, 100].includes(code)) {
    message = 'Failed to download firmware';
  } else if ([8].includes(code)) {
    message = 'Download was canceled by the device';
  } else if ([101].includes(code)) {
    message = 'Device runtime error';
  } else if ([102].includes(code)) {
    message = 'Missing network configuration';
  } else if ([103, 104].includes(code)) {
    message = 'Device internal communication error';
  } else if ([152].includes(code)) {
    message = 'Failed to connect to network';
  } else if ([7, 154, 155].includes(code)) {
    message = 'Network speed is too slow';
  } else if ([105, 151, 153].includes(code)) {
    message = 'Invalid firmware file';
  } else if ([156, 157].includes(code)) {
    message = 'Wireless module error';
  } else if (code >= 241 && code <= 254) {
    message = 'Installation failure';
  }

  return `${message} (code: ${code})`;
};

export const getNodeName = (key: string) => {
  const nodeKey = key.split('-').slice(2).join('-');
  const model = key.split('-')[1];
  const modelNum = model ? parseInt(model, 10) : 0;

  const nodeRxs = [
    {
      name: 'PCU',
      rx: /A\d+-1/,
    },
    {
      name: 'WMU',
      rx: /A\d+-2/,
    },
    {
      name: 'BMS',
      rx: /B\d+-1/,
    },
    {
      name: modelNum < 37500 ? 'InvLv' : 'MPPT',
      rx: /C\d+-1/,
    },
    {
      name: 'InvLv',
      rx: /D\d+-1/,
    },
    {
      name: 'InvHv',
      rx: /D\d+-2/,
    },
  ];

  return nodeRxs.find((nodeRx) => nodeRx.rx.test(nodeKey))?.name || 'Node';
};
