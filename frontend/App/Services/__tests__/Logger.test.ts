import Logger from '../Logger';
import Sentry from '@sentry/react-native';

jest.mock('@sentry/react-native', () => ({
  captureMessage: jest.fn(),
}));

const loggers = ['debug', 'info', 'warn', 'error'];

describe('Logger.debug', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  loggers.forEach((logger) => {
    test(`should call ${logger} in development mode`, () => {
      global.__DEV__ = true;
      const tronLogMock = jest.fn();
      console.tron = { log: tronLogMock };
      Logger[logger](`${logger} message`);

      expect(tronLogMock).toHaveBeenCalledWith(`${logger} message`);

      console.tron = undefined;
    });

    test(`should call ${logger} in production mode`, () => {
      global.__DEV__ = false;
      const captureMessageMock = jest.fn();
      Sentry.captureMessage = captureMessageMock;
      Logger[logger](`${logger} message`);

      expect(captureMessageMock).toHaveBeenCalled();
    });
  });

  afterAll(() => {
    global.__DEV__ = process.env.NODE_ENV !== 'production';
  });
});
