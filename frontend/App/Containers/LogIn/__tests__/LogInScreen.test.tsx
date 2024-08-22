import React from 'react';
import { render } from '@testing-library/react-native';
import { NavigationContainer } from '@react-navigation/native';
import { Provider } from 'react-redux';
import createMockStore from 'redux-mock-store';
import { mockedState } from 'App/Fixtures/mocks/mockedState';
import LogInScreen from '../LogInScreen';

const mockStore = createMockStore([]);
const store = mockStore({
  ...mockedState,
});

describe('LogInScreen', () => {
  test('renders screen', () => {
    const props = {
      navigation: {
        navigate: jest.fn() as any,
      },
      route: { params: {} },
    } as any;

    const tree = render(
      <Provider store={store}>
        <NavigationContainer>
          <LogInScreen {...props} />
        </NavigationContainer>
      </Provider>,
    ).toJSON();
    expect(tree).toMatchSnapshot();
  });
});
