import { createAction, createAsyncAction } from 'typesafe-actions';
import { SubjectType, YetiType } from 'App/Types/FeedbackForm';
import { DataTransferType } from 'App/Types/ConnectionType';
import { TemperatureUnits } from 'App/Types/Units';

export const changeDirectConnectionState = createAction('@APP/CHANGE_DIRECT_CONNECTION_STATE')<boolean>();

export const changeOnboardingState = createAction('@APP/CHANGE_ONBOARDING_STATE')<boolean>();

export const sendFeedbackForm = createAsyncAction(
  '@APP/SEND_FEEDBACK_FORM_REQUEST',
  '@APP/SEND_FEEDBACK_FORM_SUCCESS',
  '@APP/SEND_FEEDBACK_FORM_FAILURE',
)<
  {
    subject: SubjectType;
    email: string;
    name: string;
    phoneNumber: string;
    message: string;
    firmwareVersionFailed?: string;
    thingName?: string;
    yeti?: YetiType;
  },
  undefined,
  undefined
>();

export const clearFeedbackFormInfo = createAction('@APP/CLEAR_FEEDBACK_FORM_INFO')<undefined>();

export const changeAppRateInfo = createAction('@APP/CHANGE_APP_RATE_INFO')<{
  shownAppRateDate?: Date;
}>();

export const setDataTransferType = createAction('@APP/SET_DATA_TRANSFER_TYPE')<DataTransferType>();
export const setUnits = createAction('@APP/SET_UNITS')<{
  temperature: TemperatureUnits;
}>();
export const setLastDevice = createAction('@APP/SET_LAST_DEVICE')<string>();

export const setEventParams = createAction('@APP/SET_EVENT_PARAMS')<{
  thingName: string;
  oldFirmwareVersion?: string;
  newFirmwareVersion?: string;
}>();

export const changeFileLoggerState = createAction('@APP/CHANGE_FILE_LOGGER_STATE')<boolean>();

// Bluetooth connection
export const addConnectedPeripheralId = createAction('@APP/ADD_CONNECTED_PERIPHERAL_ID')<string>();
export const removeConnectedPeripheralId = createAction('@APP/REMOVE_CONNECTED_PERIPHERAL_ID')<string>();
export const updateConnectedPeripheralId = createAction('@APP/UPDATE_CONNECTED_PERIPHERAL_ID')<string[]>();
export const clearConnectedPeripheralIds = createAction('@APP/CLEAR_CONNECTED_PERIPHERAL_IDS')<undefined>();
