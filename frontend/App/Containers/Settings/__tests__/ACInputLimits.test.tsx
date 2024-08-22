import React from 'react';
import { render } from '@testing-library/react-native';
import { NavigationContainer } from '@react-navigation/native';
import { Provider } from 'react-redux';
import createMockStore from 'redux-mock-store';
import { mockedState } from 'App/Fixtures/mocks/mockedState';
import { yeti6GState } from 'App/Fixtures/yeti6GState';
import ACInputLimits from '../ACInputLimits';

const mockStore = createMockStore([]);
const store = mockStore({
  ...mockedState,
});

describe('ACInputLimits', () => {
  test('renders screen', () => {
    const props = {
      navigation: {
        navigate: jest.fn() as any,
        canGoBack: jest.fn() as any,
      },
      route: { params: { thingName: '123', device: yeti6GState } },
    } as any;

    const tree = render(
      <Provider store={store}>
        <NavigationContainer>
          <ACInputLimits {...props} />
        </NavigationContainer>
      </Provider>,
    ).toJSON();
    expect(tree).toMatchSnapshot();
  });
});
