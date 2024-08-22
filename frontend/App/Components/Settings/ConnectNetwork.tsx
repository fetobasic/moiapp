import React, { useMemo, useState } from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { ApplicationStyles, Colors, Fonts, Metrics } from 'App/Themes';
import {
  ModalWindow,
  Pressable,
  SectionWithTitle,
  SingleRadioButton,
  TextInput,
  TextInputPassword,
  Radar,
} from 'App/Components';
import Row from 'App/Components/Pairing/InfoRow';
import renderElement from 'App/Services/RenderElement';
import Information from 'App/Images/Icons/information.svg';
import { getWifiLevelIcon } from 'App/Services/Yeti';
import { useDispatch } from 'react-redux';
import { useAppSelector, useMount } from 'App/Hooks';
import { Bluetooth } from 'App/Containers/Home/HomeScreen';
import { wifiActions } from 'App/Store/WifiList';
import AppConfig from 'App/Config/AppConfig';
import { WiFiList } from 'App/Types/Yeti';
import { DeviceType } from 'App/Types/Devices';

type Props = {
  onClose: () => void;
  onConnect: (params: { ssid: string; pass: string | null | undefined }) => void;
  peripheralId: string;
  deviceType: DeviceType;
  connectedSSID?: { name?: string; db: number };
};

