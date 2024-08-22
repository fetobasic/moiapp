import React, { useMemo } from 'react';
import { View, Text, ScrollView, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { activateKeepAwake, deactivateKeepAwake } from '@sayem314/react-native-keep-awake';
import { NativeStackScreenProps } from '@react-navigation/native-stack';

import { HeaderSimple as Header, Button, StartInfo, UsingWiFi, ScanedDevices, Pressable, Radar } from 'App/Components';
import { ApplicationStyles, Fonts, Metrics } from 'App/Themes';
import { useBluetooth, useMount, usePairingNavigation, useSettingsNavigation } from 'App/Hooks';
import renderElement from 'App/Services/RenderElement';

import ArrowBack from 'App/Images/Icons/arrowBack.svg';
import HelpIcon from 'App/Images/Icons/help.svg';
import { Bluetooth } from 'App/Containers/Home/HomeScreen';
import { PairingStackParamList } from 'App/Types/NavigationStackParamList';

type Props = NativeStackScreenProps<PairingStackParamList, 'AddNewDevice'>;

function AddNewDevice({ navigation, route }: Props) {
  const pairingNavigation = usePairingNavigation('AddNewDevice');
  const settingsNavigation = useSettingsNavigation('HelpNav');
  const isGoBackAfterLogin = useMemo(() => route.params?.goBackAfterLogin ?? false, [route.params?.goBackAfterLogin]);

  const {
    devices,
    buttonTitle,
    titleText,
    isCompleted,
    onButtonPress,
    isScanning,
    selectedDevice,
    setSelectedDevice,
    isButtonDisabled,
  } = useBluetooth();

  useMount(() => {
    Bluetooth.clearDiscoveredDevicesList();

    activateKeepAwake();

    return () => {
      Bluetooth.clearDiscoveredDevicesList();

      deactivateKeepAwake();
    };
  });

  const renderBody = () => {
    if (isCompleted) {
      return (
        <ScanedDevices
          selectedId={selectedDevice?.id ?? ''}
          onSelect={(id) => {
            const device = devices.find((item) => item.id === id);
            setSelectedDevice(device);
          }}
        />
      );
    }

    if (isScanning && titleText === 'Trouble with Bluetooth') {
      return <UsingWiFi />;
    }

    return <StartInfo />;
  };

  return (
    <SafeAreaView edges={['bottom']} style={ApplicationStyles.mainContainer}>
      <Header
        isModal
        title="Pair Device"
        leftIcon={renderElement(<ArrowBack />)}
        onBackPress={
          isGoBackAfterLogin
            ? () => {
                navigation.pop();
                navigation.goBack();
              }
            : undefined
        }
        rightSection={renderElement(
          <Pressable onPress={() => settingsNavigation.navigate('HelpNav')}>
            <HelpIcon />
          </Pressable>,
        )}
      />
      <View style={ApplicationStyles.container}>
        <ScrollView showsVerticalScrollIndicator={false}>
          <Radar
            isScanning={buttonTitle !== 'Scan for Devices' && buttonTitle !== 'Enable Bluetooth'}
            isCompleted={false}
            style={styles.radar}
            onPress={onButtonPress}
            disabled={buttonTitle !== 'Scan for Devices'}
          />
          <Text style={styles.textTitle}>{titleText}</Text>
          <View style={styles.sectionBody}>{renderBody()}</View>
        </ScrollView>
        <View style={styles.sectionButtons}>
          {titleText === 'Trouble with Bluetooth' && (
            <Button
              inverse
              title="Pair using device WiFi"
              onPress={() => {
                Bluetooth.stop();

                pairingNavigation.navigate('FindWifiNetwork', {
                  device: selectedDevice,
                  connectionType: 'direct',
                  dataTransferType: 'wifi',
                  deviceType: 'YETI',
                });
              }}
              style={styles.wifiBtn}
              textStyle={{ fontSize: Fonts.size.small }}
            />
          )}
          {buttonTitle !== 'Cancel' && (
            <Button
              style={[styles.mainBtn, buttonTitle === 'Scan Again' ? styles.btnScanAgain : {}]}
              disabled={isButtonDisabled}
              showLoading={isButtonDisabled}
              title={buttonTitle}
              onPress={onButtonPress}
              textStyle={{ fontSize: buttonTitle === 'Scan Again' ? Fonts.size.small : Fonts.size.medium }}
            />
          )}
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  radar: {
    marginTop: Metrics.marginSection,
    alignSelf: 'center',
  },
  textTitle: {
    ...Fonts.font.condensed.h3,
    marginTop: Metrics.halfMargin,
    alignSelf: 'center',
  },
  sectionBody: {
    marginTop: Metrics.marginSection,
  },
  mainBtn: {
    flex: 1,
    marginBottom: Metrics.smallMargin,
  },
  sectionButtons: {
    flexDirection: 'row',
    paddingTop: Metrics.marginSection,
  },
  btn: {
    flex: 1,
    marginBottom: Metrics.smallMargin,
  },
  btnScanAgain: {
    marginLeft: 4,
  },
  btnSection: {
    flexDirection: 'row',
  },
  wifiBtn: {
    flex: 1,
    marginRight: 4,
  },
});

export default AddNewDevice;
