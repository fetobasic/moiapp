import createApiMonitor from 'App/Services/createApiMonitor';
import Logger from 'App/Services/Logger';

jest.mock('App/Services/Logger', () => ({
  dev: jest.fn(),
}));

describe('createApiMonitor', () => {
  test('should call Logger.dev with the expected arguments', () => {
    const name = 'myLogger';
    const response = {
      config: {
        url: 'https://example.com/api/resource',
        baseURL: 'https://example.com/api/',
        method: 'GET',
      },
      data: { key: 'value' },
    };
    createApiMonitor(name)(response);

    expect(Logger.dev).toHaveBeenCalledWith('MYLOGGER: GET ', {
      config: response.config,
      data: response.data,
      response,
    });
  });
});
