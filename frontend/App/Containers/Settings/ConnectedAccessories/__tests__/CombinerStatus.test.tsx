import React from 'react';
import { render } from '@testing-library/react-native';
import { NavigationContainer } from '@react-navigation/native';
import { Provider } from 'react-redux';
import createMockStore from 'redux-mock-store';
import { mockedState } from 'App/Fixtures/mocks/mockedState';
import CombinerStatus from '../CombinerStatus';

const mockStore = createMockStore([]);
const store = mockStore({
  ...mockedState,
});

describe('CombinerStatus', () => {
  test('renders screen', () => {
    const props = {
      navigation: {
        navigate: jest.fn() as any,
      },
      route: { params: { isYeti20004000: true } },
    } as any;

    const tree = render(
      <Provider store={store}>
        <NavigationContainer>
          <CombinerStatus {...props} />
        </NavigationContainer>
      </Provider>,
    ).toJSON();
    expect(tree).toMatchSnapshot();
  });
  test('renders screen isYeti20004000: false', () => {
    const props = {
      navigation: {
        navigate: jest.fn() as any,
      },
      route: { params: { isYeti20004000: false } },
    } as any;

    const tree = render(
      <Provider store={store}>
        <NavigationContainer>
          <CombinerStatus {...props} />
        </NavigationContainer>
      </Provider>,
    ).toJSON();
    expect(tree).toMatchSnapshot();
  });
});
