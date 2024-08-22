import { StateType } from 'typesafe-actions';
import { store } from 'App/Store';
import rootReducer from 'App/Store/rootReducer';

declare module 'typesafe-actions' {
  export type RootState = StateType<typeof rootReducer>;
  export type AppDispatch = typeof store.dispatch;
}
