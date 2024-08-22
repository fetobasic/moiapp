import React from 'react';
import { StyleSheet, ScrollView, View, Image, Text } from 'react-native';
import { ApplicationStyles, Colors, Fonts, Metrics } from 'App/Themes';
import { HeaderSimple as Header, SectionWithTitle } from 'App/Components';

import Information from 'App/Images/Icons/information.svg';

const AcProfileHelp = () => {
  const data = [
    {
      text: <Text>Out of the box, the Yeti’s AC Profile defaults to the USA 120V/60Hz standard.</Text>,
      img: require('App/Images/InverterController/AcProfile1.png'),
    },
    {
      text: (
        <Text>
          When plugged into an AC power source for the first time, the Yeti will configure the AC Profile to match the
          AC power source.
        </Text>
      ),
      img: require('App/Images/InverterController/AcProfile2.png'),
    },
    {
      text: (
        <Text>
          Now the Yeti can be used in <Text style={styles.textItalic}>APS</Text> (AC passthrough) mode, providing a
          reliable backup solution to AC-powered devices that match the configured AC Profile.
        </Text>
      ),
      img: require('App/Images/InverterController/AcProfile3.png'),
    },
    {
      text: (
        <Text>
          If the AC Input does not match the configured AC Profile, <Text style={styles.textItalic}>APS</Text> mode will
          be disabled and the Yeti’s <Text style={{ color: Colors.green }}>Battery</Text> will be used as the power
          source.
        </Text>
      ),
      img: require('App/Images/InverterController/AcProfile4.png'),
    },
    {
      text: <Text>The AC Profile can be changed on-device in the settings on some Yeti models.</Text>,
    },
  ];

  return (
    <View style={ApplicationStyles.mainContainer}>
      <Header title="Help" subTitle="APS Mode & AC Profile" />
      <ScrollView style={styles.container}>
        {data.map((item, index) => (
          <SectionWithTitle key={`${index}`}>
            <View style={styles.sectionText}>
              <Information />
              <Text style={styles.text}>{item.text}</Text>
            </View>
            {!!item.img && <Image source={item.img} style={styles.img} />}
          </SectionWithTitle>
        ))}
        <View style={styles.bottom} />
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: Metrics.marginSection,
  },
  bottom: {
    height: Metrics.bigMargin,
  },
  sectionText: {
    flexDirection: 'row',
    marginBottom: Metrics.marginVertical,
  },
  text: {
    ...Fonts.font.base.caption,
    flex: 1,
    marginHorizontal: Metrics.marginSection,
  },
  textItalic: {
    fontStyle: 'italic',
    fontWeight: '700',
  },
  img: {
    width: '100%',
    resizeMode: 'contain',
  },
});

export default AcProfileHelp;
