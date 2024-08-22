import BleManager from 'react-native-ble-manager';

import { FRIDGE_SERVICE_UUID, FRIDGE_WRITE_UUID } from 'App/Config/Bluetooth';
import Logger from 'App/Services/Logger';
import { FRIDGE_BIND_MODE, FridgeData, FridgeResponse } from 'App/Types/Fridge';
import fridgeDataTransforms from 'App/Transforms/fridgeDataTransforms';
import { Bluetooth } from 'App/Containers/Home/HomeScreen';

const csum = (data: number[]): number[] => {
  const total: number = data.reduce((acc, val) => acc + val, 0);
  const bstring: number[] = data.slice(); // Make a shallow copy of the data array

  bstring.push((total >> 8) & 0xff); // Add the most significant byte of the total
  bstring.push(total & 0xff); // Add the least significant byte of the total

  return bstring;
};

const request = (peripheralId: string, data: number[]): Promise<FridgeResponse> =>
  new Promise(async (resolve) => {
    if (!peripheralId) {
      Logger.dev('Error BLE request', 'No peripheralId');
      resolve({ ok: false });
      return;
    }

    const isSuccessConnected = await Bluetooth.connectIfNeeded(peripheralId, 'FRIDGE');

    if (!isSuccessConnected) {
      Logger.dev('Error BLE request', 'Not connected');
      resolve({ ok: false });
      return;
    }

    BleManager.writeWithoutResponse(peripheralId, FRIDGE_SERVICE_UUID, FRIDGE_WRITE_UUID, data, 20)
      .then(async () => {
        Logger.dev('Fridge Write Success', JSON.stringify(data));

        resolve({ ok: true });
      })
      .catch((error) => {
        Logger.dev('Fridge Write Error', error);
        resolve({ ok: false });
      });
  });

const sendBinding = (peripheralId: string): Promise<FridgeResponse> =>
  request(peripheralId, csum([0xfe, 0xfe, 0x03, 0x00]));

const disconnect = (peripheralId: string): Promise<FridgeResponse> =>
  Bluetooth.disconnect(peripheralId).then(() => ({ ok: true }));

const changeBindMode = (peripheralId: string, mode: FRIDGE_BIND_MODE): Promise<FridgeResponse> =>
  request(peripheralId, csum([0xfe, 0xfe, 0x04, 0x00, mode]));

const getSettings = (peripheralId: string): Promise<FridgeResponse> =>
  request(peripheralId, csum([0xfe, 0xfe, 0x03, 0x01]));

const changeSettings = (peripheralId: string, data: FridgeData): Promise<FridgeResponse> =>
  request(peripheralId, csum([0xfe, 0xfe, 0x1c, 0x02, ...fridgeDataTransforms.objToRaw(data)]));

const restoreFactorySettings = (peripheralId: string): Promise<FridgeResponse> =>
  request(peripheralId, csum([0xfe, 0xfe, 0x03, 0x04]));

const setLeftTemperature = (peripheralId: string, temperature: number): Promise<FridgeResponse> =>
  request(peripheralId, csum([0xfe, 0xfe, 0x04, 0x05, fridgeDataTransforms.formatSetTemperature(temperature)]));

const setRightTemperature = (peripheralId: string, temperature: number): Promise<FridgeResponse> =>
  request(peripheralId, csum([0xfe, 0xfe, 0x04, 0x06, fridgeDataTransforms.formatSetTemperature(temperature)]));

const setTemperature = (peripheralId: string, temperature: number): Promise<FridgeResponse> =>
  request(peripheralId, csum([0xfe, 0xfe, 0x04, 0x07, fridgeDataTransforms.formatSetTemperature(temperature)]));

export {
  csum,
  sendBinding,
  disconnect,
  changeBindMode,
  getSettings,
  changeSettings,
  restoreFactorySettings,
  setLeftTemperature,
  setRightTemperature,
  setTemperature,
};
