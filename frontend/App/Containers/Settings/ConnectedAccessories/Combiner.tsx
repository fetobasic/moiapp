import React, { useMemo } from 'react';
import { StyleSheet, Image, Text, View } from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { useSelector } from 'react-redux';

import { ApplicationStyles, Colors, Fonts, Metrics } from 'App/Themes';
import { HeaderSimple as Header, InformationRow as Row } from 'App/Components';
import MainDevice from 'App/Components/Sidebar/MainDevice';
import { SettingsStackParamList } from 'App/Types/NavigationStackParamList';
import InformationIcon from 'App/Images/Icons/information.svg';
import CombinerIcon from 'App/Images/Icons/combiner.svg';
import { Yeti6GState } from 'App/Types/Yeti';
import { getCurrentDevice } from 'App/Store/Devices/selectors';
import { getPowerOutValue, getPowerInValue } from 'App/Transforms/getPowerInfo';
import { WithTopBorder } from 'App/Hoc';
import { isYeti20004000 } from 'App/Services/ThingHelper';

type Props = NativeStackScreenProps<SettingsStackParamList, 'Combiner'>;

const Combiner = ({ navigation, route }: Props) => {
  const device = useSelector(getCurrentDevice(route.params?.device?.thingName || '')) as Yeti6GState;
  const xNodeStatus = useMemo(
    () => device?.status?.xNodes[route.params?.id],
    [device?.status?.xNodes, route.params?.id],
  );

  const pairedYeti = useSelector(getCurrentDevice(xNodeStatus?.pair || '')) as Yeti6GState;

  function getDevicePlaceHolder(status: 'syncing' | 'available') {
    const isSyncing = status === 'syncing';

    return (
      <WithTopBorder>
        <View style={styles.devicePlaceholderSection}>
          <CombinerIcon
            style={styles.combinerIcon}
            color={isSyncing ? Colors.combinerStatus.syncing : Colors.disabled}
          />
          <View style={ApplicationStyles.flex}>
            <Text style={[styles.textPlaceholder, isSyncing && { color: Colors.combinerStatus.syncing }]}>
              {isSyncing ? 'Yeti syncing...' : 'Yeti not detected'}
            </Text>
            <View style={[styles.loadInfo, styles.powerInPlaceHolder]} />
            <View style={[styles.loadInfo, styles.powerOutPlaceHolder]} />
            <View style={[styles.loadInfo, styles.socPlaceHolder]} />
          </View>
          <Image style={styles.placeholderIcon} source={require('App/Images/Models/placeholder.png')} />
        </View>
      </WithTopBorder>
    );
  }

  function getStatus() {
    let text = '';
    let statusColor = Colors.combinerStatus.available;

    switch (xNodeStatus?.s) {
      case 0:
      default:
        text = '120V Available';
        statusColor = Colors.combinerStatus.available;
        break;

      case 1:
        text = 'Syncing';
        statusColor = Colors.combinerStatus.syncing;
        break;

      case 2:
        text = `240V / ${isYeti20004000(device) ? '30' : '15'}A Active`;
        statusColor = Colors.combinerStatus.active;
        break;
    }

    return (
      <>
        <Text style={styles.textValue}>{text}</Text>
        <View style={[styles.status, { backgroundColor: statusColor }]} />
      </>
    );
  }

  function getSecondDeviceInfo() {
    switch (xNodeStatus?.s) {
      case 0:
      default:
        return getDevicePlaceHolder('available');

      case 1:
        return getDevicePlaceHolder('syncing');

      case 2:
        return (
          <MainDevice
            isCombinerInfo
            notPaired={!pairedYeti?.thingName || !pairedYeti?.device?.identity?.thingName}
            powerIn={xNodeStatus?.wIn || 0}
            powerOut={xNodeStatus?.wOut || 0}
            deviceName={pairedYeti?.device?.identity?.lbl || pairedYeti?.thingName || xNodeStatus?.pair || ''}
            item={
              {
                ...pairedYeti,
                thingName: pairedYeti?.device?.thingName || xNodeStatus?.pair || '',
                model:
                  pairedYeti?.model ||
                  pairedYeti?.device?.identity?.model ||
                  xNodeStatus?.model ||
                  'Yeti PRO 4000 120V',
                status: {
                  ...pairedYeti?.status,
                  batt: { ...pairedYeti?.status?.batt, soc: xNodeStatus?.soc || 0, mTtef: xNodeStatus?.mTtef || 0 },
                },
              } as Yeti6GState
            }
            childDevices={[]}
          />
        );
    }
  }

  return (
    <View style={ApplicationStyles.mainContainer}>
      <Header title="Yeti Series Combiner" />
      <View style={styles.container}>
        <Row
          subTitle="Yeti Series Combiner status indicator"
          subTitleTextStyle={{ color: Colors.white }}
          leftIconStyle={styles.infoIcon}
          addLeftIcon={<InformationIcon />}
          onPress={() => navigation.navigate('CombinerStatus', { isYeti20004000: isYeti20004000(device) })}
        />

        <View style={styles.sectionMain}>
          <View style={styles.row}>
            <Text style={styles.textTitle}>Model</Text>
            <Text style={styles.textValue}>Yeti Series Combiner</Text>
          </View>
          <View style={styles.row}>
            <Text style={styles.textTitle}>Status</Text>
            <View style={styles.sectionStatus}>{getStatus()}</View>
          </View>
          <View style={styles.row}>
            <Text style={styles.textTitle}>Combined Power Out</Text>
            <Text style={[styles.textValue, styles.textPowerOut]}>
              {(xNodeStatus?.wL1 || 0) + (xNodeStatus?.wL2 || 0)} W
            </Text>
          </View>
        </View>

        <MainDevice
          isCombinerInfo
          deviceName={device?.device?.identity?.lbl || device?.device?.identity?.model || device?.thingName || ''}
          powerIn={getPowerInValue(device)}
          powerOut={getPowerOutValue(device)}
          item={device}
          childDevices={[]}
        />
        {getSecondDeviceInfo()}
      </View>
    </View>
  );
};

