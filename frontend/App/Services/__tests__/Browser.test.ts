import openBrowser from '../Browser';
import { InAppBrowser } from 'react-native-inappbrowser-reborn';
import { Colors } from 'App/Themes';

jest.mock('react-native-inappbrowser-reborn', () => ({
  InAppBrowser: {
    open: jest.fn(),
  },
}));

describe('Browser', () => {
  test('should call InAppBrowser.open with the provided URL and options', () => {
    const url = 'https://example.com';

    openBrowser(url);

    expect(InAppBrowser.open).toHaveBeenCalledWith(url, {
      preferredBarTintColor: Colors.background,
      preferredControlTintColor: Colors.white,
      readerMode: true,
      animated: true,
      modalPresentationStyle: 'fullScreen',
      modalTransitionStyle: 'coverVertical',
      modalEnabled: true,
      enableBarCollapsing: false,
      toolbarColor: Colors.background,
      enableUrlBarHiding: true,
      enableDefaultShare: true,
    });
  });
});
