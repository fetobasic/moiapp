import React from 'react';
import { render } from '@testing-library/react-native';
import { NavigationContainer } from '@react-navigation/native';
import { Provider } from 'react-redux';
import createMockStore from 'redux-mock-store';
import { mockedState, yeti6GLatestFW } from 'App/Fixtures/mocks/mockedState';
import Connection from '../Connection';

const mockStore = createMockStore([]);
const store = mockStore({
  ...mockedState,
});

describe('Connection', () => {
  test('renders screen', () => {
    const props = {
      navigation: {
        navigate: jest.fn() as any,
        canGoBack: jest.fn() as any,
      },
      route: { params: { device: yeti6GLatestFW } },
    } as any;

    const tree = render(
      <Provider store={store}>
        <NavigationContainer>
          <Connection {...props} />
        </NavigationContainer>
      </Provider>,
    ).toJSON();
    expect(tree).toMatchSnapshot();
  });
});
