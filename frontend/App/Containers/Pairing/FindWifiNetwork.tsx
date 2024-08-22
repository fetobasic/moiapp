import React, { useCallback, useRef, useState } from 'react';
import { View, ScrollView, Text, StyleSheet, Image, Linking } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import AndroidOpenSettings from 'react-native-android-open-settings';
import { NativeStackScreenProps } from '@react-navigation/native-stack';

import { HeaderSimple as Header, Button, InfoRow } from 'App/Components';
import { ApplicationStyles, Colors, Fonts, Images, isIOS, Metrics } from 'App/Themes';

import InfoIcon from 'App/Images/Icons/information.svg';
import ArrowBack from 'App/Images/Icons/arrowBack.svg';
import renderElement from 'App/Services/RenderElement';
import { useAppDispatch, usePairingNavigation } from 'App/Hooks';
import { enableForceWifiUsage } from 'App/Services/AndroidWifi';
import { showConfirm, showInfo } from 'App/Services/Alert';
import { cacheActions } from 'App/Store/Cache';
import { PairingStackParamList } from 'App/Types/NavigationStackParamList';
import DirectApi from 'App/Services/DirectApi';
import { isLegacyYeti } from 'App/Services/Yeti';
import AttentionIcon from 'App/Images/Icons/attention.svg';
import AppConfig from 'App/Config/AppConfig';

type Props = NativeStackScreenProps<PairingStackParamList, 'FindWifiNetwork'>;

const api = DirectApi.create();

function FindWifiNetwork({ route }: Props) {
  const dispatch = useAppDispatch();
  const navigation = usePairingNavigation('FindWifiNetwork');
  const isFirstRequest = useRef(true);
  const [isContinueBtnDisabled, setIsContinueBtnDisabled] = useState(true);

  const goToSettings = () => {
    if (isIOS) {
      Linking.openURL('App-Prefs:WIFI');
    } else {
      AndroidOpenSettings.wifiSettings();
    }

    setTimeout(() => {
      setIsContinueBtnDisabled(false);
    }, AppConfig.defaultDelay);
  };

  const onContinuePress = useCallback(async () => {
    enableForceWifiUsage();

    const { ok, data } = await api.getYetiInfo();

    if (data?.name && isLegacyYeti(data.name)) {
      navigation.navigate('ConnectYeti', {
        ...route.params,
        ssid: data.name,
        device: {
          thingName: data.name,
          name: data.name,
        },
        deviceType: 'YETI',
        connectionType: 'direct',
        dataTransferType: 'wifi',
      });
    } else {
      // Need to check if it's first request, because from iOS 14 we have permission request
      // and we don't want to show alert on first request
      if (!ok && isFirstRequest.current && isIOS) {
        isFirstRequest.current = false;
        return;
      }

      dispatch(cacheActions.changeAppRateInfo({ isBlockedShowAppRate: true }));

      if (data?.name && !isLegacyYeti(data.name)) {
        showInfo(
          'Your new device does not support legacy Wi-Fi.\nPlease try again using bluetooth.',
          'You have a newer device',
          () => {
            navigation.navigate('AddNewDevice');
          },
          <AttentionIcon />,
          'CONFIRM',
          'PAIR USING BLUETOOTH',
        );
      } else {
        showConfirm(
          'Connect Error',
          'We were unable to confirm connection\nto the device.',
          () => {},
          {
            cancelTitle: 'Go to settings',
            confirmTitle: 'Ok',
          },
          goToSettings,
          false,
          <AttentionIcon />,
        );
      }
    }

    isFirstRequest.current = false;
  }, [dispatch, navigation, route.params]);

  return (
    <SafeAreaView edges={['bottom']} style={ApplicationStyles.mainContainer}>
      <Header isModal title="Pair Device" leftIcon={renderElement(<ArrowBack />)} />
      <View style={ApplicationStyles.container}>
        <ScrollView showsVerticalScrollIndicator={false}>
          <InfoRow
            icon={renderElement(<InfoIcon />)}
            withBorder={false}
            title="Pair Using Device Wi-Fi"
            style={{ marginHorizontal: -Metrics.halfMargin }}
            body={renderElement(
              <>
                <Text style={styles.text}>1. Go to your phone's Wi-Fi settings.</Text>
                <Text style={styles.text}>
                  2. Select the Wi-Fi network with the name that matches the Goal Zero device you want to pair.
                </Text>
                <Text style={styles.text}>
                  <Text style={styles.textNote}>Example:</Text> Yeti9C9C1FF112
                </Text>
                <Text style={styles.text}>
                  3. Enter <Text style={{ color: Colors.green }}>"GOALZERO"</Text> when asked for a password.
                </Text>
                <Text style={styles.text}>4. Return to the Goal Zero app and continue the pairing process.</Text>
                <Text style={styles.text}>
                  <Text style={styles.textNote}>Note: </Text>After pairing, return your phone to your usual Wi-Fi
                  network.
                </Text>
              </>,
            )}
          />

          <View style={styles.imgContainer}>
            <Image
              resizeMode="contain"
              source={isIOS ? Images.selectWifiIos : Images.selectWifiAndroid}
              style={styles.img}
            />
          </View>
          <View style={styles.container}>
            <Text style={styles.textBody}>
              <Text style={[{ color: Colors.red }]}>*</Text> Newer generation Yeti models do not support Wi-Fi direct
              connect
            </Text>
          </View>
        </ScrollView>
        <View style={styles.sectionButtons}>
          <Button testID="goToSettings" style={styles.btnLeft} inverse title="Go to Settings" onPress={goToSettings} />
          <Button
            testID="onContinuePress"
            style={styles.btnRight}
            title="Continue"
            onPress={onContinuePress}
            disabled={isContinueBtnDisabled}
            inverse={isContinueBtnDisabled}
          />
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  textBody: {
    ...Fonts.font.base.bodyOne,
    color: Colors.transparentWhite('0.87'),
  },
  textHighlight: {
    color: Colors.green,
  },
  sectionButtons: {
    flexDirection: 'row',
    paddingBottom: Metrics.smallMargin,
  },
  btnLeft: {
    flex: 1,
    marginRight: Metrics.smallMargin,
  },
  btnRight: {
    flex: 1,
    marginLeft: Metrics.smallMargin,
  },
  text: {
    ...Fonts.font.base.caption,
    marginBottom: 2,
  },
  textNote: {
    color: Colors.portWarning,
    marginTop: 2,
  },
  container: {
    alignItems: 'center',
    marginTop: Metrics.baseMargin,
  },
  imgContainer: {
    borderColor: Colors.border,
    borderWidth: 2,
    borderRadius: 8,
    overflow: 'hidden',
    height: 160,
    alignItems: 'center',
  },
  img: { top: -20 },
});

export default FindWifiNetwork;
