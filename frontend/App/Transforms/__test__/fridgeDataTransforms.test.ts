import fridgeDataTransforms from 'App/Transforms/fridgeDataTransforms';

describe('Fridge data transforms', () => {
  describe('rawToObj', () => {
    test('should convert raw data to an object correctly', () => {
      const rawData = [
        0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23, 24, 25, 26, 27, 28, 29,
        30, 31, 32, 33,
      ];
      const expectedObject = {
        lock: 4,
        switch: 5,
        compressorMode: 6,
        batteryProtection: 7,
        leftBoxTempSet: 8,
        maxControlRange: 9,
        minControlRange: 10,
        leftBoxTempDiff: 11,
        startDelay: 12,
        units: 13,
        leftTempComp1: 14,
        leftTempComp2: 15,
        leftTempComp3: 16,
        leftTempCompShutdown: 17,
        leftTempActual: 18,
        percentOfBatteryCharge: 19,
        batteryVoltageInt: 20,
        batteryVoltageDec: 21,
        rightBoxTempSet: 22,
        maxControlRangeForModel3: 23,
        minControlRangeForModel3: 24,
        rightBoxTempDiff: 25,
        rightTempComp1: 26,
        rightTempComp2: 27,
        rightTempComp3: 28,
        rightTempCompShutdown: 29,
        rightTempActual: 30,
        runningStatesOfBoxes: 31,
        fridgeModel: 32,
        heatingTemp: 33,
      };

      const result = fridgeDataTransforms.rawToObj(rawData);

      expect(result).toEqual(expectedObject);
    });

    test('should handle an empty array', () => {
      const rawData = [];
      const expectedObject = {
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

      const result = fridgeDataTransforms.rawToObj(rawData);

      expect(result).toEqual(expectedObject);
    });
  });
});
