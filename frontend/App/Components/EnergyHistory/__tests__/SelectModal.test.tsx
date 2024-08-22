import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import SelectModal from 'App/Components/EnergyHistory/SelectModal';

describe('SelectModal', () => {
  const params = {
    isVisible: true,
    title: 'Title',
    doneText: 'Done',
    onDone: jest.fn(),
    onClose: jest.fn(),
    skipCloseFunction: false,
    children: null,
    hideButtons: false,
  };
  test('renders the component with params', () => {
    const { getByTestId, rerender, getByText } = render(<SelectModal {...params} />);
    const component = getByTestId('selectModal');

    expect(component).toBeTruthy();

    rerender(<SelectModal {...params} doneText={undefined} />);

    const doneButton = getByText('Apply');
    fireEvent.press(doneButton);
  });
});
