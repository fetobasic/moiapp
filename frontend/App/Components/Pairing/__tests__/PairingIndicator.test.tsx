import React from 'react';
import { render } from '@testing-library/react-native';
import { mockedState, yetiLegacy } from 'App/Fixtures/mocks/mockedState';
import createMockStore from 'redux-mock-store';
import { Provider } from 'react-redux';
import { NavigationContainer } from '@react-navigation/native';
import { PairingIndicator } from 'App/Components/Pairing/PairingIndicator';
import { fridgeAlta80State } from 'App/Fixtures/fridgeState';

const mockStore = createMockStore([]);
const store = mockStore(mockedState);

describe('PairingIndicator', () => {
  const params = {
    device: yetiLegacy,
    isCompleted: false,
    isConnected: true,
    progress: 1,
    connectionType: 'cloud',
    dataTransferType: 'wifi',
    isError: false,
    ssid: 'ssid',
  };

  test('renders the component', () => {
    const { getByTestId } = render(
      <Provider store={store}>
        <NavigationContainer>
          <PairingIndicator {...params} dataTransferType="wifi" connectionType="cloud" />
        </NavigationContainer>
      </Provider>,
    );
    const component = getByTestId('pairingIndicator');

    expect(component).toBeTruthy();
  });
  test('renders the component with fridge', () => {
    const { getByTestId } = render(
      <Provider store={store}>
        <NavigationContainer>
          <PairingIndicator {...params} device={fridgeAlta80State} dataTransferType="wifi" connectionType="cloud" />
        </NavigationContainer>
      </Provider>,
    );
    const component = getByTestId('pairingIndicator');

    expect(component).toBeTruthy();
  });
  test('renders the component with wifi direct', () => {
    const { getByTestId } = render(
      <Provider store={store}>
        <NavigationContainer>
          <PairingIndicator {...params} dataTransferType="wifi" connectionType="direct" />
        </NavigationContainer>
      </Provider>,
    );
    const component = getByTestId('pairingIndicator');

    expect(component).toBeTruthy();
  });
  test('renders the component with error', () => {
    const { getByTestId } = render(
      <Provider store={store}>
        <NavigationContainer>
          <PairingIndicator {...params} dataTransferType="wifi" connectionType="cloud" isError />
        </NavigationContainer>
      </Provider>,
    );
    const component = getByTestId('pairingIndicator');

    expect(component).toBeTruthy();
  });
  test('renders the component progress = 35', () => {
    const { getByTestId } = render(
      <Provider store={store}>
        <NavigationContainer>
          <PairingIndicator {...params} dataTransferType="wifi" connectionType="cloud" progress={35} />
        </NavigationContainer>
      </Provider>,
    );
    const component = getByTestId('pairingIndicator');

    expect(component).toBeTruthy();
  });
  test('renders the component progress = 70', () => {
    const { getByTestId } = render(
      <Provider store={store}>
        <NavigationContainer>
          <PairingIndicator {...params} dataTransferType="wifi" connectionType="cloud" progress={70} />
        </NavigationContainer>
      </Provider>,
    );
    const component = getByTestId('pairingIndicator');

    expect(component).toBeTruthy();
  });
  test('renders the component with isCompleted', () => {
    const { getByTestId } = render(
      <Provider store={store}>
        <NavigationContainer>
          <PairingIndicator {...params} dataTransferType="wifi" connectionType="cloud" isCompleted />
        </NavigationContainer>
      </Provider>,
    );
    const component = getByTestId('pairingIndicator');

    expect(component).toBeTruthy();
  });
  test('renders the component bluetooth', () => {
    const { getByTestId } = render(
      <Provider store={store}>
        <NavigationContainer>
          <PairingIndicator {...params} dataTransferType="bluetooth" connectionType="cloud" />
        </NavigationContainer>
      </Provider>,
    );
    const component = getByTestId('pairingIndicator');

    expect(component).toBeTruthy();
  });
  test('renders the component bluetooth and direct', () => {
    const { getByTestId } = render(
      <Provider store={store}>
        <NavigationContainer>
          <PairingIndicator {...params} dataTransferType="bluetooth" connectionType="direct" />
        </NavigationContainer>
      </Provider>,
    );
    const component = getByTestId('pairingIndicator');

    expect(component).toBeTruthy();
  });
  test('renders the component bluetooth and cloud', () => {
    const { getByTestId } = render(
      <Provider store={store}>
        <NavigationContainer>
          <PairingIndicator {...params} dataTransferType="bluetooth" connectionType="cloud" />
        </NavigationContainer>
      </Provider>,
    );
    const component = getByTestId('pairingIndicator');

    expect(component).toBeTruthy();
  });
});
