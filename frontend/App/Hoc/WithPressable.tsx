import React from 'react';
import { Metrics } from 'App/Themes';
import { StyleSheet, TextStyle, View, ViewStyle } from 'react-native';
import { WithTopBorder } from './index';
import { Pressable } from 'App/Components';
import { setToClipboard } from 'App/Services/Clipboard';

type Props = {
  onPress?: () => void;
  children: any;
  style?: ViewStyle | ViewStyle[];
  contentStyle?: TextStyle;
  pressableStyle?: TextStyle;
  withBorder?: boolean;
  inverse?: boolean;
  smallBorder?: boolean;
  nativePress?: boolean;
  testID?: string;
  accessibilityLabel?: string;
  useClipboardValue?: string;
};

function WithPressable({
  onPress,
  children,
  style,
  contentStyle,
  pressableStyle,
  withBorder,
  inverse,
  smallBorder,
  nativePress,
  testID,
  accessibilityLabel,
  useClipboardValue,
}: Props) {
  const accessibleProps = accessibilityLabel ? { accessible: true, accessibilityLabel: accessibilityLabel } : {};

  if (onPress) {
    return (
      <WithTopBorder
        containerStyle={style}
        contentStyle={contentStyle}
        withBorder={withBorder}
        inverse={inverse}
        smallBorder={smallBorder}>
        <Pressable
          {...accessibleProps}
          style={[styles.container, nativePress && styles.pressable, pressableStyle]}
          onPress={onPress}
          testID={testID || 'withPressable'}>
          {children}
        </Pressable>
      </WithTopBorder>
    );
  }

  if (useClipboardValue) {
    return (
      <Pressable
        style={[styles.wrapper, style]}
        onPress={() => {
          setToClipboard(useClipboardValue);
        }}>
        {children}
      </Pressable>
    );
  }

  return <View style={[styles.wrapper, style]}>{children}</View>;
}

const styles = StyleSheet.create({
  wrapper: {
    paddingVertical: 15,
    paddingHorizontal: Metrics.halfMargin,
  },
  container: {
    zIndex: 1000,
  },
  pressable: {
    opacity: 0.25,
  },
});

export default WithPressable;
