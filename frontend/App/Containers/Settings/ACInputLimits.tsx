import React, { useMemo } from 'react';
import { View, StyleSheet, Text, ScrollView } from 'react-native';
import { ApplicationStyles, Colors, Fonts, Metrics } from 'App/Themes';
import { HeaderSimple as Header, InformationRow, Pressable, SectionWithTitle } from 'App/Components';
import renderElement from 'App/Services/RenderElement';
import Information from 'App/Images/Icons/information.svg';
import Row from 'App/Components/Pairing/InfoRow';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { SettingsStackParamList } from 'App/Types/NavigationStackParamList';
import { useSelector } from 'react-redux';
import { getCurrentDevice } from 'App/Store/Devices/selectors';
import HelpIcon from 'App/Images/Icons/help.svg';
import SocketIcon from 'App/Images/Icons/socket.svg';
import RvSocketIcon from 'App/Images/Icons/rvSocket.svg';
import { Yeti6GState } from 'App/Types/Yeti';
import { getPowerLimits } from 'App/Services/ACInverter';
import { isYeti20004000 } from 'App/Services/ThingHelper';
import { useAppSelector } from 'App/Hooks';
import { convertTemperature } from 'App/Services/ConvertTemperature';

type Props = NativeStackScreenProps<SettingsStackParamList, 'AcInputLimits'>;

