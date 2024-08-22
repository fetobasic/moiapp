import React, { ReactElement } from 'react';
import { StyleSheet, Text, View, ViewStyle } from 'react-native';
import Checked from 'App/Images/Icons/radio-button-checked.svg';
import UnChecked from 'App/Images/Icons/radio-button-unchecked.svg';
import { WithPressable } from 'App/Hoc';
import { Fonts, Metrics } from 'App/Themes';
import { isString } from 'lodash';

type Props = {
  title: string;
  subTitle?: string | (() => ReactElement);
  checked: boolean;
  onPress: () => void;
  nativePress?: boolean;
  containerStyle?: ViewStyle;
  rightIcon?: ReactElement;
};

const SingleRadioButton = ({ title, subTitle, checked, onPress, nativePress, containerStyle, rightIcon }: Props) => {
  return (
    <WithPressable onPress={onPress} nativePress={nativePress}>
      <View style={[styles.container, containerStyle]}>
        {checked ? <Checked /> : <UnChecked />}
        <View style={styles.content}>
          <View style={styles.titleWrapper}>
            <Text style={styles.title}>{title}</Text>
            {subTitle && isString(subTitle) && <Text style={styles.subTitle}>{subTitle}</Text>}
            {!isString(subTitle) && <View style={styles.subTitleCustom}>{subTitle?.()}</View>}
          </View>
          {rightIcon && rightIcon}
        </View>
      </View>
    </WithPressable>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    padding: Metrics.smallMargin,
  },
  content: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  titleWrapper: {
    marginLeft: Metrics.marginSection,
  },
  title: {
    ...Fonts.font.base.bodyTwo,
    marginBottom: 2,
  },
  subTitle: {
    ...Fonts.font.base.bodyOne,
  },
  subTitleCustom: {
    marginTop: 2,
  },
});

export default SingleRadioButton;
