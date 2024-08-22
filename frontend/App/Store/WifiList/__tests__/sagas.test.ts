import { runSaga } from 'redux-saga';
import { getWifiList, receiveBluetoothWifiList } from 'App/Store/WifiList/sagas';
import * as actions from 'App/Store/WifiList/actions';

describe('WifiList sagas', () => {
  const data = { network1: { db: -73 }, network2: { db: -86 } };
  const expectData = [
    { db: -73, name: 'network1' },
    { db: -86, name: 'network2' },
  ];

  describe('getWifiList', () => {
    test('should dispatch wifi.success with the retrieved data when the API call is successful', async () => {
      const mockApi = { getWifiList: jest.fn(() => ({ ok: true, data })) };
      const dispatched: [] = [];

      await runSaga({ dispatch: (action) => dispatched.push(action) }, getWifiList, mockApi).toPromise();

      expect(dispatched).toEqual([actions.wifi.success({ data: expectData })]);
      expect(mockApi.getWifiList).toHaveBeenCalledTimes(1);
    });

    test('should dispatch wifi.failure when the API call is not successful', async () => {
      const mockApi = { getWifiList: jest.fn(() => ({ ok: false })) };
      const dispatched: [] = [];

      await runSaga({ dispatch: (action) => dispatched.push(action) }, getWifiList, mockApi).toPromise();

      expect(dispatched).toEqual([actions.wifi.failure()]);
      expect(mockApi.getWifiList).toHaveBeenCalledTimes(1);
    });
  });

  test('should dispatch wifi.success with the transformed data', async () => {
    const dispatched: [] = [];

    await runSaga(
      { dispatch: (action) => dispatched.push(action) },
      receiveBluetoothWifiList,
      actions.bluetoothWifi({ response: data }),
    ).toPromise();

    expect(dispatched).toEqual([actions.wifi.success({ data: expectData })]);
  });
});
