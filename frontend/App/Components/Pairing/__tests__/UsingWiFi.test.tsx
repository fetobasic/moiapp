import React from 'react';
import { render } from '@testing-library/react-native';
import UsingWiFi from 'App/Components/Pairing/UsingWiFi';

describe('UsingWiFi', () => {
  test('renders the component', () => {
    const { getByTestId } = render(<UsingWiFi />);
    const component = getByTestId('usingWiFi');

    expect(component).toBeTruthy();
  });
});
