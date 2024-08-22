import React from 'react';
import { render } from '@testing-library/react-native';
import { mockedState } from 'App/Fixtures/mocks/mockedState';
import createMockStore from 'redux-mock-store';
import { Provider } from 'react-redux';
import { NavigationContainer } from '@react-navigation/native';
import Info from 'App/Components/Main/Info';

const mockStore = createMockStore([]);
const store = mockStore(mockedState);

describe('Info', () => {
  const params = {
    title: 'title',
    isFirst: true,
    info: 'info',
  };

  test('renders the component', () => {
    const { getByTestId } = render(
      <Provider store={store}>
        <NavigationContainer>
          <Info {...params} />
        </NavigationContainer>
      </Provider>,
    );
    const component = getByTestId('info');

    expect(component).toBeTruthy();
  });

  test('renders the component isFirst = false', () => {
    const { getByTestId } = render(
      <Provider store={store}>
        <NavigationContainer>
          <Info {...params} isFirst={false} />
        </NavigationContainer>
      </Provider>,
    );
    const component = getByTestId('info');

    expect(component).toBeTruthy();
  });
});
