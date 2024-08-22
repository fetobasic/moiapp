import { render } from '@testing-library/react-native';
import {
  formatLongNumber,
  formatToKilo,
  getDateFormat,
  getFormattedPeakDate,
  getMaxChartY,
  getYFromPercentage,
  renderBottomDates,
  renderTransparentLine,
  tickFormat,
} from 'App/Services/ChartHelpers';
import { Colors } from 'App/Themes';
import { DateTypes } from 'App/Types/HistoryType';

describe('ChartHelpers', () => {
  describe('getMaxChartY', () => {
    const chartData = {
      showEnergyOut: false,
      showEnergyIn: false,
      showBattery: false,
      batterySoc: [],
      whIn: [],
      whOut: [],
    };

    test('should return 100 when no data is shown', () => {
      const result = getMaxChartY(chartData);
      expect(result).toBe(100);
    });

    test('should return the maximum value of batterySoc when only battery data is shown', () => {
      const batterySoc = [{ y: 50 }, { y: 60 }, { y: 70 }];
      const result = getMaxChartY({ ...chartData, showBattery: true, batterySoc });
      expect(result).toBe(100);
    });

    test('should return the maximum value of whIn when only energy in data is shown', () => {
      const whIn = [{ y: 100 }, { y: 150 }, { y: 200 }];
      const result = getMaxChartY({ ...chartData, showEnergyIn: true, whIn });
      expect(result).toBe(300);
    });

    test('should return the maximum value of whOut when only energy out data is shown', () => {
      const whOut = [{ y: 30 }, { y: 40 }, { y: 50 }];
      const result = getMaxChartY({ ...chartData, showEnergyOut: true, whOut });
      expect(result).toBe(150);
    });

    test('should return the sum of max values when multiple data types are shown', () => {
      const batterySoc = [{ y: 70 }, { y: 80 }, { y: 90 }];
      const whIn = [{ y: 150 }, { y: 200 }, { y: 250 }];
      const whOut = [{ y: 40 }, { y: 50 }, { y: 60 }];
      const result = getMaxChartY({
        showEnergyOut: true,
        showEnergyIn: true,
        showBattery: true,
        batterySoc,
        whIn,
        whOut,
      });
      expect(result).toBe(250 + 60); // Max of whIn + Max of whOut
    });
  });

  describe('tickFormat', () => {
    test('should return an empty string', () => {
      const result = tickFormat('', 0, DateTypes.PAST_MONTH);

      expect(result).toBe('');
    });

    test('should return the formatted date for date type', () => {
      const evenIndexResult = tickFormat('2023-5-16:21-40', 0, DateTypes.PAST_TWO_YEARS);

      expect(evenIndexResult).toBe('May');
    });

    test('should return an empty string for past day', () => {
      const result = tickFormat('2023-10-16:16-20', 1, DateTypes.PAST_DAY);

      expect(result).toBe('');
    });

    test('should return formatted date with non even index', () => {
      const result = tickFormat('2023-10-16:16-20', 3, DateTypes.PAST_TWO_WEEKS);

      expect(result).toBe('M');
    });
  });

  describe('renderTransparentLine', () => {
    const whIn = [{ x: 1 }, { x: 2 }, { x: 3 }];
    const maxY = 100;
    const result = renderTransparentLine({ whIn, maxY });

    test('should generate the correct data for VictoryLine', () => {
      const { data } = result.props;

      expect(data).toEqual(whIn.map(({ x }) => ({ x, y: maxY })));
    });

    test('should set the correct style properties', () => {
      const { style } = result.props;

      expect(style).toEqual({ data: { stroke: Colors.transparent, strokeWidth: 0 } });
    });
  });

  test('should calculate the correct Y value from a percentage', () => {
    const testCases = [
      { percentage: 0, maxY: 100, expectedY: 0 },
      { percentage: 50, maxY: 200, expectedY: 100 },
      { percentage: 75, maxY: 300, expectedY: 225 },
      { percentage: 100, maxY: 50, expectedY: 50 },
    ];

    testCases.forEach(({ percentage, maxY, expectedY }) => {
      const result = getYFromPercentage({ percentage, maxY });

      expect(result).toBe(expectedY);
    });
  });

  describe('formatToKilo', () => {
    test('should format numbers less than 1000 as-is', () => {
      const testCases = [
        { num: 0, expectedFormatted: '0 ' },
        { num: 999, expectedFormatted: '999 ' },
        { num: -500, expectedFormatted: '-500 ' },
      ];

      testCases.forEach((testCase) => {
        const { num, expectedFormatted } = testCase;
        const result = formatToKilo(num);
        expect(result).toBe(expectedFormatted);
      });
    });

    test('should format numbers greater than or equal to 1000000 without "K" suffix', () => {
      const result = formatToKilo(100000);
      expect(result).toBe('100 K');
    });

    test('should format numbers greater than or equal to 1000000 with "K" suffix', () => {
      const result = formatToKilo(1000000);
      expect(result).toBe('1000 K');
    });

    test('should use the provided suffix', () => {
      const result = formatToKilo(7000000, 'M');
      expect(result).toBe('7000 M');
    });
  });

  describe('formatLongNumber', () => {
    test('should format numbers less than 1,000,000 using formatToKilo', () => {
      const testCases = [
        { num: 0, expectedFormatted: '0 ' },
        { num: 999, expectedFormatted: '999 ' },
        { num: 50000, expectedFormatted: '50 K' },
        { num: 999999, expectedFormatted: '999 K' },
      ];

      testCases.forEach((testCase) => {
        const { num, expectedFormatted } = testCase;
        const result = formatLongNumber(num);
        expect(result).toBe(expectedFormatted);
      });
    });

    test('should format numbers greater than or equal to 1,000,000 as millions with a comma separator', () => {
      const testCases = [
        { num: 1000000, expectedFormatted: '1 M' },
        { num: 9000000, expectedFormatted: '9 M' },
      ];

      testCases.forEach((testCase) => {
        const { num, expectedFormatted } = testCase;
        const result = formatLongNumber(num);
        expect(result).toBe(expectedFormatted);
      });
    });
  });

  describe('getDateFormat', () => {
    test('should return the correct date format for DateTypes.PAST_DAY', () => {
      const result = getDateFormat(DateTypes.PAST_DAY);
      expect(result).toBe('h');
    });

    test('should return the correct date format for DateTypes.PAST_TWO_WEEKS', () => {
      const result = getDateFormat(DateTypes.PAST_TWO_WEEKS);
      expect(result).toBe('EEEEE');
    });

    test('should return the correct date format for DateTypes.PAST_MONTH', () => {
      const result = getDateFormat(DateTypes.PAST_MONTH);
      expect(result).toBe('d');
    });

    test('should return the correct date format for DateTypes.PAST_YEAR', () => {
      const result = getDateFormat(DateTypes.PAST_YEAR);
      expect(result).toBe('LLL');
    });

    test('should return the correct date format for DateTypes.PAST_TWO_YEARS', () => {
      const result = getDateFormat(DateTypes.PAST_TWO_YEARS);
      expect(result).toBe('LLL');
    });
  });

  describe('renderBottomDates', () => {
    const maxY = 100;

    test('should render VictoryAxis elements for DateTypes', () => {
      Object.values(DateTypes).forEach((tempUsage) => {
        const whIn = [{ x: '2023-10-16:10-00' }, { x: '2023-10-12:00-00' }];
        const screen = render(<div>{renderBottomDates({ maxY, whIn, tempUsage })}</div>).toJSON();
        expect(screen).toMatchSnapshot();
      });
    });

    test('should return null for an unknown DateTypes value', () => {
      const tempUsage = 'UnknownType';
      const whIn = [];
      const result = renderBottomDates({ maxY, whIn, tempUsage });
      expect(result).toBeNull();
    });
  });

  describe('getFormattedPeakDate', () => {
    const tempUsage = [
      { date: DateTypes.PAST_DAY, inputDate: '2023-10-16 15:30:00', expectDate: '3PM, Oct 16 2023' },
      { date: DateTypes.PAST_TWO_WEEKS, inputDate: '2023-08-02 18:57:03', expectDate: '6PM, Aug 02 2023' },
      { date: DateTypes.PAST_MONTH, inputDate: '2023-05-03 07:47:20', expectDate: 'May 03, 2023' },
      { date: DateTypes.PAST_YEAR, inputDate: '2022-11-12 12:20:10', expectDate: 'Nov 12, 2022' },
      { date: DateTypes.PAST_TWO_YEARS, inputDate: '2021-01-15 17:30:00', expectDate: 'Jan 15, 2021' },
    ];
    tempUsage.forEach(({ date, inputDate, expectDate }) => {
      test(`should format date for ${date}`, () => {
        const formattedDate = getFormattedPeakDate(date, inputDate);
        expect(formattedDate).toBe(expectDate);
      });
    });
  });
});
