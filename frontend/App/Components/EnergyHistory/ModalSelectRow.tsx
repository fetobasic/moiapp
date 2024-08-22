import React, { useMemo } from 'react';
import { View, StyleSheet, Text, TextStyle } from 'react-native';

import { Colors, Fonts, Metrics } from 'App/Themes';
import { Pressable } from 'App/Components/index';

import CheckIcon from 'App/Images/Icons/checkCircle.svg';

type Props = {
  title: string;
  subTitle?: string;
  selectedValue: string;
  onPress: (title: string) => void;
  icon?: React.ReactNode;
  textStyle?: TextStyle;
  selectedType?: 'circle' | 'check';
};

function ModalSelectRow(props: Props) {
  const isSelected = useMemo(() => props.title === props.selectedValue, [props.title, props.selectedValue]);

  const renderSelected = () => {
    switch (props.selectedType) {
      case 'check':
        return isSelected ? (
          <CheckIcon width={20} height={20} color={Colors.green} />
        ) : (
          <View style={styles.emptyCheck} />
        );

      default:
      case 'circle':
        return (
          <View style={[styles.selectedCircle, isSelected && styles.selected]}>
            {isSelected && <View style={styles.internarCircle} />}
          </View>
        );
    }
  };

  return (
    <Pressable
      testID="modalSelectRow"
      style={[styles.container, !!props.subTitle && styles.withSubTitle]}
      onPress={() => props.onPress(props.title)}>
      {renderSelected()}
      <View style={styles.sectionMain}>
        <Text style={[styles.text, props.textStyle]}>{props.title}</Text>
        {!!props.subTitle && <Text style={styles.subText}>{props.subTitle}</Text>}
      </View>
      {props.icon}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    paddingVertical: Metrics.halfMargin,
    alignItems: 'center',
  },
  withSubTitle: {
    alignItems: 'flex-start',
  },
  selectedCircle: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: Colors.transparentWhite('0.87'),
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyCheck: {
    width: 16,
    height: 16,
    borderRadius: 8,
    borderWidth: 1.5,
    borderColor: Colors.transparentWhite('0.87'),
    marginLeft: 2,
  },
  selected: {
    borderColor: Colors.green,
  },
  internarCircle: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: Colors.green,
  },
  sectionMain: {
    flex: 1,
    marginLeft: 14,
  },
  text: {
    ...Fonts.font.base.bodyTwo,
  },
  subText: {
    ...Fonts.font.base.bodyOne,
  },
});

export default ModalSelectRow;
