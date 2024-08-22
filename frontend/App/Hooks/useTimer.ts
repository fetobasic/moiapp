import { useState, useEffect, useRef } from 'react';

const useTimer = (initialSecond?: number) => {
  const [seconds, setSeconds] = useState(initialSecond || 0);
  const timerId = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if (seconds <= 0) {
      timerId.current && clearTimeout(timerId.current);
      timerId.current = null;
      return;
    }

    timerId.current = setTimeout(() => {
      setSeconds((prev) => prev - 1);
    }, 1000);

    return () => {
      timerId.current && clearTimeout(timerId.current);
    };
  }, [seconds]);

  return {
    seconds,
    setSeconds,
  };
};

export default useTimer;
