import { store } from 'App/Store';
import { devicesActions } from 'App/Store/Devices';
import fridgeDataTransforms from 'App/Transforms/fridgeDataTransforms';
import { FridgeResponseType, FridgeState } from 'App/Types/Fridge';
import Logger from './Logger';
import { DeviceState } from 'App/Types/Devices';

const SETTINGS_SIZE = 36;
const TEMP_SIZE = 7;
const CHUNK_SIZE = 20;

const getResponseType = (data: number[]): FridgeResponseType => {
  const byte0 = data[0];
  const byte1 = data[1];
  const byte2 = data[2];
  const byte3 = data[3];

  if (byte0 !== 0xfe && byte1 !== 0xfe) {
    return 'UNKNOWN';
  }

  if (byte2 === 0x04 && byte3 === 0x00) {
    return 'BIND';
  }

  if (byte2 === 0x21 && byte3 === 0x01) {
    return 'GET_SETTING';
  }

  if (byte2 === 0x21 && byte3 === 0x02) {
    return 'SET_SETTING';
  }

  if (byte2 === 0x21 && byte3 === 0x04) {
    return 'RESTORE_FACTORY_SETTING';
  }

  if (byte2 === 0x04 && byte3 === 0x05) {
    return 'LEFT_SET_TEMP';
  }

  if (byte2 === 0x04 && byte3 === 0x06) {
    return 'RIGHT_SET_TEMP';
  }

  return 'UNKNOWN';
};

let lastData: number[] = [];

const storeData = (name: string, peripheralId: string, rawData: number[]): void => {
  let data: number[] = [...lastData, ...rawData];

  Logger.dev(
    `[storeData] Fridge Response. Data: ${JSON.stringify(data)}. RawData: ${JSON.stringify(
      rawData,
    )}. LastData: ${JSON.stringify(lastData)}.`,
  );

  if (data.length === CHUNK_SIZE) {
    lastData = data;
    return;
  }

  const responseType = getResponseType(data);

  Logger.dev(`Fridge Response type:${responseType}`);

  if (['GET_SETTING', 'SET_SETTING', 'RESTORE_FACTORY_SETTING'].includes(responseType)) {
    const fridgeData = fridgeDataTransforms.rawToObj(data);
    //we are going to use the name to determine the model for now, we can't rely on the fridgeModel value
    const isAlta80 = name.toLowerCase().startsWith('a1-') || name.includes('gzf1-80');
    const isFridgeExist = store.getState().devicesInfo.data.some((d: DeviceState) => d.thingName === name);

    const model = `Alta ${isAlta80 ? '80' : '50'}`;
    let fridgeState: FridgeState = {} as FridgeState;

    if (isFridgeExist) {
      fridgeState = {
        thingName: name,
        model,
        peripheralId,
        isConnected: true,
        dateSync: new Date().toString(),
        data: fridgeData,
      };
    } else {
      fridgeState = {
        thingName: name,
        model,
        peripheralId,
        name,
        connectedAt: new Date().toISOString(),
        deviceType: isAlta80 ? 'ALTA_80_FRIDGE' : 'ALTA_50_FRIDGE',
        isConnected: true,
        dateSync: new Date().toString(),
        dataTransferType: 'bluetooth',
        isDirectConnection: true,
        data: fridgeData,
      };
    }

    store.dispatch(devicesActions.devicesAddUpdate.request({ thingName: fridgeState.thingName, data: fridgeState }));
    lastData = lastData.slice(SETTINGS_SIZE);
    return;
  }

  if (responseType === 'LEFT_SET_TEMP' || responseType === 'RIGHT_SET_TEMP') {
    const devices: Array<DeviceState> = store.getState().devicesInfo.data;
    const device = devices.find((d) => d.thingName === name);

    if (!device) {
      return;
    }

    const fridgeState = {
      ...device,
      isConnected: true,
      dateSync: new Date().toString(),
      data: {
        ...(device as FridgeState).data,
        [responseType === 'LEFT_SET_TEMP' ? 'leftBoxTempSet' : 'rightBoxTempSet']: data[4],
      },
    };
    store.dispatch(devicesActions.devicesAddUpdate.request({ thingName: name, data: fridgeState }));
    lastData = lastData.slice(TEMP_SIZE);
    return;
  }
};

const getLatestData = (): number[] => lastData;

export default {
  getResponseType,
  storeData,

  // for testing
  getLatestData,
};
