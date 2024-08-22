import { store } from 'App/Store';
import {
  getBluetoothModelDescription,
  getPortKey,
  getVoltage,
  getYetiImage,
  isLegacyYeti,
  isYeti6G,
  update,
} from '../Yeti';
import { yetiLegacy } from 'App/Fixtures/mocks/mockedState';
import { Bluetooth } from 'App/Containers/Home/HomeScreen';
import { YetiModel } from 'App/Types/Yeti';
import { Images } from 'App/Themes';
import Models from 'App/Config/Models';

describe('Yeti', () => {
  describe('update', () => {
    test('should return Undefined if empty stateObject', async () => {
      const result = await update(
        yetiLegacy.thingName || '',
        undefined,
        () => {},
        () => {},
        () => {},
        'device',
      );

      expect(result).toBeUndefined();
    });

    test('should call Bluetooth API', async () => {
      jest.spyOn(store, 'getState').mockReturnValue({
        // @ts-ignore
        devicesInfo: {
          data: [{ ...yetiLegacy, dataTransferType: 'bluetooth' }],
        },
      });

      Bluetooth.changeState = jest.fn().mockReturnValue(
        Promise.resolve({
          ok: true,
          data: yetiLegacy,
          problem: null,
          originalError: null,
        }),
      );

      const result = await update(
        yetiLegacy.thingName || '',
        {
          state: {
            desired: {
              acPortStatus: 1,
            },
          },
        },
        () => {},
        () => {},
        () => {},
        'device',
      );

      expect(result).toBeUndefined();
    });

    test('should call WiFi API', async () => {
      jest.spyOn(store, 'getState').mockReturnValue({
        // @ts-ignore
        devicesInfo: {
          data: [{ ...yetiLegacy, dataTransferType: 'wifi' }],
        },
      });

      const result = await update(
        yetiLegacy.thingName || '',
        {
          state: {
            desired: {
              acPortStatus: 1,
            },
          },
        },
        () => {},
        () => {},
        () => {},
        'device',
      );

      expect(result).toBeUndefined();
    });
  });

  describe('getYetiImage', () => {
    test('should return Yeti 300 image', () => {
      const model = YetiModel.YETI_300_120V;

      const result = getYetiImage(model);

      expect(result).toBe(Images.yetiDevice.yeti300_front);
    });
    test('should return Yeti 500 image', () => {
      const model = YetiModel.YETI_500_120V;

      const result = getYetiImage(model);

      expect(result).toBe(Images.yetiDevice.yeti500_front);
    });
    test('should return Yeti 700 image', () => {
      const model = YetiModel.YETI_700_120V;

      const result = getYetiImage(model);

      expect(result).toBe(Images.yetiDevice.yeti700_front);
    });
    test('should return Yeti 1400 image', () => {
      const model = YetiModel.YETI_1400;

      const result = getYetiImage(model);

      expect(result).toBe(Images.yetiDevice.yeti1400_front);
    });
    test('should return Yeti 3000 image', () => {
      const model = YetiModel.YETI_3000;

      const result = getYetiImage(model);

      expect(result).toBe(Images.yetiDevice.yeti3000_front);
    });
    test('should return Yeti 1500X image', () => {
      const model = YetiModel.YETI_1500X_120V;

      const result = getYetiImage(model);

      expect(result).toBe(Images.yetiDevice.yeti1500X_front);
    });
    test('should return Yeti Pro 4000 image', () => {
      const model = YetiModel.YETI_PRO_4000;

      const result = getYetiImage(model);

      expect(result).toBe(Images.yetiDevice.yeti4000);
    });
    test('should return Yeti Pro 2000 image', () => {
      const model = YetiModel.YETI_2000_230V;

      const result = getYetiImage(model);

      expect(result).toBe(Images.yetiDevice.yeti2000);
    });
    test('should return Yeti 3000X image', () => {
      const model = YetiModel.YETI_3000X_120V;

      const result = getYetiImage(model);

      expect(result).toBe(Images.yetiDevice.yeti3000X_front);
    });
    test('should return Yeti 6000X image', () => {
      const model = YetiModel.YETI_6000X_120V;

      const result = getYetiImage(model);

      expect(result).toBe(Images.yetiDevice.yeti6000X_front);
    });
    test('should return Alta 50 image', () => {
      const model = 'Alta 50';

      const result = getYetiImage(model);

      expect(result).toBe(Images.fridgeDevice.alta50_front);
    });
    test('should return Alta 80 image', () => {
      const model = 'Alta 80';

      const result = getYetiImage(model);

      expect(result).toBe(Images.fridgeDevice.alta80_front);
    });
    test('should return default Yeti 1500X image', () => {
      const result = getYetiImage();

      expect(result).toBe(Images.yetiDevice.yeti1500X_front);
    });
  });

  describe('getVoltage', () => {
    test('should return 120V', () => {
      const model = YetiModel.YETI_1400;

      const result = getVoltage(model);

      expect(result).toEqual('V120');
    });
    test('should return 230V', () => {
      const model = YetiModel.YETI_1500X_230V;

      const result = getVoltage(model);

      expect(result).toEqual('V230');
    });
  });

  describe('isLegacyYeti', () => {
    test('should return true', () => {
      const result = isLegacyYeti('Yeti-123');

      expect(result).toBeTruthy();
    });

    test('should return false', () => {
      const result = isLegacyYeti('gzy-123');

      expect(result).toBeFalsy();
    });
  });

  describe('isYeti6G', () => {
    test('should return true', () => {
      const result = isYeti6G('gzy-123');

      expect(result).toBeTruthy();
    });

    test('should return false', () => {
      const result = isYeti6G('gzf1-80-123');

      expect(result).toBeFalsy();
    });
  });

  describe('getBluetoothModelDescription', () => {
    test('should return valid description', () => {
      const result = getBluetoothModelDescription(Models.YETI.name);

      expect(result).toEqual(Models.YETI.description);
    });

    test('should return false', () => {
      const result = getBluetoothModelDescription('123');

      expect(result).toEqual('');
    });
  });

  describe('getPortKey', () => {
    test('should return acOut port', () => {
      const result = getPortKey('acPortStatus');

      expect(result).toEqual('acOut');
    });
    test('should return usbOut port', () => {
      const result = getPortKey('usbPortStatus');

      expect(result).toEqual('usbOut');
    });
    test('should return v12Out port', () => {
      const result = getPortKey('v12PortStatus');

      expect(result).toEqual('v12Out');
    });
  });

  // describe('registerDevices', () => {
  //   test('should success registerDevices', () => {
  //     jest.spyOn(store, 'getState').mockReturnValue({
  //       // @ts-ignore
  //       devicesInfo: {
  //         data: [yetiLegacy, yeti6GState, fridgeAlta50State, fridgeAlta80State],
  //       },
  //     });

  //     registerDevices();
  //   });
  // });
});
