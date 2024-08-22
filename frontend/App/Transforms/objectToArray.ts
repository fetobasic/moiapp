import { WiFiList, WiFiListObj } from 'App/Types/Yeti';

export const objectToWifiArray = (object?: WiFiListObj): WiFiList[] => {
  if (!object) {
    return [];
  }

  return Object.keys(object).map((key) => ({ ...object[key], name: key }));
};
