import React from 'react';
import { Text, StyleSheet } from 'react-native';
import { Colors, Fonts } from 'App/Themes';
import Pressable from './Pressable';

type Props = {
  title: string;
  style?: any;
  onPress: () => void;
  disabled?: boolean;
  accessibilityLabel?: string;
};

function ButtonSimple(props: Props) {
  const accessibleProps = props.accessibilityLabel
    ? { accessible: true, accessibilityLabel: props.accessibilityLabel }
    : {};

  return (
    <Pressable
      style={[props.disabled && styles.disabled, props.style]}
      {...accessibleProps}
      disabled={props.disabled}
      onPress={() => props.onPress()}>
      <Text style={[styles.textTitle]}>{props.title}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  disabled: {
    opacity: 0.5,
  },
  textTitle: {
    ...Fonts.font.base.bodyOne,
    color: Colors.green,
  },
});

export default ButtonSimple;
