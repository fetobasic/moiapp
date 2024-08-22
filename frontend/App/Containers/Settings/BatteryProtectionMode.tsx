import React from 'react';
import { View, Text, ScrollView, StyleSheet } from 'react-native';
import { ApplicationStyles, Colors, Fonts, Metrics } from 'App/Themes';
import { HeaderSimple as Header, InfoRow } from 'App/Components';

import Information from 'App/Images/Icons/information.svg';
import renderElement from 'App/Services/RenderElement';

const BatteryProtectionMode = () => {
  const renderMode = (mode: string, body: string) => (
    <View style={styles.sectionInfo}>
      <Text style={[styles.textBody, styles.textDot]}>·</Text>
      <Text style={[styles.textBody, styles.textMain]}>
        <Text style={styles.textHighlight}>{mode}</Text> {body}
      </Text>
    </View>
  );

  return (
    <View style={ApplicationStyles.mainContainer}>
      <Header title="Battery Protection Mode" />
      <ScrollView style={styles.container}>
        <InfoRow
          withBorder={false}
          icon={renderElement(<Information />)}
          subTitle="You can select between LOW, MEDIUM, or HIGH protection modes.  The default mode is HIGH."
          subTitleTextStyles={styles.textBody}
        />
        {renderMode(
          'HIGH',
          "protection is best used when the fridge is plugged into a vehicle's 12V port. The fridge may still work when the engine is off depending on the vehicle.",
        )}
        {renderMode(
          'MEDIUM',
          "protection is a good compromise between battery life and fridge performance. It's a good choice if you're using the fridge with a smaller power station.",
        )}
        {renderMode('LOW', 'protection is the best used with a larger power station.')}

        <Text style={[styles.textBody, styles.textNote]}>
          <Text style={styles.textWarn}>NOTE: </Text>MEDIUM & LOW battery protection modes could drain your vehicle's
          battery preventing your vehicle from starting. If you see the F1 error message, it means you need to adjust
          protection from HIGH to MEDIUM or LOW.
        </Text>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: Metrics.halfMargin,
  },
  sectionInfo: {
    flexDirection: 'row',
    marginLeft: Metrics.halfMargin + 24 + Metrics.marginSection,
    marginRight: Metrics.baseMargin,
    marginBottom: Metrics.marginSection,
  },
  textMain: {
    marginLeft: Metrics.smallMargin,
  },
  textNote: {
    flex: 1,
    marginLeft: Metrics.halfMargin + 24 + Metrics.marginSection,
    marginRight: Metrics.baseMargin,
  },
  textBody: {
    ...Fonts.font.base.bodyOne,
    color: Colors.transparentWhite('0.87'),
  },
  textHighlight: {
    color: Colors.green,
  },
  textWarn: {
    color: Colors.portWarning,
  },
  textDot: {
    marginLeft: Metrics.halfMargin,
  },
});

export default BatteryProtectionMode;
