import React from 'react';
import { Provider } from 'react-redux';
import { ReduxNetworkProvider } from 'react-native-offline';
import FlashMessage from 'react-native-flash-message';
import { SafeAreaProvider } from 'react-native-safe-area-context';

import RootContainer from './RootContainer';

import DebugConfig from 'App/Config/DebugConfig';
import { ApplicationStyles } from 'App/Themes';
import { store } from 'App/Store';

/**
 * Provides an entry point into our application. Both index.ios.js and index.android.js
 * call this component first.
 *
 * We create our Redux store here, put it into a provider and then bring in our
 * RootContainer.
 *
 * We separate like this to play nice with React Native's hot reloading.
 */
const App = () => {
  return (
    <Provider store={store}>
      <SafeAreaProvider style={ApplicationStyles.mainContainer}>
        {/*// @ts-ignore as it seems that ReduxNetworkProvider typings have issue with requiring optional props */}
        <ReduxNetworkProvider>
          <RootContainer />
        </ReduxNetworkProvider>
        <FlashMessage position="top" />
      </SafeAreaProvider>
    </Provider>
  );
};

// allow reactotron overlay for fast design in dev mode
// @ts-ignore as it seems that `console.tron` typings have issue with requiring only React.ReactNode
export default DebugConfig.useReactotron ? console?.tron?.overlay?.(App) : App;
