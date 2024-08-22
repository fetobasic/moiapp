import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { Text, View, StyleSheet, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { NativeStackScreenProps } from '@react-navigation/native-stack';

import { Button, HeaderSimple as Header, Pressable, ProgressLoader, InfoRow } from 'App/Components';

import { ApplicationStyles, Colors, Fonts, Metrics } from 'App/Themes';
import { PairingStackParamList } from 'App/Types/NavigationStackParamList';
import { useAppDispatch, useAppSelector, useConnectToYeti, useHomeNavigation, useTimer } from 'App/Hooks';
import AppConfig from 'App/Config/AppConfig';
import renderElement from 'App/Services/RenderElement';
import UpdateIcon from 'App/Images/Icons/update.svg';

import { applicationActions } from 'App/Store/Application';
import { PairingIndicator } from 'App/Components/Pairing/PairingIndicator';
import { WithTopBorder } from 'App/Hoc';
import CheckCircle from 'App/Images/Icons/checkCircle.svg';
import SmallRedCross from 'App/Images/Icons/smallRedCross.svg';
import { Easing, useDerivedValue, withTiming } from 'react-native-reanimated';
import { firmwareUpdateActions } from 'App/Store/FirmwareUpdate';
import { Yeti6GState, YetiState } from 'App/Types/Yeti';
import { isLegacyYeti } from 'App/Services/Yeti';
import { isLatestVersion } from 'App/Services/FirmwareUpdates';
import { Bluetooth } from 'App/Containers/Home/HomeScreen';
import { deviceExists } from 'App/Services/Devices';
import { devicesActions } from 'App/Store/Devices';
import { DeviceType } from 'App/Types/Devices';
import { isLegacyThing } from 'App/Services/ThingHelper';
import { isFridge } from 'App/Hooks/useMapDrawerData';

type Props = NativeStackScreenProps<PairingStackParamList, 'ConnectYeti'>;

const NETWORK_CHECK_TITLES = {
  0: 'We were able to connect to the network.',
  1: 'A general or unknown error has occurred. Please try again.',
  2: 'The configured network was not found. Please try again.',
  3: 'The configured network requires a password or the password was incorrect. Please try again.',
};

function ConnectYeti({ route, navigation }: Props) {
  const { dataTransferType, connectionType, device, ssid, deviceType } = route.params as Props['route']['params'];
  const dispatch = useAppDispatch();
  const appNavigation = useHomeNavigation('StartPairing');
  const {
    isConnected,
    isPairingError,
    errorCode,
    clearError,
    thingName,
    networkCheckCode,
    connectionStatusText,
    isBleError,
  } = useConnectToYeti(route.params as Props['route']['params']);
  const { isShowOnboarding, devices, firmwareVersions, joinThingName } = useAppSelector((state) => ({
    devices: state.devicesInfo.data,
    firmwareVersions: state.firmwareUpdate.firmwareVersions,
    isShowOnboarding: state.application.isShowOnboarding,
    joinThingName: state.yetiInfo.joinData?.name,
  }));
  const isCloudConnection = connectionType === 'cloud';
  const isDeviceFridge = isFridge(deviceType);
  const [isCompleted, setIsCompleted] = useState(false);
  const currentDevice = useMemo(
    () => devices.find((item) => item.thingName === (thingName || joinThingName)),
    [devices, thingName, joinThingName],
  );

  const checkPairingTime = useMemo(
    () =>
      dataTransferType === 'bluetooth' ? AppConfig.checkPairingBluetoothTimeout : AppConfig.checkPairingWiFiTimeout,
    [dataTransferType],
  );

  const { seconds } = useTimer(checkPairingTime / 1000);
  const progress = useDerivedValue(() => ((checkPairingTime / 1000 - seconds) / (checkPairingTime / 1000)) * 100);

  const unpairThingHandler = () => {
    if (
      deviceExists(devices, joinThingName as string) &&
      (!isConnected || isPairingError) &&
      (!currentDevice?.name || !currentDevice?.model)
    ) {
      dispatch(devicesActions.unpair.request({ thingName: joinThingName || '' }));
    }
  };

  useEffect(() => {
    if (isConnected) {
      dispatch(applicationActions.setLastDevice(thingName));
      dispatch(
        firmwareUpdateActions.firmwareCheckUpdatesByType.request({
          deviceType: currentDevice?.deviceType as DeviceType,
          hostId: (currentDevice as Yeti6GState)?.device?.identity.hostId || '',
        }),
      );

      setTimeout(() => {
        setIsCompleted(true);
      }, 3000);
    }

    if (isConnected && progress.value < 100) {
      // @ts-ignore lib's error, probably fixed in next versions
      progress.value = withTiming(100, { duration: 3000, easing: Easing.linear });
    }
  }, [currentDevice, dispatch, isConnected, progress, thingName]);

  useEffect(() => {
    if (isPairingError) {
      setIsCompleted(true);
    }
  }, [isPairingError]);

  useEffect(() => {
    if (isShowOnboarding) {
      dispatch(applicationActions.changeOnboardingState(false));
    }
  }, [dispatch, isShowOnboarding]);

  const title = useMemo(() => {
    if (isBleError) {
      return 'Bluetooth Error';
    }
    if (isPairingError && !isConnected) {
      return errorCode ? 'Connection Error' : 'Connection Timed Out.';
    }
    return isCompleted && isConnected ? '' : `Connecting ${isDeviceFridge ? 'to device' : 'Yeti'}...`;
  }, [errorCode, isBleError, isCompleted, isConnected, isDeviceFridge, isPairingError]);

  const subTitle = useMemo(() => {
    if (isPairingError && !isConnected) {
      if (connectionType === 'direct') {
        return (
          <InfoRow
            icon={renderElement(<SmallRedCross />)}
            title="Error"
            subTitle="Unable to connect to device. Ensure local network traffic is allowed."
            withBorder={false}
          />
        );
      }

      const legacyYeti = isLegacyYeti(device?.name);

      const networkCheckTitle = legacyYeti
        ? NETWORK_CHECK_TITLES[1]
        : NETWORK_CHECK_TITLES[networkCheckCode as 0 | 1 | 2 | 3];

      const networkCheckIcon =
        !legacyYeti && networkCheckCode === 0 ? <CheckCircle color={Colors.green} /> : <SmallRedCross />;

      return (
        <>
          {isBleError ? (
            <InfoRow
              icon={renderElement(<SmallRedCross />)}
              title="Bluetooth"
              subTitle={renderElement(
                <Text style={styles.rowSubTitle}>
                  Unable to connect to Yeti. Ensure Yeti is in Pairing Mode and try again.
                </Text>,
              )}
              withBorder={false}
            />
          ) : (
            <>
              <InfoRow
                icon={renderElement(networkCheckIcon)}
                title="Network"
                subTitle={renderElement(<Text style={styles.rowSubTitle}>{networkCheckTitle}</Text>)}
                withBorder={false}
              />
              <InfoRow
                icon={renderElement(<SmallRedCross />)}
                title="Cloud"
                subTitle={renderElement(
                  <Text style={styles.rowSubTitle}>The device couldn't connect to the cloud. Please try again.</Text>,
                )}
                withBorder={false}
              />
            </>
          )}
        </>
      );
    }

    return (
      <>
        <Text style={styles.textSubTitle}>
          {isCompleted && isConnected
            ? `${device?.name || 'Device'} Connected!`
            : "Don't lock the device or switch apps\n while connecting.\n"}
        </Text>
        {isCloudConnection && (!isConnected || !isCompleted) && (
          <>
            <Text style={styles.textSubTitle}>{ssid}</Text>
            <Text style={styles.textSubTitle}>{connectionStatusText}</Text>
          </>
        )}
      </>
    );
  }, [
    connectionType,
    device?.name,
    isCloudConnection,
    isCompleted,
    isConnected,
    isPairingError,
    networkCheckCode,
    isBleError,
    ssid,
    connectionStatusText,
  ]);

  const onButtonPress = useCallback(() => {
    if (isCloudConnection && isConnected) {
      Bluetooth.disconnect(device?.id || '');
    }
    if (!isShowOnboarding) {
      navigation.popToTop();
      appNavigation.navigate('Home', { device: currentDevice });
    }
  }, [appNavigation, currentDevice, device?.id, isCloudConnection, isConnected, isShowOnboarding, navigation]);

  const headerTitle = connectionType?.[0].toUpperCase() + connectionType?.slice(1) + ' Connect';

  const showUpdateFirmware = useMemo(() => {
    const currentDeviceFirmwareVersion =
      (currentDevice as YetiState)?.firmwareVersion || (currentDevice as Yeti6GState)?.device?.fw;

    return (
      isCompleted &&
      isConnected &&
      !isPairingError &&
      (connectionType === 'cloud' || isLegacyThing(currentDevice?.thingName)) &&
      currentDeviceFirmwareVersion &&
      firmwareVersions?.[currentDevice?.deviceType || ''] &&
      !isLatestVersion(currentDeviceFirmwareVersion, firmwareVersions?.[currentDevice?.deviceType || '']?.[0])
    );
  }, [connectionType, currentDevice, firmwareVersions, isCompleted, isConnected, isPairingError]);

  return (
    <SafeAreaView edges={['bottom']} style={ApplicationStyles.mainContainer}>
      <Header
        title={headerTitle}
        onBackPress={() => {
          unpairThingHandler();
          if (route.params?.fromSettings || route.params?.skipConnectToWifi) {
            navigation.popToTop();
          } else {
            navigation.navigate('AddNewDevice');
          }
        }}
      />
      <ProgressLoader isFinished={isCompleted} time={checkPairingTime / 1000} />
      <View style={ApplicationStyles.container}>
        <ScrollView style={styles.scroll} showsVerticalScrollIndicator={false}>
          <View style={styles.sectionRadar}>
            <PairingIndicator
              device={{ thingName: device?.name }}
              isConnected={isConnected}
              isCompleted={isCompleted}
              progress={progress.value}
              connectionType={connectionType}
              dataTransferType={dataTransferType}
              isError={isPairingError}
              ssid={ssid}
            />
          </View>
          <Text style={styles.textTitle}>{title}</Text>

          {subTitle}

          {showUpdateFirmware && (
            <WithTopBorder containerStyle={styles.updateFirmwareContainer}>
              <View style={styles.updateFirmwareButton}>
                <View style={styles.updateIconSection}>
                  <UpdateIcon color={Colors.green} style={{ marginRight: Metrics.halfMargin }} />
                  <Text style={Fonts.font.base.bodyTwo}>Update Available</Text>
                </View>
                <Pressable
                  onPress={() => {
                    if (isCloudConnection && isConnected) {
                      Bluetooth.disconnect(device?.id || '');
                    }
                    const params = {
                      thingName:
                        (currentDevice as YetiState)?.thingName ||
                        (currentDevice as Yeti6GState)?.device?.identity?.thingName ||
                        '',
                      isUpdateAttention: false,
                      goBack: () => {
                        navigation.popToTop();
                        appNavigation.navigate('Home', { device: currentDevice });
                      },
                    };

                    navigation.navigate('UpdateFirmware', params);
                  }}>
                  <Text style={styles.install}>Go To Settings</Text>
                </Pressable>
              </View>
            </WithTopBorder>
          )}
        </ScrollView>
        {isCompleted && (
          <View style={styles.btnWrapper}>
            {isPairingError && !isConnected ? (
              <>
                <Button
                  title="Cancel"
                  onPress={() => {
                    unpairThingHandler();
                    appNavigation.navigate('Home', { device: currentDevice });
                  }}
                  inverse
                  style={styles.cancelBtn}
                />
                <Button
                  title="TRY AGAIN"
                  onPress={() => {
                    unpairThingHandler();
                    navigation.popToTop();
                    clearError();
                  }}
                  style={ApplicationStyles.flex}
                />
              </>
            ) : (
              <Button
                title="Continue"
                onPress={onButtonPress}
                showLoading={isShowOnboarding}
                style={ApplicationStyles.flex}
              />
            )}
          </View>
        )}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  radar: {
    marginTop: Metrics.baseMargin,
    alignSelf: 'center',
  },
  scroll: {
    flex: 1,
    marginBottom: 80,
  },
  textTitle: {
    ...Fonts.font.condensed.h3,
    marginTop: Metrics.baseMargin,
    alignSelf: 'center',
  },
  textSubTitle: {
    ...Fonts.font.base.bodyTwo,
    marginTop: 8,
    alignSelf: 'center',
    textAlign: 'center',
  },
  sectionCheck: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: Colors.green,
    justifyContent: 'center',
    alignItems: 'center',
    position: 'absolute',
    bottom: -15,
  },
  sectionRadar: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  imageSection: {
    position: 'absolute',
  },
  image: {
    width: 250,
    height: 250,
  },
  okBtn: {
    marginBottom: Metrics.marginSection,
    backgroundColor: Colors.background,
  },
  install: {
    ...Fonts.font.base.bodyTwo,
    color: Colors.green,
  },
  updateFirmwareButton: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 2,
    paddingHorizontal: 2,
  },
  btnWrapper: {
    alignSelf: 'center',
    position: 'absolute',
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: Metrics.smallMargin,
    paddingVertical: Metrics.smallMargin,
    backgroundColor: Colors.background,
    bottom: 0,
  },
  cancelBtn: {
    flex: 1,
    marginRight: Metrics.halfMargin,
  },
  rowSubTitle: {
    ...Fonts.font.base.caption,
    color: Colors.transparentWhite('0.87'),
  },
  updateIconSection: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  updateFirmwareContainer: {
    marginTop: Metrics.smallMargin,
  },
});

export default ConnectYeti;
