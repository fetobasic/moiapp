import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import useAnywhereConnect from './useAnywhereConnect';
import useDirectConnect from './useDirectConnect';
import { useEvents } from 'App/Hooks';
import { useMount, useAppDispatch } from 'App/Hooks/commonHooks';
import AppConfig from 'App/Config/AppConfig';
import { clearAlert } from 'App/Services/Alert';
import { cacheActions } from 'App/Store/Cache';
import { devicesActions } from 'App/Store/Devices';
import { registerDevices } from 'App/Services/Yeti';
import { PairingStackParamList } from 'App/Types/NavigationStackParamList';
import { getYetiGeneration } from 'App/Services/ThingHelper';
import { store } from 'App/Store';
import { fileLogger } from 'App/Services/FileLogger';

type Props = PairingStackParamList['ConnectYeti'];

const useConnectToYeti = (props: Props) => {
  const dispatch = useAppDispatch();
  const isDirectConnection = props.connectionType === 'direct';
  const isBluetoothConnection = props.dataTransferType === 'bluetooth';
  const [isPairingError, setPairingError] = useState<boolean>(false);
  const { track } = useEvents();

  const errorTimerId = useRef<NodeJS.Timeout | null>(null);

  const {
    isConnected: anywhereIsConnected,
    yetiInfo: anywhereInfo,
    isError,
    errorCode,
    deviceThingName: cloudThingName,
    networkCheckCode,
    isBleError,
    connectionStatusText,
  } = useAnywhereConnect(props);
  const {
    isConnected: directIsConnected,
    modelInfo: directInfo,
    deviceThingName: directThingName,
  } = useDirectConnect(props);
  const thingName = useMemo(
    () => (isDirectConnection ? directThingName : cloudThingName),
    [cloudThingName, directThingName, isDirectConnection],
  );

  const modelInfo = useMemo(
    () => (isDirectConnection ? directInfo : anywhereInfo),
    [anywhereInfo, directInfo, isDirectConnection],
  );

  const clearError = () => setPairingError(false);

  const showErrorAfterTimeout = useCallback(
    (
      showDelay = isBluetoothConnection ? AppConfig.checkPairingBluetoothTimeout : AppConfig.checkPairingWiFiTimeout,
    ) => {
      clearAlert(errorTimerId.current);

      errorTimerId.current = setTimeout(() => {
        const _yetiInfo = store?.getState()?.yetiInfo?.joinData;

        fileLogger.addLog('useConnectToYeti', `showErrorAfterTimeout. _yetiInfo: ${JSON.stringify(_yetiInfo)}`);

        track('thing_pairing_failure', {
          thingName: _yetiInfo?.name || thingName || '',
          mode: props.connectionType,
          dataTransferType: props.dataTransferType,
          model: _yetiInfo?.model || '',
          hostId: _yetiInfo?.hostId,
          gen: getYetiGeneration(_yetiInfo?.name, _yetiInfo?.model),
        });

        dispatch(cacheActions.changeAppRateInfo({ isBlockedShowAppRate: true }));
        setPairingError(true);
      }, showDelay);
    },
    [dispatch, isBluetoothConnection, props.connectionType, props.dataTransferType, thingName, track],
  );

  useMount(() => {
    showErrorAfterTimeout();

    return () => {
      clearError();
      clearAlert(errorTimerId.current);
      errorTimerId.current = null;
    };
  });

  useEffect(() => {
    if (isError) {
      showErrorAfterTimeout(0);
    }
  }, [isError, showErrorAfterTimeout]);

  useEffect(() => {
    if (
      (props.connectionType === 'cloud' && anywhereIsConnected) ||
      (props.connectionType === 'direct' && directIsConnected)
    ) {
      fileLogger.addLog(
        'useConnectToYeti',
        `Pairing success. thingName: ${thingName}. modelInfo: ${JSON.stringify(modelInfo)}`,
      );

      track('thing_pairing_success', {
        thingName,
        mode: props.connectionType,
        dataTransferType: props.dataTransferType,
        model: modelInfo?.model,
        hostId: modelInfo?.hostId,
        gen: getYetiGeneration(thingName, modelInfo?.model),
      });

      clearAlert(errorTimerId.current);
      clearError();
      errorTimerId.current = null;

      dispatch(devicesActions.blockAllPorts({ thingName, state: false }));

      registerDevices();
    }
  }, [
    anywhereIsConnected,
    cloudThingName,
    directIsConnected,
    directThingName,
    dispatch,
    isDirectConnection,
    modelInfo,
    modelInfo?.hostId,
    modelInfo?.model,
    props.connectionType,
    props.dataTransferType,
    thingName,
    track,
  ]);

  return {
    isConnected: isDirectConnection ? directIsConnected : anywhereIsConnected,
    modelInfo,
    isPairingError,
    errorCode,
    clearError,
    thingName,
    networkCheckCode,
    isBleError,
    connectionStatusText,
  };
};

export default useConnectToYeti;
