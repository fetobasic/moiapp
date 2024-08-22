import React from 'react';
import { render } from '@testing-library/react-native';
import { mockedState } from 'App/Fixtures/mocks/mockedState';
import createMockStore from 'redux-mock-store';
import { Provider } from 'react-redux';
import { NavigationContainer } from '@react-navigation/native';
import ConnectionIcon from 'App/Components/Sidebar/ConnectionIcon';

const mockStore = createMockStore([]);
const store = mockStore(mockedState);

describe('ConnectionIcon', () => {
  test('renders the component with isCombinerInfo', () => {
    render(
      <Provider store={store}>
        <NavigationContainer>
          <ConnectionIcon isCombinerInfo />
        </NavigationContainer>
      </Provider>,
    );
  });
  test('renders the component with dataTransferType = bluetooth', () => {
    render(
      <Provider store={store}>
        <NavigationContainer>
          <ConnectionIcon dataTransferType="bluetooth" isDirectConnection isConnected />
        </NavigationContainer>
      </Provider>,
    );
  });
  test('renders the component with dataTransferType = bluetooth and isConnected = false', () => {
    render(
      <Provider store={store}>
        <NavigationContainer>
          <ConnectionIcon dataTransferType="bluetooth" isDirectConnection isConnected={false} />
        </NavigationContainer>
      </Provider>,
    );
  });
  test('renders the component with dataTransferType = wifi', () => {
    render(
      <Provider store={store}>
        <NavigationContainer>
          <ConnectionIcon dataTransferType="wifi" isDirectConnection isConnected />
        </NavigationContainer>
      </Provider>,
    );
  });
  test('renders the component with dataTransferType = wifi and isConnected = false', () => {
    render(
      <Provider store={store}>
        <NavigationContainer>
          <ConnectionIcon dataTransferType="wifi" isDirectConnection isConnected={false} />
        </NavigationContainer>
      </Provider>,
    );
  });
  test('renders the component with isDirectConnection = false', () => {
    render(
      <Provider store={store}>
        <NavigationContainer>
          <ConnectionIcon isDirectConnection={false} />
        </NavigationContainer>
      </Provider>,
    );
  });
  test('renders the component with isDirectConnection', () => {
    render(
      <Provider store={store}>
        <NavigationContainer>
          <ConnectionIcon isDirectConnection />
        </NavigationContainer>
      </Provider>,
    );
  });
});
