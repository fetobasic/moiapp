import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import Radar from 'App/Components/Radar';

jest.useFakeTimers();

describe('Radar component', () => {
  test('renders the radar component', () => {
    const { getByTestId } = render(<Radar />);
    const radarComponent = getByTestId('radar');

    expect(radarComponent).toBeTruthy();
  });

  test('displays the WiFi icon when isWiFi prop is true', () => {
    const onPressMock = jest.fn();
    const { getByTestId } = render(<Radar isWiFi={true} onPress={onPressMock} />);
    const wifiIcon = getByTestId('wifiIcon');

    expect(wifiIcon).toBeTruthy();

    fireEvent.press(wifiIcon);

    expect(onPressMock).toHaveBeenCalled();
  });
});
