export type Rule = {
  test?: (value: string) => boolean;
  message?: string;
  isRequired?: boolean;
};

export type Rules = {
  [field: string]: Rule[];
};

export type ValidationResult = {
  isValid: boolean;
  errors: { [field: string]: string[] };
};

export type CreateAccount = {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  termsChecked: boolean;
  privacyChecked: boolean;
};

export type EditAccount = {
  firstName: string;
  lastName: string;
  email: string;
};

export type LogIn = {
  email: string;
  password: string;
};

export type ForgotPassword = {
  email: string;
};
