import { getAppRateInfo } from 'App/Store/Cache/selectors';
import { mockedState } from 'App/Fixtures/mocks/mockedState';

describe('Cache selectors', () => {
  test('should return the appRateInfo object from state', () => {
    const selectedValue = getAppRateInfo(mockedState);

    expect(selectedValue).toEqual(mockedState.cache.appRateInfo);
  });
});
