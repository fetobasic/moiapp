import React, { useEffect, useMemo, useRef, useState } from 'react';
import { View, StyleSheet, TextInput as TextInputRN, ScrollView, Keyboard } from 'react-native';
import { ApplicationStyles, Metrics } from 'App/Themes';
import { Button, CustomPickerSelect, HeaderSimple as Header, TextInput } from 'App/Components';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { HelpStackParamList } from 'App/Types/NavigationStackParamList';
import ValidationErrorList from 'App/Components/ValidationErrorList';
import { validate } from 'App/Services/Validator';
import { emailUsRules, textAreaLength } from './validateRules';
import { getSubjectData, AdditionalSubjectType } from 'App/Config/FeedbackFormTypes';
import { useAppSelector, useEvents, useMount } from 'App/Hooks';
import { applicationActions } from 'App/Store/Application';
import { useDispatch } from 'react-redux';
import { SubjectType } from 'App/Types/FeedbackForm';
import { modalInfo, showSnackbarMessage } from 'App/Services/Alert';
import AppConfig from 'App/Config/AppConfig';
import { TextInputRef } from 'App/Components/TextInput';
import { useKeyboard } from '@react-native-community/hooks';

type Props = NativeStackScreenProps<HelpStackParamList, 'EmailUs'>;
type EmailUs = {
  subject: string;
  email: string;
  phoneNumber: string;
  message: string;
  name: string;
};

