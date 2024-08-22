import React, { ReactElement, ReactNode, useState } from 'react';
import { View, Text, StyleSheet, ViewStyle, TextStyle } from 'react-native';
import { isString } from 'lodash';

import { Pressable } from 'App/Components';
import { Colors, Fonts, Metrics } from 'App/Themes';
import { WithPressable } from 'App/Hoc';
import ArrowIcon from 'App/Images/Icons/arrowRight.svg';
import { setToClipboard } from 'App/Services/Clipboard';

export type InformationRowProps = {
  title?: string | ReactNode;
  titleStyle?: TextStyle;
  subTitle?: string;
  subTitleStyle?: ViewStyle;
  subTitleTextStyle?: TextStyle;
  accessibilityLabel?: string;
  addSubTitle?: ReactNode;
  description?: string | ReactElement;
  descriptionIcon?: ReactNode;
  descriptionStyle?: TextStyle;
  rightIcon?: ReactNode;
  rightIconStyle?: TextStyle;
  addRightIcon?: ReactNode;
  addLeftIcon?: ReactNode;
  style?: ViewStyle;
  mainStyle?: ViewStyle;
  contentStyle?: ViewStyle;
  leftIconStyle?: ViewStyle;
  textStyle?: ViewStyle;
  onPress?: () => void;
  trimTitle?: boolean;
  trimSubTitle?: boolean;
  nativePress?: boolean;
  disabled?: boolean;
  forceRightIcon?: boolean;
  numberOfDescriptionLines?: number;
  pressableStyle?: TextStyle;
  children?: ReactNode;
  testID?: string;
  useClipboard?: boolean;
  skipClipboardValue?: boolean;
};

function InformationRow({
  title,
  titleStyle,
  subTitle,
  subTitleStyle,
  subTitleTextStyle,
  accessibilityLabel,
  addSubTitle,
  description,
  descriptionIcon,
  descriptionStyle,
  addRightIcon,
  addLeftIcon,
  rightIcon,
  rightIconStyle,
  style,
  contentStyle,
  leftIconStyle,
  textStyle,
  onPress,
  trimTitle = true,
  trimSubTitle = true,
  nativePress,
  disabled,
  forceRightIcon,
  mainStyle,
  numberOfDescriptionLines,
  pressableStyle,
  children,
  testID,
  useClipboard,
  skipClipboardValue,
}: InformationRowProps) {
  const [isShowAllLine, setShowAllLine] = useState<boolean>(false);
  const accessibleProps = accessibilityLabel ? { accessible: true, accessibilityLabel: accessibilityLabel } : {};

  return (
    <WithPressable
      testID={testID}
      contentStyle={contentStyle}
      pressableStyle={pressableStyle}
      style={style}
      onPress={disabled ? undefined : onPress}
      useClipboardValue={!skipClipboardValue && useClipboard && description ? (description as string) : undefined}
      nativePress={nativePress}>
      <View style={[styles.container, mainStyle]}>
        {!!addLeftIcon && <View style={[styles.icon, leftIconStyle]}>{addLeftIcon}</View>}
        <View {...accessibleProps} style={[styles.textContainer, textStyle]}>
          {!!title && (
            <Text style={[styles.textTitle, titleStyle]} numberOfLines={trimTitle ? 1 : undefined} ellipsizeMode="tail">
              {title}
            </Text>
          )}
          {!!subTitle && (
            <Text
              style={[styles.subText, subTitleStyle, subTitleTextStyle]}
              numberOfLines={trimSubTitle ? 1 : undefined}
              ellipsizeMode="tail">
              {subTitle}
            </Text>
          )}
          {addSubTitle}
        </View>
        <View style={[styles.rightSideContainer, !!(title && (subTitle || addSubTitle)) && styles.rightSideStickyTop]}>
          {!!description && (
            <Pressable
              onPress={() => {
                !numberOfDescriptionLines && setShowAllLine(!isShowAllLine);

                useClipboard && isString(description) && setToClipboard(description);
              }}>
              <Text
                ellipsizeMode="clip"
                style={[styles.textDescription, descriptionStyle]}
                numberOfLines={numberOfDescriptionLines || (isShowAllLine ? undefined : 1)}>
                {description}
              </Text>
            </Pressable>
          )}
          {!!descriptionIcon && <View style={styles.descriptionIcon}>{descriptionIcon}</View>}
          {!!addRightIcon && <View style={styles.icon}>{addRightIcon}</View>}
          {((!!onPress && !disabled) || forceRightIcon) &&
            (rightIcon ? (
              <View style={styles.rightIcon}>{rightIcon}</View>
            ) : (
              <ArrowIcon style={[styles.rightIcon, rightIconStyle]} />
            ))}
        </View>
      </View>
      {children}
    </WithPressable>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  textContainer: {
    flex: 1,
    justifyContent: 'center',
  },
  rightSideContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  rightSideStickyTop: {
    alignItems: 'flex-start',
  },
  text: {
    ...Fonts.font.base.bodyTwo,
    maxWidth: 210,
  },
  textDescription: {
    ...Fonts.font.base.bodyTwo,
    maxWidth: 210,
  },
  textTitle: {
    ...Fonts.font.base.bodyTwo,
    color: Colors.transparentWhite('0.87'),
    maxWidth: 210,
  },
  subText: {
    ...Fonts.font.base.bodyOne,
    color: Colors.gray,
  },
  addRightIcon: {
    marginLeft: Metrics.halfMargin,
  },
  descriptionIcon: {
    marginLeft: 4,
  },
  icon: {
    marginLeft: Metrics.smallMargin,
  },
  rightIcon: {
    marginLeft: Metrics.marginSection,
  },
});

export default InformationRow;
