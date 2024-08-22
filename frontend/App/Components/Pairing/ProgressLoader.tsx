import React, { useEffect, useMemo, useRef } from 'react';
import { StyleSheet, Animated, Easing } from 'react-native';

import { Colors, Metrics } from 'App/Themes';
import { useTimer } from 'App/Hooks';
import AppConfig from 'App/Config/AppConfig';
import { wait } from 'App/Services/Wait';

type Props = {
  progress?: number;
  time?: number;
  isFinished?: boolean;
};

function ProgressLoader({ isFinished, time, progress }: Props) {
  const { seconds, setSeconds } = useTimer(time);
  const animatedProgress = useRef(new Animated.Value(progress || 0)).current;
  const opacity = useRef(new Animated.Value(progress ? 0 : 1)).current;

  const chunk = useMemo(() => Metrics.screenWidth / (time || 1), [time]);

  useEffect(() => {
    if (isFinished) {
      setSeconds(0);

      // Hide progress bar after finishing
      wait(AppConfig.hideProgressBarDelay).then(() => {
        Animated.timing(opacity, {
          toValue: 0,
          duration: AppConfig.defaultAnimationDuration,
          useNativeDriver: false,
        }).start();
      });
    }
  }, [isFinished, opacity, setSeconds, progress]);

  useEffect(() => {
    if (time) {
      Animated.timing(animatedProgress, {
        toValue: (time - seconds) * chunk,
        duration: AppConfig.defaultAnimationDuration,
        useNativeDriver: false,
        easing: Easing.linear,
      }).start();
    }
  }, [chunk, animatedProgress, seconds, time, progress]);

  useEffect(() => {
    if (progress) {
      Animated.parallel([
        Animated.timing(animatedProgress, {
          toValue: progress,
          duration: AppConfig.defaultAnimationDuration,
          useNativeDriver: false,
          easing: Easing.linear,
        }),
        Animated.timing(opacity, {
          toValue: progress || progress < 95 ? 1 : 0,
          duration: AppConfig.defaultAnimationDuration,
          useNativeDriver: false,
          easing: Easing.linear,
        }),
      ]).start();
    }
  }, [animatedProgress, opacity, progress]);

  return !isFinished ? (
    <Animated.View testID="progressLoader" style={[styles.container, { opacity }]}>
      <Animated.View style={[styles.progress, { width: animatedProgress }]} />
    </Animated.View>
  ) : null;
}

const styles = StyleSheet.create({
  container: {
    height: 4,
    width: Metrics.screenWidth,
    backgroundColor: Colors.transparentWhite('0.05'),
  },
  progress: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: Colors.green,
  },
});

export default ProgressLoader;
