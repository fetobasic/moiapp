import React from 'react';
import { fireEvent, render, screen } from '@testing-library/react-native';
import { Provider } from 'react-redux';
import createMockStore from 'redux-mock-store';
import { DrawerContentComponentProps } from '@react-navigation/drawer';
import { mockedInitState, mockedState } from 'App/Fixtures/mocks/mockedState';
import DrawerContent from '../DrawerContent';
import { Store } from 'redux';
import { NavigationContainer } from '@react-navigation/native';
import { applicationActions } from 'App/Store/Application';

jest.useFakeTimers();
jest.setSystemTime(1606348800);
const mockStore = createMockStore([]);

const props = {
  navigation: {
    navigate: jest.fn() as any,
  },
} as DrawerContentComponentProps;

const renderWithStore = (store: Store) =>
  render(
    <Provider store={store}>
      <NavigationContainer>
        <DrawerContent {...props} />
      </NavigationContainer>
    </Provider>,
  ).toJSON();

describe('DrawerContent', () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('Yeti in Sidebar', () => {
    test('renders "No Device Connected" when no devices in sidebar', () => {
      const store = mockStore(mockedInitState);
      const tree = renderWithStore(store);
      expect(tree).toMatchSnapshot();
    });

    test('renders 2 devices: yeti6G, yeti legacy', () => {
      const store = mockStore(mockedState);
      const tree = renderWithStore(store);
      expect(tree).toMatchSnapshot();
    });
  });

  describe('Navigate to screen', () => {
    describe('Should be redirected to StartPairing', () => {
      test('by pressing on Connect new Device button', () => {
        const store = mockStore(mockedInitState);
        renderWithStore(store);
        const addNewDeviceBtn = screen.getByText('Connect new Device');
        fireEvent.press(addNewDeviceBtn);
        expect(props.navigation.navigate).toHaveBeenCalledWith('StartPairing');
      });

      test('by pressing on Connect new Device text', () => {
        const store = mockStore(mockedInitState);
        renderWithStore(store);
        const connectNewDeviceText = screen.getByText('Connect new Device');
        fireEvent.press(connectNewDeviceText);
        expect(props.navigation.navigate).toHaveBeenCalledWith('StartPairing');
      });
    });

    test('Should be redirected to Login', () => {
      const store = mockStore({ ...mockedInitState, auth: { user: { email: null } } });
      renderWithStore(store);
      const addNewDeviceBtn = screen.getByText('Connect new Device');
      fireEvent.press(addNewDeviceBtn);
      expect(props.navigation.navigate).toHaveBeenCalledWith('StartPairing');
    });

    test('should be redirected to Account', () => {
      const store = mockStore(mockedState);
      renderWithStore(store);
      const accountBtn = screen.getByText('testemail@example.com');
      fireEvent.press(accountBtn);
      expect(props.navigation.navigate).toHaveBeenCalledWith('EditAccount');
    });

    test('should be redirected to Device Home', () => {
      const device = mockedState.devicesInfo.data[0].thingName;
      const store = mockStore(mockedState);
      renderWithStore(store);
      const deviceText = screen.getByText(device);
      fireEvent.press(deviceText);
      const dispatch = jest.fn();
      dispatch(applicationActions.setLastDevice(device));
      expect(dispatch).toHaveBeenCalledWith({
        type: '@APP/SET_LAST_DEVICE',
        payload: device,
      });
    });

    test('should be redirected to Notification', () => {
      const store = mockStore(mockedInitState);
      renderWithStore(store);
      const notificationsBtn = screen.getByText('Notifications');
      fireEvent.press(notificationsBtn);
      expect(props.navigation.navigate).toHaveBeenCalledWith('Notifications');
    });

    test('should be redirected to App Settings', () => {
      const store = mockStore(mockedInitState);
      renderWithStore(store);
      const appSettingsBtn = screen.getByText('App Settings');
      fireEvent.press(appSettingsBtn);
      expect(props.navigation.navigate).toHaveBeenCalledWith('ApplicationSettings');
    });

    test('should be redirected to Help', () => {
      const store = mockStore(mockedInitState);
      renderWithStore(store);
      const helpBtn = screen.getByText('Help');
      fireEvent.press(helpBtn);
      expect(props.navigation.navigate).toHaveBeenCalledWith('HelpNav');
    });
  });
});
