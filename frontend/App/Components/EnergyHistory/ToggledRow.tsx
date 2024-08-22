import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

import { ApplicationStyles, Colors, Fonts } from 'App/Themes';
import { WithTopBorder } from 'App/Hoc';
import { Switch } from 'App/Components';

type Row = {
  title: string;
  totalValue: string;
  trackColor: string;
  switchValue: boolean;
  onPress: (...args: any[]) => void;
};

const ToggledRow = ({ title, totalValue, trackColor, switchValue, onPress }: Row) => {
  return (
    <WithTopBorder>
      <View style={[styles.row, styles.center]} testID="toggledRow">
        <View style={ApplicationStyles.flex}>
          <Text style={styles.textTitle}>{title}</Text>
        </View>
        <View style={[styles.switchContainer, styles.center]}>
          <View style={styles.switchIndent}>
            <Text style={[styles.textTitle, { color: trackColor }]}>{totalValue}</Text>
          </View>
          <View style={styles.switchSection}>
            <Switch value={switchValue} onPress={onPress} bgOnColor={trackColor} />
          </View>
        </View>
      </View>
    </WithTopBorder>
  );
};

const styles = StyleSheet.create({
  row: {
    flex: 1,
    justifyContent: 'space-between',
    flexDirection: 'row',
  },
  textTitle: {
    ...Fonts.font.base.bodyTwo,
    color: Colors.white,
  },
  switchContainer: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    alignItems: 'flex-end',
  },
  switchIndent: {
    marginRight: 12,
  },
  switchSection: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  center: {
    justifyContent: 'center',
    alignItems: 'center',
  },
});

export default ToggledRow;
