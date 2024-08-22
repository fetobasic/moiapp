import React from 'react';
import { VictoryAxis, VictoryLabel, VictoryLine } from 'victory-native';
import { format } from 'date-fns';

import { Colors, isIOS } from 'App/Themes';
import { ChartRowData } from 'App/Components/EnergyHistory/types';
import { chartHeight, separatorAxisStyle } from 'App/Components/EnergyHistory/styles';
import { DateTypes } from 'App/Types/HistoryType';

const convertToDateFormat = (date: string) => {
  const [year, month, day, hours] = `${date}`.split(/[- :]/).map(Number);
  return new Date(year, month - 1, day, hours);
};

export const getMaxChartY = ({
  showEnergyOut,
  showEnergyIn,
  showBattery,
  batterySoc,
  whIn,
  whOut,
}: {
  showEnergyOut: boolean;
  showEnergyIn: boolean;
  showBattery: boolean;
  batterySoc: ChartRowData[];
  whIn: ChartRowData[];
  whOut: ChartRowData[];
}) => {
  const minValue = 100;
  const maxWhIn = whIn.length ? Math.max(...whIn.map((item) => item.y)) : minValue;
  const maxWhOut = whOut.length ? Math.max(...whOut.map((item) => item.y)) : minValue;
  const maxBatterySoc = batterySoc.length ? Math.max(...batterySoc.map((item) => item.y)) : minValue;
  const maxY = !whIn.length && !whOut.length ? minValue : maxWhIn + maxWhOut;

  if (!showEnergyOut && !showEnergyIn && !showBattery) {
    return minValue;
  }
  return Math.max(maxBatterySoc, maxY || minValue);
};

const isNotDateFormat = (value: string): boolean => {
  return typeof value !== 'string' || !Number.isNaN(Number(value));
};

export const tickFormat = (t: string, index: number, type: DateTypes) => {
  const isYesterday = type === DateTypes.PAST_DAY;
  const isPastTwoYears = type === DateTypes.PAST_TWO_YEARS;
  const isPastMonth = type === DateTypes.PAST_MONTH;
  const isEvenIndex = index % 2 === 0;

  if (isNotDateFormat(t)) {
    return '';
  }

  const date = convertToDateFormat(t);
  const formatted = format(date, getDateFormat(type));
  if (isYesterday || isPastTwoYears || isPastMonth) {
    if (isEvenIndex) {
      return formatted;
    }
    return '';
  }
  return formatted;
};

// empty chart needs to save labels in the bottom
// and chart size when all toggles are turned off
export const renderTransparentLine = ({ whIn, maxY }: { whIn: ChartRowData[]; maxY: number }) => {
  const arrWithMaxY = whIn.map(({ x }) => ({ x, y: maxY }));
  return (
    <VictoryLine
      style={{
        data: { stroke: Colors.transparent, strokeWidth: 0 },
      }}
      data={arrWithMaxY}
    />
  );
};

export const getYFromPercentage = ({ percentage, maxY }: { percentage: number; maxY: number }) => {
  return (maxY * percentage) / 100;
};

export const formatToKilo = (num: number, k = 'K') => {
  if (num < 100000) {
    return `${num} `;
  }
  const kilo = num / 1000;
  const rounded = Math.floor(kilo);
  return `${rounded} ${k}`.replace('.', ',');
};

export const formatLongNumber = (num: number): string => {
  if (num < 1000) {
    return `${num} `;
  } else if (num >= 1000 && num < 1000000) {
    const kilo = num / 1000;
    const rounded = Math.floor(kilo);
    return `${rounded} K`.replace('.', ',');
  }

  const million = num / 1000000;
  const rounded = Math.floor(million);
  return `${rounded} M`.replace('.', ',');
};

export const getDateFormat = (tempUsage: DateTypes): string => {
  const formatData: { [key: string]: string } = {
    [DateTypes.PAST_DAY]: 'h',
    [DateTypes.PAST_TWO_WEEKS]: 'EEEEE',
    [DateTypes.PAST_MONTH]: 'd',
    [DateTypes.PAST_YEAR]: 'LLL',
    [DateTypes.PAST_TWO_YEARS]: 'LLL',
  };

  return formatData[tempUsage];
};

