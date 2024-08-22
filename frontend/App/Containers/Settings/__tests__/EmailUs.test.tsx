import React from 'react';
import { render } from '@testing-library/react-native';
import { NavigationContainer } from '@react-navigation/native';
import { Provider } from 'react-redux';
import createMockStore from 'redux-mock-store';
import { mockedState } from 'App/Fixtures/mocks/mockedState';
import { yeti6GState } from 'App/Fixtures/yeti6GState';
import EmailUs from '../EmailUs';

const mockStore = createMockStore([]);
const store = mockStore({
  ...mockedState,
});

describe('EmailUs', () => {
  test('renders screen', () => {
    const props = {
      navigation: {
        navigate: jest.fn() as any,
        canGoBack: jest.fn() as any,
      },
      route: {
        params: {
          device: yeti6GState,
          yeti: {
            connectedOk: true,
            thingName: '123',
            connectedAt: '2021-08-10T14:00:00.000Z',
          },
          firmwareVersionFailed: '1.0.0',
          thingName: '123',
          feedbackSubject: 'pairingProblem',
        },
      },
    } as any;

    const tree = render(
      <Provider store={store}>
        <NavigationContainer>
          <EmailUs {...props} />
        </NavigationContainer>
      </Provider>,
    ).toJSON();
    expect(tree).toMatchSnapshot();
  });
});
