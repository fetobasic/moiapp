import Config from 'App/Config/AppConfig';
import { update } from './Aws';
import { ReceivedStateObject } from 'App/Types/AWS';
import { isLegacyThing } from './ThingHelper';
import { DeviceState } from 'App/Types/Devices';

const thingsInfo: {
  [thingName: string]: {
    timerId: NodeJS.Timeout | null;
  };
} = {};

/**
 * Things Info structure:
 * {
 *  thingName1: {
 *    timerId,
 *  },
 *  thingName2: {
 *  ...
 *  },
 *  ...
 * }
 */

const sendOnlineState = (thingName: string) => {
  update(
    thingName,
    {
      // @ts-expect-error TODO: we need to use complex and recursive Partial generic of stateObject type
      state: {
        desired: {
          [isLegacyThing(thingName) ? 'app_online' : 'appOn']: 1,
        },
      },
    },
    undefined,
    undefined,
    'status',
  );
};

const sendBleToBroadcast = (thingName: string) => {
  update(
    thingName,
    {
      // @ts-expect-error TODO: we need to use complex and recursive Partial generic of stateObject type
      state: {
        desired: {
          iot: {
            ble: {
              m: 2,
            },
          },
        },
      },
    },
    undefined,
    undefined,
    'device',
  );
};

const sendOnlineStates = (things: DeviceState[]) =>
  things.forEach((thing) => {
    if (!thing.isDirectConnection) {
      sendOnlineState(thing.thingName || '');
    }
  });

const sendOnlineStateIfNeeded = (thingName: string, stateObject: ReceivedStateObject) => {
  const appOnlineState = isLegacyThing(thingName)
    ? stateObject?.state?.reported?.app_online
    : stateObject?.state?.reported?.appOn;

  if (appOnlineState === 0) {
    sendOnlineState(thingName);
  }
};

const clearTimerId = (thingName: string) => {
  const thing = thingsInfo[thingName] || {};

  if (thing.timerId) {
    clearTimeout(thing.timerId);
    thing.timerId = null;

    thingsInfo[thingName] = thing;
  }
};

const updateStateToDisconnectedAfterTimeout = (
  thingName: string,
  updateDeviceState: (thingName: string, obj: DeviceState) => void,
  timeout: number = Config.disconnectedTimeout,
) => {
  const thing = thingsInfo[thingName] || {};

  if (thing.timerId) {
    clearTimeout(thing.timerId);
  }

  thing.timerId = setTimeout(() => {
    updateDeviceState(thingName, {
      isConnected: false,
    });
  }, timeout);

  thingsInfo[thingName] = thing;
};

export {
  sendOnlineState,
  sendOnlineStates,
  sendOnlineStateIfNeeded,
  updateStateToDisconnectedAfterTimeout,
  clearTimerId,
  sendBleToBroadcast,
};
