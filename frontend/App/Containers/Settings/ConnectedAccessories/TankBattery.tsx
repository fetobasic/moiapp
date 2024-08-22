import React from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';
import { ApplicationStyles, Colors, Metrics } from 'App/Themes';
import { HeaderSimple as Header, InformationRow as Row } from 'App/Components';
import { useAppSelector } from 'App/Hooks';
import { convertTemperature } from 'App/Services/ConvertTemperature';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { SettingsStackParamList } from 'App/Types/NavigationStackParamList';
import { Yeti6GState } from 'App/Types/Yeti';

type Props = NativeStackScreenProps<SettingsStackParamList, 'TankBattery'>;

const TankBattery = ({ route }: Props) => {
  const { device, key } = route.params;
  const { temperature } = useAppSelector((state) => ({
    temperature: state.application.units.temperature,
  }));
  const xNodeDevice = (device as Yeti6GState)?.device?.xNodes?.[key];
  const xNodeStatus = (device as Yeti6GState)?.status?.xNodes?.[key];

  const tank = [
    [
      {
        title: 'Temperature',
        subTitle: 'The ambient battery pack/cell temperature.',
        description: convertTemperature(temperature, xNodeStatus?.cTmp),
      },
      {
        title: 'BMS Temperature',
        subTitle: 'The battery protection circuit temperature.',
        description: convertTemperature(temperature, xNodeStatus?.cTmp),
      },
      {
        title: 'Relative Humidity',
        subTitle: 'The ambient humidity percent.',
        description: `${xNodeStatus?.pctHtsRh} %`,
      },
    ],
    [
      { title: 'State of Charge', subTitle: 'Remaining battery charge.', description: `${xNodeStatus?.soc} %` },
      { title: 'State of Health', subTitle: 'Remaining battery capacity.', description: `${xNodeDevice?.soh} %` },
      {
        title: 'Battery Voltage',
        subTitle: 'The amount of electrical potential the battery holds.',
        description: `${xNodeStatus?.v} V`,
      },
    ],
    [
      { title: 'Net Power', description: `${xNodeDevice?.whIn} W` },
      { title: 'Net Current', description: `${xNodeDevice?.whOut} A` },
      {
        title: 'Stored Energy',
        subTitle: 'Energy from 0% to current charge.',
        description: `${xNodeStatus?.whRem} Wh`,
      },
      {
        title: 'C Rating',
        subTitle: 'C-rating measures the speed at which a battery is fully charged or discharged.',
        description: `${xNodeStatus?.wNet / xNodeDevice?.whCap} C`,
      },
    ],
    [{ title: 'Lifetime Battery Cycles', description: `${xNodeDevice?.cyc}` }],
  ];

  return (
    <View style={ApplicationStyles.mainContainer}>
      <Header title="Tank Battery" />
      <ScrollView style={styles.container} contentContainerStyle={styles.scrollView}>
        {tank.map((item) => (
          <View style={styles.section}>
            {item.map(({ title, subTitle, description }, index) => (
              <>
                <Row
                  key={title}
                  title={title}
                  subTitle={subTitle}
                  description={description}
                  contentStyle={styles.content}
                  trimSubTitle={false}
                />
                {index !== item.length - 1 && <View style={styles.divider} />}
              </>
            ))}
          </View>
        ))}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: Metrics.marginSection,
  },
  scrollView: {
    paddingBottom: 40,
  },
  section: {
    borderColor: Colors.border,
    borderWidth: 1,
    marginBottom: Metrics.marginSection,
    borderRadius: Metrics.batteryRadius,
    paddingHorizontal: Metrics.batteryRadius,
  },
  divider: {
    height: 1,
    backgroundColor: Colors.border,
  },
  content: {
    borderWidth: 1,
    borderColor: 'red',
  },
});

export default TankBattery;
