import React from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';
import { ApplicationStyles, Colors, Metrics } from 'App/Themes';
import { HeaderSimple as Header, InformationRow as Row, SectionWithTitle } from 'App/Components';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { SettingsStackParamList } from 'App/Types/NavigationStackParamList';
import { Yeti6GState } from 'App/Types/Yeti';
import { Accessories } from 'App/Config/Accessory';

type Props = NativeStackScreenProps<SettingsStackParamList, 'TankPro'>;

const TankPro = ({ navigation, route }: Props) => {
  const { device, tanksPro } = route.params;

  const tanks = Object.keys(tanksPro).map((key, index) => ({
    title: `Tank ${index + 1}`,
    rows: [
      {
        title: 'Model',
        description: tanksPro[key]?.hostId?.startsWith(Accessories.TANK_PRO_4000) ? 'Tank PRO 4000' : 'Tank PRO 1000',
      },
      {
        title: 'Device ID',
        description: tanksPro[key]?.sn,
        numberOfLines: 2,
      },
      { title: 'Firmware Version', description: tanksPro[key]?.fw },
      { title: 'State of Charge', description: `${(device as Yeti6GState)?.status?.xNodes?.[key]?.soc} %` },
      { title: 'Battery', onPress: () => navigation.navigate('TankBattery', { device: device, key }) },
    ],
  }));

  return (
    <View style={ApplicationStyles.mainContainer}>
      <Header title="Tank PRO" />
      <ScrollView style={styles.container} contentContainerStyle={styles.scrollContent}>
        {tanks.map(({ title: sectionTitle, rows }) => (
          <SectionWithTitle title={sectionTitle} key={sectionTitle}>
            {rows.map(({ title: rowTitle, description, onPress, numberOfLines }) => (
              <Row
                key={rowTitle}
                title={rowTitle}
                description={description}
                descriptionStyle={{ color: Colors.gray }}
                onPress={onPress}
                numberOfDescriptionLines={numberOfLines}
              />
            ))}
          </SectionWithTitle>
        ))}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: Metrics.marginSection,
    paddingVertical: Metrics.baseMargin,
  },
  scrollContent: {
    paddingBottom: 45,
  },
});

export default TankPro;
