/* eslint-disable no-sequences */

import Papa, { ParseConfig } from 'papaparse';
import moment, { Moment, unitOfTime } from 'moment';
import { range, groupBy as lodashGroupBy, sumBy, maxBy, isString, map, takeRight } from 'lodash';
import { DOMParser } from 'xmldom';
import { SECONDS_IN_HOUR, SECONDS_IN_DAY, SECONDS_IN_WEEK, SECONDS_IN_MONTH } from 'App/Config/UsageReportConfig';

import { DateTypes } from 'App/Types/HistoryType';

import Logger from './Logger';

/**
 * Report variations:
 * Past day(with hourly precision) => 24 x - axis divisions
 * Past week (with 6 hours precision) => 28 x-axis divisions
 * Past 2 weeks (with 12 hours precision) => 28 x - axis divisions
 *
 * Past month(with daily precision) => 30 - 31 x - axis divisions
 * Past 2 months(with 2 days precision) => 30 - 31 x - axis divisions
 * Past half year(with weekly precision) => 26 x - axis divisions
 * Past year(with 1 / 2 month precision) => 24 x - axis divisions
 * Past 2 years(with monthly) => 24 x - axis divisions
 */

// current query params reference
export const PRECISION = { HOURLY: 'hourly', DAILY: 'daily' };
const Y_LABEL = 'Wh';
const LEGACY_DATASETS = ['whIn', 'whOut'];
const NEW_DATASETS = ['whIn', 'whOut', 'soc', 'wPkIn', 'wPkOut'] as const;
const MAX_PEAK_DATES = ['wPkInMaxDate', 'wPkOutMaxDate'] as const;
const TOTAL_FIELD_NAME = 'whTotal';
const CSV_RECORD_FORMAT = {
  [PRECISION.HOURLY]: 'YYMMDDHH',
  [PRECISION.DAILY]: 'YYMMDD',
};
const ERROR = {
  DOWNLOAD_URL: 'Unable to retrieve download url',
  DOWNLOAD_DATA: 'Unable to retrieve report data',
  EMPTY_CSV_DATA: 'Empty usage report data',
  CSV_PARSE: 'Error parsing usage report data',
};

const getEmptyPoints = (dataSets: Array<(typeof NEW_DATASETS)[number]>) =>
  dataSets.reduce((acc, v) => ((acc[v] = 0), acc), {} as Record<(typeof NEW_DATASETS)[number], number>);

// comparison and increment units for moment() dates
const getDateOperationUnits = (
  precision: unitOfTime.Diff,
): { cmp: unitOfTime.StartOf; inc: unitOfTime.DurationConstructor } =>
  precision === PRECISION.HOURLY ? { cmp: 'hour', inc: 'hours' } : { cmp: 'day', inc: 'days' };

const USAGE_REPORT_SETUP = {
  [DateTypes.PAST_DAY]: {
    // [number of units to the past, unit]
    fromDateOffset: [1, 'days'],
    // [division value, moment() unit, divider factor]
    scaleUnit: [1, 'hours', SECONDS_IN_HOUR],
    xLabelFormat: 'yyyy-MM-DD HH:mm',
  },
  [DateTypes.PAST_WEEK]: {
    fromDateOffset: [1, 'weeks'],
    scaleUnit: [6, 'hours', SECONDS_IN_HOUR],
    xLabelFormat: 'ddd', // Mon ... Tue
  },
  [DateTypes.PAST_TWO_WEEKS]: {
    fromDateOffset: [2, 'weeks'],
    scaleUnit: [1, 'days', SECONDS_IN_DAY],
    xLabelFormat: 'yyyy-MM-DD HH:mm',
  },
  [DateTypes.PAST_MONTH]: {
    fromDateOffset: [1, 'months'],
    scaleUnit: [1, 'days', SECONDS_IN_DAY],
    xLabelFormat: 'yyyy-MM-DD 00:00',
  },
  [DateTypes.PAST_TWO_MONTHS]: {
    fromDateOffset: [2, 'months'],
    scaleUnit: [2, 'days', SECONDS_IN_DAY],
    xLabelFormat: 'MMM DD', // Feb 03 ... Mar 24
  },
  [DateTypes.PAST_HALF_YEAR]: {
    fromDateOffset: [6, 'months'],
    scaleUnit: [1, 'weeks', SECONDS_IN_WEEK],
    xLabelFormat: 'MMM DD', // Feb 03 ... May 24
  },
  [DateTypes.PAST_YEAR]: {
    fromDateOffset: [1, 'years'],
    scaleUnit: [1, 'months', SECONDS_IN_MONTH],
    xLabelFormat: 'yyyy-MM-DD 00:00',
  },
  [DateTypes.PAST_TWO_YEARS]: {
    fromDateOffset: [2, 'years'],
    scaleUnit: [1, 'months', SECONDS_IN_MONTH],
    xLabelFormat: 'yyyy-MM-DD 00:00',
  },
};

