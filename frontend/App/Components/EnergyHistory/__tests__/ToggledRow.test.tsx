import React from 'react';
import { render } from '@testing-library/react-native';
import ToggledRow from 'App/Components/EnergyHistory/ToggledRow';

describe('ToggledRow', () => {
  const params = {
    title: 'Title',
    totalValue: 'TotalValue',
    trackColor: 'TrackColor',
    switchValue: true,
    onPress: jest.fn(),
  };
  test('renders the component with params', () => {
    const { getByTestId } = render(<ToggledRow {...params} />);
    const component = getByTestId('toggledRow');

    expect(component).toBeTruthy();
  });
});
