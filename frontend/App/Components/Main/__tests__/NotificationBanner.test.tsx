import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import NotificationBanner from 'App/Components/Main/NotificationBanner';

describe('NotificationBanner', () => {
  const params = {
    text: 'text',
    onPressHandler: jest.fn(),
  };

  test('renders the component', () => {
    const { getByTestId } = render(<NotificationBanner {...params} />);
    const component = getByTestId('notificationBanner');

    fireEvent.press(component);

    expect(component).toBeTruthy();
  });
});
