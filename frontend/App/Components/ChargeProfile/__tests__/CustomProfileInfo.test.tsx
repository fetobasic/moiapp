import React from 'react';
import { render } from '@testing-library/react-native';
import CustomProfileInfo from 'App/Components/ChargeProfile/CustomProfileInfo';

describe('CustomProfileInfo', () => {
  const setup = {
    min: 0,
    re: 70,
    max: 100,
  };

  const onCustomProfileSetupChange = jest.fn();

  test('renders the component with all params', () => {
    const { getByTestId } = render(
      <CustomProfileInfo setup={setup} energy={10} onCustomProfileSetupChange={onCustomProfileSetupChange} />,
    );
    const component = getByTestId('customProfile');

    expect(component).toBeTruthy();
  });

  test('renders the component with change params params', () => {
    const { getByTestId } = render(
      <CustomProfileInfo
        setup={{
          min: 60,
          re: 50,
          max: 40,
        }}
        energy={10}
        onCustomProfileSetupChange={onCustomProfileSetupChange}
      />,
    );
    const component = getByTestId('customProfile');
    expect(component).toBeTruthy();
  });
});
