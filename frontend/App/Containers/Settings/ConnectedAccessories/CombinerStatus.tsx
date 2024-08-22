import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';

import { ApplicationStyles, Colors, Fonts, Metrics } from 'App/Themes';
import { HeaderSimple as Header } from 'App/Components';
import { SettingsStackParamList } from 'App/Types/NavigationStackParamList';

type Props = NativeStackScreenProps<SettingsStackParamList, 'CombinerStatus'>;

const CombinerStatus = ({ route }: Props) => {
  const isYeti20004000 = route?.params?.isYeti20004000;

  return (
    <View style={ApplicationStyles.mainContainer}>
      <Header title="Yeti Series Combiner Status" />
      <View style={styles.container}>
        <View style={styles.row}>
          <View style={styles.sectionIcon}>
            <View style={[styles.statusIcon, styles.statusIconAvailable]} />
          </View>
          <View style={styles.textSection}>
            <Text style={styles.textTitle}>120V Available</Text>
            <Text style={styles.textSubTitle}>Green</Text>
            <Text style={styles.textDescription}>
              Only one Yeti detected. Waiting for the second Yeti to be connected.
            </Text>
          </View>
        </View>
        <View style={styles.row}>
          <View style={styles.sectionIcon}>
            <View style={[styles.statusIcon, styles.statusIconSyncing]} />
          </View>
          <View style={styles.textSection}>
            <Text style={styles.textTitle}>Syncing</Text>
            <Text style={styles.textSubTitle}>Yellow</Text>
            <Text style={styles.textDescription}>Syncing connected Yetis. They will be ready shortly.</Text>
          </View>
        </View>
        <View style={styles.row}>
          <View style={styles.sectionIcon}>
            <View style={[styles.statusIcon, styles.statusIconActive]} />
          </View>
          <View style={styles.textSection}>
            <Text style={styles.textTitle}>240V / {isYeti20004000 ? '30' : '15'}A Active</Text>
            <Text style={styles.textSubTitle}>Blue</Text>
            <Text style={styles.textDescription}>
              The Yetis are combined. You can now use 240V AC outputs up to {isYeti20004000 ? '30' : '15'} Amps.
            </Text>
          </View>
        </View>
      </View>
    </View>
  );
};

export default CombinerStatus;

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: Metrics.baseMargin,
    paddingVertical: Metrics.marginSection,
    flex: 1,
  },
  row: {
    flexDirection: 'row',
    paddingVertical: Metrics.smallMargin,
    paddingHorizontal: Metrics.marginSection,
    marginBottom: Metrics.marginSection,
  },
  sectionIcon: {
    width: 32,
    height: 32,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: Metrics.smallMargin,
  },
  statusIcon: {
    width: 12,
    height: 12,
    borderRadius: 6,
  },
  statusIconAvailable: {
    backgroundColor: Colors.combinerStatus.available,
  },
  statusIconSyncing: {
    backgroundColor: Colors.combinerStatus.syncing,
  },
  statusIconActive: {
    backgroundColor: Colors.combinerStatus.active,
  },
  textSection: {
    marginLeft: Metrics.smallMargin,
    marginRight: Metrics.baseMargin,
  },
  textTitle: {
    ...Fonts.font.base.bodyTwo,
    color: Colors.white,
  },
  textSubTitle: {
    ...Fonts.font.base.bodyTwo,
    fontSize: 10,
    lineHeight: 24,
    color: Colors.disabled,
  },
  textDescription: {
    ...Fonts.font.base.bodyOne,
    color: Colors.disabled,
  },
});
