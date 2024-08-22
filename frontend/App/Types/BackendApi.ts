export type PairThingRequest = {
  thingName: string;
  phoneId: string;
  platform: string;
  app: string;
  model: string;
  country: string;
  isTablet: boolean;
  token?: string;
};

export type CommonError = {
  message?: string;
};
