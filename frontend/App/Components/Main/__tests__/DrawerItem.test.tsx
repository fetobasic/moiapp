import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import { mockedNavigation, mockedState } from 'App/Fixtures/mocks/mockedState';
import createMockStore from 'redux-mock-store';
import { Provider } from 'react-redux';
import { NavigationContainer } from '@react-navigation/native';
import DrawerItem from 'App/Components/Main/DrawerItem';

const mockStore = createMockStore([]);
const store = mockStore(mockedState);

describe('DrawerItem', () => {
  test('renders the component with params', () => {
    const { getByTestId } = render(
      <Provider store={store}>
        <NavigationContainer>
          <DrawerItem navigation={mockedNavigation} routeName="Home" icon={() => null} title="Home" value="Home" top />
        </NavigationContainer>
      </Provider>,
    );
    const component = getByTestId('drawerItem');

    const btn = getByTestId('drawerItemPress');
    fireEvent.press(btn);

    expect(component).toBeTruthy();
  });

  test('renders the component with undefined value', () => {
    const { getByTestId } = render(
      <Provider store={store}>
        <NavigationContainer>
          <DrawerItem navigation={mockedNavigation} routeName="Home" icon={() => null} title="Home" top={false} />
        </NavigationContainer>
      </Provider>,
    );
    const component = getByTestId('drawerItem');

    expect(component).toBeTruthy();
  });
});
