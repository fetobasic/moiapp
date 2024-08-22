import React from 'react';
import { NativeStackScreenProps, createNativeStackNavigator } from '@react-navigation/native-stack';
import { isAndroid } from 'App/Themes';
import { LogInScreen, ForgotPasswordScreen, CreateAccountScreen } from 'App/Containers/LogIn';

import { HomeStackParamList, LoginStackParamList } from 'App/Types/NavigationStackParamList';

const Stack = createNativeStackNavigator<LoginStackParamList>();

type Props = NativeStackScreenProps<HomeStackParamList, 'LoginNav'>;

export const propsForgotPassword = {
  title: 'Forgot Password',
  body: 'Please enter your Goal Zero account email address below to reset your password.',
  buttonText: 'Reset password',
};

export default ({ route }: Props) => (
  <Stack.Navigator
    screenOptions={{
      headerShown: false,
      presentation: isAndroid ? 'transparentModal' : 'card',
    }}>
    <Stack.Screen name="LogIn" initialParams={route.params} component={LogInScreen} />
    <Stack.Screen
      name="ForgotPassword"
      component={ForgotPasswordScreen}
      initialParams={{ content: propsForgotPassword }}
    />
    <Stack.Screen name="CreateAccount" component={CreateAccountScreen} />
  </Stack.Navigator>
);
