/* eslint-disable @typescript-eslint/no-unused-vars */
import { runSaga } from 'redux-saga';
import { getPrecisionByPeriod, isReportDataParseable, reportUrlValid } from 'App/Services/UsageReport';
import * as actions from 'App/Store/UsageReport/actions';
import * as selectors from 'App/Store/UsageReport/selectors';
import { getUsageReportData } from 'App/Store/UsageReport/sagas';
import { DateTypes } from 'App/Types/HistoryType';
import { yeti6G } from 'App/Fixtures/mocks/mockedState';
import { initialState } from 'App/Store/UsageReport/reducers';

const thingName = yeti6G.thingName;
//TODO: finish this tests

describe('getUsageReportData', () => {
  test('should handle usage report data retrieval successfully', async () => {
    getPrecisionByPeriod = jest.fn();
    reportUrlValid = jest.fn(() => true);
    isReportDataParseable = jest.fn(() => true);
    jest
      .spyOn(selectors, 'getReportData')
      .mockReturnValue({ [thingName]: { precision: 'testPrecision', timestamp: 'fgdfgf' } });
    jest.spyOn(selectors, 'getReportUrl').mockReturnValue();

    const api = {
      getInsightsReportUrl: jest.fn(() => ({ status: 200 })),
      downloadInsightsReport: jest.fn(() => ({ status: 200 })),
    };
    const periodInPast = DateTypes.PAST_WEEK;
    const isLegacy = false;

    const dispatched: [] = [];

    await runSaga(
      { dispatch: (action) => dispatched.push(action), getState: () => initialState },
      getUsageReportData,
      api,
      actions.usageReportData.request({ thingName, periodInPast, isLegacy }),
    ).toPromise();

    // expect(dispatched).toEqual([actions.usageReportDataCached()]);
  });
  test('test 2', async () => {
    getPrecisionByPeriod = jest.fn();
    reportUrlValid = jest.fn(() => true);
    isReportDataParseable = jest.fn(() => false);
    jest.spyOn(selectors, 'getReportData').mockReturnValue({ [thingName]: { precision: '' } });
    jest.spyOn(selectors, 'getReportUrl').mockReturnValue();

    const api = {
      getInsightsReportUrl: jest.fn(() => ({ status: 200 })),
      downloadInsightsReport: jest.fn(() => ({ status: 200 })),
    };
    const periodInPast = DateTypes.PAST_WEEK;
    const isLegacy = false;

    const dispatched: [] = [];

    await runSaga(
      { dispatch: (action) => dispatched.push(action), getState: () => initialState },
      getUsageReportData,
      api,
      actions.usageReportData.request({ thingName, periodInPast, isLegacy }),
    ).toPromise();

    // expect(dispatched).toEqual([actions.usageReportDataCached()]);
  });
  test('test 3', async () => {
    getPrecisionByPeriod = jest.fn();
    reportUrlValid = jest.fn(() => true);
    isReportDataParseable = jest.fn(() => false);
    jest.spyOn(selectors, 'getReportData').mockReturnValue({ [thingName]: { precision: '' } });
    jest.spyOn(selectors, 'getReportUrl').mockReturnValue();

    const api = {
      getInsightsReportUrl: jest.fn(() => ({ status: 200 })),
      downloadInsightsReport: jest.fn(() => ({ status: 200, data: null })),
    };
    const periodInPast = DateTypes.PAST_WEEK;
    const isLegacy = false;

    const dispatched: [] = [];

    await runSaga(
      { dispatch: (action) => dispatched.push(action), getState: () => initialState },
      getUsageReportData,
      api,
      actions.usageReportData.request({ thingName, periodInPast, isLegacy }),
    ).toPromise();

    // expect(dispatched).toEqual([actions.usageReportDataCached()]);
  });
  test('test 4', async () => {
    getPrecisionByPeriod = jest.fn();
    reportUrlValid = jest.fn(() => true);
    isReportDataParseable = jest.fn(() => false);
    jest.spyOn(selectors, 'getReportData').mockReturnValue({ [thingName]: { precision: '' } });
    jest.spyOn(selectors, 'getReportUrl').mockReturnValue('');

    const api = {
      getInsightsReportUrl: jest.fn(() => ({ status: 200 })),
      downloadInsightsReport: jest.fn(() => ({ status: 200, error: 'INVALID_URL' })),
    };
    const periodInPast = DateTypes.PAST_WEEK;
    const isLegacy = false;

    const dispatched: [] = [];

    await runSaga(
      { dispatch: (action) => dispatched.push(action), getState: () => initialState },
      getUsageReportData,
      api,
      actions.usageReportData.request({ thingName, periodInPast, isLegacy }),
    ).toPromise();

    // expect(dispatched).toEqual([actions.usageReportDataCached()]);
  });
});
