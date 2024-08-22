import React from 'react';
import { isEmpty, isUndefined } from 'lodash';
import { ApiResponse } from 'apisauce';

import { Colors, Images } from 'App/Themes';
import DirectApi from './DirectApi';
import { enableForceWifiUsage } from './AndroidWifi';
import Models from 'App/Config/Models';
import { AwsState, YetiModel, YetiState } from 'App/Types/Yeti';

import WifiLevel0 from 'App/Images/Icons/wifi_0.svg';
import WifiLevel1 from 'App/Images/Icons/wifi_1.svg';
import WifiLevel2 from 'App/Images/Icons/wifi_2.svg';
import WifiLevel3 from 'App/Images/Icons/wifi_3.svg';
import WifiLevel4 from 'App/Images/Icons/wifi_4.svg';

import { store } from 'App/Store';
import { Bluetooth } from 'App/Containers/Home/HomeScreen';
import { DeviceTypes } from 'App/Types/PairingType';
import Config from 'App/Config/AppConfig';
import Logger from './Logger';
import { devicesActions, devicesSelectors } from 'App/Store/Devices';
import { isPairingRoutes } from 'App/Navigation/AppNavigation';
import { wait } from 'App/Services/Wait';
import { applicationActions } from 'App/Store/Application';
import { registerThings as registerThingsAws, unregisterThings as unregisterThingsAws } from 'App/Services/Aws';
import { clearTimerId as clearDisconnectedTimer } from 'App/Services/Heartbeating';
import { DeviceState, DeviceType } from 'App/Types/Devices';
import { ThingInfo } from 'App/Types/AWS';
import { isFridge } from 'App/Hooks/useMapDrawerData';
import { getSettings } from './Bluetooth/Fridge';
import { parseSKUFromHostId, v120SKUModels, v230SKUModels } from './ThingHelper';
import { fileLogger } from 'App/Services/FileLogger';

export let actualYetiStateTimerIds: {
  [thingName: string]: {
    [state: string]: ReturnType<typeof setInterval> | undefined;
  };
} = {};

const removeAllThingTimers = (thingName: string) => {
  if (actualYetiStateTimerIds[thingName]) {
    Logger.dev(`Remove timer for Device. ThingName: ${thingName}`);

    const timerIds = Object.values(actualYetiStateTimerIds[thingName]);
    timerIds.forEach((timerId) => {
      clearInterval(timerId);
    });
    delete actualYetiStateTimerIds[thingName];
  } else {
    Logger.dev(`No timers for Device. ThingName: ${thingName}`);
  }
};

const clearThingStateTimer = (thingName: string, state: string) => {
  if (isEmpty(thingName) || isEmpty(state)) {
    return;
  }

  const thingIntervals = actualYetiStateTimerIds[thingName || ''];
  if (!thingIntervals) {
    actualYetiStateTimerIds[thingName || ''] = {};
    return;
  }

  const stateInterval = thingIntervals[state];
  if (!stateInterval) {
    actualYetiStateTimerIds[thingName || ''][state] = undefined;
    return;
  }

  clearInterval(stateInterval);
  actualYetiStateTimerIds[thingName || ''][state] = undefined;
  return;
};

const checkFridgeStatus = (device: DeviceState) => {
  clearThingStateTimer(device?.thingName || '', 'status');
  const isBluetoothConnection = device?.dataTransferType === 'bluetooth';

  actualYetiStateTimerIds[device?.thingName || ''].status = setInterval(async () => {
    const localDevice = devicesSelectors
      .getDevicesInfoData(store.getState())
      .find((d) => d.thingName === device.thingName);

    if (!localDevice || !localDevice.isDirectConnection) {
      Logger.dev(`Remove timer for getting actual Fridge state. ThingName: ${device?.thingName}[status]`);

      removeAllThingTimers(device?.thingName || '');
      return;
    }

    if (isBluetoothConnection && localDevice.isConnected && !Bluetooth.getIsConnected(device.peripheralId || '')) {
      Logger.dev(`Device is disconnected. ThingName: ${device?.thingName}`);
      store.dispatch(
        devicesActions.devicesAddUpdate.request({
          thingName: device?.thingName || '',
          data: {
            isConnected: false,
          },
        }),
      );
    }

    if (!isPairingRoutes()) {
      Logger.dev(`Get actual Fridge [status] state. ThingName: ${device?.thingName}`);

      getSettings(device.peripheralId || '').then((response) => {
        // if we get response from the device, it means it's connected
        if (response.ok) {
          store.dispatch(
            devicesActions.devicesAddUpdate.request({
              thingName: device.thingName || '',
              data: {
                isConnected: true,
              },
            }),
          );
        }
      });
    }
  }, Config.bleCheckStateIntervals.status);
};

