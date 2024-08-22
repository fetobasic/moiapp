import React from 'react';
import { View, StyleSheet } from 'react-native';
import { isIOS } from 'App/Themes';

import ConnectedLineIcon from 'App/Images/Icons/connectedLine.svg';
import ConnectedLongLineIcon from 'App/Images/Icons/connectedLongLine.svg';
import DisconnectedLineIcon from 'App/Images/Icons/disconnectedLine.svg';
import DisconnectedLongLineIcon from 'App/Images/Icons/disconnectedLongLine.svg';
import StatusGrayIcon from 'App/Images/Icons/statusGray.svg';
import StatusGreenIcon from 'App/Images/Icons/statusGreen.svg';
import LineShadow from './LineShadow';

type Props = {
  isConnected?: boolean;
  deviceOrder?: number;
};

const longLineSize = {
  ios: 160,
  android: 177,
};

const renderConnectedLineIcon = (order?: number) => {
  switch (order) {
    case 0:
      return (
        <View>
          <View style={styles.dot}>
            <LineShadow d="M8 1A3 3 0 1 1 8 13A3 3 0 0 1 8 1" fillColor="#BDCC2A" opacity={isIOS ? 0.2 : 0.1}>
              <StatusGreenIcon />
            </LineShadow>
          </View>
          <LineShadow d="M5 4V28C5 41.2548 15.7452 52 29 52H33" strokeColor="#BDCC2A">
            <ConnectedLineIcon />
          </LineShadow>
        </View>
      );
    case 1:
      return (
        <LineShadow d="M5 4V144C5 157.255 15.7452 168 29 168H33" strokeColor="#BDCC2A">
          <ConnectedLongLineIcon height={isIOS ? longLineSize.ios : longLineSize.android} />
        </LineShadow>
      );
    default:
      return <ConnectedLineIcon />;
  }
};

const renderDisconnectedLineIcon = (order?: number) => {
  switch (order) {
    case 0:
      return (
        <View>
          <StatusGrayIcon style={styles.dot} />
          <DisconnectedLineIcon />
        </View>
      );
    case 1:
      return <DisconnectedLongLineIcon height={isIOS ? longLineSize.ios : longLineSize.android} />;
    default:
      return <ConnectedLineIcon />;
  }
};

function ConnectedLine({ isConnected, deviceOrder = 0 }: Props) {
  return (
    <View
      testID="connectedLine"
      style={[
        styles.wrapper,
        { top: deviceOrder === 0 ? -28 : -30 },
        {
          zIndex: -deviceOrder,
        },
      ]}>
      {isConnected ? renderConnectedLineIcon(deviceOrder) : renderDisconnectedLineIcon(deviceOrder)}
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: { position: 'absolute', left: 30 },
  dot: { position: 'absolute', top: 15, left: -3, zIndex: 1000 },
});

export default ConnectedLine;
