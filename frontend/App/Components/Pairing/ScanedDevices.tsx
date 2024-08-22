import React from 'react';
import { View } from 'react-native';

import Row from './SelectDevice';
import { useAppSelector } from 'App/Hooks';
import { getBluetoothModelDescription } from 'App/Services/Yeti';

type Props = {
  selectedId: string;
  onSelect: (id: string) => void;
};

function ScanedDevices(props: Props) {
  const { discoveredDevices } = useAppSelector((state) => ({
    discoveredDevices: state.yetiInfo.discoveredDevices,
  }));

  return (
    <View testID="scanedDevices">
      {discoveredDevices.map((device) => (
        <Row
          key={device.id}
          title={getBluetoothModelDescription(device.name)}
          subTitle={device.name}
          isSelected={props.selectedId === device.id}
          onPress={() => props.onSelect(device.id)}
        />
      ))}
    </View>
  );
}

export default ScanedDevices;
