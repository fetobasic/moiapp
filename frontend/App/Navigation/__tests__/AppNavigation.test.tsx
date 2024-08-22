import React from 'react';
import { render } from '@testing-library/react-native';
import { useAppSelector } from 'App/Hooks';
import Navigator, { isPairingRoutes, navigationGoBack } from 'App/Navigation/AppNavigation';

jest.mock('react-redux', () => ({ ...jest.requireActual('react-redux'), useSelector: jest.fn() }));

describe('AppNavigation', () => {
  test('renders correctly when isAppLoaded is true', () => {
    useAppSelector.mockReturnValue({ isAppLoaded: true });

    const screen = render(<Navigator />);

    expect(screen).toMatchSnapshot();
  });

  test('renders nothing when isAppLoaded is false', () => {
    useAppSelector.mockReturnValue({ isAppLoaded: false });

    const { queryByText } = render(<Navigator />);

    expect(queryByText('HomeNav')).toBeNull();
  });

  describe('navigationGoBack', () => {
    test('does not call canGoBack and goBack when navigationRef is undefined', () => {
      const navigationRef = { current: undefined };
      const originalNavigationRef = global.navigationRef;
      global.navigationRef = navigationRef;

      navigationGoBack();

      expect(global.navigationRef.current).toBeUndefined();

      global.navigationRef = originalNavigationRef;
    });
  });

  describe('isPairingRoutes', () => {
    test('should return false for invalid route names', () => {
      const invalidRouteNames = ['Dashboard', 'Settings', 'Profile'];

      invalidRouteNames.forEach((routeName) => {
        expect(isPairingRoutes({ name: routeName })).toBe(false);
      });
    });

    test('should return false for an empty route name', () => {
      expect(isPairingRoutes({ name: '' })).toBe(false);
    });

    test('should return false when navigationRef.current is undefined', () => {
      const navigationRef = { current: undefined };

      expect(isPairingRoutes(navigationRef)).toBe(false);
    });
  });
});
