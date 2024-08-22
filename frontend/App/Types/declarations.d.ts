declare module '*.svg' {
  import React from 'react';
  import { SvgProps } from 'react-native-svg';
  const content: React.FC<SvgProps>;
  export default content;
}

// For JEST tests
declare module 'react-native-device-info/jest/react-native-device-info-mock';
declare module '@react-native-community/netinfo/jest/netinfo-mock';
declare module 'ws';

declare module 'react-native-safe-area-context/jest/mock' {
  import RNSafeAreaContext, { Metrics, SafeAreaViewProps } from 'react-native-safe-area-context';

  export const initialWindowMetrics: Metrics;
  export const SafeAreaProvider: React.FC<SafeAreaViewProps>;

  export default RNSafeAreaContext;
}
