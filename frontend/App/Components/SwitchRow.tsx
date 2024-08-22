import React, { ReactElement } from 'react';
import { StyleSheet, Text, View, ViewStyle } from 'react-native';
import { Fonts, Metrics } from 'App/Themes';

import { WithTopBorder } from 'App/Hoc';
import { Switch } from 'App/Components';

type Props = {
  icon?: ReactElement;
  title: string;
  value: boolean;
  disabled?: boolean;
  onChange: (value: boolean) => void;
  style?: ViewStyle;
  titleContainer?: ViewStyle;
};

const SwitchRow = ({ icon, title, value, onChange, style, titleContainer, disabled }: Props) => {
  return (
    <WithTopBorder containerStyle={style}>
      <View style={styles.container}>
        <View style={[styles.leftSide, titleContainer]}>
          {icon && <View style={styles.icon}>{icon}</View>}
          <Text numberOfLines={1} style={styles.title}>
            {title}
          </Text>
        </View>
        <Switch disabled={disabled} value={value} onPress={() => onChange(!value)} />
      </View>
    </WithTopBorder>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  leftSide: {
    flexDirection: 'row',
    alignItems: 'center',
    marginLeft: Metrics.smallMargin,
  },
  icon: {
    marginRight: Metrics.marginSection,
  },
  title: {
    ...Fonts.font.base.bodyTwo,
    flex: 0.8,
  },
  switch: {
    marginRight: Metrics.smallMargin,
  },
});

export default SwitchRow;
