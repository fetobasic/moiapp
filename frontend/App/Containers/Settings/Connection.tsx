import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Linking, ScrollView, StyleSheet, Text, View } from 'react-native';
import AndroidOpenSettings from 'react-native-android-open-settings';
import AwsConfig from 'aws/aws-config';
import { ApplicationStyles, Colors, Fonts, Metrics, isIOS } from 'App/Themes';
import {
  HeaderSimple as Header,
  SectionWithTitle,
  InformationRow,
  Button,
  ConnectionInfo,
  Spinner,
} from 'App/Components';
import ConnectNetwork from 'App/Components/Settings/ConnectNetwork';
import BluetoothIcon from 'App/Images/Icons/bluetooth.svg';
import { showConfirm, showError, showInfo } from 'App/Services/Alert';
import { isFridge } from 'App/Hooks/useMapDrawerData';
import { getWifiLevelIcon, isLegacyYeti } from 'App/Services/Yeti';
import { isYeti6GThing } from 'App/Services/ThingHelper';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { SettingsStackParamList } from 'App/Types/NavigationStackParamList';
import { format, parseISO } from 'date-fns';
import { getDataTitle } from 'App/Services/Date';
import { useDispatch, useSelector } from 'react-redux';
import { getCurrentDevice } from 'App/Store/Devices/selectors';
import { devicesActions } from 'App/Store/Devices';
import { update } from 'App/Services/ConnectionControler';
import { useAppSelector, useHomeNavigation, useMount, useSettingsNavigation } from 'App/Hooks';
import WiFiDirectIcon from 'App/Images/Icons/directWiFi.svg';
import { DeviceType } from 'App/Types/Devices';
import { Yeti6GConnectionCredentials, Yeti6GState, YetiConnectionCredentials, YetiState } from 'App/Types/Yeti';
import { Bluetooth } from 'App/Containers/Home/HomeScreen';
import AppConfig from 'App/Config/AppConfig';
import { isNull } from 'lodash';
import { yetiActions } from 'App/Store/Yeti';
import { wait } from 'App/Services/Wait';

type Props = NativeStackScreenProps<SettingsStackParamList, 'Connection'>;

