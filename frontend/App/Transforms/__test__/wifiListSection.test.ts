import { getWifiListSection } from 'App/Transforms/wifiListSection';

describe('Wifi list section', () => {
  test('should correctly categorize saved and unsaved WiFi networks', () => {
    const wifiList = [
      { ssid: 'Network1', signalStrength: 80, saved: true },
      { ssid: 'Network2', signalStrength: 90, saved: false },
      { ssid: 'Network3', signalStrength: 70, saved: true },
    ];
    const expectedSection = [
      {
        title: 'My Saved Networks',
        data: [
          { ssid: 'Network1', signalStrength: 80, saved: true },
          { ssid: 'Network3', signalStrength: 70, saved: true },
        ],
      },
      {
        title: 'Other Networks',
        data: [{ ssid: 'Network2', signalStrength: 90, saved: false }],
      },
    ];

    const result = getWifiListSection(wifiList);

    expect(result).toEqual(expectedSection);
  });

  test('should handle an empty WiFi list', () => {
    const emptyWifiList = [];

    const result = getWifiListSection(emptyWifiList);

    expect(result).toEqual([]);
  });

  test('should handle a WiFi list with no saved networks', () => {
    const wifiListWithoutSaved = [
      { ssid: 'Network1', signalStrength: 80, saved: false },
      { ssid: 'Network2', signalStrength: 90, saved: false },
    ];

    const result = getWifiListSection(wifiListWithoutSaved);

    expect(result).toEqual([
      {
        title: 'Networks',
        data: wifiListWithoutSaved,
      },
    ]);
  });
});
