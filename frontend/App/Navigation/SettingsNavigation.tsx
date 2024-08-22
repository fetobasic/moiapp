import React from 'react';
import { createNativeStackNavigator, NativeStackScreenProps } from '@react-navigation/native-stack';

import DeviceSettings from 'App/Containers/Settings/DeviceSettings';
import ChangeName from 'App/Containers/Settings/ChangeName';
import Connection from 'App/Containers/Settings/Connection';
import NotificationSettings from 'App/Containers/Settings/NotificationSettings';
import HelpNavigation from './HelpNavigation';
import { HomeStackParamList, SettingsStackParamList } from 'App/Types/NavigationStackParamList';
import BatteryScreen from 'App/Containers/Common/BatteryScreen';
import EnergyHistory from 'App/Containers/Common/EnergyHistory';
import ChargeProfile from 'App/Containers/Common/ChargeProfile';
import AcChargeInputLimit from 'App/Containers/Settings/AcChargeInputLimit';
import InputLimitsHelp from 'App/Containers/Settings/InputLimitsHelp';
import ConnectedAccessories from 'App/Containers/Settings/ConnectedAccessories/ConnectedAccessories';
import EscapeScreen from 'App/Containers/Settings/ConnectedAccessories/EscapeScreen';
import TankPro from 'App/Containers/Settings/ConnectedAccessories/TankPRO';
import PowerInputLimit from 'App/Containers/Settings/PowerInputLimit';
import TankBattery from 'App/Containers/Settings/ConnectedAccessories/TankBattery';
import UpdateFirmware from 'App/Containers/Settings/UpdateFirmware';
import SelectWifiNetwork from 'App/Containers/Pairing/SelectWifiNetwork';
import EnterWifiPassword from 'App/Containers/Pairing/EnterWifiPassword';
import Link from 'App/Containers/Settings/ConnectedAccessories/Link';
import Mptt from 'App/Containers/Settings/ConnectedAccessories/MPTT';
import Combiner from 'App/Containers/Settings/ConnectedAccessories/Combiner';
import CombinerStatus from 'App/Containers/Settings/ConnectedAccessories/CombinerStatus';
import AcInputLimits from 'App/Containers/Settings/ACInputLimits';
import AcCurrentLimitsHelp from 'App/Containers/Settings/AcCurrentLimitsHelp';
import AcProfileHelp from 'App/Containers/Settings/AcProfileHelp';
import { isAndroid } from 'App/Themes';
import ConnectYeti from 'App/Containers/Pairing/ConnectYeti';
import EmailUs from 'App/Containers/Settings/EmailUs';
import BatteryProtectionMode from 'App/Containers/Settings/BatteryProtectionMode';
import ErrorCodes from 'App/Containers/Settings/ErrorCodes';

const Stack = createNativeStackNavigator<SettingsStackParamList>();
type Props = NativeStackScreenProps<HomeStackParamList, 'Settings'>;

export default ({ route }: Props) => (
  <Stack.Navigator
    screenOptions={{
      headerShown: false,
      presentation: isAndroid ? 'transparentModal' : 'card',
    }}>
    <Stack.Screen initialParams={route.params} name="DeviceSettings" component={DeviceSettings} />
    <Stack.Screen initialParams={route.params} name="ChangeName" component={ChangeName} />

    <Stack.Screen
      initialParams={route.params as unknown as SettingsStackParamList['UpdateFirmware']}
      name="UpdateFirmware"
      component={UpdateFirmware}
    />
    <Stack.Screen initialParams={route.params} name="Connection" component={Connection} />
    <Stack.Screen initialParams={route.params} name="NotificationSettings" component={NotificationSettings} />
    <Stack.Screen initialParams={route.params} name="BatteryScreen" component={BatteryScreen} />
    <Stack.Screen initialParams={route.params} name="EnergyInfo" component={EnergyHistory} />
    <Stack.Screen initialParams={route.params} name="ChargeProfile" component={ChargeProfile} />
    <Stack.Screen initialParams={route.params} name="AcChargeInputLimit" component={AcChargeInputLimit} />
    <Stack.Screen initialParams={route.params} name="ConnectedAccessories" component={ConnectedAccessories} />
    <Stack.Screen
      initialParams={route.params as unknown as SettingsStackParamList['EscapeScreen']}
      name="EscapeScreen"
      component={EscapeScreen}
    />
    <Stack.Screen initialParams={route.params} name="TankPro" component={TankPro} />
    <Stack.Screen initialParams={route.params} name="PowerInputLimit" component={PowerInputLimit} />
    <Stack.Screen initialParams={route.params} name="TankBattery" component={TankBattery} />
    <Stack.Screen initialParams={route.params} name="Combiner" component={Combiner} />
    <Stack.Screen name="CombinerStatus" component={CombinerStatus} />
    <Stack.Screen
      initialParams={route.params as unknown as SettingsStackParamList['SelectWifiNetwork']}
      name="SelectWifiNetwork"
      component={SelectWifiNetwork}
    />
    <Stack.Screen
      initialParams={route.params as unknown as SettingsStackParamList['EnterWifiPassword']}
      name="EnterWifiPassword"
      component={EnterWifiPassword}
    />
    <Stack.Screen
      initialParams={route.params as unknown as SettingsStackParamList['Link']}
      name="Link"
      component={Link}
    />
    <Stack.Screen
      initialParams={route.params as unknown as SettingsStackParamList['Mptt']}
      name="Mptt"
      component={Mptt}
    />
    <Stack.Screen
      initialParams={route.params as unknown as SettingsStackParamList['EmailUs']}
      name="EmailUs"
      component={EmailUs}
    />
    <Stack.Screen name="ConnectYeti" component={ConnectYeti} initialParams={route.params} />
    <Stack.Screen name="InputLimitsHelp" component={InputLimitsHelp} />
    <Stack.Screen name="AcCurrentLimitsHelp" component={AcCurrentLimitsHelp} />
    <Stack.Screen name="AcProfileHelp" component={AcProfileHelp} />
    <Stack.Screen name="AcInputLimits" component={AcInputLimits} />
    <Stack.Screen name="HelpNav" component={HelpNavigation} />
    <Stack.Screen name="BatteryProtectionMode" component={BatteryProtectionMode} />
    <Stack.Screen name="ErrorCodes" component={ErrorCodes} />
  </Stack.Navigator>
);
