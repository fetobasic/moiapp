import React, { useState } from 'react';
import { View, Text, StyleSheet } from 'react-native';

import { YetiState, Yeti6GState, PortStatus } from 'App/Types/Yeti';
import { ApplicationStyles, Colors, Fonts, Metrics } from 'App/Themes';
import { YetiBatteryLevel, YetiTemperatureLevel, YetiPowerInfo } from 'App/Components';
import { minsToFormattedTime } from 'App/Transforms/minsToFormattedTime';
import { isLegacyYeti } from 'App/Services/Yeti';
import { getBatteryLevels } from 'App/Transforms/getBatteryLevels';
import { DeviceState } from 'App/Types/Devices';

type YetiDeviceSettingsProps = {
  device: DeviceState;
  isDisabled?: boolean;
};

function YetiDeviceSettings({ device, isDisabled }: YetiDeviceSettingsProps) {
  const [isWatts, setIsWatts] = useState(true);

  const yetiLegacy = device as YetiState;
  const yeti6G = device as Yeti6GState;

  const {
    padding: minPadding,
    rotation: minRotation,
    textRotation: minTextRotation,
  } = getBatteryLevels(yetiLegacy?.chargeProfile?.min || yeti6G?.config?.chgPrfl?.min || 0);
  const {
    padding: maxPadding,
    rotation: maxRotation,
    textRotation: maxTextRotation,
  } = getBatteryLevels(yetiLegacy?.chargeProfile?.max || yeti6G?.config?.chgPrfl?.max || 100);

  let ttef = yeti6G?.status?.batt?.mTtef || yetiLegacy.timeToEmptyFull || 0;
  const isDCOn: boolean =
    [PortStatus.Detected, PortStatus.Charging].includes((device as Yeti6GState)?.status?.ports?.hvDcIn?.s) ||
    [PortStatus.Detected, PortStatus.Charging].includes((device as Yeti6GState)?.status?.ports?.lvDcIn?.s);
  const isACOn: boolean = [PortStatus.Detected, PortStatus.Charging].includes(
    (device as Yeti6GState)?.status?.ports?.acIn?.s,
  );

  let mTtefTitle = 'Time to Full';
  if (isLegacyYeti(device.thingName)) {
    mTtefTitle =
      device?.isConnected && !(device as YetiState)?.isCharging && ttef > 0 ? 'Time to Empty' : 'Time to Full';
    if (ttef === -1) {
      // -1 means idle for legacy yetis
      ttef = 0;
    }
  } else {
    const battStatus = (device as unknown as Yeti6GState)?.status?.batt;
    const isCharging = battStatus?.WNetAvg > 0 || battStatus?.wNetAvg > 0 || Boolean((device as YetiState)?.isCharging);
    const isDischarging =
      battStatus?.WNetAvg < 0 || battStatus?.wNetAvg < 0 || Boolean(((device as YetiState)?.wattsOut || 0) > 0);

    if (!isCharging && !isDischarging) {
      mTtefTitle = 'Idle';
    } else {
      mTtefTitle = isCharging ? 'Time to Full' : 'Time to Empty';
    }
  }
  const [days, hours, minutes] = minsToFormattedTime(ttef);

  return (
    <View>
      <YetiBatteryLevel
        min={(device as YetiState)?.chargeProfile?.min || (device as Yeti6GState)?.config?.chgPrfl?.min || 0}
        socPercent={(device as YetiState)?.socPercent || (device as Yeti6GState)?.status?.batt?.soc || 0}
        isCharging={
          (device as Yeti6GState)?.status?.batt?.WNetAvg > 1 ||
          (device as Yeti6GState)?.status?.batt?.wNetAvg > 1 ||
          (device as Yeti6GState)?.status?.ports?.acIn?.w > 1 ||
          (device as Yeti6GState)?.status?.ports?.lvDcIn?.w > 1 ||
          (device as Yeti6GState)?.status?.ports?.hvDcIn?.w > 1 ||
          (device as Yeti6GState)?.status?.ports?.aux?.w > 1 ||
          Boolean((device as YetiState)?.isCharging)
        }
        isConnected={Boolean(device?.isConnected)}
        isDisabled={isDisabled}
      />
      {isDisabled ? (
        <View style={styles.emptyBlock} />
      ) : (
        <YetiTemperatureLevel
          level={
            (device as YetiState)?.temperature ||
            (device as Yeti6GState)?.status?.batt?.cHtsTmp ||
            (device as Yeti6GState)?.status?.batt?.cTmp ||
            50
          }
        />
      )}

      <View style={styles.sectionLevels}>
        <View
          style={[
            styles.profileLevel,
            {
              transform: [
                {
                  rotate: `${minRotation}deg`,
                },
                {
                  translateX: minPadding,
                },
              ],
            },
          ]}>
          <View style={styles.sectionLevel}>
            <Text
              style={[
                styles.profileLevelText,
                isDisabled ? styles.disabledText : styles.activeProfileText,
                {
                  transform: [
                    {
                      rotate: `${minTextRotation}deg`,
                    },
                  ],
                },
              ]}>
              Min
            </Text>
            <View style={styles.levelLine} />
          </View>
        </View>
        <View
          style={[
            styles.profileLevel,
            {
              transform: [
                {
                  rotate: `${maxRotation}deg`,
                },
                {
                  translateX: maxPadding,
                },
              ],
            },
          ]}>
          <View style={styles.sectionLevel}>
            <Text
              style={[
                styles.profileLevelText,
                styles.profileLevelTextMax,
                isDisabled ? styles.disabledText : styles.activeProfileText,
                {
                  transform: [
                    {
                      rotate: `${maxTextRotation}deg`,
                    },
                  ],
                },
              ]}>
              Max
            </Text>
            <View style={styles.levelLine} />
          </View>
        </View>
      </View>

      <View style={styles.sectionInfo}>
        <View style={styles.sectionRow}>
          {!isLegacyYeti(device.thingName) && (
            <View style={styles.labelSection}>
              <Text style={[styles.label, isDCOn && styles.labelActive, isDisabled && styles.disabledText]}>DC</Text>
              <Text style={[styles.label, isACOn && styles.labelActive, isDisabled && styles.disabledText]}>AC</Text>
            </View>
          )}
          <YetiPowerInfo isWatts={isWatts} setIsWatts={setIsWatts} device={device} isDisabled={isDisabled} powerIn />
        </View>

        <View style={ApplicationStyles.flex}>
          <Text
            style={[styles.textTime, { color: device.isConnected ? Colors.white : Colors.transparentWhite('0.38') }]}>
            {device.isConnected && Boolean(ttef) && mTtefTitle !== 'Idle'
              ? `${days > 0 ? `${days}d ` : ''}${hours > 0 ? `${hours}h` : ''}${days > 0 ? '' : ` ${minutes}m`}`
              : '— — —'}
          </Text>
          <Text style={[styles.textTime, isDisabled ? styles.disabledText : styles.activeTimeText]}>{mTtefTitle}</Text>
        </View>

        <YetiPowerInfo
          isWatts={isWatts}
          setIsWatts={setIsWatts}
          style={styles.sectionRow}
          device={device}
          isDisabled={isDisabled}
          powerIn={false}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  sectionInfo: {
    flexDirection: 'row',
    marginTop: Metrics.halfMargin,
    justifyContent: 'space-between',
    alignSelf: 'center',
    width: 360,
  },
  emptyBlock: {
    height: 20,
  },
  sectionRow: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  textTime: {
    ...Fonts.font.base.caption,
    lineHeight: 20,
    textAlign: 'center',
  },
  activeTimeText: {
    color: Colors.transparentWhite('0.87'),
  },
  sectionLevels: {
    height: 122 * 2,
    top: 28,
    position: 'absolute',
  },
  textLevel: {
    ...Fonts.font.base.h1,
    fontSize: 56,
    lineHeight: 56,
    color: Colors.green,
    position: 'absolute',
    bottom: 0,
    alignSelf: 'center',
  },
  profileLevel: {
    position: 'absolute',
    height: 122 * 2,
    width: 156 * 2,
    left: (Metrics.screenWidth - 260) / 2 - 26,
    bottom: 0,
    justifyContent: 'center',
  },
  sectionLevel: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  profileLevelText: {
    ...Fonts.font.base.caption,
    marginRight: 5,
  },
  profileLevelTextMax: {
    marginRight: 2,
  },
  activeProfileText: {
    color: Colors.transparentWhite('0.87'),
  },
  levelLine: {
    width: 24,
    height: 2,
    backgroundColor: Colors.white,
    borderRadius: 1,
  },
  labelSection: {
    position: 'absolute',
    left: Metrics.halfMargin,
  },
  label: {
    ...Fonts.font.base.caption,
    lineHeight: 20,
    textAlign: 'center',
    color: Colors.transparentWhite('0.38'),
  },
  disabledText: {
    color: Colors.disabled,
  },
  labelActive: {
    color: Colors.green,
  },
});

export default YetiDeviceSettings;
