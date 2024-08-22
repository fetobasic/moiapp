import { call, put, select, all, takeLatest } from 'redux-saga/effects';
import { SagaIterator } from 'redux-saga';
import moment from 'moment';
import { ApiResponse } from 'apisauce';

import { isProduction } from 'App/Config/AppConfig';
import { DEV_REPORT_VALIDITY_PERIOD } from 'App/Config/UsageReportConfig';

import {
  getPrecisionByPeriod,
  reportUrlValid,
  isReportDataParseable,
  ERROR,
  PRECISION,
  getErrorCodeFromXmlString,
} from 'App/Services/UsageReport';
import Logger from 'App/Services/Logger';

import * as actions from './actions';
import * as selectors from './selectors';
import { BackendApiType } from 'App/Store/rootSaga';
import { ReportDataType, ReportUrlType, UsageReportUrlResponse } from 'App/Types/HistoryType';

const INTERNAL_ERROR = {
  invalidUrl: 'INVALID_URL',
  expiredToken: 'ExpiredToken',
};

function* isUsageReportCacheValid(thingName: string, precision: string) {
  const reportData: ReportDataType = yield select(selectors.getReportData);
  const _precision = reportData?.[thingName]?.[precision];

  if (!_precision) {
    return false;
  }
  // use UTC to make no guesses and make sure the same reference point is used
  const currentTimestampUTC = moment.utc();
  const reportTimestampUTC = moment(_precision.timestamp).utc();

  if (isProduction) {
    // check if report and current timestamps
    // are in the same hour or in the same day
    return (
      (precision === PRECISION.HOURLY && reportTimestampUTC.hour() === currentTimestampUTC.hour()) ||
      (precision === PRECISION.DAILY && reportTimestampUTC.dayOfYear() === currentTimestampUTC.dayOfYear())
    );
  }
  return _precision.timestamp + DEV_REPORT_VALIDITY_PERIOD >= currentTimestampUTC.unix();
}

// set failure state and reset cache
function* setFailureState(error: string, thingName: string, precision: string) {
  Logger.error(error);

  yield put(actions.usageReportData.failure({ error }));

  // if url was bad we do not want to keep it in cache
  // also it means data can't be correct
  if (error === ERROR.DOWNLOAD_URL) {
    yield put(actions.usageReportClearCachedUrl({ thingName, precision }));
    yield put(actions.usageReportClearCachedData({ thingName, precision }));
    return;
  }
  // is there is parsing error, other stuff (besides data) might be valid
  if (error === ERROR.CSV_PARSE) {
    yield put(actions.usageReportClearCachedData({ thingName, precision }));
  }
}

function* fetchNewReportUrlWithRetries(
  api: BackendApiType,
  thingName: string,
  precision: string,
  isLegacy: boolean = true,
) {
  const MAX_RETRIES = 3;

  const apiType = isLegacy ? api.getUsageReportUrl : api.getInsightsReportUrl;

  for (let i = 0; i < MAX_RETRIES; i++) {
    const response: ApiResponse<UsageReportUrlResponse> = yield call(apiType, thingName, precision);

    if (response.status === 200) {
      return response;
    }
  }
}

function* fetchReportDataWithRetries(api: BackendApiType, reportUrl: string = '', isLegacy: boolean = true) {
  const MAX_RETRIES = 3;

  const apiType = isLegacy ? api.downloadUsageReport : api.downloadInsightsReport;

  for (let i = 0; i < MAX_RETRIES; i++) {
    const response: ApiResponse<UsageReportUrlResponse | string> = yield call(apiType, reportUrl);

    if (response.status === 400) {
      const error = getErrorCodeFromXmlString(response.data as string);
      if (error) {
        return { error };
      }
    }

    if (response.status === 200) {
      return response as ApiResponse<UsageReportUrlResponse>;
    }
  }
}

