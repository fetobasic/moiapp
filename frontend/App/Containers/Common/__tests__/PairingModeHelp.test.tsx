import React from 'react';
import { render } from '@testing-library/react-native';
import { Provider } from 'react-redux';
import createMockStore from 'redux-mock-store';
import { mockedState, yeti6GLatestFW, yetiLegacy } from 'App/Fixtures/mocks/mockedState';
import PairingModeHelp from '../PairingModeHelp';
import { Store } from 'redux';
import { NavigationContainer } from '@react-navigation/native';
import { fridgeAlta80State } from 'App/Fixtures/fridgeState';

jest.useFakeTimers();

const mockStore = createMockStore([]);

const defaultDevice = {
  label: 'Yeti 6G',
  value: 'YETI4000',
  icon: 0,
  panelInfo: 0,
  width: 10,
};

const renderWithStore = (store: Store, device = defaultDevice) => {
  const props = {
    navigation: {
      navigate: jest.fn() as any,
      goBack: jest.fn() as any,
    },
    route: { params: { device } },
  } as any;
  return render(
    <Provider store={store}>
      <NavigationContainer>
        <PairingModeHelp {...props} />
      </NavigationContainer>
    </Provider>,
  ).toJSON();
};
describe('PairingModeHelp', () => {
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
      const tree = renderWithStore(store, { ...defaultDevice, value: 'YETI1500X' });
      expect(tree).toMatchSnapshot();
    });
    test('renders screen for fridge', () => {
      const updatedState = {
        ...mockedState,
        devicesInfo: {
          ...mockedState.devicesInfo,
          data: [fridgeAlta80State],
        },
      };
      const store = mockStore(updatedState);
      const tree = renderWithStore(store, { ...defaultDevice, value: 'ALTA_50_FRIDGE' });
      expect(tree).toMatchSnapshot();
    });
  });
});
