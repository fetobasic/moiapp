// a library to wrap and simplify api calls
import apisauce, { ApiResponse } from 'apisauce';
import AwsConfig from 'aws/aws-config';

import createApiMonitor from './createApiMonitor';
import AppConfig, { phoneId as _phoneId, appVersion as _appVersion, isProduction } from 'App/Config/AppConfig';
import UrlsConfig from 'App/Config/UrlsConfig';

import { FirmwareVersion, UpdateFirmwareResponse } from 'App/Types/FirmwareUpdate';
import { UsageReportUrlResponse } from 'App/Types/HistoryType';
import { PairThingRequest } from 'App/Types/BackendApi';
import { SendFeedbackFormType } from 'App/Types/FeedbackForm';
import { UserInfo, LoginRequestType, DeleteRequestType, SignUpRequestType } from 'App/Types/User';
import { NotificationsResponse } from 'App/Types/Notification';

// The timestamp of the last log entry sent to the backend
// This is used to prevent duplicate log entries with the same timestamps when the log function is called multiple times in quick succession
let lastLogTimestamp = 0;

export const enum LogLevel {
  INFO = 'INFO',
  DEBUG = 'DEBUG',
  WARNING = 'WARNING',
  ERROR = 'ERROR',
}

interface LogParams {
  phoneId?: string;
  appVersion?: string;
  message?: string;
  error?: any;
}

