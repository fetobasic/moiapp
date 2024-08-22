import { fireEvent, render } from '@testing-library/react-native';
import ConnectionInfo from 'App/Components/ConnectionInfo';
import { NavigationContainer } from '@react-navigation/native';

jest.useFakeTimers();

describe('ConnectionInfo', () => {
  test('renders the component with the appropriate icon and text when connected', () => {
    const device = { isConnected: true, isDirectConnection: false };

    const { getByText, getByTestId } = render(
      <NavigationContainer>
        <ConnectionInfo device={device} hideWhenConnected={false} />
      </NavigationContainer>,
    );

    const connectedIcon = getByTestId('icon');
    const connectedText = getByText(/Cloud Connected/);

    expect(connectedIcon).toBeTruthy();
    expect(connectedText).toBeTruthy();
  });

  test('renders the component with the appropriate icon and text when not connected', () => {
    const device = { isConnected: false, isDirectConnection: false };

    const { getByText, getByTestId } = render(
      <NavigationContainer>
        <ConnectionInfo device={device} hideWhenConnected={false} />
      </NavigationContainer>,
    );

    const lostConnectionIcon = getByTestId('iconConnectionLost');
    const reconnectText = getByText(/Connection Lost - Reconnecting.../);

    expect(lostConnectionIcon).toBeTruthy();
    expect(reconnectText).toBeTruthy();
  });

  test('calls the provided onPress function when connected and pressed', () => {
    const device = { isConnected: true, isDirectConnection: false };

    const onPressMock = jest.fn();

    const { getByTestId } = render(
      <NavigationContainer>
        <ConnectionInfo device={device} hideWhenConnected={false} onPress={onPressMock} />
      </NavigationContainer>,
    );

    const connectedIcon = getByTestId('icon');
    fireEvent.press(connectedIcon);

    expect(onPressMock).toHaveBeenCalled();
  });
});