const checkStatus = (device: DeviceState) => {
  clearThingStateTimer(device?.thingName || '', 'status');
  const isBluetoothConnection = device?.dataTransferType === 'bluetooth';

  actualYetiStateTimerIds[device?.thingName || ''].status = setInterval(
    async () => {
      const localDevice = devicesSelectors
        .getDevicesInfoData(store.getState())
        .find((d) => d.thingName === device.thingName);

      if (!localDevice || !localDevice.isDirectConnection) {
        Logger.dev(`Remove timer for getting actual Yeti state. ThingName: ${device?.thingName}[status]`);

        removeAllThingTimers(device?.thingName || '');
        return;
      }

      if (isBluetoothConnection && localDevice.isConnected && !Bluetooth.getIsConnected(device.peripheralId || '')) {
        Logger.dev(`Device is disconnected. ThingName: ${device?.thingName}`);
        store.dispatch(
          devicesActions.devicesAddUpdate.request({
            thingName: device?.thingName || '',
            data: {
              isConnected: false,
            },
          }),
        );
        return;
      }

      if (!isPairingRoutes()) {
        if (!isBluetoothConnection) {
          await enableForceWifiUsage();
        }

        Logger.dev(`Get actual Yeti [status] state. ThingName: ${device?.thingName}`);

        store.dispatch(
          devicesActions.checkYetiState({
            peripheralId: device?.peripheralId || '',
            deviceType: device?.deviceType as DeviceType,
            thingName: device?.thingName || '',
          }),
        );
      }
    },
    isBluetoothConnection ? Config.bleCheckStateIntervals.status : Config.directGetStateTimeout,
  );
};

const checkDevice = (device: DeviceState) => {
  clearThingStateTimer(device?.thingName || '', 'device');

  actualYetiStateTimerIds[device?.thingName || ''].device = setInterval(async () => {
    const localDevice = devicesSelectors
      .getDevicesInfoData(store.getState())
      .find((d) => d.thingName === device.thingName);

    if (!localDevice || !localDevice.isDirectConnection) {
      Logger.dev(`Remove timer for getting actual Yeti state. ThingName: ${device?.thingName}[device]`);

      removeAllThingTimers(device?.thingName || '');
      return;
    }

    if (localDevice.isConnected && !Bluetooth.getIsConnected(device.peripheralId || '')) {
      Logger.dev(`Device is disconnected. ThingName: ${device?.thingName}`);
      store.dispatch(
        devicesActions.devicesAddUpdate.request({
          thingName: device?.thingName || '',
          data: {
            isConnected: false,
          },
        }),
      );
      return;
    }

    if (!isPairingRoutes()) {
      Logger.dev(`Get actual Yeti [device] state. ThingName: ${device?.thingName}`);
      const response = await Bluetooth.getDeviceInfo(device.peripheralId || '');

      if (response.ok && response.data) {
        //if device.time.sys is off by more than 60 seconds to current UTC unix time, the app should update device state with { "time": { "sys": 169...... } }
        //The firmware is going to use this patch as a signal to exit "FACTORY MODE"
        const utcTime = Math.round(new Date().getTime() / 1000);
        if (response.data.time && Math.abs(response.data.time.sys - utcTime) > 60) {
          Logger.dev(
            `Device time is off by more than 60 seconds to UTC unix time. ThingName: ${device?.thingName}`,
            response.data.time,
            utcTime,
          );

          response.data.time = { ...response.data.time, sys: utcTime };
          const newTime = { time: { sys: utcTime } };
          await Bluetooth.changeState(
            device.peripheralId || '',
            // @ts-ignore Not need to check for Fridge type
            device.deviceType || DeviceTypes.YETI4000,
            newTime,
            'device',
          );
        }

        store.dispatch(
          devicesActions.devicesAddUpdate.request({
            thingName: device.thingName || '',
            data: {
              device: response.data,
            },
          }),
        );
      }
    }
  }, Config.bleCheckStateIntervals.device);
};

