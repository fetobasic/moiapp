import React from 'react';
import { View, Text, StyleSheet, ViewStyle } from 'react-native';

import { Pressable } from 'App/Components';
import { YetiState } from 'App/Types/Yeti';
import { Colors, Fonts, Metrics } from 'App/Themes';

import ArrowRight from 'App/Images/Icons/arrowRight.svg';

type Props = {
  title: string;
  device: YetiState;
  onPress: () => void;
  children: React.ReactNode;
  style?: ViewStyle;
  disabled?: boolean;
};

function HomeTile(props: Props) {
  return (
    <View testID="homeTile" style={[styles.container, props.disabled && styles.disabled, props.style]}>
      <Pressable testID="homeTileBtn" disabled={props.disabled} style={styles.sectionHeader} onPress={props.onPress}>
        <Text style={styles.textTitle}>{props.title}</Text>
        <ArrowRight />
      </Pressable>
      {props.children}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.transparentWhite('0.09'),
    marginTop: Metrics.marginSection,
    marginHorizontal: Metrics.baseMargin,
    padding: Metrics.marginSection,
  },
  sectionHeader: {
    flexDirection: 'row',
  },
  textTitle: {
    ...Fonts.font.base.caption,
    color: Colors.transparentWhite('0.87'),
    flex: 1,
  },
  disabled: {
    opacity: 0.5,
  },
});

export default HomeTile;
