import { all, call, fork } from 'redux-saga/effects';
import { SagaIterator } from '@redux-saga/types';
import { networkSaga } from 'react-native-offline';

import Config from 'App/Config/AppConfig';
import DebugConfig from 'App/Config/DebugConfig';
import FixtureAPI from 'App/Services/FixtureApi';
import DirectApi from 'App/Services/DirectApi';
import BackendApi from 'App/Services/BackendApi';

import { applicationSagas } from './Application';
import { authSagas } from './Auth';
import { devicesSagas } from './Devices/sagas';
import { firmwareUpdateSagas } from './FirmwareUpdate';
import { notificationSagas } from './Notification';
import { sturtupSagas } from './Startup';
import { usageReportSagas } from './UsageReport';
import { wifiSagas } from './WifiList';
import { yetiSagas } from './Yeti';

const directApi = DebugConfig.useFixtures ? FixtureAPI : DirectApi.create();
export const backendApi = DebugConfig.useFixtures ? FixtureAPI : BackendApi.create();

export type DirectApiType = typeof directApi;
export type BackendApiType = typeof backendApi;

function* rootSaga(): SagaIterator {
  yield all([
    call(applicationSagas.default, backendApi),
    call(authSagas.default, backendApi),
    call(devicesSagas, directApi, backendApi),
    call(firmwareUpdateSagas.default, directApi, backendApi),
    call(notificationSagas.default, backendApi),
    call(sturtupSagas.default, backendApi),
    call(usageReportSagas.default, backendApi),
    // @ts-ignore as it seems too complicated to narrow type here
    call(wifiSagas.default, directApi),
    call(yetiSagas.default, directApi),

    // @ts-ignore as it seems we can't narrow type for `fork` signature
    fork(networkSaga, {
      pingInterval: Config.checkInternetTimeout,
    }),
  ]);
}

export default rootSaga;
