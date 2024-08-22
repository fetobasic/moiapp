export enum SubjectType {
  PROBLEM = 'problem',
  QUESTION = 'question',
  SUGGESTION = 'suggestion',
  PAIRING_PROBLEM = 'pairingProblem',
  PAIRING_FAILURE = 'pairingFailure',
  FIRMWARE_UPDATE_FAILURE = 'firmwareUpdateFailure',
}

export type YetiType = {
  connectedOk: boolean;
  thingName: string;
  model?: string;
  firmwareVersion?: string;
  connectedAt: string;
};

export type SendFeedbackFormType = {
  phoneId: string;
  phoneModel: string;
  os: string;
  appVersion: string;
  email: string;
  userName: string;
  phoneNumber: string;
  subject: SubjectType;
  message: string;
  yetis: YetiType[];
};
