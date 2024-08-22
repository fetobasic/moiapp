import { createAction, createAsyncAction } from 'typesafe-actions';
import { DateTypes, Toggle } from 'App/Types/HistoryType';

export const usageReportData = createAsyncAction(
  '@USAGE_REPORT/USAGE_REPORT_DATA_REQUEST',
  '@USAGE_REPORT/USAGE_REPORT_DATA_SUCCESS',
  '@USAGE_REPORT/USAGE_REPORT_DATA_FAILURE',
)<
  { thingName: string; periodInPast: DateTypes; isLegacy: boolean },
  { thingName: string; precision: string; data: any; timestamp: number },
  { error: string }
>();

export const usageReportUrl = createAction('@USAGE_REPORT/USAGE_REPORT_URL_REQUEST')<{
  thingName: string;
  precision: string;
  url: string;
}>();

export const usageReportDataCached = createAction('@USAGE_REPORT/USAGE_REPORT_DATA_CACHED_REQUEST')();

export const usageReportClearCachedUrl = createAction('@USAGE_REPORT/USAGE_REPORT_CLEAR_CACHE_URL')<{
  thingName: string;
  precision: string;
}>();

export const usageReportClearCachedData = createAction('@USAGE_REPORT/USAGE_REPORT_CLEAR_CACHE_DATA')<{
  thingName: string;
  precision: string;
}>();

export const usageReportClearError = createAction('@USAGE_REPORT/USAGE_REPORT_CLEAR_ERROR')();

export const setEnergyHistory = createAction('@USAGE_REPORT/SET_ENERGY_HISTORY')<{
  showEnergyInChart: Toggle;
  showEnergyOutChart: Toggle;
  showBatteryChart: Toggle;
  chartType: DateTypes;
}>();