const AcInputLimits = ({ navigation, route }: Props) => {
  const { thingName } = route.params;
  const device = useSelector(getCurrentDevice(thingName || '')) as Yeti6GState;
  const { temperature } = useAppSelector((state) => ({
    temperature: state.application.units.temperature,
  }));

  const showAdditionalInfo = isYeti20004000(device);
  const { maxLimitA, maxLimitW } = getPowerLimits(device);

  const wattsRate = useMemo(
    () => device?.config?.inv?.v ?? maxLimitW / maxLimitA,
    [device?.config?.inv?.v, maxLimitA, maxLimitW],
  );
  const wallInputPortLimit = useMemo(
    () => device?.config?.ports?.acIn?.wall?.aLmt ?? 0,
    [device?.config?.ports?.acIn?.wall?.aLmt],
  );
  const wallBatteryChargeLimit = useMemo(
    () => device?.config?.ports?.acIn?.wall?.aChgLmt ?? 0,
    [device?.config?.ports?.acIn?.wall?.aChgLmt],
  );
  const plusInputPortLimit = useMemo(
    () => device?.config?.ports?.acIn?.wall?.aLmt ?? 0,
    [device?.config?.ports?.acIn?.wall?.aLmt],
  );
  const plusBatteryChargeLimit = useMemo(
    () => device?.config?.ports?.acIn?.wall?.aChgLmt ?? 0,
    [device?.config?.ports?.acIn?.wall?.aChgLmt],
  );

  const isLowLimit = useMemo(() => !device?.status?.ports?.acIn?.hLmt, [device?.status?.ports?.acIn?.hLmt]);

  return (
    <View style={ApplicationStyles.mainContainer}>
      <Header
        title="AC Inverter/Charger"
        rightSection={renderElement(
          <Pressable onPress={() => navigation.navigate('InputLimitsHelp')}>
            <HelpIcon />
          </Pressable>,
        )}
      />
      <ScrollView style={styles.container}>
        <Row
          containerWBStyle={styles.row}
          withBorder={false}
          icon={renderElement(<Information />)}
          titleTextStyles={styles.textTitle}
          title="If the AC Profile does not match the AC source, AC power pass-through stops and the battery is used as the power source."
        />
        <SectionWithTitle title="AC Profile">
          <InformationRow title="Voltage" description={`${device?.config?.inv?.v ?? 0} V`} style={styles.border} />
          <InformationRow title="Frequency" description={`${device?.config?.inv?.hz ?? 0} Hz`} />
        </SectionWithTitle>

        {showAdditionalInfo && (
          <SectionWithTitle containerStyle={styles.sectionInverterTemperature}>
            <InformationRow
              title="Inverter Temperature"
              description={convertTemperature(temperature, device?.status?.inv?.cTmp ?? 0, false, true)}>
              <Text style={styles.textDisabled}>Power electronics temperature</Text>
            </InformationRow>
          </SectionWithTitle>
        )}

        <SectionWithTitle title="Limits">
          <InformationRow
            title="AC Limit Setting"
            description={isLowLimit ? 'LOW (Custom)' : 'HIGH'}
            descriptionStyle={isLowLimit ? styles.lowLimit : styles.textDisabled}>
            <Text style={styles.textDescription}>
              The AC Limit Setting can only be changed on the Yeti device. The limits can be customized in the app when
              this is set to LOW.
            </Text>
          </InformationRow>
          <InformationRow
            title="AC Charge Port"
            titleStyle={!isLowLimit ? styles.textDisabled : undefined}
            addLeftIcon={<SocketIcon style={styles.socketIcon} color={isLowLimit ? Colors.green : Colors.disabled} />}
            rightIconStyle={!isLowLimit ? styles.sectionDisabled : undefined}
            pressableStyle={!isLowLimit ? styles.pressableDisabled : undefined}
            onPress={() => (isLowLimit ? navigation.navigate('AcChargeInputLimit', { device }) : () => {})}>
            <View>
              <View style={styles.postsDescription}>
                <Text style={[styles.textDescription, ApplicationStyles.flex]}>Input Port Limit</Text>
                <Text style={styles.textDescription}>
                  About {wallInputPortLimit}A / {wattsRate * wallInputPortLimit}W
                </Text>
              </View>
              <View style={styles.postsDescription}>
                <Text style={[styles.textDescription, ApplicationStyles.flex]}>Battery Charge Limit</Text>
                <Text style={styles.textDescription}>
                  About {wallBatteryChargeLimit}A / {wattsRate * wallBatteryChargeLimit}W
                </Text>
              </View>
            </View>
          </InformationRow>
          {showAdditionalInfo && (
            <InformationRow
              title="Power+ Port"
              titleStyle={!isLowLimit ? styles.textDisabled : undefined}
              addLeftIcon={
                <RvSocketIcon style={styles.socketIcon} color={isLowLimit ? Colors.green : Colors.disabled} />
              }
              rightIconStyle={!isLowLimit ? styles.sectionDisabled : undefined}
              pressableStyle={!isLowLimit ? styles.pressableDisabled : undefined}
              onPress={() => (isLowLimit ? navigation.navigate('PowerInputLimit', { device }) : () => {})}>
              <View>
                <View style={styles.postsDescription}>
                  <Text style={[styles.textDescription, ApplicationStyles.flex]}>Input Port Limit</Text>
                  <Text style={styles.textDescription}>
                    About {plusInputPortLimit}A / {wattsRate * plusInputPortLimit}W
                  </Text>
                </View>
                <View style={styles.postsDescription}>
                  <Text style={[styles.textDescription, ApplicationStyles.flex]}>Battery Charge Limit</Text>
                  <Text style={styles.textDescription}>
                    About {plusBatteryChargeLimit}A / {wattsRate * plusBatteryChargeLimit}W
                  </Text>
                </View>
              </View>
            </InformationRow>
          )}
        </SectionWithTitle>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: Metrics.baseMargin,
    paddingVertical: Metrics.marginSection,
  },
  row: {
    paddingVertical: 2,
  },
  textTitle: {
    ...Fonts.font.base.bodyOne,
  },
  textDescription: {
    ...Fonts.font.base.caption,
    color: Colors.disabled,
  },
  textDisabled: {
    color: Colors.disabled,
  },
  sectionDisabled: {
    opacity: 0.5,
  },
  pressableDisabled: {
    opacity: 1,
  },
  border: {
    borderBottomColor: Colors.border,
    borderBottomWidth: 1,
  },
  lowLimit: {
    color: Colors.green,
  },
  socketIcon: {
    marginLeft: -Metrics.smallMargin,
    marginRight: Metrics.smallMargin,
  },
  postsDescription: {
    flexDirection: 'row',
    marginRight: Metrics.smallMargin,
    marginTop: 2,
  },
  sectionInverterTemperature: {
    paddingTop: 0,
  },
});

export default AcInputLimits;
