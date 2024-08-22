import { wifiReducers } from 'App/Store/WifiList';
import { initialState } from 'App/Store/WifiList/reducers';
import * as actions from 'App/Store/WifiList/actions';

describe('WifiList reducers', () => {
  describe('Wi-Fi feature Redux actions and reducers', () => {
    test('should handle wifi request correctly', () => {
      const newState = wifiReducers(initialState, actions.wifi.request());

      expect(newState).toEqual({ ...initialState, fetching: true });
    });

    test('should handle wifi success correctly', () => {
      const payload = { data: { ssid: 'MyNetwork', password: 'SecretPassword' } };
      const newState = wifiReducers(initialState, actions.wifi.success(payload));

      expect(newState).toEqual({ ...initialState, fetching: false, error: false, data: payload.data });
    });

    test('should handle wifi failure correctly', () => {
      const newState = wifiReducers(initialState, actions.wifi.failure());

      expect(newState).toEqual({ ...initialState, fetching: false, error: true, data: [] });
    });
  });

  test('should handle clearWifiList correctly', () => {
    const newState = wifiReducers(initialState, actions.clearWifiList());

    expect(newState).toEqual({ ...initialState, fetching: false, error: false, data: [] });
  });

  test('should handle bluetoothWifi correctly', () => {
    const newState = wifiReducers(initialState, actions.bluetoothWifi());

    expect(newState).toEqual({ ...initialState, fetching: true });
  });
});
