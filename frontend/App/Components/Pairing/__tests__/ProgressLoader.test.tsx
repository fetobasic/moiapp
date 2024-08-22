import React from 'react';
import { render } from '@testing-library/react-native';
import { mockedState } from 'App/Fixtures/mocks/mockedState';
import createMockStore from 'redux-mock-store';
import { Provider } from 'react-redux';
import { NavigationContainer } from '@react-navigation/native';
import ProgressLoader from 'App/Components/Pairing/ProgressLoader';

jest.useFakeTimers();
const mockStore = createMockStore([]);
const store = mockStore(mockedState);

describe('ProgressLoader', () => {
  const params = {
    progress: 90,
    time: 10,
    isFinished: false,
  };

  test('renders the component', () => {
    const { getByTestId } = render(
      <Provider store={store}>
        <NavigationContainer>
          <ProgressLoader {...params} />
        </NavigationContainer>
      </Provider>,
    );
    const component = getByTestId('progressLoader');

    expect(component).toBeTruthy();
  });
  test('renders the component with progress 100', () => {
    const { getByTestId } = render(
      <Provider store={store}>
        <NavigationContainer>
          <ProgressLoader {...params} progress={100} />
        </NavigationContainer>
      </Provider>,
    );
    const component = getByTestId('progressLoader');

    expect(component).toBeTruthy();
  });
  test('renders the component with isFinished', () => {
    render(
      <Provider store={store}>
        <NavigationContainer>
          <ProgressLoader {...params} progress={100} isFinished />
        </NavigationContainer>
      </Provider>,
    );
  });
});
