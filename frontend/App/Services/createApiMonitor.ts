import { ApiResponse, Monitor } from 'apisauce';
import Logger from './Logger';

type Response = {
  config: {
    url: string;
    baseURL: string;
    method: string;
  };
  data: any;
  response: any;
};

function urlWithoutBase(response: ApiResponse<Response>) {
  return response?.config?.url?.substr(response?.config?.url?.length);
}

export default (name: string): Monitor => {
  return (response: ApiResponse<Response>) => {
    Logger.dev(`${name.toUpperCase()}: ${response?.config?.method?.toUpperCase()} ${urlWithoutBase(response)}`, {
      config: response.config,
      data: response.data,
      response,
    });
  };
};
