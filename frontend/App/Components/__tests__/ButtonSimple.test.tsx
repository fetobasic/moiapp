import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import ButtonSimple from 'App/Components/ButtonSimple';

describe('ButtonSimple', () => {
  test('executes the onPress callback when the button is pressed', () => {
    const mockCallback = jest.fn();
    const { getByText } = render(<ButtonSimple title="Click" onPress={mockCallback} />);
    const button = getByText('Click');
    fireEvent.press(button);

    expect(mockCallback).toHaveBeenCalled();
  });
});
