import { isEmail, validate } from 'App/Services/Validator';
import { isString } from 'lodash';

const rules = {
  email: [
    {
      isRequired: true,
      test: (value: string) => isEmail(value),
      message: 'Invalid email',
    },
  ],
  name: [
    {
      isRequired: true,
      test: (value: string) => isString(value),
      message: 'Invalid name',
    },
  ],
};

describe('Validator', () => {
  describe('isEmail', () => {
    test('Returns true for a valid email', () => {
      const validEmail = 'test@example.com';
      expect(isEmail(validEmail)).toBeTruthy();
    });

    test('Returns false for an invalid email', () => {
      const invalidEmail = 'invalid-email';
      expect(isEmail(invalidEmail)).toBeFalsy();
    });
  });

  describe('validate', () => {
    test('Validates a valid input based on rules', () => {
      const input = {
        email: 'test@example.com',
        name: 'Test',
        checked: true,
      };

      const customRules = {
        ...rules,
        checked: [{ isRequired: true }],
      };

      const validationResult = validate(input, customRules);

      expect(validationResult.isValid).toBeTruthy();
      expect(validationResult.errors).toEqual({ email: [], name: [], checked: [] });
    });

    test('Validates an invalid input based on rules', () => {
      const input = {
        email: 'invalid-email',
        name: 123,
      };

      // @ts-ignore as we want to test invalid rules
      const validationResult = validate(input, rules);

      expect(validationResult.isValid).toBeFalsy();
      expect(validationResult.errors).toEqual({
        email: ['Invalid email'],
        name: ['Invalid name'],
      });
    });

    test('Validates input with missing required field', () => {
      const input = {
        name: 'Test',
        email: '',
      };

      const validationResult = validate(input, rules);

      expect(validationResult.isValid).toBeFalsy();
      expect(validationResult.errors).toEqual({
        email: ['Invalid email'],
        name: [],
      });
    });
  });

  test('Validates input with not required rules', () => {
    const input = {
      email: '',
    };

    const customRules = {
      email: [{ ...rules.email[0], isRequired: false }],
    };

    const validationResult = validate(input, customRules);

    expect(validationResult.isValid).toBeFalsy();
    expect(validationResult.errors).toEqual({
      email: ['Invalid email'],
    });
  });
});
