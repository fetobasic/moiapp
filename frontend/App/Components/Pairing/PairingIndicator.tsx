import React, { useCallback, useMemo } from 'react';
import { View, StyleSheet } from 'react-native';

import type { YetiState } from 'App/Types/Yeti';
import type { FridgeState } from 'App/Types/Fridge';
import type { ConnectionType, DataTransferType } from 'App/Types/ConnectionType';
import { Colors, Metrics } from 'App/Themes';
import { isFridge } from 'App/Hooks/useMapDrawerData';
import CloudConnectedRadius from 'App/Images/Pairing/CloudConnectedRadius.svg';
import ConnectionSuccessBluetoothIcon from 'App/Images/Pairing/ConnectionSuccessBluetooth.svg';
import ConnectionSuccessYetiIcon from 'App/Images/Pairing/ConnectionSuccessYeti.svg';
import ConnectionSuccessCloudIcon from 'App/Images/Pairing/ConnectionSuccessCloud.svg';
import ConnectionSuccessWifiIcon from 'App/Images/Pairing/ConnectionSuccessWifi.svg';
import ConnectionTypeBluetoothIcon from 'App/Images/Pairing/ConnectionTypeBluetooth.svg';
import ConnectionTypeCloudIcon from 'App/Images/Pairing/ConnectionTypeCloud.svg';
import ConnectionTypeWifiIcon from 'App/Images/Pairing/ConnectionTypeWiFi.svg';
import DeviceYetiIcon from 'App/Images/Pairing/DeviceYeti.svg';
import PhoneIcon from 'App/Images/Pairing/Phone.svg';
import PhoneErrorIcon from 'App/Images/Pairing/PhoneError.svg';
import PhoneSuccessIcon from 'App/Images/Pairing/PhoneSuccess.svg';
import InfoIcon from 'App/Images/Icons/check.svg';
import CloseRedIcon from 'App/Images/Icons/redCross.svg';

type Props = {
  device: YetiState | FridgeState;
  isCompleted: boolean;
  isConnected: boolean;
  progress: number;
  connectionType: ConnectionType;
  dataTransferType: DataTransferType;
  isError?: boolean;
  ssid?: string;
};

