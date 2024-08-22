import React from 'react';
import { render } from '@testing-library/react-native';
import { NavigationContainer } from '@react-navigation/native';
import { Provider } from 'react-redux';
import createMockStore from 'redux-mock-store';
import { mockedState } from 'App/Fixtures/mocks/mockedState';
import CreateAccount from '../CreateAccount';

const mockStore = createMockStore([]);
const store = mockStore({
  ...mockedState,
});

describe('CreateAccount', () => {
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
          <CreateAccount {...props} />
        </NavigationContainer>
      </Provider>,
    ).toJSON();
    expect(tree).toMatchSnapshot();
  });
});
