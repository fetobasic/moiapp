import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { View, StyleSheet, ScrollView, Text } from 'react-native';
import { useSelector } from 'react-redux';
import semver from 'semver';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import Spinner from 'react-native-loading-spinner-overlay';
import AppConfig from 'App/Config/AppConfig';
import { HeaderSimple as Header, InformationRow as Row } from 'App/Components';
import { ApplicationStyles, Colors, Fonts, Metrics } from 'App/Themes';
import { SettingsStackParamList } from 'App/Types/NavigationStackParamList';
import { useAppDispatch, useAppSelector, useEvents, useHomeNavigation, usePrevious, useMount } from 'App/Hooks';
import { showConfirm, showReconnect } from 'App/Services/Alert';
import { devicesActions } from 'App/Store/Devices';
import { getCurrentDevice } from 'App/Store/Devices/selectors';
import { isLatestVersion } from 'App/Services/FirmwareUpdates';
import ResetDevice from 'App/Images/Icons/resetDevice.svg';
import UnpairDevice from 'App/Images/Icons/unpairDevice.svg';
import BluetoothGreen from 'App/Images/Icons/bluetoothGreen.svg';
import SectionWithTitle from 'App/Components/SectionWithTitle';
import { getWifiLevelIcon, isLegacyYeti, isModelX } from 'App/Services/Yeti';
import {
  getYetiGeneration,
  isYeti20004000,
  isYeti2000,
  isYeti4000,
  isYeti10001500,
  isYeti6GThing,
} from 'App/Services/ThingHelper';
import { isFridge } from 'App/Hooks/useMapDrawerData';
import WiFiDirectIcon from 'App/Images/Icons/directWiFi.svg';
import { Yeti6GState, YetiModel, YetiState } from 'App/Types/Yeti';
import { DeviceState } from 'App/Types/Devices';
import { FRIDGE_BIND_MODE } from 'App/Types/Fridge';
import { isYeti300500700 } from 'App/Services/ThingHelper';
import { restoreFactorySettings, disconnect, changeBindMode } from 'App/Services/Bluetooth/Fridge';
import { update } from 'App/Services/ConnectionControler';
import { chargingProfileSelectors } from 'App/Store/ChargingProfile';
import { chargeProfilesInfo } from 'App/Containers/Common/ChargeProfile';

type SettingsRow = {
  sectionTitle?: string;
  rows?: {
    title: string;
    description: string;
    descriptionIcon: JSX.Element;
    addRightIcon: boolean;
    rightIcon: JSX.Element;
    onPress: () => void;
    hideRow?: boolean;
    styles?: any;
    useClipboard?: boolean;
  }[];
  title: string;
  description?: string;
  descriptionIcon?: JSX.Element;
  addRightIcon?: boolean;
  rightIcon: JSX.Element;
  onPress: () => void;
  hideRow?: boolean;
};

type Props = NativeStackScreenProps<SettingsStackParamList, 'DeviceSettings'>;

