import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import DateTimePicker from 'App/Components/DateTimePicker';

describe('DateTimePicker', () => {
  const params = {
    value: new Date('2024-01-01T00:00:00Z'),
    onSave: jest.fn(),
    title: 'title',
    disablePastDate: true,
  };

  test('renders the component', () => {
    const { getByTestId, rerender } = render(<DateTimePicker {...params} type="time" />);

    const pressShowPicker = getByTestId('pressShowPicker');

    fireEvent.press(pressShowPicker);

    rerender(<DateTimePicker {...params} type="date" minimumDate={new Date('2024-01-01T00:00:00Z')} />);
  });
  test('renders the component modalWindowOnSave', () => {
    const { getByTestId } = render(<DateTimePicker {...params} type="time" />);

    const pressShowPicker = getByTestId('pressShowPicker');
    fireEvent.press(pressShowPicker);

    const modalWindowOnSave = getByTestId('modalWindowOnSave');
    fireEvent.press(modalWindowOnSave);
  });
  test('renders the component with preess', () => {
    const { getByTestId, rerender } = render(<DateTimePicker {...params} type="time" />);

    const pressShowPicker = getByTestId('pressShowPicker');
    fireEvent.press(pressShowPicker);

    const modalWindowOnClose = getByTestId('modalWindowOnClose');
    fireEvent.press(modalWindowOnClose);

    rerender(<DateTimePicker {...params} type="date" minimumDate={new Date('2024-01-01T00:00:00Z')} />);
  });
});
