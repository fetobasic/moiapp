import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import { NavigationContainer } from '@react-navigation/native';
import { Provider } from 'react-redux';
import createMockStore from 'redux-mock-store';
import { mockedState } from 'App/Fixtures/mocks/mockedState';
import { yeti6GState } from 'App/Fixtures/yeti6GState';
import HelpScreen from '../HelpScreen';

const mockStore = createMockStore([]);
const store = mockStore({
  ...mockedState,
});

describe('HelpScreen', () => {
  test('renders screen', () => {
    const props = {
      navigation: {
        navigate: jest.fn() as any,
        canGoBack: jest.fn() as any,
      },
      route: { params: { device: yeti6GState } },
    } as any;

    const tree = render(
      <Provider store={store}>
        <NavigationContainer>
          <HelpScreen {...props} />
        </NavigationContainer>
      </Provider>,
    ).toJSON();
    expect(tree).toMatchSnapshot();
  });
  test('press buttons', () => {
    const props = {
      navigation: {
        navigate: jest.fn() as any,
        canGoBack: jest.fn() as any,
      },
      route: { params: { device: yeti6GState } },
    } as any;

    const { getByTestId } = render(
      <Provider store={store}>
        <NavigationContainer>
          <HelpScreen {...props} />
        </NavigationContainer>
      </Provider>,
    );

    const press_PairingMode = getByTestId('press_PairingMode');
    const press_AppHelpGuide = getByTestId('press_AppHelpGuide');
    const press_EmailUs = getByTestId('press_EmailUs');
    const press_CallUs = getByTestId('press_CallUs');
    const press_JoinOurOnlineCommunity = getByTestId('press_JoinOurOnlineCommunity');
    const press_RegisterProduct = getByTestId('press_RegisterProduct');
    const press_VisitOurSite = getByTestId('press_VisitOurSite');

    fireEvent.press(press_PairingMode);
    fireEvent.press(press_AppHelpGuide);
    fireEvent.press(press_EmailUs);
    fireEvent.press(press_CallUs);
    fireEvent.press(press_JoinOurOnlineCommunity);
    fireEvent.press(press_RegisterProduct);
    fireEvent.press(press_VisitOurSite);
  });
});
