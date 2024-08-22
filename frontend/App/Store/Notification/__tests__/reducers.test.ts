import { initialState } from 'App/Store/Notification/reducers';
import * as actions from 'App/Store/Notification/actions';
import { notificationReducers } from 'App/Store/Notification';

describe('Notification reducers', () => {
  test('should update the token in the state', () => {
    const payload = { token: 'sd7v90f87vugd89f6gb897df6g0fd' };

    const newState = notificationReducers(initialState, actions.notificationSetToken.success(payload));

    expect(newState).toEqual({ ...initialState, token: payload.token });
  });

  test('should update the isEnabled flag in the state', () => {
    const payload = { isEnabled: true };

    const newState = notificationReducers(initialState, actions.notificationToggle.success(payload));

    expect(newState).toEqual({ ...initialState, isEnabled: payload.isEnabled });
  });

  test('should update the notifications in the state', () => {
    const payload = {
      notifications: [
        { id: 1, text: 'Notification 1' },
        { id: 2, text: 'Notification 2' },
      ],
    };

    const newState = notificationReducers(initialState, actions.notificationAdd.success(payload));

    expect(newState).toEqual({ ...initialState, notifications: payload.notifications });
  });
});
