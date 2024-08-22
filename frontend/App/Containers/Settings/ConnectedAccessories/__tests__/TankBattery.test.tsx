import React from 'react';
import { render } from '@testing-library/react-native';
import { NavigationContainer } from '@react-navigation/native';
import { Provider } from 'react-redux';
import createMockStore from 'redux-mock-store';
import { mockedState } from 'App/Fixtures/mocks/mockedState';
import TankBattery from '../TankBattery';
import { yeti6GState } from 'App/Fixtures/yeti6GState';

const mockStore = createMockStore([]);
const store = mockStore({
  ...mockedState,
});

describe('TankBattery', () => {
  test('renders screen', () => {
    const props = {
      navigation: {
        navigate: jest.fn() as any,
      },
      route: { params: { device: yeti6GState, key: '123' } },
    } as any;

    const tree = render(
      <Provider store={store}>
        <NavigationContainer>
          <TankBattery {...props} />
        </NavigationContainer>
      </Provider>,
    ).toJSON();
    expect(tree).toMatchSnapshot();
  });
});
