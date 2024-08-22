import React from 'react';
import { View, StyleSheet, Text } from 'react-native';

import { Colors, Fonts, Metrics } from 'App/Themes';
import Pressable from 'App/Components/Pressable';
import { WithTopBorder } from 'App/Hoc';

type Props = {
  title: string;
  isSelected: boolean;
  onPress: () => void;
  subTitle?: string;
};

function SelectDevice(props: Props) {
  return (
    <WithTopBorder testID="selectDevice" contentStyle={styles.container}>
      <Pressable testID="selectDevicePress" style={styles.sectopnPressable} onPress={props.onPress}>
        <View style={styles.sectionSelect}>
          <View style={[styles.selectMain, props.isSelected && styles.selected]}>
            {props.isSelected && <View style={styles.selectCenter} />}
          </View>
        </View>
        <View style={styles.sectionMain}>
          <Text style={styles.textTitle}>{props.title}</Text>
          <Text style={styles.textSubTitle}>{props.subTitle}</Text>
        </View>
      </Pressable>
    </WithTopBorder>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingVertical: Metrics.smallMargin,
  },
  sectopnPressable: {
    flexDirection: 'row',
  },
  sectionMain: {
    flex: 1,
    paddingLeft: Metrics.halfMargin,
    paddingRight: Metrics.halfMargin,
  },
  sectionSelect: {
    width: 32,
    height: 32,
    justifyContent: 'center',
    alignItems: 'center',
  },
  selectMain: {
    width: 20,
    height: 20,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
    borderColor: Colors.transparentWhite('0.87'),
    borderWidth: 2,
  },
  selected: {
    borderColor: Colors.green,
  },
  selectCenter: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: Colors.green,
  },
  textTitle: {
    ...Fonts.font.base.bodyTwo,
    color: Colors.transparentWhite('0.87'),
  },
  textSubTitle: {
    ...Fonts.font.base.bodyOne,
  },
});

export default SelectDevice;
