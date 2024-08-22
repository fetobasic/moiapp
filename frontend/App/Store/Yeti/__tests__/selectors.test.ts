import { getDiscoveredDevices } from 'App/Store/Yeti/selectors';
import { mockedState } from 'App/Fixtures/mocks/mockedState';

describe('Yeti selectors', () => {
  test('should select discoveredDevices from state', () => {
    const selectedData = getDiscoveredDevices(mockedState);

    expect(selectedData).toEqual(mockedState.yetiInfo.discoveredDevices);
  });
});
