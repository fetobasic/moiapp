import React from 'react';
import { Text, StyleSheet, View, ViewStyle } from 'react-native';
import { ApplicationStyles, Colors, Fonts, Metrics } from 'App/Themes';

import CheckIcon from 'App/Images/Icons/check.svg';
import Pressable from './Pressable';
import { WithPressable } from 'App/Hoc';

type Props = {
  title?: string;
  style?: ViewStyle;
  body?: () => React.ReactElement;
  value: boolean;
  onPress: () => void;
  disabled?: boolean;
  roundCheckbox?: boolean;
  bodyStyle?: ViewStyle;
  hasBorder?: boolean;
  accessibilityLabelCheckBox?: string;
  accessibilityTestIdCheckBox?: string;
};

function CheckBox(props: Props) {
  const accessiblePropsCheckBox = props.accessibilityLabelCheckBox
    ? {
        accessible: true,
        accessibilityLabel: props.accessibilityLabelCheckBox,
        testID: props.accessibilityTestIdCheckBox,
      }
    : {};

  const checkBoxBody = (
    <View accessible={false} style={[ApplicationStyles.flex, styles.container]}>
      <View
        style={[
          styles.checkBox,
          props.roundCheckbox && styles.roundCheckbox,
          props.bodyStyle && props.bodyStyle,
          props.value && styles.selected,
        ]}
        {...accessiblePropsCheckBox}>
        {props.value && <CheckIcon color={Colors.green} width={12} />}
      </View>
      {!!props.title && <Text style={[styles.textTitle]}>{props.title}</Text>}
      {props.body && props.body()}
    </View>
  );

  if (props.hasBorder) {
    return (
      <WithPressable
        onPress={() => props.onPress()}
        style={[ApplicationStyles.flex, props.disabled ? styles.disabled : {}, props.style ? props.style : {}]}>
        {checkBoxBody}
      </WithPressable>
    );
  }

  return (
    <Pressable
      accessible={false}
      disabled={props.disabled}
      onPress={() => props.onPress()}
      style={[styles.container, props.disabled && styles.disabled, props.style]}>
      {checkBoxBody}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    opacity: 1,
  },
  borderContainer: {
    flex: 1,
  },
  checkBox: {
    width: 18,
    height: 18,
    borderRadius: 2,
    borderWidth: 3,
    borderColor: Colors.transparentWhite('0.87'),
    marginTop: 2,
    marginRight: Metrics.marginSection,
    justifyContent: 'center',
    alignItems: 'center',
  },
  roundCheckbox: {
    borderRadius: 10,
    borderWidth: 2,
  },
  selected: {
    borderColor: Colors.green,
  },
  disabled: {
    opacity: 0.5,
  },
  textTitle: {
    ...Fonts.font.base.bodyOne,
    color: Colors.green,
  },
});

export default CheckBox;
