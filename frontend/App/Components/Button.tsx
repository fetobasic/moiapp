import React, { useMemo } from 'react';
import { Text, View, ActivityIndicator, StyleSheet, ViewStyle, TextStyle } from 'react-native';
import Svg, { Defs, LinearGradient, Rect, Stop } from 'react-native-svg';

import { Colors, Fonts, Metrics, isIOS } from 'App/Themes';
import Pressable from './Pressable';

type Props = {
  title: string;
  accessibilityLabel?: string;
  style?: ViewStyle | ViewStyle[];
  mainSectionStyle?: ViewStyle;
  textStyle?: TextStyle;
  onPress: () => void;
  disabled?: boolean;
  inverse?: boolean;
  icon?: any;
  showLoading?: boolean;
  textTitleInverseColor?: string;
  buttonColor?: string;
  height?: number;
  testID?: string;
};

const HEIGHT = 48;
function Button(props: Props) {
  const backgroundColor = useMemo(() => {
    if (props.disabled && !props.inverse) {
      return props.showLoading ? Colors.green : Colors.border;
    }

    return props.inverse ? Colors.background : props.buttonColor || Colors.green;
  }, [props.buttonColor, props.disabled, props.inverse, props.showLoading]);

  const textColor = useMemo(() => {
    if (props.disabled) {
      return props.inverse ? Colors.transparentWhite('0.38') : Colors.background;
    }

    if (props.inverse) {
      return props.textTitleInverseColor || Colors.green;
    }

    return Colors.background;
  }, [props.disabled, props.inverse, props.textTitleInverseColor]);

  const accessibleProps = props.accessibilityLabel
    ? { accessible: true, accessibilityLabel: props.accessibilityLabel }
    : {};

  return (
    <Pressable
      testID={props.testID}
      style={[styles.shadow, props.style]}
      disabled={props.disabled}
      onPress={() => props.onPress()}>
      <View {...accessibleProps} style={styles.container}>
        <Svg height={props.height || HEIGHT} width="100%">
          <Defs>
            <LinearGradient id="grad" x1="0" y1="0" x2="0" y2="0.5">
              <Stop offset="0" stopColor={Colors.border} stopOpacity="1" />
              <Stop offset="1" stopColor={isIOS ? Colors.background : Colors.black} stopOpacity={isIOS ? '0' : '0.4'} />
            </LinearGradient>
          </Defs>
          <Rect x="0" y="0" height={props.height || HEIGHT} width="100%" fill="url(#grad)" />

          <View
            style={[
              styles.button,
              {
                height: (props.height || HEIGHT) - 2,
                backgroundColor,
              },
            ]}>
            <View style={[styles.sectionPressable, props.mainSectionStyle]}>
              {props.showLoading ? (
                <ActivityIndicator size="small" color={props.inverse ? Colors.green : Colors.background} />
              ) : (
                <View style={styles.row}>
                  {props.icon && <View style={!!props.title && styles.icon}>{props.icon}</View>}
                  <Text style={[styles.textTitle, { color: textColor }, props.textStyle]}>{props.title}</Text>
                </View>
              )}
            </View>
          </View>
        </Svg>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  container: {
    borderRadius: 24,
    overflow: 'hidden',
  },
  shadow: {
    shadowColor: Colors.black,
    shadowOpacity: 0.2,
    shadowOffset: { width: 4, height: 4 },
    shadowRadius: 12,
    elevation: 12,
  },
  button: {
    marginTop: 1,
    marginHorizontal: 1,
    borderRadius: 24,
  },
  sectionPressable: {
    paddingVertical: Metrics.halfMargin,
    justifyContent: 'center',
    alignItems: 'center',
    flexDirection: 'row',
  },
  textTitle: {
    ...Fonts.font.base.button,
  },
  icon: {
    marginRight: 4,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
  },
});

export default Button;
