import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { Colors, Fonts, Metrics } from 'App/Themes';
import Pressable from './Pressable';
import { navigationGoBack } from 'App/Navigation/AppNavigation';

import Close from 'App/Images/Icons/close.svg';
import ArrowBack from 'App/Images/Icons/arrowBack.svg';
import WarningIcon from 'App/Images/Icons/warn.svg';
import { showConfirm } from 'App/Services/Alert';

type Props = {
  title: String;
  subTitle?: String;
  isModal?: Boolean;
  leftIcon?: () => React.ReactElement;
  rightSection?: () => React.ReactElement;
  onBackPress?: () => void;
  isChangeSaved?: boolean;
  cbSave?: () => void;
  accessibilityLabelTopCornerButton?: string;
  accessibilityLabelTitle?: string;
};

function HeaderSimple({
  title,
  subTitle,
  onBackPress,
  rightSection,
  leftIcon,
  isModal,
  isChangeSaved,
  cbSave,
  accessibilityLabelTopCornerButton,
  accessibilityLabelTitle,
}: Props) {
  const insets = useSafeAreaInsets();
  const accessiblePropsTopCornerButton = accessibilityLabelTopCornerButton
    ? { accessible: true, accessibilityLabel: accessibilityLabelTopCornerButton }
    : {};
  const accessiblePropsTitle = accessibilityLabelTitle
    ? { accessible: true, accessibilityLabel: accessibilityLabelTitle }
    : {};

  const unSavedChangeHandler = () => {
    if (isChangeSaved && cbSave) {
      showConfirm(
        'You have unsaved changes',
        'Save your changes before you go back?',
        cbSave,
        {
          confirmTitle: 'SAVE',
          cancelTitle: 'Don’t Save',
        },
        navigationGoBack,
        false,
        <WarningIcon />,
      );
    }
  };

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <View style={styles.sectionMain}>
        <Pressable
          hitSlop={20}
          style={styles.sectionLeft}
          onPress={isChangeSaved ? unSavedChangeHandler : onBackPress || navigationGoBack}>
          {leftIcon?.() ||
            (isModal ? (
              <Close color={Colors.transparentWhite('0.87')} {...accessiblePropsTopCornerButton} />
            ) : (
              <ArrowBack {...accessiblePropsTopCornerButton} />
            ))}
        </Pressable>
        <View style={styles.sectionTexts} {...accessiblePropsTitle}>
          <Text style={styles.textTitle} numberOfLines={1}>
            {title}
          </Text>
          {!!subTitle && <Text style={styles.textSubTitle}>{subTitle}</Text>}
        </View>
        {rightSection && <View style={styles.sectionRight}>{rightSection()}</View>}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: Colors.background,
    zIndex: 1,
    borderBottomLeftRadius: 24,
    borderBottomRightRadius: 24,
    shadowColor: Colors.black,
    shadowOpacity: 0.2,
    shadowOffset: { width: 4, height: 4 },
    shadowRadius: 12,
    elevation: 12,
  },
  sectionMain: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    height: Metrics.navBarHeight,
    marginHorizontal: Metrics.baseMargin,
  },
  sectionTexts: {
    alignItems: 'center',
    marginHorizontal: Metrics.baseMargin * 2,
  },
  sectionLeft: {
    position: 'absolute',
    left: 0,
    padding: 10,
  },
  sectionRight: {
    position: 'absolute',
    right: 0,
  },
  textTitle: {
    ...Fonts.font.condensed.h3,
  },
  textSubTitle: {
    ...Fonts.font.base.caption,
    color: Colors.transparentWhite('0.87'),
  },
});

export default HeaderSimple;
