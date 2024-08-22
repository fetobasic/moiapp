const moment = require('moment');
const fs = require('fs');
const _ = require('lodash');
const { EXCLUDE, LOAD, LOAD_OVERALL, RANDOM } = require('./setup.js');

const twoYearInHours = 2 * 365 * 24 + 24; // hourly for two years + 24 hours
const twoWeekInHours = 2 * 7 * 24; // slice two weeks only

const hourlyFormat = 'YYMMDDHH';
const dailyFormat = 'YYMMDD';

const shouldExclude = (momentDate) =>
  EXCLUDE.findIndex(({ from, to }) => momentDate.isBetween(moment.utc(from), moment.utc(to), 'hour', '[]')) >= 0;

const generateHourlyData = (loadType, length) => {
  const { whInPerHour, whOutPerHour, hoursUsage } = LOAD[loadType];
  const now = moment().utc();

  const out = [];

  for (let i = 0; i < length; i++) {
    const date = now.subtract(1, 'hours');

    if (!shouldExclude(date)) {
      // make both value use the same multiplier
      const rand = RANDOM ? Math.random() : 1;

      const whIn = Math.round(rand * whInPerHour * hoursUsage);
      const whOut = Math.round(rand * whOutPerHour * hoursUsage);

      out.push({ date: date.clone(), whIn, whOut });
    }
  }
  return out;
};

const filterDailyData = (data) => {
  const newData = {};

  Object.keys(data).forEach((date) => {
    if (data[date].length === 24) {
      newData[date] = data[date];
    }
  });

  return newData;
};

const aggregateHourlyDataByDay = (data) => {
  const groupedData = filterDailyData(_.groupBy(data, ({ date: momentDate }) => momentDate.format(dailyFormat)));

  return Object.keys(groupedData).map((day) => {
    const whIn = groupedData[day].reduce((acc, item) => (acc += item.whIn), 0);
    const whOut = groupedData[day].reduce((acc, item) => (acc += item.whOut), 0);

    return { date: day, whIn, whOut };
  });
};

const sliceHourlyData = (data, momentDateInPast) =>
  data
    .filter(({ date: momentDate }) => momentDate.isSameOrAfter(momentDateInPast, 'hour'))
    .map(({ date, whIn, whOut }) => ({
      date: date.format(hourlyFormat),
      whIn,
      whOut,
    }))
    .reverse();

const createCSV = (data) => {
  const header = 'date,whIn,whOut';

  return [header, ...data.map(({ date, whIn, whOut }) => `${date},${whIn},${whOut}`)].join('\n');
};

const path = `${__dirname}/reports`;

if (!fs.existsSync(`${path}`)) {
  console.log(`missing ${path}... creating`);

  fs.mkdirSync(`${path}`);
}

// OVERALL
const createCSVOverall = (data) => {
  const header = 'date,whIn,whOut,soc,wPkIn,wPkOut';

  return [
    header,
    ...data.map(({ date, whIn, whOut, soc, wPkIn, wPkOut }) => `${date},${whIn},${whOut},${soc},${wPkIn},${wPkOut}`),
  ].join('\n');
};

const generateHourlyDataOverall = (loadType, length) => {
  const { whInPerHour, whOutPerHour, hoursUsage, wPkInHour, wPkOutHour } = LOAD_OVERALL[loadType];
  const now = moment().utc();

  const out = [];

  for (let i = 0; i < length; i++) {
    const date = now.subtract(1, 'hours');

    if (!shouldExclude(date)) {
      // make both value use the same multiplier
      const rand = RANDOM ? Math.random() : 1;

      const whIn = Math.round(rand * whInPerHour * hoursUsage);
      const whOut = Math.round(rand * whOutPerHour * hoursUsage);
      const soc = Math.round(Math.random() * 100);
      const wPkIn = Math.round(rand * wPkInHour * hoursUsage);
      const wPkOut = Math.round(rand * wPkOutHour * hoursUsage);

      out.push({ date: date.clone(), whIn, whOut, soc, wPkIn, wPkOut });
    }
  }
  return out;
};

const aggregateHourlyDataByDayOverall = (data) => {
  const groupedData = filterDailyData(_.groupBy(data, ({ date: momentDate }) => momentDate.format(dailyFormat)));

  return Object.keys(groupedData).map((day) => {
    const whIn = groupedData[day].reduce((acc, item) => (acc += item.whIn), 0);
    const whOut = groupedData[day].reduce((acc, item) => (acc += item.whOut), 0);
    const soc = Math.round(groupedData[day].reduce((acc, item) => (acc += item.soc), 0) / groupedData[day].length);
    const wPkIn = _.maxBy(groupedData[day], 'wPkIn').wPkIn;
    const wPkOut = _.maxBy(groupedData[day], 'wPkOut').wPkOut;

    return { date: day, whIn, whOut, soc, wPkIn, wPkOut };
  });
};

const sliceHourlyDataOverall = (data, momentDateInPast) =>
  data
    .filter(({ date: momentDate }) => momentDate.isSameOrAfter(momentDateInPast, 'hour'))
    .map(({ date, whIn, whOut, soc, wPkIn, wPkOut }) => ({
      date: date.format(hourlyFormat),
      whIn,
      whOut,
      soc,
      wPkIn,
      wPkOut,
    }))
    .reverse();

Object.keys(LOAD).forEach((loadType) => {
  // generate hourly data as a source
  const hourlyDataFull = generateHourlyData(loadType, twoYearInHours);

  const hourlyData = sliceHourlyData(hourlyDataFull, moment.utc().subtract(twoWeekInHours, 'hours'));
  const dailyData = aggregateHourlyDataByDay(hourlyDataFull);

  const dir = loadType.toLowerCase();

  // check for directory existence
  if (!fs.existsSync(`${path}/${dir}`)) {
    console.log(`missing ${path}/${dir}... creating`);

    fs.mkdirSync(`${path}/${dir}`);
  }

  fs.writeFileSync(`${path}/${dir}/hourly.csv`, createCSV(hourlyData, hourlyFormat));
  fs.writeFileSync(`${path}/${dir}/daily.csv`, createCSV(dailyData, dailyFormat));
});

Object.keys(LOAD_OVERALL).forEach((loadType) => {
  // generate hourly data as a source
  const hourlyDataFull = generateHourlyDataOverall(loadType, twoYearInHours);
  const subFolderPath = 'overall';
  const hourlyDataOverall = sliceHourlyDataOverall(hourlyDataFull, moment.utc().subtract(twoWeekInHours, 'hours'));
  const dailyDataOverall = aggregateHourlyDataByDayOverall(hourlyDataFull);

  const dir = loadType.toLowerCase();

  // check for directory existence
  if (!fs.existsSync(`${path}/${subFolderPath}/${dir}`)) {
    console.log(`missing ${path}/${subFolderPath}/${dir}... creating`);

    fs.mkdirSync(`${path}/${subFolderPath}/${dir}`);
  }

  fs.writeFileSync(`${path}/${subFolderPath}/${dir}/hourly.csv`, createCSVOverall(hourlyDataOverall, hourlyFormat));
  fs.writeFileSync(`${path}/${subFolderPath}/${dir}/daily.csv`, createCSVOverall(dailyDataOverall, dailyFormat));
});

console.log('READY!!');
