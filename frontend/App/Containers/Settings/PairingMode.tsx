import React from 'react';
import { View, ScrollView, Text, StyleSheet, Image, Pressable } from 'react-native';
import { DrawerNavigationHelpers } from '@react-navigation/drawer/src/types';
import { ApplicationStyles, Fonts, Metrics } from 'App/Themes';
import { HeaderSimple as Header } from 'App/Components';
import { useFeatureFlagWithPayload } from 'posthog-react-native';
import { env } from 'App/Config/AppConfig';
import Information from 'App/Images/Icons/information.svg';
import renderElement from 'App/Services/RenderElement';
import Row from 'App/Components/Pairing/InfoRow';
import { WithTopBorder } from 'App/Hoc';
import {
  FridgeFreezerDeviceList,
  Yeti300500700DeviceList,
  YetiLithiumDeviceList,
  YetiPRODeviceList,
  YetiXDeviceList,
  Yeti100015002000DeviceList,
} from 'App/Config/PairingHelp';

type Props = {
  navigation: DrawerNavigationHelpers;
};

const MARGINS = 70;
const ITEM_WIDTH = (Metrics.screenWidth - MARGINS) / 2;

const devicesList = [
  ...Yeti300500700DeviceList.reverse(),
  ...Yeti100015002000DeviceList.reverse(),
  ...YetiPRODeviceList,
  ...YetiXDeviceList,
  ...YetiLithiumDeviceList,
  ...FridgeFreezerDeviceList,
];

const PairingMode = ({ navigation }: Props) => {
  const [isFeatureEnabled, unsupportedModels] = useFeatureFlagWithPayload(`${env}-restricted-pairing-models`);
  return (
    <View style={ApplicationStyles.mainContainer}>
      <Header title="Pairing Mode" />
      <ScrollView style={styles.container}>
        <Row
          withBorder={false}
          icon={renderElement(<Information />)}
          title="Set Device"
          subTitle="Different devices have different pairing mode instructions."
        />
        <View style={styles.devices}>
          {devicesList.map((item) =>
            isFeatureEnabled && unsupportedModels?.[item.value] ? null : (
              <Pressable style={styles.device} onPress={() => navigation.navigate('PairingModeHelp', { device: item })}>
                <WithTopBorder contentStyle={styles.inner}>
                  <View style={styles.deviceIcon}>
                    <Image style={item.width ? { width: item.width } : {}} source={item.icon} resizeMode="contain" />
                  </View>
                  <Text numberOfLines={2} style={styles.name}>
                    {item.label}
                  </Text>
                </WithTopBorder>
              </Pressable>
            ),
          )}
        </View>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: Metrics.baseMargin,
    marginVertical: Metrics.marginSection,
  },
  sectionTitle: {
    ...Fonts.font.base.caption,
  },
  devices: {
    marginRight: -Metrics.halfMargin,
    marginTop: Metrics.smallMargin,
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  device: {
    marginRight: Metrics.smallMargin,
    alignItems: 'center',
  },
  inner: {
    width: ITEM_WIDTH,
    height: 170,
  },
  deviceIcon: {
    height: 100,
    justifyContent: 'center',
    alignItems: 'center',
  },
  name: {
    ...Fonts.font.base.bodyOne,
    textAlign: 'center',
  },
});

export default PairingMode;
