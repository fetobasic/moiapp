import { InAppBrowser, InAppBrowserOptions } from 'react-native-inappbrowser-reborn';
import { Colors } from 'App/Themes';

export default function openBrowser(url: string, options?: InAppBrowserOptions) {
  InAppBrowser.open(url, {
    // iOS Properties
    preferredBarTintColor: Colors.background,
    preferredControlTintColor: Colors.white,
    readerMode: true,
    animated: true,
    modalPresentationStyle: 'fullScreen',
    modalTransitionStyle: 'coverVertical',
    modalEnabled: true,
    enableBarCollapsing: false,
    // Android Properties
    toolbarColor: Colors.background,
    enableUrlBarHiding: true,
    enableDefaultShare: true,

    ...options,
  });
}
