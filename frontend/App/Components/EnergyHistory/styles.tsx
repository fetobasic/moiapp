import { StyleSheet } from 'react-native';

import { Colors, Fonts, Metrics } from 'App/Themes';

export const chartHeight = 400;

export const chartWidth = Metrics.screenWidth + Metrics.baseMargin - 10;

export const axisXStyle = {
  axis: { stroke: Colors.border, strokeDasharray: '5 10' },
  ticks: { stroke: 'none' },
  grid: { stroke: Colors.border, strokeDasharray: '5 10' },
  tickLabels: {
    fill: Colors.transparentWhite('0.87'),
    fontSize: 10,
  },
};

export const axisYStyle = {
  axis: { stroke: 'none' },
  ticks: { stroke: 'none' },
  grid: { stroke: 'rgba(54, 54, 54, 1)', strokeDasharray: '5 10' },
  tickLabels: {
    fill: Colors.transparentWhite('0.87'),
    fontSize: 10,
  },
};

export const separatorAxisStyle = {
  axis: { stroke: Colors.border },
  axisLabel: {
    fill: Colors.transparentWhite('0.87'),
    fontSize: 10,
  },
  ticks: { stroke: 'none' },
  grid: { stroke: 'none' },
  tickLabels: {
    fill: 'none',
  },
};

export const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  sectionChart: {
    flex: 1,
    marginLeft: -Metrics.baseMargin * 2,
    marginBottom: -Metrics.baseMargin,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: Metrics.halfMargin,
    marginBottom: Metrics.smallMargin,
  },
  sectionShadow: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 0,
    marginBottom: Metrics.smallMargin,
  },
  sectionMain: {
    flex: 1,
  },
  sectionIcon: {
    marginRight: Metrics.halfMargin,
  },
  border: {
    borderTopColor: Colors.border,
    borderTopWidth: 1,
  },
  swtch: {
    marginLeft: Metrics.halfMargin,
  },
  textTitle: {
    ...Fonts.font.base.bodyTwo,
    color: Colors.transparentWhite('0.87'),
  },
});