const checkConfig = (device: DeviceState) => {
  clearThingStateTimer(device?.thingName || '', 'config');

  actualYetiStateTimerIds[device?.thingName || ''].config = setInterval(async () => {
    const localDevice = devicesSelectors
      .getDevicesInfoData(store.getState())
      .find((d) => d.thingName === device.thingName);

    if (!localDevice || !localDevice.isDirectConnection) {
      Logger.dev(`Remove timer for getting actual Yeti state. ThingName: ${device?.thingName}[config]`);

      removeAllThingTimers(device?.thingName || '');
      return;
    }

    if (localDevice.isConnected && !Bluetooth.getIsConnected(device.peripheralId || '')) {
      Logger.dev(`Device is disconnected. ThingName: ${device?.thingName}`);
      store.dispatch(
        devicesActions.devicesAddUpdate.request({
          thingName: device?.thingName || '',
          data: {
            isConnected: false,
          },
        }),
      );
      return;
    }

    if (!isPairingRoutes()) {
      Logger.dev(`Get actual Yeti [config] state. ThingName: ${device?.thingName}`);
      const response = await Bluetooth.getConfig(device.peripheralId || '');

      if (response.ok && response.data) {
        store.dispatch(
          devicesActions.devicesAddUpdate.request({
            thingName: device.thingName || '',
            // @ts-expect-error TODO: we need to use complex and recursive Partial generic of Yeti6GState type
            data: {
              config: response.data,
            },
          }),
        );
      }
    }
  }, Config.bleCheckStateIntervals.config);
};

export const checkOTA = (device: DeviceState) => {
  const localDevice = devicesSelectors
    .getDevicesInfoData(store.getState())
    .find((d) => d.thingName === device?.thingName);

  if (localDevice && localDevice.isDirectConnection && Bluetooth.getIsConnected(device.peripheralId || '')) {
    Logger.dev(`Get actual Yeti [OTA] state. ThingName: ${device?.thingName}`);

    (async () => {
      const response = await Bluetooth.getDeviceOta(device?.peripheralId || '');

      if (response.ok && response.data) {
        store.dispatch(
          devicesActions.devicesAddUpdate.request({
            thingName: device.thingName || '',
            // @ts-ignore
            data: {
              // @ts-ignore
              ota: response.data,
            },
          }),
        );
      }
    })();
  }
};

const checkLifetime = (device: DeviceState) => {
  clearThingStateTimer(device?.thingName || '', 'lifetime');

  actualYetiStateTimerIds[device?.thingName || ''].lifetime = setInterval(async () => {
    const localDevice = devicesSelectors
      .getDevicesInfoData(store.getState())
      .find((d) => d.thingName === device.thingName);

    if (!localDevice || !localDevice.isDirectConnection) {
      Logger.dev(`Remove timer for getting actual Yeti state. ThingName: ${device?.thingName}[lifetime]`);

      removeAllThingTimers(device?.thingName || '');
      return;
    }

    if (localDevice.isConnected && !Bluetooth.getIsConnected(device.peripheralId || '')) {
      Logger.dev(`Device is disconnected. ThingName: ${device?.thingName}`);
      store.dispatch(
        devicesActions.devicesAddUpdate.request({
          thingName: device?.thingName || '',
          data: {
            isConnected: false,
          },
        }),
      );
      return;
    }

    if (!isPairingRoutes()) {
      Logger.dev(`Get actual Yeti [lifetime] state. ThingName: ${device?.thingName}`);
      const response = await Bluetooth.getDeviceLifetime(device.peripheralId || '');

      if (response.ok && response.data) {
        store.dispatch(
          devicesActions.devicesAddUpdate.request({
            thingName: device.thingName || '',
            // @ts-expect-error TODO: we need to use complex and recursive Partial generic of Yeti6GState type
            data: {
              lifetime: response.data,
            },
          }),
        );
      }
    }
  }, Config.bleCheckStateIntervals.lifetime);
};

// Check states in Direct connection mode
const checkYetiStates = (device: DeviceState) => {
  if (isLegacyYeti(device?.thingName)) {
    checkStatus(device);
  } else if (isFridge(device?.deviceType)) {
    checkFridgeStatus(device);
  } else {
    checkStatus(device);
    checkDevice(device);
    checkConfig(device);
    checkLifetime(device);
  }
};

