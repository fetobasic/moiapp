import { startsWith } from 'ramda';

import { AwsIotReady } from 'aws';
import { sendOnlineStateIfNeeded } from './Heartbeating';
import { showError } from './Alert';
import { wait } from './Wait';
import Logger from './Logger';
import Config, { isDev } from 'App/Config/AppConfig';
import {
  HTTP_STATUS_API_LIMIT,
  HTTP_STATUS_CONFLICT,
  JOB_STATUS_CANCELED,
  JOB_STATUS_IN_PROGRESS,
  JOB_STATUS_SUCCEEDED,
} from 'App/Config/Aws';
import { NullableStateObject, OperationInfo, JobInfo, ThingInfo, ReceivedStateObject } from 'App/Types/AWS';
import { isLegacyThing } from './ThingHelper';
import { fileLogger } from 'App/Services/FileLogger';

const SHADOW_NAMES = ['device', 'status', 'config', 'ota', 'lifetime'] as const;
const UNNAMED = 'unnamed';

let isAwsOnline = false;

const lastOperation: {
  [thingName: string]: {
    [shadowName: string]: {
      get?: OperationInfo;
      update?: OperationInfo;
    };
  };
} = {};
const jobs: { [key: string]: JobInfo } = {};

/*
  lastOperation Structure:
 {
  thingName1: {
    device: {
      get: {
        token: string,
        retryAttemtps: number, // 0 by default
        desiredState?: object, // present only if this "get" operation
                               // was caused by conflicing "update" operation
      },
      update: {
        token: string,
        retryAttemtps: number, // 0 by default
        desiredState: object,
      },
    },
    status: {
      get: {
        token: string,
        retryAttemtps: number, // 0 by default
        desiredState?: object, // present only if this "get" operation
                               // was caused by conflicing "update" operation
      },
      update: {
        token: string,
        retryAttemtps: number, // 0 by default
        desiredState: object,
      },
    },
    // ...
  },
  thingName2: {
    unnamed: { // <-------------- Unnamed (classic) shadow -------------
      get: {
        token: string,
        retryAttemtps: number, // 0 by default
        desiredState?: object, // present only if this "get" operation
                               // was caused by conflicing "update" operation
      },
      update: {
        token: string,
        retryAttemtps: number, // 0 by default
        desiredState: object,
      },
    },
  },
};
 */

const getLastGetOperation = (thingName: string, shadowName: string = UNNAMED) =>
  lastOperation?.[thingName]?.[shadowName]?.get || <OperationInfo>{};
const getLastUpdateOperation = (thingName: string, shadowName: string = UNNAMED) =>
  lastOperation?.[thingName]?.[shadowName]?.update || <OperationInfo>{};

const getCorrectShadowName = (thingName: string, shadowName: string) => {
  if (isLegacyThing(thingName)) {
    return undefined;
  }

  return shadowName === UNNAMED ? 'status' : shadowName;
};

// AWS basic methods
const get = (thingName: string, stateObject: NullableStateObject = null, shadowName: string = UNNAMED) =>
  AwsIotReady.then((AwsIotShadowSubscriber) => {
    const token = AwsIotShadowSubscriber.get(thingName, undefined, getCorrectShadowName(thingName, shadowName));
    const lastGetOperation = getLastGetOperation(thingName, shadowName);

    lastOperation[thingName] = {
      [shadowName]: {
        get: {
          token,
          retryAttemtps: lastGetOperation.retryAttemtps || 0,
          stateObject,
        },
      },
    };

    fileLogger.addLog(
      'Aws',
      `get. thingName: ${thingName}, shadowName: ${shadowName}, retryAttemtps: ${
        lastGetOperation.retryAttemtps
      }, stateObject: ${JSON.stringify(stateObject)}`,
    );
  });

/**
 * Update Yeti's state in Anywhere connection mode
 * The last step before call to Yeti's API
 * @param {string} thingName
 * @param {object} stateObject
 * @param {function(string, boolean)} changeSwitchState
 * @param {function} reset Callback to clear desired state and stop scheduling
 */
