import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import Svg, { Path } from 'react-native-svg';
import { clamp } from 'lodash';

import { Colors, Fonts, Metrics } from 'App/Themes';
import { wait } from 'App/Services/Wait';

type Props = {
  min: number;
  socPercent: number;
  isCharging: boolean;
  isConnected: boolean;
  isDisabled?: boolean;
};

const calculateBatteryChartColors = (min: number, current: number, isDisabled?: boolean) => {
  return new Array(10)
    .fill(isDisabled ? Colors.disabled : Colors.greenDisable, 0, min)
    .fill(isDisabled ? Colors.disabled : Colors.green, min, current)
    .fill(Colors.border, current, 10);
};

function YetiBatteryLevel({ min, socPercent, isCharging, isConnected, isDisabled }: Props) {
  const levelPercent = isCharging ? socPercent : socPercent + 5;
  const level = useMemo(
    () => Math.min(Math.floor(clamp(levelPercent, 0, 100) / 10), isCharging ? 9 : 10),
    [isCharging, levelPercent],
  );
  const minLevel = useMemo(() => Math.round(clamp(min, 0, 100) / 10), [min]);

  const [batteryChartColors, setBatteryChartColors] = useState(
    calculateBatteryChartColors(minLevel, level, isDisabled),
  );

  const [isStartedAnimation, setIsStartedAnimation] = useState(false);

  const changeBatteryLevel = useCallback(async () => {
    if (isDisabled) {
      setBatteryChartColors(calculateBatteryChartColors(0, level, isDisabled));
      return;
    }

    if (isStartedAnimation || !isConnected) {
      return;
    }

    if (!isCharging) {
      setBatteryChartColors(calculateBatteryChartColors(minLevel, level, isDisabled));
      return;
    }

    setIsStartedAnimation(true);
    setBatteryChartColors(calculateBatteryChartColors(minLevel, level, isDisabled));

    await wait(1000);

    setBatteryChartColors(calculateBatteryChartColors(minLevel, level + 1, isDisabled));

    await wait(1000);

    setIsStartedAnimation(false);
  }, [isStartedAnimation, isConnected, isCharging, level, minLevel, isDisabled]);

  useEffect(() => {
    if (isCharging) {
      changeBatteryLevel();
    } else {
      if (!isConnected && !socPercent) {
        setBatteryChartColors(calculateBatteryChartColors(0, 0, isDisabled));

        return;
      }

      setBatteryChartColors(calculateBatteryChartColors(minLevel, level, isDisabled));
    }
  }, [changeBatteryLevel, isCharging, isConnected, isStartedAnimation, level, minLevel, socPercent, isDisabled]);

  return (
    <View style={styles.container}>
      <Svg width="260" height="126" viewBox="0 0 260 126">
        <Path
          d="M0 125.981H22.8739C23.1598 117.114 24.5513 108.361 27.0293 99.8544L5.26099 92.8101C2.05864 103.595 0.285924 114.74 0 125.981V125.981Z"
          fill={batteryChartColors[0]}
        />
        <Path
          d="M7.45312 86.1267L29.2215 93.171C32.2332 84.8545 36.2933 76.9558 41.3065 69.6077L32.6906 63.3609L22.7977 56.2026C16.393 65.4874 11.2464 75.5318 7.47218 86.1267H7.45312Z"
          fill={batteryChartColors[1]}
        />
        <Path
          d="M26.9149 50.5442L45.4237 63.9303C50.8944 56.9429 57.1847 50.6771 64.1994 45.2277L52.4384 29.1075L50.761 26.791C41.802 33.6454 33.8152 41.6201 26.9149 50.5442V50.5442Z"
          fill={batteryChartColors[2]}
        />
        <Path
          d="M93.5543 29.1078L86.4824 7.40527C75.846 11.1648 65.7815 16.2914 56.4413 22.6711L64.5235 33.7407L69.8988 41.1078C77.2757 36.1331 85.2053 32.0888 93.5543 29.0888V29.1078Z"
          fill={batteryChartColors[3]}
        />
        <Path
          d="M96.6232 15.8354L100.245 26.943C108.784 24.4937 117.591 23.1076 126.474 22.8228V0C115.17 0.303797 104 2.06962 93.173 5.24051L96.6232 15.8354Z"
          fill={batteryChartColors[4]}
        />
        <Path
          d="M133.507 0V22.8228C142.39 23.1076 151.196 24.4937 159.736 26.962L163.567 15.2278L166.827 5.25949C156 2.06962 144.811 0.303802 133.526 0.0189914L133.507 0Z"
          fill={batteryChartColors[5]}
        />
        <Path
          d="M190.082 41.1458L203.559 22.6711C194.238 16.2914 184.154 11.1648 173.518 7.40527L166.427 29.1078C174.776 32.1268 182.705 36.1521 190.082 41.1268V41.1458Z"
          fill={batteryChartColors[6]}
        />
        <Path
          d="M214.519 63.9682L233.066 50.5442C226.185 41.6201 218.179 33.6644 209.22 26.791L195.743 45.2657C202.758 50.7151 209.048 56.9809 214.5 63.9682H214.519Z"
          fill={batteryChartColors[7]}
        />
        <Path
          d="M218.675 69.6457C223.669 76.9748 227.71 84.8735 230.741 93.19L249.287 87.19L252.547 86.1267C248.773 75.5318 243.626 65.5064 237.222 56.2026L218.675 69.6267V69.6457Z"
          fill={batteryChartColors[8]}
        />
        <Path
          d="M259.981 125.981C259.676 114.721 257.903 103.595 254.72 92.8101L251.46 93.8733L232.914 99.8733C235.372 108.38 236.764 117.133 237.069 126H260L259.981 125.981Z"
          fill={batteryChartColors[9]}
        />
      </Svg>

      <Text style={[styles.textLevel, isDisabled ? styles.disabledText : styles.activeText]}>{socPercent}%</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    height: 110,
    width: 260,
    flex: 1,
    marginTop: Metrics.baseMargin,
    alignSelf: 'center',
  },
  background: {
    position: 'absolute',
  },
  textLevel: {
    ...Fonts.font.base.h1,
    fontSize: 56,
    lineHeight: 56,
    position: 'absolute',
    bottom: 0,
    alignSelf: 'center',
  },
  activeText: {
    color: Colors.green,
  },
  disabledText: {
    color: Colors.disabled,
  },
});

export default YetiBatteryLevel;