const unregisterThings = (_devices: Array<DeviceState>) => {
  const devicesWithDirectConnection = _devices.filter((device) => device.isDirectConnection);

  if (!isEmpty(devicesWithDirectConnection)) {
    unregisterThingsAws(devicesWithDirectConnection as ThingInfo[]);

    devicesWithDirectConnection.forEach((device) => {
      clearDisconnectedTimer(device.thingName || '');
    });
  }
};

const registerThings = (devices: Array<DeviceState>) => {
  const devicesWithCloudConnection = devices.filter((device) => !device.isDirectConnection);

  if (!isEmpty(devicesWithCloudConnection)) {
    registerThingsAws(devicesWithCloudConnection as ThingInfo[]);

    devicesWithCloudConnection.forEach((device) => {
      if (device.peripheralId) {
        store.dispatch(applicationActions.removeConnectedPeripheralId(device.peripheralId));
      }

      removeAllThingTimers(device.thingName || '');
    });
  }
};

const getActualYetiState = (_devices: Array<DeviceState>) => {
  const devicesWithDirectConnection = _devices.filter((device) => device.isDirectConnection);

  devicesWithDirectConnection.forEach(async (device) => {
    // On start get all states
    if (device.dataTransferType === 'bluetooth' && device.deviceType?.startsWith('Y6G')) {
      const allStates = await Bluetooth.getAllStates(device.peripheralId || '');

      if (allStates) {
        store.dispatch(devicesActions.devicesAddUpdate.request({ thingName: device.thingName || '', data: allStates }));
      }
    }

    checkYetiStates(device);

    await wait(Config.defaultDelay);
  });
};

// Change Device check state on change connection type
const registerDevices = () => {
  const _devices = devicesSelectors.getDevicesInfoData(store.getState());

  // Unregister Things From AWS with Direct Connection
  unregisterThings(_devices);
  // Register Things with Cloud Connectio
  registerThings(_devices);

  // Get actual Yeti's state in Direct connection mode
  getActualYetiState(_devices);
};

/**
 * Update Yeti's state in Direct connection mode
 * The last step before call to Yeti's API
 * @param {string} thingName
 * @param {object} stateObject
 * @param {function(string, object)} updateDeviceState
 * @param {function(string, boolean)} changeSwitchState
 * @param {function} reset Callback to clear desired state and stop scheduling
 */
const update = async (
  thingName: string,
  stateObject: AwsState | undefined,
  updateDeviceState: (thingName: string, data: DeviceState) => void,
  changeSwitchState: (thingName: string, state: boolean) => void,
  reset: () => void,
  method: string,
) => {
  const device: DeviceState =
    store.getState().devicesInfo.data.find((d: DeviceState) => d.thingName === thingName) || {};
  const isBluetoothConnection = device?.dataTransferType === 'bluetooth';
  const connectedPeripheralId = device?.peripheralId || '';

  const desiredState = stateObject?.state?.desired;

  fileLogger.addLog(
    'YetiService',
    `Update Device. ThingName: ${thingName}, device:${JSON.stringify(device)}, stateObject: ${JSON.stringify(
      stateObject,
    )}, method: ${method}`,
  );

  if (desiredState) {
    const api = DirectApi.create();

    if (!isBluetoothConnection) {
      await enableForceWifiUsage();
    }

    const call = isBluetoothConnection
      ? () => Bluetooth.changeState(connectedPeripheralId, device.deviceType as DeviceType, desiredState, method)
      : () => api.changeState(desiredState as YetiState);

    const response = (await call()) as ApiResponse<DeviceState>;
    if (response.ok && response.data) {
      const { data } = response;

      if (updateDeviceState) {
        updateDeviceState(thingName, {
          ...data,
          isConnected: true,
        });
      }

      if (changeSwitchState) {
        changeSwitchState(thingName, false);
      }
    } else if (changeSwitchState) {
      changeSwitchState(thingName, true);
    }
  }

  reset();
};

