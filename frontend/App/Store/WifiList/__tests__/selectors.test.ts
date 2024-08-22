import { getWifiList } from 'App/Store/WifiList/selectors';
import { mockedState } from 'App/Fixtures/mocks/mockedState';

describe('WifiList selectors', () => {
  test('getWifiList', () => {
    const selectedData = getWifiList(mockedState);

    expect(selectedData).toEqual(mockedState.yetiWifiList.data);
  });
});
