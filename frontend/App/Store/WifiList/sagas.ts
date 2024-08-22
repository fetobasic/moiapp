import { call, put, all, takeLatest } from 'redux-saga/effects';
import { SagaIterator } from 'redux-saga';

import { objectToWifiArray } from 'App/Transforms/objectToArray';

import * as actions from './actions';
import DirectApi from 'App/Services/DirectApi';

export function* getWifiList(api: ReturnType<typeof DirectApi.create>): SagaIterator {
  // make the call to the api
  const response = yield call(api.getWifiList);

  if (response.ok) {
    const data = response.data || {};
    const wifiList = objectToWifiArray(data);

    yield put(actions.wifi.success({ data: wifiList }));
  } else {
    yield put(actions.wifi.failure());
  }
}

export function* receiveBluetoothWifiList({ payload: { response } }: ReturnType<typeof actions.bluetoothWifi>) {
  const data = response || {};
  const wifiList = objectToWifiArray(data);

  yield put(actions.wifi.success({ data: wifiList }));
}

export default function* wifiListSaga(directApi: ReturnType<typeof DirectApi.create>): SagaIterator {
  yield all([
    takeLatest(actions.bluetoothWifi, receiveBluetoothWifiList),
    takeLatest(actions.wifi.request, getWifiList, directApi),
  ]);
}
