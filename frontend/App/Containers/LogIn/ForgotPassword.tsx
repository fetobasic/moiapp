import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { View, StyleSheet, TextInput as TextInputRN } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { HeaderSimple as Header, Button, TextInput, InfoRow, ValidationErrorList } from 'App/Components';
import { ApplicationStyles, Metrics, isIOS } from 'App/Themes';

import HelpIcon from 'App/Images/Icons/information.svg';
import renderElement from 'App/Services/RenderElement';
import { validate } from 'App/Services/Validator';
import { modalInfo } from 'App/Services/Alert';
import { useAppDispatch, useAppSelector, useEvents } from 'App/Hooks';
import { authActions } from 'App/Store/Auth';
import { ForgotPassword } from 'App/Types/Validation';
import AppConfig from 'App/Config/AppConfig';
import { emailRules } from './validateRules';
import { TextInputRef } from 'App/Components/TextInput';
import { LoginStackParamList } from 'App/Types/NavigationStackParamList';
import { NativeStackScreenProps } from '@react-navigation/native-stack';

type Props = NativeStackScreenProps<LoginStackParamList, 'ForgotPassword'>;

function ForgotPasswordScreen({ navigation, route }: Props) {
  const { title, body, buttonText } = route?.params?.content || {};

  const { track } = useEvents();
  const dispatch = useAppDispatch();
  const forgotPasswordInputRef = useRef<TextInputRN>();

  const { resetPasswordSuccess, forgotPasswordRequest } = useAppSelector((state) => ({
    resetPasswordSuccess: state.auth.resetPasswordRequestSuccess,
    forgotPasswordRequest: state.auth.requests?.forgotPassword,
  }));

  const [isEmailSent, setIsEmailSent] = useState(false);

  const [{ email }, setInput] = useState<ForgotPassword>({
    email: '',
  });

  const [validationErrors, setValidationErrors] = useState<{ [field: string]: string[] }>({
    email: [],
  });

  const buttonDisabled = useMemo(() => email.length === 0 || isEmailSent, [email, isEmailSent]);

  useEffect(() => {
    if (resetPasswordSuccess && !isEmailSent) {
      setIsEmailSent(true);

      track('user_recovery_initiated', { email });

      modalInfo({
        title: 'Email Sent!',
        body: 'Please check your email to reset your password. You may need to check your junk mail.',
        type: 'INFO',
        buttons: [
          {
            title: 'OK',
            action: () => {
              dispatch(authActions.clearRequests());
              navigation.goBack();
            },
          },
        ],
      });
    }
  }, [dispatch, email, isEmailSent, navigation, resetPasswordSuccess, track]);

  const handleInput = (name: keyof ForgotPassword, value: string) => {
    setInput((prevInput) => ({ ...prevInput, [name]: value }));
  };

  const handleResetPassword = useCallback(() => {
    const { isValid, errors } = validate({ email }, emailRules);

    setValidationErrors(errors);

    if (isValid) {
      dispatch(authActions.resetPassword.request({ email }));
    }
  }, [dispatch, email]);

  return (
    <SafeAreaView edges={['bottom']} style={ApplicationStyles.loginContainer}>
      <Header
        title={title as string}
        accessibilityLabelTitle="Title"
        accessibilityLabelTopCornerButton="ArrowBack button"
      />
      <View style={styles.container}>
        <InfoRow
          title=""
          withBorder={false}
          style={styles.sectionInfo}
          icon={renderElement(<HelpIcon />)}
          subTitle={body}
          accessibilityLabel="Info"
        />
        <TextInput
          keyboardType="email-address"
          autoCapitalize="none"
          autoCorrect={false}
          placeholder="Email"
          accessibilityLabel="Email field"
          textInputPlaceholder="me@email.com"
          value={email}
          onSubmitEditing={handleResetPassword}
          isError={!!validationErrors.email.length}
          onChangeText={(value) => handleInput('email', value)}
          maxLength={AppConfig.maxTextInputLength}
          returnKeyType={isIOS ? 'go' : 'done'}
          ref={forgotPasswordInputRef as TextInputRef}
        />
        <ValidationErrorList errorList={validationErrors.email} accessibilityLabel="Email error list" />
        <Button
          style={styles.button}
          inverse={buttonDisabled}
          disabled={buttonDisabled || forgotPasswordRequest}
          showLoading={!buttonDisabled && forgotPasswordRequest}
          title={buttonText as string}
          accessibilityLabel="Reset Password"
          onPress={handleResetPassword}
        />
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    marginHorizontal: Metrics.baseMargin,
  },
  sectionInfo: {
    paddingVertical: Metrics.baseMargin,
  },
  button: {
    marginTop: Metrics.marginSection,
  },
});

export default ForgotPasswordScreen;
