import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import { mockedNavigation, mockedState, yetiLegacy } from 'App/Fixtures/mocks/mockedState';
import createMockStore from 'redux-mock-store';
import { Provider } from 'react-redux';
import { NavigationContainer } from '@react-navigation/native';
import DeviceRowInfo from 'App/Components/Main/DeviceRowInfo';

const mockStore = createMockStore([]);
const store = mockStore(mockedState);

describe('DeviceRowInfo', () => {
  test('renders the component with isBluetoothConnect', () => {
    const { getByTestId } = render(
      <Provider store={store}>
        <NavigationContainer>
          <DeviceRowInfo item={yetiLegacy} isBluetoothConnect navigation={mockedNavigation} />
        </NavigationContainer>
      </Provider>,
    );
    const component = getByTestId('deviceRowInfo');

    const btn = getByTestId('deviceRowInfoNavPress');
    fireEvent.press(btn);

    expect(component).toBeTruthy();
  });
  test('renders the component with isBluetoothConnec false', () => {
    const { getByTestId } = render(
      <Provider store={store}>
        <NavigationContainer>
          <DeviceRowInfo item={yetiLegacy} isBluetoothConnect={false} navigation={mockedNavigation} />
        </NavigationContainer>
      </Provider>,
    );
    const component = getByTestId('deviceRowInfo');

    expect(component).toBeTruthy();
  });
});
