import React, { useMemo } from 'react';
import { View, Text, StyleSheet } from 'react-native';

import ArrowRightIcon from 'App/Images/Icons/arrowRight.svg';
import ArrowRightDisabled from 'App/Images/Icons/arrowRightDisabled.svg';
import { getDefaultProfile, getProfileNameBySetup } from 'App/Services/ChargingProfile';
import { Pressable, SimpleSlider } from 'App/Components';
import { Colors, Fonts, Metrics } from 'App/Themes';
import { Yeti6GState, YetiState } from 'App/Types/Yeti';
import { isLegacyYeti } from 'App/Services/Yeti';
import { DeviceState } from 'App/Types/Devices';

type Props = {
  device: DeviceState;
  onPress: () => void;
  isDisabled?: boolean;
};

function YetiChargeProfile({ device, onPress, isDisabled }: Props) {
  let setup: Record<string, number> = {};
  const yetiLegacy = device as YetiState;
  const yeti6G = device as Yeti6GState;

  if (isLegacyYeti(device.thingName)) {
    setup.value = yetiLegacy.socPercent || 0;
    setup.re = yetiLegacy.chargeProfile?.re || 0;
    setup.min = yetiLegacy.chargeProfile?.min || 0;
    setup.max = yetiLegacy.chargeProfile?.max || 100;
    setup.wh = yetiLegacy.whStored || 0;
  } else {
    setup.value = yeti6G?.status?.batt?.soc || 0;
    setup.re = yeti6G?.config?.chgPrfl?.rchg || 0;
    setup.min = yeti6G?.config?.chgPrfl?.min || 0;
    setup.max = yeti6G?.config?.chgPrfl?.max || 100;
    setup.wh = Number(((yeti6G?.device?.batt?.whCap || 0) * (setup.value / 100)).toFixed(0)) || 0;
  }

  const chargeProfile = useMemo(
    () => getDefaultProfile(getProfileNameBySetup({ min: setup.min, max: setup.max, re: setup.re })),
    [setup.max, setup.min, setup.re],
  );

  return (
    <Pressable testID="yetiChargeProfile" style={styles.container} onPress={onPress}>
      <View style={styles.sectionTop}>
        <Text
          style={[
            styles.textHeader,
            isDisabled ? styles.disabledText : styles.activeText,
          ]}>{`Charge Profile (${chargeProfile?.title})`}</Text>
        {isDisabled ? <ArrowRightDisabled /> : <ArrowRightIcon />}
      </View>
      <View style={styles.sliderContainer}>
        <SimpleSlider isDisabled={isDisabled} min={setup.min || 0} max={setup.max || 100} value={setup.value || 0} />
        <View
          style={[
            styles.rechargePointMarker,
            { left: `${setup.re}%`, backgroundColor: isDisabled ? Colors.disabled : Colors.blue },
          ]}
        />
      </View>
      <View style={styles.sectionInfo}>
        <Text style={[styles.textValue, isDisabled ? styles.disabledText : styles.activeText]}>
          Min: <Text style={isDisabled ? styles.disabledText : styles.greenText}>{setup.min}%</Text>
        </Text>
        <Text style={[styles.textValue, isDisabled ? styles.disabledText : styles.activeText]}>
          Recharge: <Text style={isDisabled ? styles.disabledText : styles.blueText}>{setup.re}%</Text>
        </Text>
        <Text style={[styles.textValue, isDisabled ? styles.disabledText : styles.activeText]}>
          Max: <Text style={isDisabled ? styles.disabledText : styles.greenText}>{setup.max}%</Text>
        </Text>
      </View>
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
  sectionInfo: {
    flexDirection: 'row',
    marginTop: Metrics.smallMargin,
    justifyContent: 'space-between',
  },
  textHeader: {
    ...Fonts.font.base.caption,
    flex: 1,
  },
  activeText: {
    color: Colors.transparentWhite('0.87'),
  },
  disabledText: {
    color: Colors.disabled,
  },
  greenText: {
    color: Colors.green,
  },
  blueText: {
    color: Colors.blue,
  },
  textValue: {
    ...Fonts.font.base.caption,
  },
  textEnergy: {
    ...Fonts.font.base.bodyOne,
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
  rechargePointMarker: {
    position: 'absolute',
    height: 16,
    width: 1,
  },
});

export default YetiChargeProfile;
