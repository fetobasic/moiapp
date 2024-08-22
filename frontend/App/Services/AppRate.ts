import InAppReview from 'react-native-in-app-review';
import { differenceInMilliseconds } from 'date-fns';

import { store } from 'App/Store';
import { applicationActions } from 'App/Store/Application';
import Config from 'App/Config/AppConfig';
import { isPairingRoutes } from 'App/Navigation/AppNavigation';

const isAllowedToShowAppRate = () => {
  const shownAppRateDate = store.getState().application?.appRateInfo?.shownAppRateDate || new Date(0);

  const now = new Date();
  const shownDate = new Date(shownAppRateDate);

  return differenceInMilliseconds(now, shownDate) > Config.appRateWaitAfterCancel;
};

const AppRate = () => {
  // Don't show app rate if user is on pairing routes
  // or app in direct mode
  // or firmware update is in progress
  if (
    isPairingRoutes() ||
    store.getState().application?.isDirectConnection ||
    store.getState().firmwareUpdate?.updating
  ) {
    return;
  }

  store.dispatch(
    applicationActions.changeAppRateInfo({
      shownAppRateDate: new Date(),
    }),
  );

  if (InAppReview.isAvailable()) {
    InAppReview.RequestInAppReview();
  }
};

export { isAllowedToShowAppRate };
export default AppRate;
