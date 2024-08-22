export type StateObject = {
  code?: number;
  desired?: { [key: string]: any };
  reported?: { [key: string]: any };
};
export type ReceivedStateObject = {
  code?: number;
  state: { desired?: { [key: string]: any }; reported?: { [key: string]: any } };
  metadata?: { desired?: { [key: string]: any }; reported?: { [key: string]: any } };
  timestamp?: number;
};
export type NullableStateObject = StateObject | null;
export type OperationInfo = {
  token: string;
  retryAttemtps: number;
  stateObject: NullableStateObject;
};
export type JobInfo = {
  version: string;
  thingName: string;
  jobId: string;
};
export type ThingInfo = {
  thingName: string;
  usedAnywhereConnect: boolean;
};