const update = (
  thingName: string,
  stateObject: NullableStateObject,
  changeSwitchState?: (thingName: string, state: boolean) => any,
  reset?: () => any,
  shadowName: string = UNNAMED,
) =>
  AwsIotReady.then((AwsIotShadowSubscriber) => {
    const token = AwsIotShadowSubscriber.update(thingName, stateObject, getCorrectShadowName(thingName, shadowName));
    const lastUpdateOperation = getLastUpdateOperation(thingName, shadowName);

    if (changeSwitchState) {
      changeSwitchState(thingName, true);
    }
    if (reset) {
      reset();
    }

    lastOperation[thingName] = {
      [shadowName]: {
        update: {
          token,
          retryAttemtps: lastUpdateOperation.retryAttemtps || 0,
          stateObject,
        },
      },
    };

    fileLogger.addLog(
      'Aws',
      `update. thingName: ${thingName}, shadowName: ${shadowName}, retryAttemtps: ${
        lastUpdateOperation.retryAttemtps
      } stateObject: ${JSON.stringify(stateObject)}`,
    );
  });

const register = (thingName: string, callback: Function) =>
  AwsIotReady.then((AwsIotShadowSubscriber) => {
    if (!thingName) {
      return;
    }

    Logger.dev(`Registering thing: ${thingName}. ShadowNames: ${isLegacyThing(thingName) ? 'status' : SHADOW_NAMES}`);

    AwsIotShadowSubscriber.register(
      thingName,
      {
        ignoreDeltas: true,
        ignoreDelete: true,
        enableVersioning: false,
        allowParallelGet: !isLegacyThing(thingName),
        shadowNames: isLegacyThing(thingName) ? undefined : SHADOW_NAMES,
      },
      callback,
    );
  });

const unregister = (thingName: string) =>
  AwsIotReady.then((AwsIotShadowSubscriber) => {
    Logger.dev('Unregistering thing', thingName);

    AwsIotShadowSubscriber.unregister(thingName);
  });

const stateChanges = (setState: (state: boolean) => any) =>
  AwsIotReady.then((AwsIotShadowSubscriber) => {
    AwsIotShadowSubscriber.on('connect', () => {
      Logger.dev('Application successfully connected to IoT');

      isAwsOnline = true;
      setState(true);
    });

    AwsIotShadowSubscriber.on('offline', () => {
      Logger.dev('AWS IoT Offline');

      isAwsOnline = false;
      setState(false);
    });

    AwsIotShadowSubscriber.on('error', (error: Error) => {
      Logger.dev('AWS IoT Error', error?.message);
    });
  });

const acceptState = (
  token: string,
  thingName: string,
  stateObject: ReceivedStateObject,
  shadowName: (typeof SHADOW_NAMES)[number] | typeof UNNAMED = UNNAMED,
  callback: (
    thingName: string,
    stateObject: ReceivedStateObject,
    shadowName: (typeof SHADOW_NAMES)[number] | typeof UNNAMED,
  ) => any,
) => {
  const lastGetOperation = getLastGetOperation(thingName, shadowName);
  const lastUpdateOperation = getLastUpdateOperation(thingName, shadowName);

  if (lastGetOperation.token === token) {
    delete lastOperation?.[thingName]?.[shadowName]?.get;
  }
  if (lastUpdateOperation.token === token) {
    delete lastOperation?.[thingName]?.[shadowName]?.update;
  }

  if (lastGetOperation.stateObject && lastGetOperation.token === token) {
    update(thingName, lastGetOperation.stateObject, undefined, undefined, shadowName);
  }

  sendOnlineStateIfNeeded(thingName, stateObject);
  callback(thingName, stateObject, shadowName);
};

