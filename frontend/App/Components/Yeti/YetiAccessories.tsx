import React, { useCallback, useMemo } from 'react';
import { View, Text, StyleSheet } from 'react-native';

import { Yeti6GState, YetiState } from 'App/Types/Yeti';
import { Colors, Fonts, Metrics } from 'App/Themes';

import ArrowRightIcon from 'App/Images/Icons/arrowRight.svg';
import ArrowRightDisabled from 'App/Images/Icons/arrowRightDisabled.svg';
import TankIcon from 'App/Images/Icons/tanksIcon.svg';
import { Pressable, SimpleSlider } from 'App/Components';
import { isLegacyYeti } from 'App/Services/Yeti';
import { isYeti20004000 } from 'App/Services/ThingHelper';
import { Accessories } from 'App/Config/Accessory';
import { useHomeNavigation } from 'App/Hooks';
import { showReconnect } from 'App/Services/Alert';
import { DeviceState } from 'App/Types/Devices';

type Props = {
  device: DeviceState;
  onPress: () => void;
  testID?: string;
  isDisabled?: boolean;
};

function YetiAccessories({ onPress, device, testID, isDisabled }: Props) {
  const navigation = useHomeNavigation('Home');
  const settingsNavigation = useHomeNavigation('TankPro');
  const { isDirectConnection } = device;
  const device6G = device as Yeti6GState;
  const deviceLegacy = device as YetiState;
  const soh = device6G.lifetime?.batt?.soh ?? 100;
  let rem = (device6G.status?.batt?.whRem ?? deviceLegacy.whStored ?? 0) * (soh / 100);
  let cap: number = isLegacyYeti(device.thingName)
    ? parseInt(deviceLegacy?.model?.split(' ')[1] ?? '0', 10)
    : (device6G.device?.batt?.whCap ?? 1) * (soh / 100);
  const percentage = Math.min(Math.round((rem * 100) / cap), 100);

  const nodes = device6G?.device?.xNodes || {};
  const tanksData = Object.keys(nodes).reduce((acc, key) => {
    if (
      nodes[key]?.hostId?.startsWith(Accessories.TANK_PRO_4000) ||
      nodes[key]?.hostId?.startsWith(Accessories.TANK_PRO_1000)
    ) {
      return { ...acc, tanksPro: { ...acc?.tanksPro, [key]: nodes[key] } };
    }
    return acc;
  }, {} as { tanksPro: Record<string, any> });

  Object.keys(device6G.status?.xNodes || {}).reduce((acc, key) => {
    const deviceTank = tanksData?.tanksPro?.[key];
    const tankSoh = deviceTank?.soh ?? 100;
    if (deviceTank) {
      rem += (device6G.status?.xNodes[key]?.whRem ?? 0) * (tankSoh / 100);
      cap += (deviceTank?.whCap ?? 0) * (tankSoh / 100);
    }
    return acc;
  }, {});

  //get only connected tanks (tLost == 0)
  const connectedTanks = Object.entries(tanksData?.tanksPro || {}).reduce((acc, [key, value]) => {
    if (value?.tLost === 0) {
      return { ...acc, [key]: value };
    }
    return acc;
  }, {} as { tanksPro: Record<string, any> });

  const tanksColor = useMemo(() => {
    if (isDisabled) {
      return Colors.disabled;
    }
    return Object.keys(connectedTanks).length ? Colors.green : Colors.transparentWhite('0.38');
  }, [connectedTanks, isDisabled]);

  const goToStartPairing = useCallback(() => {
    navigation.navigate('StartPairing', {
      reconnect: true,
      connectionType: isDirectConnection ? 'direct' : 'cloud',
    });
  }, [isDirectConnection, navigation]);

  const goToTanks = useCallback(() => {
    if (isDisabled) {
      showReconnect(goToStartPairing);
    } else {
      settingsNavigation.navigate('TankPro', { device: device6G, tanksPro: connectedTanks });
    }
  }, [device6G, goToStartPairing, isDisabled, connectedTanks, settingsNavigation]);

  return (
    <Pressable testID="yetiAccessories" style={styles.container} onPress={onPress}>
      <View style={styles.sectionTop}>
        <Text style={styles.textHeader} testID={testID}>
          <Text
            style={[
              Fonts.font.base.caption,
              { color: isDisabled ? Colors.disabled : Colors.transparentWhite('0.87') },
            ]}>
            Battery (
            <Text style={{ color: isDisabled ? Colors.disabled : Colors.green }}>{Number(rem).toFixed(0)}</Text> /{' '}
            {Number(cap).toFixed(0)} Wh)
          </Text>
        </Text>
        {isDisabled ? <ArrowRightDisabled /> : <ArrowRightIcon />}
      </View>
      <View style={styles.sliderContainer}>
        <SimpleSlider value={percentage} isDisabled={isDisabled} />
      </View>
      {isYeti20004000(device) && (
        <Pressable onPress={goToTanks}>
          <View style={styles.sectionBottom}>
            <TankIcon fill={tanksColor} />
            <Text
              style={[styles.textEnergy, { color: isDisabled ? Colors.disabled : Colors.transparentWhite('0.87') }]}>
              Tanks
              {Object.keys(connectedTanks).length > 0 && !isDisabled && (
                <Text
                  style={[
                    styles.textEnergyValue,
                    { color: Object.keys(connectedTanks).length > 0 ? Colors.green : Colors.transparentWhite('0.38') },
                  ]}>
                  {' '}
                  - Connected
                </Text>
              )}
            </Text>
            <Text style={[styles.textEnergyValue, { color: tanksColor }]}>{Object.keys(connectedTanks).length}</Text>
          </View>
        </Pressable>
      )}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingVertical: Metrics.smallMargin,
    paddingHorizontal: Metrics.smallMargin,
  },
  sectionTop: {
    flexDirection: 'row',
    marginBottom: Metrics.halfMargin,
    alignItems: 'center',
  },
  sectionBottom: {
    flexDirection: 'row',
    paddingRight: Metrics.smallMargin,
    marginTop: Metrics.smallMargin,
    alignItems: 'center',
  },
  sectionInfo: {
    flexDirection: 'row',
    marginTop: Metrics.smallMargin,
    justifyContent: 'space-between',
  },
  textHeader: {
    ...Fonts.font.base.caption,
    flex: 1,
  },
  textValue: {
    ...Fonts.font.base.caption,
    color: Colors.transparentWhite('0.87'),
  },
  textEnergy: {
    ...Fonts.font.base.bodyOne,
    flex: 1,
  },
  textEnergyValue: {
    ...Fonts.font.base.bodyOne,
    color: Colors.green,
  },
  sliderContainer: {
    height: 16,
    width: '100%',
    alignSelf: 'center',
    alignItems: 'center',
    justifyContent: 'center',
  },
});

export default YetiAccessories;
