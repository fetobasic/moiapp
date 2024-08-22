import { ReactElement } from 'react';

export type ModalButton = {
  title: string;
  action?: () => void;
  color?: string;
  inverse?: boolean;
  notCloseOnConfirm?: boolean;
};

export type ModalParams = {
  type: 'INFO' | 'ERROR' | 'CONFIRM' | 'CUSTOM' | 'WARN';
  title: string | ReactElement;
  body?: string | ReactElement;
  buttons?: ModalButton[];
  hideIcon?: boolean;
  customIcon?: ReactElement;
  bodyAsElement?: boolean;
};
