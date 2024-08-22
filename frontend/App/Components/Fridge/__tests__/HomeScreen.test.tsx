import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import HomeScreen from 'App/Components/Fridge/HomeScreen';
import { fridgeAlta80State, fridgeAlta50State } from 'App/Fixtures/fridgeState';
import createMockStore from 'redux-mock-store';
import { Provider } from 'react-redux';
import { NavigationContainer } from '@react-navigation/native';

jest.useFakeTimers();
const mockStore = createMockStore([]);
const store = mockStore({
  devicesInfo: {
    data: [fridgeAlta80State, fridgeAlta50State],
  },
});

describe('HomeScreen', () => {
  test('renders the component with Alta 80 params', () => {
    const { getByTestId, getByText } = render(
      <Provider store={store}>
        <NavigationContainer>
          <HomeScreen {...fridgeAlta80State} />
        </NavigationContainer>
      </Provider>,
    );
    const component = getByTestId('homeScreen');

    expect(component).toBeTruthy();

    const btnOn = getByText('ON');
    const btnOff = getByText('OFF');
    const btnHigh = getByText('HIGH');
    const btnMedium = getByText('MEDIUM');
    const btnLow = getByText('LOW');

    fireEvent.press(btnOn);
    fireEvent.press(btnOff);
    fireEvent.press(btnHigh);
    fireEvent.press(btnMedium);
    fireEvent.press(btnLow);
  });

  test('renders the component with Alta 50 params', () => {
    const { getByTestId } = render(
      <Provider store={store}>
        <NavigationContainer>
          <HomeScreen {...fridgeAlta50State} />
        </NavigationContainer>
      </Provider>,
    );
    const component = getByTestId('homeScreen');

    expect(component).toBeTruthy();
  });
});
