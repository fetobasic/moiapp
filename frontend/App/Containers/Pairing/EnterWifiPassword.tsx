import React, { useCallback, useState } from 'react';
import { View, StyleSheet, Text } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { NativeStackScreenProps } from '@react-navigation/native-stack';

import { HeaderSimple as Header, TextInputPassword, InfoRow, Button } from 'App/Components';
import { ApplicationStyles, Colors, Fonts, Metrics, isIOS } from 'App/Themes';

import { PairingStackParamList } from 'App/Types/NavigationStackParamList';
import { usePairingNavigation } from 'App/Hooks';
import renderElement from 'App/Services/RenderElement';
import InfoIcon from 'App/Images/Icons/information.svg';

const WiFiConnectionDescription = () => (
  <>
    <Text style={styles.textBody}>You are paired to your Goal Zero device. Now you will connect to your network.</Text>
    <Text style={styles.textBody}>
      <Text style={styles.textHighlight}>Note</Text>: The device Wi-Fi icon or light on the display will be solid when
      connected.
    </Text>
  </>
);

type Props = NativeStackScreenProps<PairingStackParamList, 'EnterWifiPassword'>;

function EnterWifiPassword({ route }: Props) {
  const navigation = usePairingNavigation('EnterWifiPassword');
  const [password, setPassword] = useState('');

  const handleContinueButton = useCallback(() => {
    navigation.navigate('ConnectYeti', {
      ...route.params,
      wifiPassword: password,
    });
  }, [navigation, password, route.params]);

  return (
    <SafeAreaView edges={['bottom']} style={ApplicationStyles.mainContainer}>
      <Header title="Enter Password" />
      <View style={ApplicationStyles.container}>
        <InfoRow
          withBorder={false}
          title="Enter Network Password"
          icon={renderElement(<InfoIcon />)}
          body={renderElement(<WiFiConnectionDescription />)}
        />
        <TextInputPassword
          focused
          autoCapitalize="none"
          onSubmitEditing={handleContinueButton}
          containerStyle={styles.input}
          placeholder="Password"
          value={password}
          onChangeText={setPassword}
          returnKeyType={isIOS ? 'go' : 'done'}
        />
        <Button
          style={{ marginTop: Metrics.marginSection }}
          title="Continue"
          onPress={handleContinueButton}
          inverse={!password.length}
          disabled={!password.length}
          textTitleInverseColor={!password.length ? Colors.gray : Colors.background}
        />
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  input: {
    marginTop: Metrics.marginSection,
  },
  textBody: {
    marginTop: Metrics.smallMargin,
    ...Fonts.font.base.caption,
    color: Colors.white,
  },
  textHighlight: {
    color: Colors.severity.yellow,
  },
});

export default EnterWifiPassword;
