import React, { ReactNode } from 'react';
import Svg, { Path } from 'react-native-svg';

type LineShadowProps = {
  d: string;
  strokeColor?: string;
  fillColor?: string;
  children?: ReactNode;
  opacity?: number;
};

const LineShadow = ({ d, strokeColor, fillColor, children, opacity = 0.2 }: LineShadowProps) => (
  <Svg fill="none">
    {children}
    <Path d={d} stroke={strokeColor} fill={fillColor} opacity={opacity} strokeWidth="6" />
  </Svg>
);

export default LineShadow;
