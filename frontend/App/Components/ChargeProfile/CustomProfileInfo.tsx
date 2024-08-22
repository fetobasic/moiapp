import React, { useRef, useCallback } from 'react';
import { View, StyleSheet, Text } from 'react-native';
import Svg, { Defs, LinearGradient, Rect, Stop } from 'react-native-svg';
import Animated, { useAnimatedProps, useAnimatedStyle } from 'react-native-reanimated';

import Battery from './Battery';
import { useMount } from 'App/Hooks';
import renderElement from 'App/Services/RenderElement';
import { ApplicationStyles, Colors, Fonts, Metrics } from 'App/Themes';
import { ChargeProfile as ChargeProfileSetupType } from 'App/Types/Yeti';
import {
  MAX_CHARGE_SCALE,
  MIN_ALLOWED_CHARGE_RECHARGE_DIFF,
  MIN_CHARGE_DISCHARGE_DIFF,
  MIN_CHARGE_SCALE,
} from 'App/Config/ChargingProfile';

// https://github.com/githuboftigran/rn-range-slider/issues/141
const RangeSlider = require('rn-range-slider').default;

const MIN_RECHARGE_POINT_VALUE = MIN_CHARGE_SCALE + MIN_ALLOWED_CHARGE_RECHARGE_DIFF;
const MAX_RECHARGE_POINT_VALUE = MAX_CHARGE_SCALE - MIN_ALLOWED_CHARGE_RECHARGE_DIFF;

const AnimatedSvg = Animated.createAnimatedComponent(Svg);
const AnimatedRect = Animated.createAnimatedComponent(Rect);

const Rail = ({ min, max }: { min: number; max: number }) => {
  const animatedSelectedRailProps = useAnimatedProps(() => ({ width: `${max - min}%` }));
  const animatedSelectedRailStyles = useAnimatedStyle(() => ({ left: `${min}%` }));

  return (
    <View style={styles.railContainer}>
      <View style={styles.railBackground} />

      <View style={styles.railBackgroundLines}>
        {Array.from({ length: 21 }, (_, i) => {
          const lineSizeStyle = {
            width: 1,
            height: i % 2 === 0 ? 24 : 16,
          };

          const firstLastValueStyles = i === 0 ? { left: -4 } : i === 20 ? { left: -10 } : {};

          return (
            <View key={i}>
              <View style={[styles.railBackgroundLine, lineSizeStyle]} />
              {i % 2 === 0 && (
                <Text style={[styles.sliderValueText, firstLastValueStyles]}>{Math.round(i / 2) * 10}%</Text>
              )}
            </View>
          );
        })}
      </View>

      <View style={styles.selectedRailContainer}>
        <AnimatedSvg style={[styles.selectedRail, animatedSelectedRailStyles]}>
          <Defs>
            <LinearGradient id="grad" x1="0" y1="0" x2="1" y2="0">
              <Stop offset="0" stopColor={'#D6DF7B'} stopOpacity="1" />
              <Stop offset="1" stopColor={'#BDCC2A'} stopOpacity="1" />
            </LinearGradient>
          </Defs>
          <AnimatedRect
            x="0"
            y="0"
            height="100%"
            fill="url(#grad)"
            width={`${max - min}%`}
            {...animatedSelectedRailProps}
          />
        </AnimatedSvg>
      </View>
    </View>
  );
};

type CustomProfileInfoProps = {
  setup: ChargeProfileSetupType;
  energy: number;
  onCustomProfileSetupChange: (setup: { min: number; re: number; max: number }) => void;
};