export const renderBottomDates = ({
  maxY,
  whIn,
  tempUsage,
}: {
  maxY: number;
  whIn: ChartRowData[];
  tempUsage: DateTypes;
}) => {
  const bottomIndentPercentage = 14;
  const chartYIndent = getYFromPercentage({
    maxY,
    percentage: bottomIndentPercentage,
  });
  if (tempUsage === DateTypes.PAST_DAY) {
    return whIn.map((item, index) => {
      const date = convertToDateFormat(item.x);
      const hours = Number(format(date, 'H'));
      const amPm = format(new Date(2023, 1, 1, hours), 'a');
      const is1Hour = hours === 1 || hours === 13;
      const isFirst = index === 0;
      const axisValue = isFirst ? 0 : index;
      return (
        <VictoryAxis
          key={index}
          dependentAxis
          style={{
            ...separatorAxisStyle,
            axis: { stroke: is1Hour && !isFirst ? Colors.border : 'none' },
          }}
          label={is1Hour || isFirst ? amPm : ''}
          axisLabelComponent={<VictoryLabel dy={chartHeight / 4 + 52} dx={isFirst ? 15 : 28} angle={0} />}
          domain={[-chartYIndent, 0]}
          axisValue={axisValue}
        />
      );
    });
  }
  if (tempUsage === DateTypes.PAST_TWO_WEEKS) {
    return whIn.map((item, index) => {
      const date = convertToDateFormat(item.x);
      const day = format(date, 'E');
      const mon = 'Mon';
      const isMon = day === mon;
      const monthDate = format(date, 'LLL d');
      return (
        <VictoryAxis
          key={index}
          dependentAxis
          style={{
            ...separatorAxisStyle,
            axis: { stroke: isMon ? Colors.border : 'none' },
          }}
          label={isMon ? monthDate : ''}
          axisLabelComponent={<VictoryLabel dy={chartHeight / 4 + 52} dx={28} angle={0} />}
          domain={[-chartYIndent, 0]}
          axisValue={index + 0.5}
        />
      );
    });
  }
  if (tempUsage === DateTypes.PAST_MONTH) {
    return whIn.map((item, index) => {
      const date = convertToDateFormat(item.x);
      const day = format(date, 'd');
      const isSecondDayOfMonth = Number(day) === 2;
      const monthName = format(date, 'LLL');
      const isFirst = index === 0;
      const axisValue = isFirst ? 0 : index;
      return (
        <VictoryAxis
          key={index}
          dependentAxis
          style={{
            ...separatorAxisStyle,
            axis: { stroke: isSecondDayOfMonth && !isFirst ? Colors.border : 'none' },
          }}
          label={isSecondDayOfMonth || isFirst ? monthName : ''}
          axisLabelComponent={<VictoryLabel dy={chartHeight / 4 + 52} dx={isFirst ? 15 : 28} angle={0} />}
          domain={[-chartYIndent, 0]}
          axisValue={axisValue}
        />
      );
    });
  }
  if (tempUsage === DateTypes.PAST_YEAR || tempUsage === DateTypes.PAST_TWO_YEARS) {
    return whIn.map((item, index) => {
      const date = convertToDateFormat(item.x);
      const isPastYear = tempUsage === DateTypes.PAST_YEAR ? index + 0.5 : index;
      const isFirst = index === 0;
      const axisValue = isFirst ? 0 : isPastYear;
      const monthName = format(date, 'LLL');
      const year = format(date, 'u');
      const monthJan = 'Jan';
      const isJan = monthName === monthJan;
      return (
        <VictoryAxis
          key={index}
          dependentAxis
          style={{
            ...separatorAxisStyle,
            axis: { stroke: isJan && !isFirst ? Colors.border : 'none' },
          }}
          label={isJan || isFirst ? year : ''}
          axisLabelComponent={
            <VictoryLabel dy={chartHeight / 4 + 52} dx={isFirst ? (isIOS ? 15 : 20) : 28} angle={0} />
          }
          domain={[-chartYIndent, 0]}
          axisValue={axisValue}
        />
      );
    });
  }

  return null;
};

export const getFormattedPeakDate = (tempUsage: DateTypes, inputDate: string) => {
  const formatData: { [key: string]: string } = {
    [DateTypes.PAST_DAY]: 'ha, MMM dd yyyy',
    [DateTypes.PAST_TWO_WEEKS]: 'ha, MMM dd yyyy',
    [DateTypes.PAST_MONTH]: 'MMM dd, yyyy',
    [DateTypes.PAST_YEAR]: 'MMM dd, yyyy',
    [DateTypes.PAST_TWO_YEARS]: 'MMM dd, yyyy',
  };
  const date = convertToDateFormat(inputDate);
  const resultDate = format(date, formatData[tempUsage]);
  return resultDate;
};
