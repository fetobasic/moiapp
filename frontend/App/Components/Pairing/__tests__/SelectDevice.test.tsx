import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import { mockedState } from 'App/Fixtures/mocks/mockedState';
import createMockStore from 'redux-mock-store';
import { Provider } from 'react-redux';
import { NavigationContainer } from '@react-navigation/native';
import SelectDevice from 'App/Components/Pairing/SelectDevice';

const mockStore = createMockStore([]);
const store = mockStore({
  ...mockedState,
  yetiInfo: { ...mockedState.yetiInfo, scanedDevices: [{ id: '123', name: 'name' }] },
});

describe('SelectDevice', () => {
  const params = {
    title: '123',
    isSelected: true,
    onPress: jest.fn(),
    subTitle: '123',
  };

  test('renders the component', () => {
    const { getByTestId } = render(
      <Provider store={store}>
        <NavigationContainer>
          <SelectDevice {...params} />
        </NavigationContainer>
      </Provider>,
    );
    const component = getByTestId('selectDevice');

    const btn = getByTestId('selectDevicePress');
    fireEvent.press(btn);

    expect(component).toBeTruthy();
  });

  test('renders the component not selected', () => {
    const { getByTestId } = render(
      <Provider store={store}>
        <NavigationContainer>
          <SelectDevice {...params} isSelected={false} />
        </NavigationContainer>
      </Provider>,
    );
    const component = getByTestId('selectDevice');
    const btn = getByTestId('selectDevicePress');
    fireEvent.press(btn);

    expect(component).toBeTruthy();
  });
});
