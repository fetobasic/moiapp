import React, { useState } from 'react';
import { Image, ScrollView, StyleSheet, Text, View } from 'react-native';
import { ApplicationStyles, Colors, Fonts, Metrics } from 'App/Themes';
import { Button, HeaderSimple as Header } from 'App/Components';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { HelpStackParamList } from 'App/Types/NavigationStackParamList';
import Information from 'App/Images/Icons/information.svg';
import { DeviceListType, DeviceTypes } from 'App/Types/PairingType';
import Row from 'App/Components/Pairing/InfoRow';
import renderElement from 'App/Services/RenderElement';
import WiFiIcon from 'App/Images/Icons/wifiGreen.svg';
import BluetoothIcon from 'App/Images/Icons/bluetoothGreen.svg';
import CustomDropdown from 'App/Components/CustomDropdown';
import { FullDeviceList } from 'App/Config/PairingHelp';
import { useFeatureFlagWithPayload } from 'posthog-react-native';
import { env } from 'App/Config/AppConfig';

type Props = NativeStackScreenProps<HelpStackParamList, 'PairingModeHelp'>;

const yetiTitle = 'Set Yeti to Pairing Mode';
const altaTitle = 'Set Alta to Pairing Mode';

const yeti4000Info = {
  title: yetiTitle,
  subTitle:
    'If the Bluetooth/Wi-Fi icon is not active on the Yeti display, press the Pair button located on the back of the Yeti. (Shown in the diagram below.)',
};
const yeti100015002000 = {
  title: yetiTitle,
  subTitle:
    'If the Bluetooth/Wi-Fi icon is not active on the Yeti display, press the Pair button located on the back of the Yeti. (Shown in the diagram below.)',
};
const yeti300500700 = {
  title: yetiTitle,
  subTitle:
    'If the Bluetooth/Wi-Fi icon is not active on the Yeti display, press the Pair button found on the front. (Shown in the diagram below.)',
};
const alta50Info = {
  title: altaTitle,
  subTitle:
    'If the Bluetooth/Wi-Fi icon is not active on the LCD screen (located on the front of the Alta), press the Bluetooth button found on the front. (Shown in the diagram below.)',
};
const alta80Info = {
  title: altaTitle,
  subTitle:
    'If the Bluetooth/Wi-Fi icon is not active on the Alta display (located on the front of the Alta), press the Bluetooth button found on the front. (Shown in the diagram below.)',
};
const yetiLegacy = {
  title: yetiTitle,
  subTitle:
    'If the Bluetooth/Wi-Fi icon is not active on the LCD screen (located on the front of the Yeti), press the Wireless button found under the lid. (Shown in the diagram below.)',
};

const info = {
  [DeviceTypes.YETI4000]: yeti4000Info,

  [DeviceTypes.YETI1000]: yeti100015002000,
  [DeviceTypes.YETI1500]: yeti100015002000,
  [DeviceTypes.YETI2000]: yeti100015002000,

  [DeviceTypes.YETI300]: yeti300500700,
  [DeviceTypes.YETI500]: yeti300500700,
  [DeviceTypes.YETI700]: yeti300500700,

  [DeviceTypes.ALTA50]: alta50Info,
  [DeviceTypes.ALTA80]: alta80Info,

  [DeviceTypes.YETI1500X]: yetiLegacy,
  [DeviceTypes.YETI3000X]: yetiLegacy,
  [DeviceTypes.YETI6000X]: yetiLegacy,

  [DeviceTypes.YETI1400]: yetiLegacy,
  [DeviceTypes.YETI3000]: yetiLegacy,
};

type DevicesNames = keyof typeof info;

const PairingModeHelp = ({ route, navigation }: Props) => {
  const device = route.params?.device;
  const [selectedItem, setSelectedItem] = useState<DeviceListType>(device);
  const isAlta = selectedItem.value === DeviceTypes.ALTA50 || selectedItem.value === DeviceTypes.ALTA80;
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
        <CustomDropdown
          data={isFeatureEnabled ? FullDeviceList.filter((item) => !unsupportedModels?.[item.value]) : FullDeviceList}
          value={selectedItem}
          placeholder="Product"
          onChange={(item) => setSelectedItem(item as DeviceListType)}
          header="Select"
        />
        <Row
          withBorder={false}
          icon={renderElement(<Information />)}
          title={info[selectedItem.value as DevicesNames].title}
          subTitle={info[selectedItem.value as DevicesNames].subTitle}
          body={
            !isAlta
              ? renderElement(
                  <Text style={styles.description}>
                    <Text style={styles.note}>Note:</Text> If you're using a VPN or proxy, please disable it during
                    setup. Leaving it on may disrupt pairing.
                  </Text>,
                )
              : undefined
          }
        />
        <Image source={selectedItem.panelInfo} style={styles.img} resizeMode="contain" />
        {!isAlta && (
          <Row
            withBorder={false}
            icon={renderElement(
              <View style={styles.iconsWrapper}>
                <BluetoothIcon style={styles.bluetoothIcon} />
                <WiFiIcon />
              </View>,
            )}
            subTitle={
              [DeviceTypes.YETI300, DeviceTypes.YETI500, DeviceTypes.YETI700].some(
                (deviceType) => deviceType === selectedItem.value,
              )
                ? 'If the Bluetooth/Wi-Fi icon is not blinking as shown here (to the left), press and hold the Pair button (on the front) on the Yeti for 4 seconds.'
                : DeviceTypes.YETI4000 === selectedItem.value
                ? 'If the Bluetooth/Wi-Fi icon is not blinking on the Yeti display, press and hold the Pair button (on the back of the Yeti) for 3 seconds.'
                : [DeviceTypes.YETI1000, DeviceTypes.YETI1500, DeviceTypes.YETI2000].includes(selectedItem.value)
                ? 'If the Bluetooth/Wi-Fi icon is not blinking on the Yeti display, press and hold the Pair button (on the front of the Yeti) for 3 seconds.'
                : 'If the Bluetooth/Wi-Fi icon is not blinking as shown here (to the left), press and hold the Wireless button (under the lid) on the Yeti for 4 seconds.'
            }
          />
        )}
      </ScrollView>
      <Button style={styles.btn} title="OK" onPress={() => navigation.goBack()} />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: Metrics.baseMargin,
    paddingVertical: Metrics.marginSection,
  },
  dropdown: {
    marginVertical: Metrics.baseMargin,
  },
  description: {
    ...Fonts.font.base.caption,
  },
  note: {
    color: Colors.severity.yellow,
  },
  img: {
    height: 180,
    width: Metrics.screenWidth - Metrics.baseMargin * 2,
  },
  bluetoothIcon: {
    marginBottom: Metrics.smallMargin,
  },
  iconsWrapper: {
    alignItems: 'center',
    marginTop: 20,
  },
  btn: {
    paddingHorizontal: Metrics.baseMargin,
    paddingBottom: Metrics.marginSection,
    paddingTop: Metrics.smallMargin,
  },
});

export default PairingModeHelp;
