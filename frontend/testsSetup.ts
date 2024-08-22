import 'react-native-gesture-handler/jestSetup';
import 'aws-sdk-client-mock-jest';
import { View as mockView } from 'react-native';
import mockRNDeviceInfo from 'react-native-device-info/jest/react-native-device-info-mock';
import mockSafeAreaContext from 'react-native-safe-area-context/jest/mock';
import mockRNCNetInfo from '@react-native-community/netinfo/jest/netinfo-mock';
import mockRNAsyncStore from '@react-native-async-storage/async-storage/jest/async-storage-mock';
import { WebSocket as mockWebSocket } from 'mock-socket';
// @ts-ignore
import mockClipboard from '@react-native-clipboard/clipboard/jest/clipboard-mock.js';

const reactotron = {
  configure: () => reactotron,
  useReactNative: () => reactotron,
  use: () => reactotron,
  connect: () => reactotron,
  clear: () => reactotron,
  createEnhancer: () => reactotron,
  networking: () => reactotron,
  setAsyncStorageHandler: () => reactotron,
};

jest.mock('reactotron-react-native', () => reactotron);

jest.mock('@react-native-clipboard/clipboard', () => mockClipboard);

jest.mock('react-native-share', () => ({
  default: jest.fn(),
}));

jest.mock('posthog-react-native', () => ({
  PostHog: jest.fn(),
  PostHogProvider: jest.fn(),
  useFeatureFlagWithPayload: () => [false, {}],
  useFeatureFlag: () => false,
}));

jest.mock('reactotron-redux', () => ({
  reactotronRedux: jest.fn(),
}));

jest.mock('react-native-bootsplash', () => {
  return {
    hide: jest.fn().mockResolvedValue(true),
    isVisible: jest.fn().mockResolvedValue(false),
    useHideAnimation: jest.fn().mockReturnValue({
      container: {},
      logo: { source: 0 },
      brand: { source: 0 },
    }),
  };
});

jest.mock('react-native/Libraries/EventEmitter/NativeEventEmitter');
jest.mock('react-native-exception-handler', () => ({
  setJSExceptionHandler: jest.fn(),
  setNativeExceptionHandler: jest.fn(),
}));
jest.mock('aws-amplify', () => ({
  Amplify: {
    configure: jest.fn(),
  },
}));
jest.mock('@react-native-community/netinfo', () => mockRNCNetInfo);
jest.mock('@react-native-async-storage/async-storage', () => mockRNAsyncStore);
jest.mock('react-native-modal', () => mockView);
jest.mock('react-native-picker-select', () => mockView);
jest.mock('react-native-safe-area-context', () => mockSafeAreaContext);
jest.mock('react-native/Libraries/Animated/NativeAnimatedHelper');
jest.mock('react-native-device-info', () => mockRNDeviceInfo);
jest.mock('react-native-localize', () => ({
  getCountry: jest.fn().mockReturnValue('USA'),
}));

jest.mock('react-native-push-notification', () => ({
  configure: jest.fn(),
  onRegister: jest.fn(),
  onNotification: jest.fn(),
  addEventListener: jest.fn(),
  requestPermissions: jest.fn(),
}));

jest.mock('react-native-video', () => mockView);

jest.mock('victory-native', () => ({
  VictoryBar: mockView,
  VictoryChart: mockView,
  VictoryStack: mockView,
  VictoryTheme: mockView,
  VictoryAxis: mockView,
  VictoryLine: mockView,
  VictoryScatter: mockView,
}));

jest.mock('react-native-geolocation-service', () => ({
  addListener: jest.fn(),
  getCurrentPosition: jest.fn(),
  removeListeners: jest.fn(),
  requestAuthorization: jest.fn(),
  setConfiguration: jest.fn(),
  startObserving: jest.fn(),
  stopObserving: jest.fn(),
}));

jest.mock('@sayem314/react-native-keep-awake', () => ({
  activateKeepAwake: jest.fn(),
  deactivateKeepAwake: jest.fn(),
}));

jest.mock('react-native-bluetooth-state-manager', () => ({
  getState: jest.fn(),
  requestToEnable: jest.fn(),
  openSettings: jest.fn(),
}));

jest.mock('@react-native-community/push-notification-ios', () => ({
  FetchResult: {
    NoData: 'UIBackgroundFetchResultNoData',
  },
}));

jest.mock('@sentry/react-native', () => ({
  Sentry: {
    captureMessage: jest.fn(),
  },
  SentrySeverity: {
    Fatal: 'fatal',
    Error: 'error',
    Warning: 'warning',
    Info: 'info',
    Debug: 'debug',
    Critical: 'critical',
  },
}));

jest.mock('react-native-ble-manager', () => ({
  start: jest.fn().mockResolvedValueOnce(true),
  connect: jest.fn().mockResolvedValueOnce(true),
  stopScan: jest.fn().mockResolvedValueOnce(true),
  disconnect: jest.fn().mockResolvedValueOnce(true),
  stopNotification: jest.fn().mockResolvedValueOnce(true),
  retrieveServices: jest.fn().mockResolvedValueOnce(true),
  startNotification: jest.fn().mockResolvedValueOnce(true),
  requestMTU: jest.fn().mockResolvedValueOnce(true),
  scan: jest.fn(),
  write: jest.fn().mockImplementation(() => Promise.resolve()),
  read: jest.fn().mockImplementation(() => Promise.resolve()),
  writeWithoutResponse: jest.fn().mockImplementation(() => Promise.resolve()),
}));

jest.mock('aws-iot-sdk-react-native', () => ({
  thingShadow: jest.fn(() => ({
    on: jest.fn(),
    update: jest.fn(),
    register: jest.fn(),
    unregister: jest.fn(),
    get: jest.fn(),
    subscribe: jest.fn(),
    device: {
      reconnect: jest.fn(),
      subscribe: jest.fn(),
      end: jest.fn(),
    },
  })),
}));

// Mock the module that includes AwsIotReady
jest.mock('frontend/aws/index.js', () => ({
  AwsIotReady: Promise.resolve({
    update: jest.fn(),
    on: jest.fn(),
    register: jest.fn(),
    unregister: jest.fn(),
    get: jest.fn(),
    subscribe: jest.fn(),
    device: {
      reconnect: jest.fn(),
      subscribe: jest.fn(),
      end: jest.fn(),
    },
  }),
}));

jest.mock('react-native-flash-message', () => ({
  showMessage: jest.fn(),
}));

jest.mock('react-native-reanimated', () => require('react-native-reanimated/mock'));

jest.mock('react-native-share', () => ({
  open: jest.fn(),
}));

jest.mock('react-native-push-notification', () => ({
  localNotification: jest.fn(),
  setApplicationIconBadgeNumber: jest.fn(),
}));

jest.mock('@react-navigation/drawer', () => ({
  createDrawerNavigator: jest.fn(() => ({
    Navigator: jest.fn(),
    Screen: jest.fn(),
  })),
}));

// @ts-ignore
global.__reanimatedWorkletInit = () => {};
// @ts-ignore
global.WebSocket = mockWebSocket;
