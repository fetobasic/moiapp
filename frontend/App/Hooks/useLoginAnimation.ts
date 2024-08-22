import { useKeyboard } from '@react-native-community/hooks';
import { isIOS } from 'App/Themes';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { Animated, Keyboard, KeyboardEvent } from 'react-native';

const getAnimated = (value: Animated.Value, translateYRange: number[] = [0, 0]) => ({
  transform: [
    {
      translateY: value.interpolate({
        inputRange: [0, 1],
        outputRange: translateYRange,
      }),
    },
  ],
});

const useLoginAnimation = () => {
  const [animatedValue] = useState(new Animated.Value(1));
  const { keyboardShown } = useKeyboard();

  const animate = useCallback(
    (toValue: number, duration: number) => {
      Animated.timing(animatedValue, {
        toValue,
        duration,
        useNativeDriver: true,
      }).start();
    },
    [animatedValue],
  );

  const keyboardWillShow = useCallback(
    (event?: KeyboardEvent) => {
      const duration = event?.duration || 250;
      animate(0, duration);
    },
    [animate],
  );

  const keyboardWillHide = useCallback(
    (event?: KeyboardEvent) => {
      const duration = event?.duration || 250;
      animate(1, duration);
    },
    [animate],
  );

  useEffect(() => {
    if (isIOS) {
      const showListener = Keyboard.addListener('keyboardWillShow', keyboardWillShow);
      const hideListener = Keyboard.addListener('keyboardWillHide', keyboardWillHide);

      return () => {
        showListener.remove();
        hideListener.remove();
      };
    } else {
      if (keyboardShown) {
        keyboardWillShow();
      } else {
        keyboardWillHide();
      }
    }
  }, [keyboardShown, keyboardWillHide, keyboardWillShow]);

  const containerAnimated = useMemo(() => getAnimated(animatedValue, [-32, 0]), [animatedValue]);
  const sectionMainAnimated = useMemo(() => getAnimated(animatedValue, [-8, -32]), [animatedValue]);
  const forgotPasswordButtonAnimated = useMemo(() => getAnimated(animatedValue, [14, 18]), [animatedValue]);
  const loginButtonAnimated = useMemo(() => getAnimated(animatedValue, [28, 36]), [animatedValue]);
  const createAccountButtonAnimated = useMemo(() => getAnimated(animatedValue, [40, 56]), [animatedValue]);

  return [
    containerAnimated,
    sectionMainAnimated,
    forgotPasswordButtonAnimated,
    loginButtonAnimated,
    createAccountButtonAnimated,
  ];
};

export default useLoginAnimation;