const NEWLINE_DELIMITER = '\n';

const getParserSetup = (precision: string) => ({
  delimiter: ',',
  newline: NEWLINE_DELIMITER,
  header: true,
  skipEmptyLines: true,
  fastMode: true,
  transform: (value: string, field: string) =>
    field === 'date' ? moment.utc(value, CSV_RECORD_FORMAT[precision]) : parseFloat(value),
});

// provides some url format validation besides date validation
const reportUrlValid = (reportUrl?: string | null) => {
  if (!reportUrl) {
    return false;
  }
  // period in seconds
  // @ts-ignore we can't ensure TS that reportUrl is not null, but it probably possible in next TS releases
  const validPeriod = parseInt(reportUrl.match(/X-Amz-Expires=(\d*)/)[1], 10);
  // AWS url issue date is presumably UTC+00:00
  // @ts-ignore we can't ensure TS that reportUrl is not null, but it probably possible in next TS releases
  const issuedAt = reportUrl.match(/X-Amz-Date=(\d{8}T\d{6}Z)/)[1];
  // using moment() to avoid fitting to Date.parse() conventions
  return moment.utc(issuedAt).unix() + validPeriod >= moment.utc().unix();
};

/**
 * Using clone() intentionally to distinct cases when copy required
 * from instantiating moment object with string date
 */
const getReportXLabels = (
  fromDate: Moment,
  toDate: Moment,
  [num, unit]: [number, unitOfTime.DurationConstructor],
  xLabelFormat: string,
) => {
  // number of base unit periods within date range
  const numBasePeriods = toDate.diff(fromDate, unit);
  // calculate number of chart points
  const numChartPoints = Math.floor(numBasePeriods / num);
  // create a copy to increment
  // Yeti collects UTC date and time, so labels should adjust to local time ONLY when hours are used NOT when days are used
  const dailyPrecision = xLabelFormat === USAGE_REPORT_SETUP[DateTypes.PAST_YEAR].xLabelFormat;
  const startingDate = dailyPrecision ? fromDate.clone() : fromDate.local().clone();
  // return array of formatted date strings
  return range(numChartPoints).map(() => startingDate.add(num, unit).format(xLabelFormat));
};

// helper to break dependency and be able to know precision in several places
const getPrecisionByPeriod = (period: DateTypes): unitOfTime.Diff =>
  [DateTypes.PAST_DAY, DateTypes.PAST_WEEK, DateTypes.PAST_TWO_WEEKS].indexOf(period) >= 0
    ? (PRECISION.HOURLY as unitOfTime.Diff)
    : (PRECISION.DAILY as unitOfTime.Diff);

// drop hours or minutes to have nice starting date points
const trimDateByPeriod = (date: Moment, period: DateTypes) =>
  getPrecisionByPeriod(period) === PRECISION.HOURLY ? date.minutes(0).seconds(0) : date.hours(0).minutes(0).seconds(0);

