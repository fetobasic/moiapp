import { runSaga } from 'redux-saga';
import { initialState } from 'App/Store/Yeti/reducers';
import {
  bluetoothStopScan,
  clearDiscoveredDevices,
  directConnectRequest,
  getYetiInfo,
  postToYeti,
  receiveBluetoothYetiInfo,
  receiveDiscoveredDevices,
  setPassword,
  startPair,
} from 'App/Store/Yeti/sagas';
import * as actions from 'App/Store/Yeti/actions';
import * as selectors from 'App/Store/Yeti/selectors';
import { applicationSelectors } from 'App/Store/Application';
import { Bluetooth } from 'App/Containers/Home/HomeScreen';
import { showBluetoothErrorInfo } from 'App/Services/Alert';
import clearAllMocks = jest.clearAllMocks;

describe('Yeti sagas', () => {
  const peripheralId = '7097hvnv6460v960w9e';

  describe('postToYeti', () => {
    test('should handle a successful API response', async () => {
      const req = { data: { thinkName: 'testThinkName' } };
      const mockApi = { postToYeti: jest.fn(() => ({ ok: true, data: req.data })) };

      const dispatched: [] = [];

      await runSaga(
        { dispatch: (action) => dispatched.push(action), getState: () => initialState },
        postToYeti,
        mockApi,
        actions.yetiJoin.request({ req }),
      ).toPromise();

      expect(dispatched).toEqual([actions.yetiJoin.success(req)]);
      expect(mockApi.postToYeti).toHaveBeenCalledWith(req);
    });

    test('should handle a failed API response', async () => {
      const req = {};
      const mockApi = { postToYeti: jest.fn(() => ({ ok: false })) };

      const dispatched: [] = [];

      await runSaga(
        { dispatch: (action) => dispatched.push(action), getState: () => initialState },
        postToYeti,
        mockApi,
        actions.yetiJoin.request({ req }),
      ).toPromise();

      expect(dispatched).toEqual([actions.yetiJoin.failure()]);
      expect(mockApi.postToYeti).toHaveBeenCalledWith(req);
    });
  });

  describe('getYetiInfo', () => {
    test('should handle a successful API response', async () => {
      const dispatched: [] = [];

      applicationSelectors.getDataTransferType = jest.fn(() => 'bluetooth');
      Bluetooth.getSysInfo = jest.fn(() => ({ ok: true, data: {} }));

      await runSaga(
        { dispatch: (action) => dispatched.push(action), getState: () => initialState },
        getYetiInfo,
        { getYetiInfo: jest.fn() },
        actions.yetiInfo.request({ peripheralId }),
      ).toPromise();

      expect(dispatched).toEqual([actions.yetiInfo.success({ data: {} })]);
      expect(Bluetooth.getSysInfo).toHaveBeenCalledWith(peripheralId);
    });

    test('should handle a failed API response', async () => {
      const mockApi = { getYetiInfo: jest.fn(() => ({ ok: false })) };
      const dispatched: [] = [];

      applicationSelectors.getDataTransferType = jest.fn(() => 'wifi');

      await runSaga(
        { dispatch: (action) => dispatched.push(action), getState: () => initialState },
        getYetiInfo,
        mockApi,
        actions.yetiInfo.request({ peripheralId }),
      ).toPromise();

      expect(dispatched).toEqual([actions.yetiInfo.failure()]);
      expect(mockApi.getYetiInfo).toHaveBeenCalledWith(peripheralId);
    });
  });

  describe('setPassword', () => {
    const password = 'testPassword';

    test('should handle a successful API response', async () => {
      const mockApi = { setPassword: jest.fn(() => ({ ok: true, data: null })) };
      const dispatched: [] = [];

      await runSaga(
        { dispatch: (action) => dispatched.push(action), getState: () => initialState },
        setPassword,
        mockApi,
        actions.yetiSetPassword.request({ password }),
      ).toPromise();

      expect(dispatched).toEqual([actions.yetiSetPassword.success()]);
    });

    test('should handle a failed API response', async () => {
      const errorMessage = 'Failed to set password';
      const mockApi = { setPassword: jest.fn(() => ({ ok: false, data: { msg: errorMessage } })) };
      const dispatched: [] = [];

      await runSaga(
        { dispatch: (action) => dispatched.push(action), getState: () => initialState },
        setPassword,
        mockApi,
        actions.yetiSetPassword.request({ password }),
      ).toPromise();

      expect(dispatched).toEqual([actions.yetiSetPassword.failure({ error: errorMessage })]);
    });
  });

  describe('directConnectRequest', () => {
    test('should handle a successful API response', async () => {
      const response = { ok: true, data: { testData: {} } };
      const mockApi = { directConnect: jest.fn(() => response) };
      const dispatched: [] = [];

      await runSaga(
        {
          dispatch: (action) => dispatched.push(action),
          getState: () => initialState,
        },
        directConnectRequest,
        mockApi,
      ).toPromise();

      expect(dispatched).toEqual([actions.directConnect.success({ directData: response.data })]);
    });

    test('should handle a failed API response', async () => {
      const mockApi = { directConnect: jest.fn(() => ({ ok: false, data: null })) };
      const dispatched: [] = [];

      await runSaga(
        {
          dispatch: (action) => dispatched.push(action),
          getState: () => initialState,
        },
        directConnectRequest,
        mockApi,
      ).toPromise();

      expect(dispatched).toEqual([actions.directConnect.failure()]);
    });
  });

  describe('startPair', () => {
    test('should handle a successful API response', async () => {
      const dispatched: [] = [];

      Bluetooth.startPairing = jest.fn(() => ({ ok: true, status: 200 }));
      applicationSelectors.getDataTransferType = jest.fn(() => 'bluetooth');

      await runSaga(
        { dispatch: (action) => dispatched.push(action), getState: () => initialState },
        startPair,
        { startPair: jest.fn() },
        actions.startPair.request({ peripheralId }),
      ).toPromise();

      expect(dispatched).toEqual([actions.startPair.success()]);
    });

    test('should handle a failed API response', async () => {
      const mockApi = { startPair: jest.fn(() => ({ ok: false, status: 500 })) };
      applicationSelectors.getDataTransferType = jest.fn(() => 'wi-fi');

      const dispatched: [] = [];

      await runSaga(
        { dispatch: (action) => dispatched.push(action), getState: () => initialState },
        startPair,
        mockApi,
        actions.startPair.request({ peripheralId }),
      ).toPromise();

      expect(dispatched).toEqual([actions.startPair.failure()]);
    });
  });

  describe('receiveDiscoveredDevices', () => {
    test('should add a new peripheral to discovered devices if not already present', async () => {
      const peripheral = { id: 'uniqueId', name: 'DeviceName' };
      const dispatched: [] = [];

      selectors.getDiscoveredDevices = jest.fn(() => []);

      await runSaga(
        { dispatch: (action) => dispatched.push(action), getState: () => initialState },
        receiveDiscoveredDevices,
        actions.discoveredDevices.request({ peripheral }),
      ).toPromise();

      expect(dispatched).toEqual([actions.discoveredDevices.success({ discoveredDevices: [peripheral] })]);
    });

    test('should not add a duplicate peripheral to discovered devices', async () => {
      const peripheral = { id: 'duplicateId', name: 'DeviceName' };
      const dispatched: [] = [];

      selectors.getDiscoveredDevices = jest.fn(() => [{ id: 'duplicateId', name: 'OtherDevice' }]);

      await runSaga(
        { dispatch: (action) => dispatched.push(action), getState: () => initialState },
        receiveDiscoveredDevices,
        actions.discoveredDevices.request({ peripheral }),
      ).toPromise();

      expect(dispatched).toEqual([]);
    });
  });

  test('should clear the discoveredDevices array', async () => {
    const dispatched: [] = [];

    await runSaga(
      { dispatch: (action) => dispatched.push(action), getState: () => initialState },
      clearDiscoveredDevices,
    ).toPromise();

    expect(dispatched).toEqual([actions.discoveredDevices.success({ discoveredDevices: [] })]);
  });

  describe('bluetoothStopScan', () => {
    jest.mock('App/Services/Alert', () => ({ showBluetoothErrorInfo: jest.fn() }));
    showBluetoothErrorInfo = jest.fn();

    test('should call showBluetoothErrorInfo when discoveredDevices are empty', async () => {
      selectors.getDiscoveredDevices = jest.fn(() => []);

      const dispatched: [] = [];

      await runSaga(
        { dispatch: (action) => dispatched.push(action), getState: () => initialState },
        bluetoothStopScan,
      ).toPromise();

      expect(dispatched).toEqual([]);
      expect(showBluetoothErrorInfo).toHaveBeenCalledTimes(1);
    });

    test('should not call showBluetoothErrorInfo when discoveredDevices are not empty', async () => {
      clearAllMocks();
      const discoveredDevices = { id: 'device1', name: 'Device 1' };
      selectors.getDiscoveredDevices = jest.fn(() => [discoveredDevices]);

      const dispatched: [] = [];

      await runSaga(
        {
          dispatch: (action) => dispatched.push(action),
          getState: () => ({ ...initialState, discoveredDevices }),
        },
        bluetoothStopScan,
      ).toPromise();

      expect(dispatched).toEqual([]);
      expect(showBluetoothErrorInfo).not.toHaveBeenCalled();
    });
  });

  test('should dispatch yetiJoin.success with the correct data', async () => {
    const data = { id: 'yeti1', name: 'Yeti 1' };
    const dispatched: [] = [];

    await runSaga(
      { dispatch: (action) => dispatched.push(action), getState: () => initialState },
      receiveBluetoothYetiInfo,
      actions.bluetoothReceiveYetiInfo({ data }),
    ).toPromise();

    expect(dispatched).toEqual([actions.yetiJoin.success({ data })]);
  });
});
