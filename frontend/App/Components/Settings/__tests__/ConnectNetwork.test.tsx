import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import { mockedState } from 'App/Fixtures/mocks/mockedState';
import createMockStore from 'redux-mock-store';
import { Provider } from 'react-redux';
import { NavigationContainer } from '@react-navigation/native';
import ConnectNetwork from 'App/Components/Settings/ConnectNetwork';

const mockStore = createMockStore([]);
const store = mockStore({
  ...mockedState,
  yetiWifiList: {
    ...mockedState.yetiWifiList,
    data: [
      { name: '123', db: -50, saved: true },
      { name: '222', db: -70 },
    ],
  },
});

describe('ConnectNetwork', () => {
  const params = {
    onClose: jest.fn(),
    onConnect: jest.fn(),
    peripheralId: '123',
    connectedSSID: { name: '123', db: -50 },
  };
  test('renders the component', () => {
    const { getByTestId } = render(
      <Provider store={store}>
        <NavigationContainer>
          <ConnectNetwork {...params} deviceType="Y6G_2000" />
        </NavigationContainer>
      </Provider>,
    );

    const modalWindowOnClose = getByTestId('modalWindowOnClose');
    const modalWindowOnSave = getByTestId('modalWindowOnSave');
    const changePwdSection = getByTestId('changePwdSection');

    fireEvent.press(modalWindowOnSave);
    fireEvent.press(changePwdSection);
    fireEvent.press(modalWindowOnClose);

    const btnConnectNetworkManually = getByTestId('connectNetworkManually');
    fireEvent.press(btnConnectNetworkManually);
  });
  test('renders the component with showManuallyFields', () => {
    const { getByTestId } = render(
      <Provider store={store}>
        <NavigationContainer>
          <ConnectNetwork {...params} deviceType="Y6G_2000" />
        </NavigationContainer>
      </Provider>,
    );

    const modalWindowOnClose = getByTestId('modalWindowOnClose');
    fireEvent.press(modalWindowOnClose);

    const btnConnectNetworkManually = getByTestId('connectNetworkManually');
    fireEvent.press(btnConnectNetworkManually);

    fireEvent.press(modalWindowOnClose);

    const modalWindowOnSave = getByTestId('modalWindowOnSave');
    fireEvent.press(modalWindowOnSave);
  });
  test('renders the component with params', () => {
    const initStore = mockStore(mockedState);
    const { rerender } = render(
      <Provider store={initStore}>
        <NavigationContainer>
          <ConnectNetwork {...params} deviceType="Y6G_2000" />
        </NavigationContainer>
      </Provider>,
    );

    rerender(
      <Provider store={store}>
        <NavigationContainer>
          <ConnectNetwork {...params} deviceType="Y6G_2000" />
        </NavigationContainer>
      </Provider>,
    );
  });
});
