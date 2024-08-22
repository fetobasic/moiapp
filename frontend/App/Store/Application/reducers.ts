import { DataTransferType } from 'App/Types/ConnectionType';
import { TemperatureUnits } from 'App/Types/Units';
import { createReducer, ActionType } from 'typesafe-actions';

import * as actions from './actions';

type ActionTypes = ActionType<typeof actions>;
type StateType = {
  isDirectConnection: boolean;
  isShowOnboarding: boolean;
  dataTransferType?: DataTransferType;
  connectedPeripheralIds?: string[];
  feedbackFormInfo: {
    isError: boolean;
    isSuccess: boolean;
    isSending: boolean;
  };
  appRateInfo: {
    shownAppRateDate: Date;
  };
  units: {
    temperature: TemperatureUnits;
  };
  lastDevice?: string;
  eventParams: { [thingName: string]: { oldFirmwareVersion?: string; newFirmwareVersion?: string } };
  isFileLoggerEnabled?: boolean;
};

export const initialState: StateType = {
  isDirectConnection: false,
  isShowOnboarding: true,
  dataTransferType: undefined,
  connectedPeripheralIds: [],
  feedbackFormInfo: {
    isError: false,
    isSuccess: false,
    isSending: false,
  },
  appRateInfo: {
    shownAppRateDate: new Date(0),
  },
  units: {
    temperature: TemperatureUnits.fahrenheit,
  },
  lastDevice: undefined,
  eventParams: {},
  isFileLoggerEnabled: false,
};

const appReducers = createReducer<StateType, ActionTypes>(initialState)
  .handleAction(actions.changeDirectConnectionState, (state, { payload }) => ({
    ...state,
    isDirectConnection: payload,
  }))
  .handleAction(actions.changeOnboardingState, (state, { payload }) => ({
    ...state,
    isShowOnboarding: payload,
  }))
  .handleAction(actions.sendFeedbackForm.request, (state) => ({
    ...state,
    feedbackFormInfo: {
      isError: false,
      isSuccess: false,
      isSending: true,
    },
  }))
  .handleAction(actions.sendFeedbackForm.success, (state) => ({
    ...state,
    feedbackFormInfo: {
      isError: false,
      isSuccess: true,
      isSending: false,
    },
  }))
  .handleAction(actions.sendFeedbackForm.failure, (state) => ({
    ...state,
    feedbackFormInfo: {
      isError: true,
      isSuccess: false,
      isSending: false,
    },
  }))
  .handleAction(actions.clearFeedbackFormInfo, (state) => ({
    ...state,
    feedbackFormInfo: {
      isError: false,
      isSuccess: false,
      isSending: false,
    },
  }))
  .handleAction(actions.setDataTransferType, (state, { payload }) => ({
    ...state,
    dataTransferType: payload,
  }))
  .handleAction(actions.addConnectedPeripheralId, (state, { payload }) => ({
    ...state,
    connectedPeripheralIds: [...new Set([...(state.connectedPeripheralIds || []), payload])],
  }))
  .handleAction(actions.removeConnectedPeripheralId, (state, { payload }) => ({
    ...state,
    connectedPeripheralIds: (state.connectedPeripheralIds || []).filter((id) => id !== payload),
  }))
  .handleAction(actions.updateConnectedPeripheralId, (state, { payload }) => ({
    ...state,
    connectedPeripheralIds: payload,
  }))
  .handleAction(actions.clearConnectedPeripheralIds, (state) => ({
    ...state,
    connectedPeripheralIds: [],
  }))
  .handleAction(actions.changeAppRateInfo, (state, { payload }) => ({
    ...state,
    appRateInfo: {
      ...state.appRateInfo,
      shownAppRateDate: payload.shownAppRateDate || state.appRateInfo?.shownAppRateDate || new Date(0),
    },
  }))
  .handleAction(actions.setUnits, (state, { payload: { temperature } }) => ({
    ...state,
    units: {
      ...state.units,
      temperature,
    },
  }))
  .handleAction(actions.setLastDevice, (state, { payload }) => ({
    ...state,
    lastDevice: payload,
  }))
  .handleAction(actions.changeFileLoggerState, (state, { payload }) => ({
    ...state,
    isFileLoggerEnabled: payload,
  }))
  .handleAction(actions.setEventParams, (state, { payload }) => ({
    ...state,
    eventParams: {
      ...(state.eventParams || {}),
      [payload.thingName]: {
        ...(state.eventParams?.[payload.thingName] || {}),
        oldFirmwareVersion: payload.oldFirmwareVersion || state.eventParams[payload.thingName]?.oldFirmwareVersion,
        newFirmwareVersion: payload.newFirmwareVersion || state.eventParams[payload.thingName]?.newFirmwareVersion,
      },
    },
  }));

export default appReducers;
