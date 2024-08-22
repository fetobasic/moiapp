import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

import { Colors, Fonts, Metrics } from 'App/Themes';

import ArrowRightIcon from 'App/Images/Icons/arrowRight.svg';
import ArrowRightDisabled from 'App/Images/Icons/arrowRightDisabled.svg';

import { Pressable } from 'App/Components';

type Props = {
  onPress: () => void;
  isDisabled?: boolean;
};

function YetiEnergy({ onPress, isDisabled }: Props) {
  return (
    <View>
      <Pressable style={styles.sectionTop} onPress={onPress}>
        <Text style={[styles.textHeader, { color: isDisabled ? Colors.disabled : Colors.transparentWhite('0.87') }]}>
          Energy History
        </Text>
        {isDisabled ? <ArrowRightDisabled /> : <ArrowRightIcon />}
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  sectionTop: {
    flexDirection: 'row',
    paddingVertical: Metrics.smallMargin,
    paddingRight: Metrics.smallMargin,
  },
  textHeader: {
    marginTop: Metrics.smallMargin / 2,
    marginLeft: Metrics.smallMargin,
    ...Fonts.font.base.caption,
    flex: 1,
  },
});

export default YetiEnergy;
