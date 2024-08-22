import React from 'react';
import { Pressable as RNPressable, PressableProps } from 'react-native';

export default function Pressable(props: PressableProps) {
  return (
    <RNPressable
      {...props}
      // @ts-ignore
      style={({ pressed }) => [{ opacity: pressed ? 0.25 : 1 }, props.style]}
    />
  );
}
