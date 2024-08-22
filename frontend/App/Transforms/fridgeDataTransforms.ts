import { FridgeData, FridgeUnits } from 'App/Types/Fridge';

const rawToObj = (rawData: number[]): FridgeData => ({
  lock: rawData[4] || 0,
  switch: rawData[5] || 0,
  compressorMode: rawData[6] || 0,
  batteryProtection: rawData[7] || 0,
  leftBoxTempSet: formatGetTemperature(rawData[8] || 0),
  maxControlRange: formatGetTemperature(rawData[9]) || 0,
  minControlRange: formatGetTemperature(rawData[10]) || 0,
  leftBoxTempDiff: formatGetTemperature(rawData[11]) || 0,
  startDelay: rawData[12] || 0,
  units: rawData[13] || 0,
  leftTempComp1: formatGetTemperature(rawData[14]) || 0,
  leftTempComp2: formatGetTemperature(rawData[15]) || 0,
  leftTempComp3: formatGetTemperature(rawData[16]) || 0,
  leftTempCompShutdown: formatGetTemperature(rawData[17]) || 0,
  leftTempActual: formatGetTemperature(rawData[18] || 0),
  percentOfBatteryCharge: rawData[19] || 0,
  batteryVoltageInt: rawData[20] || 0,
  batteryVoltageDec: rawData[21] || 0,
  rightBoxTempSet: formatGetTemperature(rawData[22] || 0),
  maxControlRangeForModel3: formatGetTemperature(rawData[23]) || 0,
  minControlRangeForModel3: formatGetTemperature(rawData[24]) || 0,
  rightBoxTempDiff: formatGetTemperature(rawData[25]) || 0,
  rightTempComp1: formatGetTemperature(rawData[26]) || 0,
  rightTempComp2: formatGetTemperature(rawData[27]) || 0,
  rightTempComp3: formatGetTemperature(rawData[28]) || 0,
  rightTempCompShutdown: formatGetTemperature(rawData[29]) || 0,
  rightTempActual: formatGetTemperature(rawData[30] || 0),
  runningStatesOfBoxes: rawData[31] || 0,
  fridgeModel: rawData[32] || 0,
  heatingTemp: formatGetTemperature(rawData[33]) || 0,
});

const objToRaw = (obj: FridgeData): number[] => [
  /* [byte 04] */ obj.lock || 0,
  /* [byte 05] */ obj.switch || 0,
  /* [byte 06] */ obj.compressorMode || 0,
  /* [byte 07] */ obj.batteryProtection || 0,
  /* [byte 08] */ formatSetTemperature(obj.leftBoxTempSet || 0),
  /* [byte 09] */ formatSetTemperature(obj.maxControlRange || 0),
  /* [byte 10] */ formatSetTemperature(obj.minControlRange || 0),
  /* [byte 11] */ formatSetTemperature(obj.leftBoxTempDiff || 0),
  /* [byte 12] */ obj.startDelay || 0,
  /* [byte 13] */ obj.units || 0,
  /* [byte 14] */ formatSetTemperature(obj.leftTempComp1 || 0),
  /* [byte 15] */ formatSetTemperature(obj.leftTempComp2 || 0),
  /* [byte 16] */ formatSetTemperature(obj.leftTempComp3 || 0),
  /* [byte 17] */ formatSetTemperature(obj.leftTempCompShutdown || 0),
  /* [byte 18] */ formatSetTemperature(obj.rightBoxTempSet || 0),
  /* [byte 19] */ formatSetTemperature(obj.maxControlRangeForModel3 || 0),
  /* [byte 20] */ formatSetTemperature(obj.minControlRangeForModel3 || 0),
  /* [byte 21] */ formatSetTemperature(obj.rightBoxTempDiff || 0),
  /* [byte 22] */ formatSetTemperature(obj.rightTempComp1 || 0),
  /* [byte 23] */ formatSetTemperature(obj.rightTempComp2 || 0),
  /* [byte 24] */ formatSetTemperature(obj.rightTempComp3 || 0),
  /* [byte 25] */ formatSetTemperature(obj.rightTempCompShutdown || 0),
  /* [byte 26] */ formatSetTemperature(obj.heatingTemp || 0),
  /* [byte 27] */ obj.fridgeModel || 0,
  /* [byte 28] */ 0, // reserved
];

const formatGetTemperature = (temperature: number): number => {
  if (temperature > 128) {
    return temperature - 256;
  }

  return temperature;
};

const formatSetTemperature = (temperature: number): number => {
  if (temperature < 0) {
    return 256 - Math.abs(temperature);
  }

  return temperature;
};

const getFormattedTemperature = ({
  unit = FridgeUnits.FAHRENHEIT,
  temperature = 0,
  isPowerOff = false,
}: {
  unit: FridgeUnits;
  temperature: number;
  isPowerOff: boolean;
}): string => {
  const unitLetter = unit === FridgeUnits.CELSIUS ? '˚C' : '˚F';

  return `${isPowerOff ? '--' : temperature}${unitLetter}`;
};

export default { rawToObj, objToRaw, formatGetTemperature, formatSetTemperature, getFormattedTemperature };