function DeviceSettings({ route, navigation }: Props) {
  const dispatch = useAppDispatch();
  const appNavigation = useHomeNavigation('Settings');
  const { startUnpair, devices, firmwareVersions } = useAppSelector((state) => ({
    devices: state.devicesInfo.data,
    startUnpair: state.devicesInfo.startUnpair,
    firmwareVersions: state.firmwareUpdate.firmwareVersions,
  }));
  const { track } = useEvents();
  const prevStartUnpair = usePrevious(startUnpair);
  const [showSpinner, setShowSpinner] = useState(false);

  const device: DeviceState = useSelector(getCurrentDevice(route.params.device.thingName || ''));
  const isDirectConnection = device?.isDirectConnection;
  const deviceType = device?.deviceType || '';
  const yeti6G = device as Yeti6GState;
  const yetiLegacy = device as YetiState;
  const isUpdateAvailable = !isLatestVersion(
    yetiLegacy?.firmwareVersion || yeti6G?.device?.fw || '0.0.0',
    firmwareVersions?.[deviceType]?.[0] || yeti6G?.device?.fw,
  );
  const { deviceProfileName } = useSelector(chargingProfileSelectors.getProfileInfo(device?.thingName || ''));
  const chargeProfileName = useMemo(
    () => chargeProfilesInfo.find((profile) => profile.value === deviceProfileName)?.title || '',
    [deviceProfileName],
  );

  // when we first land on this screen, we should fetch the 'device' shadow state
  // to do this, we publish a 1 to the 'status.shdw.device' state
  useMount(() => {
    if (isYeti6GThing(device?.thingName)) {
      const deviceTimeStamp: number = yeti6G?.status?.shdw?.device || 0; // the timestamp of the device shadow state in unix seconds
      // if the device timestamp is older than 30 seconds, then we should request the device to update its shadow state
      if (deviceTimeStamp < Date.now() / 1000 - 30) {
        update({
          thingName: device?.thingName || '',
          stateObject: {
            state: {
              // @ts-ignore
              desired: { shdw: { device: 1 } },
            },
          },
          isDirectConnection: Boolean(device?.isDirectConnection),
          updateDeviceState: (thingName, data) =>
            dispatch(devicesActions.devicesAddUpdate.request({ thingName, data })),
          method: 'status',
        });
      }
    }
  });

  useEffect(() => {
    if (prevStartUnpair && !startUnpair) {
      setShowSpinner(false);
      appNavigation.navigate('Home', { device: devices?.[0], showMarketingVideo: true });
    }
  }, [appNavigation, devices, prevStartUnpair, startUnpair]);

  const cbUnpairDeviceHandler = async () => {
    track('thing_unpaired', {
      thingName: device?.thingName,
      dataTransferType: device?.dataTransferType,
      mode: isDirectConnection ? 'direct' : 'cloud',
      model: device?.model,
      hostId: (device as Yeti6GState)?.hostId,
      gen: getYetiGeneration(device?.thingName, device?.model),
    });

    setShowSpinner(true);
    // if the device is a fridge then change the bind mode to allow
    if (isFridge(device?.deviceType)) {
      await changeBindMode(device?.peripheralId || '', FRIDGE_BIND_MODE.ALLOW); // allow the fridge to be paired again
      await disconnect(device?.peripheralId || ''); // disconnect from the device bluetooth
    }
    dispatch(devicesActions.unpair.request({ thingName: device?.thingName || '' }));
  };

  const cbCheckReconnect = useCallback(
    (cbNavigation: () => void) => () => {
      if (device?.isConnected) {
        cbNavigation();
      } else {
        showReconnect(() => {
          appNavigation.navigate('StartPairing', {
            reconnect: true,
            connectionType: isDirectConnection ? 'direct' : 'cloud',
          });
        });
      }
    },
    [appNavigation, device?.isConnected, isDirectConnection],
  );

  const cbResetDeviceHandler = async () => {
    if (isFridge(device.deviceType)) {
      await restoreFactorySettings(device?.peripheralId || '');
    } else {
      update({
        thingName: device?.thingName || '',
        stateObject: {
          state: {
            desired: {
              // @ts-ignore TODO: we need to use complex and recursive Partial generic of Yeti6GState type
              act: { req: { reboot: 1 } },
            },
          },
        },
        isDirectConnection: Boolean(device?.isDirectConnection),
        updateDeviceState: (thingName) => {
          dispatch(devicesActions.devicesAddUpdate.request({ thingName, data: { isConnected: false } }));
        },
        method: 'device',
      });
    }

    dispatch(
      devicesActions.devicesAddUpdate.request({ thingName: device?.thingName || '', data: { isConnected: false } }),
    );
    appNavigation.navigate('Home');
  };

  const showEnergyHistory =
    !isYeti300500700(device) &&
    ((isLegacyYeti(device?.thingName) && isModelX((device as YetiState)?.model)) ||
      (isYeti4000(device) &&
        semver.gte((device as Yeti6GState)?.device?.fw || '0.0.0', AppConfig.minFirmwareVersionY6gY4kEnergyHistory)) ||
      isYeti2000(device) ||
      isYeti10001500(device));

  const settingsRows = [
    {
      sectionTitle: 'Device Information',
      rows: [
        { title: 'Model', description: device?.model, useClipboard: true },
        { title: 'Device ID', description: device?.thingName, useClipboard: true },
        !isFridge(device.deviceType) && {
          title: 'Serial Number',
          description:
            yeti6G?.device?.identity?.sn === AppConfig.invalidY6gY4kSerialNumber ? 'N/A' : yeti6G?.device?.identity?.sn,
          styles: {
            paddingBottom: Metrics.halfMargin * 2,
          },
          hideRow: isLegacyYeti(device?.thingName),
          useClipboard: true,
        },
        {
          title: 'Name',
          description: device?.name,
          onPress: cbCheckReconnect(() => navigation.navigate('ChangeName', { device })),
        },
        !isFridge(device.deviceType) && {
          title: 'Firmware Version',
          description: yetiLegacy?.firmwareVersion || yeti6G?.device?.fw,
          descriptionIcon: isUpdateAvailable && (
            <View style={styles.fwvContainer}>
              <Text style={styles.firmwareVersion}>NEW {firmwareVersions?.[deviceType]?.[0].version}</Text>
            </View>
          ),
          onPress: cbCheckReconnect(() =>
            navigation.navigate('UpdateFirmware', {
              thingName: device?.thingName || '',
            }),
          ),
        },
        {
          title: 'Connection',
          description: isDirectConnection
            ? device?.dataTransferType === 'wifi'
              ? 'Wi-Fi Direct'
              : 'Direct'
            : yetiLegacy?.ssid || yeti6G?.device?.iot?.sta?.wlan?.ssid || 'Cloud',
          addRightIcon: isDirectConnection ? (
            device?.dataTransferType === 'wifi' ? (
              <WiFiDirectIcon />
            ) : (
              <BluetoothGreen />
            )
          ) : (
            getWifiLevelIcon(yetiLegacy?.wifiStrength || yeti6G?.status?.wifiRssi, Colors.green)
          ),
          onPress: () => navigation.navigate('Connection', { device }),
        },
      ].filter(Boolean),
    },
    isFridge(device.deviceType)
      ? {
          sectionTitle: 'Fridge Info',
          rows: [
            {
              title: 'Battery Protection Mode',
              onPress: () => navigation.navigate('BatteryProtectionMode'),
            },
            {
              title: 'Error Codes',
              onPress: () => navigation.navigate('ErrorCodes'),
            },
          ],
        }
      : {
          sectionTitle: 'Preferences',
          rows: [
            {
              title: 'Battery',
              onPress: cbCheckReconnect(() => navigation.navigate('BatteryScreen', { device: yeti6G })),
              hideRow: isFridge(device.deviceType),
            },
            {
              title: 'Energy History',
              onPress: () => navigation.navigate('EnergyInfo', { device }),
              hideRow: !showEnergyHistory,
            },
            {
              title: 'Charge Profile',
              description: chargeProfileName,
              onPress: cbCheckReconnect(() => navigation.navigate('ChargeProfile', { device })),
              hideRow: isLegacyYeti(device?.thingName) && !isModelX(device?.model as YetiModel),
            },
            {
              title: 'AC Inverter/Charger',
              onPress: cbCheckReconnect(() =>
                navigation.navigate('AcInputLimits', { thingName: device?.thingName || '' }),
              ),
              hideRow: !isYeti20004000(device) && !isYeti10001500(device),
            },
            {
              title: 'Notifications',
              onPress: cbCheckReconnect(() => navigation.navigate('NotificationSettings', { device })),
            },
            {
              title: 'Connected Accessories',
              onPress: cbCheckReconnect(() => navigation.navigate('ConnectedAccessories', { device })),
              hideRow: isYeti300500700(device) || isFridge(device.deviceType),
            },
          ].filter(Boolean),
        },
    {
      title: isFridge(device.deviceType) ? 'Factory Reset Device' : 'Restart Device',
      rightIcon: <ResetDevice />,
      onPress: cbCheckReconnect(() =>
        showConfirm(
          isFridge(device.deviceType) ? 'Factory Reset Device' : 'Restart Device',
          <Text>
            This will {isFridge(device.deviceType) ? 'reset' : 'restart'} your Goal Zero device “
            <Text style={styles.deviceName}>{device?.name}</Text>”. Other Goal Zero devices will not be affected. Are
            you sure you want to {isFridge(device.deviceType) ? 'reset' : 'restart'} your device?
          </Text>,
          cbResetDeviceHandler,
          {
            confirmTitle: isFridge(device.deviceType) ? 'Reset' : 'Restart',
          },
          undefined,
          true,
        ),
      ),
      hideRow: isLegacyYeti(device?.thingName),
    },
    {
      title: 'Unpair Device',
      rightIcon: <UnpairDevice />,
      onPress: () =>
        showConfirm(
          'Unpair Device',
          <Text>
            This will disconnect your Goal Zero device “<Text style={styles.deviceName}>{device?.name}</Text>”. Other
            Goal Zero devices will not be affected. Are you sure you want to unpair your device?
          </Text>,
          cbUnpairDeviceHandler,
          {
            confirmTitle: 'Unpair',
          },
          undefined,
          true,
        ),
    },
    { title: 'Help', onPress: () => appNavigation.navigate('HelpNav') },
  ].filter(Boolean) as SettingsRow[];

  return (
    <View style={ApplicationStyles.mainContainer}>
      <Header title="Device Settings" />
      <ScrollView style={styles.scrollView} contentContainerStyle={styles.scrollViewContent}>
        {settingsRows.map(
          ({ sectionTitle, rows, title, description, descriptionIcon, addRightIcon, rightIcon, onPress, hideRow }) =>
            sectionTitle ? (
              <SectionWithTitle key={sectionTitle}>
                {rows?.map(
                  (row) =>
                    !row?.hideRow && (
                      <Row
                        key={row.title}
                        title={row.title}
                        description={row?.description}
                        descriptionIcon={row?.descriptionIcon}
                        descriptionStyle={{ color: Colors.gray }}
                        rightIcon={row?.rightIcon}
                        onPress={row?.onPress}
                        addRightIcon={row?.addRightIcon}
                        style={row?.styles}
                        useClipboard={row.useClipboard}
                      />
                    ),
                )}
              </SectionWithTitle>
            ) : (
              <View key={title} style={styles.rowsWrapper}>
                {!hideRow && (
                  <Row
                    title={title}
                    description={description}
                    descriptionIcon={descriptionIcon}
                    descriptionStyle={{ color: Colors.gray }}
                    rightIcon={rightIcon}
                    onPress={onPress}
                    addRightIcon={addRightIcon}
                  />
                )}
              </View>
            ),
        )}
      </ScrollView>
      <Spinner visible={showSpinner} textContent="" cancelable={false} color={Colors.green} />
    </View>
  );
}

const styles = StyleSheet.create({
  scrollView: {
    marginTop: 10,
    paddingHorizontal: Metrics.marginSection,
  },
  scrollViewContent: {
    paddingBottom: Metrics.bigMargin,
  },
  row: {
    marginHorizontal: Metrics.smallMargin,
  },
  deviceName: {
    color: Colors.green,
  },
  fwvContainer: {
    backgroundColor: Colors.green,
    borderRadius: 24,
    paddingVertical: 4,
    paddingHorizontal: 7,
    marginLeft: 4,
  },
  firmwareVersion: {
    ...Fonts.font.base.caption,
    color: Colors.background,
    fontWeight: '500',
    opacity: 1,
  },
  rowsWrapper: {
    paddingHorizontal: Metrics.smallMargin,
  },
});

export default DeviceSettings;
