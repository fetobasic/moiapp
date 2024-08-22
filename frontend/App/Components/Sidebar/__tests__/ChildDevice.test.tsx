import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import { mockedState, yetiLegacy } from 'App/Fixtures/mocks/mockedState';
import createMockStore from 'redux-mock-store';
import { Provider } from 'react-redux';
import { NavigationContainer } from '@react-navigation/native';
import ChildDevice from 'App/Components/Sidebar/ChildDevice';

const mockStore = createMockStore([]);
const store = mockStore(mockedState);

describe('ChildDevice', () => {
  const params = {
    item: {
      thingName: '123',
      batteryPercentage: 100,
      model: 'Y6G_2000',
      numberOfHoursLeft: 10,
      fullDeviceInfo: yetiLegacy,
      dateSync: new Date('2024-09-01T00:00:00.000Z'),
    },
    navigateToDevice: jest.fn(),
  };
  test('renders the component', () => {
    const { getByTestId } = render(
      <Provider store={store}>
        <NavigationContainer>
          <ChildDevice {...params} />
        </NavigationContainer>
      </Provider>,
    );

    const component = getByTestId('childDevice');
    const btn = getByTestId('withPressable');
    fireEvent.press(btn);

    expect(component).toBeTruthy();
  });
});
