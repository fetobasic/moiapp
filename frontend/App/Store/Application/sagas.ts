import { put, select, call, all, takeLatest } from '@redux-saga/core/effects';
import { SagaIterator } from '@redux-saga/types';
import DeviceInfo from 'react-native-device-info';
import { capitalize, sortBy } from 'lodash';
import { phoneId, appVersion } from 'App/Config/AppConfig';
import * as actions from './actions';
import { devicesSelectors } from 'App/Store/Devices';
import { SendFeedbackFormType, YetiType } from 'App/Types/FeedbackForm';
import { isAndroid, isIOS } from 'App/Themes';
import { Platform } from 'react-native';
import { BackendApiType } from '../rootSaga';
import { Yeti6GState, YetiState } from 'App/Types/Yeti';
import { FridgeState } from 'App/Types/Fridge';

type MergedDevicesStateType = Partial<YetiState & Yeti6GState & FridgeState & { lastPairedAt: string }>;

export function* sendFeedbackForm(
  api: BackendApiType,
  {
    payload: { subject, email, name, phoneNumber, message, yeti, firmwareVersionFailed, thingName: thingNameFailed },
  }: ReturnType<typeof actions.sendFeedbackForm.request>,
): SagaIterator {
  let devices = yield select(devicesSelectors.getDevicesInfoData);

  // Sort by connectedAt DESC
  devices = sortBy(devices, (device) => -new Date(device.connectedAt || device.lastPairedAt || 0).getTime());

  const yetis: YetiType[] = devices.map(
    ({ thingName, model, firmwareVersion, connectedAt, lastPairedAt }: MergedDevicesStateType) => ({
      connectedOk: true,
      thingName,
      model,
      firmwareVersion,
      connectedAt: connectedAt || lastPairedAt,
      firmwareVersionFailed: thingName === thingNameFailed ? firmwareVersionFailed : undefined,
    }),
  );

  if (yeti) {
    yetis.unshift(yeti);
  }

  yetis.forEach((_yeti) => {
    if (!_yeti.thingName) {
      _yeti.thingName = 'unknown';
    }
    if (!_yeti.model) {
      _yeti.model = 'unknown';
    }
    if (!_yeti.firmwareVersion) {
      _yeti.firmwareVersion = 'unknown';
    }
    if (!_yeti.connectedAt) {
      _yeti.connectedAt = 'unknown';
    }
  });

  const data: SendFeedbackFormType = {
    phoneId,
    phoneModel: `${
      isIOS ? 'Apple' : capitalize(DeviceInfo.getBrand())
    } ${DeviceInfo.getModel()} (${DeviceInfo.getDeviceId()})`,
    os: `${isIOS ? 'iOS' : 'Android'} ${DeviceInfo.getSystemVersion()}${isAndroid ? ` (${Platform.Version} SDK)` : ''}`,
    appVersion,
    email,
    userName: name,
    phoneNumber,
    subject,
    message,
    yetis,
  };

  const response = yield call(api.sendFeedbackForm, data);

  if (response.ok) {
    yield put(actions.sendFeedbackForm.success());
  } else {
    yield put(actions.sendFeedbackForm.failure());
  }
}

export default function* devicesSaga(backendApi: BackendApiType): SagaIterator {
  yield all([takeLatest(actions.sendFeedbackForm.request, sendFeedbackForm, backendApi)]);
}