// get main report setup for data generation
// toDateUTC is a moment() object
const getUsageReportSetup = (period: DateTypes, toDateUTC: Moment) => {
  const {
    fromDateOffset: [offsetNum, offsetUnit],
    scaleUnit: [scaleNum, scaleUnit, scaleDivider],
    xLabelFormat,
  } = USAGE_REPORT_SETUP[period];

  const fromDateUTC = trimDateByPeriod(
    toDateUTC.clone().subtract(offsetNum as unitOfTime.DurationConstructor, offsetUnit),
    period,
  );
  const offset = fromDateUTC.unix();
  const precision = getPrecisionByPeriod(period);
  // calculate number of data points to consider (should have been reported by Yeti)
  const numDataPoints = toDateUTC.diff(fromDateUTC, getDateOperationUnits(precision).inc as unitOfTime.Diff);

  return {
    fromDateUTC,
    toDateUTC,
    precision,
    numDataPoints,
    xLabels: getReportXLabels(
      fromDateUTC,
      toDateUTC,
      [scaleNum as number, scaleUnit as unitOfTime.DurationConstructor],
      xLabelFormat,
    ),
    groupBy: ({ date }: { date: Moment }) => {
      if (['PAST_YEAR', 'PAST_TWO_YEARS'].includes(period)) {
        return date.format('yyMM');
      }

      if (['PAST_TWO_WEEKS', 'PAST_MONTH'].includes(period)) {
        return date.format('yyMMDD');
      }

      return Math.floor((date.unix() - offset) / Number(scaleNum) / Number(scaleDivider));
    },
  };
};

type csvString = Parameters<typeof Papa.parse>[0];

/*
 * Subroutines for getReportData()
 */
const parseReportData = (reportCSV: string, precision: string) =>
  //strip out '\r' from the csv string before parsing (our newline delimiter is '\n'). This should handle both line endings
  Papa.parse(reportCSV.replace(/\r/g, ''), getParserSetup(precision) as ParseConfig<any, undefined>);

// get header and first data row as a sample
const getReportDataSample = (reportCSV: string) =>
  reportCSV.split(NEWLINE_DELIMITER).slice(0, 2).join(NEWLINE_DELIMITER);

const isReportDataParseable = (reportCSV: csvString, precision: string) => {
  // @ts-ignore we can't ensure TS that types are valid here
  const { errors } = parseReportData(getReportDataSample(reportCSV), precision);
  return !errors.length;
};

function removeDuplicates(arr: Array<{ date: Moment }>) {
  const seen = new Set();
  return arr.filter((item) => {
    const dateStr = item.date;
    // @ts-ignore need to revalidate this flow, but it's not critical
    if (!seen.has(new Date(dateStr).getTime())) {
      // @ts-ignore need to revalidate this flow, but it's not critical
      seen.add(new Date(dateStr).getTime());
      return true;
    }
    return false;
  });
}

interface ReportSetup {
  fromDateUTC: Moment;
  toDateUTC: Moment;
  dateUnits: ReturnType<typeof getDateOperationUnits>;
  precision: string;
  numDataPoints: number;
  dataSets: Array<(typeof NEW_DATASETS)[number]>;
}

const filterReportData = (reportData: Array<{ date: Moment }>, reportSetup: ReportSetup) => {
  const { fromDateUTC, toDateUTC, dateUnits, precision, numDataPoints, dataSets } = reportSetup;

  const existingDates: string[] = [];
  let missingPointsCount = 0;

  const filteredByPeriod = removeDuplicates(reportData).filter((item) => {
    // exclusive left, inclusive right
    const match = item.date && item.date.isBetween(fromDateUTC, toDateUTC, dateUnits.cmp, '(]');
    if (match) {
      existingDates.push(item.date.format(CSV_RECORD_FORMAT[precision]));
    }
    return match;
  });

  if (!filteredByPeriod.length) {
    return {
      filteredByPeriod: [],
      missingPointsCount: numDataPoints,
    };
  }

  if (filteredByPeriod.length < numDataPoints) {
    // track missing data for easier debugging of real device usage issues
    missingPointsCount = numDataPoints - filteredByPeriod.length;

    // there are missing periods, fill with zeroes
    const currentDateUTC = fromDateUTC.clone();

    while (!currentDateUTC.isSameOrAfter(toDateUTC, dateUnits.cmp)) {
      currentDateUTC.add(1, dateUnits.inc);

      if (existingDates.indexOf(currentDateUTC.format(CSV_RECORD_FORMAT[precision])) < 0) {
        const emptyPoint = getEmptyPoints(dataSets as Array<(typeof NEW_DATASETS)[number]>);
        // add missing date point with zero values
        filteredByPeriod.push({ date: currentDateUTC.clone(), ...emptyPoint });
      }
    }

    // sort by date to have a nice chart
    filteredByPeriod.sort((a, b) => a.date.unix() - b.date.unix());
  }

  return {
    filteredByPeriod,
    missingPointsCount,
  };
};

