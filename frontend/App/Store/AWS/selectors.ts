import { RootState } from 'typesafe-actions';

export const getIsConnected = (state: RootState) => state.aws.isConnected;
