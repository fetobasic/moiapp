import React, { useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { ApplicationStyles, Colors, Fonts, Metrics } from 'App/Themes';
import { Button, HeaderSimple as Header, InformationRow as Row, Pressable } from 'App/Components';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { SettingsStackParamList } from 'App/Types/NavigationStackParamList';
import { navigationGoBack } from 'App/Navigation/AppNavigation';
import { isTankMode } from 'App/Services/Accessory';
import { update } from 'App/Services/ConnectionControler';
import { devicesActions } from 'App/Store/Devices';
import { useDispatch } from 'react-redux';
import { ForeignAcsry, YetiState } from 'App/Types/Yeti';

type Props = NativeStackScreenProps<SettingsStackParamList, 'Link'>;

const Link = ({ route }: Props) => {
  const device = route.params.device as YetiState;
  const [mode, setMode] = useState<number>(device?.foreignAcsry?.mode || 0);
  const [isSettingChanged, setChanged] = useState<boolean>(false);
  const dispatch = useDispatch();

  const onChangeModeHandler = () => {
    setMode(isTankMode(mode) ? 1 : 0);
    setChanged(true);
  };

  const onSaveHandler = () => {
    // @ts-ignore TODO: we need to use complex and recursive Partial generic of stateObject type
    update({
      thingName: device.thingName || '',
      stateObject: { state: { desired: { foreignAcsry: { mode } as ForeignAcsry } } },
      isDirectConnection: Boolean(device?.isDirectConnection),
      updateDeviceState: (thingName, data) => dispatch(devicesActions.devicesAddUpdate.request({ thingName, data })),
    });
    navigationGoBack();
  };

  return (
    <View style={ApplicationStyles.mainContainer}>
      <Header title="Link" isChangeSaved={isSettingChanged} cbSave={onSaveHandler} />
      <View style={styles.container}>
        <Row
          style={styles.infoRow}
          textStyle={styles.textStyle}
          title="Link"
          addLeftIcon={<Text style={styles.linkIcon}>LINK</Text>}
          subTitle="The LINK connection is shown when a Link is detected on the expansion port."
          trimSubTitle={false}
        />
        <View style={styles.btnWrapper}>
          <Pressable
            style={[styles.btn, { backgroundColor: isTankMode(mode) ? Colors.green : Colors.background }]}
            onPress={onChangeModeHandler}>
            <Text style={[Fonts.font.base.button, { color: isTankMode(mode) ? Colors.black : Colors.green }]}>
              Tank Mode
            </Text>
          </Pressable>
          <Pressable
            style={[styles.btn, { backgroundColor: isTankMode(mode) ? Colors.background : Colors.green }]}
            onPress={onChangeModeHandler}>
            <Text style={[Fonts.font.base.button, { color: isTankMode(mode) ? Colors.green : Colors.black }]}>
              Car Mode
            </Text>
          </Pressable>
        </View>
        <Row
          title="Firmware Version"
          subTitle="Updated by Yeti."
          description={`Version ${device?.foreignAcsry?.firmwareVersion || 0}`}
        />
      </View>
      <Button
        style={styles.saveBtn}
        title="SAVE"
        onPress={onSaveHandler}
        disabled={!isSettingChanged}
        inverse={!isSettingChanged}
      />
    </View>
  );
};

export default Link;

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: Metrics.baseMargin,
    paddingVertical: Metrics.marginSection,
    flex: 1,
  },
  infoRow: {
    marginTop: Metrics.halfMargin,
  },
  linkIcon: {
    ...Fonts.font.base.subtitleTwo,
    marginRight: 7,
    marginTop: 4,
  },
  textStyle: {
    marginLeft: 10,
  },
  btnContainer: {
    borderRadius: 24,
  },
  btnWrapper: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    backgroundColor: Colors.background,
    borderRadius: 24,
    shadowColor: Colors.black,
    shadowOpacity: 0.2,
    shadowOffset: { width: 4, height: 4 },
    shadowRadius: 12,
    elevation: 12,
    marginVertical: Metrics.halfMargin,
  },
  btn: {
    borderRadius: 24,
    height: 48,
    width: '50%',
    alignItems: 'center',
    justifyContent: 'center',
    color: Colors.green,
  },
  saveBtn: {
    margin: Metrics.baseMargin,
  },
});
