import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { StyleSheet, Text } from 'react-native';

import { Colors, Fonts, Metrics } from 'App/Themes';
import { WithTopBorder } from 'App/Hoc';
import { Switch } from 'App/Components';
import { FRIDGE_SWITCH_MODE, FridgeState } from 'App/Types/Fridge';

import PowerIcon from 'App/Images/Icons/power.svg';
import { modalInfo } from 'App/Services/Alert';
import { changeSettings } from 'App/Services/Bluetooth/Fridge';

function PowerSection(device: FridgeState) {
  const isConnected = useMemo(() => device?.isConnected, [device?.isConnected]);
  const [isPowerOn, setIsPowerOn] = useState(device?.data?.switch === FRIDGE_SWITCH_MODE.ON);

  useEffect(() => {
    setIsPowerOn(device?.data?.switch === FRIDGE_SWITCH_MODE.ON);
  }, [device?.data?.switch]);

  const changePowerState = useCallback(
    (switchMode: FRIDGE_SWITCH_MODE) => {
      setIsPowerOn(switchMode === FRIDGE_SWITCH_MODE.ON);

      changeSettings(device.peripheralId, {
        ...device.data,
        switch: switchMode,
      });
    },
    [device?.data, device?.peripheralId],
  );

  const iconColor = useMemo(() => {
    if (!isConnected) {
      return Colors.disabled;
    }

    return isPowerOn ? Colors.severity.green : Colors.transparentWhite('0.38');
  }, [isConnected, isPowerOn]);

  const onPress = useCallback(
    (value: boolean) => {
      if (!value) {
        modalInfo({
          title: 'Power',
          body: 'Are you sure you want to turn your fridge off?',
          type: 'INFO',
          hideIcon: true,
          buttons: [
            {
              title: 'Cancel',
              inverse: true,
            },
            {
              title: 'Turn Off',
              action: () => {
                changePowerState(FRIDGE_SWITCH_MODE.OFF);
              },
            },
          ],
        });
        return;
      }

      changePowerState(FRIDGE_SWITCH_MODE.ON);
    },
    [changePowerState],
  );

  return (
    <WithTopBorder testID="powerSection" contentStyle={styles.sectionPower}>
      <PowerIcon color={iconColor} />
      <Text style={[styles.textPower, !isConnected && styles.textDisabled]}>Power</Text>
      <Switch disabled={!isConnected} value={isPowerOn} onPress={() => onPress(!isPowerOn)} />
    </WithTopBorder>
  );
}

const styles = StyleSheet.create({
  sectionPower: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 2,
  },
  textPower: {
    flex: 1,
    ...Fonts.font.base.bodyTwo,
    color: Colors.transparentWhite('0.87'),
    marginLeft: Metrics.marginSection,
  },
  textDisabled: {
    color: Colors.disabled,
  },
});

export default PowerSection;
