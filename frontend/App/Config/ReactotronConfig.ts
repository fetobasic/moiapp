import { NativeModules } from 'react-native';
import Reactotron, { networking } from 'reactotron-react-native';
import { reactotronRedux } from 'reactotron-redux';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Config from './DebugConfig';
import { name as appName } from 'app.json';

const host = NativeModules.SourceCode.scriptURL?.split('://')[1].split(':')[0] || 'localhost';

const reactotron = Reactotron.configure({ name: appName, host });

if (Config.useReactotron) {
  // https://github.com/infinitered/reactotron for more options!
  reactotron.setAsyncStorageHandler!(AsyncStorage)
    .useReactNative()
    //@ts-ignore
    .use(networking())
    .use(reactotronRedux())
    .connect();

  // Let's clear Reactotron on every time we load the app
  reactotron.clear!();
}

export default reactotron;
console.tron = reactotron;
