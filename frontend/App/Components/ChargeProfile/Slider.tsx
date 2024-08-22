import React, { memo, useCallback, useEffect } from 'react';
import { Defs, LinearGradient, Rect, Stop, Svg } from 'react-native-svg';
import { View, Pressable, Image, StyleSheet } from 'react-native';
import {
  TapGestureHandler,
  PanGestureHandler,
  type PanGestureHandlerGestureEvent,
  type TapGestureHandlerGestureEvent,
} from 'react-native-gesture-handler';
import Animated, {
  runOnJS,
  useAnimatedGestureHandler,
  useAnimatedStyle,
  useDerivedValue,
  useSharedValue,
} from 'react-native-reanimated';

import { WithTopBorder } from 'App/Hoc';
import { Colors, Images, Metrics } from 'App/Themes';

const SCREEN_WIDTH = Metrics.screenWidth;
const SLIDER_SIZE = SCREEN_WIDTH * 0.8;
const THUMB_SIZE = SLIDER_SIZE * 0.09;
const MAX_ABSOLUTE_TRANSLATE = SLIDER_SIZE - THUMB_SIZE;

type VerticalSliderControlProps = {
  onPress: () => void;
  arrowDirection?: 'up' | 'down';
};

const VerticalSliderControl = ({ onPress, arrowDirection }: VerticalSliderControlProps) => {
  return (
    <WithTopBorder containerStyle={styles.sliderControlContainer} contentStyle={styles.sliderControlContent}>
      <Pressable testID={`verticalSliderControl_${arrowDirection}`} onPress={onPress} style={styles.sliderControlIcon}>
        <Image
          source={Images.arrowForward}
          style={{ transform: [{ rotate: `${arrowDirection === 'up' ? 270 : 90}deg` }] }}
        />
      </Pressable>
    </WithTopBorder>
  );
};

const calculateTranslate = (min: number, max: number, value: number, containerSize?: number, elementSize?: number) => {
  'worklet';

  containerSize = containerSize || SLIDER_SIZE;
  elementSize = elementSize || THUMB_SIZE;

  return (value * (containerSize - elementSize)) / (max - min);
};

const calculateNormalizedValue = (min: number, max: number, translate: number) => {
  'worklet';

  return (translate * (max - min)) / MAX_ABSOLUTE_TRANSLATE;
};

type SliderProps = {
  min?: number;
  max?: number;
  steps?: number;
  initialValue?: number;
  minValueLimit?: number;
  maxValueLimit?: number;
  inverted?: boolean;
  disabled?: boolean;
  vertical?: boolean;
  onChange?: (value: number) => void;
  minimumTrackBackgroundColor: string | string[];
  maximumTrackBackgroundColor: string;
  children?: React.ReactNode;
};

