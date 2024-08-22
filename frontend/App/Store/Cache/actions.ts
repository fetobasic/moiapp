import { createAction } from 'typesafe-actions';

export const changeAppRateInfo = createAction('@CACHE/CHANGE_APP_RATE_INFO')<{
  isBlockedShowAppRate?: boolean;
  isReadyToShowAppRate?: boolean;
}>();
