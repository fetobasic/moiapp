import React, { useCallback, useEffect, useState } from 'react';
import { View, Text, ScrollView, StyleSheet } from 'react-native';
import { useFeatureFlag } from 'posthog-react-native';

import { env } from 'App/Config/AppConfig';
import { ApplicationStyles, Colors, Fonts, Metrics } from 'App/Themes';
import { HeaderSimple as Header, InformationRow, Pressable, Spinner } from 'App/Components';
import renderElement from 'App/Services/RenderElement';
import Row from 'App/Components/Pairing/InfoRow';
import { openLink } from 'App/Services/Linking';
import LINKS from 'App/Config/Links';
import InformationIcon from 'App/Images/Icons/information.svg';
import EscapeIcon from 'App/Images/Icons/escapeScreen.svg';
import TankProIcon from 'App/Images/Icons/tankPro.svg';
import MPTTIcon from 'App/Images/Icons/MPPT.svg';
import Combinercon from 'App/Images/Icons/combiner.svg';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { SettingsStackParamList } from 'App/Types/NavigationStackParamList';
import { isLegacyYeti } from 'App/Services/Yeti';
import { isYeti20004000 } from 'App/Services/ThingHelper';
import { isYetiLink, isYetiMPPT } from 'App/Services/Accessory';
import { Accessories } from 'App/Config/Accessory';
import { useMount } from 'App/Hooks';
import { useSelector } from 'react-redux';
import { getCurrentDevice } from 'App/Store/Devices/selectors';
import { getDeviceInfo } from 'App/Services/Bluetooth/Common';
import { XNodes, Yeti6GState, YetiState } from 'App/Types/Yeti';

type Props = NativeStackScreenProps<SettingsStackParamList, 'ConnectedAccessories'>;

