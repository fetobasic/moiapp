import { render } from '@testing-library/react-native';
import Header from 'App/Components/Header';
import { Provider } from 'react-redux';
import createMockStore from 'redux-mock-store';
import { mockedState } from 'App/Fixtures/mocks/mockedState';

const mockStore = createMockStore([]);
const store = mockStore(mockedState);

describe('Header Component', () => {
  const name = 'testName';
  test('renders without crashing', () => {
    const { getByText } = render(
      <Provider store={store}>
        <Header device={{ name }} onMenuPress={() => {}} onNotificationsPress={() => {}} onSettingsPress={() => {}} />
      </Provider>,
    );

    const headerTitle = getByText(name);
    expect(headerTitle).toBeDefined();
  });

  // TODO: Fix this test - it is failing on the CI because of the unknown reason, saying "`render` method has not been called"
  //
  // test('displays "Connection Lost" when the device is not connected', () => {
  //   const { getByText } = render(
  //     <Provider store={store}>
  //       <Header
  //         device={{ isConnected: false }}
  //         onMenuPress={() => {}}
  //         onNotificationsPress={() => {}}
  //         onSettingsPress={() => {}}
  //       />
  //     </Provider>,
  //   );

  //   const connectionLostText = getByText('Connection Lost');
  //   expect(connectionLostText).toBeDefined();
  // });

  test('displays the device name when the device is connected', () => {
    const { getByText } = render(
      <Provider store={store}>
        <Header
          device={{ isConnected: true, name }}
          onMenuPress={() => {}}
          onNotificationsPress={() => {}}
          onSettingsPress={() => {}}
        />
      </Provider>,
    );

    const deviceName = getByText(name);
    expect(deviceName).toBeDefined();
  });
});
