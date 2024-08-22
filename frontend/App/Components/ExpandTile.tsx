import React, { ReactElement } from 'react';
import Animated, { useAnimatedStyle, useDerivedValue, withTiming } from 'react-native-reanimated';
import { Pressable, StyleSheet, Text, View, ViewStyle } from 'react-native';
import { Colors, Fonts, Metrics } from 'App/Themes';
import { isString } from 'lodash';
import { WithTopBorder } from 'App/Hoc';
import Checked from 'App/Images/Icons/radio-button-checked.svg';
import UnChecked from 'App/Images/Icons/radio-button-unchecked.svg';
import Arrow from 'App/Images/Icons/arrowDown.svg';

type Props = {
  children: ReactElement;
  title: string | (() => ReactElement);
  subTitle?: string | (() => ReactElement);
  style?: ViewStyle;
  contentStyle?: ViewStyle;
  onPress?: () => void;
  expanded: boolean;
  toggleCollapse?: () => void;
  scaleContent?: boolean;
  checked?: boolean;
  isRadio?: boolean;
  value?: string;
  leftIcon?: () => ReactElement;
  disabled?: boolean;
  isDisabled?: boolean;
  paddingVertical?: number;
};

const ExpandTile = ({
  children,
  title,
  subTitle,
  style,
  contentStyle,
  onPress,
  expanded = false,
  toggleCollapse,
  scaleContent = false,
  checked,
  isRadio = false,
  leftIcon,
  disabled,
  isDisabled,
  paddingVertical = 15,
}: Props) => {
  const scale = useDerivedValue(() => {
    return expanded ? withTiming(1) : withTiming(0);
  });

  const collapsableContainerStyles = useAnimatedStyle(() => {
    return {
      transform: scaleContent ? [{ scaleY: scale.value }] : [],
      height: scale.value === 1 ? 'auto' : scale.value * 300,
      opacity: scale.value,
    };
  });

  return (
    <WithTopBorder containerStyle={style} withBorder={!disabled} contentStyle={{ paddingVertical }}>
      <View style={contentStyle}>
        <Pressable onPress={() => !disabled && onPress?.()}>
          <View style={styles.tileHeader}>
            {isRadio && <View style={styles.radioBtn}>{checked ? <Checked /> : <UnChecked />}</View>}
            {leftIcon && <View style={styles.leftIcon}>{leftIcon()}</View>}
            <View style={styles.tileTitle}>
              {!isString(title) ? (
                title()
              ) : (
                <Text style={[styles.title, isRadio && Fonts.font.base.bodyTwo]}>{title}</Text>
              )}
            </View>
            {!disabled && (
              <Pressable onPress={() => !disabled && toggleCollapse?.()} style={styles.arrowContainer}>
                <Arrow
                  style={[
                    styles.arrowIcon,
                    { transform: [{ rotate: `${!expanded ? 0 : 180}deg` }] },
                    isDisabled ? styles.disabledArrowIcon : styles.activeArrowIcon,
                  ]}
                  color={isDisabled ? Colors.grayDisable : Colors.white}
                />
              </Pressable>
            )}
          </View>
          {subTitle && isString(subTitle) && (
            <Text
              style={[styles.subTitle, (isRadio || leftIcon) && styles.marginSubTitle, disabled && styles.disabled]}>
              {subTitle}
            </Text>
          )}

          {subTitle && !isString(subTitle) && (
            <View style={(isRadio || leftIcon) && styles.marginSubTitle}>{subTitle()}</View>
          )}
        </Pressable>
        <Animated.View style={collapsableContainerStyles}>{children}</Animated.View>
      </View>
    </WithTopBorder>
  );
};

const styles = StyleSheet.create({
  tileHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  leftSide: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  tileTitle: {
    flex: 1,
    paddingRight: Metrics.halfMargin,
  },
  radioBtn: {
    marginRight: Metrics.marginSection,
  },
  leftIcon: {
    marginRight: Metrics.smallMargin,
  },
  arrowIcon: {
    marginRight: Metrics.smallMargin,
  },
  disabledArrowIcon: {
    color: Colors.disabled,
  },
  activeArrowIcon: {},
  arrowContainer: {
    justifyContent: 'center',
  },
  title: {
    ...Fonts.font.base.caption,
    color: Colors.transparentWhite('0.87'),
  },
  subTitle: {
    ...Fonts.font.base.caption,
    color: Colors.transparentWhite('0.87'),
    marginTop: 2,
  },
  disabled: {
    color: Colors.grayDisable,
  },
  marginSubTitle: {
    ...Fonts.font.base.bodyOne,
    marginLeft: 40,
  },
});

export default ExpandTile;
