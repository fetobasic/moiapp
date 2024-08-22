import React from 'react';
import { View, StyleSheet, Text, ViewStyle } from 'react-native';

import { ApplicationStyles, Colors, Fonts, Metrics } from 'App/Themes';

type Props = {
  title: string;
  containerStyle?: ViewStyle;
  sectionStyle?: ViewStyle;
  children: React.ReactNode;
  disabled?: boolean;
};

function FullBorderInfo(props: Props) {
  return (
    <View style={[styles.container, props.containerStyle]}>
      <View style={styles.info}>
        <Text style={[styles.text, ApplicationStyles.flex, props.disabled && styles.textDisabled]}>{props.title}</Text>
      </View>
      <View style={[styles.mainSection, props.sectionStyle]}>{props.children}</View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: Metrics.smallMargin,
    borderColor: Colors.border,
    borderWidth: 1,
    borderRadius: 8,
    marginTop: Metrics.baseMargin,
  },
  mainSection: {
    marginTop: Metrics.smallMargin,
    marginBottom: Metrics.halfMargin,
    marginHorizontal: Metrics.marginSection,
  },
  info: {
    flexDirection: 'row',
    position: 'absolute',
    top: -10,
    paddingHorizontal: 4,
    marginLeft: 8,
    paddingLeft: 8,
    backgroundColor: Colors.background,
    justifyContent: 'space-between',
  },
  text: {
    ...Fonts.font.base.caption,
    color: Colors.transparentWhite('0.87'),
  },
  textDisabled: {
    color: Colors.disabled,
  },
});

export default FullBorderInfo;
