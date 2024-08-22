import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import { NavigationContainer } from '@react-navigation/native';
import { Provider } from 'react-redux';
import createMockStore from 'redux-mock-store';
import { mockedState } from 'App/Fixtures/mocks/mockedState';
import FindWifiNetwork from '../FindWifiNetwork';

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

describe('FindWifiNetwork', () => {
  test('renders screen', () => {
    const tree = render(
      <Provider store={store}>
        <NavigationContainer>
          <FindWifiNetwork {...props} />
        </NavigationContainer>
      </Provider>,
    ).toJSON();
    expect(tree).toMatchSnapshot();
  });

  test('renders screen with buttons press', () => {
    const { getByTestId } = render(
      <Provider store={store}>
        <NavigationContainer>
          <FindWifiNetwork {...props} />
        </NavigationContainer>
      </Provider>,
    );

    const goToSettings = getByTestId('goToSettings');
    const onContinuePress = getByTestId('onContinuePress');

    fireEvent.press(onContinuePress);
    fireEvent.press(goToSettings);
  });
});
