import { createReducer, ActionType } from 'typesafe-actions';
import { ReportUrlType, ReportDataType, Toggle, DateTypes } from 'App/Types/HistoryType';

import * as actions from './actions';

type ActionTypes = ActionType<typeof actions>;
type StateType = {
  reportUrl: ReportUrlType;
  fetching: boolean;
  reportData: ReportDataType;
  error: string | null;
  showEnergyInChart: Toggle;
  showEnergyOutChart: Toggle;
  showBatteryChart: Toggle;
  chartType: DateTypes;
};

export const initialState: StateType = {
  reportUrl: {},
  fetching: false,
  reportData: {},
  error: null,
  showEnergyInChart: Toggle.ON,
  showEnergyOutChart: Toggle.ON,
  showBatteryChart: Toggle.ON,
  chartType: DateTypes.PAST_DAY,
};

const appReducers = createReducer<StateType, ActionTypes>(initialState)
  .handleAction(actions.usageReportData.request, (state) => ({
    ...state,
    fetching: true,
    error: null,
  }))
  // separate setting report url from setting data
  // as there might be different failure tracking
  // and their successes/failures are independent
  .handleAction(actions.usageReportUrl, (state, { payload: { thingName, precision, url } }) => ({
    ...state,
    reportUrl: {
      [thingName]: {
        [precision]: url,
      },
    },
  }))
  .handleAction(actions.usageReportData.success, (state, { payload: { thingName, precision, data, timestamp } }) => ({
    ...state,
    fetching: false,
    error: null,
    reportData: {
      [thingName]: {
        [precision]: {
          data,
          timestamp,
        },
      },
    },
  }))
  .handleAction(actions.usageReportDataCached, (state) => ({
    ...state,
    fetching: false,
    error: null,
  }))
  // these are similar to setUrl() and setReportData()
  // but logic might be different, so keeping them apart is safer
  .handleAction(actions.usageReportClearCachedUrl, (state, { payload: { thingName, precision } }) => ({
    ...state,
    reportUrl: {
      [thingName]: {
        [precision]: null,
      },
    },
  }))
  .handleAction(actions.usageReportClearCachedData, (state, { payload: { thingName, precision } }) => ({
    ...state,
    reportData: {
      [thingName]: {
        [precision]: null,
      },
    },
  }))
  .handleAction(actions.usageReportClearError, (state) => ({
    ...state,
    fetching: false,
    error: null,
  }))
  .handleAction(actions.usageReportData.failure, (state, { payload: { error } }) => ({
    ...state,
    fetching: false,
    error,
  }))
  .handleAction(
    actions.setEnergyHistory,
    (state, { payload: { showEnergyInChart, showEnergyOutChart, showBatteryChart, chartType } }) => ({
      ...state,
      showEnergyInChart,
      showEnergyOutChart,
      showBatteryChart,
      chartType,
    }),
  );

export default appReducers;
