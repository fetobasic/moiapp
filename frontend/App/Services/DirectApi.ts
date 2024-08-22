/* eslint no-plusplus: 0 */

// a library to wrap and simplify api calls
import apisauce, { ApiErrorResponse, ApiResponse } from 'apisauce';
import AppConfig from 'App/Config/AppConfig';
import UrlsConfig from 'App/Config/UrlsConfig';
import { DeviceType } from 'App/Types/Devices';
import { StartOtaResponse } from 'App/Types/FirmwareUpdate';
import { YetiConnectionCredentials, YetiState, YetiDirectInfo, WiFiListObj, YetiSysInfo } from 'App/Types/Yeti';
import { wait } from './Wait';

// our "constructor"
const create = (baseURL = UrlsConfig.yetiIP, timeout = UrlsConfig.directConnectTimeout) => {
  // ------
  // STEP 1
  // ------
  //
  // Create and configure an apisauce-based api object.
  //
  const api = apisauce.create({
    // base URL is read from the "constructor"
    baseURL,
    // here are some default headers
    headers: {
      'Cache-Control': 'no-cache',
    },
    // 2 seconds timeout...
    timeout,
  });

  function withRetry<T>(
    request: (...args: any[]) => Promise<ApiResponse<T>>,
    maxAttempts: number = 3,
    delay: number = AppConfig.defaultDelay,
  ): typeof request {
    const requestWithRetry = async (
      attempt: number,
      lastResponse: ApiResponse<any>,
      args: any[],
    ): Promise<ApiResponse<any>> => {
      if (attempt >= maxAttempts) {
        return lastResponse;
      }
      if (attempt > 0 && delay > 0) {
        await wait(delay);
      }

      const response = await request(...args);

      return response.ok ? response : requestWithRetry(attempt + 1, response, args);
    };

    return (...args: any[]) =>
      requestWithRetry(
        0,
        { ok: false, originalError: new Error(), problem: 'UNKNOWN_ERROR' } as ApiErrorResponse<any>,
        args,
      );
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

  /** GET */
  const getWifiList = withRetry<WiFiListObj>(() => api.get('wifi'));
  const getYetiInfo = (): Promise<ApiResponse<any>> => api.get('sysinfo');
  const checkState = (deviceType: DeviceType): Promise<ApiResponse<YetiState>> =>
    api.get(deviceType === 'YETI' ? 'state' : 'status');

  /** POST */
  const postToYeti = withRetry<YetiSysInfo>((data: YetiConnectionCredentials) => api.post('join', data));
  const setPassword = (password: string): Promise<ApiResponse<undefined>> =>
    api.post('password-set', { new_password: password });
  const directConnect = (): Promise<ApiResponse<YetiDirectInfo>> => api.post('join-direct');
  const changeState = (data: YetiState): Promise<ApiResponse<YetiState>> => api.post('state', data);
  const startPair = (): Promise<ApiResponse<undefined>> => api.post('start-pair');
  const updateYetiOta = (params: {
    url: string;
    ssid: string;
    pass: string | null;
    urlSignature: string;
    keyId: string;
  }): Promise<ApiResponse<StartOtaResponse>> => api.post('ota', params);

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
    getWifiList,
    getYetiInfo,
    postToYeti,
    startPair,
    setPassword,
    directConnect,
    checkState,
    changeState,
    updateYetiOta,
  };
};

// let's return back our create method as the default.
export default {
  create,
};
