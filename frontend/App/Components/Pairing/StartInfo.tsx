import React from 'react';
import { View } from 'react-native';

import Row from './InfoRow';
import { usePairingNavigation } from 'App/Hooks';
import { Colors } from 'App/Themes';
import Pressable from '../Pressable';

function StartInfo() {
  const pairingNavigation = usePairingNavigation('PairingModeHelp');

  return (
    <View testID="startInfo">
      <Row
        withBorder={false}
        title="Stay Near Device"
        titleTextStyles={{ color: Colors.green }}
        subTitle="Keep your phone near the Goal Zero device."
        iconText="1."
      />
      <Pressable testID="pressBluetoothHelp" onPress={() => pairingNavigation.navigate('BluetoothHelp')}>
        <Row
          withBorder={true}
          showInfo
          rightArrowIcon
          title="Turn On Phone Bluetooth"
          titleTextStyles={{ color: Colors.green }}
          subTitle="Enable Bluetooth and allow Bluetooth access on your phone."
          iconText="2."
        />
      </Pressable>
      <Pressable testID="pressPairingMode" onPress={() => pairingNavigation.navigate('PairingMode')}>
        <Row
          withBorder={true}
          showInfo
          rightArrowIcon
          title="Turn On Device Bluetooth"
          titleTextStyles={{ color: Colors.green }}
          subTitle="Set your Goal Zero device to pairing mode."
          iconText="3."
        />
      </Pressable>
    </View>
  );
}

export default StartInfo;
