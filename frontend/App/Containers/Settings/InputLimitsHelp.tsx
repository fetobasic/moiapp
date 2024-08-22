import React from 'react';
import { StyleSheet, View } from 'react-native';
import { ApplicationStyles, Metrics } from 'App/Themes';
import { HeaderSimple as Header, SectionWithTitle, InformationRow } from 'App/Components';
import { useSettingsNavigation } from 'App/Hooks';

const InputLimitsHelp = () => {
  const navigation = useSettingsNavigation('InputLimitsHelp');

  return (
    <View style={ApplicationStyles.mainContainer}>
      <Header title="Help" subTitle="AC Inverter/Charger" />
      <View style={styles.container}>
        <SectionWithTitle>
          <InformationRow title="APS Mode & AC Profile" onPress={() => navigation.navigate('AcProfileHelp')} />
          <InformationRow
            title="APS Mode & AC Current Limits"
            titleStyle={{ maxWidth: undefined }}
            onPress={() => navigation.navigate('AcCurrentLimitsHelp')}
          />
        </SectionWithTitle>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: Metrics.marginSection,
  },
});

export default InputLimitsHelp;
