import { createAction } from 'typesafe-actions';

export const startup = createAction('@STARTUP/STARTUP')();
export const finish = createAction('@STARTUP/FINISH')();