const groupReportData = (
  filteredByPeriod: Array<{ date: Moment }>,
  groupBy: ReturnType<typeof getUsageReportSetup>['groupBy'],
  fieldList: Array<(typeof NEW_DATASETS)[number]>,
  dataSets: Array<(typeof NEW_DATASETS)[number]>,
  dateFormat: string,
) => {
  const groupedData = lodashGroupBy(filteredByPeriod, groupBy);
  const dailyPrecision = dateFormat === USAGE_REPORT_SETUP[DateTypes.PAST_YEAR].xLabelFormat;

  // calculate mean data for requested series
  // if there were missing dates, grouping would lower the average
  // custom sorting function to use numbers instead of strings
  return Object.keys(groupedData)
    .sort((a, b) => Number(a) - Number(b))
    .map((date) => {
      const record: Record<string, any> = {};
      const dateData = groupedData[date];
      // walk through all parsed fields
      // meta object obtained from Papa.parse()
      fieldList.forEach((field) => {
        if (dataSets.indexOf(field) > -1) {
          // soc need to be averaged and not includes 0 values
          if (field === 'soc') {
            //@ts-ignore
            const socData = dateData.filter((item) => item.soc > 0);
            record[field] = socData?.length ? Math.round(sumBy(socData, field) / socData.length) || 0 : 0;
          } else if (field === 'wPkIn' || field === 'wPkOut') {
            // peak watts in/out needs to be the max value
            const maxField = maxBy(dateData, field);
            //@ts-ignore
            record[field] = maxField ? maxField[field] || 0 : 0;
            if (Number(record[field]) > 0) {
              //@ts-ignore
              const pkDate = dateData.find((item) => item[field] === record[field])?.date;
              record[`${field}MaxDate`] = dailyPrecision
                ? pkDate?.format(dateFormat)
                : pkDate?.local().format(dateFormat);
            }
          } else {
            // calculate the field value as a sum of all values in that period
            record[field] = sumBy(dateData, field);
          }
        }
      });

      return record;
    });
};

/**
 * @param {array} dataRows Data rows
 * @param {string} totalFieldName
 * @param {array} datasets Dataset names to include into total
 */
const addTotalField = (dataRows: Array<any>, totalFieldName: string, datasets: Array<(typeof NEW_DATASETS)[number]>) =>
  dataRows.map((tuple) => {
    const total = datasets.reduce((acc, field) => acc + tuple[field], 0);

    return { ...tuple, [totalFieldName]: total };
  });

const getGrandTotals = (dataRows: Array<any>, dataSets: Array<(typeof NEW_DATASETS)[number]>) => {
  const totals: Record<string, number> = {};
  // use data row-based strategy instead of looping through array once
  // because it's cleaner and easier to grasp
  dataSets.forEach((field) => {
    totals[`${field}GrandTotal`] = dataRows.reduce((acc, tuple) => acc + tuple[field], 0);
  });
  return totals;
};

// need to check for non-empty meanData array to avoid returning NaN
const getMaxAvgValue = (meanData: Array<any>, dataSets: Array<(typeof NEW_DATASETS)[number]>) =>
  meanData.length ? Math.max(...dataSets.map((field) => maxBy(meanData, field)[field])) : 0;

