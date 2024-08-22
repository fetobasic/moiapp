import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import CheckBox from 'App/Components/CheckBox';

describe('CheckBox', () => {
  const title = 'CheckBoxTitle';

  test('renders the component with a title', () => {
    const { getByText } = render(<CheckBox title={title} value={false} onPress={() => {}} />);
    const checkBox = getByText(title);

    expect(checkBox).toBeTruthy();
  });

  test('executes the onPress callback when the checkbox is pressed', () => {
    const mockCallback = jest.fn();
    const { getByText } = render(<CheckBox title={title} value={false} onPress={mockCallback} />);
    const checkBox = getByText(title);
    fireEvent.press(checkBox);

    expect(mockCallback).toHaveBeenCalled();
  });

  test('renders the component with border', () => {
    const mockCallback = jest.fn();
    const { getByTestId } = render(<CheckBox title={title} value={true} onPress={mockCallback} hasBorder />);
    const selectedCheckBox = getByTestId('withPressable');
    fireEvent.press(selectedCheckBox);

    expect(selectedCheckBox).toBeTruthy();
    expect(mockCallback).toHaveBeenCalled();
  });
});
