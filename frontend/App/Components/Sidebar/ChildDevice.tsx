import React from 'react';
import { format } from 'date-fns';
import { View, Text, StyleSheet, Image } from 'react-native';
import { ApplicationStyles, Colors, Fonts } from 'App/Themes';

import StatusGrayIcon from 'App/Images/Icons/statusGray.svg';
import StatusGreenIcon from 'App/Images/Icons/statusGreen.svg';

import { InformationRow as Row } from 'App/Components';
import { getYetiImage } from 'App/Services/Yeti';
import { ChildItem } from 'App/Hooks/useMapDrawerData';
import LineShadow from './LineShadow';

type Props = {
  item: ChildItem;
  navigateToDevice: (thingName: string) => void;
};

function ChildDevice({ item, navigateToDevice }: Props) {
  const { batteryPercentage, thingName = '', model = '', fullDeviceInfo, numberOfHoursLeft } = item || {};

  const renderNumberOfHours = (numberOfHours?: number): string =>
    typeof numberOfHours === 'number' && numberOfHours < 0 ? ` - About ${Math.abs(numberOfHours)} h left` : '';

  return (
    <View testID="childDevice" style={styles.wrapper}>
      <View style={ApplicationStyles.flex}>
        <Row
          subTitle={thingName}
          subTitleStyle={styles.subTitleStyle}
          contentStyle={styles.contentStyle}
          addSubTitle={
            <View>
              <Text
                numberOfLines={1}
                ellipsizeMode="tail"
                style={batteryPercentage !== 0 ? styles.successStatusText : styles.emptyStatusText}>
                {batteryPercentage !== 0
                  ? `${batteryPercentage}%${renderNumberOfHours(numberOfHoursLeft)}`
                  : '0% - Empty'}
              </Text>
              <Text numberOfLines={1} ellipsizeMode="tail" style={styles.extraInfoText}>
                {model}
              </Text>
              {item?.dateSync && (
                <Text numberOfLines={1} ellipsizeMode="tail" style={styles.extraInfoText}>
                  {`${format(new Date(item?.dateSync), "h:mm a 'on' MMM d, yyyy")}`}
                </Text>
              )}
            </View>
          }
          leftIconStyle={styles.leftIcon}
          addLeftIcon={
            batteryPercentage !== 0 ? (
              <LineShadow d="M8 1A3 3 0 1 1 8 13A3 3 0 0 1 8 1" fillColor="#BDCC2A" opacity={0.1}>
                <StatusGreenIcon />
              </LineShadow>
            ) : (
              <StatusGrayIcon />
            )
          }
          rightIcon={<Image style={styles.image} resizeMode="contain" source={getYetiImage(model)} />}
          onPress={() => {
            const _thingName = fullDeviceInfo?.thingName;
            if (_thingName) {
              navigateToDevice(_thingName);
            }
          }}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: { ...ApplicationStyles.flex, flexDirection: 'row' },
  image: {
    height: 64,
    width: 64,
  },
  leftIcon: {
    marginLeft: 0,
    marginRight: 8,
    marginTop: 7,
  },
  subTitleStyle: {
    paddingBottom: 7,
  },
  contentStyle: {
    paddingVertical: 9,
  },
  successStatusText: {
    ...Fonts.font.base.caption,
    color: Colors.green,
  },
  emptyStatusText: {
    ...Fonts.font.base.caption,
    color: Colors.red,
  },
  extraInfoText: {
    ...Fonts.font.base.caption,
  },
});

export default ChildDevice;