type ReportDataItem = Record<(typeof NEW_DATASETS)[number], number> & { date: Moment };

const getDisconnectedStateData = (
  reportData: ReportDataItem[],
  period: DateTypes,
  dateUnits: ReturnType<typeof getDateOperationUnits>,
) => {
  const disconnectedStateReportData: Array<Omit<ReportDataItem, 'date'> & { date: string }> = [];
  const missedDates: Array<ReportDataItem> = [];

  reportData.forEach((item: ReportDataItem, index: number, array: ReportDataItem[]) => {
    if (!item.date.isValid()) {
      if (index === 0 || index === array.length - 1) {
        // if current item is the first or last element and has invalid Date, we just skip iteration
        return;
      }

      const startDisconnectedDate = reportData[index - 1].date.clone();
      const endDisconnectedDate = reportData[index + 1 >= array.length ? index : index + 1].date
        .clone()
        .subtract(1, dateUnits.inc);

      const disconnectedPeriod = endDisconnectedDate.diff(startDisconnectedDate, dateUnits.inc);

      const periodMultiplier =
        dateUnits.inc === 'hours' && disconnectedPeriod >= 24
          ? Math.round(disconnectedPeriod / 24)
          : disconnectedPeriod;

      const sumWhIn = item.whIn / periodMultiplier;
      const sumWhOut = item.whOut / periodMultiplier;

      const dataForDisconnectedPeriod = Array.from({ length: disconnectedPeriod }, (_) => {
        const date = startDisconnectedDate.add(1, dateUnits.inc);

        if (period === 'PAST_TWO_WEEKS') {
          const isSameDay =
            disconnectedPeriod < 24 &&
            startDisconnectedDate.utc().format('yyyyMMDD') === endDisconnectedDate.utc().format('yyyyMMDD');

          if (isSameDay) {
            missedDates.push({
              date: date.utc().clone(),
              whIn: sumWhIn,
              whOut: sumWhOut,
              soc: item.soc || 0,
              wPkIn: item.wPkIn || 0,
              wPkOut: item.wPkOut || 0,
            });
          }
        }

        if (period === 'PAST_YEAR' || period === 'PAST_TWO_YEARS') {
          const isSameMonth =
            startDisconnectedDate.utc().format('yyyyMM') === endDisconnectedDate.utc().format('yyyyMM');

          if (isSameMonth) {
            missedDates.push({
              date: date.utc().clone(),
              whIn: sumWhIn,
              whOut: sumWhOut,
              soc: item.soc || 0,
              wPkIn: item.wPkIn || 0,
              wPkOut: item.wPkOut || 0,
            });
          }
        }

        return {
          date: date.local().format(USAGE_REPORT_SETUP[period].xLabelFormat),
          whIn: sumWhIn,
          whOut: sumWhOut,
          soc: item.soc || 0,
          wPkIn: item.wPkIn || 0,
          wPkOut: item.wPkOut || 0,
        };
      });

      disconnectedStateReportData.push(...dataForDisconnectedPeriod);
    }
  });

  return { disconnectedStateReportData, missedDates };
};

/**
 * @param {string} reportCSV
 * @param {string} periodInPast
 * @param {string|timestamp|Date} nowDate
 */
