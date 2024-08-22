import React, { useCallback, useEffect, useMemo } from 'react';
import { View, Text, StyleSheet } from 'react-native';

import { showConfirm, showError } from 'App/Services/Alert';
import { isSupportDirectConnection } from 'App/Services/FirmwareUpdates';

import BluetoothConnectedIcon from 'App/Images/Icons/bluetoothConnected.svg';
import OnlineConnectedIcon from 'App/Images/Icons/onlineConnected.svg';
import PhoneDisconnectedIcon from 'App/Images/Icons/phoneDisconnected.svg';

import { Colors, Fonts, Metrics } from 'App/Themes';
import { Pressable } from 'App/Components';
import { useHomeNavigation, useAppSelector, useAppDispatch, usePrevious } from 'App/Hooks';
import { YetiState } from 'App/Types/Yeti';
import { yetiActions } from 'App/Store/Yeti';

function ConnectInfo(device: YetiState) {
  const dispatch = useAppDispatch();
  const navigation = useHomeNavigation('StartPairing');

  const { isDirectConnection, startPairConfirmed, startPairError } = useAppSelector((state) => ({
    isDirectConnection: state.application.isDirectConnection,
    startPairConfirmed: state.yetiInfo.startPairConfirmed,
    startPairError: state.yetiInfo.startPairError,
  }));

  const prevStartPairConfirmed = usePrevious(startPairConfirmed);
  const prevStartPairError = usePrevious(startPairError);

  const renderIcon = useMemo(() => {
    if (!device.isConnected) {
      return <PhoneDisconnectedIcon />;
    }

    if (isDirectConnection) {
      return <BluetoothConnectedIcon color={Colors.dark} />;
    }

    return <OnlineConnectedIcon color={Colors.dark} />;
  }, [device.isConnected, isDirectConnection]);

  const getText = useMemo(() => {
    const reconnectingText = 'Reconnecting... Tap here to reconnect';
    const directConnectedText = 'Direct Connected (Offline). Tap here to online connect.';
    const onlineConnected = 'Online Connected. Tap here to direct connect.';
    if (!device.isConnected) {
      return reconnectingText;
    }

    if (isDirectConnection) {
      return directConnectedText;
    }

    return onlineConnected;
  }, [device.isConnected, isDirectConnection]);

  const renderText = useMemo(
    () => (
      <View style={styles.sectionMain}>
        <Text style={styles.title}>{getText}</Text>
      </View>
    ),
    [getText],
  );

  const onPress = useCallback(() => {
    if (!isDirectConnection && !isSupportDirectConnection(device.firmwareVersion)) {
      showError("Update Required - Please update your Yeti's firmware to take advantage of this feature");
      return;
    }

    if (device.isConnected) {
      showConfirm(
        'Change Connection',
        isDirectConnection
          ? `You will no longer be Direct Connected to “${device.name}”. Are you sure you want to change your connection?`
          : 'Are you sure you want to change your connection?',
        () => {
          if (isDirectConnection) {
            dispatch(yetiActions.startPair.request({ peripheralId: device.peripheralId || '' }));
          } else {
            navigation.navigate('StartPairing', {
              reconnect: true,
              connectionType: 'direct',
            });
          }
        },
      );
    } else {
      navigation.navigate('StartPairing');
    }
  }, [
    isDirectConnection,
    device.firmwareVersion,
    device.isConnected,
    device.name,
    device.peripheralId,
    dispatch,
    navigation,
  ]);

  useEffect(() => {
    if (isDirectConnection) {
      if (!prevStartPairError && startPairError) {
        showConfirm('Disconnected', "You don't appear to be connected anymore. Let's reconnect.", () => {
          navigation.navigate('StartPairing');
        });
        return;
      }

      if (!prevStartPairConfirmed && startPairConfirmed) {
        navigation.navigate('StartPairing', {
          reconnect: true,
          connectionType: 'cloud',
        });
      }
    }
  }, [isDirectConnection, navigation, prevStartPairConfirmed, prevStartPairError, startPairConfirmed, startPairError]);

  return (
    <Pressable
      testID="connectInfo"
      style={[
        styles.container,
        isDirectConnection && styles.dirrectConnected,
        !device.isConnected && styles.disconnected,
      ]}
      onPress={onPress}>
      {renderIcon}
      {renderText}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    paddingVertical: Metrics.smallMargin,
    paddingLeft: Metrics.baseMargin,
    paddingRight: 5,
    alignItems: 'center',
    backgroundColor: Colors.green,
  },
  dirrectConnected: {
    paddingLeft: Metrics.halfMargin,
  },
  disconnected: {
    backgroundColor: Colors.lightGray,
  },
  sectionMain: {
    paddingLeft: Metrics.smallMargin,
  },
  title: {
    ...Fonts.font.base.bodyOne,
    color: Colors.dark,
  },
});

export default ConnectInfo;
