import React, { useEffect } from 'react';
import { View, Animated, StyleSheet, ViewStyle } from 'react-native';

import BluetoothIcon from 'App/Images/Icons/bluetooth.svg';
import WiFiIcon from 'App/Images/Icons/wifiDark.svg';
import CheckIcon from 'App/Images/Icons/check.svg';
import Wave from 'App/Images/radarWave.svg';

import Pressable from './Pressable';
import { useRadar } from 'App/Hooks';
import { Colors } from 'App/Themes';

type Props = {
  style?: ViewStyle;
  disabled?: boolean;
  isScanning?: boolean;
  isCompleted?: boolean;
  hideCheckIcon?: boolean;
  onPress?: (isStarted: boolean) => void;
  isWiFi?: boolean;
};

function Radar({ style, onPress, hideCheckIcon, isScanning, disabled, isCompleted, isWiFi }: Props) {
  const { waveAngle, isStarted, dotOpacity, completeIconOpacity, start, stop, completed } = useRadar();

  useEffect(() => {
    if (isScanning) {
      start();
    } else {
      stop();
    }
  }, [isScanning, start, stop]);

  useEffect(() => {
    if (isCompleted) {
      completed();
    }
  }, [isCompleted, completed]);

  return (
    <View style={[styles.container, style]} testID="radar">
      <View style={styles.middleRadius}>
        <View style={styles.innerRadius}>
          <Animated.View
            style={[
              styles.sectionWave,
              {
                opacity: dotOpacity,
                transform: [
                  {
                    rotate: waveAngle.interpolate({
                      inputRange: [0, 1],
                      outputRange: ['0deg', '360deg'],
                    }),
                  },
                ],
              },
            ]}>
            <Wave />
          </Animated.View>
          <View style={[styles.center, styles.centerBackground]} />
          <Pressable
            disabled={disabled}
            style={styles.center}
            onPress={() => {
              onPress?.(isStarted);
              return isStarted ? stop() : start();
            }}>
            <Animated.View
              style={[
                styles.icon,
                {
                  opacity: completeIconOpacity.interpolate({
                    inputRange: [0, 1],
                    outputRange: [1, 0],
                  }),
                },
              ]}>
              {isWiFi ? <WiFiIcon testID="wifiIcon" /> : <BluetoothIcon color={Colors.dark} />}
            </Animated.View>
            {!hideCheckIcon && (
              <Animated.View style={(styles.icon, { opacity: completeIconOpacity })}>
                <CheckIcon color={Colors.transparentWhite('0.87')} />
              </Animated.View>
            )}
          </Pressable>
        </View>
      </View>
    </View>
  );
}

const CONTAINER_SIZE = 272;
const MIDLE_RADIUS_SIZE = 208;
const INNER_RADIUS_SIZE = 144;
const CENTER_SIZE = 80;

const styles = StyleSheet.create({
  container: {
    width: CONTAINER_SIZE,
    height: CONTAINER_SIZE,
    borderRadius: CONTAINER_SIZE / 2,
    borderWidth: 2,
    borderColor: Colors.devicesHubRowBackground,
    borderStyle: 'dashed',
    justifyContent: 'center',
    alignItems: 'center',
  },
  middleRadius: {
    width: MIDLE_RADIUS_SIZE,
    height: MIDLE_RADIUS_SIZE,
    borderRadius: MIDLE_RADIUS_SIZE / 2,
    borderWidth: 2,
    borderColor: Colors.devicesHubRowBackground,
    justifyContent: 'center',
    alignItems: 'center',
  },
  innerRadius: {
    width: INNER_RADIUS_SIZE,
    height: INNER_RADIUS_SIZE,
    borderRadius: INNER_RADIUS_SIZE / 2,
    borderWidth: 2,
    borderColor: Colors.devicesHubRowBackground,
    justifyContent: 'center',
    alignItems: 'center',
  },
  center: {
    width: CENTER_SIZE,
    height: CENTER_SIZE,
    borderRadius: CENTER_SIZE / 2,
    backgroundColor: Colors.green,
    justifyContent: 'center',
    alignItems: 'center',
  },
  centerBackground: {
    position: 'absolute',
    backgroundColor: Colors.devicesHubRowBackground,
  },
  sectionWave: {
    position: 'absolute',
    alignItems: 'flex-end',
    width: CONTAINER_SIZE,
    height: CONTAINER_SIZE,
  },
  icon: {
    position: 'absolute',
  },
});

export default Radar;