// our "constructor"
const create = (
  baseURL = AwsConfig.apiBaseUrl,
  timeout = UrlsConfig.defaultTimeout,
  enableLogging = AppConfig.enableBackendLogging,
) => {
  // ------
  // STEP 1
  // ------
  //
  // Create and configure an apisauce-based api object.
  //

  const apiParams = {
    // base URL is read from the "constructor"
    baseURL,
    // here are some default headers
    headers: {
      'Cache-Control': 'no-cache',
    },
    // 30 second timeout...
    timeout,
  };

  const api = apisauce.create(apiParams);
  const apiReports = apisauce.create(apiParams);

  if (!isProduction) {
    api.addMonitor(createApiMonitor('Yeti App Backend'));
  }

  // ------
  // STEP 2
  // ------
  //
  // Define some functions that call the api. The goal is to provide
  // a thin wrapper of the api layer providing nicer feeling functions
  // rather than "get", "post" and friends.
  //
  // I generally don't like wrapping the output at this level because
  // sometimes specific actions need to be take on `403` or `401`, etc.
  //
  // Since we can't hide from that, we embrace it by getting out of the
  // way at this level.
  //
  const pairThing = (data: PairThingRequest) => api.post('pair', data);
  const getThings = (phoneId: string) => api.get(`pair/${phoneId}`);
  const getThingsWithDetails = (phoneId: string) =>
    api.get(`pair/${phoneId}`, { detailed: 1, nostatus: 1 }, { timeout: UrlsConfig.shortTimeout });
  const getFirmwareVersions = (maxAge: number, limit: number): Promise<ApiResponse<FirmwareVersion[]>> =>
    api.get('firmware', { limit, 'max-age': maxAge });

  const get6GFirmwareVersions = (hostId: string, limit?: number) => api.get(`firmware-manifest/${hostId}`, { limit });

  const subPhoneForNotifications = (phoneId: string) => api.post(`phone/${phoneId}/notifications/all`);
  const unsubPhoneForNotifications = (phoneId: string) => api.delete(`phone/${phoneId}/notifications/all`);

  const unpairPhoneFromThing = (phoneId: string, thingName: string) => api.delete(`pair/${phoneId}/${thingName}`);

  const alterYetiName = (phoneId: string, thingName: string, yetiName: string) =>
    api.put(`pair/${phoneId}/${thingName}`, { yetiName });

  const registerPhoneNotifications = (phoneId: string, token: string) =>
    api.post(`phone/${phoneId}/notifications`, { token }, { timeout: UrlsConfig.shortTimeout });

  const getNotifications = ({
    thingNames,
    notificationTypes,
    from,
  }: {
    thingNames: string[];
    notificationTypes?: string[];
    from?: string;
  }): Promise<ApiResponse<NotificationsResponse>> =>
    api.get('notifications', {
      'thing-names': thingNames.join(','),
      'notification-types': notificationTypes?.join(','),
      from,
    });

  const checkForUpdates = (): Promise<ApiResponse<FirmwareVersion>> => api.get('firmware/latest');
  const updateFirmware = (
    thingName: string,
    phone: string,
    oldVersion: string,
    newVersion: string,
  ): Promise<ApiResponse<UpdateFirmwareResponse>> =>
    api.put(`thing/${thingName}/firmware`, {
      phone,
      oldVersion,
      newVersion,
    });

  const pairThingWithRetries = (
    data: PairThingRequest,
    { retryCount, retryTimeout }: { retryCount: number; retryTimeout: number },
  ) => {
    let retryNumber = 0;

    return (async function pair(): Promise<Error | null> {
      const response = await pairThing(data);
      if (response.ok) {
        return null;
      }

      if (retryNumber > retryCount) {
        throw new Error('The maximum number of thing pairing retries has been performed');
      }

      return new Promise((resolve) => setTimeout(() => resolve(pair()), ++retryNumber * retryTimeout));
    })();
  };

  const getUsageReportUrl = (thingName: string, precision: string): Promise<ApiResponse<UsageReportUrlResponse>> =>
    api.get(`thing/${thingName}/usage/${precision}`, {}, { headers: { 'Cache-Control': 'no-cache' } });

  const getInsightsReportUrl = (thingName: string, precision: string): Promise<ApiResponse<UsageReportUrlResponse>> =>
    api.get(`thing/${thingName}/insights/overall/${precision}`);

  const downloadUsageReport = (reportUrl: string): Promise<ApiResponse<UsageReportUrlResponse>> =>
    apiReports.get(reportUrl);

  const downloadInsightsReport = (reportUrl: string): Promise<ApiResponse<UsageReportUrlResponse>> =>
    apiReports.get(reportUrl);

  const sendFeedbackForm = (data: SendFeedbackFormType) => api.post('contact', data);

  // Login
  const userSignUp = (data: SignUpRequestType) => api.post('user', data);
  const userLogin = (data: LoginRequestType) => api.post('user/login', data);
  const userDelete = (data: DeleteRequestType) => api.delete('user', undefined, { data });
  const userLoginRenew = () => api.put('user/login', undefined, { timeout: UrlsConfig.shortTimeout });
  const userResetPassword = (email: string) => api.post('user/recover', { email });
  const userUpdate = (data: UserInfo) => api.put('user', data);
  const setAuthToken = (value: string) =>
    new Promise((resolve) => {
      api.setHeader('Authorization', `Bearer ${value}`);
      resolve(true);
    });
  const clearAuthToken = () =>
    new Promise((resolve) => {
      api.deleteHeader('Authorization');
      resolve(true);
    });

  const log = ({
    phoneId,
    appVersion,
    message,
    error,
    level,
  }: LogParams & {
    level: LogLevel;
  }) => {
    if (!enableLogging) {
      return Promise.resolve({ ok: true, data: null });
    }

    if (!phoneId) {
      phoneId = _phoneId;
    }

    if (!appVersion) {
      appVersion = _appVersion;
    }

    if (error) {
      message = JSON.stringify(error, Object.getOwnPropertyNames(error));
    }

    if (!message) {
      message = 'Unknown...';
    }

    let timestamp = Date.now();
    if (timestamp === lastLogTimestamp) {
      timestamp++;
    }
    lastLogTimestamp = timestamp;

    return api.post(`phone/${phoneId}/log`, {
      appVersion,
      message,
      level,
      timestamp,
    });
  };

  const logError = (params: LogParams) => log({ ...params, level: LogLevel.ERROR });
  const logWarning = (params: LogParams) => log({ ...params, level: LogLevel.WARNING });
  const logInfo = (params: LogParams) => log({ ...params, level: LogLevel.INFO });
  const logDebug = (params: LogParams) => log({ ...params, level: LogLevel.DEBUG });

  // ------
  // STEP 3
  // ------
  //
  // Return back a collection of functions that we would consider our
  // interface. Most of the time it'll be just the list of all the
  // methods in step 2.
  //
  // Notice we're not returning back the `api` created in step 1? That's
  // because it is scoped privately. This is one way to create truly
  // private scoped goodies in JavaScript.
  //
  return {
    // a list of the API functions from step 2
    alterYetiName,
    pairThing,
    unpairPhoneFromThing,
    registerPhoneNotifications,
    subPhoneForNotifications,
    unsubPhoneForNotifications,
    getNotifications,
    checkForUpdates,
    updateFirmware,
    getThings,
    pairThingWithRetries,
    getFirmwareVersions,
    get6GFirmwareVersions,
    getUsageReportUrl,
    getInsightsReportUrl,
    downloadUsageReport,
    downloadInsightsReport,
    getThingsWithDetails,
    sendFeedbackForm,
    userSignUp,
    userLogin,
    userDelete,
    userLoginRenew,
    userResetPassword,
    userUpdate,
    setAuthToken,
    clearAuthToken,
    log,
    logError,
    logWarning,
    logInfo,
    logDebug,
  };
};

// let's return back our create method as the default.
export default {
  create,
};