export function PairingIndicator(props: Props) {
  const successfullyPaired = useMemo(
    () => props.isCompleted && props.isConnected,
    [props.isCompleted, props.isConnected],
  );

  const computedStyles = useMemo(() => {
    let containerBorderColor = Colors.devicesHubRowBackground;
    let middleRadiusBorderColor = Colors.devicesHubRowBackground;
    let innerRadiusBorderColor = Colors.devicesHubRowBackground;

    if (props.isError) {
      return {
        container: { borderColor: containerBorderColor },
        middleRadius: { borderColor: middleRadiusBorderColor },
        innerRadius: { borderColor: innerRadiusBorderColor },
      };
    }

    if (!props.isCompleted && !props.isError) {
      innerRadiusBorderColor = Colors.green;
    }

    if (props.progress > 33 && !props.isCompleted) {
      middleRadiusBorderColor = Colors.green;
    }

    if (props.progress > 66 && !props.isCompleted) {
      containerBorderColor = Colors.green;
    }

    if (props.isCompleted && props.connectionType === 'cloud') {
      containerBorderColor = Colors.transparent;
    }

    return {
      container: { borderColor: containerBorderColor },
      middleRadius: { borderColor: middleRadiusBorderColor },
      innerRadius: { borderColor: innerRadiusBorderColor },
    };
  }, [props.isCompleted, props.isError, props.progress, props.connectionType]);

  const renderCloudIcon = () => {
    if (props.connectionType === 'cloud' && successfullyPaired) {
      return <ConnectionSuccessCloudIcon />;
    }

    return <ConnectionTypeCloudIcon />;
  };

  const renderPhoneIcon = () => {
    if (successfullyPaired) {
      return (
        <>
          <PhoneSuccessIcon />
          <View style={styles.completionIcon}>
            <View style={[styles.icon, styles.iconSuccess]}>
              <InfoIcon color={Colors.background} />
            </View>
          </View>
        </>
      );
    }

    if (props.isError) {
      return (
        <>
          <PhoneErrorIcon />
          <View style={styles.completionIcon}>
            <View style={[styles.icon, styles.iconError]}>
              <CloseRedIcon color={Colors.background} />
            </View>
          </View>
        </>
      );
    }

    return <PhoneIcon />;
  };

  const renderDeviceIcon = useCallback(() => {
    if (isFridge(props.device.deviceType)) {
      return successfullyPaired ? <ConnectionSuccessBluetoothIcon /> : <ConnectionTypeBluetoothIcon />;
    }

    if (props.dataTransferType === 'wifi' && props.connectionType === 'direct') {
      return successfullyPaired ? <ConnectionSuccessWifiIcon /> : <ConnectionTypeWifiIcon />;
    }

    if (props.connectionType === 'direct') {
      return successfullyPaired ? <ConnectionSuccessBluetoothIcon /> : <ConnectionTypeBluetoothIcon />;
    } else {
      return successfullyPaired ? <ConnectionSuccessYetiIcon /> : <DeviceYetiIcon />;
    }
  }, [props.device, props.dataTransferType, props.connectionType, successfullyPaired]);

  return (
    <View testID="pairingIndicator" style={[styles.container, computedStyles.container]}>
      <View style={styles.cloudIcon}>{renderCloudIcon()}</View>

      <View style={[styles.middleRadius, computedStyles.middleRadius]}>
        <View style={[styles.innerRadius, computedStyles.innerRadius]}>
          <View style={styles.absolute}>{renderPhoneIcon()}</View>
        </View>
      </View>

      {props.connectionType === 'direct' && successfullyPaired && (
        <View style={styles.dashedLineContainer}>
          <View style={styles.dashedLine}>
            <View style={styles.dashedLineHeight} />
          </View>
        </View>
      )}

      {props.connectionType === 'cloud' && successfullyPaired && (
        <View style={styles.absolute}>
          <CloudConnectedRadius />
        </View>
      )}

      <View style={styles.deviceIcon}>{renderDeviceIcon()}</View>
    </View>
  );
}

const CONTAINER_SIZE = 272;
const MIDLE_RADIUS_SIZE = 208;
const INNER_RADIUS_SIZE = 144;

const styles = StyleSheet.create({
  container: {
    width: CONTAINER_SIZE,
    height: CONTAINER_SIZE,
    borderRadius: CONTAINER_SIZE / 2,
    borderWidth: 2,
    borderStyle: 'dashed',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 2 * Metrics.baseMargin,
    marginBottom: Metrics.baseMargin,
  },
  absolute: {
    position: 'absolute',
    zIndex: 1,
  },
  cloudIcon: {
    position: 'absolute',
    top: -35,
  },
  deviceIcon: {
    position: 'absolute',
    zIndex: 10,
    bottom: -40,
  },
  icon: {
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: Metrics.marginSection,
  },
  iconError: {
    backgroundColor: Colors.portError,
  },
  iconSuccess: {
    backgroundColor: Colors.green,
  },
  completionIcon: {
    top: 65,
    position: 'absolute',
    zIndex: 10,
    alignSelf: 'center',
  },
  middleRadius: {
    width: MIDLE_RADIUS_SIZE,
    height: MIDLE_RADIUS_SIZE,
    borderRadius: MIDLE_RADIUS_SIZE / 2,
    borderWidth: 2,
    justifyContent: 'center',
    alignItems: 'center',
  },
  innerRadius: {
    width: INNER_RADIUS_SIZE,
    height: INNER_RADIUS_SIZE,
    borderRadius: INNER_RADIUS_SIZE / 2,
    borderWidth: 2,
    justifyContent: 'center',
    alignItems: 'center',
  },
  dashedLineContainer: {
    zIndex: -1,
    position: 'absolute',
    overflow: 'hidden',
    width: 2,
    height: 60,
    bottom: 12,
  },
  dashedLineHeight: {
    height: 60,
  },
  dashedLine: {
    borderStyle: 'dashed',
    borderWidth: 2,
    borderColor: Colors.green,
    margin: -2,
    width: 0,
    marginBottom: 0,
  },
});
