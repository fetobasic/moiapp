import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import { NavigationContainer } from '@react-navigation/native';
import { Provider } from 'react-redux';
import createMockStore from 'redux-mock-store';
import { mockedState } from 'App/Fixtures/mocks/mockedState';
import { yeti6GState } from 'App/Fixtures/yeti6GState';
import ChangeName from '../ChangeName';

const mockStore = createMockStore([]);
const store = mockStore({
  ...mockedState,
});

describe('ChangeName', () => {
  test('renders screen', () => {
    const props = {
      navigation: {
        navigate: jest.fn() as any,
        canGoBack: jest.fn() as any,
      },
      route: { params: { device: yeti6GState } },
    } as any;

    const tree = render(
      <Provider store={store}>
        <NavigationContainer>
          <ChangeName {...props} />
        </NavigationContainer>
      </Provider>,
    ).toJSON();
    expect(tree).toMatchSnapshot();
  });
  test('renders screen press button', () => {
    const props = {
      navigation: {
        navigate: jest.fn() as any,
        canGoBack: jest.fn() as any,
      },
      route: { params: { device: yeti6GState } },
    } as any;

    const { getByTestId } = render(
      <Provider store={store}>
        <NavigationContainer>
          <ChangeName {...props} />
        </NavigationContainer>
      </Provider>,
    );

    const saveBtn = getByTestId('saveBtn');

    fireEvent.press(saveBtn);
  });
});
