import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import { NavigationContainer } from '@react-navigation/native';
import { Provider } from 'react-redux';
import createMockStore from 'redux-mock-store';
import { mockedState } from 'App/Fixtures/mocks/mockedState';
import { yeti6GState } from 'App/Fixtures/yeti6GState';
import PowerInputLimit from '../PowerInputLimit';

const mockStore = createMockStore([]);
const store = mockStore({
  ...mockedState,
});

describe('PowerInputLimit', () => {
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
          <PowerInputLimit {...props} />
        </NavigationContainer>
      </Provider>,
    ).toJSON();
    expect(tree).toMatchSnapshot();
  });
  test('renders screen with is Connected', () => {
    const props = {
      navigation: {
        navigate: jest.fn() as any,
        canGoBack: jest.fn() as any,
      },
      route: { params: { device: yeti6GState } },
    } as any;
    const localStore = mockStore({
      ...mockedState,
      network: { isConnected: true },
    });

    const { getByTestId } = render(
      <Provider store={localStore}>
        <NavigationContainer>
          <PowerInputLimit {...props} />
        </NavigationContainer>
      </Provider>,
    );

    const powerInputLimitSaveBtn = getByTestId('powerInputLimitSaveBtn');
    fireEvent.press(powerInputLimitSaveBtn);
  });
});
