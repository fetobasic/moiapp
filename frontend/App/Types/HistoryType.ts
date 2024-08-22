export enum DateTypes {
  PAST_DAY = 'PAST_DAY',
  PAST_WEEK = 'PAST_WEEK',
  PAST_TWO_WEEKS = 'PAST_TWO_WEEKS',
  PAST_MONTH = 'PAST_MONTH',
  PAST_TWO_MONTHS = 'PAST_TWO_MONTHS',
  PAST_HALF_YEAR = 'PAST_HALF_YEAR',
  PAST_YEAR = 'PAST_YEAR',
  PAST_TWO_YEARS = 'PAST_TWO_YEARS',
}

export enum Toggle {
  ON = 'ON',
  OFF = 'OFF',
}

export type DatePeriodType = {
  label: string;
  value: DateTypes;
};

export type ReportUrlType = { [thingName: string]: { [precision: string]: string | null } };

export type ReportDataType = { [thingName: string]: { [precision: string]: { data: any; timestamp: number } | null } };

export type UsageReportUrlResponse = {
  url: string;
};
