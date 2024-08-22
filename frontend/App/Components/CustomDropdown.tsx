import React, { ReactElement, useState } from 'react';
import { Pressable, Text, StyleSheet, View, ViewStyle } from 'react-native';
import { Colors, Fonts, Metrics } from 'App/Themes';
import ArrowDown from 'App/Images/Icons/arrow-down.svg';
import { SelectModal } from './index';
import { isString } from 'lodash';

type Item = {
  value: string | number;
  label: any;
};

type Props = {
  value: Item;
  placeholder?: string;
  header?: (() => ReactElement) | string;
  containerStyle?: ViewStyle;
  data: Item[];
  renderElement?: (item: Item[], onPress: (item: Item) => void, selectedProduct: Item) => ReactElement;
  onChange: (item: Item) => void;
};

const CustomDropdown = ({ data = [], value, placeholder, header, containerStyle, onChange, renderElement }: Props) => {
  const [modalVisible, setModalVisible] = useState<boolean>(false);

  const modalToggle = () => setModalVisible(!modalVisible);

  const itemLabel = value.label && !isString(value.label) ? value?.label() : value.label;
  const onChangeHandler = (item: Item) => {
    modalToggle();
    onChange(item);
  };

  return (
    <>
      <Pressable testID="customDropdownPress" style={[styles.pressable, containerStyle]} onPress={modalToggle}>
        <View style={styles.inner}>
          <Text style={styles.product}>{itemLabel || placeholder || 'Select item...'}</Text>
          <ArrowDown />
        </View>
        {value && placeholder && <Text style={styles.placeholder}>{placeholder}</Text>}
      </Pressable>
      <SelectModal
        data={data}
        onChange={onChangeHandler}
        value={value}
        visible={modalVisible}
        header={header}
        onCancel={modalToggle}
        renderElement={renderElement}
      />
    </>
  );
};

const styles = StyleSheet.create({
  pressable: {
    borderColor: Colors.border,
    borderWidth: 1,
    paddingHorizontal: Metrics.halfMargin,
    paddingVertical: Metrics.marginSection,
    borderRadius: 8,
    position: 'relative',
  },
  inner: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  product: {
    ...Fonts.font.base.bodyOne,
  },
  placeholder: {
    ...Fonts.font.base.caption,
    color: Colors.green,
    position: 'absolute',
    top: -9,
    left: 7,
    backgroundColor: Colors.background,
    paddingHorizontal: 7,
  },
  backdrop: {
    backgroundColor: Colors.transparentBlack('0.9'),
    flex: 1,
    flexDirection: 'column-reverse',
  },
  content: {
    backgroundColor: Colors.background,
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
    marginHorizontal: Metrics.halfMargin,
    marginTop: 250,
  },
  modalTitle: {
    ...Fonts.font.base.h3,
    textAlign: 'center',
    margin: Metrics.baseMargin,
  },
  buttons: {
    margin: Metrics.baseMargin,
    flexDirection: 'row',
  },
  btnLeft: {
    flex: 1,
    marginRight: Metrics.halfMargin,
  },
  btnRight: {
    flex: 1,
  },
});

export default CustomDropdown;