const getReportData = (
  reportCSV: csvString,
  periodInPast: DateTypes,
  nowDate = Date.now(),
  dataSets: Array<(typeof NEW_DATASETS)[number]> = LEGACY_DATASETS as Array<(typeof NEW_DATASETS)[number]>,
) => {
  if (!reportCSV) {
    return {};
  }
  const isLegacyDataSet = dataSets === LEGACY_DATASETS;

  // count back from the passed date
  const endDateUTC = trimDateByPeriod(moment.utc(nowDate), periodInPast);

  // get period setup
  const { precision, fromDateUTC, toDateUTC, groupBy, xLabels, numDataPoints } = getUsageReportSetup(
    periodInPast,
    endDateUTC,
  );

  const dateUnits = getDateOperationUnits(precision);

  // parse report data
  // @ts-ignore we can't ensure TS that types are valid here
  const { data: reportData, errors, meta } = parseReportData(reportCSV, precision);

  if (errors.length) {
    Logger.error(ERROR.CSV_PARSE);

    throw new Error(ERROR.CSV_PARSE);
  }

  // get the dates that fit into given period and remember non-blank dates
  // also expand data by adding missing empty points to cover the report range
  const { filteredByPeriod, missingPointsCount } = filterReportData(reportData, {
    fromDateUTC,
    toDateUTC,
    dateUnits,
    precision,
    numDataPoints,
    dataSets,
  });

  const { disconnectedStateReportData: disconnectedStateData, missedDates } = getDisconnectedStateData(
    reportData,
    periodInPast,
    dateUnits,
  );

  // calculate grand total BEFORE any average
  const grandTotals = getGrandTotals([...filteredByPeriod, ...missedDates], dataSets);

  // group and calculate averages
  const metaFields = <Array<(typeof NEW_DATASETS)[number]>>(meta.fields || []);

  let meanData = groupReportData(
    [...filteredByPeriod, ...missedDates],
    groupBy,
    metaFields,
    dataSets,
    USAGE_REPORT_SETUP[periodInPast].xLabelFormat,
  );
  meanData = takeRight(meanData, xLabels.length);

  const maxAvgValue = getMaxAvgValue(meanData, dataSets);
  // add total field (data, totalName, what datasets to include)
  const dataWithTotal = addTotalField(meanData, TOTAL_FIELD_NAME, dataSets);
  // extract datasets as own keys to use spread operator later
  type DataSetsWithTotalField = [
    ...Array<(typeof NEW_DATASETS)[number]>,
    // @ts-ignore
    ...Array<(typeof MAX_PEAK_DATES)[number]>,
    typeof TOTAL_FIELD_NAME,
  ];

  const datasetKeys: DataSetsWithTotalField = [
    ...(dataSets as Array<(typeof NEW_DATASETS)[number]>),
    ...(isLegacyDataSet ? [] : [...MAX_PEAK_DATES]), // add peak dates to datasets only when not legacy
    TOTAL_FIELD_NAME,
  ];

  const values = datasetKeys.reduce((acc, datasetName) => {
    acc[datasetName] = map(dataWithTotal, datasetName);
    return acc;
  }, {} as Record<DataSetsWithTotalField[number], number[]>);

  return {
    xLabels,
    yLabel: Y_LABEL,
    data: { ...values, ...grandTotals },
    maxAvgValue,
    missingPointsCount,
    disconnectedStateData,
  };
};

const getUsageReportChartData = (reportCSV: csvString, periodInPast: DateTypes, isLegacy: boolean) =>
  getReportData(
    reportCSV,
    periodInPast,
    Date.now(),
    isLegacy
      ? (LEGACY_DATASETS as Array<(typeof NEW_DATASETS)[number]>)
      : (NEW_DATASETS as unknown as Array<(typeof NEW_DATASETS)[number]>),
  );

const getErrorCodeFromXmlString = (response = '') => {
  const parser = new DOMParser();
  const xmlResponse = parser.parseFromString(response, 'text/xml');
  const errXml = xmlResponse.getElementsByTagName('Error');
  if (errXml.length && errXml[0]) {
    let errElement = errXml[0];
    if (errElement && errElement.childNodes) {
      for (let property in errElement.childNodes) {
        let child = errElement.childNodes[property];
        // @ts-ignore either typings are wrong or we need to revalidate this flow with using smth else instead of `tagName`
        if (child.tagName === 'Code' && child.firstChild) {
          let v = child.firstChild.nodeValue;
          if (isString(v)) {
            return v;
          }
        }
      }
    }
  }
  return null;
};

export {
  ERROR,
  getPrecisionByPeriod,
  reportUrlValid,
  getUsageReportChartData,
  isReportDataParseable,
  getErrorCodeFromXmlString,
};
