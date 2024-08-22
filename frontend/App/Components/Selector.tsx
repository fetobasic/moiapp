import React from 'react';
import { StyleSheet, Pressable, View } from 'react-native';

import { TextInput } from 'App/Components';
import type { Props as TextInputType } from './TextInput';

import ArrowRightIcon from 'App/Images/Icons/arrowRight.svg';

type Props = TextInputType & {
  iconValue?: React.ReactNode;
  onPress?: () => void;
};

function Selector({ containerStyle, iconValue, onPress, ...props }: Props) {
  return (
    <Pressable style={containerStyle} onPress={onPress} testID="selector">
      <TextInput {...props} onFocus={onPress} editable={false} />
      <ArrowRightIcon style={styles.icon} />
      {!!iconValue && <View style={styles.iconValue}>{iconValue}</View>}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  icon: {
    position: 'absolute',
    bottom: 15,
    right: 15,
    transform: [{ rotate: '90deg' }],
  },
  iconValue: {
    position: 'absolute',
    bottom: 15,
    left: 15,
  },
});

export default Selector;
