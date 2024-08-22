import React from 'react';
import { Text, View, StyleSheet } from 'react-native';
import { Colors, Fonts } from 'App/Themes';

import { Yeti6GState, YetiState } from 'App/Types/Yeti';
import { isFridge, isYeti } from 'App/Hooks/useMapDrawerData';
import { minsToFormattedTime } from 'App/Transforms/minsToFormattedTime';
import { DeviceState } from 'App/Types/Devices';
import { FridgeState, FridgeUnits } from 'App/Types/Fridge';

type Props = { device: DeviceState };

function getTimeString(days: number, hours: number, minutes: number, isCharging: boolean, isDischarging: boolean) {
  if (!isCharging && !isDischarging) {
    return '';
  }
  if (days === 0 && hours === 0 && minutes === 0) {
    return '';
  }
  if (days > 0) {
    return ` - ${days} days`;
  }
  if (hours > 0) {
    hours += minutes > 30 ? 1 : 0;
    return ` - ${hours === 1 ? `${hours} hour` : `${hours} hours`}`;
  }
  if (minutes > 10) {
    return ` - ${Math.ceil(minutes / 5) * 5} minutes`;
  } else if (minutes > 0) {
    return ` - ${10} minutes`;
  }
  return '';
}

function renderSecondaryText(
  soc: number,
  isConnected: boolean,
  days: number,
  hours: number,
  minutes: number,
  isCharging: boolean,
  isDischarging: boolean,
) {
  if (!isConnected) {
    return ' - Disconnected';
  }
  if (!isCharging && !isDischarging) {
    if (soc === 0) {
      return ' - Empty';
    }
    return ' - Idle';
  }
  return `${getTimeString(days, hours, minutes, isCharging, isDischarging)} to ${isCharging ? 'full' : 'empty'}`;
}

function DeviceStatusInfo({ device }: Props) {
  const isConnected = Boolean(device.isConnected);
  if (isFridge(device.deviceType)) {
    const fridgeState = device as FridgeState;
    const isAlta80 = fridgeState.deviceType === 'ALTA_80_FRIDGE';
    const unitString = fridgeState?.data?.units === FridgeUnits.FAHRENHEIT ? '°F' : '°C';
    const textStyle = isConnected ? styles.successStatusText : styles.disconnectedStatusText;

    return (
      <View testID="deviceStatusInfoFridge" style={styles.fridgeTempSection}>
        <Text style={textStyle}>
          {fridgeState.data.leftTempActual}
          {unitString}
        </Text>
        {isAlta80 && (
          <Text style={textStyle}>
            {' '}
            / {fridgeState.data.rightTempActual}
            {unitString}
          </Text>
        )}
      </View>
    );
  }

  if (isYeti(device)) {
    const battStatus = (device as unknown as Yeti6GState)?.status?.batt;
    const soc = (device as YetiState)?.socPercent || battStatus?.soc || 0;
    const isCharging = battStatus?.WNetAvg > 0 || battStatus?.wNetAvg > 0 || Boolean((device as YetiState).isCharging);
    const isDischarging =
      battStatus?.WNetAvg < 0 || battStatus?.wNetAvg < 0 || Boolean(((device as YetiState).wattsOut || 0) > 0);
    const timeToEmpty = (device as YetiState)?.timeToEmptyFull || battStatus?.mTtef;
    const [days, hours, minutes] = minsToFormattedTime(timeToEmpty);

    const isEmpty = soc === 0;
    return (
      <Text
        testID="deviceStatusInfoYeti"
        numberOfLines={1}
        ellipsizeMode="tail"
        style={
          isConnected ? (isEmpty ? styles.emptyStatusText : styles.successStatusText) : styles.disconnectedStatusText
        }>
        {`${soc}%`}
        {renderSecondaryText(soc, isConnected, days, hours, minutes, isCharging, isDischarging)}
      </Text>
    );
  }

  return null;
}

const styles = StyleSheet.create({
  successStatusText: {
    ...Fonts.font.base.caption,
    color: Colors.green,
  },
  emptyStatusText: {
    ...Fonts.font.base.caption,
    color: Colors.red,
  },
  disconnectedStatusText: {
    ...Fonts.font.base.caption,
    color: Colors.gray,
  },
  fridgeTempSection: {
    flexDirection: 'row',
    marginTop: 4,
  },
});

export default DeviceStatusInfo;
