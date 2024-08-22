import React, { ReactElement, useState } from 'react';
import { Modal, Pressable, StyleSheet, Text, View, ViewStyle } from 'react-native';
import { Colors, Fonts, isIOS, Metrics } from 'App/Themes';
import { isString } from 'lodash';
import ConfirmModal from './Settings/ConfirmModal';
import { useKeyboard } from '@react-native-community/hooks';

type Props = {
  placeholder?: string;
  visible?: boolean;
  animationType?: 'none' | 'slide' | 'fade' | undefined;
  transparent?: boolean;
  header?: string | (() => ReactElement);
  children: ReactElement;
  fullHeight?: boolean;
  style?: ViewStyle;
  title?: string;
  onSave?: () => void;
  onClose?: () => void;
  disableSaveBtn?: boolean;
  showConfirm?: boolean;
  headerStyle?: ViewStyle;
  backdropStyle?: ViewStyle;
  titleActiveBtn?: string;
};

const CONTENT_BOTTOM_PADDING = 40;

const ModalWindow = ({
  visible = true,
  animationType = 'fade',
  transparent = true,
  children,
  header,
  title,
  fullHeight,
  style,
  onSave,
  onClose,
  disableSaveBtn,
  showConfirm,
  headerStyle,
  backdropStyle,
  titleActiveBtn,
}: Props) => {
  const modalTitle = header && !isString(header) ? header() : header;
  const [showConfirmWindow, setShowConfirmWindow] = useState(false);
  const { keyboardHeight, keyboardShown } = useKeyboard();

  const onCloseHandler = () => {
    onClose?.();
    setShowConfirmWindow(false);
  };

  return (
    <Modal animationType={animationType} transparent={transparent} visible={visible} statusBarTranslucent>
      <View style={[styles.backdrop, backdropStyle]}>
        <View style={[styles.content, fullHeight && styles.fullHeight, style]}>
          {header ? (
            <Text style={styles.modalTitle}>{modalTitle}</Text>
          ) : (
            <View style={[styles.headerContainer, headerStyle]}>
              <Pressable testID="modalWindowOnClose" onPress={showConfirm ? () => setShowConfirmWindow(true) : onClose}>
                <Text style={styles.headerBtn}>CLOSE</Text>
              </Pressable>
              <Text style={Fonts.font.base.h3}>{title || 'Select'}</Text>
              <Pressable testID="modalWindowOnSave" onPress={() => !disableSaveBtn && onSave?.()}>
                <Text style={[styles.headerBtn, disableSaveBtn && styles.disableSaveBtn]}>
                  {titleActiveBtn || 'SAVE'}
                </Text>
              </Pressable>
            </View>
          )}
          <View
            style={[
              fullHeight && styles.children,
              {
                paddingBottom:
                  !isIOS && keyboardShown ? keyboardHeight + CONTENT_BOTTOM_PADDING : CONTENT_BOTTOM_PADDING,
              },
            ]}>
            {children}
          </View>
        </View>
      </View>
      <ConfirmModal
        title="Data Not Saved"
        subTitle="Are you sure you want to exit?"
        animationType={animationType}
        transparent={transparent}
        visible={showConfirmWindow}
        onClose={() => setShowConfirmWindow(false)}
        onConfirm={onCloseHandler}
      />
    </Modal>
  );
};

const styles = StyleSheet.create({
  backdrop: {
    backgroundColor: Colors.transparentBlack('0.9'),
    flex: 1,
    flexDirection: 'column-reverse',
  },
  headerContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: Metrics.baseMargin,
    paddingVertical: Metrics.baseMargin,
    alignItems: 'center',
  },
  headerBtn: {
    ...Fonts.font.base.button,
    color: Colors.green,
    marginTop: 4,
  },
  disableSaveBtn: {
    color: Colors.grayDisable,
  },
  content: {
    backgroundColor: Colors.background,
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
  },
  fullHeight: {
    height: Metrics.screenHeight - 52,
  },
  children: {
    height: Metrics.screenHeight - 133,
  },
  modalTitle: {
    ...Fonts.font.base.h3,
    textAlign: 'center',
    margin: Metrics.baseMargin,
  },
  buttons: {
    margin: Metrics.baseMargin,
    flexDirection: 'row',
  },
});

export default ModalWindow;
