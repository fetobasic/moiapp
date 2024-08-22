import React, { useEffect, useMemo, useRef, useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import Svg, { Defs, Rect, Stop, LinearGradient } from 'react-native-svg';
import { debounce } from 'lodash';

import { Colors, Fonts, Metrics } from 'App/Themes';
import { WithTopBorder } from 'App/Hoc';
import { FRIDGE_SWITCH_MODE, FridgeState, FridgeUnits } from 'App/Types/Fridge';

import ThermostatIcon from 'App/Images/Icons/deviceThermostat.svg';
import PlusIcon from 'App/Images/Icons/plus.svg';
import MinusIcon from 'App/Images/Icons/minus.svg';
import { Button } from 'App/Components';
import { setLeftTemperature, setRightTemperature } from 'App/Services/Bluetooth/Fridge';
import renderElement from 'App/Services/RenderElement';
import AppConfig from 'App/Config/AppConfig';
import fridgeDataTransforms from 'App/Transforms/fridgeDataTransforms';

// https://github.com/githuboftigran/rn-range-slider/issues/141
const RangeSlider = require('rn-range-slider').default;

const POINT_SIZE = 28;
const CONTROL_WIDTH = Metrics.screenWidth - 80 - POINT_SIZE;
const DEFAULT_TEMP = 0;
const MIN_TEMP_F = -40;
const MAX_TEMP_F = 68;
const MIN_TEMP_C = -20;
const MAX_TEMP_C = 20;

type Props = {
  device: FridgeState;
  title: string;
  zone: 'left' | 'right';
};

function RenderRail({ disabled }: { disabled: boolean }) {
  return (
    <Svg style={styles.selectedRail}>
      <Defs>
        <LinearGradient id="grad" x1="0" y1="0" x2="1" y2="0">
          <Stop offset="0" stopColor={disabled ? Colors.disabled : '#0E17F0'} />
          <Stop offset="1" stopColor={disabled ? Colors.disabled : '#4DBFF7'} />
        </LinearGradient>
      </Defs>
      <Rect height="100%" fill="url(#grad)" width="100%" />
    </Svg>
  );
}

function TemperatureControl(props: Props) {
  const isConnected = useMemo(() => props.device?.isConnected, [props.device?.isConnected]);
  const isLeftZone = useMemo(() => props.zone === 'left', [props.zone]);
  const isPowerOff = useMemo(() => props.device?.data?.switch === FRIDGE_SWITCH_MODE.OFF, [props.device?.data?.switch]);
  const temperatureUnit = useMemo(
    () => props.device?.data?.units ?? FridgeUnits.FAHRENHEIT,
    [props.device?.data?.units],
  );
  const minTemp = useMemo(
    () => props.device?.data?.minControlRange || (temperatureUnit === FridgeUnits.FAHRENHEIT ? MIN_TEMP_F : MIN_TEMP_C),
    [props.device?.data?.minControlRange, temperatureUnit],
  );
  const maxTemp = useMemo(
    () => props.device?.data?.maxControlRange || (temperatureUnit === FridgeUnits.FAHRENHEIT ? MAX_TEMP_F : MAX_TEMP_C),
    [props.device?.data?.maxControlRange, temperatureUnit],
  );

  const lockChangeCurrentTemp = useRef(false);
  const lockTimerId = useRef<NodeJS.Timeout | null>(null);

  const [actualTemperature, setActualTemperature] = useState(
    isLeftZone
      ? props.device?.data?.leftTempActual ?? DEFAULT_TEMP
      : props.device?.data?.rightTempActual ?? DEFAULT_TEMP,
  );
  const [currentTemperature, setCurrentTemperature] = useState(
    isLeftZone
      ? props.device?.data?.leftBoxTempSet ?? DEFAULT_TEMP
      : props.device?.data?.rightBoxTempSet ?? DEFAULT_TEMP,
  );

  const currentTempColor = useMemo(() => {
    if (currentTemperature !== actualTemperature && (!isConnected || !isPowerOff)) {
      return Colors.blue;
    }

    return Colors.white;
  }, [actualTemperature, currentTemperature, isConnected, isPowerOff]);

  const changeInternalTemperature = (value: number) => {
    if (lockTimerId.current) {
      clearTimeout(lockTimerId.current);
      lockTimerId.current = null;
    }

    lockChangeCurrentTemp.current = true;
    setCurrentTemperature(value);

    lockTimerId.current = setTimeout(() => {
      lockTimerId.current = null;
      lockChangeCurrentTemp.current = false;
    }, 3000);
  };

  const sendTemperature = debounce((value: number) => {
    if (isLeftZone) {
      setLeftTemperature(props.device?.peripheralId, value);
    } else {
      setRightTemperature(props.device?.peripheralId, value);
    }
  }, AppConfig.debounceTimeout);

  const changeDeviceTemperature = (value: number) => {
    if (currentTemperature === value) {
      return;
    }
    changeInternalTemperature(value);
    sendTemperature(value);
  };

  const changeTemperatureFromControl = (value: number) => {
    if (value < minTemp || value > maxTemp) {
      return;
    }

    changeInternalTemperature(value);
    sendTemperature(value);
  };

  const renderLabel = (value: number) => {
    return (
      <View style={styles.pointLabel}>
        <Text style={styles.labelText}>{value}</Text>
      </View>
    );
  };

  useEffect(() => {
    setActualTemperature(isLeftZone ? props.device?.data?.leftTempActual : props.device?.data?.rightTempActual);
  }, [isLeftZone, props.device?.data?.leftTempActual, props.device?.data?.rightTempActual]);

  useEffect(() => {
    if (!lockChangeCurrentTemp.current) {
      setCurrentTemperature(isLeftZone ? props.device?.data?.leftBoxTempSet : props.device?.data?.rightBoxTempSet);
    }
  }, [isLeftZone, props.device?.data?.leftBoxTempSet, props.device?.data?.rightBoxTempSet]);

  return (
    <WithTopBorder
      testID="temperatureControl"
      containerStyle={!isLeftZone ? styles.rightSection : {}}
      contentStyle={styles.contentStyles}>
      <View style={styles.sectionInfo}>
        <ThermostatIcon color={isConnected ? Colors.transparentWhite('0.87') : Colors.disabled} />
        <View style={styles.sectionInfoTexts}>
          <Text style={[styles.textTitle, !isConnected && styles.textDisabled]}>{props.title}</Text>
          <Text style={[styles.textSubTitle, !isConnected && styles.textDisabled]}>Current Temperature</Text>
        </View>
        <Text style={[styles.textCurrentTemperature, !isConnected && styles.textDisabled]}>
          {fridgeDataTransforms.getFormattedTemperature({
            unit: temperatureUnit,
            temperature: actualTemperature,
            isPowerOff,
          })}
        </Text>
      </View>

      <RangeSlider
        disableRange
        floatingLabel
        renderLabel={renderLabel}
        renderNotch={renderElement(<View style={styles.notch} />)}
        allowLabelOverflow
        disabled={isPowerOff || !isConnected}
        style={styles.rangeSection}
        step={1}
        min={minTemp}
        max={maxTemp}
        low={currentTemperature}
        onValueChanged={(value: number) => changeDeviceTemperature(value)}
        onSliderTouchEnd={changeDeviceTemperature}
        renderThumb={renderElement(
          <View style={[styles.point, (isPowerOff || !isConnected) && styles.pointDisabled]} />,
        )}
        renderRail={renderElement(<View style={styles.rangeBackground} />)}
        renderRailSelected={renderElement(<RenderRail disabled={isPowerOff || !isConnected} />)}
      />

      <View style={styles.sectionControl}>
        <Button
          testID="temperatureControlMinus"
          disabled={isPowerOff || !isConnected}
          inverse
          height={32}
          title=""
          icon={<MinusIcon color={isPowerOff || !isConnected ? Colors.disabled : Colors.transparentWhite('0.87')} />}
          style={styles.btn}
          onPress={() => changeTemperatureFromControl(currentTemperature - 1)}
        />
        <View style={[styles.sectionTexts, (isPowerOff || !isConnected) && styles.sectionTextsDisabled]}>
          <Text style={styles.textSetTemperature}>Set Temperature</Text>
          <Text style={[styles.textSetTemperatureValue, { color: currentTempColor }]}>
            {fridgeDataTransforms.getFormattedTemperature({
              unit: temperatureUnit,
              temperature: currentTemperature,
              isPowerOff,
            })}
          </Text>
        </View>
        <Button
          testID="temperatureControlPlus"
          disabled={isPowerOff || !isConnected}
          inverse
          height={32}
          title=""
          icon={<PlusIcon color={isPowerOff || !isConnected ? Colors.disabled : Colors.transparentWhite('0.87')} />}
          style={styles.btn}
          mainSectionStyle={styles.btnSection}
          onPress={() => changeTemperatureFromControl(currentTemperature + 1)}
        />
      </View>
    </WithTopBorder>
  );
}

const styles = StyleSheet.create({
  rightSection: {
    marginTop: Metrics.smallMargin,
  },
  contentStyles: {
    marginBottom: 2,
  },
  sectionInfo: {
    flexDirection: 'row',
  },
  sectionInfoTexts: {
    flex: 1,
    marginLeft: Metrics.halfMargin,
  },
  textTitle: {
    ...Fonts.font.base.bodyTwo,
    color: Colors.transparentWhite('0.87'),
  },
  textSubTitle: {
    ...Fonts.font.base.bodyOne,
    color: Colors.transparentWhite('0.87'),
  },
  textCurrentTemperature: {
    ...Fonts.font.base.h1,
    color: Colors.white,
  },
  textSetTemperature: {
    ...Fonts.font.base.capture,
    color: Colors.white,
  },
  textSetTemperatureValue: {
    ...Fonts.font.base.button,
    marginLeft: Metrics.halfMargin,
  },
  textDisabled: {
    color: Colors.disabled,
  },
  sectionTexts: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  sectionTextsDisabled: {
    opacity: 0.5,
  },
  rangeSection: {
    marginTop: Metrics.baseMargin,
  },
  selectedRail: {
    height: 3,
    borderRadius: 2,
  },
  rangeBackground: {
    backgroundColor: Colors.border,
    width: CONTROL_WIDTH,
    height: 3,
    borderRadius: 2,
  },
  point: {
    width: POINT_SIZE,
    height: POINT_SIZE,
    borderRadius: 14,
    backgroundColor: 'rgb(55, 131, 243)',
  },
  pointDisabled: {
    backgroundColor: Colors.disabled,
  },
  sectionControl: {
    flexDirection: 'row',
    marginTop: Metrics.baseMargin,
    alignItems: 'center',
  },
  btn: {
    width: 32,
    height: 32,
    borderRadius: 16,
    padding: 0,
  },
  btnSection: {
    paddingTop: 6,
    paddingLeft: 1,
  },
  pointLabel: {
    padding: 8,
    backgroundColor: 'rgb(55, 131, 243)',
    borderRadius: 4,
  },
  labelText: {
    fontSize: 16,
    color: Colors.white,
  },
  notch: {
    borderTopColor: 'rgb(55, 131, 243)',
    borderLeftWidth: 5,
    borderRightWidth: 5,
    borderTopWidth: 10,
  },
});

export default TemperatureControl;