const ConnectNetwork = ({ onClose, onConnect, peripheralId, deviceType, connectedSSID }: Props) => {
  const dispatch = useDispatch();
  const { wifiList, isBluetoothConnect } = useAppSelector((state) => ({
    wifiList: state.yetiWifiList.data || [],
    isBluetoothConnect: state.application.dataTransferType === 'bluetooth',
  }));
  const savedWiFi = useMemo(() => {
    const list = wifiList?.filter((item) => item?.saved);

    if (list.length === 0 && connectedSSID?.name && connectedSSID?.name !== '?') {
      list.push({ name: connectedSSID.name, saved: true, db: connectedSSID.db });
    }

    return list;
  }, [connectedSSID, wifiList]);

  const [selectedWiFi, setSelectedWiFi] = useState<WiFiList | string | null>(savedWiFi.length ? savedWiFi[0] : null);
  const [passwordWiFi, setPasswordWiFi] = useState<string | undefined>(undefined);
  const [showPasswordField, setShowPasswordField] = useState<boolean>(false);
  const [showManuallyFields, setShowManuallyFields] = useState<boolean>(false);
  const isSelectedWiFiObject = typeof selectedWiFi === 'object';

  let timerId: NodeJS.Timeout;

  const stopWiFiRefreshing = () => {
    clearTimeout(timerId);
    dispatch(wifiActions.clearWifiList());
  };

  const loadWifiList = isBluetoothConnect
    ? () => Bluetooth.getWifiList(peripheralId, deviceType, true)
    : () => dispatch(wifiActions.wifi.request());

  useMount(() => {
    dispatch(wifiActions.clearWifiList());
    timerId = setInterval(loadWifiList, AppConfig.refreshWifiTimeout);

    return () => stopWiFiRefreshing();
  });

  const onCloseHandler = () => {
    setPasswordWiFi(undefined);
    if (showManuallyFields) {
      setShowManuallyFields(false);
      return;
    }

    if (showPasswordField) {
      setShowPasswordField(false);
      return;
    }

    onClose();
    stopWiFiRefreshing();
  };

  const onContinueHandler = async () => {
    stopWiFiRefreshing();
    if (selectedWiFi && (passwordWiFi || (isSelectedWiFiObject && selectedWiFi?.saved))) {
      setShowPasswordField(false);
      onClose();

      onConnect({
        ssid: isSelectedWiFiObject ? selectedWiFi?.name : selectedWiFi,
        pass: isSelectedWiFiObject && selectedWiFi?.saved ? null : passwordWiFi,
      });
    } else {
      setShowPasswordField(true);
    }
  };

  const disableSaveBtn = useMemo(() => {
    return (
      (isSelectedWiFiObject ? !selectedWiFi?.saved : !selectedWiFi) &&
      (showPasswordField || showManuallyFields) &&
      !passwordWiFi
    );
  }, [isSelectedWiFiObject, passwordWiFi, selectedWiFi, showManuallyFields, showPasswordField]);

  return (
    <ModalWindow
      title="Connect Network"
      titleActiveBtn="Continue"
      onSave={onContinueHandler}
      onClose={onCloseHandler}
      disableSaveBtn={disableSaveBtn}
      fullHeight>
      {showManuallyFields ? (
        <View style={styles.container}>
          <TextInput
            value={isSelectedWiFiObject ? selectedWiFi?.name : selectedWiFi}
            containerStyle={styles.manuallyInput}
            placeholder="Name"
            onChangeText={(value: string) => setSelectedWiFi(value)}
          />
          <TextInputPassword
            value={passwordWiFi ?? ''}
            iconStyle={styles.iconStyle}
            containerStyle={styles.manuallyInput}
            placeholder="Password"
            autoCapitalize="none"
            onChangeText={(value: string) => setPasswordWiFi(value)}
          />
        </View>
      ) : (
        <>
          <ScrollView
            style={styles.container}
            contentContainerStyle={styles.scrollContent}
            scrollEnabled={!showPasswordField}>
            <Row
              withBorder={false}
              icon={renderElement(<Information />)}
              title="Enter Network"
              subTitle="You are paired to your Goal Zero device. Now you will connect to your network."
            />
            {showPasswordField ? (
              <TextInputPassword
                placeholder="Password"
                value={passwordWiFi ?? ''}
                autoCapitalize="none"
                onChangeText={(value) => setPasswordWiFi(value)}
              />
            ) : (
              <>
                {!!savedWiFi.length && (
                  <SectionWithTitle title="My Saved Networks">
                    {savedWiFi.map((item) => (
                      <View>
                        <SingleRadioButton
                          containerStyle={styles.radioBtn}
                          title={item.name}
                          checked={isSelectedWiFiObject && selectedWiFi?.name === item.name}
                          onPress={() => setSelectedWiFi(item)}
                          rightIcon={getWifiLevelIcon(item.db)}
                        />
                        {isSelectedWiFiObject && selectedWiFi?.name === item.name && (
                          <Pressable
                            testID="changePwdSection"
                            style={styles.changePwdSection}
                            onPress={() => setShowPasswordField(true)}>
                            <Text style={styles.changePwdText}>Change saved password</Text>
                          </Pressable>
                        )}
                      </View>
                    ))}
                  </SectionWithTitle>
                )}
                <SectionWithTitle title="Other Networks">
                  {!wifiList.length ? (
                    <View style={styles.radarWrapper}>
                      <Radar isWiFi isScanning onPress={() => {}} isCompleted={false} />
                    </View>
                  ) : (
                    wifiList.map(
                      (item) =>
                        !item.saved && (
                          <SingleRadioButton
                            key={item.name}
                            containerStyle={styles.radioBtn}
                            title={item.name}
                            checked={isSelectedWiFiObject && selectedWiFi?.name === item.name}
                            onPress={() => setSelectedWiFi(item)}
                            rightIcon={getWifiLevelIcon(item.db)}
                          />
                        ),
                    )
                  )}
                </SectionWithTitle>
              </>
            )}
          </ScrollView>
          {!showPasswordField && (
            <Pressable
              testID="connectNetworkManually"
              style={styles.networkHelp}
              onPress={() => {
                setShowManuallyFields(true);
                setSelectedWiFi(null);
              }}>
              <Text style={Fonts.font.base.bodyOne}>
                Don't see your network? <Text style={ApplicationStyles.textGreen}> Enter Network Manually</Text>
              </Text>
            </Pressable>
          )}
        </>
      )}
    </ModalWindow>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: Metrics.baseMargin,
    paddingVertical: Metrics.marginSection,
  },
  scrollContent: {
    paddingBottom: 50,
  },
  networkHelp: {
    flexDirection: 'row',
    justifyContent: 'center',
    position: 'relative',
    top: 20,
  },
  manuallyInput: {
    marginBottom: Metrics.halfMargin,
  },
  iconStyle: {
    bottom: 17,
  },
  radioBtn: {
    padding: 0,
  },
  radarWrapper: {
    alignItems: 'center',
    paddingVertical: Metrics.baseMargin,
  },
  changePwdSection: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    alignItems: 'center',
    marginBottom: 4,
    marginRight: Metrics.smallMargin,
  },
  changePwdText: {
    ...Fonts.font.base.caption,
    color: Colors.green,
  },
});

export default ConnectNetwork;
