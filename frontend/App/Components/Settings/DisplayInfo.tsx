import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

import { Pressable } from 'App/Components';

import { Colors, Fonts, Metrics } from 'App/Themes';

type KeyType = 'FAHRENHEIT' | 'CELSIUS' | 'V120' | 'V230';
type ParamType = 'temperature' | 'voltage';

type Props = {
  title: string;
  data: {
    key: string;
    name: string;
  }[];
  selected?: {
    key: string;
    name: string;
  };
  param: ParamType;
  onChange: (param: ParamType, value: KeyType) => void;
};

function DisplayInfo(props: Props) {
  return (
    <View testID="displayInfo">
      <Text style={styles.textInfo}>{props.title}</Text>
      {props.data.map((item, index) => (
        <View style={styles.sectionMain} key={item.key}>
          <View style={[styles.sectionBorder, index === props.data.length - 1 && styles.last]}>
            <Pressable
              testID={`displayInfo_${item.key}`}
              style={styles.sectionPressable}
              onPress={() => props.onChange(props.param, item.key as KeyType)}>
              <View style={[styles.check, props.selected?.key === item.key && styles.checkSeclected]}>
                {props.selected?.key === item.key && <View style={styles.round} />}
              </View>

              <Text style={styles.textValue}>{item.name}</Text>
            </Pressable>
          </View>
        </View>
      ))}
      <Text style={styles.textInfo}>
        {`${props.title} shown as ${props.selected?.name}. This does not change the functionality of your Yeti. Simply select the ${props.param} units you prefer.`}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  sectionMain: {
    backgroundColor: Colors.transparentWhite('0.09'),
    paddingHorizontal: Metrics.baseMargin,
  },
  sectionBorder: {
    borderBottomWidth: 1,
    borderBottomColor: Colors.transparentWhite('0.12'),
  },
  sectionPressable: {
    flexDirection: 'row',
    paddingVertical: Metrics.marginSection,
  },
  check: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 2,
    justifyContent: 'center',
    alignItems: 'center',
    borderColor: Colors.transparentWhite('0.87'),
  },
  round: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: Colors.green,
  },
  checkSeclected: {
    borderColor: Colors.green,
  },
  last: {
    borderBottomWidth: 0,
  },
  textInfo: {
    ...Fonts.font.base.caption,
    color: Colors.transparentWhite('0.6'),
    marginTop: Metrics.marginSection,
    marginLeft: Metrics.baseMargin,
    marginBottom: 4,
  },
  textValue: {
    ...Fonts.font.base.bodyTwo,
    color: Colors.transparentWhite('0.87'),
    marginLeft: Metrics.baseMargin,
  },
});

export default DisplayInfo;
