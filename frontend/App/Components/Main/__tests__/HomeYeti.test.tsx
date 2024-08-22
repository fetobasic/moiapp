import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import { mockedState, yetiLegacy, yeti6GLatestFW } from 'App/Fixtures/mocks/mockedState';
import createMockStore from 'redux-mock-store';
import { Provider } from 'react-redux';
import { NavigationContainer } from '@react-navigation/native';
import HomeYeti from 'App/Components/Main/HomeYeti';

const mockStore = createMockStore([]);
const store = mockStore(mockedState);

describe('HomeYeti', () => {
  test('renders the component', () => {
    const { getByTestId } = render(
      <Provider store={store}>
        <NavigationContainer>
          <HomeYeti {...yetiLegacy} />
        </NavigationContainer>
      </Provider>,
    );
    const component = getByTestId('homeYeti');

    const yetiChargeProfileBtn = getByTestId('yetiChargeProfile');
    const yetiAccessoriesBtn = getByTestId('yetiAccessories');

    fireEvent.press(yetiChargeProfileBtn);
    fireEvent.press(yetiAccessoriesBtn);

    expect(component).toBeTruthy();
  });

  test('renders the 6G component', () => {
    const { getByTestId } = render(
      <Provider store={store}>
        <NavigationContainer>
          <HomeYeti {...yeti6GLatestFW} />
        </NavigationContainer>
      </Provider>,
    );
    const component = getByTestId('homeYeti');

    expect(component).toBeTruthy();
  });
});
