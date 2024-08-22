import React from 'react';
import { render } from '@testing-library/react-native';
import Battery from 'App/Components/ChargeProfile/Battery';

describe('Battery', () => {
  test('renders the component with all min params', () => {
    const { getByTestId } = render(<Battery min={0} re={0} max={0} />);
    const component = getByTestId('battery');

    expect(component).toBeTruthy();
  });

  test('renders the component with all max params', () => {
    const { getByTestId } = render(<Battery min={100} re={100} max={100} />);
    const component = getByTestId('battery');

    expect(component).toBeTruthy();
  });

  test('renders the component with normal params', () => {
    const { getByTestId } = render(<Battery min={0} re={70} max={100} />);
    const component = getByTestId('battery');

    expect(component).toBeTruthy();
  });
});
