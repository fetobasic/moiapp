import React, { useEffect, useState } from 'react';
import { StyleSheet, Text, ViewStyle } from 'react-native';
import SectionWithTitle from './SectionWithTitle';
import { Colors, Fonts, isIOS, Metrics } from 'App/Themes';
import CalendarIcon from 'App/Images/Icons/calendar.svg';
import ClockIcon from 'App/Images/Icons/clock.svg';
import { ModalWindow, Pressable } from './index';
import RNDateTimePicker, {
  AndroidNativeProps,
  DateTimePickerEvent,
  IOSNativeProps,
} from '@react-native-community/datetimepicker';
import { format } from 'date-fns';

type Props = {
  value?: Date;
  style?: ViewStyle;
  type?: 'time' | 'date';
  onSave: (value: Date) => void;
  title: string;
  disablePastDate?: boolean;
} & IOSNativeProps &
  AndroidNativeProps;

const DateTimePicker = ({ value, style, type = 'time', onSave, title, disablePastDate, ...props }: Props) => {
  const [isShowPicker, setShowPicker] = useState<boolean>(false);
  const [data, setData] = useState<Date>(value || new Date());

  const isTimeMode = type === 'time';

  useEffect(() => setData(props?.minimumDate || value), [props.minimumDate, value]);

  const onSaveHandler = () => {
    onSave(data);
    setShowPicker(false);
  };

  const onChangeAndroidHandler = (event: DateTimePickerEvent, date: Date | undefined) => {
    if (event.type === 'set' && date) {
      onSave(date);
      setShowPicker(false);
    } else {
      setShowPicker(false);
    }
  };

  return (
    <>
      <SectionWithTitle
        title={title}
        containerStyle={[isShowPicker && styles.container, style] as ViewStyle}
        titleStyle={styles.title}>
        <Pressable testID="pressShowPicker" onPress={() => setShowPicker(true)} style={styles.dateTimeWrapper}>
          <Text style={styles.value}>{format(value, isTimeMode ? 'p' : 'PP')}</Text>
          {isTimeMode ? <ClockIcon /> : <CalendarIcon />}
        </Pressable>
      </SectionWithTitle>
      {isIOS ? (
        <ModalWindow
          visible={isShowPicker}
          onSave={onSaveHandler}
          onClose={() => setShowPicker(false)}
          title={title}
          style={styles.modalWindow}
          backdropStyle={styles.backdrop}>
          <RNDateTimePicker
            mode={type}
            value={data}
            display="spinner"
            onChange={(_, date) => setData(date as Date)}
            textColor={Colors.transparentWhite('0.87')}
            locale="EN"
            minimumDate={disablePastDate ? new Date() : undefined}
            {...props}
          />
        </ModalWindow>
      ) : (
        <>
          {isShowPicker && (
            <RNDateTimePicker mode={type} value={data} onChange={onChangeAndroidHandler} is24Hour={false} {...props} />
          )}
        </>
      )}
    </>
  );
};

const styles = StyleSheet.create({
  container: {
    borderColor: Colors.green,
  },
  title: {
    color: Colors.green,
    width: 'auto',
    paddingRight: 4,
    paddingLeft: 4,
  },
  modalWindow: {
    marginHorizontal: Metrics.baseMargin,
    borderWidth: 1,
    borderColor: Colors.border,
    borderBottomColor: Colors.transparent,
    marginBottom: -60,
  },
  backdrop: {
    backgroundColor: Colors.transparent,
  },
  dateTimeWrapper: {
    flexDirection: 'row',
    paddingTop: 4,
    paddingBottom: Metrics.marginSection,
    paddingLeft: 4,
    paddingRight: Metrics.smallMargin,
    alignItems: 'center',
  },
  value: {
    ...Fonts.font.base.bodyOne,
    flex: 1,
  },
});

export default DateTimePicker;
