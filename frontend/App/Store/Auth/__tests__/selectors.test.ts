import { getIsSignedIn, getAuthInfo, getUserInfo } from 'App/Store/Auth/selectors';
import { mockedState } from 'App/Fixtures/mocks/mockedState';

describe('Auth selectors', () => {
  test('getIsSignedIn should return the isSignedIn value from state', () => {
    const result = getIsSignedIn(mockedState);

    expect(result).toBe(true);
  });

  test('getAuthInfo should return the auth object from state', () => {
    const result = getAuthInfo(mockedState);

    expect(result).toBe(mockedState.auth.auth);
  });

  test('getUserInfo should return the user object from state', () => {
    const result = getUserInfo(mockedState);

    expect(result).toBe(mockedState.auth.user);
  });
});
