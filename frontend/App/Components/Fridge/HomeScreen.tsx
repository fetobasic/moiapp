import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';

import { Colors, Metrics } from 'App/Themes';
import { FridgeCompressorMode, FridgeBatteryProtection, FridgeState } from 'App/Types/Fridge';

import PowerSection from './PowerSection';
import TemperatureControl from './TemperatureControl';
import { FullBorderInfo } from 'App/Hoc';
import { Button, ConnectionInfo } from 'App/Components';
import { changeSettings } from 'App/Services/Bluetooth/Fridge';
import { getCurrentDevice } from 'App/Store/Devices/selectors';
import { useAppSelector } from 'App/Hooks';
import { getYetiThingName } from 'App/Services/ThingHelper';

import EcoLeafIcon from 'App/Images/Icons/ecoLeaf.svg';

function HomeFridge(_device: FridgeState = {} as FridgeState) {
  const device = useAppSelector(getCurrentDevice(getYetiThingName(_device))) as FridgeState;
  const isConnected = useMemo(() => device?.isConnected, [device?.isConnected]);

  const [compressor, setCompressor] = useState<FridgeCompressorMode>(
    device?.data?.compressorMode || FridgeCompressorMode.ECO,
  );
  const [batteryVoltage, setBatteryVoltage] = useState<FridgeBatteryProtection>(
    device?.data?.batteryProtection || FridgeBatteryProtection.MEDIUM,
  );

  const changeCompressorState = useCallback(
    async (compressorMode: FridgeCompressorMode) => {
      setCompressor(compressorMode);

      await changeSettings(device.peripheralId, {
        ...device.data,
        compressorMode,
      });
    },
    [device?.data, device?.peripheralId],
  );

  const changeBatteryVoltage = useCallback(
    async (batteryProtection: FridgeBatteryProtection) => {
      setBatteryVoltage(batteryProtection);

      await changeSettings(device.peripheralId, {
        ...device.data,
        batteryProtection,
      });
    },
    [device?.data, device?.peripheralId],
  );

  const getIconColor = useCallback(
    (isSelected: boolean) => {
      if (!isConnected && !isSelected) {
        return Colors.disabled;
      }

      return isSelected ? Colors.background : Colors.green;
    },
    [isConnected],
  );

  useEffect(() => {
    setCompressor(device?.data?.compressorMode);
  }, [device?.data?.compressorMode]);

  useEffect(() => {
    setBatteryVoltage(device?.data?.batteryProtection);
  }, [device?.data?.batteryProtection]);

  return (
    <ScrollView testID="homeScreen" style={styles.container} showsVerticalScrollIndicator={false}>
      <ConnectionInfo device={device} hideWhenConnected />

      <View style={[styles.mainSection, isConnected && styles.noPadding]}>
        <PowerSection {...device} />
        <TemperatureControl
          device={device}
          zone="left"
          title={device.deviceType === 'ALTA_80_FRIDGE' ? 'Left Zone' : 'Zone'}
        />
        {device.deviceType === 'ALTA_80_FRIDGE' && (
          <TemperatureControl device={device} title="Right Zone" zone="right" />
        )}

        <FullBorderInfo
          disabled={!isConnected}
          title="ECO Mode"
          containerStyle={styles.infoContainer}
          sectionStyle={styles.info}>
          <Button
            title="ON"
            height={40}
            disabled={!isConnected}
            icon={<EcoLeafIcon color={getIconColor(compressor === FridgeCompressorMode.ECO)} />}
            style={styles.btnEco}
            mainSectionStyle={styles.btnSection}
            inverse={compressor !== FridgeCompressorMode.ECO}
            onPress={() => changeCompressorState(FridgeCompressorMode.ECO)}
          />
          <Button
            title="OFF"
            height={40}
            disabled={!isConnected}
            mainSectionStyle={styles.btnSection}
            style={styles.btnMax}
            inverse={compressor !== FridgeCompressorMode.MAX}
            onPress={() => changeCompressorState(FridgeCompressorMode.MAX)}
          />
        </FullBorderInfo>
        <FullBorderInfo
          disabled={!isConnected}
          title="Battery Protection Mode"
          containerStyle={styles.infoContainer}
          sectionStyle={styles.info}>
          <Button
            title="HIGH"
            height={40}
            disabled={!isConnected}
            style={styles.btnHigh}
            mainSectionStyle={styles.btnSection}
            inverse={batteryVoltage !== FridgeBatteryProtection.HIGH}
            onPress={() => changeBatteryVoltage(FridgeBatteryProtection.HIGH)}
          />
          <Button
            title="MEDIUM"
            height={40}
            disabled={!isConnected}
            style={styles.btnMedium}
            mainSectionStyle={styles.btnSection}
            inverse={batteryVoltage !== FridgeBatteryProtection.MEDIUM}
            onPress={() => changeBatteryVoltage(FridgeBatteryProtection.MEDIUM)}
          />
          <Button
            title="LOW"
            height={40}
            disabled={!isConnected}
            style={styles.btnLow}
            mainSectionStyle={styles.btnSection}
            inverse={batteryVoltage !== FridgeBatteryProtection.LOW}
            onPress={() => changeBatteryVoltage(FridgeBatteryProtection.LOW)}
          />
        </FullBorderInfo>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  mainSection: {
    marginHorizontal: Metrics.baseMargin,
    marginTop: Metrics.marginSection,
  },
  noPadding: {
    marginTop: 0,
  },
  infoContainer: {
    paddingTop: 8,
    paddingBottom: 0,
    paddingLeft: 0,
  },
  info: {
    flexDirection: 'row',
    marginBottom: Metrics.halfMargin,
  },
  btnEco: {
    flex: 1,
    marginRight: 10,
  },
  btnMax: {
    flex: 1,
    marginLeft: 10,
  },
  btnHigh: {
    flex: 1,
    marginRight: 6,
  },
  btnMedium: {
    flex: 1,
    marginHorizontal: 6,
  },
  btnLow: {
    flex: 1,
    marginLeft: 6,
  },
  btnSection: {
    paddingVertical: Metrics.smallMargin,
  },
});

export default HomeFridge;
