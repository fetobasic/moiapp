import { useCallback, useEffect, useRef, useState } from 'react';
import { merge } from 'lodash';

import { useAppDispatch, useAppSelector, useMount } from 'App/Hooks/commonHooks';
import { Bluetooth } from 'App/Containers/Home/HomeScreen';
import { YetiState, YetiSysInfo, Yeti6GState, YetiModel, YetiDirectInfo } from 'App/Types/Yeti';
import { yetiActions } from 'App/Store/Yeti';
import { doesThingNameExist, doesUsedAnywhereConnectExist, setDirectConnectByName } from 'App/Services/Devices';
import { devicesActions } from 'App/Store/Devices';
import { getVoltage } from 'App/Services/Yeti';
import { applicationActions } from 'App/Store/Application';
import { FRIDGE_BIND_MODE } from 'App/Types/Fridge';
import { changeBindMode, sendBinding, getSettings } from 'App/Services/Bluetooth/Fridge';
import DirectApi from 'App/Services/DirectApi';
import { store } from 'App/Store';
import AppConfig from 'App/Config/AppConfig';
import { parseModelFromHostId } from 'App/Services/ThingHelper';
import { PairingStackParamList } from 'App/Types/NavigationStackParamList';
import { DeviceState } from 'App/Types/Devices';
import { isFridge } from 'App/Hooks/useMapDrawerData';
import { fileLogger } from 'App/Services/FileLogger';

type Props = PairingStackParamList['ConnectYeti'];

