import React from 'react';
import { render } from '@testing-library/react-native';
import { NavigationContainer } from '@react-navigation/native';
import { Provider } from 'react-redux';
import createMockStore from 'redux-mock-store';
import { mockedState } from 'App/Fixtures/mocks/mockedState';
import SecretSettings from '../SecretSettings';

const mockStore = createMockStore([]);
const store = mockStore({
  ...mockedState,
});

describe('SecretSettings', () => {
  test('renders screen', () => {
    const tree = render(
      <Provider store={store}>
        <NavigationContainer>
          <SecretSettings
            rows={[
              {
                title: 'Title',
                description: 'Description',
              },
            ]}
          />
        </NavigationContainer>
      </Provider>,
    ).toJSON();
    expect(tree).toMatchSnapshot();
  });
});
