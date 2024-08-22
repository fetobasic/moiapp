import React, { useCallback } from 'react';
import { StyleSheet, Pressable, ViewStyle } from 'react-native';
import Animated, { useAnimatedStyle, useDerivedValue, withTiming } from 'react-native-reanimated';

import { Colors } from 'App/Themes';

type SwitchProps = {
  value: boolean;
  error?: boolean;
  disabled?: boolean;
  locked?: boolean;
  onPress: () => void;
  trackStyles?: ViewStyle;
  thumbStyles?: ViewStyle;
  bgOnColor?: string;
};

const backgroundColors = {
  on: '#BDCC2A',
  off: '#363636',
  error: '#ff531d',
  disabled: '#363636',
};

const thumbColors = {
  on: '#ffffff',
  off: '#ffffff',
  error: '#ffffff',
  disabled: '#858585',
};

const Switch = (props: SwitchProps) => {
  const state = useDerivedValue(() => {
    return props.value ? 1 : 0;
  });

  const animatedTrackStyle = useAnimatedStyle(() => {
    let backgroundColor = state.value ? props?.bgOnColor || backgroundColors.on : backgroundColors.off;

    if (props.disabled) {
      backgroundColor = backgroundColors.disabled;
    } else if (props.locked) {
      backgroundColor = state.value
        ? props.error
          ? Colors.portErrorDisable
          : Colors.greenDisable
        : backgroundColors.disabled;
    } else if (props.error) {
      backgroundColor = backgroundColors.error;
    }

    return { backgroundColor };
  });

  const animatedThumbStyle = useAnimatedStyle(() => {
    return {
      backgroundColor: props.disabled || props.locked ? thumbColors.disabled : thumbColors.on,
      transform: [{ translateX: withTiming(state.value ? 19 : 2) }],
    };
  });

  const onPressHandler = useCallback(() => {
    if (!props.disabled && !props.locked) {
      props.onPress?.();
    }
  }, [props]);

  return (
    <Pressable testID="switchCustom" onPress={onPressHandler}>
      <Animated.View style={[styles.switchTrack, props.trackStyles, animatedTrackStyle]}>
        <Animated.View style={[styles.switchThumb, props.thumbStyles, animatedThumbStyle]} />
      </Animated.View>
    </Pressable>
  );
};

const styles = StyleSheet.create({
  switchTrack: {
    height: 30,
    width: 48,
    borderRadius: 15,
  },
  switchThumb: {
    top: 1.5,
    height: 27,
    width: 27,
    borderRadius: 14,
    position: 'absolute',
    elevation: 5,
    shadowColor: Colors.black,
    shadowOffset: { width: 2, height: 2 },
    shadowOpacity: 0.2,
  },
});

export default Switch;
