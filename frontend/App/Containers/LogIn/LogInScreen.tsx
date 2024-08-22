import React, { useCallback, useEffect, useRef, useState } from 'react';
import {
  Text,
  KeyboardAvoidingView,
  StyleSheet,
  TextInput as TextInputRN,
  Animated,
  Keyboard,
  Pressable,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { useIsFocused } from '@react-navigation/native';

import { ApplicationStyles, isIOS, Metrics, Fonts, Colors } from 'App/Themes';

import { TextInput, TextInputPassword, ButtonSimple, Button, ValidationErrorList } from 'App/Components';
import AppLogo from 'App/Images/appLogo.svg';
import CloseIcon from 'App/Images/Icons/close.svg';
import { useAppDispatch, useAppSelector, useEvents, useLoginAnimation, useLoginNavigation, useMount } from 'App/Hooks';
import { validate } from 'App/Services/Validator';
import { authActions } from 'App/Store/Auth';
import { LogIn } from 'App/Types/Validation';
import { loginRules } from './validateRules';
import AppConfig from 'App/Config/AppConfig';
import { TextInputRef } from 'App/Components/TextInput';
import { LoginStackParamList } from 'App/Types/NavigationStackParamList';

type Props = NativeStackScreenProps<LoginStackParamList, 'LogIn'>;

function LogInScreen({ route }: Props) {
  const navigation = useLoginNavigation('LogIn');
  const dispatch = useAppDispatch();
  const isFocused = useIsFocused();
  const { track, identify } = useEvents();

  const emailInputRef = useRef<TextInputRN>();
  const passwordInputRef = useRef<TextInputRN>();

  const {
    loginRequest,
    isSignedIn,
    email: userEmail,
  } = useAppSelector((state) => ({
    loginRequest: state.auth.requests?.login,
    isSignedIn: state.auth.isSignedIn,
    email: state.auth.user?.email,
  }));

  useEffect(() => {
    if (isSignedIn && !!userEmail && isFocused) {
      identify();
      track('user_logged_in', { email: userEmail });

      if (route?.params?.onSuccess) {
        route.params.onSuccess(route.params);
        return;
      }
      navigation.goBack();
    }
  }, [isSignedIn, navigation, userEmail, route.params, isFocused, track, identify]);

  const [{ email, password }, setInput] = useState<LogIn>({
    email: '',
    password: '',
  });

  const [validationErrors, setValidationErrors] = useState<{ [field: string]: string[] }>({
    email: [],
    password: [],
  });

  const [
    containerAnimated,
    sectionMainAnimated,
    forgotPasswordButtonAnimated,
    loginButtonAnimated,
    createAccountButtonAnimated,
  ] = useLoginAnimation();

  useMount(() => {
    dispatch(authActions.clearRequests());
  });

  const handleLogIn = useCallback(() => {
    const { isValid, errors } = validate({ email, password }, loginRules);

    setValidationErrors(errors);

    if (isValid) {
      Keyboard.dismiss();

      dispatch(
        authActions.login.request({
          email,
          password,
        }),
      );
    }
  }, [dispatch, email, password]);

  const handleInput = (name: keyof LogIn, value: string) => {
    setInput((prevInput) => ({ ...prevInput, [name]: value }));
  };

  return (
    <SafeAreaView style={ApplicationStyles.loginContainer}>
      <Pressable
        style={styles.closeSection}
        onPress={() => {
          dispatch(authActions.setSignInState(true));
          navigation.goBack();
        }}>
        <CloseIcon color={Colors.white} accessible={true} accessibilityLabel="Close button" />
      </Pressable>
      <KeyboardAvoidingView style={styles.container} behavior={'padding'}>
        <Pressable onPress={Keyboard.dismiss} style={ApplicationStyles.flex} accessible={false}>
          <Animated.View style={[styles.keyboardAvoidingContent, containerAnimated]}>
            <Animated.View style={sectionMainAnimated}>
              <AppLogo style={styles.logo} accessible={true} accessibilityLabel="Logo" />
              <Text style={styles.textMain} accessible={true} accessibilityLabel="Text" testID="Text">
                Log into your Goal Zero app account or create a new app account. (This is the same account used for
                goalzero.com)
              </Text>
            </Animated.View>
            <TextInput
              accessible={true}
              accessibilityLabel="Email field"
              keyboardType="email-address"
              autoCapitalize="none"
              autoCorrect={false}
              placeholder="Email"
              textInputPlaceholder="me@email.com"
              value={email}
              isError={!!validationErrors.email.length}
              onChangeText={(value) => handleInput('email', value)}
              maxLength={AppConfig.maxTextInputLength}
              returnKeyType="next"
              ref={emailInputRef as TextInputRef}
              onSubmitEditing={() => {
                (passwordInputRef as TextInputRef)?.current?.focusNextInput();
              }}
            />
            <ValidationErrorList errorList={validationErrors.email} />
            <TextInputPassword
              containerStyle={styles.passwordInput}
              placeholder="Password"
              value={password}
              isError={!!validationErrors.password.length}
              onChangeText={(value) => handleInput('password', value)}
              maxLength={AppConfig.maxTextInputLength}
              returnKeyType={isIOS ? 'go' : 'done'}
              ref={passwordInputRef as TextInputRef}
              onSubmitEditing={handleLogIn}
            />
            <ValidationErrorList errorList={validationErrors.password} />
            <Animated.View style={[styles.forgotButton, forgotPasswordButtonAnimated]}>
              <ButtonSimple
                title="Forgot Password?"
                onPress={() => navigation.navigate('ForgotPassword')}
                accessibilityLabel="Forgot Password?"
              />
            </Animated.View>
            <Animated.View style={loginButtonAnimated}>
              <Button
                disabled={loginRequest}
                showLoading={loginRequest}
                title="Log In"
                onPress={handleLogIn}
                accessibilityLabel="Log In"
              />
            </Animated.View>
            <Animated.View style={createAccountButtonAnimated}>
              <Button
                inverse
                title="Create Account"
                onPress={() => navigation.navigate('CreateAccount')}
                accessibilityLabel="Create Account"
              />
            </Animated.View>
          </Animated.View>
        </Pressable>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    marginHorizontal: Metrics.baseMargin,
    marginBottom: Metrics.baseMargin,
  },
  keyboardAvoidingContent: {
    flex: 1,
    justifyContent: 'center',
  },
  closeSection: {
    width: 32,
    height: 32,
    marginLeft: Metrics.baseMargin,
    padding: Metrics.smallMargin,
  },
  logo: {
    alignSelf: 'center',
    marginBottom: Metrics.marginSection,
  },
  textSubMain: {
    ...Fonts.font.base.bodyOne,
    color: Colors.transparentWhite('0.87'),
  },
  textMain: {
    ...Fonts.font.base.bodyOne,
    color: Colors.transparentWhite('0.87'),
    textAlign: 'center',
  },
  passwordInput: {
    marginTop: Metrics.marginSection,
  },
  forgotButton: {
    alignSelf: 'flex-end',
  },
});

export default LogInScreen;
