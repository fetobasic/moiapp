import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import { mockedState, yetiLegacy } from 'App/Fixtures/mocks/mockedState';
import createMockStore from 'redux-mock-store';
import { Provider } from 'react-redux';
import { NavigationContainer } from '@react-navigation/native';
import HomeTile from 'App/Components/Main/HomeTile';

const mockStore = createMockStore([]);
const store = mockStore(mockedState);

describe('HomeTile', () => {
  const params = {
    title: 'title',
    device: yetiLegacy,
    onPress: jest.fn(),
    children: null,
    disabled: false,
  };

  test('renders the component', () => {
    const { getByTestId } = render(
      <Provider store={store}>
        <NavigationContainer>
          <HomeTile {...params} />
        </NavigationContainer>
      </Provider>,
    );
    const component = getByTestId('homeTile');

    const btn = getByTestId('homeTileBtn');
    fireEvent.press(btn);

    expect(component).toBeTruthy();
  });

  test('renders the disabled component', () => {
    const { getByTestId } = render(
      <Provider store={store}>
        <NavigationContainer>
          <HomeTile {...params} disabled />
        </NavigationContainer>
      </Provider>,
    );
    const component = getByTestId('homeTile');

    const btn = getByTestId('homeTileBtn');
    fireEvent.press(btn);

    expect(component).toBeTruthy();
  });
});
