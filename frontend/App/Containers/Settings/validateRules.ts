import { Rules } from 'App/Types/Validation';
import { emailRules } from '../LogIn/validateRules';
import AppConfig from 'App/Config/AppConfig';

export const textAreaLength = 1000;

export const emailUsRules: Rules = {
  subject: [
    {
      test: (value: string) => value.length !== 0,
      isRequired: true,
      message: 'Subject is required',
    },
  ],
  email: emailRules.email,
  name: [
    {
      test: (value: string) => value.length <= AppConfig.maxTextInputLength,
      message: `Name should be no more than ${AppConfig.maxTextInputLength} characters`,
    },
  ],
  phoneNumber: [
    {
      test: (value: string) => value.length === 0 || /^\d+$/.test(value),
      message: 'Please enter a valid phone number with only digits',
    },
    {
      test: (value: string) => value.length <= AppConfig.maxTextInputLength,
      message: `Phone should be no more than ${AppConfig.maxTextInputLength} characters`,
    },
  ],
  message: [
    {
      test: (value: string) => value.length !== 0,
      isRequired: true,
      message: 'Message is required',
    },
    {
      test: (value: string) => value.length <= textAreaLength,
      message: `Message should be no more than ${textAreaLength} characters`,
    },
  ],
};
