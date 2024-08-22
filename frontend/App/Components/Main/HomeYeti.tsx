import React, { useCallback } from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import semver from 'semver';
import {
  YetiDeviceSettings,
  YetiOutputPorts,
  YetiEnergy,
  YetiChargeProfile,
  YetiAccessories,
  ConnectionInfo,
} from 'App/Components';

import { ApplicationStyles, Colors, Fonts, isIOS, Metrics } from 'App/Themes';
import { Yeti6GState, YetiState } from 'App/Types/Yeti';
import { isModelX, isLegacyYeti } from 'App/Services/Yeti';
import { useAppSelector, useHomeNavigation } from 'App/Hooks';
import { WithTopBorder } from 'App/Hoc';
import { YetiInputPorts } from 'App/Components/Yeti/YetiInputPorts';
import {
  getYetiThingName,
  isYeti300500700,
  isYeti2000,
  isYeti10001500,
  isYeti6GThing,
  isYeti4000,
} from 'App/Services/ThingHelper';
import { showReconnect } from 'App/Services/Alert';
import { getCurrentDevice } from 'App/Store/Devices/selectors';
import AppConfig from 'App/Config/AppConfig';
import { DeviceState } from 'App/Types/Devices';
import { FridgeState } from 'App/Types/Fridge';

import PowerIcon from 'App/Images/Icons/power.svg';

function HomeYeti(_device: Exclude<DeviceState, FridgeState>) {
  const navigation = useHomeNavigation('Home');
  const device: DeviceState = useAppSelector(getCurrentDevice(getYetiThingName(_device)));

  const { isConnected, isDirectConnection } = device;
  const renderNotificationBanner = () => <ConnectionInfo device={device} hideWhenConnected />;
  const isDisabled = !isConnected;

  const showEnergyHistory =
    !isYeti300500700(device) &&
    ((isLegacyYeti(device?.thingName) && isModelX((device as YetiState)?.model)) ||
      (isYeti4000(device) &&
        semver.gte((device as Yeti6GState)?.device?.fw || '0.0.0', AppConfig.minFirmwareVersionY6gY4kEnergyHistory)) ||
      isYeti2000(device) ||
      isYeti10001500(device));

  const showPortsCover = (device as Yeti6GState)?.status?.btn?.pwr === 0;

  const goToStartPairing = useCallback(() => {
    setTimeout(
      () => {
        navigation.navigate('StartPairing', {
          reconnect: true,
          connectionType: isDirectConnection ? 'direct' : 'cloud',
        });
      },
      // iOS needs a delay to avoid navigation issues
      isIOS ? AppConfig.smallDelay : 0,
    );
  }, [isDirectConnection, navigation]);

  const goToChargeProfile = useCallback(() => {
    if (isDisabled) {
      showReconnect(goToStartPairing);
    } else {
      navigation.navigate('ChargeProfile', { device });
    }
  }, [device, goToStartPairing, isDisabled, navigation]);

  const goToBattery = useCallback(() => {
    if (isDisabled) {
      showReconnect(goToStartPairing);
    } else {
      navigation.navigate('BatteryScreen', { device });
    }
  }, [device, goToStartPairing, isDisabled, navigation]);

  const goToEnergyHistory = useCallback(() => {
    navigation.navigate('EnergyInfo', { device });
  }, [device, navigation]);

  return (
    <View testID="homeYeti" style={ApplicationStyles.flex}>
      <ScrollView style={ApplicationStyles.flex}>
        {renderNotificationBanner()}

        <YetiDeviceSettings isDisabled={isDisabled} device={device} />

        {((device as Yeti6GState)?.model?.startsWith('Y6G') ||
          isYeti6GThing((device as Yeti6GState)?.device?.identity?.thingName || '')) && (
          <YetiInputPorts isDisabled={isDisabled} device={device as Yeti6GState} />
        )}

        <WithTopBorder containerStyle={styles.sectionDeviceInfo} contentStyle={styles.sectionPadding}>
          <YetiOutputPorts isDisabled={isDisabled} device={device} />
          {showPortsCover && (
            <View style={[styles.sectionPortsCover, isDisabled && styles.disabledBackground]}>
              <PowerIcon
                width={38}
                height={38}
                color={isDisabled ? Colors.disabled : Colors.transparentWhite('0.87')}
              />
              <Text style={[styles.textPower, isDisabled && styles.disabledText]}>Power switch is off</Text>
              <Text style={[styles.textPowerDescription, isDisabled && styles.disabledText]}>
                Output ports cannot be enabled when the power switch is in the off position
              </Text>
            </View>
          )}
        </WithTopBorder>

        {isModelX((device as YetiState).model) ||
        (device as Yeti6GState)?.model?.startsWith('Y6G') ||
        isYeti6GThing(getYetiThingName(device)) ? (
          <>
            <WithTopBorder containerStyle={styles.sectionDeviceInfo} contentStyle={styles.sectionPadding}>
              <YetiChargeProfile isDisabled={isDisabled} device={device} onPress={goToChargeProfile} />
            </WithTopBorder>
            <WithTopBorder containerStyle={styles.sectionDeviceInfo} contentStyle={styles.sectionPadding}>
              <YetiAccessories isDisabled={isDisabled} testID="homeBattery" device={device} onPress={goToBattery} />
            </WithTopBorder>
            {showEnergyHistory && (
              <WithTopBorder containerStyle={styles.sectionDeviceInfo} contentStyle={styles.sectionPadding}>
                <YetiEnergy onPress={goToEnergyHistory} />
              </WithTopBorder>
            )}
          </>
        ) : (
          <WithTopBorder containerStyle={styles.sectionDeviceInfo} contentStyle={styles.sectionPadding}>
            <YetiAccessories isDisabled={isDisabled} device={device} onPress={goToBattery} />
          </WithTopBorder>
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  sectionDeviceInfo: {
    marginHorizontal: Metrics.baseMargin,
    marginTop: Metrics.marginSection,
  },
  sectionPadding: {
    paddingVertical: Metrics.smallMargin,
    paddingHorizontal: Metrics.smallMargin,
  },
  sectionPortsCover: {
    position: 'absolute',
    top: 1,
    left: 1,
    right: 1,
    bottom: 0,
    borderRadius: 8,
    backgroundColor: Colors.dark,
    opacity: 0.94,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: Metrics.baseMargin,
  },
  textPower: {
    ...Fonts.font.base.bodyOne,
    marginTop: Metrics.smallMargin,
  },
  textPowerDescription: {
    ...Fonts.font.base.caption,
    textAlign: 'center',
    marginTop: 20,
  },
  disabledText: {
    color: Colors.disabled,
  },
  disabledBackground: {
    backgroundColor: Colors.background,
  },
});

export default HomeYeti;