function CustomProfileInfo({ setup, energy, onCustomProfileSetupChange }: CustomProfileInfoProps) {
  const { min, max, re } = setup || {};
  const debounceTimer = useRef<NodeJS.Timeout | null>(null);

  useMount(() => {
    return () => {
      if (debounceTimer.current) {
        clearTimeout(debounceTimer.current);
      }
    };
  });

  const onMinMaxChange = useCallback(
    (minSelected: number, maxSelected: number, fromUser: boolean) => {
      if (!fromUser) {
        return;
      }

      let newSetup = {
        min: minSelected,
        max: maxSelected,
        re,
      };

      // shift recharge point if needed
      if (newSetup.min > re) {
        newSetup.re = newSetup.min;
      }
      if (newSetup.max <= re) {
        newSetup.re = Math.max(MIN_RECHARGE_POINT_VALUE, newSetup.max - MIN_ALLOWED_CHARGE_RECHARGE_DIFF);
      }

      onCustomProfileSetupChange(newSetup);
    },
    [re, onCustomProfileSetupChange],
  );

  const onRechargePointChange = useCallback(
    (value: number) => {
      const newRe = Math.round(value);

      if (newRe <= min) {
        return onCustomProfileSetupChange({
          min,
          max,
          re: Math.min(MAX_RECHARGE_POINT_VALUE, min + MIN_ALLOWED_CHARGE_RECHARGE_DIFF),
        });
      }

      if (newRe >= max) {
        return onCustomProfileSetupChange({
          min,
          max,
          re: Math.max(MIN_RECHARGE_POINT_VALUE, max - MIN_ALLOWED_CHARGE_RECHARGE_DIFF),
        });
      }

      return onCustomProfileSetupChange({ min, max, re: newRe });
    },
    [max, min, onCustomProfileSetupChange],
  );

  return (
    <View testID="customProfile">
      <View style={styles.sectionRow}>
        <View style={styles.legend}>
          <Battery min={min} max={max} re={re} />
          <View style={styles.legendContainer}>
            <View style={styles.legendItem}>
              <View style={[styles.dot, styles.backRed]} />
              <Text style={[styles.textLegend, styles.textRed]}>Minimum Discharge</Text>
            </View>
            <View style={[styles.legendItem]}>
              <View style={[styles.dot, styles.backBlue]} />
              <Text style={[styles.textLegend, styles.textBlue]}>Recharge Point</Text>
            </View>
            <View style={[styles.legendItem]}>
              <View style={[styles.dot, styles.backGreen]} />
              <Text style={[styles.textLegend, styles.textGreen]}>Maximum Charge</Text>
            </View>
          </View>
        </View>
      </View>

      <Text style={styles.accesibleEnergy}>
        <Text style={ApplicationStyles.textGreen}>{energy} Wh</Text> - Accessible Energy
      </Text>

      <View style={styles.sectionRow}>
        <View style={styles.paramInfo}>
          <Text style={styles.paramValue}>
            Min: <Text style={ApplicationStyles.textGreen}>{min}%</Text>
          </Text>
          <Text style={styles.paramValue}>
            Max: <Text style={ApplicationStyles.textGreen}>{max}%</Text>
          </Text>
        </View>

        <RangeSlider
          min={MIN_CHARGE_SCALE}
          max={MAX_CHARGE_SCALE}
          low={min}
          high={max}
          step={MIN_ALLOWED_CHARGE_RECHARGE_DIFF}
          minRange={MIN_CHARGE_DISCHARGE_DIFF}
          onValueChanged={onMinMaxChange}
          renderThumb={renderElement(<View style={styles.thumb} />)}
          renderRail={renderElement(<Rail min={min} max={max} />)}
          renderRailSelected={renderElement(<View />)}
        />
      </View>

      <View style={styles.slidersDivider} />

      <View style={styles.sectionRow}>
        <View style={styles.paramInfo}>
          <Text style={styles.paramValue}>Recharge Point</Text>
          <Text style={[styles.paramValue, styles.textBlue]}>{re}%</Text>
        </View>

        <RangeSlider
          disableRange
          min={MIN_CHARGE_SCALE}
          max={MAX_CHARGE_SCALE}
          low={re}
          high={max}
          step={MIN_ALLOWED_CHARGE_RECHARGE_DIFF}
          onValueChanged={onRechargePointChange}
          renderThumb={renderElement(<View style={styles.thumb} />)}
          renderRail={renderElement(<Rail min={min} max={max} />)}
          renderRailSelected={renderElement(<View />)}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  sectionRow: {
    borderTopColor: Colors.transparentWhite('0.12'),
    paddingVertical: Metrics.halfMargin,
    marginBottom: Metrics.smallMargin,
  },
  accesibleEnergy: {
    ...Fonts.font.base.bodyOne,
  },
  paramInfo: {
    marginTop: 4,
    marginBottom: Metrics.smallMargin,
    flexDirection: 'row',
    flex: 1,
    justifyContent: 'space-between',
    width: '100%',
  },
  paramValue: {
    ...Fonts.font.base.caption,
  },
  legend: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: Metrics.smallMargin,
  },
  legendBattery: {
    flex: 1,
  },
  legendContainer: {
    ...Fonts.font.base.caption,
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 4,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: Metrics.smallMargin,
  },
  backRed: {
    backgroundColor: Colors.portError,
  },
  textLegend: {
    ...Fonts.font.base.caption,
  },
  backBlue: {
    backgroundColor: Colors.blue,
  },
  backGreen: {
    backgroundColor: Colors.green,
  },
  textRed: {
    color: Colors.portError,
  },
  textBlue: {
    color: Colors.blue,
  },
  textGreen: {
    color: Colors.green,
  },
  sliderContainer: {
    marginVertical: Metrics.smallMargin,
  },
  sliderValueText: {
    ...Fonts.font.base.caption,
    position: 'absolute',
    height: 16,
    width: 30,
    top: 28,
    left: -8,
  },
  sliderValues: {
    flexDirection: 'row',
    width: Metrics.screenWidth * 0.85,
    justifyContent: 'space-around',
    top: Metrics.halfMargin,
    left: -4,
  },
  gradient: {
    borderColor: Colors.border,
  },
  railBackgroundLines: {
    position: 'absolute',
    width: '100%',
    height: '100%',
    alignItems: 'center',
    justifyContent: 'space-between',
    flexDirection: 'row',
  },
  railBackgroundSkipLine: {
    width: 1,
    height: 1,
  },
  railBackgroundLine: {
    backgroundColor: Colors.border,
  },
  railContainer: {
    height: 3,
    width: '100%',
  },
  railBackground: {
    height: 3,
    backgroundColor: Colors.border,
  },
  thumb: {
    width: 24,
    height: 24,
    borderRadius: 14,
    backgroundColor: Colors.green,
  },
  availableRechargePointRail: {
    height: 3,
    backgroundColor: Colors.green,
  },
  slidersDivider: {
    height: 1,
    top: Metrics.halfMargin,
    marginVertical: Metrics.smallMargin,
    backgroundColor: Colors.border,
  },
  selectedRailContainer: {
    position: 'absolute',
    overflow: 'hidden',
    width: '100%',
    top: 0,
    height: 3,
  },
  selectedRail: {
    top: 0,
    height: 3,
    width: '100%',
  },
});

export default CustomProfileInfo;
