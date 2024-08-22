import React from 'react';
import { StyleSheet, ScrollView, View, Image, Text } from 'react-native';
import { ApplicationStyles, Colors, Fonts, Metrics } from 'App/Themes';
import { HeaderSimple as Header, SectionWithTitle } from 'App/Components';

import Information from 'App/Images/Icons/information.svg';

const AcCurrentLimitsHelp = () => {
  const data = [
    {
      text: (
        <Text>
          Out of the box, the Yeti’s AC Limit Setting is set to LOW. This ensures that when first plugged into charge,
          the Yeti is less likely to overload the circuit it’s plugged in to.
        </Text>
      ),
      img: require('App/Images/InverterController/AcLimits1.png'),
    },
    {
      text: (
        <Text>
          When an AC output load draws <Text style={{ color: Colors.green }}>LESS</Text> power than the configured{' '}
          <Text style={{ color: Colors.green }}>AC Input Limit</Text>, the Yeti will operate in{' '}
          <Text style={styles.textItalic}>APS</Text> mode. In <Text style={styles.textItalic}>APS</Text> mode, the Yeti
          will pass AC power directly from the AC inputs to the AC outputs. This is more energy efficient and reduces
          wear on the Yeti’s battery.
        </Text>
      ),
      img: require('App/Images/InverterController/AcLimits2.png'),
    },
    {
      text: (
        <Text>
          When the Yeti’s AC output load draws <Text style={{ color: Colors.red }}>MORE</Text> power than the configured{' '}
          <Text style={{ color: Colors.green }}>AC Input Limit</Text>, the Yeti will disable{' '}
          <Text style={styles.textItalic}>APS</Text> mode and start using the battery to power the AC device.
        </Text>
      ),
      img: require('App/Images/InverterController/AcLimits3.png'),
    },
    {
      text: (
        <Text>
          The <Text style={{ color: Colors.green }}>AC Charge Limit</Text> is a configurable setting that limits the
          current from the AC input ports into the <Text style={{ color: Colors.green }}>Battery</Text>. When the AC
          output load draws <Text style={{ color: Colors.green }}>LESS</Text> than the difference of the{' '}
          <Text style={{ color: Colors.green }}>AC Input Limit</Text> minus the{' '}
          <Text style={{ color: Colors.green }}>AC Charge Limit</Text>, the{' '}
          <Text style={{ color: Colors.green }}>Battery</Text> can charge up to the configured{' '}
          <Text style={{ color: Colors.green }}>AC Charge Limit</Text>.
        </Text>
      ),
      img: require('App/Images/InverterController/AcLimits4.png'),
    },
    {
      text: (
        <Text>
          When the AC output load is <Text style={{ color: Colors.red }}>MORE</Text> than the difference of the{' '}
          <Text style={{ color: Colors.green }}>AC Input Limit</Text> minus the{' '}
          <Text style={{ color: Colors.green }}>AC Charge Limit</Text>, the Yeti will stay in{' '}
          <Text style={styles.textItalic}>APS</Text> mode, powering the load from the AC power source and may continue
          to charge the <Text style={{ color: Colors.green }}>Battery</Text> using the remainder* of the{' '}
          <Text style={{ color: Colors.green }}>AC Input Limit</Text> minus the AC output load.
          <Text style={styles.textSubtitle}>
            {'\n\n'}*If the remainder current is lower than the minimum charge limit, no charging will occur.
          </Text>
        </Text>
      ),
      img: require('App/Images/InverterController/AcLimits5.png'),
    },
  ];

  return (
    <View style={ApplicationStyles.mainContainer}>
      <Header title="Help" subTitle="APS Mode & AC Current Limits" />
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
  textSubtitle: {
    ...Fonts.font.base.caption,
    fontSize: 10,
    color: Colors.disabled,
  },
  img: {
    width: '100%',
    resizeMode: 'contain',
  },
});

export default AcCurrentLimitsHelp;
