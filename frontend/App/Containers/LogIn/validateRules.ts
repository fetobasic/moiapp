import AppConfig from 'App/Config/AppConfig';
import { isEmail } from 'App/Services/Validator';
import { Rules } from 'App/Types/Validation';

export const emailRules: Rules = {
  email: [
    {
      test: (value: string) => value.length !== 0,
      message: 'Email is required',
      isRequired: true,
    },
    {
      test: (value: string) => value.length <= AppConfig.maxTextInputLength,
      message: `Email should be no more than ${AppConfig.maxTextInputLength} characters`,
    },
    {
      test: isEmail,
      message: 'Email should be a valid email address',
    },
  ],
};

export const loginRules: Rules = {
  email: [
    {
      test: (value: string) => value.length !== 0,
      message: 'Email is required',
      isRequired: true,
    },
  ],
  password: [
    {
      test: (value: string) => value.length !== 0,
      message: 'Password is required',
      isRequired: true,
    },
  ],
};

export const accountRules: Rules = {
  firstName: [
    {
      test: (value: string) => value.length <= AppConfig.maxTextInputLength,
      message: `First Name should be no more than ${AppConfig.maxTextInputLength} characters`,
    },
  ],
  lastName: [
    {
      test: (value: string) => value.length <= AppConfig.maxTextInputLength,
      message: `Last Name should be no more than ${AppConfig.maxTextInputLength} characters`,
    },
  ],
  email: emailRules.email,
};

export const createAccountRules: Rules = {
  ...accountRules,
  password: [
    {
      test: (value: string) => value.length !== 0,
      message: 'Password is required',
      isRequired: true,
    },
    {
      test: (value: string) => value.length >= AppConfig.passwordLength && value.length <= AppConfig.maxTextInputLength,
      message: `Password should be between ${AppConfig.passwordLength} and ${AppConfig.maxTextInputLength} characters`,
    },
    {
      test: (value: string) => /[a-z]/.test(value),
      message: 'Password should contain at least one lowercase letter',
    },
    {
      test: (value: string) => /[A-Z]/.test(value),
      message: 'Password should contain at least one uppercase letter',
    },
    {
      test: (value: string) => /\d/.test(value),
      message: 'Password should contain at least one number',
    },
    {
      test: (value: string) => /[!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?]/.test(value),
      message: 'Password should contain at least one special character',
    },
  ],
  termsChecked: [
    {
      message: 'Terms and Conditions is required',
      isRequired: true,
    },
  ],
  privacyChecked: [
    {
      message: 'Privacy Policy is required',
      isRequired: true,
    },
  ],
};
