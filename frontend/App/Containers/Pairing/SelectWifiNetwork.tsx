import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { enableForceWifiUsage, disableForceWifiUsage } from 'App/Services/AndroidWifi';
import { useIsFocused } from '@react-navigation/native';

import {
  Button,
  HeaderSimple as Header,
  InfoRow,
  Pressable,
  Radar,
  RadioButtons,
  SectionWithTitle,
} from 'App/Components';

import { ApplicationStyles, Colors, Fonts, isAndroid, Metrics } from 'App/Themes';
import { PairingStackParamList } from 'App/Types/NavigationStackParamList';
import renderElement from 'App/Services/RenderElement';

import { useAppDispatch, useAppSelector, useMount, usePairingNavigation, usePrevious } from 'App/Hooks';
import AppConfig from 'App/Config/AppConfig';
import { wifiActions } from 'App/Store/WifiList';
import { Bluetooth } from 'App/Containers/Home/HomeScreen';
import { getWifiListSection } from 'App/Transforms/wifiListSection';
import { WiFiList } from 'App/Types/Yeti';
import InfoIcon from 'App/Images/Icons/information.svg';
import AttentionIcon from 'App/Images/Icons/attention.svg';
import { getWifiLevelIcon } from 'App/Services/Yeti';
import { showConfirm } from 'App/Services/Alert';
import { DeviceInfo, DeviceType } from 'App/Types/Devices';

const WiFiConnectionDescription = ({ showConnectedNetwork }: { showConnectedNetwork: boolean }) => {
  return showConnectedNetwork ? (
    <>
      <Text style={styles.textBody}>
        Would you like to continue with this connected network or scan for new network?
      </Text>
      <Text style={styles.textBody}>
        <Text style={styles.textHighlight}>Note</Text>: The device will disconnect and be offline while scanning for a
        new network.
      </Text>
    </>
  ) : (
    <>
      <Text style={styles.textBody}>
        You are paired to your Goal Zero device. Now you will provide the info to connect to your network.
      </Text>
      <Text style={styles.textBody}>
        <Text style={styles.textHighlight}>Note</Text>: The device Wi-Fi icon or light on the display will be solid when
        cloud connected.
      </Text>
    </>
  );
};

type Props = NativeStackScreenProps<PairingStackParamList, 'SelectWifiNetwork'>;

