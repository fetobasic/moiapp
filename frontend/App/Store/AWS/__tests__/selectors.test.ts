import { getIsConnected } from 'App/Store/AWS/selectors';
import { mockedState } from 'App/Fixtures/mocks/mockedState';

describe('AWS selectors', () => {
  it('should return the isConnected value from state', () => {
    const result = getIsConnected(mockedState);

    expect(result).toBe(mockedState.aws.isConnected);
  });
});
