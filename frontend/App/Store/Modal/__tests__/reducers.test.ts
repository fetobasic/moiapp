import { modalReducers } from 'App/Store/Modal';
import { initialState } from 'App/Store/Modal/reducers';
import * as actions from 'App/Store/Modal/actions';

describe('Modal reducers', () => {
  test('should handle modalToggle action and update state', () => {
    const payload = { isVisible: true, params: { type: 'INFO', title: 'Test title' } };

    const newState = modalReducers(initialState, actions.modalToggle(payload));

    expect(newState).toEqual({ ...initialState, ...payload });
  });

  test('should handle modalToggle action and update state without params', () => {
    const payload = { isVisible: true };

    const newState = modalReducers(initialState, actions.modalToggle(payload));

    expect(newState).toEqual({ ...initialState, ...payload });
  });
});
