import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import Selector from 'App/Components/Selector';

describe('Selector', () => {
  test('should render correctly', () => {
    const { getByText } = render(<Selector value="Test Value" placeholder="Placeholder" iconValue={<></>} />);

    const placeholderText = getByText('Placeholder');

    expect(placeholderText).toBeDefined();
  });

  test('should call onPress handler when pressed', () => {
    const onPressMock = jest.fn();
    const { getByTestId } = render(<Selector value="Test Value" iconValue={<></>} onPress={onPressMock} />);

    const container = getByTestId('selector');

    fireEvent.press(container);

    expect(onPressMock).toHaveBeenCalled();
  });
});
