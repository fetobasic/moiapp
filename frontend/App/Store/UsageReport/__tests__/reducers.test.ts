import { usageReportReducers } from 'App/Store/UsageReport/index';
import { initialState } from 'App/Store/UsageReport/reducers';
import * as actions from 'App/Store/UsageReport/actions';

describe('UsageReport selectors', () => {
  const thingName = 'mockThingName';
  const precision = 'mockPrecision';

  describe('usageReportData', () => {
    test('should handle usageReportData request correctly', () => {
      const newState = usageReportReducers(initialState, actions.usageReportData.request());

      expect(newState).toEqual({ ...initialState, fetching: true, error: null });
    });

    test('should handle usageReportData failure correctly', () => {
      const error = 'Error message';

      const newState = usageReportReducers(initialState, actions.usageReportData.failure({ error }));

      expect(newState).toEqual({ ...initialState, fetching: false, error });
    });
  });

  test('should handle usageReportUrl correctly', () => {
    const url = 'mockUrl';
    const action = actions.usageReportUrl({ thingName, precision, url });
    const newState = usageReportReducers(initialState, action);

    expect(newState).toEqual({ ...initialState, reportUrl: { [thingName]: { [precision]: url } } });
  });

  test('should handle usageReportData success correctly', () => {
    const data = 'mockData';
    const timestamp = 1234567890;
    const action = actions.usageReportData.success({ thingName, precision, data, timestamp });
    const newState = usageReportReducers(initialState, action);

    expect(newState).toEqual({
      ...initialState,
      fetching: false,
      error: null,
      reportData: { [thingName]: { [precision]: { data, timestamp } } },
    });
  });

  test('should handle usageReportDataCached correctly', () => {
    const newState = usageReportReducers(initialState, actions.usageReportDataCached());

    expect(newState).toEqual({ ...initialState, fetching: false, error: null });
  });

  test('should handle usageReportClearCachedUrl correctly', () => {
    const action = actions.usageReportClearCachedUrl({ thingName, precision });
    const newState = usageReportReducers(initialState, action);

    expect(newState).toEqual({ ...initialState, reportUrl: { [thingName]: { [precision]: null } } });
  });

  test('should handle usageReportClearCachedData correctly', () => {
    const action = actions.usageReportClearCachedData({ thingName, precision });
    const newState = usageReportReducers(initialState, action);

    expect(newState).toEqual({ ...initialState, reportData: { [thingName]: { [precision]: null } } });
  });

  test('should handle usageReportClearError correctly', () => {
    const newState = usageReportReducers(initialState, actions.usageReportClearError());

    expect(newState).toEqual({ ...initialState, fetching: false, error: null });
  });

  test('should handle setEnergyHistory correctly', () => {
    const showEnergyInChart = true;
    const showEnergyOutChart = false;
    const showBatteryChart = true;
    const chartType = 'bar';

    const action = actions.setEnergyHistory({ showEnergyInChart, showEnergyOutChart, showBatteryChart, chartType });
    const newState = usageReportReducers(initialState, action);

    expect(newState).toEqual({ ...initialState, showEnergyInChart, showEnergyOutChart, showBatteryChart, chartType });
  });
});
