module.exports = {
  // add spots of idleness
  // when Yeti consumes and issues no power
  EXCLUDE: [
    /*
    {
      from: '2020-04-01',
      to: '2020-04-10',
    },
    {
      from: '2020-04-20',
      to: '2020-04-30',
    },
    */
  ],
  // load profiles
  LOAD: {
    LIGHT: {
      whInPerHour: 1,
      whOutPerHour: 1,
      hoursUsage: 1,
    },
    MEDIUM: {
      // max value for whIn
      whInPerHour: 800,
      // max value for whOut
      whOutPerHour: 750,
      // how many hours Yeti was used - just multiplier
      hoursUsage: 8,
    },
    HEAVY: {
      whInPerHour: 1500,
      whOutPerHour: 1300,
      hoursUsage: 14,
    },
  },
  LOAD_OVERALL: {
    LIGHT: {
      whInPerHour: 1,
      whOutPerHour: 1,
      hoursUsage: 1,
      socHour: 100,
      wPkInHour: 1,
      wPkOutHour: 1,
    },
    MEDIUM: {
      // max value for whIn
      whInPerHour: 800,
      // max value for whOut
      whOutPerHour: 750,
      // how many hours Yeti was used - just multiplier
      hoursUsage: 8,
      socHour: 100,
      wPkInHour: 500,
      wPkOutHour: 500,
    },
    HEAVY: {
      whInPerHour: 1500,
      whOutPerHour: 1300,
      hoursUsage: 14,
      socHour: 100,
      wPkInHour: 1000,
      wPkOutHour: 1000,
    },
  },
  // randomize values within load range or set it to max
  RANDOM: true,
};
