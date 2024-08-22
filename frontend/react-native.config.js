module.exports = {
  project: {
    ios: {},
    android: {},
  },
  dependencies: {
    ...(process.env.CI || process.env.NO_FLIPPER // Skip Flipper installation on CI servers
    ? { 'react-native-flipper': { platforms: { ios: null } } }
    : {}),
    'react-native-vector-icons': {
      platforms: {
        ios: null,
      },
    },
  },
  assets: ['./assets/Fonts/'],
};
