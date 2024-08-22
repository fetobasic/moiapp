import {
  getErrorCodeFromXmlString,
  getPrecisionByPeriod,
  getUsageReportChartData,
  isReportDataParseable,
  PRECISION,
  reportUrlValid,
} from 'App/Services/UsageReport';
import { DateTypes } from 'App/Types/HistoryType';
import { format } from 'date-fns';

describe('UsageReport', () => {
  describe('Get precision by period', () => {
    test('Get by past half year', () => {
      const period = getPrecisionByPeriod(DateTypes.PAST_HALF_YEAR);

      expect(period).toEqual(PRECISION.DAILY);
    });

    test('Get by past day', () => {
      const period = getPrecisionByPeriod(DateTypes.PAST_DAY);

      expect(period).toEqual(PRECISION.HOURLY);
    });
  });

  describe('Report url valid', () => {
    test('Check with empty url', () => {
      const isValid = reportUrlValid('');

      expect(isValid).toBeFalsy();
    });

    test('Check with url', () => {
      const isValid = reportUrlValid(
        `https://yetiusage-dev.s3.amazonaws.com/yeti58bf258bf008/hourly.csv?X-Amz-Algorithm=AWS4-HMAC-SHA256&X-Amz-Credential=gfdgsfdhgfjfsgjdkkfskkfs&X-Amz-Date=${format(
          new Date(),
          "yyyyMMdd'T'HHmmss'Z'",
        )}&X-Amz-Expires=12345&X-Amz-Signature=gjhhsnf7757fgs7g9hf&X-Amz-SignedHeaders`,
      );
      expect(isValid).toBeTruthy();
    });
  });

  test(' Get report', () => {
    const chartData = getUsageReportChartData('hourly', DateTypes.PAST_WEEK, true);

    expect(chartData).toEqual({
      xLabels: chartData.xLabels,
      yLabel: 'Wh',
      data: {
        whIn: [],
        whOut: [],
        whTotal: [],
        whInGrandTotal: 0,
        whOutGrandTotal: 0,
      },
      disconnectedStateData: [],
      maxAvgValue: 0,
      missingPointsCount: 168,
    });
  });

  test('Check is data parseable', () => {
    const isParseable = isReportDataParseable('test cv', 'hourly');

    expect(isParseable).toBeTruthy();
  });

  describe('Get error code from xml string', () => {
    test('Get Error code', () => {
      const xmlError = `<Error><Code>404</Code></Error>`;
      const code = getErrorCodeFromXmlString(xmlError);

      expect(code).toEqual('404');
    });

    test("Get null if code doesn't exist", () => {
      const xmlError = `<Error></Error>`;
      const code = getErrorCodeFromXmlString(xmlError);

      expect(code).toBeNull();
    });
  });
});
