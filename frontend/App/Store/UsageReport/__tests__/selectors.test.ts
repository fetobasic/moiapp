import { getReportData, getReportUrl } from 'App/Store/UsageReport/selectors';
import { mockedState } from 'App/Fixtures/mocks/mockedState';

describe('UsageReport selectors', () => {
  test('should return the report data from the state', () => {
    const selectedData = getReportData(mockedState);

    expect(selectedData).toEqual(mockedState.usageReport.reportData);
  });

  test('should return the report URL from the state', () => {
    const selectedUrl = getReportUrl(mockedState);

    expect(selectedUrl).toEqual(mockedState.usageReport.reportUrl);
  });
});
