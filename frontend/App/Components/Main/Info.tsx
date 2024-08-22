import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

import { ApplicationStyles, Colors, Fonts, Metrics } from 'App/Themes';

type Props = {
  icon?: () => React.ReactElement;
  title: string;
  description?: string;
  titleColor?: string;
  isFirst?: boolean;
  info?: string;
};

function PortInfo(props: Props) {
  return (
    <View testID="info" style={[styles.container, props.isFirst && styles.first]}>
      <View style={[styles.sectionMain, props.isFirst && styles.noBorder]}>
        <View style={ApplicationStyles.row}>
          {props.icon && <View style={styles.sectionIcon}>{props.icon()}</View>}
          {!!props.info && <Text style={styles.textInfo}>{props.info}</Text>}
          <Text
            style={[
              styles.textTitle,
              props.isFirst && !!props.titleColor && { ...styles.textTitleFirst, color: props.titleColor },
            ]}>
            {props.title}
          </Text>
        </View>
        {!!props.description && <Text style={styles.textDescription}>{props.description}</Text>}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: Colors.transparentWhite('0.09'),
    paddingHorizontal: Metrics.baseMargin,
  },
  first: {
    marginTop: Metrics.marginSection,
  },
  sectionMain: {
    paddingVertical: Metrics.marginSection,
    borderTopColor: Colors.transparentWhite('0.12'),
    borderTopWidth: 1,
  },
  noBorder: {
    borderTopWidth: 0,
  },
  sectionIcon: {
    width: 32,
    height: 32,
    alignItems: 'center',
  },
  textTitle: {
    ...Fonts.font.base.bodyTwo,
    color: Colors.transparentWhite('0.87'),
    marginLeft: Metrics.halfMargin,
  },
  textTitleFirst: {
    ...Fonts.font.condensed.h3,
    color: Colors.transparentWhite('0.87'),
  },
  textDescription: {
    ...Fonts.font.base.bodyOne,
    color: Colors.transparentWhite('0.6'),
    marginLeft: 46,
  },
  textInfo: {
    ...Fonts.font.condensed.subtitleOne,
    color: Colors.transparentWhite('0.6'),
    fontWeight: '700',
  },
});

export default PortInfo;
