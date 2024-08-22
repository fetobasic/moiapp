import React, { ReactNode } from 'react';
import Svg, { Defs, LinearGradient, Rect, Stop } from 'react-native-svg';
import { StyleSheet, View, ViewStyle } from 'react-native';
import { Colors, isIOS, Metrics } from 'App/Themes';

type Props = {
  children: ReactNode;
  withBorder?: boolean;
  containerStyle?: ViewStyle | ViewStyle[];
  containerWBStyle?: ViewStyle;
  contentStyle?: ViewStyle;
  inverse?: boolean;
  smallBorder?: boolean;
  borderColor?: string;
  smallPadding?: boolean;
  testID?: string;
};

const WithTopBorder = ({
  children,
  withBorder = true,
  containerStyle,
  contentStyle,
  inverse,
  smallBorder,
  borderColor,
  smallPadding,
  containerWBStyle,
  testID,
}: Props) =>
  withBorder ? (
    <View testID={testID} style={[styles.shadow, containerStyle, smallBorder && styles.smallBorder]}>
      <View style={[styles.container, smallBorder && styles.smallBorder, smallPadding && styles.smallPadding]}>
        <Svg height="100%" width="100%" style={styles.svgWrapper}>
          <Defs>
            <LinearGradient id="grad" x1="0" y1="0" x2="0" y2="0.5">
              <Stop
                offset="0"
                stopColor={inverse ? Colors.yellowBorder : borderColor || Colors.border}
                stopOpacity="1"
              />
              <Stop offset="1" stopColor={inverse ? Colors.yellowBorder : Colors.background} stopOpacity="0" />
            </LinearGradient>
          </Defs>
          <Rect height="100%" width="100%" x="0" y="0" fill="url(#grad)" />
        </Svg>
        <View
          style={[
            styles.content,
            contentStyle,
            smallBorder && styles.smallBorder,
            inverse && { backgroundColor: Colors.green },
          ]}>
          {children}
        </View>
      </View>
    </View>
  ) : (
    <View
      style={[styles.content, smallBorder && styles.smallBorder, !withBorder && styles.borderMargin, containerWBStyle]}>
      {children}
    </View>
  );

const styles = StyleSheet.create({
  smallBorder: {
    borderRadius: 8,
  },
  darkColor: {
    color: Colors.dark,
  },
  shadow: {
    borderRadius: 16,
    marginBottom: Metrics.smallMargin,
    elevation: 2,
    shadowOpacity: 0.7,
    shadowRadius: 7,
    shadowColor: Colors.transparentBlack(isIOS ? '0.4' : '1'),
    shadowOffset: {
      width: 0,
      height: 4,
    },
  },
  container: {
    borderRadius: 16,
    position: 'relative',
    overflow: 'hidden',
    paddingTop: 1,
    marginHorizontal: 1,
  },
  smallPadding: {
    paddingTop: 0.5,
  },
  svgWrapper: {
    ...StyleSheet.absoluteFillObject,
  },
  borderMargin: {
    marginBottom: Metrics.smallMargin,
    marginHorizontal: 1,
    paddingVertical: 16,
  },
  content: {
    backgroundColor: Colors.background,
    borderRadius: 16,
    paddingVertical: 15,
    paddingHorizontal: Metrics.halfMargin,
  },
});

export default WithTopBorder;
