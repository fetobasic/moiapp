import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import { mockedState } from 'App/Fixtures/mocks/mockedState';
import createMockStore from 'redux-mock-store';
import { Provider } from 'react-redux';
import { NavigationContainer } from '@react-navigation/native';
import SelectWiFi from 'App/Components/Pairing/SelectWiFi';

const mockStore = createMockStore([]);
const store = mockStore({
  ...mockedState,
  yetiInfo: { ...mockedState.yetiInfo, scanedDevices: [{ id: '123', name: 'name' }] },
});

describe('SelectWiFi', () => {
  const params = {
    item: { name: '123', db: -90, saved: true },
    isSelected: false,
    isLast: false,
    onPress: jest.fn(),
  };

  test('renders the component', () => {
    const { getByTestId } = render(
      <Provider store={store}>
        <NavigationContainer>
          <SelectWiFi {...params} />
        </NavigationContainer>
      </Provider>,
    );
    const component = getByTestId('selectWifi');
    const btn = getByTestId('selectWifiPress');
    fireEvent.press(btn);

    expect(component).toBeTruthy();
  });
  test('renders the component isSelected', () => {
    const { getByTestId } = render(
      <Provider store={store}>
        <NavigationContainer>
          <SelectWiFi {...params} isSelected isLast />
        </NavigationContainer>
      </Provider>,
    );
    const component = getByTestId('selectWifi');
    const btn = getByTestId('selectWifiPress');
    fireEvent.press(btn);

    expect(component).toBeTruthy();
  });
  test('renders the component db=-85', () => {
    const { getByTestId } = render(
      <Provider store={store}>
        <NavigationContainer>
          <SelectWiFi
            {...params}
            item={{
              name: '123',
              db: -85,
            }}
          />
        </NavigationContainer>
      </Provider>,
    );
    const component = getByTestId('selectWifi');
    const btn = getByTestId('selectWifiPress');
    fireEvent.press(btn);

    expect(component).toBeTruthy();
  });
  test('renders the component db=-77', () => {
    const { getByTestId } = render(
      <Provider store={store}>
        <NavigationContainer>
          <SelectWiFi
            {...params}
            item={{
              name: '123',
              db: -77,
            }}
          />
        </NavigationContainer>
      </Provider>,
    );
    const component = getByTestId('selectWifi');
    const btn = getByTestId('selectWifiPress');
    fireEvent.press(btn);

    expect(component).toBeTruthy();
  });
  test('renders the component db=-60', () => {
    const { getByTestId } = render(
      <Provider store={store}>
        <NavigationContainer>
          <SelectWiFi
            {...params}
            item={{
              name: '123',
              db: -60,
            }}
          />
        </NavigationContainer>
      </Provider>,
    );
    const component = getByTestId('selectWifi');
    const btn = getByTestId('selectWifiPress');
    fireEvent.press(btn);

    expect(component).toBeTruthy();
  });
  test('renders the component db=-50', () => {
    const { getByTestId } = render(
      <Provider store={store}>
        <NavigationContainer>
          <SelectWiFi
            {...params}
            item={{
              name: '123',
              db: -50,
            }}
          />
        </NavigationContainer>
      </Provider>,
    );
    const component = getByTestId('selectWifi');
    const btn = getByTestId('selectWifiPress');
    fireEvent.press(btn);

    expect(component).toBeTruthy();
  });
  test('renders the component db = null', () => {
    const { getByTestId } = render(
      <Provider store={store}>
        <NavigationContainer>
          <SelectWiFi
            {...params}
            item={{
              name: '123',
              db: null,
            }}
          />
        </NavigationContainer>
      </Provider>,
    );
    const component = getByTestId('selectWifi');
    const btn = getByTestId('selectWifiPress');
    fireEvent.press(btn);

    expect(component).toBeTruthy();
  });
});
