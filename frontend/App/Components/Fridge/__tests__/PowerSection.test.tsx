import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import PowerSection from 'App/Components/Fridge/PowerSection';
import { fridgeAlta80State, fridgeAlta50State } from 'App/Fixtures/fridgeState';

describe('PowerSection', () => {
  test('renders the component with Alta 80 params', () => {
    const { getByTestId } = render(<PowerSection {...fridgeAlta80State} />);
    const component = getByTestId('powerSection');

    expect(component).toBeTruthy();

    const switchCustom = getByTestId('switchCustom');

    fireEvent.press(switchCustom);
    fireEvent.press(switchCustom);
  });

  test('renders the component with Alta 50 params', () => {
    const { getByTestId } = render(<PowerSection {...fridgeAlta50State} />);
    const component = getByTestId('powerSection');

    expect(component).toBeTruthy();
  });
});
