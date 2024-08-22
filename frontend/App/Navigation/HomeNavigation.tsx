import React from 'react';
import { createNativeStackNavigator, NativeStackScreenProps } from '@react-navigation/native-stack';

import HomeScreen from 'App/Containers/Home/HomeScreen';
import PortsInfo from 'App/Containers/Home/PortsInfo';
import AccessoriesInfo from 'App/Containers/Home/AccessoriesInfo';
import ChargeProfile from 'App/Containers/Common/ChargeProfile';
import EnergyHistory from 'App/Containers/Common/EnergyHistory';
import PairingNav from './PairingNavigation';
import SettingsNavigation from './SettingsNavigation';
import Notifications from 'App/Containers/Home/NotificationsScreen';
import EditAccount from 'App/Containers/LogIn/EditAccount';
import DeleteAccountScreen from 'App/Containers/LogIn/DeleteAccount';
import ApplicationSettings from 'App/Containers/Settings/ApplicationSettings';
import BatteryScreen from 'App/Containers/Common/BatteryScreen';
import Units from 'App/Containers/Settings/Units';
import UpdateFirmware from 'App/Containers/Settings/UpdateFirmware';
import { ForgotPasswordScreen } from 'App/Containers/LogIn';
import HelpNavigation from './HelpNavigation';

import { HomeStackParamList, DrawerStackParamList } from 'App/Types/NavigationStackParamList';
import LoginNavigation from './LoginNavigation';
import TankPro from 'App/Containers/Settings/ConnectedAccessories/TankPRO';
import TankBattery from 'App/Containers/Settings/ConnectedAccessories/TankBattery';
import FileLogger from 'App/Containers/Settings/FileLogger';

const Stack = createNativeStackNavigator<HomeStackParamList>();

type Props = NativeStackScreenProps<DrawerStackParamList, 'HomeNav'>;

export const propsResetPassword = {
  title: 'Reset Password',
  body: 'Please enter your account email. We will send you a link to reset your password.',
  buttonText: 'Send',
};

export default ({ route }: Props) => (
  <Stack.Navigator
    screenOptions={{
      headerShown: false,
      presentation: 'card',
    }}>
    <Stack.Screen name="Home" component={HomeScreen} initialParams={route.params} />
    <Stack.Group
      screenOptions={{
        headerShown: false,
        presentation: 'containedTransparentModal',
      }}>
      <Stack.Screen name="StartPairing" component={PairingNav} />
    </Stack.Group>
    <Stack.Screen name="Settings" component={SettingsNavigation} />
    <Stack.Screen name="HelpNav" component={HelpNavigation} />
    <Stack.Screen name="PortsInfo" component={PortsInfo} />
    <Stack.Screen name="AccessoriesInfo" component={AccessoriesInfo} />
    <Stack.Screen name="BatteryScreen" component={BatteryScreen} />
    <Stack.Screen name="EnergyInfo" component={EnergyHistory} />
    <Stack.Screen name="ChargeProfile" component={ChargeProfile} />
    <Stack.Screen name="Notifications" component={Notifications} />
    <Stack.Screen name="ApplicationSettings" component={ApplicationSettings} />
    <Stack.Screen name="Units" component={Units} />
    <Stack.Screen name="LoginNav" component={LoginNavigation} />
    <Stack.Screen name="TankPro" component={TankPro} />
    <Stack.Screen name="TankBattery" component={TankBattery} />
    <Stack.Screen name="EditAccount" component={EditAccount} />
    <Stack.Screen name="FileLogger" component={FileLogger} />
    <Stack.Screen
      name="ForgotPassword"
      component={ForgotPasswordScreen}
      initialParams={{ content: propsResetPassword }}
    />
    <Stack.Screen name="DeleteAccount" component={DeleteAccountScreen} />
    <Stack.Screen
      name="UpdateFirmware"
      component={UpdateFirmware}
      initialParams={route.params as unknown as HomeStackParamList['UpdateFirmware']}
    />
  </Stack.Navigator>
);
