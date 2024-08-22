import React from 'react';
import { NavigationContainer, NavigationContainerRef, DefaultTheme } from '@react-navigation/native';
import { createDrawerNavigator } from '@react-navigation/drawer';
import { PostHog, PostHogProvider } from 'posthog-react-native';

import PostHogConfig from 'App/Config/PostHog';
import { DrawerContent } from 'App/Components';
import HomeNavigation from './HomeNavigation';

import { useAppSelector } from 'App/Hooks';
import { DrawerStackParamList, HomeStackParamList } from 'App/Types/NavigationStackParamList';
import { Colors } from 'App/Themes';
import { fileLogger } from 'App/Services/FileLogger';

const Drawer = createDrawerNavigator<DrawerStackParamList>();
const navigationRef = React.createRef<NavigationContainerRef<any>>();

export const navigate = (name: keyof HomeStackParamList, params?: HomeStackParamList[typeof name]) => {
  navigationRef?.current?.navigate?.(name, params);
};

export const posthog = new PostHog(PostHogConfig.apiKey, {
  host: PostHogConfig.host,
  captureMode: 'json',
});

export const isPairingRoutes = () => {
  return [
    'AddNewDevice',
    'BluetoothHelp',
    'PairingMode',
    'EnterNetworkManually',
    'Connection',
    'PairingModeHelp',
    'SelectConnect',
    'ConnectYeti',
    'FindWifiNetwork',
    'ChangeYetiWifiPassword',
    'SelectWifiNetwork',
    'EnterWifiPassword',
    'UpdateFirmware',
    'LoginNav',
    'HelpNav',
  ].includes(navigationRef.current?.getCurrentRoute()?.name || '');
};

export const navigationGoBack = () => navigationRef.current?.canGoBack() && navigationRef.current?.goBack();

export default () => {
  const { isAppLoaded } = useAppSelector((state) => ({ isAppLoaded: state.startup.isAppLoaded }));

  if (!isAppLoaded) {
    return null;
  }

  return (
    <NavigationContainer
      onStateChange={fileLogger.navigationHandler}
      theme={{ ...DefaultTheme, colors: { ...DefaultTheme.colors, primary: Colors.background } }}
      ref={navigationRef}>
      <PostHogProvider autocapture client={posthog}>
        <Drawer.Navigator
          drawerContent={DrawerContent}
          screenOptions={{
            headerShown: false,
            drawerType: 'front',
            sceneContainerStyle: {
              backgroundColor: Colors.background,
            },
            drawerStyle: {
              width: '90%',
            },
          }}>
          <Drawer.Screen name="HomeNav" component={HomeNavigation} />
        </Drawer.Navigator>
      </PostHogProvider>
    </NavigationContainer>
  );
};
