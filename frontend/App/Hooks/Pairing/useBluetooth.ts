import { useCallback, useEffect, useMemo, useState } from 'react';
import { useAppState } from '@react-native-community/hooks';

import { usePairingNavigation, useAppSelector, useMount, useAppDispatch } from 'App/Hooks/commonHooks';
import { BluetoothState } from 'App/Types/BluetoothState';
import { BluetoothDevice } from 'App/Types/BluetoothDevices';
import { Bluetooth } from 'App/Containers/Home/HomeScreen';
import { store } from 'App/Store';
import { getDeviceType } from 'App/Transforms/getDeviceType';
import { FRIDGE_SERVICE_UUID, FRIDGE_NOTIFICATION_UUID } from 'App/Config/Bluetooth';
import AppConfig from 'App/Config/AppConfig';
import useTimer from 'App/Hooks/useTimer';
import { yetiActions } from 'App/Store/Yeti';
import { isFridge } from '../useMapDrawerData';
import { fileLogger } from 'App/Services/FileLogger';

const ENABLE_BLUETOOTH = 'Enable Bluetooth';
const NEED_ACCESS = 'Need Access';
const SCAN_FOR_DEVICES = 'Scan for Devices';
const SCAN_AGAIN = 'Scan Again';
const CONTINUE = 'Continue';
const CANCEL = 'Cancel';

type ButtonTitleType =
  | typeof ENABLE_BLUETOOTH
  | typeof NEED_ACCESS
  | typeof SCAN_FOR_DEVICES
  | typeof SCAN_AGAIN
  | typeof CONTINUE
  | typeof CANCEL;

const WAITING = 'Waiting for Bluetooth...';
const READY = 'Waiting to pair with Bluetooth...';
const SCANNING = 'Bluetooth Scanning for Devices...';
const SCANNING_FINISHED = 'Scanned Devices';
const TROUBLE_WITH_BLUETOOTH = 'Trouble with Bluetooth';

type TextTitleType =
  | typeof WAITING
  | typeof READY
  | typeof SCANNING
  | typeof SCANNING_FINISHED
  | typeof TROUBLE_WITH_BLUETOOTH;

const useBluetooth = () => {
  const dispatch = useAppDispatch();
  const navigation = usePairingNavigation('AddNewDevice');
  const currentAppState = useAppState();
  const { devices } = useAppSelector((state) => ({
    devices: state.yetiInfo.discoveredDevices,
  }));

  const isCompleted = useMemo(() => devices.length > 0, [devices]);
  const { seconds, setSeconds } = useTimer();

  const [isScanning, setIsScanning] = useState(false);
  const [buttonTitle, setButtonTitle] = useState<ButtonTitleType>(ENABLE_BLUETOOTH);
  const [titleText, setTitleText] = useState<TextTitleType>(WAITING);
  const [bluetoothState, setBluetoothState] = useState<BluetoothState | undefined>();
  const [selectedDevice, setSelectedDevice] = useState<BluetoothDevice | undefined>();
  const [isButtonDisabled, setIsButtonDisabled] = useState(false);

  const onButtonPress = useCallback(async () => {
    setButtonTitle(SCAN_FOR_DEVICES);

    fileLogger.addLog('Bluetooth', `onButtonPress, buttonTitle: ${buttonTitle}`);

    if (buttonTitle === ENABLE_BLUETOOTH || buttonTitle === NEED_ACCESS) {
      Bluetooth.enable(bluetoothState);
      return;
    }

    if (buttonTitle === CONTINUE && selectedDevice?.id) {
      setIsButtonDisabled(true);

      let serviceUUID, characteristicUUID;
      const deviceType = getDeviceType(selectedDevice.name);
      const isDeviceFridge = isFridge(deviceType);

      if (isDeviceFridge) {
        serviceUUID = FRIDGE_SERVICE_UUID;
        characteristicUUID = FRIDGE_NOTIFICATION_UUID;
      }

      fileLogger.addLog(
        'Bluetooth',
        `onButtonPress, selectedDevice: ${JSON.stringify(
          selectedDevice,
        )}, isDeviceFridge: ${isDeviceFridge}, deviceType: ${deviceType}, serviceUUID: ${serviceUUID}, characteristicUUID: ${characteristicUUID}`,
      );

      if (
        await Bluetooth.connect(
          selectedDevice.id,
          0,
          serviceUUID,
          characteristicUUID,
          isDeviceFridge ? 'FRIDGE' : 'YETI',
          selectedDevice.name,
        )
      ) {
        dispatch(yetiActions.clearDiscoveredDevices());

        if (isDeviceFridge) {
          navigation.navigate('ConnectYeti', {
            connectionType: 'direct',
            dataTransferType: 'bluetooth',
            device: selectedDevice,
            deviceType,
          });

          return;
        }

        navigation.navigate('SelectConnect', {
          device: selectedDevice,
          dataTransferType: 'bluetooth',
          deviceType,
        });
      }

      setIsButtonDisabled(false);
      return;
    }

    if (await Bluetooth.start()) {
      if (isScanning) {
        setIsScanning(false);
        setTitleText(READY);

        Bluetooth.stop();
      } else {
        setSeconds(AppConfig.showConnectToWiFiDelay / 1000);
        setIsScanning(true);
        setTitleText(SCANNING);
        setButtonTitle(CANCEL);
        Bluetooth.scan();
      }
    }
  }, [bluetoothState, buttonTitle, dispatch, isScanning, navigation, selectedDevice, setSeconds]);

  const checkState = useCallback(async () => {
    const state = await Bluetooth.getState();
    setBluetoothState(state);

    if (state === BluetoothState.DisabledGlobally) {
      setButtonTitle(ENABLE_BLUETOOTH);
    } else if (state === BluetoothState.NeedAccess) {
      setButtonTitle(NEED_ACCESS);
    } else if (state === BluetoothState.Enabled) {
      setTitleText(READY);
      setButtonTitle(SCAN_FOR_DEVICES);
    }
  }, []);

  useMount(() => {
    return () => {
      const { yetiInfo, application } = store.getState();
      if (!application.isDirectConnection || yetiInfo.discoveredDevices.length > 0) {
        Bluetooth.stop();
      }
    };
  });

  useEffect(() => {
    if (currentAppState === 'active') {
      checkState();
    }
  }, [checkState, currentAppState]);

  useEffect(() => {
    if (isCompleted) {
      setSelectedDevice(devices?.[0]);
      setIsScanning(false);
      setTitleText(SCANNING_FINISHED);
      setButtonTitle(CONTINUE);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isCompleted]);

  useEffect(() => {
    if (isScanning && seconds === 0) {
      setTitleText(TROUBLE_WITH_BLUETOOTH);
      setButtonTitle(SCAN_AGAIN);
    }
  }, [isScanning, seconds]);

  return {
    devices,
    titleText,
    isScanning,
    buttonTitle,
    isCompleted,
    onButtonPress,
    selectedDevice,
    isButtonDisabled,
    setSelectedDevice,
  };
};

export default useBluetooth;
