import React, { useState } from 'react';
import { View, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { TextInput, TextInputPassword, HeaderSimple as Header, Button } from 'App/Components';
import { ApplicationStyles, Colors, Metrics } from 'App/Themes';
import { usePairingNavigation } from 'App/Hooks';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { PairingStackParamList } from 'App/Types/NavigationStackParamList';

type Props = NativeStackScreenProps<PairingStackParamList, 'EnterNetworkManually'>;

export const EnterNetworkManually = ({ route }: Props) => {
  const [wifiName, setWifiName] = useState<string>('');
  const [wifiPassword, setWifiPassword] = useState<string>('');
  const navigation = usePairingNavigation('SelectWifiNetwork');

  const handleJoin = () => {
    navigation.navigate('ConnectYeti', {
      ...route.params,
      ssid: wifiName,
      dataTransferType: 'bluetooth',
      connectionType: 'cloud',
      wifiPassword,
    });
  };

  return (
    <>
      <SafeAreaView edges={['bottom']} style={ApplicationStyles.mainContainer}>
        <Header title="Enter Network Manually" isModal />
        <View style={styles.container}>
          <TextInput
            value={wifiName as string}
            containerStyle={styles.manuallyInput}
            placeholder="Name"
            onChangeText={(value: string) => setWifiName(value)}
          />
          <TextInputPassword
            value={wifiPassword}
            iconStyle={styles.iconStyle}
            containerStyle={styles.manuallyInput}
            placeholder="Password"
            autoCapitalize="none"
            onChangeText={(value: string) => setWifiPassword(value)}
          />
          <View style={styles.btnWrapper}>
            <Button
              style={styles.joinBtn}
              title="JOIN"
              onPress={handleJoin}
              inverse={!(wifiName.length && wifiPassword?.length)}
              disabled={!(wifiName.length && wifiPassword?.length)}
              textTitleInverseColor={Colors.gray}
            />
          </View>
        </View>
      </SafeAreaView>
    </>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: Metrics.baseMargin,
    paddingVertical: Metrics.marginSection,
  },
  iconStyle: {
    bottom: 17,
  },
  manuallyInput: {
    marginBottom: Metrics.halfMargin,
  },
  joinBtn: {
    flex: 1,
    alignSelf: 'center',
    height: 50,
    width: 100,
    top: 10,
  },
  btnWrapper: {
    flexDirection: 'row',
  },
  saveBtn: {
    flex: 1,
  },
});
