import React from 'react';
import { StyleSheet, Text, View, ViewStyle } from 'react-native';
import { Colors, Fonts, Metrics } from 'App/Themes';

type Props = {
  errorList: string[];
  style?: ViewStyle;
  accessibilityLabel?: string;
};

const ValidationErrorList = ({ errorList, style, accessibilityLabel }: Props) => {
  const accessibleProps = accessibilityLabel ? { accessible: true, accessibilityLabel: accessibilityLabel } : {};

  return (
    <View style={style} {...accessibleProps}>
      {errorList.map((errorMessage: string) => (
        <Text key={errorMessage} style={styles.textSubtitle}>
          <Text style={styles.textAttention}>*</Text> {errorMessage}
        </Text>
      ))}
    </View>
  );
};

const styles = StyleSheet.create({
  textSubtitle: {
    ...Fonts.font.base.caption,
    color: Colors.transparentWhite('0.87'),
    marginTop: Metrics.smallMargin,
  },
  textAttention: {
    color: Colors.severity.red,
  },
});

export default ValidationErrorList;
