import { useEffect, useRef, useState } from 'react';
import { Animated } from 'react-native';
import AppConfig from 'App/Config/AppConfig';

const useOpacity = (visible: boolean, delay: number = 0) => {
  const opacity = useRef(new Animated.Value(visible && !delay ? 1 : 0)).current;
  const [isHidden, setIsHidden] = useState<boolean>(!visible);
  const delayTimerId = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    async function animate() {
      Animated.timing(opacity, {
        toValue: visible ? 1 : 0,
        duration: AppConfig.defaultAnimationDuration,
        useNativeDriver: false,
      }).start(() => {
        setIsHidden(!visible);
      });
    }

    if (!visible && delayTimerId.current) {
      clearTimeout(delayTimerId.current);
      delayTimerId.current = null;
    }

    delayTimerId.current = setTimeout(
      () => {
        animate();
      },
      visible ? delay : 0,
    );
  }, [visible, opacity, delay]);

  return { opacity, isHidden };
};

export default useOpacity;
