import React from 'react';
import { View, StyleSheet, Text } from 'react-native';

import { Colors, Fonts, Metrics } from 'App/Themes';
import Pressable from 'App/Components/Pressable';
import { WiFiList } from 'App/Types/Yeti';
import { getWifiLevelIcon } from 'App/Services/Yeti';

type Props = {
  item: WiFiList;
  isSelected: boolean;
  isLast: boolean;
  onPress: () => void;
};

function SelectWiFi(props: Props) {
  return (
    <View testID="selectWifi" style={styles.container}>
      <Pressable
        testID="selectWifiPress"
        style={[styles.sectopnPressable, props.isLast && styles.noBorder]}
        onPress={props.onPress}>
        <View style={styles.sectionSelect}>
          <View style={[styles.selectMain, props.isSelected && styles.selected]}>
            {props.isSelected && <View style={styles.selectCenter} />}
          </View>
        </View>
        <View style={styles.sectionMain}>
          <Text style={styles.textTitle}>{props.item.name}</Text>
        </View>
        {getWifiLevelIcon(props.item.db)}
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: Colors.transparentWhite('0.09'),
    paddingHorizontal: Metrics.baseMargin,
  },
  sectopnPressable: {
    flexDirection: 'row',
    paddingVertical: Metrics.halfMargin,
    alignItems: 'center',
    borderBottomColor: Colors.transparentWhite('0.12'),
    borderBottomWidth: 1,
  },
  noBorder: {
    borderBottomWidth: 0,
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
    ...Fonts.font.base.bodyOne,
    color: Colors.transparentWhite('0.87'),
  },
});

export default SelectWiFi;
