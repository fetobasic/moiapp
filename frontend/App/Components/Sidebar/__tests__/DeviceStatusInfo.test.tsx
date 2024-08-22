import React from 'react';
import { render } from '@testing-library/react-native';
import { mockedState } from 'App/Fixtures/mocks/mockedState';
import createMockStore from 'redux-mock-store';
import { Provider } from 'react-redux';
import { NavigationContainer } from '@react-navigation/native';
import DeviceStatusInfo from 'App/Components/Sidebar/DeviceStatusInfo';
import { yeti6GState } from 'App/Fixtures/yeti6GState';
import { fridgeAlta80State } from 'App/Fixtures/fridgeState';

const mockStore = createMockStore([]);
const store = mockStore(mockedState);

describe('DeviceStatusInfo', () => {
  test('renders the component Yeti', () => {
    const { getByTestId } = render(
      <Provider store={store}>
        <NavigationContainer>
          <DeviceStatusInfo device={yeti6GState} />
        </NavigationContainer>
      </Provider>,
    );

    const component = getByTestId('deviceStatusInfoYeti');

    expect(component).toBeTruthy();
  });
  test('renders the component Fridge', () => {
    const { getByTestId } = render(
      <Provider store={store}>
        <NavigationContainer>
          <DeviceStatusInfo device={fridgeAlta80State} />
        </NavigationContainer>
      </Provider>,
    );

    const component = getByTestId('deviceStatusInfoFridge');

    expect(component).toBeTruthy();
  });
  test('renders the component not Yeti', () => {
    render(
      <Provider store={store}>
        <NavigationContainer>
          <DeviceStatusInfo device={{ ...yeti6GState, thingName: '123' }} />
        </NavigationContainer>
      </Provider>,
    );
  });
});
