import Clipboard from '@react-native-clipboard/clipboard';
import { showSnackbarMessage } from './Alert';

export const setToClipboard = (value: string = '') => {
  Clipboard.setString(value);
  showSnackbarMessage('Copied to clipboard');
};
