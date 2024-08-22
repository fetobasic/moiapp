import React from 'react';
import { createNativeStackNavigator, NativeStackScreenProps } from '@react-navigation/native-stack';

import HelpScreen from 'App/Containers/Settings/HelpScreen';
import PairingMode from 'App/Containers/Settings/PairingMode';
import PairingModeHelp from 'App/Containers/Common/PairingModeHelp';
import EmailUs from 'App/Containers/Settings/EmailUs';
import { HomeStackParamList, HelpStackParamList } from 'App/Types/NavigationStackParamList';
import { isAndroid } from 'App/Themes';

const Stack = createNativeStackNavigator<HelpStackParamList>();
type Props = NativeStackScreenProps<HomeStackParamList, 'HelpNav'>;

export default ({ route }: Props) => (
  <Stack.Navigator
    screenOptions={{
      headerShown: false,
      presentation: isAndroid ? 'transparentModal' : 'card',
    }}>
    <Stack.Screen name="Help" component={HelpScreen} />
    <Stack.Screen name="PairingMode" component={PairingMode} />
    <Stack.Screen name="PairingModeHelp" component={PairingModeHelp} />
    <Stack.Screen initialParams={route.params} name="EmailUs" component={EmailUs} />
  </Stack.Navigator>
);
