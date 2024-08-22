import React from 'react';
import { View, ScrollView, StyleSheet, Text } from 'react-native';
import { HeaderSimple as Header, Info } from 'App/Components';
import { ApplicationStyles, Colors, Fonts, Metrics } from 'App/Themes';
import renderElement from 'App/Services/RenderElement';
import WorldIcon from 'App/Images/Icons/world.svg';
import CombinerIcon from 'App/Images/Icons/combiner24.svg';
import TanksIcon from 'App/Images/Icons/tanks24.svg';
import { openLink } from 'App/Services/Linking';
import Links from 'App/Config/Links';

function AccessoriesInfo() {
  const colorDisabled = Colors.transparentWhite('0.87');

  return (
    <View style={ApplicationStyles.mainContainer}>
      <Header title="Accessories" />
      <ScrollView>
        <View style={styles.sectionInfo}>
          <View style={ApplicationStyles.row}>
            <WorldIcon />
            <Text style={styles.textTitle}>Goal Zero</Text>
          </View>
          <Text style={styles.textSubtitle}>
            Visit the website of Goal Zero to view and order more devices.{' '}
            <Text style={styles.textLink} onPress={() => openLink(Links.goalZeroHome)}>
              www.goalzero.com
            </Text>
          </Text>
        </View>
        <Info
          icon={renderElement(<CombinerIcon color={colorDisabled} />)}
          title="Combiner"
          description="Yeti inverter is paired with another Yeti inverter AND They're synchronized and ready to use in PARALLEL."
        />
        <Info
          info="LINK"
          title="Yeti Link"
          description="Recharge from the sun by connecting a compatible solar panel. Charge times are dependent on the size of the solar panel."
        />
        <Info
          icon={renderElement(<TanksIcon color={colorDisabled} />)}
          title="Tanks"
          description="Each Yeti Tank Lead Acid battery adds 1,200 Watt Hours of energy storage to your system. "
        />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  sectionInfo: {
    marginTop: Metrics.marginSection,
    marginHorizontal: Metrics.baseMargin,
  },
  textTitle: {
    marginLeft: Metrics.halfMargin,
    ...Fonts.font.condensed.h3,
  },
  textSubtitle: {
    marginTop: Metrics.smallMargin,
    marginLeft: 48,
    ...Fonts.font.base.bodyOne,
    color: Colors.transparentWhite('0.87'),
  },
  textLink: {
    color: Colors.green,
  },
});

export default AccessoriesInfo;
