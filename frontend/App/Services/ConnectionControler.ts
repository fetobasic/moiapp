import { debounce, merge } from 'lodash';

import { update as awsUpdate } from './Aws';
import { update as directUpdate } from './Yeti';
import Config from 'App/Config/AppConfig';
import { AwsState, YetiState } from 'App/Types/Yeti';
import { DeviceState } from 'App/Types/Devices';

const thingUpdaters: {
  [key: string]: {
    scheduling?: boolean;
    updater: (
      desiredState: YetiState | undefined,
      isDirectConnection: boolean,
      updateDeviceState: (thingName: string, data: YetiState) => void,
      changeSwitchState: (thingName: string, state: boolean) => void,
      changeDeviceState?: (thingName: string, data: YetiState) => void,
      method?: string,
    ) => void;
  };
} = {};

const createThingUpdater = (thingName: string, debounceTimeout: number) => {
  let stateObject: AwsState | undefined;

  const reset = () => {
    stateObject = { state: { desired: {} } };

    if (thingUpdaters[thingName]) {
      thingUpdaters[thingName].scheduling = false;
    }
  };

  const send = debounce((isDirectConnection, updateDeviceState, changeSwitchState, changeDeviceState?, method?) => {
    /**
     * changeDeviceState - function need for cache data that we send to Yeti.
     * If we close the application or navigate to another screen
     * sending data is saved into the local state.
     * This necessary if we lose connection with the Internet or Yeti.
     */
    if (changeDeviceState) {
      changeDeviceState();
    }

    return isDirectConnection
      ? directUpdate(thingName, stateObject, updateDeviceState, changeSwitchState, reset, method)
      : // @ts-ignore TODO: we need to update AwsState and NullableStateObject types
        awsUpdate(thingName, stateObject, changeSwitchState, reset, method);
  }, debounceTimeout);

  reset();

  return (
    desiredState: YetiState | undefined,
    isDirectConnection: boolean,
    updateDeviceState: (thingName: string, data: YetiState) => void,
    changeSwitchState: (thingName: string, state: boolean) => void,
    changeDeviceState?: (thingName: string, data: YetiState) => void,
    method?: string,
  ) => {
    stateObject = merge(stateObject, { state: { desired: desiredState } });
    thingUpdaters[thingName].scheduling = true;
    send(isDirectConnection, updateDeviceState, changeSwitchState, changeDeviceState, method);
  };
};

const getThingUpdater = (thingName: string, debounceTimeout: number) => {
  if (!thingUpdaters[thingName]) {
    thingUpdaters[thingName] = {
      updater: createThingUpdater(thingName, debounceTimeout),
    };
  }

  return thingUpdaters[thingName].updater;
};

/**
 * Proxy update function that eventually redirects call to either Yeti's API, or AWS
 * @param {string} thingName
 * @param {object} stateObject
 * @param {boolean} isDirectConnection Flag to decide what API request should use
 * @param {string} changeSwitchState
 */

const update = ({
  thingName,
  stateObject,
  isDirectConnection,
  updateDeviceState,
  changeSwitchState,
  changeDeviceState,
  debounceTimeout = Config.debounceTimeout,
  method,
}: {
  thingName: string;
  stateObject: AwsState;
  isDirectConnection: boolean;
  updateDeviceState: (thingName: string, data: DeviceState) => void;
  changeSwitchState: (thingName: string, state: boolean) => void;
  changeDeviceState?: (thingName: string, data: DeviceState) => void;
  debounceTimeout?: number;
  method?: string;
}) => {
  const desiredState = stateObject?.state?.desired;

  if (desiredState) {
    getThingUpdater(thingName, debounceTimeout)(
      // @ts-ignore TODO: we need to use complex and recursive Partial generic of AwsState type
      desiredState,
      isDirectConnection,
      updateDeviceState,
      changeSwitchState,
      changeDeviceState,
      method,
    );
  }
};

export { update, thingUpdaters };