const ConnectedAccessories = ({ navigation, route }: Props) => {
  const device = useSelector(getCurrentDevice(route.params.device.thingName || ''));
  const [accessories, setAccessories] = useState<{ tanksPro?: any; escapeScreen?: { id: string }; combiner?: any }>({});
  const isLegacy = isLegacyYeti(device?.thingName);
  const legacyDevice = device as YetiState;
  const device6G = device as Yeti6GState;
  const isLinkConnected = isYetiLink(legacyDevice?.foreignAcsry?.model);
  const isMPTTConnected = isYetiMPPT(legacyDevice?.foreignAcsry?.model);
  const [isLoading, setIsLoading] = useState(false);
  const showCombinerFeature = useFeatureFlag(`${env}-combiner-accessory`);

  const checkXNodes = useCallback((nodes: XNodes) => {
    const data = Object.keys(nodes).reduce((acc, key) => {
      if (nodes[key].tLost === 0 || nodes[key].tLost < nodes[key].tConn) {
        if (nodes[key].hostId.startsWith(Accessories.ESCAPE_SCREEN)) {
          return { ...acc, escapeScreen: { ...nodes[key], id: key } };
        }
        if (nodes[key].hostId.startsWith(Accessories.COMBINER)) {
          return { ...acc, combiner: { ...nodes[key], id: key } };
        }
        return { ...acc, tanksPro: { ...acc?.tanksPro, [key]: nodes[key] } };
      }
      return acc;
    }, {} as Record<string, any>);
    setAccessories(data);
  }, []);

  useMount(() => {
    async function fetchData() {
      try {
        setIsLoading(true);
        let nodes = device6G?.device?.xNodes || {};
        //get latest device data if direct connection
        if (isYeti20004000(device) && device?.isDirectConnection) {
          const response = await getDeviceInfo(device?.peripheralId || '');
          if (response.ok && response.data) {
            nodes = response.data?.xNodes || nodes;
          }
        }

        //filter out xNodes with tLost > 0 (disconnected)
        checkXNodes(nodes);
      } catch {
        //error
      } finally {
        setIsLoading(false);
      }
    }

    fetchData();
  });

  useEffect(() => {
    const nodes = device6G?.device?.xNodes || {};

    checkXNodes(nodes);
  }, [checkXNodes, device6G?.device?.xNodes]);

  return (
    <View style={ApplicationStyles.mainContainer}>
      <Header title="Connected Accessories" />
      <ScrollView style={styles.container}>
        <Row
          withBorder={false}
          icon={renderElement(<InformationIcon />)}
          body={renderElement(
            <>
              <Text style={Fonts.font.base.bodyOne}>Visit Goal Zero's website to shop for more products.</Text>
              <Pressable onPress={() => openLink(LINKS.goalZeroHome)}>
                <Text style={ApplicationStyles.textGreen}>www.goalzero.com</Text>
              </Pressable>
            </>,
          )}
        />

        <InformationRow
          style={styles.infoRow}
          textStyle={styles.textStyle}
          title={isLegacy ? 'Link' : 'Escape Screen'}
          titleStyle={
            isLegacy
              ? { color: isLinkConnected ? Colors.white : Colors.gray }
              : { color: accessories?.escapeScreen ? Colors.white : Colors.gray }
          }
          addLeftIcon={
            isLegacy ? (
              <Text style={[styles.linkIcon, { color: isLinkConnected ? Colors.white : Colors.grayDisable }]}>
                LINK
              </Text>
            ) : (
              <EscapeIcon color={accessories?.escapeScreen ? Colors.escape : Colors.grayDisable} />
            )
          }
          subTitle={
            isLegacy
              ? 'The LINK connection is shown when a Link is detected on the expansion port.'
              : 'The Escape Screen icon is shown when it is detected on the High Voltage DC input port.'
          }
          disabled={(isYeti20004000(device) && !accessories?.escapeScreen) || (isLegacy && !isLinkConnected)}
          onPress={() => {
            if (isLegacy) {
              navigation.navigate('Link', { device: legacyDevice });
            } else {
              navigation.navigate('EscapeScreen', {
                device: device6G,
                escapeScreen: accessories?.escapeScreen as { id: string },
              });
            }
          }}
          trimSubTitle={false}
        />

        <InformationRow
          style={styles.infoRow}
          textStyle={styles.textStyle}
          title={isLegacy ? 'MPPT' : 'Tank PRO'}
          titleStyle={
            isLegacy
              ? { color: isMPTTConnected ? Colors.white : Colors.gray }
              : { color: accessories?.tanksPro ? Colors.white : Colors.gray }
          }
          addLeftIcon={
            isLegacy ? (
              <MPTTIcon style={styles.mpttIcon} color={isMPTTConnected ? Colors.white : Colors.grayDisable} />
            ) : (
              <TankProIcon color={accessories?.tanksPro ? Colors.green : Colors.grayDisable} />
            )
          }
          subTitle={
            isLegacy
              ? 'The MPPT connection is shown when a MPPT accessory is detected on the expansion port.'
              : 'Tank PRO expansion battery.'
          }
          disabled={(isYeti20004000(device) && !accessories?.tanksPro) || (isLegacy && !isMPTTConnected)}
          onPress={() => {
            if (accessories?.tanksPro || isMPTTConnected) {
              if (isLegacy) {
                navigation.navigate('Mptt', { device: legacyDevice });
              } else {
                navigation.navigate('TankPro', { device: device6G, tanksPro: accessories?.tanksPro });
              }
            }
          }}
          trimSubTitle={false}
        />

        {showCombinerFeature && !isLegacy && (
          <View>
            <InformationRow
              style={styles.infoRow}
              textStyle={styles.textStyle}
              title="Yeti Series Combiner"
              titleStyle={{ color: accessories?.combiner ? Colors.white : Colors.gray }}
              addLeftIcon={
                <View style={styles.combinerIcon}>
                  <Combinercon color={accessories?.combiner ? Colors.combiner : Colors.grayDisable} />
                </View>
              }
              subTitle="The Yeti Series Combiner syncs two yetis to support up to 240V/30A AC output."
              disabled={!accessories?.combiner}
              onPress={() => {
                navigation.navigate('Combiner', { device: device6G, id: accessories?.combiner?.id });
              }}
              trimSubTitle={false}
            />
            {!accessories?.combiner && (
              <View style={styles.sectionCombinerInfo}>
                <InformationIcon style={styles.smallIconInfo} width={15} height={15} />
                <Text style={styles.textCombinerInfo}>
                  AC output must be turned on for this accessory to be detected
                </Text>
              </View>
            )}
          </View>
        )}
      </ScrollView>
      <Spinner visible={isLoading} />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: Metrics.baseMargin,
    paddingVertical: Metrics.marginSection,
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
  textCombinerInfo: {
    ...Fonts.font.base.bodyOne,
    fontSize: 10,
    color: Colors.disabled,
    marginLeft: 10,
  },
  mpttIcon: {
    marginLeft: 3,
    marginRight: 8,
  },
  combinerIcon: {
    width: 32,
    height: 32,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: Metrics.halfMargin,
  },
  smallIconInfo: {
    marginLeft: 5,
    marginRight: Metrics.smallMargin,
  },
  sectionCombinerInfo: {
    flexDirection: 'row',
    marginHorizontal: Metrics.baseMargin,
    alignItems: 'center',
  },
});

export default ConnectedAccessories;