const rejectState = (
  token: string,
  thingName: string,
  stateObject: ReceivedStateObject,
  shadowName: string = UNNAMED,
) => {
  const lastGetOperation = getLastGetOperation(thingName, shadowName);
  const lastUpdateOperation = getLastUpdateOperation(thingName, shadowName);

  switch (stateObject.code) {
    case HTTP_STATUS_CONFLICT: {
      const state = lastUpdateOperation.token === token ? lastUpdateOperation.stateObject : undefined;
      return get(thingName, state, shadowName);
    }

    case HTTP_STATUS_API_LIMIT: {
      if (lastGetOperation.token === token && lastGetOperation.retryAttemtps < Config.awsIotMaxRetryAttempts) {
        lastGetOperation.retryAttemtps += 1;

        return get(thingName, lastGetOperation.stateObject, shadowName);
      }

      if (lastUpdateOperation.token === token && lastUpdateOperation.retryAttemtps < Config.awsIotMaxRetryAttempts) {
        lastUpdateOperation.retryAttemtps += 1;

        return update(thingName, lastUpdateOperation.stateObject, undefined, undefined, shadowName);
      }

      break;
    }

    default:
      break;
  }
};

const isConnectionClosedError = (err: any) => err?.message === 'Connection closed';

const parseJobTopic = (topic: string) => {
  // Parse PROGRESS
  const matches = topic.match(/^goalzero\/things\/([^\\/]+)\/jobs\/([^\\/]+)\/progress$/);
  if (matches) {
    return {
      thingName: matches[1],
      jobId: matches[2],
    };
  }

  // Parse Completed or Canceled
  const jobTopicPrefix = '$aws/events/job/';
  if (startsWith(jobTopicPrefix, topic)) {
    const tokens = topic.split('/');

    return {
      jobId: tokens[3],
      status: tokens[4],
    };
  }

  return null;
};

const unsubscribeFromJob = (jobId: string) =>
  AwsIotReady.then((AwsIotShadowSubscriber) => {
    AwsIotShadowSubscriber.unsubscribe(
      [
        `$aws/events/job/${jobId}/completed`,
        `$aws/events/job/${jobId}/canceled`,
        `goalzero/things/${jobs[jobId].thingName}/jobs/${jobId}/progress`,
      ],
      (err: any) => {
        if (err && isDev && !isConnectionClosedError(err)) {
          showError(err);
        }
        delete jobs[jobId];
      },
    );
  });

const subscribe = (
  cb: (
    thingName: string,
    stateObject: ReceivedStateObject,
    shadowName: (typeof SHADOW_NAMES)[number] | typeof UNNAMED,
  ) => any,
  cbJob: (status: string, job: JobInfo, percentage: number) => any,
) =>
  AwsIotReady.then((AwsIotShadowSubscriber) => {
    Logger.dev('Subscribing to AWS IoT');

    // Emitted when an operation update | get | delete completes
    AwsIotShadowSubscriber.on(
      'status',
      (
        thingName: string,
        stat: 'accepted' | 'rejected',
        token: string,
        stateObject: ReceivedStateObject,
        shadowName: (typeof SHADOW_NAMES)[number] | typeof UNNAMED,
      ) => {
        Logger.dev(`received ${stat} on ${thingName}. ShadowName: ${shadowName}`, stateObject);

        if (stat === 'accepted') {
          acceptState(token, thingName, stateObject, shadowName, cb);
        } else {
          rejectState(token, thingName, stateObject, shadowName);
        }
      },
    );

    // Emitted when a different client's update or delete operation is accepted on the shadow.
    AwsIotShadowSubscriber.on(
      'foreignStateChange',
      (
        thingName: string,
        operation: string,
        stateObject: ReceivedStateObject,
        shadowName: (typeof SHADOW_NAMES)[number] | typeof UNNAMED,
      ) => {
        Logger.dev(
          `received foreign state (${operation}) on ${thingName}. ShadowName: ${shadowName || 'Classic'}`,
          JSON.stringify(stateObject, null, 2),
        );

        sendOnlineStateIfNeeded(thingName, stateObject);
        cb(thingName, stateObject, shadowName);
      },
    );

    // Emitted when a message is received on a topic
    AwsIotShadowSubscriber.on('message', (topic: string, payload: any) => {
      Logger.dev(`received message: topic - ${topic}, message`, payload);

      const jobTopic = parseJobTopic(topic);

      if (!jobTopic) {
        return;
      }

      const message = JSON.parse(payload.toString());
      const { jobProcessDetails, percentage } = message;
      let status = JOB_STATUS_SUCCEEDED;

      if (jobTopic.thingName) {
        status = JOB_STATUS_IN_PROGRESS;
      } else if (
        jobTopic.status !== 'completed' ||
        !jobProcessDetails ||
        jobProcessDetails.numberOfCanceledThings ||
        jobProcessDetails.numberOfRejectedThings ||
        jobProcessDetails.numberOfFailedThings ||
        jobProcessDetails.numberOfRemovedThings ||
        jobProcessDetails.numberOfTimedOutThings
      ) {
        status = JOB_STATUS_CANCELED;
      }

      cbJob(status, jobs[jobTopic.jobId] || {}, percentage);

      if (status === JOB_STATUS_SUCCEEDED || status === JOB_STATUS_CANCELED || percentage === 100) {
        unsubscribeFromJob(jobTopic.jobId);
      }
    });
  });