const Slider = ({
  min = 0,
  max = 100,
  steps = 20,
  initialValue = 0,
  minValueLimit = min,
  maxValueLimit = max,
  inverted = false,
  disabled = false,
  vertical = false,
  onChange,
  minimumTrackBackgroundColor,
  maximumTrackBackgroundColor,
  children,
}: SliderProps) => {
  const step = max / steps;

  const MIN_TRANSLATE_LIMIT = calculateTranslate(min, max, inverted ? max - minValueLimit : minValueLimit);
  const MAX_TRANSLATE_LIMIT = calculateTranslate(min, max, inverted ? max - maxValueLimit : maxValueLimit);
  const MIN_TRANSLATE = Math.max(0, MIN_TRANSLATE_LIMIT);
  const MAX_TRANSLATE = Math.min(MAX_TRANSLATE_LIMIT, MAX_ABSOLUTE_TRANSLATE);

  const initialTranslate = calculateTranslate(min, max, initialValue);
  const translate = useSharedValue(inverted ? MAX_ABSOLUTE_TRANSLATE - initialTranslate : initialTranslate);

  const calculateAdjustedTranslate = useCallback(
    (translateValue: number) => {
      'worklet';

      const adjustedTranslate = inverted
        ? Math.min(MIN_TRANSLATE, Math.min(Math.max(0, translateValue), MAX_ABSOLUTE_TRANSLATE))
        : Math.max(MIN_TRANSLATE, Math.min(Math.max(0, translateValue), MAX_ABSOLUTE_TRANSLATE));

      return inverted ? Math.max(adjustedTranslate, MAX_TRANSLATE) : Math.min(adjustedTranslate, MAX_TRANSLATE);
    },
    [inverted, MAX_TRANSLATE, MIN_TRANSLATE],
  );

  const adjustedTranslate = useDerivedValue(() => {
    return calculateAdjustedTranslate(translate.value);
  }, [initialValue, maxValueLimit]);

  useEffect(() => {
    translate.value = calculateAdjustedTranslate(
      inverted ? MAX_ABSOLUTE_TRANSLATE - initialTranslate : initialTranslate,
    );
  }, [inverted, translate, initialTranslate, calculateAdjustedTranslate]);

  const onTranslateChange = useCallback(
    (nextTranslate: number) => {
      'worklet';

      if (!disabled && onChange) {
        const normalizedValue = calculateNormalizedValue(min, max, nextTranslate);

        runOnJS(onChange)(inverted ? max - normalizedValue : normalizedValue);
      }
    },
    [disabled, inverted, max, min, onChange],
  );

  const panGestureEvent = useAnimatedGestureHandler<PanGestureHandlerGestureEvent, { x: number; y: number }>({
    onStart: (event, context) => {
      context[vertical ? 'y' : 'x'] = event[vertical ? 'y' : 'x'];
    },
    onActive: (event, context) => {
      const nextTranslate = context[vertical ? 'y' : 'x'] + event[vertical ? 'translationY' : 'translationX'];

      translate.value = nextTranslate;
    },
    onEnd: () => onTranslateChange(adjustedTranslate.value),
  });

  const tapGestureEvent = useAnimatedGestureHandler<TapGestureHandlerGestureEvent>({
    onStart: (event) => {
      const nextTranslate = event[vertical ? 'y' : 'x'] - THUMB_SIZE / 2;

      translate.value = nextTranslate;
    },
    onEnd: () => onTranslateChange(adjustedTranslate.value),
  });

  const increment = useCallback(() => {
    const currentValue = calculateNormalizedValue(min, max, translate.value);
    const nextValue = currentValue - step > max ? max : currentValue - step;

    const nextTranslate = calculateAdjustedTranslate(calculateTranslate(min, max, nextValue));

    translate.value = nextTranslate;

    onTranslateChange(nextTranslate);
  }, [max, min, onTranslateChange, step, translate, calculateAdjustedTranslate]);

  const decrement = useCallback(() => {
    const currentValue = calculateNormalizedValue(min, max, translate.value);
    const nextValue = currentValue + step < min ? min : currentValue + step;
    const nextTranslate = calculateAdjustedTranslate(calculateTranslate(min, max, nextValue));

    translate.value = nextTranslate;

    onTranslateChange(nextTranslate);
  }, [max, min, onTranslateChange, step, translate, calculateAdjustedTranslate]);

  const animatedThumbStyle = useAnimatedStyle(() => {
    const transform = vertical ? [{ translateY: adjustedTranslate.value }] : [{ translateX: adjustedTranslate.value }];

    return { transform };
  });

  const animatedMaximumTrackStyle = useAnimatedStyle(() => {
    return {
      [vertical ? 'height' : 'width']: `${100 - (adjustedTranslate.value / SLIDER_SIZE) * 100}%`,
    };
  });

  return (
    <View style={styles.container} testID="slider">
      {vertical && <VerticalSliderControl onPress={increment} arrowDirection="up" />}

      <TapGestureHandler onGestureEvent={tapGestureEvent}>
        <Animated.View style={[styles.container, vertical ? styles.verticalContainer : styles.horizontalContainer]}>
          <PanGestureHandler onGestureEvent={panGestureEvent}>
            <Animated.View style={[styles.track, vertical ? styles.verticalTrack : styles.horizontalTrack]}>
              <View style={[styles.trackBackgroundLines, !vertical && styles.horizontalTrackBackgroundLines]}>
                <View style={[styles.trackBackgroundLine, styles.trackBackgroundSkipLine]} />

                {Array.from({ length: steps % 2 === 0 ? steps + 1 : steps }, (_, i) => {
                  const lineSizeStyle = {
                    [vertical ? 'height' : 'width']: 1,
                    [vertical ? 'width' : 'height']: i % 2 === 0 ? 24 : 16,
                  };

                  return <View key={i} style={[styles.trackBackgroundLine, lineSizeStyle]} />;
                })}

                <View style={[styles.trackBackgroundLine, styles.trackBackgroundSkipLine]} />
              </View>

              <View style={[styles.minimumTrack, vertical ? styles.verticalTrack : styles.horizontalTrack]}>
                {Array.isArray(minimumTrackBackgroundColor) ? (
                  <Svg height="100%" width="100%">
                    <Defs>
                      <LinearGradient id="grad" x1="0" y1="0" x2={vertical ? 0 : 1} y2={vertical ? 1 : 0}>
                        {minimumTrackBackgroundColor.map((stopColor, index) => (
                          <Stop
                            key={index}
                            offset={index / (minimumTrackBackgroundColor.length - 1)}
                            stopColor={stopColor}
                            stopOpacity="1"
                          />
                        ))}
                      </LinearGradient>
                    </Defs>
                    <Rect height="100%" width="100%" x="0" y="0" fill="url(#grad)" />
                  </Svg>
                ) : (
                  <View style={styles.minimumTrackBackgroundContainer}>
                    <View style={[styles.minimumTrackBackground, { backgroundColor: minimumTrackBackgroundColor }]} />
                  </View>
                )}
              </View>

              <Animated.View
                style={[
                  styles.maximumTrack,
                  vertical ? styles.maximumVerticalTrack : styles.maximumHorizontalTrack,
                  animatedMaximumTrackStyle,
                ]}>
                <View style={[styles.maximumTrackBackground, { backgroundColor: maximumTrackBackgroundColor }]} />
              </Animated.View>

              <View style={vertical ? styles.childrenContainerVertical : styles.childrenContainerHorizontal}>
                {children}
              </View>

              <Animated.View style={[styles.thumb, animatedThumbStyle]} />
            </Animated.View>
          </PanGestureHandler>
        </Animated.View>
      </TapGestureHandler>

      {vertical && <VerticalSliderControl onPress={decrement} arrowDirection="down" />}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    marginBottom: Metrics.smallMargin,
  },
  verticalContainer: {
    height: SLIDER_SIZE,
    width: THUMB_SIZE,
    justifyContent: 'center',
  },
  horizontalContainer: {
    width: SLIDER_SIZE,
    height: THUMB_SIZE,
  },
  childrenContainerVertical: {
    zIndex: 1,
    position: 'absolute',
    height: '100%',
  },
  childrenContainerHorizontal: {
    zIndex: 1,
    position: 'absolute',
    width: '100%',
  },
  track: {
    height: 12,
    width: '100%',
    borderRadius: 6,
    flexDirection: 'row',
  },
  verticalTrack: {
    width: 12,
    height: '100%',
    justifyContent: 'center',
  },
  horizontalTrack: {
    width: '100%',
    height: 12,
    alignItems: 'center',
  },
  trackBackgroundLines: {
    position: 'absolute',
    width: '100%',
    height: '100%',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  horizontalTrackBackgroundLines: {
    flexDirection: 'row',
  },
  trackBackgroundSkipLine: {
    width: 1,
    height: 1,
  },
  trackBackgroundLine: {
    backgroundColor: Colors.border,
  },
  verticalTrackBackgroundLine: {
    height: 1,
  },
  horizontalTrackBackgroundLine: {
    width: 1,
  },
  minimumTrackBackgroundContainer: {
    width: '100%',
    height: '100%',
  },
  minimumTrack: {
    overflow: 'hidden',
    borderRadius: 6,
  },
  minimumHorizontalTrack: {
    width: '100%',
    height: 12,
  },
  minimumTrackGradientBackground: {
    borderRadius: 6,
    overflow: 'hidden',
  },
  minimumTrackBackground: {
    height: '100%',
    borderRadius: 6,
  },
  maximumTrack: {
    position: 'absolute',
    borderRadius: 6,
  },
  maximumVerticalTrack: {
    width: 12,
    bottom: -1,
  },
  maximumHorizontalTrack: {
    height: 12,
    right: 0,
  },
  maximumTrackBackground: {
    height: '100%',
    borderRadius: 6,
  },
  thumb: {
    zIndex: 10,
    position: 'absolute',
    width: THUMB_SIZE,
    height: THUMB_SIZE,
    borderRadius: THUMB_SIZE / 2,
    backgroundColor: 'white',
  },
  markerContainer: {
    position: 'absolute',
    top: SLIDER_SIZE * 0.05,
    height: SLIDER_SIZE * 0.9,
  },
  marker: {
    width: 24,
    height: 4,
    borderRadius: 2,
    backgroundColor: Colors.severity.blue,
  },
  sliderControlContainer: {
    borderRadius: (THUMB_SIZE * 1.1) / 2,
    width: THUMB_SIZE * 1.1,
    height: THUMB_SIZE * 1.1,
  },
  sliderControlContent: {
    paddingHorizontal: 0,
    paddingVertical: 0,
    justifyContent: 'center',
    alignItems: 'center',
  },
  sliderControlIcon: {
    justifyContent: 'center',
    alignItems: 'center',
    overflow: 'hidden',
    borderRadius: 16,
    width: 32,
    height: 32,
    backgroundColor: Colors.background,
  },
});

export default memo(Slider);
