import React from 'react';
import { render } from '@testing-library/react-native';
import EnergyChart from 'App/Components/EnergyHistory/EnergyChart';
import { DateTypes } from 'App/Types/HistoryType';

describe('EnergyChart', () => {
  const params = {
    showEnergyIn: false,
    showEnergyOut: false,
    showBattery: false,
    showPercentageLine: false,
    batterySoc: [],
    whIn: [],
    whOut: [],
    chartType: DateTypes.PAST_DAY,
    disconnectedStateXLabels: [''],
  };

  const whValues = [
    { x: '2024-01-01 00:00', y: 1 },
    { x: '2024-01-02 00:00', y: 2 },
    { x: '2024-01-03 00:00', y: 3 },
  ];

  test('renders the component with params', () => {
    const { getByTestId, rerender } = render(<EnergyChart {...params} />);
    const component = getByTestId('energyChart');

    expect(component).toBeTruthy();

    rerender(
      <EnergyChart
        {...params}
        showBattery
        showEnergyIn
        showEnergyOut
        showPercentageLine
        whOut={whValues}
        whIn={whValues}
        batterySoc={whValues}
        disconnectedStateXLabels={[whValues[0].x]}
      />,
    );
  });
});
