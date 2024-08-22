import { Rules, ValidationResult } from 'App/Types/Validation';

export const isEmail = (email: string) => {
  const re =
    /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
  return re.test(String(email).toLowerCase());
};

export const validate = (input: Record<string, string | boolean>, rules: Rules): ValidationResult => {
  const errors: { [field: string]: string[] } = {};

  Object.entries(input).forEach(([field, value]) => {
    const fieldRules = rules[field];

    if (fieldRules) {
      const requiredRule = fieldRules.find((rule) => rule.isRequired);
      const notRequiredRules = fieldRules.filter((rule) => !rule.isRequired);
      const isValidChecked = typeof value === 'boolean' && value;
      const isValidString = typeof value === 'string' && requiredRule?.test?.(value);

      errors[field] = [];

      if (requiredRule && !isValidChecked && !isValidString) {
        errors[field] = [requiredRule.message as string];
      } else if (typeof value === 'string') {
        notRequiredRules.forEach((rule) => {
          if (!rule.test?.(value)) {
            if (!errors[field]) {
              errors[field] = [];
            }
            errors[field].push(rule.message as string);
          }
        });
      }
    }
  });

  const isValid = Object.values(errors).every((fieldErrors) => fieldErrors.length === 0);

  return { isValid, errors };
};
