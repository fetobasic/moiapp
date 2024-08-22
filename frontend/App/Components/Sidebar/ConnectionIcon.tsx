import React, { useCallback } from 'react';
import { View, StyleSheet } from 'react-native';

import BluetoothIcon from 'App/Images/Icons/bluetoothGreen.svg';
import BluetoothOff from 'App/Images/Icons/bluetoothOff.svg';
import Wifi from 'App/Images/Icons/wifiGreen.svg';
import WifiOff from 'App/Images/Icons/wifiOff.svg';
import WiFiIconDirect from 'App/Images/Icons/wifiDirectGreen.svg';
import WifiDirectOff from 'App/Images/Icons/wifiOffDirectConnected.svg';
import CombinerIcon from 'App/Images/Icons/combiner.svg';

import { Colors, Metrics } from 'App/Themes';
import { DataTransferType } from 'App/Types/ConnectionType';

type Props = {
  dataTransferType?: DataTransferType;
  isDirectConnection?: boolean;
  isConnected?: boolean;
  isCombinerInfo?: boolean;
};

function ConnectionIcon({ dataTransferType, isDirectConnection, isConnected, isCombinerInfo }: Props) {
  const renderIcon = useCallback(() => {
    if (isCombinerInfo) {
      return <CombinerIcon color={Colors.combiner} />;
    }

    if (dataTransferType === 'bluetooth' && isDirectConnection) {
      return isConnected ? <BluetoothIcon color={Colors.green} /> : <BluetoothOff color={Colors.white} opacity="0.6" />;
    }

    if (dataTransferType === 'wifi' && isDirectConnection) {
      return isConnected ? (
        <WiFiIconDirect color={Colors.green} />
      ) : (
        <WifiDirectOff color={Colors.white} opacity="0.6" />
      );
    }

    if (!isDirectConnection) {
      return isConnected ? <Wifi /> : <WifiOff color={Colors.white} opacity="0.6" />;
    }

    return <WifiOff />;
  }, [dataTransferType, isCombinerInfo, isConnected, isDirectConnection]);

  return <View style={styles.wrapper}>{renderIcon()}</View>;
}

const styles = StyleSheet.create({
  wrapper: {
    marginTop: 5,
    marginRight: 5,
    alignItems: 'center',
    ...Metrics.icons.directConnectIcon,
  },
});

export default ConnectionIcon;
