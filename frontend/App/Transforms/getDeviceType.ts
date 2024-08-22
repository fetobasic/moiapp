import { DeviceType } from 'App/Types/Devices';
import Models from 'App/Config/Models';

export const getDeviceType = (name: string = ''): DeviceType | undefined => {
  const [modelName, model] = Object.entries(Models).find(([, m]) => name.toLowerCase().startsWith(m.name)) || [];

  if (model) {
    if (model === Models.ALTA_45_FRIDGE) {
      return 'ALTA_50_FRIDGE' as DeviceType; //return alta 50 when we get 45
    } else {
      return modelName as DeviceType;
    }
  }
};
