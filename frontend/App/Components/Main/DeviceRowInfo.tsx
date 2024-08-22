import React from 'react';
import { View, StyleSheet, Text } from 'react-native';
import { DrawerNavigationHelpers } from '@react-navigation/drawer/lib/typescript/src/types';

import BluetoothIcon from 'App/Images/Icons/bluetooth.svg';
import Wifi from 'App/Images/Icons/wifiGreen.svg';
import WifiOff from 'App/Images/Icons/wifiOff.svg';

import Pressable from 'App/Components/Pressable';

import { YetiState } from 'App/Types/Yeti';
import { Colors, Fonts, Metrics } from 'App/Themes';
import { format } from 'date-fns';

type Props = { item: YetiState; isBluetoothConnect: boolean; navigation: DrawerNavigationHelpers };

function DeviceRowInfo({ item, isBluetoothConnect, navigation }: Props) {
  return (
    <View testID="deviceRowInfo" style={styles.container}>
      <Pressable
        testID="deviceRowInfoNavPress"
        onPress={() => navigation.navigate('Home', { device: item })}
        style={styles.sectionMain}>
        <View style={styles.imgWrapper}>
          {item.isDirectConnection && isBluetoothConnect ? (
            <BluetoothIcon color={Colors.green} />
          ) : item.isConnected ? (
            <Wifi />
          ) : (
            <WifiOff />
          )}
        </View>
        <View style={styles.sectionTexts}>
          <Text numberOfLines={1} style={styles.textTitle}>
            {item.name}
          </Text>
          {item?.dateSync && (
            <Text style={styles.textSubtitle}>
              {`Last Sync: ${format(new Date(item.dateSync), "h:mm aaa 'on' MMM do, yyyy")}`}
            </Text>
          )}
          <Text style={styles.textSubtitle}>{item.model}</Text>
        </View>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    borderBottomColor: Colors.transparentWhite('0.12'),
    borderBottomWidth: 1,
  },
  sectionMain: {
    flex: 1,
    flexDirection: 'row',
    marginVertical: Metrics.marginSection,
  },
  sectionTexts: {
    paddingLeft: Metrics.marginSection,
    flex: 1,
  },
  textTitle: {
    ...Fonts.font.condensed.h3,
  },
  textSubtitle: {
    ...Fonts.font.base.bodyOne,
    color: Colors.transparentWhite('0.6'),
  },
  imgWrapper: {
    marginTop: 5,
    alignItems: 'center',
    ...Metrics.icons.directConnectIcon,
  },
});

export default DeviceRowInfo;
