import React, { useCallback } from 'react';
import { View, ScrollView, StyleSheet, Image, Linking } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { HeaderSimple as Header, Button, InfoRow } from 'App/Components';
import { ApplicationStyles, Colors, Images, isIOS, Metrics } from 'App/Themes';

import WarningIcon from 'App/Images/Icons/warn.svg';
import BluetoothIcon from 'App/Images/Icons/information.svg';
import renderElement from 'App/Services/RenderElement';
import BluetoothStateManager from 'react-native-bluetooth-state-manager';

function BluetoothHelp() {
  const onButtonPress = useCallback(() => {
    if (isIOS) {
      Linking.openURL('App-Prefs:Bluetooth');
    } else {
      BluetoothStateManager.openSettings();
    }
  }, []);

  return (
    <SafeAreaView edges={['bottom']} style={ApplicationStyles.mainContainer}>
      <Header title="Phone Bluetooth" />
      <View style={ApplicationStyles.container}>
        <ScrollView showsVerticalScrollIndicator={false}>
          <InfoRow
            withBorder={false}
            icon={renderElement(<BluetoothIcon color={Colors.transparentWhite('0.6')} width={24} height={24} />)}
            subTitle="Enable Bluetooth and allow Bluetooth access on your phone."
          />
          <Image
            resizeMode="cover"
            style={styles.img}
            source={isIOS ? Images.selectBluetoothIos : Images.selectBluetoothAndroid}
          />
          <Image
            resizeMode="cover"
            style={[styles.img, styles.selectBluetoothAccessImg]}
            source={isIOS ? Images.selectBluetoothAccessIos : Images.selectBluetoothAccessAndroid}
          />
          {isIOS && (
            <>
              <InfoRow
                withBorder={false}
                icon={renderElement(<WarningIcon width={24} height={24} />)}
                subTitle="Allow New Connections if new bluetooth connections have been turned off from the Control Center."
              />
              <Image
                resizeMode="contain"
                style={[styles.img, styles.selectBluetoothNewConnectionsIosImg]}
                source={Images.selectBluetoothNewConnectionsIos}
              />
            </>
          )}
        </ScrollView>
        <Button title="Go to Settings" inverse={false} onPress={onButtonPress} />
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  img: {
    width: Metrics.screenWidth - Metrics.baseMargin * 2,
    height: 180,
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: 8,
    marginBottom: Metrics.baseMargin,
  },
  selectBluetoothAccessImg: {
    marginBottom: Metrics.smallMargin,
  },
  selectBluetoothNewConnectionsIosImg: {
    height: 90,
  },
});

export default BluetoothHelp;
