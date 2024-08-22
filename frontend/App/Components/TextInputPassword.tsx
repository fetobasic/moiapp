import React, { forwardRef, useState } from 'react';
import { StyleSheet, View, TextInput as TextInputRN } from 'react-native';

import { TextInput, Pressable } from 'App/Components';
import type { Props } from './TextInput';

import EyeEnable from 'App/Images/Icons/eyeIcon.svg';
import EyeDisable from 'App/Images/Icons/eyeIconDisable.svg';
import { Colors } from 'App/Themes';

const TextInputPassword = forwardRef<TextInputRN, Props>((props, ref) => {
  const [hidePassword, setHidePassword] = useState(true);
  const [showEye, setShowEye] = useState(props.focused || false);

  return (
    <View>
      <TextInput
        testID="passwordInput"
        {...props}
        style={[styles.textInput, props.style]}
        accessible={true}
        accessibilityLabel="Password field"
        secureTextEntry={hidePassword}
        onFocus={() => setShowEye(true)}
        ref={ref}
        onChangeText={props.onChangeText}
        onBlur={() => {
          if (!props.value) {
            setShowEye(false);
          }
        }}
      />
      {showEye && (
        <Pressable
          style={[styles.iconSection, props.iconStyle]}
          accessible={true}
          accessibilityLabel="Eye watermark"
          onPress={() => setHidePassword((value) => !value)}>
          {hidePassword ? (
            <EyeDisable testID="eyeIcon" color={Colors.highEmphasis} />
          ) : (
            <EyeEnable testID="eyeIcon" color={Colors.highEmphasis} />
          )}
        </Pressable>
      )}
    </View>
  );
});

const styles = StyleSheet.create({
  textInput: {
    paddingRight: 40,
  },
  iconSection: {
    position: 'absolute',
    bottom: 5,
    right: 0,
    padding: 10,
  },
});

export default TextInputPassword;
