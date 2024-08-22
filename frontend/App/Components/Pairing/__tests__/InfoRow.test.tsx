import React from 'react';
import { render } from '@testing-library/react-native';
import { mockedState } from 'App/Fixtures/mocks/mockedState';
import createMockStore from 'redux-mock-store';
import { Provider } from 'react-redux';
import { NavigationContainer } from '@react-navigation/native';
import InfoRow from 'App/Components/Pairing/InfoRow';

const mockStore = createMockStore([]);
const store = mockStore(mockedState);

describe('InfoRow', () => {
  const params = {
    title: 'Title',
    subTitle: 'SubTitle',
    isBluetoothConnect: true,
  };

  test('renders the component', () => {
    const { getByTestId } = render(
      <Provider store={store}>
        <NavigationContainer>
          <InfoRow {...params} />
        </NavigationContainer>
      </Provider>,
    );
    const component = getByTestId('infoRow');

    expect(component).toBeTruthy();
  });
});