const EmailUs = ({ route, navigation }: Props) => {
  const { yeti, firmwareVersionFailed, thingName, feedbackSubject } = route.params || {};
  const dispatch = useDispatch();
  const { keyboardShown, keyboardHeight } = useKeyboard();
  const { track } = useEvents();

  const emailInputRef = useRef<TextInputRN>();
  const nameInputRef = useRef<TextInputRN>();
  const phoneNumberInputRef = useRef<TextInputRN>();
  const messageInputRef = useRef<TextInputRN>();
  const isTracking = useRef(false);

  const { feedbackFormInfo, userEmail } = useAppSelector((state) => ({
    feedbackFormInfo: state.application.feedbackFormInfo,
    userEmail: state.auth?.user?.email || '',
  }));

  const [{ subject, email, phoneNumber, message, name }, setInput] = useState<EmailUs>({
    subject: feedbackSubject || '',
    email: userEmail,
    phoneNumber: '',
    message: '',
    name: '',
  });

  const [validationErrors, setValidationErrors] = useState<{ [field: string]: string[] }>({
    subject: [],
    email: [],
    phoneNumber: [],
    message: [],
    name: [],
  });

  useEffect(() => {
    if (feedbackFormInfo?.isSuccess) {
      if (!isTracking.current) {
        isTracking.current = true;
        track('feedback_sent', {
          subject,
          email,
          name,
          phoneNumber,
          thingName,
        });
      }

      modalInfo({
        title: 'Thank You!',
        body: 'Your message has been sent.',
        type: 'INFO',
        buttons: [{ title: 'OK', action: () => navigation.goBack() }],
      });
      setInput({ subject: '', email: '', phoneNumber: '', message: '', name: '' });
      Keyboard.dismiss();
    }

    if (feedbackFormInfo?.isError) {
      showSnackbarMessage("Can't send feedback. Try again later.", true);
      Keyboard.dismiss();
    }
  }, [email, feedbackFormInfo, navigation, phoneNumber, name, subject, thingName, track]);

  useMount(() => {
    return () => {
      dispatch(applicationActions.clearFeedbackFormInfo());
    };
  });

  const onChangeHandler = (value: string, keyName: keyof EmailUs) =>
    setInput((prevState) => ({ ...prevState, [keyName]: value }));

  const onSendHandler = () => {
    const { isValid, errors } = validate({ subject, email, name, phoneNumber, message }, emailUsRules);

    setValidationErrors(errors);

    if (!isValid) {
      Keyboard.dismiss();
    }

    if (isValid) {
      dispatch(
        applicationActions.sendFeedbackForm.request({
          email,
          message,
          name,
          phoneNumber,
          subject: subject as SubjectType,
          yeti,
          firmwareVersionFailed,
          thingName,
        }),
      );
    }
  };

  const isBtnDisabled: boolean = useMemo(
    () => Boolean(feedbackFormInfo?.isSuccess || feedbackFormInfo?.isSending),
    [feedbackFormInfo?.isSending, feedbackFormInfo?.isSuccess],
  );

  return (
    <View style={ApplicationStyles.mainContainer}>
      <Header title="Email Us" />
      <ScrollView
        style={styles.container}
        keyboardShouldPersistTaps="handled"
        contentContainerStyle={keyboardShown && { paddingBottom: keyboardHeight + 30 }}>
        <View style={styles.selectContainer}>
          <View style={styles.input}>
            <CustomPickerSelect
              isError={!!validationErrors.subject.length}
              isBottomMargin={false}
              data={getSubjectData(feedbackSubject as AdditionalSubjectType)}
              value={subject}
              placeholder="Select Subject"
              onSelect={(item) => onChangeHandler(item?.value, 'subject')}
            />
            <ValidationErrorList errorList={validationErrors.subject} />
          </View>
          <View style={styles.input}>
            <TextInput
              value={email}
              onChangeText={(value) => onChangeHandler(value, 'email')}
              keyboardType="email-address"
              autoCapitalize="none"
              autoCorrect={false}
              placeholder="Email"
              isError={!!validationErrors.email.length}
              maxLength={AppConfig.maxTextInputLength}
              returnKeyType="next"
              ref={emailInputRef as TextInputRef}
              onSubmitEditing={() => {
                (nameInputRef as TextInputRef)?.current?.focusNextInput();
              }}
            />
            <ValidationErrorList errorList={validationErrors.email} />
          </View>
          <View style={styles.input}>
            <TextInput
              value={name}
              onChangeText={(value) => onChangeHandler(value, 'name')}
              style={styles.textInput}
              placeholder="Name (Optional)"
              isError={!!validationErrors.name.length}
              maxLength={AppConfig.maxTextInputLength}
              returnKeyType="next"
              ref={nameInputRef as TextInputRef}
              onSubmitEditing={() => {
                (phoneNumberInputRef as TextInputRef)?.current?.focusNextInput();
              }}
            />
            <ValidationErrorList errorList={validationErrors.name} />
          </View>
          <View style={styles.input}>
            <TextInput
              value={phoneNumber}
              onChangeText={(value) => onChangeHandler(value, 'phoneNumber')}
              placeholder="Phone Number (Optional)"
              isError={!!validationErrors.phoneNumber.length}
              maxLength={AppConfig.maxTextInputLength}
              returnKeyType="done"
              keyboardType="number-pad"
              ref={phoneNumberInputRef as TextInputRef}
              onSubmitEditing={() => {
                (messageInputRef as TextInputRef)?.current?.focusNextInput();
              }}
            />
            <ValidationErrorList errorList={validationErrors.phoneNumber} />
          </View>
          <View>
            <TextInput
              value={message}
              onChangeText={(value) => onChangeHandler(value, 'message')}
              numberOfLines={10}
              multiline
              style={styles.textInput}
              placeholder="Message"
              containerStyle={styles.textArea}
              isError={!!validationErrors.message.length}
              maxLength={textAreaLength}
              returnKeyType="next"
              ref={messageInputRef as TextInputRef}
            />
            <ValidationErrorList errorList={validationErrors.message} />
            <ValidationErrorList style={styles.validation} errorList={['Max 1000 Characters']} />
          </View>
          <Button disabled={isBtnDisabled} inverse={isBtnDisabled} title="SEND" onPress={onSendHandler} />
        </View>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingVertical: Metrics.marginSection,
    paddingHorizontal: Metrics.baseMargin,
  },
  selectContainer: {
    paddingTop: 10,
  },
  input: {
    marginBottom: Metrics.halfMargin,
  },
  textInput: {
    height: '90%',
    textAlignVertical: 'top',
  },
  textArea: {
    height: 140,
  },
  validation: {
    marginBottom: Metrics.halfMargin,
  },
});

export default EmailUs;
