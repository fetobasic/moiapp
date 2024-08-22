import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import ModalSelectRow from 'App/Components/EnergyHistory/ModalSelectRow';

describe('ModalSelectRow', () => {
  const params = {
    title: 'Title',
    subTitle: 'SubTitle',
    selectedValue: 'SelectedValue',
    onPress: jest.fn(),
  };
  test('renders the component with params', () => {
    const { getByTestId, rerender } = render(<ModalSelectRow {...params} />);
    const component = getByTestId('modalSelectRow');

    expect(component).toBeTruthy();

    rerender(<ModalSelectRow {...params} selectedType="check" />);
    rerender(<ModalSelectRow {...params} selectedType="check" title="1" selectedValue="1" />);

    const modalSelectRow = getByTestId('modalSelectRow');
    fireEvent.press(modalSelectRow);
  });
});