function SelectWifiNetwork({ route }: Props) {
  const dispatch = useAppDispatch();
  const navigation = usePairingNavigation('SelectWifiNetwork');
  const { wifiList } = useAppSelector((state) => ({
    wifiList: state.yetiWifiList.data,
  }));
  const [showConnectedNetwork, setShowConnectedNetwork] = useState(false);
  const [connectedNetwork, setConnectedNetwork] = useState<{ ssid: string; rssi: number } | undefined>();
  const isFocused = useIsFocused();
  const prevIsFocused = usePrevious(isFocused);

  const refreshWifiTimerId = useRef<NodeJS.Timeout>();

  const [selectedWiFi, setSelectedWiFi] = useState<WiFiList>();
  const sectionWifiList = useMemo(() => getWifiListSection(wifiList), [wifiList]);

  const completeWifiRefreshing = useCallback(() => {
    if (refreshWifiTimerId.current) {
      clearTimeout(refreshWifiTimerId.current);
      refreshWifiTimerId.current = undefined;
    }

    dispatch(wifiActions.clearWifiList());
  }, [dispatch]);

  const loadWifiWithRefresh = useCallback(
    async (load: () => Promise<void>) => {
      if (refreshWifiTimerId.current) {
        clearTimeout(refreshWifiTimerId.current);
        refreshWifiTimerId.current = undefined;
      }

      if (!isFocused) {
        return;
      }

      const result: any = await load();

      //if result is Bluetooth.responseError, then we need to show error message to user
      if (result?.ok === false) {
        showConfirm(
          'Unable to connect to Yeti bluetooth',
          'Check Yeti, make sure bluetooth is turned on.',
          () => {
            loadWifiWithRefresh(load);
          },
          {
            cancelTitle: 'Back',
            confirmTitle: 'Try Again',
          },
          () => {
            navigation.navigate('AddNewDevice');
          },
          false,
          <AttentionIcon />,
        );

        return;
      }

      if (result?.skipConnectToWifi) {
        setShowConnectedNetwork(true);

        const data = result?.data as DeviceInfo;
        setConnectedNetwork({
          ssid: data?.iot?.sta?.wlan?.ssid || '',
          rssi: data?.iot?.sta?.wlan?.rssi || 0,
        });

        return;
      }

      refreshWifiTimerId.current = setTimeout(() => {
        loadWifiWithRefresh(load);
      }, AppConfig.refreshWifiTimeout);
    },
    [isFocused, navigation],
  );

  const fetchData = useCallback(
    (skipCheckToConnectToCloud = false) => {
      const isBluetoothConnect = route.params.dataTransferType === 'bluetooth';
      dispatch(wifiActions.clearWifiList());

      if (!isBluetoothConnect) {
        enableForceWifiUsage();
      }

      const loadWifiList = isBluetoothConnect
        ? () =>
            Bluetooth.getWifiList(
              route.params?.device?.id || '',
              route.params?.deviceType as DeviceType,
              skipCheckToConnectToCloud,
            )
        : () => dispatch(wifiActions.wifi.request());

      loadWifiWithRefresh(loadWifiList);
    },
    [dispatch, loadWifiWithRefresh, route.params.dataTransferType, route.params?.device?.id, route.params?.deviceType],
  );

  const handleContinueButton = (ssid?: string, enterPassword = false) => {
    completeWifiRefreshing();
    disableForceWifiUsage();

    if (!enterPassword && (selectedWiFi?.saved || showConnectedNetwork)) {
      const data = {
        ssid: ssid || showConnectedNetwork ? connectedNetwork?.ssid : selectedWiFi?.name,
        wifiPassword: null,
        skipConnectToWifi: showConnectedNetwork,
      };

      navigation.navigate('ConnectYeti', {
        ...route.params,
        ...data,
      });
    } else {
      navigation.navigate('EnterWifiPassword', {
        ...route.params,
        ssid: ssid || (selectedWiFi?.name as string),
      });
    }
  };

  useMount(() => {
    fetchData();

    return () => {
      disableForceWifiUsage();
      completeWifiRefreshing();
    };
  });

  useEffect(() => {
    if (isFocused && !prevIsFocused) {
      fetchData();
    }
  });

  const handleChangeWiFi = ({ value }: { value: { db: number; name: string; saved?: boolean } }) => {
    setSelectedWiFi(value);
    const isSignalLow = value.db < -75;

    if (isSignalLow) {
      showConfirm(
        value.name,
        'Signal is weak. Make sure the device is close to the router.',
        () => handleContinueButton(value.name),
        {
          cancelTitle: 'Back',
          confirmTitle: 'Continue',
        },
        () => {},
        false,
        <AttentionIcon />,
      );
    }
  };

  const renderBody = () => {
    if (showConnectedNetwork) {
      return (
        <SectionWithTitle title="Connected Network">
          <RadioButtons
            hasBorder
            data={[
              {
                value: connectedNetwork?.ssid,
                label: connectedNetwork?.ssid,
                icon: getWifiLevelIcon(connectedNetwork?.rssi),
              },
            ]}
            onChange={() => {}}
            selectedValue={{
              value: connectedNetwork?.ssid || '',
              label: connectedNetwork?.ssid || '',
            }}
          />
        </SectionWithTitle>
      );
    }

    if (sectionWifiList.length) {
      return sectionWifiList.map((section) => {
        const data = section.data.map((item) => ({
          value: item,
          label: item.name,
          icon: getWifiLevelIcon(item.db),
        }));

        return (
          <SectionWithTitle key={section.title} title={section.title}>
            <RadioButtons
              hasBorder
              data={data}
              onChange={handleChangeWiFi}
              onPasswordChangePress={(value) => handleContinueButton(value.name, true)}
              selectedValue={data.find((item) => item.label === selectedWiFi?.name) || null}
              isSaved={section.title === 'My Saved Networks'}
            />
          </SectionWithTitle>
        );
      });
    }

    return (
      <SectionWithTitle title="Networks">
        <View style={styles.radarWrapper}>
          <Radar isWiFi isScanning onPress={() => {}} isCompleted={false} />
        </View>
      </SectionWithTitle>
    );
  };

  const onBackPress = () => {
    if (route?.params?.fromSettings) {
      navigation.popToTop();
    }

    // We handle if the user is coming from the Login screen
    if (route?.params?.onSuccess) {
      navigation.pop(2);

      if (route?.params?.goBackAfterLogin) {
        return;
      }
    }

    return navigation.goBack();
  };

  return (
    <SafeAreaView edges={['bottom']} style={ApplicationStyles.mainContainer}>
      <Header title="Cloud Connect" onBackPress={onBackPress} />
      <View style={styles.container}>
        <ScrollView style={ApplicationStyles.flex} scrollEnabled={!!sectionWifiList.length}>
          <InfoRow
            style={styles.sectionTop}
            withBorder={false}
            title={showConnectedNetwork ? 'Device already connected' : 'Select Network'}
            icon={renderElement(<InfoIcon />)}
            body={renderElement(<WiFiConnectionDescription showConnectedNetwork={showConnectedNetwork} />)}
          />
          <View style={{ marginHorizontal: Metrics.baseMargin }}>{renderBody()}</View>
        </ScrollView>
        {!showConnectedNetwork && (
          <View style={styles.networkHelp}>
            <Pressable onPress={() => navigation.navigate('EnterNetworkManually', { ...route.params })}>
              <Text style={Fonts.font.base.bodyOne}>
                Don't see your network? <Text style={ApplicationStyles.textGreen}> Enter Network Manually</Text>
              </Text>
            </Pressable>
          </View>
        )}
        <View style={styles.sectionButtons}>
          {showConnectedNetwork && (
            <Button
              inverse
              style={[styles.button, styles.buttonLeft]}
              title="Scan For Network"
              onPress={() => {
                setShowConnectedNetwork(false);
                setConnectedNetwork(undefined);
                fetchData(true);
              }}
            />
          )}
          <Button
            disabled={!selectedWiFi && !showConnectedNetwork}
            inverse={!selectedWiFi && !showConnectedNetwork}
            style={[styles.button, showConnectedNetwork ? styles.buttonRight : {}]}
            title="Continue"
            onPress={handleContinueButton}
            textTitleInverseColor={Colors.background}
          />
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
    paddingBottom: isAndroid ? Metrics.baseMargin : 0,
  },
  sectionTop: {
    borderTopWidth: 0,
    paddingHorizontal: Metrics.smallMargin,
  },
  textBody: {
    marginTop: Metrics.smallMargin,
    ...Fonts.font.base.caption,
    color: Colors.white,
  },
  textHighlight: {
    color: Colors.severity.yellow,
  },
  sectionHeader: {
    ...Fonts.font.base.caption,
    color: Colors.white,
    marginTop: Metrics.halfMargin,
    marginBottom: 4,
    paddingHorizontal: Metrics.baseMargin,
  },
  networkHelp: {
    flexDirection: 'row',
    justifyContent: 'center',
    paddingTop: Metrics.halfMargin,
  },
  sectionButtons: {
    flexDirection: 'row',
  },
  button: {
    flex: 1,
    margin: Metrics.baseMargin,
  },
  buttonLeft: {
    marginRight: 6,
  },
  buttonRight: {
    marginLeft: 6,
  },
  borderedContainer: {
    marginHorizontal: 0,
  },
  radarWrapper: {
    alignItems: 'center',
    paddingVertical: Metrics.baseMargin,
  },
});

export default SelectWifiNetwork;