export default Combiner;

const styles = StyleSheet.create({
  container: {
    marginHorizontal: Metrics.marginSection,
    marginVertical: Metrics.baseMargin,
    flex: 1,
  },
  infoIcon: {
    marginRight: Metrics.smallMargin,
  },
  sectionMain: {
    marginTop: Metrics.marginSection,
    marginBottom: Metrics.halfMargin,
    paddingVertical: Metrics.smallMargin,
    borderColor: Colors.border,
    borderWidth: 1,
    borderRadius: 8,
  },
  row: {
    flexDirection: 'row',
    paddingVertical: Metrics.smallMargin,
    paddingHorizontal: Metrics.marginSection,
  },
  textTitle: {
    ...Fonts.font.base.bodyTwo,
    color: Colors.white,
    flex: 1,
  },
  textValue: {
    ...Fonts.font.base.bodyTwo,
    color: Colors.disabled,
  },
  textPlaceholder: {
    ...Fonts.font.base.bodyOne,
    color: Colors.disabled,
    marginBottom: 5,
  },
  textPowerOut: {
    color: Colors.lightGreen,
  },
  sectionStatus: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  status: {
    width: 12,
    height: 12,
    borderRadius: 6,
    marginVertical: 9,
    backgroundColor: Colors.blue,
    marginLeft: Metrics.smallMargin,
  },
  combinerIcon: {
    marginTop: 5,
    marginLeft: Metrics.marginSection,
    marginRight: Metrics.halfMargin,
  },
  placeholderIcon: {
    width: 78,
    height: 76,
    alignSelf: 'center',
    right: -8,
  },
  devicePlaceholderSection: {
    flexDirection: 'row',
  },
  loadInfo: {
    height: 10,
    borderRadius: 8,
    backgroundColor: Colors.border,
    marginVertical: 4,
  },
  powerInPlaceHolder: {
    width: 90,
  },
  powerOutPlaceHolder: {
    width: 90,
  },
  socPlaceHolder: {
    width: 122,
  },
});
