export type BluetoothConnectedType = 'YETI' | 'FRIDGE';

export type BluetoothDevice = {
  id: string;
  name: string;
  rssi: number;
  advertising: {
    localName: string;
    txPowerLevel: number;
    kCBAdvDataRxPrimaryPHY: number;
    kCBAdvDataRxSecondaryPHY: number;
    isConnectable: number;
    kCBAdvDataTimestamp: number;
  };
};
