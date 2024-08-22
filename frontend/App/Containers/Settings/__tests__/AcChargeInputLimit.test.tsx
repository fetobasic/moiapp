import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import { NavigationContainer } from '@react-navigation/native';
import { Provider } from 'react-redux';
import createMockStore from 'redux-mock-store';
import { mockedState } from 'App/Fixtures/mocks/mockedState';
import { yeti6GState } from 'App/Fixtures/yeti6GState';
import AcChargeInputLimit from '../AcChargeInputLimit';

const mockStore = createMockStore([]);
const store = mockStore({
  ...mockedState,
});

describe('AcChargeInputLimit', () => {
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
          <AcChargeInputLimit {...props} />
        </NavigationContainer>
      </Provider>,
    ).toJSON();
    expect(tree).toMatchSnapshot();
  });
  test('renders screen with isConnected', () => {
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
          <AcChargeInputLimit {...props} />
        </NavigationContainer>
      </Provider>,
    );

    const acChargeInputLimitSaveBtn = getByTestId('acChargeInputLimitSaveBtn');
    const rightSectionPress = getByTestId('rightSectionPress');

    fireEvent.press(acChargeInputLimitSaveBtn);
    fireEvent.press(rightSectionPress);
  });
});
