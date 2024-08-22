import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Colors, Fonts, Metrics } from 'App/Themes';
import NoDeviceConnected from 'App/Images/Icons/noDeviceConnected.svg';
import { WithPressable } from 'App/Hoc';

function EmptyRow() {
  return (
    <WithPressable>
      <View style={styles.container}>
        <View style={[styles.icon]}>
          <NoDeviceConnected />
        </View>
        <View accessibilityLabel="No Device Connected" style={styles.textContainer}>
          <Text style={styles.text}>No Device Connected</Text>
          <Text style={styles.subText}>You do not have any Goal Zero devices connected yet.</Text>
        </View>
      </View>
    </WithPressable>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginVertical: Metrics.baseMargin,
    marginRight: Metrics.smallMargin,
  },
  icon: { marginHorizontal: Metrics.halfMargin },
  textContainer: { flex: 1, justifyContent: 'center' },
  text: {
    ...Fonts.font.base.bodyTwo,
  },
  subText: {
    ...Fonts.font.base.bodyOne,
  },
  createNewText: {
    color: Colors.green,
  },
});

export default EmptyRow;
