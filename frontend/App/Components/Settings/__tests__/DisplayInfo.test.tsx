import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import { mockedState } from 'App/Fixtures/mocks/mockedState';
import createMockStore from 'redux-mock-store';
import { Provider } from 'react-redux';
import { NavigationContainer } from '@react-navigation/native';
import DisplayInfo from 'App/Components/Settings/DisplayInfo';

const mockStore = createMockStore([]);
const store = mockStore(mockedState);

describe('DisplayInfo', () => {
  const params = {
    title: 'Title',
    data: [
      {
        key: '123',
        name: '123',
      },
    ],
    selected: {
      key: '123',
      name: '123',
    },
    onChange: jest.fn(),
  };
  test('renders the component', () => {
    const { getByTestId } = render(
      <Provider store={store}>
        <NavigationContainer>
          <DisplayInfo {...params} param="temperature" />
        </NavigationContainer>
      </Provider>,
    );

    const component = getByTestId('displayInfo');
    const btn = getByTestId('displayInfo_123');

    fireEvent.press(btn);

    expect(component).toBeTruthy();
  });
  test('renders the component with param voltage', () => {
    const { getByTestId } = render(
      <Provider store={store}>
        <NavigationContainer>
          <DisplayInfo {...params} param="voltage" />
        </NavigationContainer>
      </Provider>,
    );

    const component = getByTestId('displayInfo');
    const btn = getByTestId('displayInfo_123');

    fireEvent.press(btn);

    expect(component).toBeTruthy();
  });
  test('renders the component with non selected', () => {
    const { getByTestId } = render(
      <Provider store={store}>
        <NavigationContainer>
          <DisplayInfo {...params} selected={{ key: '222', name: '222' }} param="voltage" />
        </NavigationContainer>
      </Provider>,
    );

    const component = getByTestId('displayInfo');
    const btn = getByTestId('displayInfo_123');

    fireEvent.press(btn);

    expect(component).toBeTruthy();
  });
});
