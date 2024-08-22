import * as Sentry from '@sentry/react-native';
import DeviceInfo from 'react-native-device-info';
import { isArray } from 'lodash';
import { env, phoneId } from 'App/Config/AppConfig';
import { fileLogger } from 'App/Services/FileLogger';

const Logger = {
  initialize() {
    if (__DEV__) {
      return;
    }

    // tags are indexed and searchable in Sentry
    Sentry.setTags({
      environment: env,
      phone_id: phoneId,
    });

    // context is not indexed but may be useful for debugging
    Sentry.setContext('extra', {
      device_id: DeviceInfo.getDeviceId(),
    });
  },

  identify(email: string) {
    if (__DEV__) {
      return;
    }

    Sentry.setUser(email ? { email } : null);
  },

  debug(message: any) {
    if (__DEV__) {
      return console?.tron?.log?.(message);
    }

    return Sentry.captureMessage(message, {
      level: 'debug',
    });
  },

  dev(...message: any) {
    if (__DEV__) {
      console?.tron?.log?.(...message);
      console.log(...message);
    }

    fileLogger.addLog(
      'Logger.DEV',
      isArray(message) ? message.map((m) => JSON.stringify(m)).join('. ') : JSON.stringify(message),
    );
  },

  info(message: any) {
    if (__DEV__) {
      return console?.tron?.log?.(message);
    }

    return Sentry.captureMessage(message, {
      level: 'info',
    });
  },

  warn(message: any) {
    if (__DEV__) {
      return console?.tron?.log?.(message);
    }

    return Sentry.captureMessage(message, {
      level: 'warning',
    });
  },

  error(message: any) {
    if (__DEV__) {
      return console?.tron?.log?.(message);
    }

    if (message instanceof Error) {
      return Sentry.captureException(message);
    } else {
      return Sentry.captureMessage(message, {
        level: 'error',
      });
    }
  },
};

export default Logger;
