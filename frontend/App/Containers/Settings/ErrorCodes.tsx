import React from 'react';
import { View, Text, ScrollView, StyleSheet } from 'react-native';
import { ApplicationStyles, Colors, Fonts, Metrics } from 'App/Themes';
import { HeaderSimple as Header } from 'App/Components';

const ErrorCodes = () => {
  const renderCode = (code: string, title: string, body: string) => (
    <View style={styles.sectionMain}>
      <Text style={styles.textCode}>{code}</Text>
      <View style={styles.sectionTexts}>
        <Text style={styles.textTitle}>{title}</Text>
        <Text style={styles.textBody}>{body}</Text>
      </View>
    </View>
  );

  return (
    <View style={ApplicationStyles.mainContainer}>
      <Header title="Error Codes" />
      <ScrollView style={styles.container}>
        {renderCode(
          'F1',
          'Voltage Protection Mode',
          'Low voltage to the fridge. To continue using the fridge, change mode from HIGH to MEDIUM or MEDIUM to LOW.',
        )}
        {renderCode('F2', 'Current is Too High for Fan', 'Turn the fridge off and restart it after 5 minutes.')}
        {renderCode('F3', 'Compressor Frequently Restarting', 'Turn the fridge off and restart it after 5 minutes.')}
        {renderCode(
          'F4',
          'Compressor Overloaded',
          'Compressor will be operating at low speed. Turn the fridge off and restart it after 5 minutes.',
        )}
        {renderCode(
          'F5',
          'Compressor Overheated',
          'Move the fridge to a ventilated area, turn it off and restart it after 5 minutes. ',
        )}
        {renderCode('F6', 'No Parameters Detected', 'Restart the fridge. If error continues, contact support.')}
        {renderCode(
          'F7',
          'Temperature Sensor Short Circuit',
          'Restart the fridge. If error continues, contact support.',
        )}
        {renderCode('F8', 'Temperature Sensor Malfunction', 'Restart the fridge. If error continues, contact support.')}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: Metrics.baseMargin,
    marginVertical: Metrics.marginSection,
  },
  sectionMain: {
    flexDirection: 'row',
    marginLeft: Metrics.marginSection,
    marginBottom: Metrics.baseMargin,
  },
  sectionTexts: {
    flex: 1,
    marginLeft: Metrics.halfMargin,
  },
  textCode: {
    ...Fonts.font.condensed.h3,
  },
  textTitle: {
    ...Fonts.font.condensed.subtitleOne,
  },
  textBody: {
    ...Fonts.font.condensed.bodyOne,
    color: Colors.disabled,
  },
});

export default ErrorCodes;
