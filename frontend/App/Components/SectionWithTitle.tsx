import { Colors, Fonts, Metrics } from 'App/Themes';
import React, { ReactNode } from 'react';
import { StyleSheet, Text, TextStyle, View, ViewStyle } from 'react-native';

type Props = {
  children: ReactNode;
  title?: string;
  containerStyle?: ViewStyle;
  titleStyle?: TextStyle;
  isActive?: boolean;
};

function SectionWithTitle({ children, title, containerStyle, titleStyle, isActive }: Props) {
  return (
    <View style={[styles.sectionWrapper, isActive && styles.activeBorder, containerStyle]}>
      {title && (
        <Text numberOfLines={1} style={[styles.sectionTitle, isActive && styles.activeTitle, titleStyle]}>
          {title}
        </Text>
      )}
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  sectionWrapper: {
    borderColor: Colors.border,
    borderWidth: 1,
    borderRadius: Metrics.batteryRadius,
    paddingHorizontal: Metrics.smallMargin,
    paddingTop: Metrics.halfMargin,
    paddingBottom: Metrics.halfMargin / 2,
    position: 'relative',
    marginVertical: Metrics.halfMargin,
  },
  sectionTitle: {
    ...Fonts.font.base.caption,
    lineHeight: 16,
    position: 'absolute',
    width: '100%',
    left: 8,
    top: -9,
    paddingLeft: Metrics.halfMargin,
    backgroundColor: Colors.background,
  },
  activeBorder: {
    borderColor: Colors.green,
  },
  activeTitle: {
    color: Colors.green,
  },
});

export default SectionWithTitle;
