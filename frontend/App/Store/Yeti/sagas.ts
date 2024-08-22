import { call, select, put, all, takeLatest } from 'redux-saga/effects';
import { SagaIterator } from 'redux-saga';
import { find, propEq, isEmpty } from 'ramda';
import { ApiResponse } from 'apisauce';

import { showBluetoothErrorInfo } from 'App/Services/Alert';

import * as actions from './actions';
import * as selectors from './selectors';
import { BluetoothDevice } from 'App/Types/BluetoothDevices';
import { DirectApiType } from '../rootSaga';
import { YetiDirectInfo, YetiSysInfo } from 'App/Types/Yeti';
import { DataTransferType } from 'App/Types/ConnectionType';
import { applicationSelectors } from 'App/Store/Application';
import { Bluetooth } from 'App/Containers/Home/HomeScreen';

export function* postToYeti(api: DirectApiType, { payload: { req } }: ReturnType<typeof actions.yetiJoin.request>) {
  const response: ApiResponse<YetiSysInfo> = yield call(api.postToYeti, req);

  if (response.ok && response.data) {
    const data = response.data;

    yield put(actions.yetiJoin.success({ data }));
  } else {
    yield put(actions.yetiJoin.failure());
  }
}

export function* getYetiInfo(
  api: DirectApiType,
  { payload: { peripheralId } }: ReturnType<typeof actions.yetiInfo.request>,
) {
  const dataTransferType: DataTransferType = yield select(applicationSelectors.getDataTransferType);
  const isBluetoothConnection = dataTransferType === 'bluetooth';

  const requestFunction = isBluetoothConnection ? Bluetooth.getSysInfo : api.getYetiInfo;

  const response: ApiResponse<YetiSysInfo> = yield call(requestFunction, peripheralId);

  if (response.ok) {
    const data = response.data;

    yield put(actions.yetiInfo.success({ data }));
  } else {
    yield put(actions.yetiInfo.failure());
  }
}

export function* setPassword(
  api: DirectApiType,
  { payload: { password } }: ReturnType<typeof actions.yetiSetPassword.request>,
) {
  const response: ApiResponse<any> = yield call(api.setPassword, password);

  if (response.ok) {
    yield put(actions.yetiSetPassword.success());
  } else {
    const error = response?.data?.msg || 'Failed to set password';

    yield put(actions.yetiSetPassword.failure({ error }));
  }
}

export function* directConnectRequest(api: DirectApiType) {
  const response: ApiResponse<YetiDirectInfo> = yield call(api.directConnect);

  if (response.ok && response.data) {
    const data = response.data;

    yield put(actions.directConnect.success({ directData: data }));
  } else {
    yield put(actions.directConnect.failure());
  }
}

export function* startPair(
  api: DirectApiType,
  { payload: { peripheralId } }: ReturnType<typeof actions.startPair.request>,
) {
  const dataTransferType: DataTransferType = yield select(applicationSelectors.getDataTransferType);
  const isBluetoothConnection = dataTransferType === 'bluetooth';

  const requestFunction = isBluetoothConnection ? Bluetooth.startPairing : api.startPair;

  const response: ApiResponse<any> = yield call(requestFunction, peripheralId);

  if (response.ok && response.status === 200) {
    yield put(actions.startPair.success());
  } else {
    yield put(actions.startPair.failure());
  }
}

export function* receiveDiscoveredDevices({
  payload: { peripheral },
}: ReturnType<typeof actions.discoveredDevices.request>) {
  const discoveredDevices: BluetoothDevice[] = yield select(selectors.getDiscoveredDevices);

  if (!find(propEq('id', peripheral.id))(discoveredDevices)) {
    yield put(actions.discoveredDevices.success({ discoveredDevices: [...discoveredDevices, peripheral] }));
  }
}

export function* clearDiscoveredDevices() {
  yield put(actions.discoveredDevices.success({ discoveredDevices: [] }));
}

export function* bluetoothStopScan() {
  const discoveredDevices: BluetoothDevice[] = yield select(selectors.getDiscoveredDevices);

  if (isEmpty(discoveredDevices)) {
    showBluetoothErrorInfo();
  }
}

export function* receiveBluetoothYetiInfo({ payload: { data } }: ReturnType<typeof actions.bluetoothReceiveYetiInfo>) {
  yield put(actions.yetiJoin.success({ data }));
}

export default function* yetiSaga(directApi: DirectApiType): SagaIterator {
  yield all([
    takeLatest(actions.discoveredDevices.request, receiveDiscoveredDevices),
    takeLatest(actions.clearDiscoveredDevices, clearDiscoveredDevices),
    takeLatest(actions.bluetoothStopScan, bluetoothStopScan),
    takeLatest(actions.bluetoothReceiveYetiInfo, receiveBluetoothYetiInfo),

    /** Direct API */
    takeLatest(actions.yetiJoin.request, postToYeti, directApi),
    takeLatest(actions.yetiInfo.request, getYetiInfo, directApi),
    takeLatest(actions.yetiSetPassword.request, setPassword, directApi),
    takeLatest(actions.directConnect.request, directConnectRequest, directApi),
    takeLatest(actions.startPair.request, startPair, directApi),
  ]);
}
