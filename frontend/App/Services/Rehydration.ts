import AsyncStorage from '@react-native-async-storage/async-storage';
import { Store } from 'redux';
import { persistStore } from 'redux-persist';
import ReduxPersist from 'App/Config/ReduxPersist';
import DebugConfig from 'App/Config/DebugConfig';
import { sturtupActions } from 'App/Store/Startup';

const updateReducers = (store: Store) => {
  const { reducerVersion } = ReduxPersist;
  const startup = () => store.dispatch(sturtupActions.startup());

  // Check to ensure latest reducer version
  AsyncStorage.getItem('reducerVersion')
    .then((localVersion) => {
      if (localVersion !== reducerVersion) {
        if (DebugConfig.useReactotron) {
          console.tron.display({
            name: 'PURGE',
            value: {
              'Old Version:': localVersion,
              'New Version:': reducerVersion,
            },
            preview: 'Reducer Version Change Detected',
            important: true,
          });
        }
        // Purge store
        persistStore(store, null, startup).purge();
        AsyncStorage.setItem('reducerVersion', reducerVersion);
      } else {
        persistStore(store, null, startup);
      }
    })
    .catch(() => {
      persistStore(store, null, startup);
      AsyncStorage.setItem('reducerVersion', reducerVersion);
    });
};

export default { updateReducers };
