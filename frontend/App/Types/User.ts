import { Yeti6GStatus, YetiModel, YetiState } from './Yeti';

export type PhoneInfo = {
  id: string;
  platform: string;
  app: string;
  model: string;
  country: string;
  isTablet: boolean;
  token: string;
};

export type SignUpType = {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
};

export type SignUpRequestType = SignUpType & { phone: PhoneInfo };

export type LoginType = {
  email: string;
  password: string;
};

export type LoginRequestType = LoginType & { phone: PhoneInfo };

export type DeleteRequestType = {
  email: string;
};

export type UserInfo = {
  firstName: string;
  lastName: string;
  email: string;
};

export type AuthType = {
  accessToken: string;
  expiresAt: string;
};

export type AuthResponse = {
  auth: AuthType;
  user: UserInfo;
  things: {
    thingName: string;
    yetiName: string;
    model: YetiModel;
    createdAt: string;
    lastPairedAt: string;
    hostId: string;
    sn: string;
    status: YetiState | Yeti6GStatus;
  }[];
};

export type ErrorResponse = string | string[];
