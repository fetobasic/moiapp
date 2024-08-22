import { objectToWifiArray } from 'App/Transforms/objectToArray';

describe('Object to array', () => {
  it('should convert an object to an array of WiFiList correctly', () => {
    const wifiObject = {
      wifi1: { ssid: 'Network1', signalStrength: 80 },
      wifi2: { ssid: 'Network2', signalStrength: 90 },
    };
    const expectedWifiArray = [
      { ssid: 'Network1', signalStrength: 80, name: 'wifi1' },
      { ssid: 'Network2', signalStrength: 90, name: 'wifi2' },
    ];

    const result = objectToWifiArray(wifiObject);

    expect(result).toEqual(expectedWifiArray);
  });

  it('should return an empty array for undefined object', () => {
    const result = objectToWifiArray(undefined);

    expect(result).toEqual([]);
  });
});
