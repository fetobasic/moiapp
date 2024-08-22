import React, { useCallback, useMemo } from 'react';
import { View, Text, StyleSheet } from 'react-native';

import { Colors, Fonts, Metrics } from 'App/Themes';

import OverheatIcon from 'App/Images/Icons/overheat.svg';
import ColdIcon from 'App/Images/Icons/cold.svg';
import AppConfig from 'App/Config/AppConfig';
import { convertTemperature } from 'App/Services/ConvertTemperature';
import { TemperatureUnits } from 'App/Types/Units';
import { useAppSelector } from 'App/Hooks';

const WIDTH = 148;
const LEVEL_PADDING = 7;

type Props = {
  level: number;
};

function YetiTemperatureLevel({ level }: Props) {
  const { temperatureUnits } = useAppSelector((state) => ({
    temperatureUnits: state.application.units?.temperature || TemperatureUnits.fahrenheit,
  }));

  const temperature = useMemo(() => {
    return convertTemperature(temperatureUnits, level);
  }, [temperatureUnits, level]);

  const renderTemperatureValue = useCallback(() => {
    if (level <= AppConfig.yetiTemperatureThreshold.cold) {
      return (
        <>
          <ColdIcon />
          <Text style={[styles.textLevel, { color: Colors.blue }]}> {temperature}</Text>
        </>
      );
    }

    if (level >= AppConfig.yetiTemperatureThreshold.hot) {
      return (
        <>
          <OverheatIcon />
          <Text style={[styles.textLevel, { color: Colors.portError }]}> {temperature}</Text>
        </>
      );
    }

    return (
      <>
        <Text style={styles.textLevel}> {temperature}</Text>
      </>
    );
  }, [level, temperature]);

  return <View style={styles.container}>{renderTemperatureValue()}</View>;
}

const styles = StyleSheet.create({
  container: {
    width: WIDTH,
    alignSelf: 'center',
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  main: {
    alignItems: 'center',
    justifyContent: 'center',
    width: WIDTH,
  },
  info: {
    marginTop: Metrics.halfMargin,
  },
  line: {
    width: '100%',
    height: 2,
    backgroundColor: Colors.border,
  },
  min: {
    height: 16,
    width: 2,
    backgroundColor: Colors.temperature.min,
    position: 'absolute',
    borderRadius: 2,
    left: LEVEL_PADDING,
  },
  minIcon: {
    position: 'absolute',
    left: 2,
  },
  max: {
    height: 16,
    width: 2,
    backgroundColor: Colors.temperature.max,
    position: 'absolute',
    borderRadius: 2,
    right: LEVEL_PADDING,
  },
  maxIcon: {
    position: 'absolute',
    right: 2,
  },
  mark: {
    height: 8,
    width: 2,
    backgroundColor: Colors.border,
    position: 'absolute',
  },
  level: {
    width: 4,
    height: 16,
    borderRadius: 2,
    backgroundColor: Colors.white,
    position: 'absolute',
  },
  textLevel: {
    ...Fonts.font.base.bodyOne,
  },
});

export default YetiTemperatureLevel;
