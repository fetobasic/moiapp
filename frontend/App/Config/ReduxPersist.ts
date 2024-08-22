import AsyncStorage from '@react-native-async-storage/async-storage';

// More info here: https://shift.infinite.red/shipping-persistant-reducers-7341691232b1
const REDUX_PERSIST = {
  active: true,
  reducerVersion: '1.0',
  storeConfig: {
    key: 'primary',
    storage: AsyncStorage,
    // Reducer keys that you do NOT want stored to persistence here
    blacklist: ['startup', 'yetiWifiList', 'yetiInfo', 'network', 'aws', 'modal', 'firmwareUpdate', 'cache'],
  },
};

export default REDUX_PERSIST;
