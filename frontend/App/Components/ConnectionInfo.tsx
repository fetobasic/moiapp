import React, { useState, useEffect, useRef, useMemo } from 'react';
import { StyleSheet } from 'react-native';
import { Colors } from 'App/Themes';
import WiFiIcon from 'App/Images/Icons/wifiDark.svg';
import BluetoothIcon from 'App/Images/Icons/bluetooth.svg';
import LostWiFiIcon from 'App/Images/Icons/wifi_off.svg';
import LostBluetoothIcon from 'App/Images/Icons/bluetoothOff.svg';
import LostDirectWiFiIcon from 'App/Images/Icons/wifiOffDirectConnected.svg';
import WiFiDirrectIcon from 'App/Images/Icons/wifiDarkDirect.svg';
import FWUpdate from 'App/Images/Icons/update.svg';
import { disconnect } from 'App/Services/Bluetooth/Fridge';
import { YetiState } from 'App/Types/Yeti';
import { NotificationWrapper } from './Main/NotificationBanner';
import { useHomeNavigation } from 'App/Hooks';
import { DeviceState } from 'App/Types/Devices';
import { isFridge } from 'App/Hooks/useMapDrawerData';

const enum TYPE {
  WIFI = 'wifi',
  CLOUD = 'cloud',
  BT = 'bt',
  FW_UPDATE = 'fw_update',
}

type Props = {
  onPress?: () => void;
  device: DeviceState;
  hideWhenConnected?: boolean;
};

const ConnectionInfo = ({ onPress, device, hideWhenConnected }: Props) => {
  const navigation = useHomeNavigation('StartPairing');
  const [showReconnectMessage, setShowReconnectMessage] = useState(false);
  const { isConnected, isDirectConnection } = device;
  const isFirmwareUpdate = Boolean((device as YetiState)?.directFirmwareUpdateStartTime && isDirectConnection);
  const directConnectionType = (device as YetiState)?.dataTransferType === TYPE.WIFI ? TYPE.WIFI : TYPE.BT;
  const isDeviceFridge = isFridge(device?.deviceType);
  const connectionType = useMemo(() => {
    if (isDirectConnection) {
      if (isFirmwareUpdate) {
        return TYPE.FW_UPDATE;
      }

      return directConnectionType;
    }

    return TYPE.CLOUD;
  }, [directConnectionType, isDirectConnection, isFirmwareUpdate]);
  const timerRef = useRef<any | null>(null);

  useEffect(() => {
    if (!isConnected) {
      timerRef.current = setTimeout(() => {
        setShowReconnectMessage(true);
      }, 20000);
    } else {
      if (timerRef.current !== null) {
        clearTimeout(timerRef.current);
        timerRef.current = null;
      }
      setShowReconnectMessage(false);
    }

    return () => {
      if (timerRef.current !== null) {
        clearTimeout(timerRef.current);
        timerRef.current = null;
      }
    };
  }, [isConnected]);

  const icons = {
    [TYPE.CLOUD]: {
      icon: <WiFiIcon color={Colors.background} height={32} testID="icon" />,
      iconLostConnection: <LostWiFiIcon color={Colors.background} height={32} testID="iconConnectionLost" />,
      text: 'Cloud Connected. Tap here to Direct Connect',
    },
    [TYPE.BT]: {
      icon: <BluetoothIcon color={Colors.background} height={32} testID="icon" />,
      iconLostConnection: <LostBluetoothIcon color={Colors.background} height={32} testID="iconConnectionLost" />,
      text: 'Direct Connected. Tap here to Cloud Connect',
    },
    [TYPE.WIFI]: {
      icon: <WiFiDirrectIcon color={Colors.background} height={32} testID="icon" />,
      iconLostConnection: <LostDirectWiFiIcon color={Colors.background} height={32} testID="iconConnectionLost" />,
      text: 'Wi-Fi Direct Connected. Tap here to Cloud Connect',
    },
    [TYPE.FW_UPDATE]: {
      icon: <FWUpdate color={Colors.background} height={32} testID="icon" />,
      iconLostConnection: <FWUpdate color={Colors.background} height={32} testID="iconConnectionLost" />,
      text: 'Downloading New Firmware. This takes about 5 minutes...',
    },
  };

  const onPressHandler = async () => {
    if (isFirmwareUpdate) {
      return;
    }

    if (isConnected) {
      onPress?.();
      return;
    }

    if (!showReconnectMessage) {
      return;
    }

    // for Fridges, disconnect from the bluetooth so we can rediscover it
    if (isDeviceFridge) {
      await disconnect(device?.peripheralId || '');
    }

    navigation.navigate('StartPairing', {
      reconnect: true,
      connectionType: isDirectConnection ? 'direct' : 'cloud',
    });
  };

  if (isConnected && (hideWhenConnected || isDeviceFridge)) {
    return null;
  }

  return (
    <NotificationWrapper
      numberOfLines={1}
      onPressHandler={onPressHandler}
      icon={isConnected || isFirmwareUpdate ? icons[connectionType].icon : icons[connectionType].iconLostConnection}
      topLineColor={isConnected || isFirmwareUpdate ? Colors.yellowBorder : Colors.notification.lightYellow}
      contentStyle={isConnected || isFirmwareUpdate ? undefined : { backgroundColor: Colors.portWarning }}
      text={
        (isConnected && !hideWhenConnected) || isFirmwareUpdate
          ? icons[connectionType].text
          : `Connection Lost - ${showReconnectMessage ? 'Tap to reconnect your device' : 'Reconnecting...'}`
      }
      isForwardIcon={!isFirmwareUpdate && (isConnected || showReconnectMessage)}
      forwardIconColor={isConnected ? Colors.green : Colors.severity.yellow}
      textStyles={isFirmwareUpdate && styles.textStyles}
    />
  );
};

const styles = StyleSheet.create({
  textStyles: {
    width: '100%',
  },
});

export default ConnectionInfo;
