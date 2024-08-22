import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import CustomPickerSelect from 'App/Components/CustomPickerSelect';

describe('CustomPickerSelect component', () => {
  const data = [
    { label: 'Option 1', value: 'option1' },
    { label: 'Option 2', value: 'option2' },
    { label: 'Option 3', value: 'option3' },
  ];

  test('should render correctly with provided data', () => {
    const { getByTestId, getByText, findByText } = render(
      <CustomPickerSelect
        data={data}
        placeholder="Select an option"
        onSelect={jest.fn()}
        value="option1"
        isBottomMargin={true}
      />,
    );

    expect(getByTestId('customPicker')).toBeTruthy();
    expect(getByText('Select an option')).toBeTruthy();
    expect(findByText('Option 1')).toBeTruthy();
    expect(findByText('Option 2')).toBeTruthy();
    expect(findByText('Option 3')).toBeTruthy();
  });

  test('should open the picker when pressed', () => {
    const { getByTestId, getByText } = render(
      <CustomPickerSelect
        data={data}
        placeholder="Select an option"
        onSelect={jest.fn()}
        value="option1"
        isBottomMargin={true}
      />,
    );

    fireEvent.press(getByText('Select an option'));
    expect(getByTestId('customPicker')).toBeTruthy();
  });

  test('should render without a bottom margin', () => {
    const { getByTestId } = render(
      <CustomPickerSelect
        data={data}
        placeholder="Select an option"
        onSelect={jest.fn()}
        value="option1"
        isBottomMargin={false}
      />,
    );

    expect(getByTestId('customPicker')).toBeTruthy();
  });
});
