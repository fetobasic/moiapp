import { createAction } from 'typesafe-actions';

import { ModalParams } from 'App/Types/modalTypes';

export const modalToggle = createAction('@MODAL/MODAL_TOGGLE')<{
  isVisible: boolean;
  params?: ModalParams;
}>();
