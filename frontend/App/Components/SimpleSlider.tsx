import React from 'react';
import { View, StyleSheet } from 'react-native';
import { Defs, LinearGradient, Rect, Stop, Svg } from 'react-native-svg';
import { Colors, Metrics } from 'App/Themes';

const WIDTH = Metrics.screenWidth - Metrics.baseMargin * 2 - Metrics.marginSection * 2;

type Props = {
  value?: number;
  min?: number;
  max?: number;
  isDisabled?: boolean;
};

function SimpleSlider({ value, min, max, isDisabled }: Props) {
  const paddingLeft = (WIDTH * (min || 0)) / 100;
  const valueWidth = (WIDTH * (value || 1)) / 100 - paddingLeft;
  const maxValue = (WIDTH * (max || 0)) / 100;
  const showMin = min === 0 || !!min;

  return (
    <View style={styles.container}>
      <View style={styles.sectorsContainer}>
        {showMin && (
          <View
            style={[
              styles.minSector,
              isDisabled ? styles.disabledText : styles.activeGreenText,
              { width: paddingLeft },
            ]}
          />
        )}

        <View style={[styles.valueSector, { left: paddingLeft }]}>
          <Svg height="100%" width={valueWidth}>
            <Defs>
              <LinearGradient id="grad" x1="0" y1="0" x2="1" y2="0">
                <Stop offset="0" stopColor={isDisabled ? Colors.disabled : '#D6DF7B'} stopOpacity="1" />
                <Stop offset="1" stopColor={isDisabled ? Colors.disabled : '#BDCC2A'} stopOpacity="1" />
              </LinearGradient>
            </Defs>
            <Rect height="100%" width={valueWidth} x="0" y="0" fill="url(#grad)" />
          </Svg>
        </View>
      </View>

      {showMin && (
        <View style={[styles.line, isDisabled ? styles.disabledText : styles.activeText, { left: paddingLeft }]} />
      )}
      {!!max && (
        <View style={[styles.line, isDisabled ? styles.disabledText : styles.activeText, { left: maxValue }]} />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    height: 16,
    justifyContent: 'center',
    width: WIDTH,
  },
  sectorsContainer: {
    position: 'absolute',
    overflow: 'hidden',
    backgroundColor: Colors.border,
    height: 3,
    width: WIDTH,
  },
  minSector: {
    position: 'absolute',
    height: 3,
    opacity: 0.4,
  },
  valueSector: {
    height: 3,
  },
  line: {
    position: 'absolute',
    height: 16,
    width: 1,
  },
  activeText: {
    backgroundColor: Colors.transparentWhite('0.87'),
  },
  activeGreenText: {
    backgroundColor: Colors.green,
  },
  disabledText: {
    backgroundColor: Colors.disabled,
  },
  valueLine: {
    position: 'absolute',
    height: 24,
    width: 4,
    borderRadius: 2,
  },
});

export default SimpleSlider;
