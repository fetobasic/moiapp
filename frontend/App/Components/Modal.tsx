import React from 'react';
import { View, StyleSheet, Text } from 'react-native';

import { ModalButton, ModalParams } from 'App/Types/modalTypes';
import { Button } from 'App/Components';
import { Colors, Fonts, Metrics } from 'App/Themes';

import InfoIcon from 'App/Images/Icons/check.svg';
import CloseRedIcon from 'App/Images/Icons/redCross.svg';
import WarningIcon from 'App/Images/Icons/warn.svg';

type Props = {
  onClose: () => void;
  isVisible: boolean;
} & ModalParams;

function Modal({
  type = 'INFO',
  title,
  body,
  buttons,
  onClose,
  isVisible,
  hideIcon,
  customIcon,
  bodyAsElement,
}: Props) {
  const renderButtons = () => {
    if (!buttons || buttons.length === 0) {
      return null;
    }

    if (buttons.length === 1) {
      const button = buttons[0];

      return (
        <Button
          title={button.title}
          inverse={button.inverse}
          onPress={() => {
            button.action?.();
            onClose();
          }}
        />
      );
    }

    if (buttons.length === 2) {
      const button1 = buttons[0];
      const button2 = buttons[1];

      return (
        <View style={styles.row}>
          <Button
            style={styles.buttonLeft}
            title={button1.title}
            inverse={button1.inverse}
            onPress={() => {
              button1.action?.();
              onClose();
            }}
          />
          <Button
            style={styles.buttonRight}
            title={button2.title}
            inverse={button2.inverse}
            onPress={() => {
              button2.action?.();

              button2.notCloseOnConfirm ? null : onClose();
            }}
          />
        </View>
      );
    }

    return buttons.map((button: ModalButton, index: number) => (
      <Button
        key={index}
        style={styles.buttonTop}
        title={button.title}
        inverse={button.inverse}
        onPress={() => {
          button.action?.();
          onClose();
        }}
      />
    ));
  };

  const renderIcon = () => {
    let backgroundColor;
    let icon = <InfoIcon color={Colors.background} />;

    if (type === 'INFO') {
      backgroundColor = Colors.green;
    }

    if (type === 'WARN') {
      backgroundColor = 'none';
      icon = <WarningIcon />;
    }

    if (type === 'ERROR') {
      backgroundColor = Colors.portError;
      icon = <CloseRedIcon color={Colors.background} />;
    }

    return <View style={[styles.icon, { backgroundColor }]}>{customIcon || icon}</View>;
  };

  if (!type || !isVisible) {
    return null;
  }

  return (
    <View style={styles.container}>
      {!hideIcon && renderIcon()}
      <View style={styles.sectionMain}>
        <Text style={styles.titleText}>{title}</Text>
        {bodyAsElement ? body : <Text style={styles.bodyText}>{body}</Text>}
      </View>
      <View style={styles.sectionButtons}>{renderButtons()}</View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: Colors.background,
    borderRadius: 24,
    padding: Metrics.baseMargin,
    alignItems: 'center',
    paddingBottom: 50,
  },
  icon: {
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: Metrics.marginSection,
  },
  sectionMain: {
    marginBottom: Metrics.baseMargin,
  },
  titleText: {
    ...Fonts.font.condensed.h3,
    color: Colors.transparentWhite('0.87'),
    textAlign: 'center',
  },
  bodyText: {
    ...Fonts.font.base.bodyOne,
    color: Colors.transparentWhite('0.87'),
    textAlign: 'center',
  },
  row: {
    flexDirection: 'row',
  },
  sectionButtons: {
    width: '100%',
  },
  button: {
    marginTop: Metrics.marginSection,
  },
  buttonLeft: {
    flex: 1,
    marginRight: 6,
  },
  buttonRight: {
    flex: 1,
    marginLeft: 6,
  },
  buttonTop: {
    marginTop: Metrics.smallMargin,
  },
});

export default Modal;
