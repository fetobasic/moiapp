import React from 'react';
import { render } from '@testing-library/react-native';
import { Provider } from 'react-redux';
import createMockStore from 'redux-mock-store';
import { mockedState, yeti6GLatestFW, yetiLegacy } from 'App/Fixtures/mocks/mockedState';
import ChargeProfile from '../ChargeProfile';
import { Store } from 'redux';
import { NavigationContainer } from '@react-navigation/native';

jest.useFakeTimers();
const mockStore = createMockStore([]);

const renderWithStore = (store: Store, device = yeti6GLatestFW) => {
  const props = {
    navigation: {
      navigate: jest.fn() as any,
    },
    route: { params: { device } },
  } as any;
  return render(
    <Provider store={store}>
      <NavigationContainer>
        <ChargeProfile {...props} />
      </NavigationContainer>
    </Provider>,
  ).toJSON();
};
describe('ChargeProfile', () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('renders screen for Yeti', () => {
    test('renders screen for 6G yeti', () => {
      const updatedState = {
        ...mockedState,
        devicesInfo: {
          ...mockedState.devicesInfo,
          data: [yeti6GLatestFW],
        },
      };
      const store = mockStore(updatedState);
      const tree = renderWithStore(store);
      expect(tree).toMatchSnapshot();
    });

    test('renders screen for legacy yeti', () => {
      const updatedState = {
        ...mockedState,
        devicesInfo: {
          ...mockedState.devicesInfo,
          data: [yetiLegacy],
        },
      };
      const store = mockStore(updatedState);
      const tree = renderWithStore(store, yetiLegacy as any);
      expect(tree).toMatchSnapshot();
    });
  });
});
