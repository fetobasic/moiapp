import { store } from 'App/Store';
import { yetiActions } from 'App/Store/Yeti';
import {
  getDeviceInfo,
  getDeviceStatus,
  getDeviceConfig,
  getDeviceOta,
  getDeviceLifetime,
  changeState,
} from './Common';
import { WiFiList, Yeti6GConnectionCredentials, Yeti6GState, YetiModel, YetiSysInfo } from 'App/Types/Yeti';
import { Bluetooth } from 'App/Containers/Home/HomeScreen';
import { wifiActions } from 'App/Store/WifiList';
import { ScannedWiFi } from 'App/Types/Devices';
import { parseModelFromHostId } from '../ThingHelper';
import { DeviceType } from 'App/Types/Devices';

const getAllStates = async (peripheralId: string): Promise<Yeti6GState | undefined> => {
  const isSuccessConnected = await Bluetooth.connectIfNeeded(peripheralId);

  if (!isSuccessConnected) {
    return;
  }

  const deviceResponse = await getDeviceInfo(peripheralId);

  if (!deviceResponse.ok) {
    return;
  }

  const statusResponse = await getDeviceStatus(peripheralId);

  if (!statusResponse.ok) {
    return;
  }

  const configResponse = await getDeviceConfig(peripheralId);

  if (!configResponse.ok) {
    return;
  }

  const otaResponse = await getDeviceOta(peripheralId);

  if (!otaResponse.ok) {
    return;
  }

  const lifetimeResponse = await getDeviceLifetime(peripheralId);

  if (!lifetimeResponse.ok) {
    return;
  }

  return {
    device: deviceResponse.data,
    status: statusResponse.data,
    config: configResponse.data,
    ota: otaResponse.data,
    lifetime: lifetimeResponse.data,
  } as unknown as Yeti6GState;
};

const joinDirect = async (peripheralId: string, deviceType?: DeviceType) => {
  //ONLY set ble = 1 (Hidden state) when device type is Yeti 4000
  if (deviceType === 'Y6G_4000') {
    await changeState(peripheralId, 'device', {
      iot: {
        ble: {
          m: 1,
        },
      },
    });
  }

  const directData = await getAllStates(peripheralId);

  if (!directData) {
    return Bluetooth.responseError;
  }

  store.dispatch(yetiActions.directConnect.success({ directData }));
};

const getDeviceState = async (peripheralId: string) => {
  const isSuccessConnected = await Bluetooth.connectIfNeeded(peripheralId);

  if (!isSuccessConnected) {
    return Bluetooth.responseError;
  }

  const status = await getDeviceStatus(peripheralId);

  if (!status.ok) {
    return Bluetooth.responseError;
  }

  return { data: { status: status.data }, ok: true };
};

const getCloudConnectedNetwork = (peripheralId: string) =>
  new Promise(async (resolve) => {
    let deviceInfo = await getDeviceInfo(peripheralId);

    if (!deviceInfo.ok) {
      return resolve(Bluetooth.responseError);
    }

    const isCloudConnected = deviceInfo.data?.iot?.sta?.cloud?.s === 1;

    if (!isCloudConnected) {
      return resolve(Bluetooth.responseError);
    }

    const network = deviceInfo.data?.iot?.sta?.wlan?.ssid;

    if (!network) {
      return resolve(Bluetooth.responseError);
    }

    return resolve({ ok: true, data: { network } });
  });

const storeWifiList = (wifiList: ScannedWiFi[] = []) => {
  const list: WiFiList[] = wifiList.map((wifi) => ({
    name: wifi.ssid,
    db: wifi.rssi,
    saved: wifi.known,
  }));

  store.dispatch(wifiActions.wifi.success({ data: list }));
};

const getWifiList = (peripheralId: string, skipCheckToConnectToCloud: boolean) =>
  new Promise(async (resolve) => {
    const isSuccessConnected = await Bluetooth.connectIfNeeded(peripheralId);

    if (!isSuccessConnected) {
      return resolve(Bluetooth.responseError);
    }

    let deviceInfo = await getDeviceInfo(peripheralId);

    if (!deviceInfo.ok) {
      return resolve(Bluetooth.responseError);
    }

    if (
      !skipCheckToConnectToCloud &&
      (deviceInfo?.data?.iot?.sta?.wlan?.s === 1 ||
        (deviceInfo?.data?.iot?.sta?.m === 3 && deviceInfo?.data?.iot?.sta?.wlan?.ssid !== null))
    ) {
      // Skip scanning for new Wi-Fi Networks if already connected to a Wi-Fi Network or is in the process of connecting to a Wi-Fi Network
      return resolve({ skipConnectToWifi: true, data: deviceInfo?.data });
    }

    // Scan for new Wi-Fi Networks only if the device is not already connected to a Wi-Fi Network or user explicitly wants to scan for new Wi-Fi Networks
    if (
      deviceInfo?.data?.iot?.sta?.m !== 1 &&
      (skipCheckToConnectToCloud || deviceInfo?.data?.iot?.sta?.wlan?.s !== 1) &&
      !(deviceInfo?.data?.iot?.sta?.m === 3 && deviceInfo?.data?.iot?.sta?.wlan?.s !== 1 && skipCheckToConnectToCloud)
    ) {
      await changeState(peripheralId, 'device', {
        iot: {
          sta: {
            m: 1,
          },
        },
      });
    } else {
      storeWifiList(deviceInfo?.data?.iot?.sta?.wlan?.scanned);
      return resolve({ data: deviceInfo?.data?.iot?.sta?.wlan?.scanned });
    }

    deviceInfo = await getDeviceInfo(peripheralId);

    storeWifiList(deviceInfo?.data?.iot?.sta?.wlan?.scanned);

    return resolve({ data: deviceInfo?.data });
  });

const joinWifi = (
  peripheralId: string,
  data: Yeti6GConnectionCredentials,
): Promise<{ ok: boolean; data?: YetiSysInfo }> =>
  new Promise(async (resolve) => {
    await changeState(peripheralId, 'status', { appOn: 1 });
    const deviceInfo = await changeState(peripheralId, 'device', data);
    const deviceData = deviceInfo?.data?.device;

    const yetiInfo: YetiSysInfo = {
      name: deviceData?.identity?.thingName,
      hostId: deviceData?.identity?.hostId,
      model: parseModelFromHostId(deviceData?.identity?.hostId) || YetiModel.YETI_PRO_4000,
      firmwareVersion: deviceData?.device?.fw,
      macAddress: deviceData?.identity?.mac,
      platform: deviceData?.identity?.sn,
    };

    store.dispatch(yetiActions.bluetoothReceiveYetiInfo({ data: yetiInfo }));

    resolve({ ok: true, data: yetiInfo });
  });

const checkForError = (
  peripheralId: string,
): Promise<{
  ok: boolean;
  data?: { isError: boolean; cloudErrorCode: number; wlanErrorCode: number };
  isBleError?: boolean;
}> =>
  new Promise(async (resolve) => {
    const deviceInfo = await getDeviceInfo(peripheralId);

    if (deviceInfo.ok) {
      const cloudErrorCode = deviceInfo.data?.iot.sta.cloud.err || 0;
      const wlanErrorCode = deviceInfo.data?.iot.sta.wlan.err || 0;
      const isError = cloudErrorCode !== 0 || wlanErrorCode !== 0;

      return resolve({ ok: true, data: { isError, cloudErrorCode, wlanErrorCode } });
    }

    return resolve({ ok: false, isBleError: true });
  });

export { getAllStates, joinDirect, getDeviceState, getWifiList, getCloudConnectedNetwork, joinWifi, checkForError };