const Connection = ({ route }: Props) => {
  const dispatch = useDispatch();
  const homeNavigation = useHomeNavigation('Settings');
  const settingsNavigation = useSettingsNavigation('Connection');
  const [isDeleting, setDeleting] = useState(false);
  const [isGoToSettings, setIsGoToSettings] = useState(false);
  const [showConnectModal, setShowConnectModal] = useState<boolean>(false);
  const device = useSelector(getCurrentDevice(route.params.device?.thingName || ''));

  const device6G = device as Yeti6GState;
  const deviceLegacy = device as YetiState;

  const { isSignedIn } = useAppSelector((state) => ({
    isSignedIn: !!state.auth.user?.email,
  }));
  const isFridgeDevice = useMemo(() => isFridge(device.deviceType), [device.deviceType]);
  const knownWiFi = useMemo(
    () => Object.entries(device6G?.device?.iot?.sta?.wlan?.known || {}).filter(([, network]) => network.ssid),
    [device6G?.device?.iot?.sta?.wlan?.known],
  );
  const isLegacy = isLegacyYeti(device.thingName);
  const isBtnDisabled = !device?.isConnected;
  const errorTimeoutId = useRef<NodeJS.Timeout | null>(null);

  useMount(() => {
    return () => {
      dispatch(yetiActions.yetiReset());
    };
  });

  const navigateToPairing = useCallback(
    (params: any = {}) => {
      // In some cases when confirm modal is hidden, the navigation is returning to the previous screen
      // so we need to add a delay to avoid this issue
      setTimeout(() => {
        homeNavigation.navigate('StartPairing', {
          ...params,
          reconnect: false,
          connectionType: device.isDirectConnection ? 'cloud' : 'direct',
          fromSettings: !device.isDirectConnection,
          initialRouteName:
            device.isDirectConnection && device.dataTransferType === 'bluetooth' ? 'SelectWifiNetwork' : undefined,
          dataTransferType: device?.dataTransferType,
          device: { id: device?.peripheralId, name: device?.thingName },
          deviceType: device?.deviceType,
        });
      }, AppConfig.smallDelay);
    },
    [
      device?.dataTransferType,
      device?.deviceType,
      device.isDirectConnection,
      device?.peripheralId,
      device?.thingName,
      homeNavigation,
    ],
  );

  useEffect(() => {
    if (isGoToSettings) {
      setIsGoToSettings(false);
      showConfirm(
        'Change Connection',
        <View>
          <Text style={[styles.bodyText, styles.textWiFiTitle]}>
            You need an internet connection and to Log In with Goal Zero account to cloud connect.
          </Text>
          <View style={[styles.row, styles.sectionPoint]}>
            <Text style={styles.textNumber}>1. </Text>
            <Text style={styles.bodyText}>
              Go to your phone’s Wi-Fi settings and disconnect from your Yeti device Wi-Fi.
            </Text>
          </View>
          <View style={styles.row}>
            <Text style={styles.textNumber}>2. </Text>
            <Text style={styles.bodyText}>
              Return to the Goal Zero app and continue to Log In to your Goal Zero account to cloud connect.
            </Text>
          </View>
        </View>,
        () => {
          if (isSignedIn) {
            navigateToPairing();
          } else {
            homeNavigation.navigate('LoginNav', {
              connectionType: 'cloud',
              onSuccess: (params) => navigateToPairing(params),
              goBackAfterLogin: true,
            });
          }
        },
        {
          confirmTitle: 'Continue',
        },
        undefined,
        true,
        undefined,
        true,
      );
    }
  }, [homeNavigation, isGoToSettings, isSignedIn, navigateToPairing]);

  const showErrorMessage = () => {
    showError('There was a problem deleting your network. Please try again.');
  };

  const clearErrorTimeout = () => {
    if (errorTimeoutId.current) {
      clearTimeout(errorTimeoutId.current);
      errorTimeoutId.current = null;
    }

    setTimeout(() => {
      setDeleting(false);
    }, AppConfig.defaultDelay);
  };

  const deleteNetworkHandler = (key: string, ssid: string) => {
    showConfirm(
      <Text>
        Delete "<Text style={ApplicationStyles.textGreen}>{ssid}</Text>"
      </Text>,
      'Are you sure you want to delete the network connection?',
      async () => {
        setDeleting(true);
        errorTimeoutId.current = setTimeout(() => {
          setDeleting(false);
          showErrorMessage();
        }, 10000);

        const state = { iot: { sta: { wlan: { known: { [key]: null } } } } };
        update({
          thingName: device?.thingName || '',
          // @ts-expect-error TODO: we need to use complex and recursive Partial generic of stateObject type
          stateObject: { state: { desired: isYeti6GThing(device.thingName) ? state : { device: state } } },
          isDirectConnection: Boolean(device?.isDirectConnection),
          updateDeviceState: (thingName, data) => {
            clearErrorTimeout();

            // @ts-expect-error TODO: we need to validate data type
            const msg = data?.device?.msg;
            if (msg) {
              showErrorMessage();
            } else {
              showInfo('Your network connection was deleted.', 'Network Deleted');
              dispatch(devicesActions.devicesAddUpdate.request({ thingName, data, withReplace: true }));
            }
          },
          changeSwitchState: device.isDirectConnection
            ? () => {}
            : () => {
                clearErrorTimeout();

                setTimeout(() => {
                  showInfo('Your network connection was deleted.', 'Network Deleted');
                }, AppConfig.defaultDelay);
              },
          method: 'device',
        });
      },

      {
        confirmTitle: 'Delete',
      },
      () => {},
      true,
    );
  };

  const onConnectHandler = (ssid: string) => {
    showConfirm(
      <Text>
        Connect to "<Text style={ApplicationStyles.textGreen}>{ssid}</Text>"
      </Text>,
      <Text>
        Are you sure you want to connect to a different network? “
        <Text style={ApplicationStyles.textGreen}>{device.thingName}</Text>” will be unavailable while reconnecting to
        the new network. Your device will reconnect to the current connection if the new connection fails.
      </Text>,
      () =>
        settingsNavigation.navigate('ConnectYeti', {
          connectionType: 'cloud',
          dataTransferType: device6G.dataTransferType || 'bluetooth',
          device: {
            id: device.peripheralId,
            thingName: device.thingName,
            name: device.name || device.thingName,
          },
          deviceType: device6G?.deviceType,
          ssid,
          wifiPassword: null,
          fromSettings: true,
        }),
      {
        confirmTitle: 'Connect',
      },
      undefined,
      true,
    );
  };

  const changeConnectionHandler = () => {
    let bodyText = (
      <Text>
        To setup a new connection, you will need to set your device back to pairing mode. This will disrupt your Cloud
        Connection to “<Text style={ApplicationStyles.textGreen}>{device.name}</Text>”. Are you sure you want to change
        your connection?
      </Text>
    );

    if (device.isDirectConnection) {
      if (device.dataTransferType === 'wifi') {
        showConfirm(
          'Change Connection',
          <View>
            <Text style={[styles.bodyText, styles.textWiFiTitle]}>
              You need an internet connection and to Log In with Goal Zero account to cloud connect.
            </Text>
            <View style={[styles.row, styles.sectionPoint]}>
              <Text style={styles.textNumber}>1. </Text>
              <Text style={styles.bodyText}>
                Go to your phone’s Wi-Fi settings and disconnect from your Yeti device Wi-Fi.
              </Text>
            </View>
            <View style={styles.row}>
              <Text style={styles.textNumber}>2. </Text>
              <Text style={styles.bodyText}>
                Return to the Goal Zero app and continue to Log In to your Goal Zero account to cloud connect.
              </Text>
            </View>
          </View>,
          () => {
            if (isIOS) {
              Linking.openURL('App-Prefs:WIFI');
            } else {
              AndroidOpenSettings.wifiSettings();
            }

            setTimeout(() => {
              setIsGoToSettings(true);
            }, AppConfig.defaultDelay);
          },
          {
            confirmTitle: 'Go to Settings',
            notCloseOnConfirm: true,
          },
          undefined,
          true,
          undefined,
          true,
        );
        return;
      } else {
        bodyText = (
          <Text>
            You will no longer be Direct Connected to “<Text style={ApplicationStyles.textGreen}>{device.name}</Text>”.
            Are you sure you want to change your connection?
          </Text>
        );
      }
    }

    if (isSignedIn) {
      showConfirm(
        'Change Connection',
        bodyText,
        () => {
          if (!device.isDirectConnection && isYeti6GThing(device?.thingName)) {
            const data = { iot: { ble: { m: 2 } } };
            update({
              thingName: device6G.thingName,
              stateObject: {
                // @ts-expect-error TODO: we need to use complex and recursive Partial generic of stateObject type
                state: { desired: isYeti6GThing(device.thingName) ? data : { device: data } },
              },
              method: 'device',
            });
          }
          navigateToPairing();
        },
        {},
        undefined,
        true,
      );
    } else {
      showConfirm(
        'Log In',
        'You need to Log In with Goal Zero account to cloud connect.',
        () =>
          homeNavigation.navigate('LoginNav', {
            connectionType: 'cloud',
            onSuccess: (params) => navigateToPairing(params),
            goBackAfterLogin: true,
          }),
        { confirmTitle: 'Continue' },
        undefined,
        true,
      );
    }
  };

  const checkForError = async () => {
    const response = await Bluetooth.checkForError(device?.peripheralId || '');

    if (response.ok && response.data?.wlanErrorCode) {
      showError('The configured network requires a password or the password was incorrect. Please try again.');
    } else {
      await wait(AppConfig.bleCheckStateIntervals.status);
      checkForError();
    }
  };

  const renderBody = () => {
    if (isFridgeDevice) {
      return (
        <>
          <ConnectionInfo device={device} onPress={changeConnectionHandler} />
          <SectionWithTitle containerStyle={styles.sectionConnection} title="Current Connection">
            <InformationRow
              forceRightIcon={!isBtnDisabled}
              title={isBtnDisabled ? 'No Connection' : 'Bluetooth Direct'}
              rightIcon={<BluetoothIcon color={Colors.green} height={22} />}
            />
          </SectionWithTitle>
        </>
      );
    }

    return (
      <>
        <ConnectionInfo device={device} onPress={changeConnectionHandler} />
        <ScrollView style={styles.container}>
          <SectionWithTitle containerStyle={styles.sectionWrapper}>
            {device.isConnected ? (
              device.isDirectConnection ? (
                <>
                  <InformationRow
                    title="Current Connection"
                    description={device?.dataTransferType === 'wifi' ? 'Wi-Fi Direct' : 'Direct'}
                    descriptionStyle={{ color: Colors.gray }}
                    addRightIcon={
                      device?.dataTransferType === 'wifi' ? <WiFiDirectIcon /> : <BluetoothIcon color={Colors.green} />
                    }
                  />
                </>
              ) : (
                <>
                  <InformationRow
                    title="Current Connection"
                    description={'Cloud'}
                    descriptionStyle={{ color: Colors.gray }}
                    addRightIcon={getWifiLevelIcon(
                      isLegacy ? deviceLegacy?.wifiStrength : device6G?.status?.wifiRssi,
                      Colors.green,
                    )}
                  />
                  <InformationRow
                    useClipboard
                    title="Network Name"
                    description={isLegacy ? deviceLegacy.ssid : device6G?.device?.iot?.sta?.wlan?.ssid}
                    descriptionStyle={{ color: Colors.gray }}
                  />
                  <InformationRow
                    useClipboard
                    title="IP Address"
                    description={isLegacy ? deviceLegacy.ipAddr : device6G?.device?.iot?.sta?.wlan?.ip}
                    descriptionStyle={{ color: Colors.gray }}
                  />
                </>
              )
            ) : (
              <InformationRow
                title="Current Connection"
                description="No Connection"
                descriptionStyle={{ color: Colors.gray }}
              />
            )}
          </SectionWithTitle>
          {!isLegacy && (
            <>
              {knownWiFi.map(
                ([key, { conn, ssid }], index) =>
                  (!device6G?.isConnected ||
                    device6G?.isDirectConnection ||
                    device6G?.device?.iot?.sta?.wlan?.ssid !== ssid) &&
                  ssid !== undefined &&
                  ssid.length > 0 && (
                    <SectionWithTitle key={key} containerStyle={styles.sectionWrapper}>
                      <>
                        <InformationRow
                          title={`Saved Network ${index + 1}`}
                          description={ssid}
                          descriptionStyle={{ color: Colors.gray }}
                        />
                        <InformationRow
                          title="Last Connected"
                          description={getDataTitle(conn)}
                          descriptionStyle={{ color: Colors.gray }}
                          style={{ paddingBottom: Metrics.halfMargin * 2 }}
                        />
                      </>
                      <View style={styles.btnWrapper}>
                        <Button
                          disabled={isBtnDisabled}
                          style={styles.deleteBtn}
                          title="DELETE"
                          onPress={() => deleteNetworkHandler(key, ssid)}
                          inverse
                        />
                        <Button
                          disabled={!isSignedIn || isBtnDisabled}
                          style={ApplicationStyles.flex}
                          title="CONNECT"
                          onPress={() => onConnectHandler(ssid)}
                          inverse
                        />
                      </View>
                    </SectionWithTitle>
                  ),
              )}
            </>
          )}
          {/* TODO: negating/hiding this for now, we need to rethink and fix this flow */}
          {/* {!device.isDirectConnection && !isLegacy && (
            <Button
              disabled={knownWiFi.length > 2 || !isSignedIn || isBtnDisabled}
              style={ApplicationStyles.flex}
              title="Add Network"
              onPress={() => setShowConnectModal(true)}
              inverse
            />
          )} */}
        </ScrollView>
        <Spinner visible={isDeleting} />
        {/* TODO: negating/hiding this via 'Add Network' for now, we need to rethink and fix this flow */}
        {showConnectModal && (
          <ConnectNetwork
            deviceType={device.deviceType as DeviceType}
            peripheralId={device?.peripheralId || ''}
            connectedSSID={{
              name: isLegacy ? deviceLegacy.ssid : device6G?.device?.iot?.sta?.wlan?.ssid,
              db: (isLegacy ? deviceLegacy?.wifiStrength : device6G?.status?.wifiRssi) || 0,
            }}
            onConnect={async ({ ssid, pass }) => {
              const data: YetiConnectionCredentials | Yeti6GConnectionCredentials = isLegacy
                ? {
                    wifi: {
                      name: ssid ?? '',
                    },
                    iot: {
                      env: AwsConfig.env,
                      hostname: AwsConfig.iotHost,
                      endpoint: `${AwsConfig.apiBaseUrl}/thing`,
                    },
                  }
                : {
                    iot: {
                      sta: {
                        m: 3,
                        wlan: {
                          ssid: ssid || '',
                        },
                        cloud: {
                          env: AwsConfig.env,
                          mqtt: AwsConfig.iotHost,
                          api: AwsConfig.apiHost,
                        },
                      },
                    },
                  };

              if (!isNull(pass)) {
                if (isLegacy) {
                  (data as YetiConnectionCredentials).wifi.pass = pass;
                } else {
                  (data as Yeti6GConnectionCredentials).iot.sta.wlan.pass = pass;
                }
              }

              const response = await Bluetooth.joinWifi(
                device?.peripheralId || '',
                device?.deviceType as DeviceType,
                data,
              );

              if (!response?.ok) {
                showError(
                  'The configured network requires a password or the password was incorrect. Please try again.',
                );
              } else {
                checkForError();
              }
            }}
            onClose={() => setShowConnectModal(false)}
          />
        )}
      </>
    );
  };

  return (
    <View style={ApplicationStyles.mainContainer}>
      <Header
        title="Connection"
        subTitle={
          device6G?.connectedAt ? `Last sync: ${format(parseISO(device6G?.connectedAt), "M/d/y 'at' h:mm bbb")}` : ''
        }
      />
      {renderBody()}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: Metrics.marginSection,
    marginVertical: Metrics.baseMargin,
  },
  connection: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: Metrics.halfMargin,
    paddingTop: Metrics.halfMargin,
    paddingBottom: Metrics.baseMargin,
  },
  sectionConnection: {
    margin: Metrics.marginSection,
    marginTop: Metrics.bigMargin,
  },
  connectionInfo: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginHorizontal: Metrics.halfMargin,
    marginVertical: Metrics.smallMargin,
  },
  btnWrapper: {
    flexDirection: 'row',
    marginBottom: Metrics.smallMargin,
  },
  deleteBtn: {
    flex: 1,
    marginRight: Metrics.baseMargin,
  },
  saveBtn: {
    margin: Metrics.baseMargin,
  },
  sectionWrapper: {
    paddingTop: Metrics.halfMargin / 2,
    paddingBottom: Metrics.halfMargin / 2,
    position: 'relative',
    marginVertical: Metrics.halfMargin,
  },
  row: {
    flexDirection: 'row',
    marginRight: Metrics.halfMargin,
  },
  bodyText: {
    ...Fonts.font.base.bodyOne,
  },
  textWiFiTitle: {
    marginTop: Metrics.marginSection,
    marginBottom: Metrics.bigMargin,
    marginHorizontal: Metrics.marginSection,
    textAlign: 'center',
  },
  sectionPoint: {
    marginBottom: Metrics.marginSection,
  },
  textNumber: {
    ...Fonts.font.base.subtitleOne,
    color: Colors.green,
  },
});

export default Connection;
