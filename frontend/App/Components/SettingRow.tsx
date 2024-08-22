import React from 'react';
import { View, Text, StyleProp, TextStyle, TouchableOpacity, Image, StyleSheet } from 'react-native';

import { Colors, Fonts, Images, Metrics } from 'App/Themes';

type Props = {
  title: string;
  onPress?: () => void;
  icon?: any;
  titleStyle?: StyleProp<TextStyle>;
};

function SettingRow({ title, onPress = () => {}, icon = Images.arrowForward, titleStyle = {} }: Props) {
  return (
    <View style={styles.rowSection}>
      <TouchableOpacity style={styles.row} onPress={() => onPress()}>
        <Text style={[styles.textTitle, titleStyle]}>{title}</Text>
        <Image source={icon} />
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  rowSection: {
    marginHorizontal: Metrics.marginSection,
    padding: 4,
    borderBottomColor: Colors.listBorder,
    borderBottomWidth: 1,
  },
  row: {
    flexDirection: 'row',
    paddingVertical: 17,
    alignItems: 'center',
  },
  textTitle: {
    ...Fonts.font.base.subtitleTwo,
    flex: 1,
    color: Colors.highEmphasis,
  },
});

export default SettingRow;
