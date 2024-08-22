import React from 'react';
import { View, StyleSheet, Text } from 'react-native';

import { ApplicationStyles, Colors, Fonts } from 'App/Themes';
import { MIN_CHARGE_SCALE, MAX_CHARGE_SCALE } from 'App/Config/ChargingProfile';
import renderElement from 'App/Services/RenderElement';
import Button from './Button';
import ArrowIcon from 'App/Images/Icons/arrowRight.svg';

// https://github.com/githuboftigran/rn-range-slider/issues/141
const { default: RangeSlider } = require('rn-range-slider');

type Props = {
  min?: number;
  max?: number;
  step?: number;
  disabled?: boolean;
  low?: number;
  disableRange?: boolean;
  showMarks?: boolean;
  markStep?: number;
  markValue?: string;
  markStart?: number;
  minLimit?: number;
  maxLimit?: number;
  useFloat?: boolean;
  showButtons?: boolean;
  mainColor?: string;
  minLimitColor?: string;
  twoMaxLimit?: boolean;
  onValueChanged?: (low: number, high: number, byUser: boolean) => void;
  handleButtonPress?: (value: number) => void;
};

function StyledRangeSlider({
  min = MIN_CHARGE_SCALE,
  max = MAX_CHARGE_SCALE,
  step = 1,
  disabled = false,
  low,
  disableRange,
  showMarks,
  markStep = 3,
  markValue,
  markStart,
  useFloat,
  minLimit,
  maxLimit,
  showButtons,
  handleButtonPress,
  mainColor = Colors.green,
  minLimitColor = Colors.blue,
  twoMaxLimit,
  ...otherProps
}: Props & Partial<any>) {
  const colors = disabled
    ? {
        selectionColor: Colors.disabled,
        thumbColor: Colors.disabled,
        thumbBorderColor: Colors.disabled,
      }
    : {
        selectionColor: Colors.sliderSelected,
        thumbColor: mainColor,
        thumbBorderColor: mainColor,
      };

  const [rangeWidth, setRangeWidth] = React.useState<number>(0);

  const markDeviation = markStart !== undefined ? markStart - min + 1 : 0;
  const marksCount = (max - min + (useFloat ? 0.1 : 1)) * (useFloat ? 10 : 1);

  return (
    <View style={[styles.container, showMarks && styles.heightWithMarks]}>
      {showButtons && (
        <Button
          testID="styledRangeSliderLeftButton"
          inverse
          height={32}
          title=""
          disabled={twoMaxLimit ? low === 0 : low === minLimit}
          icon={
            <ArrowIcon
              style={[
                { transform: [{ rotate: '180deg' }] },
                (twoMaxLimit ? low === 0 : low === minLimit) && styles.disabled,
              ]}
            />
          }
          style={styles.btn}
          mainSectionStyle={styles.btnSectionLeft}
          onPress={() => {
            if ((low ?? min) <= min) {
              return;
            }

            let value = (low ?? min) - step;

            if (minLimit && value < (twoMaxLimit ? 0 : minLimit)) {
              value = twoMaxLimit ? 0 : minLimit;
            }

            handleButtonPress?.(value);
          }}
        />
      )}
      <View style={ApplicationStyles.flex}>
        <RangeSlider
          testID="styledRangeSlider"
          min={min}
          max={max}
          low={low}
          step={step}
          disabled={disabled}
          disableRange={disableRange}
          onLayout={({ nativeEvent }: { nativeEvent: { layout: { width: number } } }) => {
            if (nativeEvent?.layout?.width) {
              setRangeWidth(nativeEvent.layout.width);
            }
          }}
          renderThumb={renderElement(
            <View
              style={[styles.thumb, { backgroundColor: colors.thumbColor, borderColor: colors.thumbBorderColor }]}
            />,
          )}
          renderRail={renderElement(
            <View
              style={[
                styles.rail,
                { backgroundColor: Colors.border },
                disableRange ? styles.fullWidthRail : { width: `${100 - low!}%` },
              ]}
            />,
          )}
          renderRailSelected={renderElement(
            <View
              style={[
                styles.rail,
                { backgroundColor: mainColor },
                disableRange ? styles.fullWidthRail : { width: `${100 - low!}%` },
              ]}
            />,
          )}
          {...otherProps}
        />
        {showMarks && (
          <>
            <View style={styles.marksWrapper}>
              {Array.from({ length: marksCount }, (_, i) => {
                const key = useFloat ? i / 10 : i;
                const isShow = key === 0 || (key * 10 + markDeviation) % (markStep * 10) === 0;
                const position = (((rangeWidth || 295) - 24) / marksCount) * (i + 1);

                if (!isShow && key === minLimit) {
                  return (
                    <View style={[styles.singleMarkWrapper, { left: position }, styles.markSolid]}>
                      <View style={[styles.mark, styles.markMinLimit, { backgroundColor: minLimitColor }]} />
                      <Text style={[Fonts.font.base.caption, styles.hide]}>
                        {key + min} {markValue}
                      </Text>
                    </View>
                  );
                }

                if (!isShow && key === maxLimit && max !== maxLimit) {
                  return (
                    <View style={[styles.singleMarkWrapper, { left: position }, styles.markSolid]}>
                      <View style={[styles.mark, styles.markMaxLimit]} />
                      <Text style={[Fonts.font.base.caption, styles.hide]}>
                        {key + min} {markValue}
                      </Text>
                    </View>
                  );
                }

                if (!isShow || max - key < 0.5) {
                  return null;
                }

                return (
                  <View
                    style={[
                      styles.singleMarkWrapper,
                      { left: position },
                      (key === maxLimit || key === minLimit) && styles.markSolid,
                    ]}>
                    <View
                      style={[
                        styles.mark,
                        key === maxLimit && styles.markMaxLimit,
                        key === minLimit && [styles.markMinLimit, { backgroundColor: minLimitColor }],
                      ]}
                    />
                    <Text style={[Fonts.font.base.caption, key > (maxLimit ?? max) && styles.disabled]}>
                      {key + min} {markValue}
                    </Text>
                  </View>
                );
              })}
            </View>
            {/* Render Last Mark */}
            <View style={[styles.singleMarkWrapper, styles.lastMark, max === maxLimit && styles.markSolid]}>
              <View style={[styles.mark, max === maxLimit && styles.markMaxLimit]} />
              <Text style={[Fonts.font.base.caption, max > (maxLimit ?? max) && styles.disabled]}>
                {max} {markValue}
              </Text>
            </View>
          </>
        )}
      </View>
      {showButtons && (
        <Button
          testID="styledRangeSliderRightButton"
          inverse
          height={32}
          title=""
          disabled={twoMaxLimit ? low === maxLimit || low === minLimit : low === maxLimit}
          icon={
            <ArrowIcon
              style={(twoMaxLimit ? low === maxLimit || low === minLimit : low === maxLimit) && styles.disabled}
            />
          }
          style={styles.btn}
          mainSectionStyle={styles.btnSection}
          onPress={() => {
            if ((low ?? min) >= max || (twoMaxLimit && minLimit && (low ?? min) >= minLimit)) {
              return;
            }

            let value = (low ?? min) + step;

            if (maxLimit && value > maxLimit) {
              value = maxLimit;
            }

            if (twoMaxLimit && minLimit && value > minLimit) {
              value = minLimit;
            }

            handleButtonPress?.(value);
          }}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    flexDirection: 'row',
    position: 'relative',
  },
  thumb: {
    width: 24,
    height: 24,
    borderRadius: 14,
    borderWidth: 1,
  },
  rail: {
    height: 3,
    borderRadius: 18,
    backgroundColor: Colors.green,
    overflow: 'hidden',
  },
  fullWidthRail: {
    width: '100%',
  },
  marksWrapper: {
    paddingHorizontal: 4,
    position: 'absolute',
    zIndex: -1,
    width: '100%',
    height: 220,
  },
  singleMarkWrapper: {
    position: 'absolute',
    zIndex: -1,
    alignItems: 'center',
  },
  mark: {
    width: 1,
    height: 24,
    marginBottom: 4,
    backgroundColor: Colors.border,
  },
  markSolid: {
    // zIndex: 1,
  },
  hide: {
    opacity: 0,
  },
  markMinLimit: {
    width: 2,
  },
  markMaxLimit: {
    width: 2,
    backgroundColor: Colors.red,
  },
  heightWithMarks: {
    minHeight: 40,
  },
  lastMark: {
    right: 0,
  },
  btn: {
    width: 32,
    height: 32,
    borderRadius: 16,
    padding: 0,
  },
  btnSection: {
    paddingTop: 3,
    paddingLeft: 3,
  },
  btnSectionLeft: {
    paddingTop: 3,
  },
  disabled: {
    opacity: 0.5,
  },
});

export default StyledRangeSlider;
