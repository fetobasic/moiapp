import React, { useEffect, useMemo, useState } from 'react';
import RNPickerSelect from 'react-native-picker-select';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { Fonts, isIOS, Metrics } from 'App/Themes';
import Colors from 'App/Themes/Colors';
import ArrowDown from 'App/Images/Icons/arrow-down.svg';
import ArrowUp from 'App/Images/Icons/arrowUp.svg';

export type PickerDataType = {
  label: string;
  value: string;
};

type Props = {
  data: PickerDataType[];
  value: string;
  placeholder?: string;
  onSelect: (item: PickerDataType) => void;
  isBottomMargin?: boolean;
  isError?: boolean;
};

const CustomPickerSelect = ({ data, placeholder, onSelect, value, isError, isBottomMargin = true }: Props) => {
  const [isOpen, setOpen] = useState<boolean>(false);
  const [selectedValue, setSelectedValue] = useState(value);
  const [ref, setRef] = useState<RNPickerSelect | null>(null);

  const itemColorText = isIOS ? Colors.white : Colors.background;

  useEffect(() => {
    setSelectedValue(value);
  }, [value]);

  const selectToggle = () => setOpen(!isOpen);
  const findValue = () => data.find((item) => item.value === selectedValue) as PickerDataType;

  const onValueSelectAndroid = (val: string) => {
    setSelectedValue(val);
    onSelect(findValue());
  };

  const handleOnClose = () => {
    selectToggle();
    setSelectedValue(value);
  };

  const ph = {
    label: 'None Selected',
    value: null,
    color: Colors.gray,
    inputLabel: isOpen ? '' : placeholder,
  };

  const borderColor = useMemo(() => {
    let color = Colors.border;

    if (isOpen) {
      color = Colors.green;
    } else if (isError && !selectedValue) {
      color = Colors.red;
    }

    return color;
  }, [isError, isOpen, selectedValue]);

  const pickerStyle = {
    inputIOS: {
      ...Fonts.font.base.bodyOne,
      lineHeight: 17,
      borderColor,
      borderWidth: 1,
      paddingVertical: 18,
      paddingHorizontal: Metrics.halfMargin,
      borderRadius: 8,
      marginBottom: isBottomMargin ? Metrics.marginSection : 0,
    },
    inputAndroid: {
      ...Fonts.font.base.bodyOne,
      borderColor,
      borderWidth: 1,
      paddingVertical: 14,
      paddingHorizontal: Metrics.halfMargin,
      borderRadius: 8,
      marginBottom: Metrics.marginSection,
    },
    iconContainer: {
      marginRight: Metrics.baseMargin,
      marginTop: Metrics.baseMargin,
    },
    modalViewBottom: {
      marginHorizontal: Metrics.baseMargin,
      backgroundColor: Colors.background,
      borderLeftWidth: 1,
      borderLeftColor: Colors.border,
      borderRightWidth: 1,
      borderRightColor: Colors.border,
    },
    placeholder: {
      ...Fonts.font.base.bodyOne,
      color: isOpen ? Colors.white : Colors.transparentWhite('0.38'),
      lineHeight: 17,
    },
  };

  const headerView = () => (
    <View style={styles.header}>
      <Pressable
        onPress={() => {
          setSelectedValue(value);
          ref?.togglePicker(true);
        }}>
        <Text style={styles.leftBtn}>CANCEL</Text>
      </Pressable>
      {placeholder && <Text style={styles.title}>{placeholder}</Text>}
      <Pressable
        onPress={() => {
          onSelect(findValue());
          ref?.togglePicker(true);
        }}>
        <Text style={styles.rightBtn}>SELECT</Text>
      </Pressable>
    </View>
  );

  const ArrowIcon = useMemo(() => (isOpen ? ArrowUp : ArrowDown), [isOpen]);

  return (
    <View style={styles.container}>
      <RNPickerSelect
        testID="customPicker"
        ref={(el) => setRef(el)}
        items={data.map((item) => ({
          ...item,
          color: item.value === selectedValue ? Colors.green : itemColorText,
        }))}
        placeholder={ph}
        value={selectedValue}
        onValueChange={isIOS ? setSelectedValue : onValueSelectAndroid}
        onOpen={selectToggle}
        onClose={handleOnClose}
        //@ts-ignore
        InputAccessoryView={headerView}
        style={pickerStyle}
        Icon={ArrowIcon}
        useNativeAndroidPickerStyle={false}
        fixAndroidTouchableBug
      />
      {(isOpen || value) && <Text style={styles.ph}>{placeholder}</Text>}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'relative',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: Colors.border,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingHorizontal: Metrics.baseMargin,
    paddingVertical: Metrics.baseMargin,
    marginHorizontal: Metrics.baseMargin,
    backgroundColor: Colors.background,
    borderBottomWidth: 0,
  },
  leftBtn: {
    ...Fonts.font.base.button,
    color: Colors.green,
  },
  title: {
    ...Fonts.font.base.h3,
    marginBottom: 2,
  },
  rightBtn: {
    ...Fonts.font.base.button,
    color: Colors.green,
  },
  ph: {
    ...Fonts.font.base.caption,
    color: Colors.green,
    position: 'absolute',
    backgroundColor: Colors.background,
    paddingHorizontal: 5,
    top: -8,
    left: 8,
  },
});

export default CustomPickerSelect;
