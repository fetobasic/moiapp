import { getIsLoading } from 'App/Store/Startup/selectors';
import { mockedState } from 'App/Fixtures/mocks/mockedState';

describe('Startup selectors', () => {
  test('should select the loading state from the state', () => {
    const result = getIsLoading(mockedState);

    expect(result).toEqual(mockedState.startup.isAppLoaded);
  });
});
