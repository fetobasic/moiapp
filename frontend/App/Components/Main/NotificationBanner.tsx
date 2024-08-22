import React from 'react';
import { Pressable, StyleProp, StyleSheet, Text, TextStyle, View, ViewStyle } from 'react-native';
import { Colors, Fonts, Metrics } from 'App/Themes';
import Svg, { Defs, LinearGradient, Rect, Stop, Mask, G, Path } from 'react-native-svg';
import CancelIcon from 'App/Images/Icons/cancel.svg';
import InfoIcon from 'App/Images/Icons/info.svg';
import WarningIcon from 'App/Images/NotificationIcons/warningNotification.svg';
import { SeverityType } from 'App/Types/Notification';
import { getSeverityColor, getSeverityIcon, getSeverityTopLineColor } from 'App/Services/Notifications';

type Props = {
  text?: string;
  onPressHandler?: () => void;
  topLine?: JSX.Element;
  icon?: JSX.Element;
  contentStyle?: StyleProp<ViewStyle>;
  topLineColors?: { start: string; end: string };
  topLineColor?: string;
  numberOfLines?: number;
  severity?: string;
  bodyGradientColors?: { start: string; end: string };
  forwardIconColor?: string;
  isForwardIcon?: boolean;
  textStyles?: StyleProp<TextStyle>;
};

const gradientBannerHeight = 36;

const NotificationGradientBody = ({ bodyGradientColors }: { bodyGradientColors: { start: string; end: string } }) => {
  return (
    <Svg height={gradientBannerHeight} width={'100%'}>
      <Defs>
        <LinearGradient id="grad" x1="0" x2="1" y1="0" y2="0">
          <Stop offset={0} stopColor={bodyGradientColors.start} stopOpacity="1" />
          <Stop offset={1} stopColor={bodyGradientColors.end} stopOpacity="1" />
        </LinearGradient>
      </Defs>
      <Rect x="0" y="0" height={gradientBannerHeight} width={'100%'} fill="url(#grad)" />
    </Svg>
  );
};

export const NotificationWrapper = ({
  text,
  onPressHandler,
  topLineColor,
  topLineColors,
  icon,
  contentStyle,
  numberOfLines,
  bodyGradientColors,
  forwardIconColor,
  isForwardIcon = true,
  textStyles,
}: Props) => {
  const forward = (
    <Svg width="24" height="24" viewBox="0 0 24 24" fill="none">
      <Rect width="24" height="24" rx="12" fill="#1B1B1B" />
      <Mask id="mask0_556_42262" maskUnits="userSpaceOnUse" x="4" y="4" width="16" height="16">
        <Rect x="4" y="4" width="16" height="16" fill="#D9D9D9" />
      </Mask>
      <G mask="url(#mask0_556_42262)">
        <Path
          d="M6 16.6668V14.0002C6 13.0779 6.325 12.2918 6.975 11.6418C7.625 10.9918 8.41111 10.6668 9.33333 10.6668H15.4667L13.0667 8.26683L14 7.3335L18 11.3335L14 15.3335L13.0667 14.4002L15.4667 12.0002H9.33333C8.77778 12.0002 8.30556 12.1946 7.91667 12.5835C7.52778 12.9724 7.33333 13.4446 7.33333 14.0002V16.6668H6Z"
          fill={forwardIconColor || Colors.severity.yellow}
        />
      </G>
    </Svg>
  );
  return (
    <Pressable
      testID="notificationBanner"
      style={[styles.container, topLineColor ? styles.noPadding : undefined]}
      onPress={onPressHandler}>
      {topLineColor ? (
        <View style={[styles.topLine, { backgroundColor: topLineColor }]} />
      ) : (
        <Svg height="100%" width="100%" style={styles.svgWrapper}>
          <Defs>
            <LinearGradient id="grad" x1="0" y1="0" x2="0" y2="0.5">
              <Stop offset="0" stopColor={topLineColors?.start || Colors.white} stopOpacity="1" />
              <Stop offset="1" stopColor={topLineColors?.end || Colors.white} stopOpacity="0" />
            </LinearGradient>
          </Defs>
          <Rect height="100%" width="100%" x="0" y="0" fill="url(#grad)" />
        </Svg>
      )}
      {bodyGradientColors && <NotificationGradientBody bodyGradientColors={bodyGradientColors} />}
      <View style={[styles.content, contentStyle, bodyGradientColors ? styles.contentGradient : undefined]}>
        <View style={styles.leftSide}>
          <View style={numberOfLines !== 1 ? styles.colTop : undefined}>{icon}</View>
          <Text style={[styles.text, textStyles]} numberOfLines={numberOfLines}>
            {text}
          </Text>
        </View>
        {isForwardIcon && <View style={numberOfLines !== 1 ? styles.colTop : undefined}>{forward}</View>}
      </View>
    </Pressable>
  );
};

export const NotificationWarn = (props: Props) => (
  <NotificationWrapper
    {...props}
    icon={<WarningIcon />}
    topLineColor={Colors.notification.lightYellow}
    contentStyle={{ backgroundColor: Colors.portWarning }}
  />
);

export const NotificationDanger = (props: Props) => (
  <NotificationWrapper
    {...props}
    icon={<CancelIcon />}
    topLineColor={Colors.notification.lightOrange}
    contentStyle={{ backgroundColor: Colors.portError }}
  />
);

export const NotificationInfo = (props: Props) => (
  <NotificationWrapper
    {...props}
    icon={<InfoIcon />}
    topLineColor={Colors.notification.lightBlue}
    contentStyle={{ backgroundColor: Colors.blue }}
  />
);

export const NotificationWithGradient = (props: Props) => <NotificationWrapper {...props} numberOfLines={1} />;

export const NotificationBanner = (props: Props) => (
  <NotificationWrapper
    {...props}
    icon={getSeverityIcon((props?.severity as SeverityType) || SeverityType.INFO)}
    topLineColor={getSeverityTopLineColor((props?.severity as SeverityType) || SeverityType.INFO)}
    contentStyle={{ backgroundColor: getSeverityColor((props?.severity as SeverityType) || SeverityType.INFO) }}
  />
);

const styles = StyleSheet.create({
  container: {
    position: 'relative',
    overflow: 'hidden',
    paddingTop: 2,
  },
  svgWrapper: {
    ...StyleSheet.absoluteFillObject,
  },
  topLine: {
    height: 2,
    width: '100%',
  },
  noPadding: {
    paddingTop: 0,
  },
  colTop: {
    alignSelf: 'flex-start',
  },
  content: {
    backgroundColor: Colors.green,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: Metrics.baseMargin,
  },
  contentGradient: {
    position: 'absolute',
    backgroundColor: 'transparent',
    height: gradientBannerHeight + 4,
  },
  leftSide: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: Metrics.smallMargin,
  },
  text: {
    ...Fonts.font.base.caption,
    color: Colors.dark,
    fontWeight: '400',
    marginLeft: Metrics.halfMargin,
    width: Metrics.screenWidth - 115,
  },
});

export default NotificationWrapper;
