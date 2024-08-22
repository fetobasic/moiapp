import { SubjectType } from 'App/Types/FeedbackForm';

const defaultSubjectTypes = [
  {
    label: 'Report a Problem',
    value: SubjectType.PROBLEM,
  },
  {
    label: 'Ask a Question',
    value: SubjectType.QUESTION,
  },
  {
    label: 'Suggest an Improvement',
    value: SubjectType.SUGGESTION,
  },
];

const additonalSubjectTypes = {
  [SubjectType.PAIRING_PROBLEM]: [
    {
      label: 'Pairing Problem',
      value: SubjectType.PAIRING_PROBLEM,
    },
  ],
  [SubjectType.PAIRING_FAILURE]: [
    {
      label: 'Pairing Failure',
      value: SubjectType.PAIRING_FAILURE,
    },
  ],
  [SubjectType.FIRMWARE_UPDATE_FAILURE]: [
    {
      label: 'Firmware Version Failed',
      value: SubjectType.FIRMWARE_UPDATE_FAILURE,
    },
  ],
};

export type AdditionalSubjectType =
  | SubjectType.PAIRING_PROBLEM
  | SubjectType.PAIRING_FAILURE
  | SubjectType.FIRMWARE_UPDATE_FAILURE;

export const getSubjectData = (subject?: AdditionalSubjectType) => [
  ...(subject ? additonalSubjectTypes[subject] : []),
  ...defaultSubjectTypes,
];
