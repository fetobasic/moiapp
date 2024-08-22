import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

import { Colors, Fonts } from 'App/Themes';

type Props = {
  icon: () => React.ReactElement;
  title: string;
  disabled?: boolean;
};

function HomeIcon(props: Props) {
  return (
    <View testID="homeIcon" style={[styles.container, props.disabled && styles.disabled]}>
      <View style={styles.sectionIcon}>{props.icon()}</View>
      <Text style={styles.textTitle}>{props.title}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    height: 64,
    width: 64,
    alignItems: 'center',
  },
  disabled: {
    opacity: 0.09,
  },
  sectionIcon: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  textTitle: {
    ...Fonts.font.base.caption,
    color: Colors.transparentWhite('0.87'),
  },
});

export default HomeIcon;
