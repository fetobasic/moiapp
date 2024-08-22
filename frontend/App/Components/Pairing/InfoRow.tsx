import React from 'react';
import { View, StyleSheet, Text, ViewStyle, TextStyle } from 'react-native';

import CheckIcon from 'App/Images/Icons/checkCircle.svg';
import HelpIcon from 'App/Images/Icons/help.svg';
import ArrowRightIcon from 'App/Images/Icons/arrowRight.svg';
import { Colors, Fonts, Metrics } from 'App/Themes';
import { Pressable } from 'App/Components';
import { WithTopBorder } from 'App/Hoc';
import { isString } from 'lodash';

type Props = {
  title?: string;
  subTitle?: string | (() => React.ReactElement<any, string | React.JSXElementConstructor<any>>);
  showInfo?: boolean;
  style?: ViewStyle;
  onIconPress?: () => void;
  disabled?: boolean;
  withBorder?: boolean;
  icon?: () => React.ReactElement;
  body?: () => React.ReactElement;
  containerWBStyle?: ViewStyle;
  sectionTextStyle?: ViewStyle;
  iconText?: string;
  titleTextStyles?: TextStyle;
  subTitleTextStyles?: TextStyle;
  rightArrowIcon?: boolean;
  accessibilityLabel?: string;
};

function InfoRow(props: Props) {
  const accessibleProps = props.accessibilityLabel
    ? { accessible: true, accessibilityLabel: props.accessibilityLabel }
    : {};

  return (
    <WithTopBorder
      testID="infoRow"
      withBorder={props.withBorder}
      containerStyle={{ marginBottom: Metrics.smallMargin }}
      containerWBStyle={props.containerWBStyle}
      contentStyle={{ paddingVertical: Metrics.smallMargin }}>
      <View style={[styles.container, props.style]} {...accessibleProps}>
        <View style={styles.sectionIcon}>
          {(props.iconText && <Text style={[styles.textTitle, props.titleTextStyles]}>{props.iconText}</Text>) ||
            props.icon?.() || <CheckIcon color={Colors.transparentWhite('0.38')} />}
        </View>
        <View style={[styles.sectionMain, props.sectionTextStyle, !props.showInfo && styles.sectionMainFull]}>
          {!!props.title && <Text style={[styles.textTitle, props.titleTextStyles]}>{props.title}</Text>}
          {!!props.subTitle && isString(props.subTitle) ? (
            <Text style={[styles.textSubTitle, props.subTitleTextStyles]}>{props.subTitle}</Text>
          ) : (
            // @ts-ignore as we can't ensure typescript that it's a function
            props.subTitle?.()
          )}
          {props.body?.()}
        </View>
        {props.showInfo && (
          <Pressable disabled={props.disabled} style={styles.sectionIcon} onPress={props.onIconPress}>
            {props.rightArrowIcon ? <ArrowRightIcon /> : <HelpIcon />}
          </Pressable>
        )}
      </View>
    </WithTopBorder>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
  },
  sectionMain: {
    flex: 1,
    paddingLeft: Metrics.halfMargin,
    paddingRight: Metrics.halfMargin,
  },
  sectionMainFull: {
    paddingRight: 0,
  },
  sectionIcon: {
    width: 32,
    height: 32,
    justifyContent: 'center',
    alignItems: 'center',
  },
  textTitle: {
    ...Fonts.font.base.bodyTwo,
    color: Colors.transparentWhite('0.87'),
    marginVertical: 4,
  },
  textSubTitle: {
    ...Fonts.font.base.caption,
    color: Colors.transparentWhite('0.87'),
    marginBottom: 4,
  },
});

export default InfoRow;
