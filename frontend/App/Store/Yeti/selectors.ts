import { RootState } from 'typesafe-actions';

export const getDiscoveredDevices = (state: RootState) => state.yetiInfo.discoveredDevices;
