import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import { mockedNavigation, mockedState } from 'App/Fixtures/mocks/mockedState';
import HomeEmpty from 'App/Components/Main/HomeEmpty';
import createMockStore from 'redux-mock-store';
import { Provider } from 'react-redux';
import { NavigationContainer } from '@react-navigation/native';

const mockStore = createMockStore([]);
const store = mockStore(mockedState);

describe('HomeEmpty', () => {
  test('renders the component with hasDevices', () => {
    const { getByTestId } = render(
      <Provider store={store}>
        <NavigationContainer>
          <HomeEmpty navigation={mockedNavigation} hasDevices />
        </NavigationContainer>
      </Provider>,
    );
    const component = getByTestId('homeEmpty');

    const btn = getByTestId('homeEmptyBtn');
    fireEvent.press(btn);

    expect(component).toBeTruthy();
  });

  test('renders the component with hasDevices = false', () => {
    const { getByTestId } = render(
      <Provider store={store}>
        <NavigationContainer>
          <HomeEmpty navigation={mockedNavigation} />
        </NavigationContainer>
      </Provider>,
    );
    const component = getByTestId('homeEmpty');

    const btn = getByTestId('homeEmptyBtn');
    const btnMore = getByTestId('homeEmptyBtnMore');
    fireEvent.press(btn);
    fireEvent.press(btnMore);

    expect(component).toBeTruthy();
  });
});
