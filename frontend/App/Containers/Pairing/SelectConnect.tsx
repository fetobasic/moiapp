import React, { useCallback } from 'react';
import { ScrollView, View, Text, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { NativeStackScreenProps } from '@react-navigation/native-stack';

import { Button, HeaderSimple as Header, InfoRow } from 'App/Components';

import { ApplicationStyles, Colors, Fonts, Metrics } from 'App/Themes';
import { PairingStackParamList } from 'App/Types/NavigationStackParamList';
import renderElement from 'App/Services/RenderElement';

import DirectConnectIcon from 'App/Images/Icons/directConnect.svg';
import CloudConnectIcon from 'App/Images/Icons/cloudConnect.svg';
import { useAppSelector, useMount, usePairingNavigation } from 'App/Hooks';
import { ConnectionType } from 'App/Types/ConnectionType';
import { showConfirm } from 'App/Services/Alert';

type Props = NativeStackScreenProps<PairingStackParamList, 'SelectConnect'>;

function SelectConnect({ route }: Props) {
  const navigation = usePairingNavigation('SelectConnect');
  const { user } = useAppSelector((state) => ({
    user: state.auth.user,
  }));

  const isCloudEnabled = !!user?.email;

  const navigate = useCallback(
    (connectionType: ConnectionType) => {
      if (!isCloudEnabled && connectionType === 'cloud') {
        showConfirm(
          'Log In',
          'You need to Log In with Goal Zero account to cloud connect.',
          () =>
            navigation.navigate('LoginNav', {
              ...route.params,
              connectionType: 'cloud',
              onSuccess: (params) => {
                navigation.navigate('SelectWifiNetwork', { ...route.params, ...params });
              },
            }),
          { confirmTitle: 'Continue' },
          undefined,
          true,
        );
        return;
      }

      const page =
        route.params?.dataTransferType === 'bluetooth'
          ? connectionType === 'cloud'
            ? 'SelectWifiNetwork'
            : 'ConnectYeti'
          : 'FindWifiNetwork';

      navigation.navigate(page, { ...route.params, connectionType });
    },
    [isCloudEnabled, navigation, route.params],
  );

  useMount(() => {
    if (route.params?.connectionType) {
      navigate(route.params.connectionType);
    }
  });

  return (
    <SafeAreaView edges={['bottom']} style={ApplicationStyles.mainContainer}>
      <Header title="Select Connection" onBackPress={() => navigation.navigate('AddNewDevice')} />
      <View style={ApplicationStyles.container}>
        <View style={ApplicationStyles.flex}>
          <ScrollView showsVerticalScrollIndicator={false}>
            <InfoRow
              withBorder={false}
              icon={renderElement(<CloudConnectIcon color={Colors.transparentWhite('0.6')} />)}
              title="Cloud Connect"
              subTitle={renderElement(
                <>
                  <Text style={styles.textSubTitle}>Best for home use</Text>
                  <Text style={styles.textSubTitle}>
                    Use Cloud Connect to set up your device through your internet network. This lets you control your
                    device from anywhere you have internet access, using your phone. It also allows feature updates.
                  </Text>
                </>,
              )}
              body={renderElement(
                <Text style={styles.textSubTitle}>
                  <Text style={{ color: Colors.portWarning }}>Note: </Text>Cloud Connect requires an internet connection
                  and Goal Zero log in.
                </Text>,
              )}
            />
            <InfoRow
              withBorder={false}
              style={styles.sectionTop}
              icon={renderElement(<DirectConnectIcon color={Colors.transparentWhite('0.6')} />)}
              title="Direct Connect"
              subTitle={renderElement(
                <>
                  <Text style={styles.textSubTitle}>Best for off-grid use</Text>
                  <Text style={styles.textSubTitle}>
                    Use Direct Connect to set up your device through Bluetooth. You will be able to control your device
                    from your phone when you are within 50 feet of the device.
                  </Text>
                </>,
              )}
              body={renderElement(
                <Text style={styles.textSubTitle}>
                  <Text style={{ color: Colors.portWarning }}>Note: </Text>Automatic feature updates are not available
                  through Direct Connect.
                </Text>,
              )}
            />
          </ScrollView>
        </View>
        <View style={styles.sectionButtons}>
          <Button testID="btnDirect" style={styles.btnLeft} inverse title="Direct" onPress={() => navigate('direct')} />
          <Button testID="btnCloud" style={styles.btnRight} title="Cloud" onPress={() => navigate('cloud')} />
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  sectionTop: {
    borderTopWidth: 0,
  },
  sectionButtons: {
    flexDirection: 'row',
    marginBottom: Metrics.smallMargin,
  },
  btnLeft: {
    flex: 1,
    marginRight: Metrics.smallMargin,
  },
  btnRight: {
    flex: 1,
    marginLeft: Metrics.smallMargin,
  },
  textSubTitle: {
    ...Fonts.font.base.caption,
    color: Colors.transparentWhite('0.87'),
    marginBottom: 4,
  },
});

export default SelectConnect;
