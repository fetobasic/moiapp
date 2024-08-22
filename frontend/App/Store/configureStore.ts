import { ConfigureStoreOptions, configureStore } from '@reduxjs/toolkit';
import createSagaMiddleware from 'redux-saga';
import { persistReducer } from 'redux-persist';

import ReduxPersist from 'App/Config/ReduxPersist';
import Config from 'App/Config/DebugConfig';
import ReactotronConfig from 'App/Config/ReactotronConfig';
import Rehydration from 'App/Services/Rehydration';

import rootSaga from './rootSaga';
import rootReducer from './rootReducer';

import Logger from 'App/Services/Logger';
import BackendApi from 'App/Services/BackendApi';

export default function ConfigureStore() {
  Logger?.initialize();

  /* ------------- Redux Configuration ------------- */
  let finalReducers = rootReducer;

  const middleware = [];
  const enhancers = [];

  if (ReduxPersist.active) {
    // @ts-ignore as it seems too complicated to narrow type here
    finalReducers = persistReducer(ReduxPersist.storeConfig, rootReducer);
  }

  /* ------------- Saga Middleware ------------- */

  const sagaMonitor = Config.useReactotron ? console?.tron?.createSagaMonitor?.() : undefined;
  const sagaMiddleware = createSagaMiddleware({ sagaMonitor });

  middleware.push(sagaMiddleware);

  if (Config.useReactotron && !process.env.IS_TEST) {
    // @ts-ignore
    enhancers.push(ReactotronConfig.createEnhancer!());
  }

  /* ------------- Assemble Middleware ------------- */
  const storeConfig: ConfigureStoreOptions = {
    reducer: finalReducers,
    middleware,
  };

  if (enhancers.length > 0) {
    storeConfig.enhancers = enhancers;
  }

  const store = configureStore(storeConfig);

  // configure persistStore and check reducer version number
  if (ReduxPersist.active) {
    Rehydration.updateReducers(store);
  }

  const rootSagaTask = sagaMiddleware.run(rootSaga);

  rootSagaTask.toPromise().catch((error) => {
    BackendApi.create().logError({ error });
    Logger.error(error);
  });

  return store;
}
