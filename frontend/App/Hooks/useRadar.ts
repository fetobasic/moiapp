import { useCallback, useState, useRef } from 'react';
import { Animated, Easing } from 'react-native';
import AppConfig from 'App/Config/AppConfig';

const WAVE_DURATION = 2000;

const useRadar = () => {
  const [isStarted, setIsStarted] = useState(false);

  const waveAngle = useRef(new Animated.Value(0)).current;
  const dotOpacity = useRef(new Animated.Value(0)).current;
  const completeIconOpacity = useRef(new Animated.Value(0)).current;

  const start = useCallback(() => {
    setIsStarted(true);

    Animated.parallel([
      Animated.loop(
        Animated.timing(waveAngle, {
          toValue: 1,
          duration: WAVE_DURATION,
          useNativeDriver: false,
          easing: Easing.linear,
        }),
      ),
      Animated.timing(dotOpacity, {
        toValue: 1,
        duration: AppConfig.defaultAnimationDuration,
        useNativeDriver: false,
      }),
      Animated.timing(completeIconOpacity, {
        toValue: 0,
        duration: AppConfig.defaultAnimationDuration,
        useNativeDriver: false,
      }),
    ]).start();
  }, [completeIconOpacity, dotOpacity, waveAngle]);

  const stop = useCallback(() => {
    setIsStarted(false);

    Animated.timing(dotOpacity, {
      toValue: 0,
      duration: AppConfig.defaultAnimationDuration,
      useNativeDriver: false,
    }).start(() => {
      waveAngle.stopAnimation();
    });
  }, [dotOpacity, waveAngle]);

  const completed = useCallback(() => {
    stop();

    Animated.timing(completeIconOpacity, {
      toValue: 1,
      duration: AppConfig.defaultAnimationDuration,
      useNativeDriver: false,
    }).start();
  }, [completeIconOpacity, stop]);

  return {
    isStarted,
    waveAngle,
    start,
    stop,
    completed,
    dotOpacity,
    completeIconOpacity,
  };
};

export default useRadar;
