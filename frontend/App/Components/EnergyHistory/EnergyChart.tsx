import React, { ComponentProps, useCallback, useMemo } from 'react';
import { StyleSheet, View } from 'react-native';
import {
  VictoryBar,
  VictoryChart,
  VictoryStack,
  VictoryTheme,
  VictoryAxis,
  VictoryLabel,
  VictoryScatter,
} from 'victory-native';

import { Colors, Fonts, Metrics, isIOS } from 'App/Themes';
import { ChartRowData } from './types';
import { axisXStyle, axisYStyle, chartHeight, chartWidth } from './styles';
import {
  renderTransparentLine,
  formatLongNumber,
  getMaxChartY,
  getYFromPercentage,
  renderBottomDates,
  tickFormat,
} from 'App/Services/ChartHelpers';
import { DateTypes } from 'App/Types/HistoryType';

type VictoryBarScatterProps = ComponentProps<typeof VictoryBar | typeof VictoryScatter>;
type VictoryStyleInterface = NonNullable<VictoryBarScatterProps['style']>;

type Props = {
  showEnergyIn: boolean;
  showEnergyOut: boolean;
  showBattery: boolean;
  showPercentageLine: boolean;
  whIn: ChartRowData[];
  whOut: ChartRowData[];
  batterySoc: ChartRowData[];
  chartType: DateTypes;
  disconnectedStateXLabels: string[];
};

function EnergyChart({
  showEnergyIn,
  showEnergyOut,
  showBattery,
  showPercentageLine,
  batterySoc,
  whIn,
  whOut,
  chartType,
  disconnectedStateXLabels,
}: Props) {
  const maxY = useMemo(
    () =>
      getMaxChartY({
        showEnergyIn,
        showEnergyOut,
        showBattery,
        batterySoc,
        whIn,
        whOut,
      }),
    [showEnergyIn, showEnergyOut, showBattery, batterySoc, whIn, whOut],
  );

  const getComputedVictoryStyles = useCallback(
    (color: string): VictoryStyleInterface['data'] => {
      return {
        display: ({ datum }) => (datum.y === 0 ? 'none' : 'flex'),
        stroke: () => color,
        fill: ({ datum }) => (disconnectedStateXLabels.includes(datum.x) ? 'transparent' : color),
        strokeWidth: 0.5,
      };
    },
    [disconnectedStateXLabels],
  );

  const getBarY = useCallback(
    (datum: { x: string; y: number }) => {
      if (disconnectedStateXLabels.includes(datum.x)) {
        if (
          chartType === DateTypes.PAST_DAY ||
          chartType === DateTypes.PAST_WEEK ||
          chartType === DateTypes.PAST_TWO_WEEKS ||
          chartType === DateTypes.PAST_MONTH
        ) {
          return datum.y;
        }

        return datum.y * 30;
      }
      return typeof datum.x === 'string' && datum.x.match(/^\d{4}-\d{2}-\d{2} \d{2}:\d{2}$/) ? datum.y : 0;
    },
    [chartType, disconnectedStateXLabels],
  );

  const getBatterySocY: VictoryBarScatterProps['y'] = useCallback(
    (datum: { y: number; x: string }) => {
      return (datum.y * maxY) / 100;
    },
    [maxY],
  );

  return (
    <View style={styles.container} testID="energyChart">
      <View style={[styles.sectionChart, showPercentageLine ? styles.sectionChartNew : styles.sectionChartLegacy]}>
        <VictoryChart
          height={chartHeight}
          width={chartWidth}
          theme={VictoryTheme.material}
          domainPadding={{ x: 20, y: 5 }}>
          <VictoryAxis
            crossAxis={false}
            theme={VictoryTheme.material}
            style={axisXStyle}
            tickFormat={(t, index) => tickFormat(t, index, chartType)}
            tickLabelComponent={<VictoryLabel dy={0} dx={isIOS ? 0 : 1} />}
          />
          <VictoryAxis
            tickFormat={(t) => `${formatLongNumber(t)}`}
            dependentAxis
            style={axisYStyle}
            orientation="right"
            theme={VictoryTheme.material}
            tickLabelComponent={<VictoryLabel dy={0} dx={showPercentageLine ? -26 : isIOS ? -11 : -15} />}
          />
          {renderTransparentLine({ whIn, maxY })}
          {showPercentageLine &&
            [0, 25, 50, 75, 100].map((percentage) => (
              <VictoryAxis
                key={percentage}
                tickFormat={() => `${percentage}%`}
                tickValues={[
                  getYFromPercentage({
                    maxY,
                    percentage,
                  }),
                ]}
                dependentAxis
                style={{
                  ...axisYStyle,
                  tickLabels: {
                    fill: Colors.green,
                    fontSize: 10,
                  },
                }}
                orientation="left"
                theme={VictoryTheme.material}
                tickLabelComponent={<VictoryLabel dy={0} dx={17} />}
              />
            ))}
          {renderBottomDates({ maxY, whIn, tempUsage: chartType })}
          <VictoryStack>
            {showEnergyOut && !!whOut.length && (
              <VictoryBar
                style={{ data: getComputedVictoryStyles(Colors.lightGreen) }}
                data={showEnergyOut ? whOut : []}
                y={getBarY}
                barWidth={4}
                cornerRadius={
                  !showEnergyIn
                    ? {
                        topLeft: 2,
                        topRight: 2,
                      }
                    : undefined
                }
              />
            )}
            {showEnergyIn && !!whIn.length && (
              <VictoryBar
                style={{ data: getComputedVictoryStyles(Colors.blue) }}
                data={showEnergyIn ? whIn : []}
                y={getBarY}
                barWidth={4}
                cornerRadius={{
                  topLeft: 2,
                  topRight: 2,
                }}
              />
            )}
          </VictoryStack>

          {showBattery && !!batterySoc.length && (
            <VictoryStack>
              <VictoryScatter
                size={4}
                y={getBatterySocY}
                data={batterySoc}
                style={{ data: getComputedVictoryStyles(Colors.green) }}
              />
            </VictoryStack>
          )}
        </VictoryChart>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  sectionChart: {
    flex: 1,
    marginBottom: -Metrics.baseMargin,
  },
  sectionChartLegacy: {
    marginLeft: -40,
  },
  sectionChartNew: {
    marginLeft: -25,
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

export default React.memo(EnergyChart);
