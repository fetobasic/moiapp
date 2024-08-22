import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import TemperatureControl from 'App/Components/Fridge/TemperatureControl';
import { fridgeAlta80State, fridgeAlta50State } from 'App/Fixtures/fridgeState';
import { FRIDGE_SWITCH_MODE } from 'App/Types/Fridge';

describe('PowerSection', () => {
  test('renders the component with Alta 80 params and zone left', () => {
    const { getByTestId } = render(<TemperatureControl device={fridgeAlta80State} title="123" zone="left" />);

    const component = getByTestId('temperatureControl');

    expect(component).toBeTruthy();

    const temperatureControlMinus = getByTestId('temperatureControlMinus');
    const temperatureControlPlus = getByTestId('temperatureControlPlus');

    fireEvent.press(temperatureControlMinus);
    fireEvent.press(temperatureControlPlus);
  });

  test('renders the component with Alta 80 params and zone right', () => {
    const { getByTestId } = render(<TemperatureControl device={fridgeAlta80State} title="123" zone="right" />);
    const component = getByTestId('temperatureControl');

    expect(component).toBeTruthy();

    const temperatureControlMinus = getByTestId('temperatureControlMinus');
    const temperatureControlPlus = getByTestId('temperatureControlPlus');

    fireEvent.press(temperatureControlMinus);
    fireEvent.press(temperatureControlPlus);
  });

  test('renders the component with Alta 50 params', () => {
    const { getByTestId } = render(<TemperatureControl device={fridgeAlta50State} title="123" zone="left" />);
    const component = getByTestId('temperatureControl');

    expect(component).toBeTruthy();

    const temperatureControlMinus = getByTestId('temperatureControlMinus');
    const temperatureControlPlus = getByTestId('temperatureControlPlus');

    fireEvent.press(temperatureControlMinus);
    fireEvent.press(temperatureControlPlus);
  });

  test('renders the component with isConnected false', () => {
    const { getByTestId } = render(
      <TemperatureControl device={{ ...fridgeAlta50State, isConnected: false }} title="123" zone="left" />,
    );
    const component = getByTestId('temperatureControl');

    expect(component).toBeTruthy();
  });

  test('renders the component with isConnected false and Power Off', () => {
    const { getByTestId } = render(
      <TemperatureControl
        device={{
          ...fridgeAlta50State,
          isConnected: false,
          data: { ...fridgeAlta50State.data, switch: FRIDGE_SWITCH_MODE.OFF },
        }}
        title="123"
        zone="left"
      />,
    );
    const component = getByTestId('temperatureControl');

    expect(component).toBeTruthy();

    const temperatureControlMinus = getByTestId('temperatureControlMinus');
    const temperatureControlPlus = getByTestId('temperatureControlPlus');

    fireEvent.press(temperatureControlMinus);
    fireEvent.press(temperatureControlPlus);
  });
});
