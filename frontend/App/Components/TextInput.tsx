import React, {
  MutableRefObject,
  Ref,
  forwardRef,
  useCallback,
  useEffect,
  useImperativeHandle,
  useMemo,
  useRef,
  useState,
} from 'react';
import { TextInput as TextInputRN, Animated, TextInputProps, StyleSheet, ViewStyle } from 'react-native';

import { useMount } from 'App/Hooks';
import { Colors, Fonts, Metrics, isIOS } from '../Themes';
import AppConfig from 'App/Config/AppConfig';

export type Props = {
  focused?: boolean;
  onBlur?: () => void;
  onFocus?: () => void;
  containerStyle?: ViewStyle;
  sectionStyle?: ViewStyle;
  isError?: boolean;
  textInputPlaceholder?: string;
  iconStyle?: ViewStyle;
  accessibilityLabel?: string;
} & TextInputProps;

export type TextInputRef = MutableRefObject<TextInputRN & { focusNextInput: () => void }>;

const HEIGHT = 56;
const MAX_LENGTH = 200;
const ERROR_TEXT = 'Error';

const TextInput = forwardRef<TextInputRN, Props>(
  ({ placeholder, containerStyle = {}, sectionStyle = {}, children, ...props }, ref) => {
    const [isFocused, setIsFocused] = useState(false);
    const [animation] = useState(new Animated.Value(1));
    const inputRef = useRef<TextInputRN>();

    const accessibleProps = props.accessibilityLabel
      ? { accessible: true, accessibilityLabel: props.accessibilityLabel }
      : {};

    const animatedPlaceholder = useMemo(
      () => (props.isError && isFocused ? ERROR_TEXT : placeholder),
      [isFocused, placeholder, props.isError],
    );

    const focusNextInput = () => {
      if (inputRef.current?.focus) {
        inputRef.current.focus();
      }
    };

    useImperativeHandle(
      ref as React.ForwardedRef<Props & { focusNextInput: () => void }>,
      () => ({
        focusNextInput,
      }),
      [],
    );

    useMount(() => {
      if (props.focused) {
        inputRef.current?.focus?.();
      }
    });

    const startAnimation = useCallback(
      (toValue: number) => {
        Animated.timing(animation, {
          toValue,
          useNativeDriver: false,
          duration: AppConfig.quickAnimationDuration,
        }).start();
      },
      [animation],
    );

    const handleFocus = useCallback(() => {
      setIsFocused(true);
      startAnimation(0);
    }, [startAnimation]);

    const handleBlur = useCallback(() => {
      setIsFocused(false);
      startAnimation(1);
    }, [startAnimation]);

    useEffect(() => {
      if (props.value && !isFocused) {
        startAnimation(0);
      }
    }, [props.value, isFocused, startAnimation]);

    const animatedContainerStyle = useMemo(
      () => ({
        borderColor: animation.interpolate({
          inputRange: [0, 1],
          outputRange: [
            props.isError ? Colors.portError : isFocused ? Colors.green : Colors.grayDisable,
            props.isError ? Colors.portError : Colors.border,
          ],
        }),
      }),
      [animation, props.isError, isFocused],
    );

    const animatedLabelStyle = useMemo(
      () => ({
        top: animation.interpolate({
          inputRange: [0, 1],
          outputRange: [-10, 16],
        }),
        fontSize: animation.interpolate({
          inputRange: [0, 1],
          outputRange: [12, 14],
        }),
        color: animation.interpolate({
          inputRange: [0, 1],
          outputRange: [props.isError ? Colors.portError : Colors.green, Colors.transparentWhite('0.87')],
        }),
      }),
      [animation, props.isError],
    );

    return (
      <Animated.View style={[styles.container, containerStyle]}>
        <Animated.View style={[styles.main, animatedContainerStyle, sectionStyle]}>
          <Animated.Text numberOfLines={1} style={[styles.textPlaceholder, animatedLabelStyle]}>
            {animatedPlaceholder}
          </Animated.Text>
          <>
            <TextInputRN
              {...props}
              {...accessibleProps}
              ref={inputRef as Ref<TextInputRN>}
              keyboardAppearance="dark"
              underlineColorAndroid={Colors.transparent}
              selectionColor={Colors.green}
              style={[styles.textInput, props.style]}
              maxFontSizeMultiplier={1.15}
              autoFocus={props.focused}
              onPressIn={() => props.onFocus?.()}
              onFocus={handleFocus}
              onBlur={handleBlur}
              placeholder={!props.value && isFocused ? props.textInputPlaceholder : ''}
              placeholderTextColor={Colors.transparentWhite('0.38')}
              numberOfLines={1}
              maxLength={props.maxLength || MAX_LENGTH}
            />
            {children}
          </>
        </Animated.View>
      </Animated.View>
    );
  },
);

const styles = StyleSheet.create({
  container: {
    height: HEIGHT,
    shadowColor: Colors.black,
    shadowOpacity: 0.2,
    shadowOffset: { width: 4, height: 4 },
    shadowRadius: 12,
    elevation: 12,
    backgroundColor: Colors.background,
  },
  main: {
    height: HEIGHT,
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: 8,
    flex: 1,
    justifyContent: 'center',
  },
  textPlaceholder: {
    position: 'absolute',
    ...Fonts.font.base.bodyOne,
    paddingHorizontal: 4,
    marginLeft: 8,
    backgroundColor: Colors.background,
  },
  textInput: {
    ...Fonts.font.base.bodyOne,
    lineHeight: isIOS ? 16 : 20,
    paddingHorizontal: Metrics.halfMargin,
  },
});

export default TextInput;
