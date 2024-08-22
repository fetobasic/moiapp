import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import { mockedState } from 'App/Fixtures/mocks/mockedState';
import createMockStore from 'redux-mock-store';
import { Provider } from 'react-redux';
import { NavigationContainer } from '@react-navigation/native';
import StartInfo from 'App/Components/Pairing/StartInfo';

const mockStore = createMockStore([]);
const store = mockStore({
  ...mockedState,
  yetiInfo: { ...mockedState.yetiInfo, scanedDevices: [{ id: '123', name: 'name' }] },
});

describe('StartInfo', () => {
  test('renders the component', () => {
    const { getByTestId } = render(
      <Provider store={store}>
        <NavigationContainer>
          <StartInfo />
        </NavigationContainer>
      </Provider>,
    );
    const component = getByTestId('startInfo');
    const pressBluetoothHelp = getByTestId('pressBluetoothHelp');
    const pressPairingMode = getByTestId('pressPairingMode');

    fireEvent.press(pressBluetoothHelp);
    fireEvent.press(pressPairingMode);

    expect(component).toBeTruthy();
  });
});
