import React from 'react';
import { render } from '@testing-library/react-native';
import { mockedState } from 'App/Fixtures/mocks/mockedState';
import createMockStore from 'redux-mock-store';
import { Provider } from 'react-redux';
import { NavigationContainer } from '@react-navigation/native';
import ConnectedLine from 'App/Components/Sidebar/ConnectedLine';

const mockStore = createMockStore([]);
const store = mockStore(mockedState);

describe('ConnectedLine', () => {
  test('renders the component with isConnected = false', () => {
    const { getByTestId } = render(
      <Provider store={store}>
        <NavigationContainer>
          <ConnectedLine isConnected={false} />
        </NavigationContainer>
      </Provider>,
    );

    const component = getByTestId('connectedLine');

    expect(component).toBeTruthy();
  });
  test('renders the component with isConnected = false and order = 1', () => {
    const { getByTestId } = render(
      <Provider store={store}>
        <NavigationContainer>
          <ConnectedLine isConnected={false} deviceOrder={1} />
        </NavigationContainer>
      </Provider>,
    );

    const component = getByTestId('connectedLine');

    expect(component).toBeTruthy();
  });
  test('renders the component with isConnected = false and order = 2', () => {
    const { getByTestId } = render(
      <Provider store={store}>
        <NavigationContainer>
          <ConnectedLine isConnected={false} deviceOrder={2} />
        </NavigationContainer>
      </Provider>,
    );

    const component = getByTestId('connectedLine');

    expect(component).toBeTruthy();
  });
  test('renders the component with isConnected', () => {
    const { getByTestId } = render(
      <Provider store={store}>
        <NavigationContainer>
          <ConnectedLine isConnected />
        </NavigationContainer>
      </Provider>,
    );

    const component = getByTestId('connectedLine');

    expect(component).toBeTruthy();
  });

  test('renders the component with order = 1', () => {
    const { getByTestId } = render(
      <Provider store={store}>
        <NavigationContainer>
          <ConnectedLine isConnected deviceOrder={1} />
        </NavigationContainer>
      </Provider>,
    );

    const component = getByTestId('connectedLine');

    expect(component).toBeTruthy();
  });

  test('renders the component with order = 2', () => {
    const { getByTestId } = render(
      <Provider store={store}>
        <NavigationContainer>
          <ConnectedLine isConnected deviceOrder={2} />
        </NavigationContainer>
      </Provider>,
    );

    const component = getByTestId('connectedLine');

    expect(component).toBeTruthy();
  });
});
