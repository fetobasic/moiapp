import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import ConnectInfo from 'App/Components/Main/ConnectInfo';
import { mockedState, yetiLegacy } from 'App/Fixtures/mocks/mockedState';
import createMockStore from 'redux-mock-store';
import { Provider } from 'react-redux';
import { NavigationContainer } from '@react-navigation/native';

jest.useFakeTimers();
const mockStore = createMockStore([]);
const store = mockStore(mockedState);

describe('ConnectInfo', () => {
  test('renders the component with params', () => {
    const { getByTestId } = render(
      <Provider store={store}>
        <NavigationContainer>
          <ConnectInfo {...yetiLegacy} />
        </NavigationContainer>
      </Provider>,
    );
    const component = getByTestId('connectInfo');

    fireEvent.press(component);

    expect(component).toBeTruthy();
  });

  test('renders the component with isDirectConnection = false', () => {
    const mockedStore = mockStore({
      ...mockedState,
      application: { ...mockedState.application, isDirectConnection: false },
    });

    const { getByTestId } = render(
      <Provider store={mockedStore}>
        <NavigationContainer>
          <ConnectInfo {...yetiLegacy} />
        </NavigationContainer>
      </Provider>,
    );
    const component = getByTestId('connectInfo');

    fireEvent.press(component);

    expect(component).toBeTruthy();
  });

  test('renders the component with isConnected = true', () => {
    const { getByTestId } = render(
      <Provider store={store}>
        <NavigationContainer>
          <ConnectInfo {...yetiLegacy} isConnected />
        </NavigationContainer>
      </Provider>,
    );
    const component = getByTestId('connectInfo');

    fireEvent.press(component);

    expect(component).toBeTruthy();
  });

  test('renders the component with isDirectConnection = false and isConnected = true', () => {
    const mockedStore = mockStore({
      ...mockedState,
      application: { ...mockedState.application, isDirectConnection: false },
    });

    const { getByTestId } = render(
      <Provider store={mockedStore}>
        <NavigationContainer>
          <ConnectInfo {...yetiLegacy} isConnected />
        </NavigationContainer>
      </Provider>,
    );
    const component = getByTestId('connectInfo');

    fireEvent.press(component);

    expect(component).toBeTruthy();
  });
});
