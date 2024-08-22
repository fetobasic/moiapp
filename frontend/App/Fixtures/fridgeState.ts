import { FridgeState, FridgeData } from 'App/Types/Fridge';

const fridgeData: FridgeData = {
  lock: 0,
  switch: 0,
  compressorMode: 0,
  batteryProtection: 0,
  leftBoxTempSet: 0,
  maxControlRange: 0,
  minControlRange: 0,
  leftBoxTempDiff: 0,
  startDelay: 0,
  units: 0,
  leftTempComp1: 0,
  leftTempComp2: 0,
  leftTempComp3: 0,
  leftTempCompShutdown: 0,
  leftTempActual: 0,
  percentOfBatteryCharge: 0,
  batteryVoltageInt: 0,
  batteryVoltageDec: 0,
  rightBoxTempSet: 0,
  maxControlRangeForModel3: 0,
  minControlRangeForModel3: 0,
  rightBoxTempDiff: 0,
  rightTempComp1: 0,
  rightTempComp2: 0,
  rightTempComp3: 0,
  rightTempCompShutdown: 0,
  rightTempActual: 0,
  runningStatesOfBoxes: 0,
  fridgeModel: 0,
  heatingTemp: 0,
};

const fridgeAlta80State: FridgeState = {
  thingName: 'gzf1-123',
  model: 'Alta 80',
  peripheralId: '123',
  name: 'Fridge Alta 80',
  connectedAt: '2023-07-26T14:36:04.498Z',
  deviceType: 'ALTA_80_FRIDGE',
  isConnected: true,
  dataTransferType: 'bluetooth',
  isDirectConnection: true,
  data: fridgeData,
};

const fridgeAlta50State: FridgeState = {
  thingName: 'gzf1-12345',
  model: 'Alta 50',
  peripheralId: '12345',
  name: 'Fridge Alta 50',
  connectedAt: '2023-07-26T14:36:04.498Z',
  deviceType: 'ALTA_50_FRIDGE',
  isConnected: true,
  dataTransferType: 'bluetooth',
  isDirectConnection: true,
  data: fridgeData,
};

export { fridgeAlta80State, fridgeAlta50State };
