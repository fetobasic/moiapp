import { awsReducers } from 'App/Store/AWS';
import { initialState } from 'App/Store/AWS/reducers';
import * as actions from 'App/Store/AWS/actions';

describe('AWS reducers', () => {
  test('should handle awsChangeState.success action', () => {
    const payload = true;

    const newState = awsReducers(initialState, actions.awsChangeState.success(payload));

    expect(newState).toEqual({ ...initialState, isConnected: payload });
  });
});
