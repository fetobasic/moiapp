import React from 'react';
import { render } from '@testing-library/react-native';
import { mockedState } from 'App/Fixtures/mocks/mockedState';
import createMockStore from 'redux-mock-store';
import { Provider } from 'react-redux';
import { NavigationContainer } from '@react-navigation/native';
import ScanedDevices from 'App/Components/Pairing/ScanedDevices';

const mockStore = createMockStore([]);
const store = mockStore({
  ...mockedState,
  yetiInfo: { ...mockedState.yetiInfo, discoveredDevices: [{ id: '123', name: 'name' }] },
});

describe('ScanedDevices', () => {
  const params = {
    selectedId: '123',
    onSelect: jest.fn(),
  };

  test('renders the component', () => {
    const { getByTestId } = render(
      <Provider store={store}>
        <NavigationContainer>
          <ScanedDevices {...params} />
        </NavigationContainer>
      </Provider>,
    );
    const component = getByTestId('scanedDevices');

    expect(component).toBeTruthy();
  });
});
