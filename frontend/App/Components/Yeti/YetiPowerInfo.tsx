import React, { useMemo } from 'react';
import { View, Text, StyleSheet, ViewStyle } from 'react-native';

import { YetiState, Yeti6GState } from 'App/Types/Yeti';
import { Colors, Fonts, Metrics } from 'App/Themes';
import { isYeti6GThing } from 'App/Services/ThingHelper';
import { DeviceState } from 'App/Types/Devices';
import Pressable from 'App/Components/Pressable';
import { isLegacyYeti } from 'App/Services/Yeti';
import { getPowerInValue, getPowerOutValue } from 'App/Transforms/getPowerInfo';

type Props = {
  device: DeviceState;
  isWatts: boolean;
  setIsWatts: (isWatts: boolean) => void;
  powerIn?: boolean;
  style?: ViewStyle;
  isDisabled?: boolean;
};

function YetiPowerInfo({ device, isWatts, setIsWatts, powerIn, style, isDisabled }: Props) {
  const value: number = useMemo(() => {
    let _value;

    if (powerIn) {
      if (isYeti6GThing(device.thingName || '')) {
        // NOTE: FW less than 1.5.5 there appears to be a bug in the firmware that it stops reporting the correct state for the AC Input state when the AC input is in passthrough
        // so we depend on the AC Out state to determine the AC input watts
        const device6G = device as Yeti6GState;

        _value = getPowerInValue(device6G);
      } else {
        const deviceLegacy = device as YetiState;

        if (isWatts) {
          _value = deviceLegacy?.wattsIn || 0;
        } else {
          _value = deviceLegacy?.ampsIn || 0;
        }
      }
    } else {
      if (isYeti6GThing(device.thingName || '')) {
        const device6G = device as Yeti6GState;

        _value = getPowerOutValue(device6G);
      } else {
        const deviceLegacy = device as YetiState;

        if (isWatts) {
          _value = deviceLegacy?.wattsOut || 0;
        } else {
          _value = deviceLegacy?.ampsOut || 0;
        }
      }
    }

    return _value;
  }, [powerIn, device, isWatts]);

  const title = useMemo(() => (powerIn ? 'Power In' : 'Power Out'), [powerIn]);

  const textValueColor = useMemo(
    () => (device.isConnected && value > 0 ? Colors.green : Colors.transparentWhite('0.38')),
    [device.isConnected, value],
  );

  const Wrapper = useMemo(() => (isLegacyYeti(device.thingName) ? Pressable : View), [device.thingName]);

  return (
    <Wrapper
      style={style}
      onPress={() => {
        if (isLegacyYeti(device.thingName)) {
          setIsWatts(!isWatts);
        }
      }}>
      <View style={styles.container}>
        <Text style={[styles.textValue, { color: isDisabled ? Colors.disabled : textValueColor }]}>{`${value} ${
          isLegacyYeti(device.thingName) ? (isWatts ? 'W' : 'A') : 'W'
        }`}</Text>
        <Text style={[styles.textTitle, isDisabled ? styles.disabledTitle : styles.activeTitle]}>{title}</Text>
        {isLegacyYeti(device.thingName) && (
          <View style={styles.dotSection}>
            <View style={[styles.dot, isWatts && styles.dotSelected]} />
            <View style={[styles.dot, !isWatts && styles.dotSelected]} />
          </View>
        )}
      </View>
    </Wrapper>
  );
}

const styles = StyleSheet.create({
  container: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  textValue: {
    ...Fonts.font.base.bodyOne,
    color: Colors.green,
  },
  textTitle: {
    ...Fonts.font.base.caption,
    lineHeight: 20,
  },
  disabledTitle: {
    color: Colors.disabled,
  },
  activeTitle: {
    color: Colors.transparentWhite('0.87'),
  },
  dotSection: {
    flexDirection: 'row',
    marginTop: Metrics.smallMargin,
  },
  dot: {
    width: 4,
    height: 4,
    borderRadius: 2,
    backgroundColor: Colors.border,
    margin: 2,
  },
  dotSelected: {
    backgroundColor: Colors.transparentWhite('0.87'),
  },
  dotDisabled: {
    backgroundColor: Colors.disabled,
  },
});

export default YetiPowerInfo;
