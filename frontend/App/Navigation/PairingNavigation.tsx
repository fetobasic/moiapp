import React from 'react';
import { createNativeStackNavigator, NativeStackScreenProps } from '@react-navigation/native-stack';

import AddNewDevice from 'App/Containers/Pairing/AddNewDevice';
import SelectConnect from 'App/Containers/Pairing/SelectConnect';
import ConnectYeti from 'App/Containers/Pairing/ConnectYeti';
import FindWifiNetwork from 'App/Containers/Pairing/FindWifiNetwork';
import ChangeYetiWifiPassword from 'App/Containers/Pairing/ChangeYetiWifiPassword';
import SelectWifiNetwork from 'App/Containers/Pairing/SelectWifiNetwork';
import EnterWifiPassword from 'App/Containers/Pairing/EnterWifiPassword';
import BluetoothHelp from 'App/Containers/Pairing/BluetoothHelp';
import PairingMode from 'App/Containers/Settings/PairingMode';
import PairingModeHelp from 'App/Containers/Common/PairingModeHelp';

import { PairingStackParamList, HomeStackParamList } from 'App/Types/NavigationStackParamList';
import HelpNavigation from './HelpNavigation';
import UpdateFirmware from 'App/Containers/Settings/UpdateFirmware';
import Connection from 'App/Containers/Settings/Connection';
import { EnterNetworkManually } from 'App/Containers/Pairing/EnterNetworkManually';
import LoginNavigation from './LoginNavigation';
import { isIOS } from 'App/Themes';

const Stack = createNativeStackNavigator<PairingStackParamList>();

type Props = NativeStackScreenProps<HomeStackParamList, 'StartPairing'>;

export default ({ route }: Props) => (
  <Stack.Navigator
    initialRouteName={(route?.params?.initialRouteName as keyof PairingStackParamList) || 'AddNewDevice'}
    screenOptions={{
      headerShown: false,
      gestureEnabled: false,
      presentation: 'containedTransparentModal',
    }}>
    <Stack.Group
      screenOptions={{
        headerShown: false,
        presentation: 'card',
        animation: isIOS ? 'default' : 'slide_from_right',
      }}>
      <Stack.Screen name="AddNewDevice" component={AddNewDevice} initialParams={route.params} />
      <Stack.Screen name="BluetoothHelp" component={BluetoothHelp} />
      <Stack.Screen name="PairingMode" component={PairingMode} />
      <Stack.Screen name="EnterNetworkManually" component={EnterNetworkManually} />
      <Stack.Screen
        name="Connection"
        component={Connection}
        initialParams={route.params as unknown as PairingStackParamList['Connection']}
      />
      <Stack.Screen
        name="PairingModeHelp"
        component={PairingModeHelp}
        initialParams={route.params as unknown as PairingStackParamList['PairingModeHelp']}
      />
      <Stack.Screen name="SelectConnect" component={SelectConnect} initialParams={route.params} />
      <Stack.Screen name="ConnectYeti" component={ConnectYeti} initialParams={route.params} />
      <Stack.Screen name="FindWifiNetwork" component={FindWifiNetwork} initialParams={route.params} />
      <Stack.Screen name="ChangeYetiWifiPassword" component={ChangeYetiWifiPassword} initialParams={route.params} />
      <Stack.Screen name="SelectWifiNetwork" component={SelectWifiNetwork} initialParams={route.params} />
      <Stack.Screen name="EnterWifiPassword" component={EnterWifiPassword} initialParams={route.params} />
      <Stack.Screen
        name="UpdateFirmware"
        component={UpdateFirmware}
        initialParams={route.params as unknown as PairingStackParamList['UpdateFirmware']}
      />
      <Stack.Screen name="LoginNav" component={LoginNavigation} initialParams={route.params} />
      <Stack.Screen name="HelpNav" component={HelpNavigation} />
    </Stack.Group>
  </Stack.Navigator>
);
