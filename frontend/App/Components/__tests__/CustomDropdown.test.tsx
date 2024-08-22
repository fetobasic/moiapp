import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import CustomDropdown from 'App/Components/CustomDropdown';

describe('CustomDropdown', () => {
  const params = {
    value: {
      value: 'value',
      label: 'label',
    },
    placeholder: 'placeholder',
    header: jest.fn(),
    data: [
      {
        value: 'value',
        label: 'label',
      },
    ],
    renderElement: jest.fn(),
    onChange: jest.fn(),
  };

  test('renders the component', () => {
    const { getByTestId } = render(<CustomDropdown {...params} />);

    const btn = getByTestId('customDropdownPress');

    fireEvent.press(btn);
  });

  test('renders the component selectModalCancelPress', () => {
    const { getByTestId } = render(<CustomDropdown {...params} />);

    const btn = getByTestId('customDropdownPress');

    fireEvent.press(btn);

    const selectModalCancelPress = getByTestId('selectModalCancelPress');

    fireEvent.press(selectModalCancelPress);
  });
  test('renders the component modalWindowOnSave', () => {
    const { getByTestId } = render(<CustomDropdown {...params} />);

    const btn = getByTestId('customDropdownPress');
    fireEvent.press(btn);

    const selectModalApplyPress = getByTestId('selectModalApplyPress');
    fireEvent.press(selectModalApplyPress);
  });
});
