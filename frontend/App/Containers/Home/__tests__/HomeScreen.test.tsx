import React from 'react';
import { render, screen } from '@testing-library/react-native';
import { Provider } from 'react-redux';
import createMockStore from 'redux-mock-store';
import { mockedState, yeti6G, yeti6GLatestFW, yetiLegacy } from 'App/Fixtures/mocks/mockedState';
import HomeScreen from '../HomeScreen';
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
        <HomeScreen {...props} />
      </NavigationContainer>
    </Provider>,
  ).toJSON();
};

describe('HomeScreen', () => {
  const chargeProfileText = 'Charge Profile (Custom)';

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('renders screen for Yeti', () => {
    test('renders screen for 6G yeti', () => {
      const updatedState = {
        ...mockedState,
        application: {
          ...mockedState.application,
          lastDevice: yeti6G.thingName,
        },

        devicesInfo: {
          ...mockedState.devicesInfo,
          data: [yeti6G],
        },
      };
      const store = mockStore(updatedState);
      const tree = renderWithStore(store);
      expect(tree).toMatchSnapshot();

      const chargeProfileBtn = screen.getByText(chargeProfileText);
      expect(chargeProfileBtn).toHaveTextContent(chargeProfileText);

      const batteryBtn = screen.getByTestId('homeBattery');
      expect(batteryBtn).toHaveTextContent('Battery (0 / 1 Wh)');
    });

    test('renders screen for legacy yeti', () => {
      const updatedState = {
        ...mockedState,
        application: {
          ...mockedState.application,
          lastDevice: yetiLegacy.thingName,
        },
        devicesInfo: {
          ...mockedState.devicesInfo,
          data: [yetiLegacy],
        },
      };
      const store = mockStore(updatedState);
      const tree = renderWithStore(store, yetiLegacy as any);
      expect(tree).toMatchSnapshot();

      const batteryBtn = screen.getByTestId('homeBattery');
      expect(batteryBtn).toHaveTextContent('Battery (1260 / 1500 Wh)');
    });
  });
});
