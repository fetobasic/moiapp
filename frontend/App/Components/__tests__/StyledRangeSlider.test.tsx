import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import StyledRangeSlider from 'App/Components/StyledRangeSlider';

describe('StyledRangeSlider component', () => {
  test('should render with custom low value and marks', () => {
    const { getByText, getByTestId } = render(
      <StyledRangeSlider low={20} min={20} showMarks markStep={5} markValue="V" />,
    );

    expect(getByTestId('styledRangeSlider')).toBeTruthy();
    expect(getByText('20 V')).toBeTruthy();
    expect(getByText('25 V')).toBeTruthy();
    expect(getByText('30 V')).toBeTruthy();
  });

  test('should render correctly with disableRange', () => {
    const { getByTestId } = render(<StyledRangeSlider disableRange />);

    expect(getByTestId('styledRangeSlider')).toBeTruthy();
  });

  test('should render correctly with disabled', () => {
    const { getByTestId } = render(<StyledRangeSlider disabled />);

    expect(getByTestId('styledRangeSlider')).toBeTruthy();
  });

  test('should render correctly with buttons', () => {
    const { getByTestId } = render(
      <StyledRangeSlider
        low={20}
        min={20}
        max={100}
        maxLimit={90}
        showMarks
        markStep={5}
        markValue="V"
        showButtons
        handleButtonPress={jest.fn}
      />,
    );

    const styledRangeSliderLeftButton = getByTestId('styledRangeSliderLeftButton');
    const styledRangeSliderRightButton = getByTestId('styledRangeSliderRightButton');

    fireEvent.press(styledRangeSliderLeftButton);
    fireEvent.press(styledRangeSliderRightButton);

    expect(getByTestId('styledRangeSlider')).toBeTruthy();
  });

  test('should render correctly with buttons and incorrect values', () => {
    const { getByTestId } = render(
      <StyledRangeSlider
        low={40}
        min={20}
        max={30}
        maxLimit={90}
        showMarks
        markStep={5}
        markValue="V"
        showButtons
        handleButtonPress={jest.fn}
      />,
    );

    const styledRangeSliderLeftButton = getByTestId('styledRangeSliderLeftButton');
    const styledRangeSliderRightButton = getByTestId('styledRangeSliderRightButton');

    fireEvent.press(styledRangeSliderLeftButton);
    fireEvent.press(styledRangeSliderRightButton);

    expect(getByTestId('styledRangeSlider')).toBeTruthy();
  });
});
