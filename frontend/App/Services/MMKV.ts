import { MMKV } from 'react-native-mmkv';
import { env } from 'App/Config/AppConfig';

export const mmkv = new MMKV({
  id: 'mmkv.default',
  encryptionKey: `gz-${env}-yetiapp`,
});