const getYetiImage = (model?: YetiModel | string) => {
  switch (model) {
    case YetiModel.YETI_300_120V:
    case YetiModel.YETI_300_230V:
      return Images.yetiDevice.yeti300_front;

    case YetiModel.YETI_500_120V:
    case YetiModel.YETI_500_230V:
      return Images.yetiDevice.yeti500_front;

    case YetiModel.YETI_700_120V:
    case YetiModel.YETI_700_230V:
      return Images.yetiDevice.yeti700_front;

    case YetiModel.YETI_1400:
      return Images.yetiDevice.yeti1400_front;

    case YetiModel.YETI_3000:
      return Images.yetiDevice.yeti3000_front;

    case YetiModel.YETI_1500X_120V:
    case YetiModel.YETI_1500X_230V:
    default:
      return Images.yetiDevice.yeti1500X_front;

    case YetiModel.YETI_3000X_120V:
    case YetiModel.YETI_3000X_230V:
      return Images.yetiDevice.yeti3000X_front;

    case YetiModel.YETI_PRO_4000:
    case YetiModel.YETI_PRO_4000_120V:
    case YetiModel.YETI_PRO_4000_230V:
      return Images.yetiDevice.yeti4000;

    case YetiModel.YETI_2000_120V:
    case YetiModel.YETI_2000_230V:
      return Images.yetiDevice.yeti2000;

    case YetiModel.YETI_1000_120V:
    case YetiModel.YETI_1000_230V:
      return Images.yetiDevice.yeti1000;

    case YetiModel.YETI_1500_120V:
    case YetiModel.YETI_1500_230V:
      return Images.yetiDevice.yeti1500;

    case YetiModel.YETI_6000X_120V:
    case YetiModel.YETI_6000X_230V:
      return Images.yetiDevice.yeti6000X_front;

    case 'Alta 50':
      return Images.fridgeDevice.alta50_front;

    case 'Alta 80':
      return Images.fridgeDevice.alta80_front;
  }
};

const getWifiLevelIcon = (level?: number, color?: string, isDisabled?: boolean) => {
  if (isDisabled) {
    return <WifiLevel4 color={color || Colors.white} />;
  }

  if (isUndefined(level) || level <= -90) {
    return <WifiLevel0 color={color || Colors.white} />;
  }
  if (level >= -89 && level <= -84) {
    return <WifiLevel1 color={color || Colors.white} />;
  }
  if (level >= -83 && level <= -75) {
    return <WifiLevel2 color={color || Colors.white} />;
  }
  if (level >= -74 && level <= -56) {
    return <WifiLevel3 color={color || Colors.white} />;
  }
  if (level >= -55) {
    return <WifiLevel4 color={color || Colors.white} />;
  }

  return <WifiLevel0 color={color || Colors.white} />;
};

// For Yeti 6G
const getPortKey = (type: 'v12PortStatus' | 'usbPortStatus' | 'acPortStatus') => {
  switch (type) {
    case 'v12PortStatus':
      return 'v12Out';

    case 'usbPortStatus':
      return 'usbOut';

    case 'acPortStatus':
      return 'acOut';
  }
};

/** Model example: Yeti 1500X (120V) */
const isModelX = (model?: YetiModel) => / \d+X\b/i.test(model || '');

const isLegacyYeti = (name: string = '') => name.toLowerCase().startsWith('yeti');

const isYeti6G = (name: string = '') => name.toLowerCase().startsWith('gzy');

const getVoltage = (model?: YetiModel, hostId?: string): 'V230' | 'V120' => {
  let voltage: 'V230' | 'V120';
  const SKU: number = Number(parseSKUFromHostId(hostId));

  if (v120SKUModels.includes(SKU)) {
    voltage = 'V120';
  } else if (v230SKUModels.includes(SKU)) {
    voltage = 'V230';
  } else {
    voltage = isModelX(model) && /230V/i.test(model || '') ? 'V230' : 'V120';
  }

  return voltage;
};

const getBluetoothModelDescription = (name: string): string =>
  //*** Order of models is important with the find() function below. The generic models must be last. ***
  [
    Models.YETI,
    Models.Y6G_300,
    Models.Y6G_500,
    Models.Y6G_700,
    Models.Y6G_1000,
    Models.Y6G_1500,
    Models.Y6G_2000,
    Models.Y6G_4000,
    Models.ALTA_50_FRIDGE,
    Models.ALTA_80_FRIDGE,
    Models.ALTA_45_FRIDGE,
    Models.GENERIC_FRIDGE,
  ].find((model) => name.toLowerCase().startsWith(model.name))?.description || '';

export {
  update,
  getYetiImage,
  getVoltage,
  isModelX,
  isLegacyYeti,
  isYeti6G,
  getWifiLevelIcon,
  getBluetoothModelDescription,
  getPortKey,
  checkYetiStates,
  removeAllThingTimers as removeActualYetiStateTimer,
  registerDevices,
};
