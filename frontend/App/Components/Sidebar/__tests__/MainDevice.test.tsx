import React from 'react';
import { render } from '@testing-library/react-native';
import MainDevice from 'App/Components/Sidebar/MainDevice';
import { mockedState } from 'App/Fixtures/mocks/mockedState';
import createMockStore from 'redux-mock-store';
import { Provider } from 'react-redux';
import { NavigationContainer } from '@react-navigation/native';
import { yeti6GState } from 'App/Fixtures/yeti6GState';

const mockStore = createMockStore([]);
const store = mockStore(mockedState);

describe('MainDevice', () => {
  const params = {
    item: yeti6GState,
    childDevices: [
      {
        thingName: '123',
        batteryPercentage: 100,
        model: 'Y6G_2000',
        numberOfHoursLeft: 10,
        fullDeviceInfo: yeti6GState,
        dateSync: new Date('2024-09-01T00:00:00.000Z'),
      },
    ],
  };

  test('renders the component', () => {
    const { getByTestId } = render(
      <Provider store={store}>
        <NavigationContainer>
          <MainDevice {...params} />
        </NavigationContainer>
      </Provider>,
    );

    const component = getByTestId('mainDevice');

    expect(component).toBeTruthy();
  });
});
