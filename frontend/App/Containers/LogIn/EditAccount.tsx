import React, { useCallback, useEffect, useRef, useState } from 'react';
import { KeyboardAvoidingView, StyleSheet, ScrollView, TextInput as TextInputRN, View, Image } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useIsFocused } from '@react-navigation/native';

import {
  Button,
  HeaderSimple as Header,
  InformationRow as Row,
  TextInput,
  ValidationErrorList,
  Spinner,
} from 'App/Components';
import { ApplicationStyles, Images, isIOS, Metrics } from 'App/Themes';
import { validate } from 'App/Services/Validator';
import { useAppDispatch, useAppSelector, useEvents } from 'App/Hooks';
import { EditAccount } from 'App/Types/Validation';
import { accountRules } from './validateRules';
import AppConfig from 'App/Config/AppConfig';
import { TextInputRef } from 'App/Components/TextInput';
import { authActions } from 'App/Store/Auth';
import DeleteBasketIcon from 'App/Images/Icons/deleteBasket.svg';
import LogoutIcon from 'App/Images/Icons/logout.svg';
import { modalInfo, showError } from 'App/Services/Alert';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { HomeStackParamList } from 'App/Types/NavigationStackParamList';
import { propsResetPassword } from 'App/Navigation/HomeNavigation';

type Props = NativeStackScreenProps<HomeStackParamList, 'EditAccount'>;

function EditAccountScreen({ navigation }: Props) {
  const dispatch = useAppDispatch();
  const isFocused = useIsFocused();
  const { track, identify } = useEvents();

  const [showLoader, setShowLoader] = useState(false);

  const firstNameInputRef = useRef<TextInputRN>();
  const lastNameInputRef = useRef<TextInputRN>();
  const emailInputRef = useRef<TextInputRN>();

  const { user, isUpdateUserRequestSuccess, isEditAccountLoading, editAccountError, isSignedIn } = useAppSelector(
    (state) => ({
      user: state.auth.user,
      isSignedIn: state.auth.isSignedIn,
      isUpdateUserRequestSuccess: state.auth.updateUserRequestSuccess,
      isEditAccountLoading: state.auth.requests?.updateUser,
      editAccountError: state.auth.errors?.updateUser,
    }),
  );

  const {
    firstName: userFirstName,
    lastName: userLastName,
    email: userEmail,
  } = user || {
    firstName: '',
    lastName: '',
    email: '',
  };

  const [{ firstName, lastName, email }, setInput] = useState<EditAccount>({
    firstName: userFirstName,
    lastName: userLastName,
    email: userEmail,
  });

  const [validationErrors, setValidationErrors] = useState<{ [field: string]: string[] }>({
    firstName: [],
    lastName: [],
    email: [],
  });

  useEffect(() => {
    if (!isSignedIn && isFocused) {
      track('user_logged_out');
      identify({ reset: true });

      navigation.goBack();
    }
  }, [identify, isFocused, isSignedIn, navigation, track, userEmail]);

  useEffect(() => {
    if (isUpdateUserRequestSuccess) {
      track('user_updated');

      modalInfo({
        title: 'Success!',
        body: 'Your account was edited.',
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
  }, [dispatch, isUpdateUserRequestSuccess, navigation, track]);

  useEffect(() => {
    if (editAccountError) {
      showError(editAccountError);
    }
  }, [editAccountError]);

  const handleEditAccount = useCallback(() => {
    const { isValid, errors } = validate({ firstName, lastName, email }, accountRules);

    setValidationErrors(errors);

    if (isValid) {
      dispatch(
        authActions.updateUser.request({
          firstName,
          lastName,
          email,
        }),
      );
    }
  }, [dispatch, email, firstName, lastName]);

  const handleInput = (name: keyof EditAccount, value: string | boolean) => {
    setInput((prevInput) => ({ ...prevInput, [name]: value }));
  };

  const handleLogoutModal = () =>
    modalInfo({
      title: 'Log Out',
      body: 'Are you sure you would like to log out?',
      type: 'INFO',
      hideIcon: true,
      buttons: [
        {
          title: 'Cancel',
          inverse: true,
        },
        {
          title: 'Log Out',
          action: () => {
            dispatch(authActions.logout.request());
            setShowLoader(true);
          },
        },
      ],
    });

  const rows = [
    {
      title: 'Reset Password',
      rightIcon: (
        <View style={styles.arrow}>
          <Image source={Images.arrowForward} />
        </View>
      ),
      onPress: () => navigation.navigate('ForgotPassword', { content: propsResetPassword }),
    },
    {
      title: 'Log Out',
      rightIcon: <LogoutIcon />,
      onPress: handleLogoutModal,
    },
    {
      title: 'Delete Account',
      rightIcon: <DeleteBasketIcon />,
      onPress: () => navigation.navigate('DeleteAccount'),
    },
  ];

  return (
    <SafeAreaView edges={['bottom']} style={ApplicationStyles.loginContainer}>
      <Header title="Account" />
      <KeyboardAvoidingView style={styles.container} behavior={isIOS ? 'padding' : 'height'}>
        <ScrollView contentContainerStyle={styles.scrollViewContent}>
          <View style={styles.inputs}>
            <TextInput
              autoCapitalize="none"
              autoCorrect={false}
              placeholder="First Name (Optional)"
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
            <ValidationErrorList errorList={validationErrors.firstName} />
            <TextInput
              containerStyle={styles.textInput}
              autoCapitalize="none"
              autoCorrect={false}
              placeholder="Last Name (Optional)"
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
            <ValidationErrorList errorList={validationErrors.lastName} />
            <TextInput
              containerStyle={styles.textInput}
              keyboardType="email-address"
              autoCapitalize="none"
              autoCorrect={false}
              placeholder="Email"
              isError={!!validationErrors.email.length}
              value={email}
              onChangeText={(value) => handleInput('email', value)}
              maxLength={AppConfig.maxTextInputLength}
              returnKeyType="next"
              ref={emailInputRef as TextInputRef}
            />
            <ValidationErrorList errorList={validationErrors.email} />
            <View style={styles.textInput}>
              {rows.map((row) => (
                <Row key={row.title} title={row.title} rightIcon={row?.rightIcon} onPress={row?.onPress} />
              ))}
            </View>
          </View>
          <View style={styles.footer}>
            <Button
              disabled={isEditAccountLoading}
              showLoading={isEditAccountLoading}
              title="Save"
              onPress={handleEditAccount}
            />
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
      <Spinner visible={showLoader} />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollViewContent: {
    paddingHorizontal: Metrics.baseMargin,
    paddingTop: Metrics.baseMargin,
    paddingBottom: Metrics.smallMargin,
    flexGrow: 1,
    justifyContent: 'space-between',
  },
  arrow: { justifyContent: 'center', alignItems: 'center', width: 18 },
  inputs: { flex: 1, paddingTop: 15 },
  footer: { flex: 1, justifyContent: 'flex-end' },
  textInput: {
    marginTop: Metrics.marginSection,
  },
});

export default EditAccountScreen;