const subscribeToJob = async (jobId: string, thingName: string, version: string, attempt: number = 0) =>
  AwsIotReady.then((AwsIotShadowSubscriber) => {
    if (jobs[jobId]) {
      return;
    }

    AwsIotShadowSubscriber.subscribe(
      [
        `$aws/events/job/${jobId}/completed`,
        `$aws/events/job/${jobId}/canceled`,
        `goalzero/things/${thingName}/jobs/${jobId}/progress`,
      ],
      (err: string, props: object) => {
        if (err) {
          if (attempt < Config.awsIotMaxRetryAttempts) {
            wait(Config.defaultDelay).then(() => subscribeToJob(jobId, thingName, version, attempt + 1));
          } else if (isDev) {
            showError(err);
          }
          return;
        }

        if (!jobs[jobId]) {
          jobs[jobId] = {
            version,
            thingName,
            jobId,
          };
        }

        Logger.dev(
          `Subscribed to ${JSON.stringify(props)}. jobId: ${jobId}. thingName: ${thingName}. version: ${version}`,
        );
      },
    );
  });

// App methods
const addThing = (name: string, cb?: () => void, shadowName?: string, getAll?: boolean) =>
  register(name, () => {
    Logger.dev(`Thing ${name} registered`);

    if (getAll && !isLegacyThing(name)) {
      getAllShadowStates(name);
    } else {
      get(name, undefined, shadowName);
    }

    cb?.();
  });

const getAllShadowStates = (thingName: string) => {
  SHADOW_NAMES.map((shadowName) => get(thingName, undefined, shadowName));
};

const reconnect = () =>
  new Promise((resolve) => {
    AwsIotReady.then((AwsIotShadowSubscriber) => {
      AwsIotShadowSubscriber.device.end(true, () => {
        AwsIotShadowSubscriber.device.reconnect();
        resolve(true);
      });
    });
  });

const reconnectAndRegisterThing = async (name: string, cb?: () => void, shadowName?: string, getAll?: boolean) => {
  if (!isAwsOnline) {
    await reconnect();
    await wait(Config.awsIotReconnectTimeout);
  }

  addThing(name, cb, shadowName, getAll);
};

const registerThings = (things: ThingInfo[]) =>
  things.map((thing) => {
    return register(thing.thingName, () => {
      if (isLegacyThing(thing.thingName)) {
        get(thing.thingName);
      } else {
        getAllShadowStates(thing.thingName);
      }
    });
  });

const unregisterThings = (things: ThingInfo[]) => things.map((thing) => unregister(thing.thingName));

export {
  update,
  get,
  subscribe,
  subscribeToJob,
  addThing,
  registerThings,
  unregister,
  unregisterThings,
  reconnectAndRegisterThing,
  stateChanges,
  lastOperation,
  acceptState,
  rejectState,
  reconnect,
  getAllShadowStates,
  SHADOW_NAMES,
  UNNAMED,
};
