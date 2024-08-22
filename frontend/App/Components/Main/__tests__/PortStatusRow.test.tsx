import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import { mockedState, yetiLegacy } from 'App/Fixtures/mocks/mockedState';
import createMockStore from 'redux-mock-store';
import { Provider } from 'react-redux';
import { NavigationContainer } from '@react-navigation/native';
import PortStatusRow from 'App/Components/Main/PortStatusRow';

const mockStore = createMockStore([]);
const store = mockStore(mockedState);

describe('PortStatusRow', () => {
  const params = {
    device: yetiLegacy,
    icon: null,
    title: 'title',
    type: 'v12PortStatus', // | 'usbPortStatus' | 'acPortStatus';
    isDisabled: false,
  };

  test('renders the component', () => {
    const { getByTestId } = render(
      <Provider store={store}>
        <NavigationContainer>
          <PortStatusRow {...params} />
        </NavigationContainer>
      </Provider>,
    );
    const component = getByTestId('portStatusRow');

    const switchCustom = getByTestId('switchCustom');
    fireEvent.press(switchCustom);

    expect(component).toBeTruthy();
  });

  test('renders the component usbPortStatus', () => {
    const { getByTestId } = render(
      <Provider store={store}>
        <NavigationContainer>
          <PortStatusRow {...params} type="usbPortStatus" />
        </NavigationContainer>
      </Provider>,
    );
    const component = getByTestId('portStatusRow');

    const switchCustom = getByTestId('switchCustom');
    fireEvent.press(switchCustom);

    expect(component).toBeTruthy();
  });
  test('renders the component acPortStatus', () => {
    const { getByTestId } = render(
      <Provider store={store}>
        <NavigationContainer>
          <PortStatusRow {...params} type="acPortStatus" />
        </NavigationContainer>
      </Provider>,
    );
    const component = getByTestId('portStatusRow');

    const switchCustom = getByTestId('switchCustom');
    fireEvent.press(switchCustom);

    expect(component).toBeTruthy();
  });
  test('renders the component disabled', () => {
    const { getByTestId } = render(
      <Provider store={store}>
        <NavigationContainer>
          <PortStatusRow {...params} isDisabled />
        </NavigationContainer>
      </Provider>,
    );
    const component = getByTestId('portStatusRow');

    const switchCustom = getByTestId('switchCustom');
    fireEvent.press(switchCustom);

    expect(component).toBeTruthy();
  });
});
