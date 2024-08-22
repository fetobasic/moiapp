import { getDeviceType } from 'App/Transforms/getDeviceType';
import { mockedState } from 'App/Fixtures/mocks/mockedState';

describe('getDeviceType', () => {
  test('should return the correct device type for a recognized name', () => {
    const result = getDeviceType(mockedState.devicesInfo.data[1].thingName);

    expect(result).toBe(mockedState.devicesInfo.data[1].deviceType);
  });

  test('should return the Alta 50 instead Alta 45', () => {
    const result = getDeviceType('gzf1-45');

    expect(result).toBe('ALTA_50_FRIDGE');
  });

  test('should return undefined for an unrecognized name', () => {
    const result = getDeviceType('unknownModel');

    expect(result).toBeUndefined();
  });
});
