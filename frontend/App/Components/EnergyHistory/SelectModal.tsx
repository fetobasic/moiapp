import React from 'react';
import { Text, View, StyleSheet } from 'react-native';
import Modal from 'react-native-modal';
import { Button } from 'App/Components';
import { Colors, Fonts, Metrics } from 'App/Themes';

type Props = {
  isVisible: boolean;
  title?: string;
  titleBody?: React.ReactNode;
  doneText?: string;
  onDone: () => void;
  onClose: () => void;
  children: React.ReactNode;
  skipCloseFunction?: boolean;
  hideButtons?: boolean;
};

function SelectModal(props: Props) {
  return (
    <Modal
      testID="selectModal"
      backdropTransitionOutTiming={0}
      useNativeDriver={false}
      isVisible={props.isVisible}
      onBackdropPress={props.onClose}
      style={styles.modal}>
      <View style={styles.container}>
        <View>{props.titleBody || <Text style={styles.textTitle}>{props.title}</Text>}</View>
        {props.children}
        {!props.hideButtons && (
          <View style={styles.sectionButton}>
            <Button style={styles.buttonLeft} inverse title="Cancel" onPress={props.onClose} />
            <Button
              style={styles.buttonRight}
              title={props.doneText || 'Apply'}
              onPress={() => {
                props.onDone();

                if (!props.skipCloseFunction) {
                  props.onClose();
                }
              }}
            />
          </View>
        )}
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  modal: {
    marginHorizontal: Metrics.baseMargin,
    justifyContent: 'flex-end',
    margin: 0,
  },
  container: {
    backgroundColor: Colors.background,
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
    padding: Metrics.baseMargin,
  },
  textTitle: {
    ...Fonts.font.condensed.h3,
    alignSelf: 'center',
    marginBottom: Metrics.halfMargin,
  },
  sectionButton: {
    marginTop: Metrics.halfMargin,
    flexDirection: 'row',
  },
  buttonLeft: {
    flex: 1,
    marginRight: Metrics.halfMargin / 2,
  },
  buttonRight: {
    flex: 1,
    marginLeft: Metrics.halfMargin / 2,
  },
  icon: {
    position: 'absolute',
  },
});

export default SelectModal;
