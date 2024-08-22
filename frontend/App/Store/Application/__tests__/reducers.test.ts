import appReducers, { initialState } from 'App/Store/Application/reducers';
import * as actions from 'App/Store/Application/actions';

describe('Application reducers', () => {
  test('should handle changeDirectConnectionState action', () => {
    const payload = true;
    const nextState = appReducers(initialState, actions.changeDirectConnectionState(payload));

    expect(nextState).toEqual({ ...initialState, isDirectConnection: payload });
  });

  test('should handle changeOnboardingState action', () => {
    const payload = false;
    const nextState = appReducers(initialState, actions.changeOnboardingState(payload));

    expect(nextState).toEqual({ ...initialState, isShowOnboarding: payload });
  });

  describe('sendFeedbackForm', () => {
    test('should handle sendFeedbackForm.request action', () => {
      const nextState = appReducers(initialState, actions.sendFeedbackForm.request());

      expect(nextState).toEqual({
        ...initialState,
        feedbackFormInfo: { isError: false, isSuccess: false, isSending: true },
      });
    });

    test('should handle sendFeedbackForm.success action', () => {
      const nextState = appReducers(initialState, actions.sendFeedbackForm.success());

      expect(nextState).toEqual({
        ...initialState,
        feedbackFormInfo: { isError: false, isSuccess: true, isSending: false },
      });
    });

    test('should handle sendFeedbackForm.failure action', () => {
      const nextState = appReducers(initialState, actions.sendFeedbackForm.failure());

      expect(nextState).toEqual({
        ...initialState,
        feedbackFormInfo: { isError: true, isSuccess: false, isSending: false },
      });
    });
  });

  test('should handle clearFeedbackFormInfo action', () => {
    const nextState = appReducers(initialState, actions.clearFeedbackFormInfo());

    expect(nextState).toEqual({
      ...initialState,
      feedbackFormInfo: { isError: false, isSuccess: false, isSending: false },
    });
  });

  test('should handle setDataTransferType action', () => {
    const payload = 'bluetooth';

    const nextState = appReducers(initialState, actions.setDataTransferType(payload));

    expect(nextState).toEqual({ ...initialState, dataTransferType: payload });
  });

  test('should handle addConnectedPeripheralId action', () => {
    const payload = 'id3';

    const nextState = appReducers(initialState, actions.addConnectedPeripheralId(payload));

    expect(nextState).toEqual({
      ...initialState,
      connectedPeripheralIds: [...initialState.connectedPeripheralIds, payload],
    });
  });

  test('should handle removeConnectedPeripheralId action', () => {
    const state = { ...initialState, connectedPeripheralIds: ['id1', 'id2', 'id3'] };
    const payload = 'id2';

    const nextState = appReducers(state, actions.removeConnectedPeripheralId(payload));

    expect(nextState).toEqual({
      ...initialState,
      connectedPeripheralIds: state.connectedPeripheralIds.filter((id) => id !== payload),
    });
  });

  test('should handle updateConnectedPeripheralId action', () => {
    const payload = ['id4', 'id5'];

    const nextState = appReducers(initialState, actions.updateConnectedPeripheralId(payload));

    expect(nextState).toEqual({ ...initialState, connectedPeripheralIds: payload });
  });

  test('should handle clearConnectedPeripheralIds action', () => {
    const nextState = appReducers(initialState, actions.clearConnectedPeripheralIds());

    expect(nextState).toEqual({ ...initialState, connectedPeripheralIds: [] });
  });

  test('should handle changeAppRateInfo action', () => {
    const payload = { shownAppRateDate: new Date('2023-02-01') };

    const nextState = appReducers(initialState, actions.changeAppRateInfo(payload));

    expect(nextState).toEqual({ ...initialState, appRateInfo: { shownAppRateDate: payload.shownAppRateDate } });
  });

  test('should handle setUnits action', () => {
    const payload = { temperature: 'Fahrenheit' };

    const nextState = appReducers(initialState, actions.setUnits(payload));

    expect(nextState).toEqual({ ...initialState, units: { ...initialState.units, temperature: payload.temperature } });
  });

  test('should handle setLastDevice action', () => {
    const payload = { deviceId: 'device123', name: 'Yeti 4000' };

    const nextState = appReducers(initialState, actions.setLastDevice(payload));

    expect(nextState).toEqual({ ...initialState, lastDevice: payload });
  });
});
