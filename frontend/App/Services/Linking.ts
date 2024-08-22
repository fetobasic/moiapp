import { Linking } from 'react-native';
import { startsWith, last, split, isEmpty } from 'ramda';

import { deviceExists } from './Devices';
import { navigate } from 'App/Navigation/AppNavigation';
import { store } from 'App/Store';
import { devicesSelectors } from 'App/Store/Devices';

const DEEP_LINK_URL_THING = 'yetiapp://thing';
const DEEP_LINK_PATTERN = new RegExp(`^${DEEP_LINK_URL_THING}/`);

export const openLink = (url: string) => Linking.openURL(url);

const isValidDeepLink = (url: string) => DEEP_LINK_PATTERN.test(url);

const getThingName = (url: string) => (startsWith(`${DEEP_LINK_URL_THING}/`, url) ? last(split('/', url)) : '');

export const openDeepLinkUrl = ({ url = '' }) => {
  if (!isValidDeepLink(url)) {
    return;
  }

  const thingName = getThingName(url);
  const devices = devicesSelectors.getDevicesInfoData(store.getState());

  if (isEmpty(devices)) {
    navigate('Home');
    return;
  }

  if (thingName && deviceExists(devices, thingName)) {
    navigate('Home', { device: devices.find((d) => d.thingName === thingName) });
    return;
  }
};
