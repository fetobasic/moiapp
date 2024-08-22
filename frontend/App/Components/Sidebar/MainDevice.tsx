import React from 'react';
import { format } from 'date-fns';
import { View, Text, StyleSheet, Image } from 'react-native';
import { ApplicationStyles, Colors, Fonts, Metrics } from 'App/Themes';

import { InformationRow as Row } from 'App/Components';
import ConnectionIcon from './ConnectionIcon';
import { getYetiImage } from 'App/Services/Yeti';
import ConnectedLine from './ConnectedLine';

import ChildDevice from './ChildDevice';
import DeviceStatusInfo from './DeviceStatusInfo';
import { ChildItem } from 'App/Hooks/useMapDrawerData';
import { useDispatch } from 'react-redux';
import { applicationActions } from 'App/Store/Application';
import { useHomeNavigation } from 'App/Hooks';
import { DeviceState } from 'App/Types/Devices';
import { showConfirm } from 'App/Services/Alert';
import { wait } from 'App/Services/Wait';
import AppConfig from 'App/Config/AppConfig';

import AttentionIcon from 'App/Images/Icons/attention.svg';

type Props = {
  item: DeviceState;
  childDevices: ChildItem[];
  isCombinerInfo?: boolean;
  powerIn?: number;
  powerOut?: number;
  notPaired?: boolean;
  deviceName?: string;
};

function MainDevice({ item, childDevices, isCombinerInfo, powerIn, powerOut, notPaired, deviceName }: Props) {
  const dispatch = useDispatch();
  const navigation = useHomeNavigation('Home');
  const { isDirectConnection, dataTransferType, isConnected, name = '', model = '' } = item || {};

  const navigateToDevice = (thingName: string) => {
    if (notPaired) {
      showConfirm(
        'This device is not paired yet',
        'Do you want to pair it now?',
        async () => {
          await wait(AppConfig.smallDelay);
          navigation.navigate('StartPairing');
        },
        undefined,
        () => {},
        false,
        <AttentionIcon />,
      );
      return;
    }

    dispatch(applicationActions.setLastDevice(thingName));
    navigation.navigate('Home');
  };

  return (
    <View testID="mainDevice" style={[ApplicationStyles.flex, isCombinerInfo && styles.containerCombiner]}>
      <Row
        subTitle={deviceName || model}
        accessibilityLabel={deviceName || model}
        subTitleStyle={styles.subTitleStyle}
        subTitleTextStyle={{ color: notPaired ? Colors.disabled : Colors.transparentWhite('0.87') }}
        contentStyle={{ ...styles.contentStyle, ...(isCombinerInfo ? styles.containerContent : {}) }}
        addSubTitle={
          <View>
            {isCombinerInfo ? (
              <View>
                <Text style={styles.powerText}>Power In - {powerIn ?? 0} W</Text>
                <Text style={styles.powerText}>Power Out - {powerOut ?? 0} W</Text>
              </View>
            ) : (
              <Text numberOfLines={1} ellipsizeMode="tail" style={[styles.extraInfoText, { color: Colors.gray }]}>
                {name}
              </Text>
            )}
            <DeviceStatusInfo device={item} />
            {Boolean(item.dateSync) && !isCombinerInfo && (
              <Text
                numberOfLines={1}
                ellipsizeMode="tail"
                style={[
                  styles.lastSyncText,
                  { color: !item?.isConnected ? Colors.gray : Colors.transparentWhite('0.87') },
                ]}>
                {`Last sync: ${format(new Date(item.dateSync as string), "M/d/y 'at' h:mm bbb")}`}
              </Text>
            )}
          </View>
        }
        addLeftIcon={
          <ConnectionIcon
            dataTransferType={dataTransferType}
            isDirectConnection={isDirectConnection}
            isConnected={isConnected}
            isCombinerInfo={isCombinerInfo}
          />
        }
        rightIcon={<Image style={styles.image} resizeMode="contain" source={getYetiImage(model)} />}
        onPress={() => navigateToDevice(item.thingName || '')}
        style={styles.mainRow}
      />
      <View style={styles.container}>
        <View style={styles.lineContainer}>
          {childDevices.map((childDevice, index) => (
            <ConnectedLine
              key={`${childDevice.thingName}-${item.name}-${index}`}
              deviceOrder={index}
              isConnected={childDevice.batteryPercentage !== 0}
            />
          ))}
        </View>
        <View style={ApplicationStyles.flex}>
          {childDevices.map((childDevice) => (
            <ChildDevice
              key={`${childDevice.thingName}-${item.name}`}
              navigateToDevice={navigateToDevice}
              item={childDevice}
            />
          ))}
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    flexDirection: 'row',
  },
  containerCombiner: {
    flex: 0,
    marginBottom: Metrics.smallMargin,
  },
  lineContainer: {
    width: 56,
  },
  image: {
    height: 64,
    width: 64,
  },
  extraInfoText: {
    ...Fonts.font.base.caption,
    fontSize: 12,
  },
  lastSyncText: {
    ...Fonts.font.base.caption,
    fontSize: 10,
  },
  powerText: {
    ...Fonts.font.base.caption,
    color: Colors.disabled,
  },
  subTitleStyle: {
    paddingBottom: 7,
  },
  contentStyle: {
    paddingVertical: 9,
  },
  containerContent: {
    paddingTop: Metrics.marginSection,
    paddingBottom: 9,
  },
  mainRow: {
    zIndex: 1000,
    position: 'relative',
  },
});

export default MainDevice;
