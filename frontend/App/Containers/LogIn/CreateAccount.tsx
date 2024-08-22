import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { KeyboardAvoidingView, Text, StyleSheet, ScrollView, TextInput as TextInputRN, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import {
  HeaderSimple as Header,
  Button,
  TextInput,
  InfoRow,
  TextInputPassword,
  CheckBox,
  ValidationErrorList,
} from 'App/Components';
import { ApplicationStyles, Colors, Fonts, isIOS, Metrics } from 'App/Themes';

import HelpIcon from 'App/Images/Icons/information.svg';
import renderElement from 'App/Services/RenderElement';
import { validate } from 'App/Services/Validator';
import { modalInfo, showError } from 'App/Services/Alert';
import { useAppDispatch, useAppSelector, useEvents, useHomeNavigation, useMount } from 'App/Hooks';
import openBrowser from 'App/Services/Browser';
import Links from 'App/Config/Links';
import { authActions } from 'App/Store/Auth';
import { CreateAccount } from 'App/Types/Validation';
import { createAccountRules } from './validateRules';
import AppConfig from 'App/Config/AppConfig';
import { TextInputRef } from 'App/Components/TextInput';

function CreateAccountScreen() {
  const dispatch = useAppDispatch();
  const navigation = useHomeNavigation('EditAccount');
  const { track, identify } = useEvents();

  const firstNameInputRef = useRef<TextInputRN>();
  const lastNameInputRef = useRef<TextInputRN>();
  const emailInputRef = useRef<TextInputRN>();
  const passwordInputRef = useRef<TextInputRN>();

  const { accessToken, signUpRequest, signUpError } = useAppSelector((state) => ({
    accessToken: state.auth.auth?.accessToken,
    signUpRequest: state.auth.requests?.signUp,
    signUpError: state.auth.errors?.signUp,
  }));

  const [{ firstName, lastName, email, password, termsChecked, privacyChecked }, setInput] = useState<CreateAccount>({
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    termsChecked: false,
    privacyChecked: false,
  });

  const [validationErrors, setValidationErrors] = useState<{ [field: string]: string[] }>({
    firstName: [],
    lastName: [],
    email: [],
    password: [],
    termsChecked: [],
    privacyChecked: [],
  });

  const buttonDisabled = useMemo(() => !termsChecked || !privacyChecked, [privacyChecked, termsChecked]);

  useMount(() => {
    return () => {
      dispatch(authActions.clearRequests());
    };
  });

  useEffect(() => {
    if (accessToken) {
      identify();
      track('user_created');

      modalInfo({
        title: 'Success!',
        body: 'Your account was created.',
        type: 'INFO',
        buttons: [
          {
            title: 'OK',
            action: () => {
              dispatch(authActions.setSignInState(true));
              navigation.popToTop();
            },
          },
        ],
      });
    }
  }, [accessToken, dispatch, identify, navigation, track]);

  useEffect(() => {
    if (signUpError) {
      showError(signUpError);
    }
  }, [signUpError]);

  const handleCreateAccount = useCallback(() => {
    const { isValid, errors } = validate(
      { firstName, lastName, email, password, termsChecked, privacyChecked },
      createAccountRules,
    );

    setValidationErrors(errors);

    if (isValid) {
      dispatch(
        authActions.signUp.request({
          firstName,
          lastName,
          email,
          password,
        }),
      );
    }
  }, [dispatch, email, firstName, lastName, password, termsChecked, privacyChecked]);

  const handleInput = (name: keyof CreateAccount, value: string | boolean) => {
    setInput((prevInput) => ({ ...prevInput, [name]: value }));
  };

  return (
    <SafeAreaView edges={['bottom']} style={ApplicationStyles.loginContainer}>
      <Header
        title="Create Account"
        accessibilityLabelTitle="Title"
        accessibilityLabelTopCornerButton="ArrowBack button"
      />
      <KeyboardAvoidingView style={styles.container} behavior={isIOS ? 'padding' : 'height'}>
        <ScrollView style={styles.wrapper} accessible={false}>
          <InfoRow
            title=""
            withBorder={false}
            style={styles.sectionInfo}
            icon={renderElement(<HelpIcon />)}
            body={renderElement(
              <Text style={styles.textBody} accessible={true} accessibilityLabel="Info">
                Please enter your account information below to create an account.
              </Text>,
            )}
          />
          <TextInput
            autoCapitalize="none"
            autoCorrect={false}
            placeholder="First Name (Optional)"
            accessibilityLabel="First Name field"
            value={firstName}
            onChangeText={(value) => handleInput('firstName', value)}
            isError={!!validationErrors.firstName.length}
            maxLength={AppConfig.maxTextInputLength}
            returnKeyType="next"
            ref={firstNameInputRef as TextInputRef}
            onSubmitEditing={() => {
              (lastNameInputRef as TextInputRef)?.current?.focusNextInput();
            }}
          />
          <ValidationErrorList errorList={validationErrors.firstName} accessibilityLabel="First Name error list" />
          <TextInput
            containerStyle={styles.textInput}
            autoCapitalize="none"
            autoCorrect={false}
            placeholder="Last Name (Optional)"
            accessibilityLabel="Last Name field"
            isError={!!validationErrors.lastName.length}
            value={lastName}
            onChangeText={(value) => handleInput('lastName', value)}
            maxLength={AppConfig.maxTextInputLength}
            returnKeyType="next"
            ref={lastNameInputRef as TextInputRef}
            onSubmitEditing={() => {
              (emailInputRef as TextInputRef)?.current?.focusNextInput();
            }}
          />
          <ValidationErrorList errorList={validationErrors.lastName} accessibilityLabel="Last Name error list" />
          <TextInput
            containerStyle={styles.textInput}
            keyboardType="email-address"
            autoCapitalize="none"
            autoCorrect={false}
            placeholder="Email"
            accessibilityLabel="Email field"
            isError={!!validationErrors.email.length}
            value={email}
            onChangeText={(value) => handleInput('email', value)}
            maxLength={AppConfig.maxTextInputLength}
            returnKeyType="next"
            ref={emailInputRef as TextInputRef}
            onSubmitEditing={() => {
              (passwordInputRef as TextInputRef)?.current?.focusNextInput();
            }}
          />
          <ValidationErrorList errorList={validationErrors.email} accessibilityLabel="Email error list" />
          <TextInputPassword
            containerStyle={styles.textInput}
            placeholder="Password"
            isError={!!validationErrors.password.length}
            value={password}
            onChangeText={(value) => handleInput('password', value)}
            maxLength={AppConfig.maxTextInputLength}
            returnKeyType={isIOS ? 'go' : 'done'}
            ref={passwordInputRef as TextInputRef}
            onSubmitEditing={handleCreateAccount}
          />
          <ValidationErrorList errorList={validationErrors.password} accessibilityLabel="Password error list" />
          <CheckBox
            roundCheckbox
            value={termsChecked}
            style={styles.checkBox}
            onPress={() => handleInput('termsChecked', !termsChecked)}
            accessibilityLabelCheckBox="Terms check"
            accessibilityTestIdCheckBox="Terms check"
            body={renderElement(
              <View style={styles.container} accessible={false}>
                <Text style={styles.textBody}>
                  I agree to GOAL ZERO{' '}
                  <Text
                    accessible={true}
                    accessibilityLabel="Terms link"
                    testID="Terms link"
                    style={styles.textHighlight}
                    suppressHighlighting
                    onPress={() => openBrowser(Links.termsUrl)}>
                    Terms and Conditions.
                  </Text>
                </Text>
              </View>,
            )}
          />
          <CheckBox
            roundCheckbox
            value={privacyChecked}
            style={styles.checkBox}
            onPress={() => handleInput('privacyChecked', !privacyChecked)}
            accessibilityLabelCheckBox="Privacy check"
            accessibilityTestIdCheckBox="Privacy check"
            body={renderElement(
              <View style={styles.container} accessible={false}>
                <Text style={styles.textBody}>
                  I consent to the collection and use of my personal information in accordance with GOAL ZERO’s
                  <Text
                    accessible={true}
                    accessibilityLabel="Privacy link"
                    testID="Privacy link"
                    style={styles.textHighlight}
                    suppressHighlighting
                    onPress={() => openBrowser(Links.privacyUrl)}>
                    {' '}
                    Privacy Policy.
                  </Text>
                </Text>
              </View>,
            )}
          />
          <Button
            style={styles.button}
            inverse={buttonDisabled}
            disabled={buttonDisabled || signUpRequest}
            showLoading={signUpRequest && !buttonDisabled}
            title="CREATE ACCOUNT"
            accessibilityLabel="CREATE ACCOUNT"
            onPress={handleCreateAccount}
          />
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  wrapper: {
    paddingHorizontal: Metrics.baseMargin,
  },
  sectionInfo: {
    paddingVertical: Metrics.baseMargin,
  },
  button: {
    marginTop: Metrics.marginSection,
    marginBottom: Metrics.smallMargin,
  },
  checkBox: {
    marginTop: Metrics.baseMargin,
  },
  textInput: {
    marginTop: Metrics.marginSection,
  },
  textBody: {
    ...Fonts.font.base.bodyOne,
    color: Colors.transparentWhite('0.87'),
  },
  textHighlight: {
    color: Colors.green,
  },
  textSubtitle: {
    ...Fonts.font.base.caption,
    color: Colors.transparentWhite('0.87'),
    marginTop: Metrics.halfMargin,
  },
  textAtantion: {
    color: Colors.severity.red,
  },
});

export default CreateAccountScreen;
