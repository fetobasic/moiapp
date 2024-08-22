import * as actions from 'App/Store/Application/actions';
import { runSaga } from 'redux-saga';
import { sendFeedbackForm } from 'App/Store/Application/sagas';
import { devicesSelectors } from 'App/Store/Devices';
import { yeti6GLatestFW, yetiLegacy } from 'App/Fixtures/mocks/mockedState';

jest.spyOn(devicesSelectors, 'getDevicesInfoData').mockReturnValue([yeti6GLatestFW, yetiLegacy]);

describe('Application sagas', () => {
  const params = {
    subject: 'subject',
    email: 'email',
    name: 'name',
    phoneNumber: 'phoneNumber',
    message: 'message',
    yeti: {},
    firmwareVersionFailed: 'firmwareVersionFailed',
    thingName: 'thingName',
  };

  const expected = {
    email: 'email',
    message: 'message',
    phoneNumber: 'phoneNumber',
    subject: 'subject',
    userName: 'name',
    appVersion: 'unknown',
    os: 'iOS unknown',
    phoneId: 'unknown',
    phoneModel: 'Apple unknown (unknown)',
    yetis: [
      {
        connectedAt: 'unknown',
        firmwareVersion: 'unknown',
        model: 'unknown',
        thingName: 'unknown',
      },
      {
        connectedAt: 'unknown',
        connectedOk: true,
        firmwareVersion: 'unknown',
        firmwareVersionFailed: undefined,
        model: 'unknown',
        thingName: 'gzy1-b8d61a5c0804',
      },
      {
        connectedAt: 'unknown',
        connectedOk: true,
        firmwareVersion: '1.8.7',
        firmwareVersionFailed: undefined,
        model: 'Yeti 1500X (120V)',
        thingName: 'yeti083af2ae2330',
      },
    ],
  };
  test('should handle sending feedback form with success', async () => {
    const mockApi = { sendFeedbackForm: jest.fn(() => ({ ok: true })) };

    const initialState = {};

    const action = actions.sendFeedbackForm.request(params);

    const dispatched: [] = [];
    await runSaga(
      {
        dispatch: (dispatchedAction) => dispatched.push(dispatchedAction),
        getState: () => initialState,
      },
      sendFeedbackForm,
      mockApi,
      action,
    ).toPromise();

    expect(dispatched).toEqual([actions.sendFeedbackForm.success()]);
    expect(mockApi.sendFeedbackForm).toHaveBeenCalledWith(expected);
  });

  test('should handle sending feedback form with failure', async () => {
    const mockApi = { sendFeedbackForm: jest.fn(() => ({ ok: false })) };

    const initialState = {};
    const action = actions.sendFeedbackForm.request(params);

    const dispatched: [] = [];
    await runSaga(
      {
        dispatch: (dispatchedAction) => dispatched.push(dispatchedAction),
        getState: () => initialState,
      },
      sendFeedbackForm,
      mockApi,
      action,
    ).toPromise();

    expect(dispatched).toEqual([actions.sendFeedbackForm.failure()]);
    expect(mockApi.sendFeedbackForm).toHaveBeenCalledWith(expected);
  });
});
