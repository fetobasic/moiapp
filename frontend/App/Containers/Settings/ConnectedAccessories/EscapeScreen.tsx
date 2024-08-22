import React, { useState } from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { ApplicationStyles, Colors, Fonts, Metrics } from 'App/Themes';
import {
  Button,
  CustomDropdown,
  HeaderSimple as Header,
  InformationRow as Row,
  SectionWithTitle,
  StyledRangeSlider,
} from 'App/Components';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { SettingsStackParamList } from 'App/Types/NavigationStackParamList';
import { format } from 'date-fns';
import { useDispatch, useSelector } from 'react-redux';
import { getCurrentDevice } from 'App/Store/Devices/selectors';
import { navigationGoBack } from 'App/Navigation/AppNavigation';
import BrightnessLessIcon from 'App/Images/Icons/brightnessLess.svg';
import BrightnessMoreIcon from 'App/Images/Icons/brightnessMore.svg';
import { WithTopBorder } from 'App/Hoc';
import { devicesActions } from 'App/Store/Devices';
import { update } from 'App/Services/ConnectionControler';
import { Yeti6GState } from 'App/Types/Yeti';

type Props = NativeStackScreenProps<SettingsStackParamList, 'EscapeScreen'>;

const timeouts = [
  { value: 30, label: '30 Seconds' },
  { value: 60, label: '1 Minute' },
  { value: 300, label: '5 Minutes' },
  { value: 900, label: '15 Minutes' },
  { value: 1800, label: '30 Minutes' },
  { value: 3600, label: '1 Hour' },
  { value: 0, label: 'Never' },
];

const EscapeScreen = ({ navigation, route }: Props) => {
  const { id } = route.params.escapeScreen;
  const device = useSelector(getCurrentDevice(route.params.device.thingName || '')) as Yeti6GState;
  const [brightness, setBrightness] = useState(device?.config?.xNodes[id]?.dsp?.brt || 0);
  const [isChanged, setChanged] = useState<boolean>(false);
  const dispatch = useDispatch();
  const [timeout, setTimeout] = useState<(typeof timeouts)[number]>(
    timeouts.find((item) => item.value === device?.config?.xNodes[id]?.dsp?.tOut) || { value: 0, label: 'Never' },
  );

  const onSaveHandler = () => {
    update({
      thingName: device.thingName || '',
      method: 'config',
      // @ts-ignore TODO: we need to use complex and recursive Partial generic of stateObject type
      stateObject: { state: { desired: { xNodes: { [id]: { dsp: { tOut: timeout?.value, brt: brightness } } } } } },
      isDirectConnection: Boolean(device?.isDirectConnection),
      updateDeviceState: (_thingName, data) =>
        dispatch(devicesActions.devicesAddUpdate.request({ thingName: _thingName, data })),
    });

    //update local state via dispatch action, temporary solution to reflect changes on the screen sooner
    dispatch(
      devicesActions.devicesAddUpdate.request({
        thingName: device.thingName || '',
        data: {
          config: {
            // @ts-ignore TODO: we need to use complex and recursive Partial generic of Yeti6GState type
            xNodes: {
              [id]: {
                dsp: {
                  tOut: timeout?.value,
                  brt: brightness,
                },
              },
            },
          },
        },
      }),
    );
    setChanged(false);
    navigationGoBack();
  };

  const onLimitChangeHandler = (backup: number, _: any, fromUser: boolean) => {
    if (!fromUser) {
      return;
    }
    setBrightness(backup);
  };

  return (
    <View style={ApplicationStyles.mainContainer}>
      <Header
        title="Escape Screen"
        isChangeSaved={isChanged}
        cbSave={onSaveHandler}
        subTitle={
          device?.device?.xNodes[id]?.tConn ? format(device?.device?.xNodes[id]?.tConn * 1000, "h:mm bbb 'on' PP") : ''
        }
      />
      <ScrollView style={styles.container}>
        <SectionWithTitle>
          <Row title="Model" description="Escape Screen" descriptionStyle={{ color: Colors.gray }} />
          <Row
            title="Firmware Version"
            subTitle="Updated by Yeti."
            description={`Version ${device?.device?.xNodes[id]?.fw}`}
            descriptionStyle={{ color: Colors.gray }}
          />
        </SectionWithTitle>
        <Row
          contentStyle={styles.inputLimits}
          title="Power+ Input Limit"
          description={`${device?.config?.ports?.acIn?.plus?.aLmt} amps`}
          onPress={() => navigation.navigate('PowerInputLimit', { device })}
        />
        <WithTopBorder>
          <Text style={Fonts.font.base.bodyTwo}>
            <Text style={ApplicationStyles.textGreen}>{brightness}%</Text> - Brightness
          </Text>
          <View style={styles.sliderWrapper}>
            <BrightnessLessIcon />
            <StyledRangeSlider disableRange onValueChanged={onLimitChangeHandler} low={brightness} />
            <BrightnessMoreIcon />
          </View>
        </WithTopBorder>
        <CustomDropdown
          containerStyle={styles.dropDown}
          placeholder="Screen Timeout"
          data={timeouts}
          header="Screen Timeout"
          value={timeout}
          onChange={(item) => {
            setTimeout(item as (typeof timeouts)[number]);
            setChanged(true);
          }}
        />
      </ScrollView>
      <Button style={styles.saveBtn} title="SAVE" onPress={onSaveHandler} />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: Metrics.marginSection,
    paddingVertical: Metrics.halfMargin,
  },
  sliderWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  dropDown: {
    marginTop: Metrics.halfMargin,
  },
  inputLimits: {
    marginBottom: 4,
  },
  saveBtn: {
    marginHorizontal: Metrics.baseMargin,
    marginVertical: Metrics.marginSection,
  },
});

export default EscapeScreen;
