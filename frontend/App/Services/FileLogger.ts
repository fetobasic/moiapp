import { NavigationState } from '@react-navigation/native';
import AppConfig, { env } from 'App/Config/AppConfig';
import { store } from 'App/Store';
import { format } from 'date-fns';
import { Dirs, FileSystem } from 'react-native-file-access';

const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB

function FileLogger() {
  let logs: string[] = [];
  let writeToFileInterval: NodeJS.Timeout;
  const FILES_DIR = `${Dirs.DocumentDir}/GZ_Logs`;

  // constructor
  (() => {
    writeToFileInterval = setInterval(() => {
      writeLogsToFile();
    }, AppConfig.writeToFileInterval);
  })();

  // Private methods
  const createFileWithContent = (content: string) =>
    new Promise<void>((resolve, reject) => {
      const fileName = `${format(new Date(), 'yyyyMMdd_HH:mm:ss')}.${env}.log`;

      FileSystem.writeFile(`${FILES_DIR}/${fileName}`, content)
        .then(() => resolve())
        .catch((error) => reject(error));
    });

  const writeLogsToFile = async () => {
    try {
      if (!logs.length) {
        return;
      }

      if (!(await FileSystem.exists(FILES_DIR))) {
        await FileSystem.mkdir(FILES_DIR);
      }

      const files = await FileSystem.ls(FILES_DIR);

      const dataToWrite = logs.join('');
      logs = [];

      if (files.length) {
        const lastFile = files[files.length - 1];

        const stats = await FileSystem.stat(`${FILES_DIR}/${lastFile}`);

        if (stats.size > MAX_FILE_SIZE) {
          await createFileWithContent(dataToWrite);
        } else {
          await FileSystem.appendFile(`${FILES_DIR}/${lastFile}`, dataToWrite);
        }
      } else {
        await createFileWithContent(dataToWrite);
      }
      console?.tron?.log?.('WriteLogsToFile Success');
    } catch (error) {
      console?.tron?.log?.('WriteLogsToFile Error', error);
    }
  };

  // Public methods
  const clearTimer = () => {
    if (writeToFileInterval) {
      clearInterval(writeToFileInterval);
    }
  };

  const addLog = (title: string, message: string) => {
    // Check if Logger is enabled
    const isFileLoggerEnabled = store?.getState().application?.isFileLoggerEnabled;

    if (!isFileLoggerEnabled) {
      return;
    }

    const log = `[${format(new Date(), 'yyyy-MM-dd_HH:mm:ss')}] ::${title}:: ${message}\n`;
    logs.push(log);
  };

  const navigationHandler = (state: NavigationState | undefined) => {
    let message = '';

    if (!state) {
      return;
    }

    const lastHistory = state.history?.[state.history.length - 1] as { type: string; status: string } | undefined;

    if (lastHistory?.type === 'drawer') {
      message += `Drawer: ${lastHistory.status}. `;
    }

    const currentRoute =
      state.routes?.[state.index]?.state?.routes?.[(state.routes?.[state.index]?.state?.routes?.length || 1) - 1];

    if (currentRoute) {
      message += `Current route: ${currentRoute.name}. ${
        currentRoute.params ? `Params: ${JSON.stringify(currentRoute.params)}.` : ''
      }`;
    }

    addLog('NAVIGATION', message);
  };

  return {
    FILES_DIR,
    addLog,
    clearTimer,
    navigationHandler,
  };
}

export const fileLogger = FileLogger();
