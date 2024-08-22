import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import { NavigationContainer } from '@react-navigation/native';
import { Provider } from 'react-redux';
import createMockStore from 'redux-mock-store';
import { mockedState } from 'App/Fixtures/mocks/mockedState';
import SelectConnect from '../SelectConnect';

const mockStore = createMockStore([]);
const store = mockStore({
  ...mockedState,
});
const props = {
  navigation: {
    navigate: jest.fn() as any,
  },
  route: { params: {} },
} as any;

describe('SelectConnect', () => {
  test('renders screen', () => {
    const tree = render(
      <Provider store={store}>
        <NavigationContainer>
          <SelectConnect {...props} />
        </NavigationContainer>
      </Provider>,
    ).toJSON();
    expect(tree).toMatchSnapshot();
  });

  test('renders screen select btnDirect', () => {
    const { getByTestId } = render(
      <Provider store={store}>
        <NavigationContainer>
          <SelectConnect {...props} />
        </NavigationContainer>
      </Provider>,
    );

    const btnDirect = getByTestId('btnDirect');

    fireEvent.press(btnDirect);
  });
  test('renders screen select btnCloud', () => {
    const { getByTestId } = render(
      <Provider store={store}>
        <NavigationContainer>
          <SelectConnect {...props} />
        </NavigationContainer>
      </Provider>,
    );

    const btnCloud = getByTestId('btnCloud');

    fireEvent.press(btnCloud);
  });
});