const useDirectConnect = (props: Props) => {
  const dispatch = useAppDispatch();
  const { connectionType, dataTransferType, device } = props;
  const [isConnected, setIsConnected] = useState(false);
  const [modelInfo, setModelInfo] = useState<YetiSysInfo | Yeti6GState | undefined>();
  const isConnectedToDevice = useRef(false);
  const peripheralId = device?.id || '';
  const [deviceThingName, setThingName] = useState('');
  const loadInfoTimeoutId = useRef<NodeJS.Timeout | null>(null);
  const isDeviceFridge = isFridge(props.deviceType);

  const { modelSysInfo, devices } = useAppSelector((state) => ({
    modelSysInfo: state.yetiInfo.directData,
    devices: state.devicesInfo.data,
  }));

  const loadYetiInfo = useCallback((load: () => void, attempt = 0) => {
    const yetiSysInfo = store.getState().yetiInfo.directData;

    fileLogger.addLog(
      'useDirectConnect',
      `loadYetiInfo. attempt: ${attempt}, yetiSysInfo: ${JSON.stringify(yetiSysInfo)}`,
    );

    if (yetiSysInfo || attempt >= AppConfig.loadYetiInfoMaxRetryAttempts) {
      if (loadInfoTimeoutId.current) {
        clearTimeout(loadInfoTimeoutId.current);
        loadInfoTimeoutId.current = null;
      }
      return;
    }

    load();

    loadInfoTimeoutId.current = setTimeout(() => loadYetiInfo(load, attempt + 1), AppConfig.loadYetiInfoTimeout);
  }, []);

  const connectFridge = useCallback(async () => {
    if (!props.device) {
      return;
    }

    fileLogger.addLog('useDirectConnect', `connectFridge. peripheralId: ${peripheralId}`);

    await sendBinding(peripheralId);
    await changeBindMode(peripheralId, FRIDGE_BIND_MODE.DISALLOW);
    await getSettings(peripheralId);
  }, [peripheralId, props.device]);

  useMount(() => {
    const isBluetoothConnect = dataTransferType === 'bluetooth';

    if (connectionType === 'direct') {
      if (isBluetoothConnect) {
        if (isDeviceFridge) {
          connectFridge();
        } else {
          loadYetiInfo(() => Bluetooth.joinDirect(peripheralId, props.deviceType));
        }
      } else {
        dispatch(yetiActions.directConnect.request({ deviceType: props.deviceType }));
      }
    }

    return () => {
      dispatch(yetiActions.clearDirectData());
    };
  });

  const changeAllDevicesStateToDisconnected = useCallback(
    (deviceData: DeviceState, _devices: Array<DeviceState>, thingName: string) => {
      if (deviceData.dataTransferType === 'bluetooth') {
        return;
      }

      let isDevicesExist = false;

      let changedDevices = _devices.map((_device) => {
        if (_device.thingName === thingName) {
          isDevicesExist = true;
          return merge(_device, deviceData);
        }

        return _device;
      });

      if (!isDevicesExist) {
        changedDevices = [...changedDevices, deviceData];
      }

      changedDevices = setDirectConnectByName(changedDevices, thingName) as Array<YetiState>;

      dispatch(devicesActions.devicesUpdateAll.request({ data: changedDevices }));
    },
    [dispatch],
  );

  const addYetiDevice = useCallback(
    (deviceData: YetiState, _devices: Array<DeviceState>) => {
      const { thingName } = deviceData;

      if (!thingName) {
        return;
      }

      const data = {
        ...deviceData,
        connectedAt: new Date().toISOString(),
      };

      if (!doesThingNameExist(_devices, thingName)) {
        data.name = thingName;
      }

      fileLogger.addLog('useDirectConnect', `addYetiDevice. thingName: ${thingName}, data: ${JSON.stringify(data)}`);

      dispatch(devicesActions.devicesAddUpdate.request({ thingName, data }));
      changeAllDevicesStateToDisconnected(data, _devices, thingName);
    },
    [changeAllDevicesStateToDisconnected, dispatch],
  );

  const addYeti6GDevice = useCallback(
    (deviceData: Yeti6GState, _devices: Array<DeviceState>, thingName: string) => {
      if (!thingName) {
        return;
      }

      const data: Yeti6GState = {
        ...deviceData,
        connectedAt: new Date().toISOString(),
      };

      if (!doesThingNameExist(_devices, thingName)) {
        data.name = deviceData?.device?.identity?.thingName || thingName;
      }

      fileLogger.addLog('useDirectConnect', `addYeti6GDevice. thingName: ${thingName}, data: ${JSON.stringify(data)}`);

      dispatch(devicesActions.devicesAddUpdate.request({ thingName, data }));
      changeAllDevicesStateToDisconnected(data, _devices, thingName);
    },
    [changeAllDevicesStateToDisconnected, dispatch],
  );

  const directConnectSuccess = useCallback(
    async (_devices: Array<DeviceState>) => {
      let thingName = '';
      let data: DeviceState = {} as DeviceState;

      if (props.deviceType?.startsWith('Y6G')) {
        const y6GSysInfo = modelSysInfo as Yeti6GState;

        thingName = y6GSysInfo?.device?.identity?.thingName;

        if (!thingName) {
          return;
        }

        data = {
          ...y6GSysInfo,
          thingName,
          model: parseModelFromHostId(y6GSysInfo?.device?.identity?.hostId) || YetiModel.YETI_PRO_4000,
          deviceType: props.deviceType,
          isDirectConnection: true,
          isUsedDirectConnect: true,
          isConnected: true,
          dataTransferType,
          peripheralId: dataTransferType === 'bluetooth' ? props.device?.id : undefined,
        };

        if (!doesUsedAnywhereConnectExist(_devices, thingName)) {
          data.usedAnywhereConnect = false;
        }

        addYeti6GDevice(data, _devices, thingName);

        setModelInfo({
          ...y6GSysInfo,
          model: data.model,
          hostId: y6GSysInfo?.device?.identity?.hostId,
        });
      }

      if (props.deviceType === 'YETI') {
        let yetiSysInfo = modelSysInfo as YetiState & YetiDirectInfo;

        // TODO: this is fast fix to enable WiFI Direct pairing, and should be refactored in redux sagas
        if (dataTransferType === 'wifi') {
          const api = DirectApi.create();

          yetiSysInfo = {
            ...(await api.getYetiInfo()).data,
            state: (await api.checkState('YETI')).data,
          };
        }

        thingName = yetiSysInfo?.state?.thingName as string;

        if (!thingName) {
          return;
        }

        data = {
          ...yetiSysInfo.state,
          model: yetiSysInfo.model,
          notify: yetiSysInfo.notify,
          foreignAcsry: yetiSysInfo.foreignAcsry,
          deviceType: props.deviceType,
          isDirectConnection: true,
          isUsedDirectConnect: true,
          isConnected: true,
          dataTransferType,
          peripheralId: dataTransferType === 'bluetooth' ? props.device?.id : undefined,
          directFirmwareUpdateStartTime: undefined,
          settings: {
            temperature: 'FAHRENHEIT',
            voltage: getVoltage(yetiSysInfo?.model, yetiSysInfo?.hostId),
          },
        };

        if (!doesUsedAnywhereConnectExist(_devices, thingName)) {
          data.usedAnywhereConnect = false;
        }

        addYetiDevice(data, _devices);
        setModelInfo({
          ...yetiSysInfo,
          model: yetiSysInfo.model,
          hostId: yetiSysInfo.hostId,
        });
      }

      dispatch(applicationActions.changeDirectConnectionState(true));
      dispatch(applicationActions.setDataTransferType(dataTransferType));

      setThingName(thingName);
      setIsConnected(true);
    },
    [props.deviceType, props.device?.id, dataTransferType, dispatch, modelSysInfo, addYeti6GDevice, addYetiDevice],
  );

  useEffect(() => {
    if (isDeviceFridge) {
      const thingName = device?.name || peripheralId;
      const isFridgeExist = devices.find((d) => d.thingName === thingName && d.peripheralId === peripheralId);

      if (isFridgeExist) {
        setThingName(thingName);
        setIsConnected(true);
      }
    }
  }, [device?.name, devices, isDeviceFridge, peripheralId]);

  useEffect(() => {
    if (isConnectedToDevice.current) {
      return;
    }

    if (connectionType === 'direct' && modelSysInfo) {
      isConnectedToDevice.current = true;
      directConnectSuccess(devices as Array<DeviceState>);
    }
  }, [connectionType, devices, directConnectSuccess, modelSysInfo]);

  return {
    isConnected,
    modelInfo,
    deviceThingName,
  };
};

export default useDirectConnect;
