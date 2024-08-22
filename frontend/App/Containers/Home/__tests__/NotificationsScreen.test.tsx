import React from 'react';
import { render } from '@testing-library/react-native';
import NotificationsScreen from '../NotificationsScreen';
import { NavigationContainer } from '@react-navigation/native';
import { Provider } from 'react-redux';
import createMockStore from 'redux-mock-store';
import { mockedState, yeti6G } from 'App/Fixtures/mocks/mockedState';

const mockStore = createMockStore([]);
const store = mockStore({
  ...mockedState,
  application: {
    ...mockedState.application,
    lastDevice: yeti6G.thingName,
  },

  devicesInfo: {
    ...mockedState.devicesInfo,
    data: [yeti6G],
  },
});

describe('AccessoriesInfo', () => {
  test('renders screen', () => {
    const props = {
      navigation: {
        navigate: jest.fn() as any,
      },
      route: { params: { device: yeti6G } },
    } as any;

    const tree = render(
      <Provider store={store}>
        <NavigationContainer>
          <NotificationsScreen {...props} />
        </NavigationContainer>
      </Provider>,
    ).toJSON();
    expect(tree).toMatchSnapshot();
  });
});