function* getReportUrl(api: BackendApiType, thingName: string, precision: string, isLegacy: boolean) {
  // attempt to get stored report url because it may still be valid
  const reportUrl: ReportUrlType = yield select(selectors.getReportUrl);

  // figure out proper url as state contains all yetis' reports
  const _precision = reportUrl?.thingName?.precision || '';

  // if we already have valid cached url, return it
  if (reportUrlValid(_precision)) {
    Logger.dev(`using cached '${precision}' url: "${_precision}"`);
    return _precision;
  }

  Logger.dev(`fetching new '${precision}' url`);

  // fetch new url
  const response: ApiResponse<UsageReportUrlResponse> | undefined = yield* fetchNewReportUrlWithRetries(
    api,
    thingName,
    precision,
    isLegacy,
  );

  const responseReportUrl = response?.data?.url || '';

  // we still need to verify obtained url
  if (reportUrlValid(responseReportUrl)) {
    // store new report url
    Logger.dev(`caching new '${precision}' url "${responseReportUrl}"`);
    yield put(actions.usageReportUrl({ thingName, precision, url: responseReportUrl }));
    return responseReportUrl;
  }
}

function* getUsageDataWithRetries(api: BackendApiType, thingName: string, precision: string, isLegacy: boolean) {
  // we want to try twice, if we have a cached URL, we want to try it,
  // if the cached url results in an expired token response,
  // we clear the url and try again
  const MAX_RETRIES = 2;

  for (let i = 0; i < MAX_RETRIES; i++) {
    let reportUrl = yield* getReportUrl(api, thingName, precision, isLegacy);

    // if we couldn't obtain a valid url, set the failure state
    if (!reportUrlValid(reportUrl || '')) {
      return { error: INTERNAL_ERROR.invalidUrl };
    }

    Logger.dev(`fetching '${precision}' usage data via "${reportUrl}"`);

    // having potentially valid url, retry for report data
    const response = yield* fetchReportDataWithRetries(api, reportUrl, isLegacy);

    if (!response) {
      continue;
    }

    if ('error' in response && response?.error === INTERNAL_ERROR.expiredToken) {
      Logger.dev(`'${response.error}' - clearing url`);
      yield put(actions.usageReportClearCachedUrl({ thingName, precision }));
      continue; // skip to next iteration
    }
    if ('status' in response && response?.status === 200) {
      return response;
    }
  }
}

// this saga corresponds to UsageReportActions.reportDataRequest
export function* getUsageReportData(
  api: BackendApiType,
  { payload: { thingName, periodInPast, isLegacy } }: ReturnType<typeof actions.usageReportData.request>,
) {
  const precision = getPrecisionByPeriod(periodInPast);

  if (yield* isUsageReportCacheValid(thingName, precision)) {
    yield put(actions.usageReportDataCached());
    return;
  }

  const response = yield* getUsageDataWithRetries(api, thingName, precision, isLegacy);

  if (!response) {
    return;
  }

  if ('error' in response && response.error === INTERNAL_ERROR.invalidUrl) {
    Logger.dev(`'${precision}' url invalid`);
    yield* setFailureState(ERROR.DOWNLOAD_URL, thingName, precision);
    return;
  }

  if ('data' in response && !response?.data) {
    Logger.dev(`could not retrieve '${precision}' data`);
    yield* setFailureState(ERROR.DOWNLOAD_DATA, thingName, precision);
    return;
  }

  // basic check for data validity, need this
  // as redux state might potentially have wrong data due to previous failure
  // @ts-ignore - we need to check whether passing `response?.data` is correct here
  if (!isReportDataParseable('data' in response && response?.data, precision)) {
    Logger.dev(`'${precision}' data not parsable`);
    yield* setFailureState(ERROR.CSV_PARSE, thingName, precision);
    return;
  }

  Logger.dev(`'${precision}' data retrieved`);

  // tag with current timestamp, using moment for consistency
  yield put(
    actions.usageReportData.success({
      thingName,
      precision,
      data: 'data' in response && response.data,
      timestamp: moment().unix(),
    }),
  );
}

export default function* usageReportSaga(backendApi: BackendApiType): SagaIterator {
  yield all([takeLatest(actions.usageReportData.request, getUsageReportData, backendApi)]);
}
