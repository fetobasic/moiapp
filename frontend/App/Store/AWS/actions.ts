import { createAsyncAction } from 'typesafe-actions';

export const awsChangeState = createAsyncAction(
  '@AWS/AWS_CHANGE_STATE_REQUEST',
  '@AWS/AWS_CHANGE_STATE_SUCCESS',
  '@AWS/AWS_CHANGE_STATE_FAILURE',
)<boolean, boolean, undefined>();
