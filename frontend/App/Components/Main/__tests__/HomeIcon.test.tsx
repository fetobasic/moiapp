import React from 'react';
import { render } from '@testing-library/react-native';
import { mockedState } from 'App/Fixtures/mocks/mockedState';
import createMockStore from 'redux-mock-store';
import { Provider } from 'react-redux';
import { NavigationContainer } from '@react-navigation/native';
import HomeIcon from 'App/Components/Main/HomeIcon';

const mockStore = createMockStore([]);
const store = mockStore(mockedState);

describe('HomeEmpty', () => {
  const params = {
    icon: () => null,
    title: 'Home',
    disabled: false,
  };

  test('renders the component', () => {
    const { getByTestId } = render(
      <Provider store={store}>
        <NavigationContainer>
          <HomeIcon {...params} />
        </NavigationContainer>
      </Provider>,
    );
    const component = getByTestId('homeIcon');

    expect(component).toBeTruthy();
  });
  test('renders the disabled component', () => {
    const { getByTestId } = render(
      <Provider store={store}>
        <NavigationContainer>
          <HomeIcon {...params} disabled />
        </NavigationContainer>
      </Provider>,
    );
    const component = getByTestId('homeIcon');

    expect(component).toBeTruthy();
  });
});
