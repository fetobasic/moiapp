import React from 'react';
import { View, Text, Pressable, ViewStyle, StyleSheet } from 'react-native';
import Checked from 'App/Images/Icons/radio-button-checked.svg';
import Unchecked from 'App/Images/Icons/radio-button-unchecked.svg';
import { Colors, Fonts, Metrics } from 'App/Themes';
import { WithPressable } from 'App/Hoc';

type Item = {
  item: any;
  selectedValue: { value: any; label: string } | null;
  onChange: (value: { value: string | number; label: string }) => void;
  itemStyle?: ViewStyle;
  hasBorder?: boolean;
  isSaved?: boolean;
  onPasswordChangePress?: (name: any) => void;
};

type Props = {
  data: any[];
  selectedValue: { value: any; label: string } | null;
  onChange: (value: any) => void;
  containerStyle?: ViewStyle;
  itemStyle?: ViewStyle;
  hasBorder?: boolean;
  isSaved?: boolean;
  onPasswordChangePress?: (name: any) => void;
};

const Item = ({ selectedValue, item, hasBorder, itemStyle, onChange, isSaved, onPasswordChangePress }: Item) => {
  const isIconElement = (iconElement: JSX.Element) =>
    !!(iconElement && typeof iconElement !== 'string' && typeof iconElement !== 'number');

  const elem = (
    <View style={styles.itemContainer}>
      <View style={styles.rowBorder}>
        {selectedValue?.value === item.value ? <Checked /> : <Unchecked />}
        <Text style={styles.label}>{item.label}</Text>
      </View>
      {isIconElement(item.icon) && <View>{item.icon}</View>}
    </View>
  );

  if (hasBorder) {
    return (
      <View>
        <WithPressable key={item.value} style={itemStyle} onPress={() => onChange(item)}>
          {elem}
        </WithPressable>
        {isSaved && selectedValue?.value === item.value && (
          <Pressable style={styles.changePwdSection} onPress={() => onPasswordChangePress?.(item.value)}>
            <Text style={styles.changePwdText}>Change saved password</Text>
          </Pressable>
        )}
      </View>
    );
  }

  return (
    <Pressable key={item.value} style={[styles.item, itemStyle]} onPress={() => onChange(item)}>
      <View style={styles.leftSide}>{elem}</View>
    </Pressable>
  );
};

const RadioButtons = ({
  data,
  selectedValue,
  onChange,
  containerStyle,
  itemStyle,
  hasBorder,
  isSaved,
  onPasswordChangePress,
}: Props) => {
  return (
    <View style={[styles.container, hasBorder && styles.containerBorder, containerStyle]}>
      {data.map((item, index) => (
        <Item
          key={index + item?.value}
          selectedValue={selectedValue}
          item={item}
          hasBorder={hasBorder}
          itemStyle={itemStyle}
          onChange={onChange}
          isSaved={isSaved}
          onPasswordChangePress={onPasswordChangePress}
        />
      ))}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginHorizontal: Metrics.baseMargin,
  },
  containerBorder: { marginHorizontal: 0 },
  rowBorder: { flexDirection: 'row' },
  itemContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    width: '100%',
  },
  item: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  leftSide: {
    flexDirection: 'row',
    paddingVertical: Metrics.halfMargin,
    alignItems: 'center',
  },
  label: {
    ...Fonts.font.base.bodyTwo,
    marginLeft: Metrics.halfMargin,
  },
  changePwdSection: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    alignItems: 'center',
    marginBottom: 4,
    marginRight: Metrics.smallMargin,
  },
  changePwdText: {
    ...Fonts.font.base.caption,
    color: Colors.green,
  },
});

export default RadioButtons;
