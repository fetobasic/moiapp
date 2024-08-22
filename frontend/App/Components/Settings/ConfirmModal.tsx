import React from 'react';
import { Modal, StyleSheet, Text, View } from 'react-native';
import { Colors, Fonts, Metrics } from 'App/Themes';
import { Button } from 'App/Components';

type Props = {
  animationType?: 'none' | 'slide' | 'fade' | undefined;
  transparent?: boolean;
  visible?: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  subTitle: string;
};

const ConfirmModal = ({ title, subTitle, animationType, transparent, visible, onClose, onConfirm }: Props) => (
  <Modal animationType={animationType} transparent={transparent} visible={visible}>
    <View style={styles.backdropBtn}>
      <View style={styles.modalContent}>
        <Text style={styles.confirmModalTitle}>{title}</Text>
        <Text style={styles.confirmModalSubTitle}>{subTitle}</Text>
        <View style={styles.btnContainer}>
          <Button style={styles.btnLeft} title="Cancel" onPress={onClose} inverse />
          <Button style={styles.btnRight} title="Yes" onPress={onConfirm} />
        </View>
      </View>
    </View>
  </Modal>
);

const styles = StyleSheet.create({
  backdropBtn: {
    backgroundColor: Colors.transparentBlack('0.7'),
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: Colors.background,
    borderRadius: 24,
    alignItems: 'center',
    padding: Metrics.baseMargin,
    width: '100%',
  },
  confirmModalTitle: {
    ...Fonts.font.base.h3,
  },
  confirmModalSubTitle: {
    ...Fonts.font.base.bodyOne,
    paddingTop: 4,
    paddingBottom: Metrics.baseMargin,
  },
  btnContainer: {
    flexDirection: 'row',
    width: '100%',
  },
  btnLeft: {
    flex: 1,
    marginRight: Metrics.halfMargin,
  },
  btnRight: {
    flex: 1,
  },
});

export default ConfirmModal;
