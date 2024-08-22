import { HOME } from 'App/Config/NavigationRoutes';
import { navigate } from 'App/Navigation/AppNavigation';
import { openDeepLinkUrl, openLink } from 'App/Services/Linking';
import { Linking } from 'react-native';
import { devicesSelectors } from 'App/Store/Devices';
import { yeti6G } from 'App/Fixtures/mocks/mockedState';

jest.mock('App/Navigation/AppNavigation');

describe('Linking', () => {
  test('should call Linking.openURL with the provided URL', () => {
    const url = 'https://example.com';

    openLink(url);

    expect(Linking.openURL).toHaveBeenCalledWith(url);
  });

  describe('openDeepLinkUrl', () => {
    test('should return undefined if deep link not valid', () => {
      const url = 'invalid_url';
      const res = openDeepLinkUrl({ url });

      expect(res).toBeUndefined();
    });

    test('navigates to HOME if the device is empty', () => {
      const url = 'yetiapp://thing/thingName';

      openDeepLinkUrl({ url });

      expect(navigate).toHaveBeenCalledWith(HOME);
    });

    test('navigates to HOME if the thingName and devices exist', () => {
      const url = `yetiapp://thing/${yeti6G.thingName}`;
      jest.spyOn(devicesSelectors, 'getDevicesInfoData').mockReturnValue([yeti6G]);

      openDeepLinkUrl({ url });

      expect(navigate).toHaveBeenCalledWith(HOME, { device: yeti6G });
    });

    test("navigates to HOME if the thingName doesn't exist", () => {
      const url = `yetiapp://thing/`;
      jest.spyOn(devicesSelectors, 'getDevicesInfoData').mockReturnValue([]);

      openDeepLinkUrl({ url });

      expect(navigate).toHaveBeenCalledWith(HOME);
    });
  });
});
