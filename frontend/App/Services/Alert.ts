import { pathOr } from 'ramda';
import { showMessage } from 'react-native-flash-message';
import { isString } from 'lodash';

import Config, { isDev } from 'App/Config/AppConfig';
import { FEEDBACK_FORM_MODAL } from 'App/Config/NavigationRoutes';

import Logger from './Logger';

import { store } from 'App/Store';
import { Bluetooth } from 'App/Containers/Home/HomeScreen';
import { navigate, navigationGoBack } from 'App/Navigation/AppNavigation';

import { modalActions } from 'App/Store/Modal';
import { Colors, Fonts } from 'App/Themes';
import { SubjectType } from 'App/Types/FeedbackForm';
import { cacheActions } from 'App/Store/Cache';
import { ModalParams } from 'App/Types/modalTypes';
import { ReactElement } from 'react';

export const modalInfo = (params: ModalParams) => {
  store.dispatch(
    modalActions.modalToggle({
      isVisible: true,
      params,
    }),
  );
};

// OLD CODE
// Need to be refactored
export const showInfo = (
  text: string | ReactElement,
  title?: ModalParams['title'] | ReactElement,
  cb?: () => void,
  customIcon?: ReactElement,
  type?: ModalParams['type'],
  buttonTitle?: string,
) => {
  store.dispatch(
    modalActions.modalToggle({
      isVisible: true,
      params: {
        type: type || 'INFO',
        title: title || 'Info',
        body: text,
        customIcon,
        buttons: [
          {
            title: buttonTitle || 'OK',
            action: cb,
          },
        ],
      },
    }),
  );

  if (isString(text)) {
    // Do not log React elements, only strings
    Logger.info(text);
  }
};

export const showWarning = (text: string, cb?: () => void, title: string = 'Warning') => {
  let body;

  if (isString(text)) {
    body = text;
  } else if (Array.isArray(text) && isString(text[0])) {
    body = text[0];
  } else if (isDev) {
    body = JSON.stringify(text);
  } else {
    body = 'Unexpected problem occurred...';
  }

  store.dispatch(
    modalActions.modalToggle({
      isVisible: true,
      params: {
        body,
        type: 'WARN',
        title,
        buttons: [
          {
            title: 'OK',
            action: cb,
          },
        ],
      },
    }),
  );

  Logger.warn(text);
};

export const showError = (text: string, cb?: () => void, title: string = 'Error') => {
  let body;

  if (isString(text)) {
    body = text;
  } else if (Array.isArray(text) && isString(text[0])) {
    body = text[0];
  } else if (isDev) {
    body = JSON.stringify(text);
  } else {
    body = 'Unexpected problem occurred...';
  }

  store.dispatch(
    modalActions.modalToggle({
      isVisible: true,
      params: {
        body,
        type: 'ERROR',
        title,
        buttons: [
          {
            title: 'OK',
            action: () => {
              store.dispatch(cacheActions.changeAppRateInfo({ isBlockedShowAppRate: true }));
              cb?.();
            },
          },
        ],
      },
    }),
  );

  Logger.error(text);
};

export const showConfirm = (
  title: string | ReactElement = 'Confirm',
  text: string | ReactElement,
  cb: () => void,
  buttonsProps?: { confirmTitle?: string; cancelTitle?: string; notCloseOnConfirm?: boolean },
  cbCancel?: () => void,
  hideIcon?: boolean,
  customIcon?: ReactElement,
  bodyAsElement?: boolean,
) =>
  store.dispatch(
    modalActions.modalToggle({
      isVisible: true,
      params: {
        hideIcon,
        type: 'CONFIRM',
        title,
        customIcon,
        body: text,
        bodyAsElement,
        buttons: [
          {
            title: pathOr('Cancel', ['cancelTitle'], buttonsProps),
            inverse: true,
            action: cbCancel && cbCancel,
          },
          {
            title: pathOr('Ok', ['confirmTitle'], buttonsProps),
            action: cb,
            notCloseOnConfirm: buttonsProps?.notCloseOnConfirm,
          },
        ],
      },
    }),
  );

export const alertError = (text: string, cb: () => void, timeout = Config.checkResponseTimeout) =>
  setTimeout(() => {
    showError(text, cb);
  }, timeout);

export const clearAlert = (timerId: NodeJS.Timer | number | null) => {
  if (timerId) {
    clearTimeout(timerId as number);
  }
};

export const showBluetoothErrorInfo = (title?: string, action?: () => void) =>
  store.dispatch(
    modalActions.modalToggle({
      isVisible: true,
      params: {
        type: 'CUSTOM',
        title: title || "Can't find any Yeti",
        buttons: [
          {
            title: 'Try again',
            action: () => (action ? action() : Bluetooth.scan()),
          },
          {
            title: 'Use Wi-Fi',
            action: () => navigationGoBack(),
          },
          {
            title: 'Contact Us',
            action: () =>
              navigate(FEEDBACK_FORM_MODAL, {
                feedbackSubject: SubjectType.PAIRING_PROBLEM,
              }),
            color: Colors.white,
          },
        ],
      },
    }),
  );

export const showReconnect = (cb?: () => void) =>
  store.dispatch(
    modalActions.modalToggle({
      isVisible: true,
      params: {
        type: 'WARN',
        title: 'Connection Lost',
        body: 'Do you want to reconnect your device?',
        buttons: [
          {
            title: 'Cancel',
            inverse: true,
          },
          {
            title: 'Reconnect',
            action: cb,
          },
        ],
      },
    }),
  );

export const showUpdateIncompleteDialog = (text: string, onTryNow: () => void, onOk: () => void) =>
  store.dispatch(
    modalActions.modalToggle({
      isVisible: true,
      params: {
        type: 'CONFIRM',
        title: 'Update Incomplete',
        body: text,
        buttons: [
          {
            title: 'Try Now',
            action: onTryNow,
          },
          {
            title: 'OK',
            action: onOk,
          },
        ],
      },
    }),
  );

export const showErrorDialogWithContactUs = (text: string, onSendForm: () => void, onOk?: () => void) =>
  store.dispatch(
    modalActions.modalToggle({
      isVisible: true,
      params: {
        type: 'ERROR',
        title: 'Error',
        body: text,
        buttons: [
          {
            title: 'Contact Us',
            action: onSendForm,
            color: Colors.white,
          },
          {
            title: 'OK',
            action: () => {
              store.dispatch(cacheActions.changeAppRateInfo({ isBlockedShowAppRate: true }));
              onOk?.();
            },
          },
        ],
      },
    }),
  );

export const showSnackbarMessage = (message: string | string[] | (object & { message: string }), isError?: boolean) => {
  let messageText = message;

  if (Array.isArray(message)) {
    messageText = message?.[0];
  }

  if (!Array.isArray(message) && typeof message === 'object') {
    messageText = message?.message;
  }

  if (messageText) {
    showMessage({
      message: messageText as string,
      backgroundColor: isError ? Colors.red : Colors.green,
      floating: true,
      titleStyle: {
        ...Fonts.style.subtitleTwo,
        color: isError ? Colors.white : Colors.dark,
        textAlign: 'center',
      },
    });
  }
};
