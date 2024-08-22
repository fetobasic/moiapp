import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import Modal from 'App/Components/Modal';

describe('Modal component', () => {
  test('should render correctly with INFO type', () => {
    const { getByText } = render(
      <Modal
        type="INFO"
        title="Sample Title"
        body="Sample Body"
        buttons={[
          { title: 'Button 1', action: jest.fn() },
          { title: 'Button 2', action: jest.fn() },
        ]}
        onClose={jest.fn()}
        isVisible={true}
        hideIcon={false}
      />,
    );

    expect(getByText('Sample Title')).toBeTruthy();
    expect(getByText('Sample Body')).toBeTruthy();
    expect(getByText('Button 1')).toBeTruthy();
    expect(getByText('Button 2')).toBeTruthy();
  });

  test('should render correctly with WARN type', () => {
    const { getByText } = render(
      <Modal
        type="WARN"
        title="Sample Title"
        body="Sample Body"
        buttons={[{ title: 'Button 1', action: jest.fn() }]}
        onClose={jest.fn()}
        isVisible={true}
        hideIcon={false}
      />,
    );

    expect(getByText('Sample Title')).toBeTruthy();
    expect(getByText('Sample Body')).toBeTruthy();
    expect(getByText('Button 1')).toBeTruthy();
  });

  test('should render correctly with ERROR type', () => {
    const { getByText } = render(
      <Modal
        type="ERROR"
        title="Sample Title"
        body="Sample Body"
        buttons={[]}
        onClose={jest.fn()}
        isVisible={true}
        hideIcon={false}
      />,
    );

    expect(getByText('Sample Title')).toBeTruthy();
    expect(getByText('Sample Body')).toBeTruthy();
  });

  test('should not render when not visible', () => {
    const { queryByText } = render(
      <Modal
        type="INFO"
        title="Sample Title"
        body="Sample Body"
        buttons={[{ title: 'Button 1', action: jest.fn() }]}
        onClose={jest.fn()}
        isVisible={false}
        hideIcon={false}
      />,
    );

    expect(queryByText('Sample Title')).toBeNull();
    expect(queryByText('Sample Body')).toBeNull();
  });

  test('should render without icon when hideIcon is true', () => {
    const { queryByTestId } = render(
      <Modal
        type="INFO"
        title="Sample Title"
        body="Sample Body"
        buttons={[]}
        onClose={jest.fn()}
        isVisible={true}
        hideIcon={true}
      />,
    );

    expect(queryByTestId('modal-icon')).toBeNull();
  });

  test('should handle a single button click', () => {
    const buttonAction = jest.fn();

    const { getByText } = render(
      <Modal
        type="INFO"
        title="Sample Title"
        body="Sample Body"
        buttons={[{ title: 'Button 1', action: buttonAction }]}
        onClose={jest.fn()}
        isVisible={true}
        hideIcon={false}
      />,
    );

    fireEvent.press(getByText('Button 1'));

    expect(buttonAction).toHaveBeenCalled();
  });

  test('should handle multiple buttons click', () => {
    const button1Action = jest.fn();
    const button2Action = jest.fn();
    const { getByText } = render(
      <Modal
        type="INFO"
        title="Sample Title"
        body="Sample Body"
        buttons={[
          { title: 'Button 1', action: button1Action },
          { title: 'Button 2', action: button2Action },
        ]}
        onClose={jest.fn()}
        isVisible={true}
        hideIcon={false}
      />,
    );

    fireEvent.press(getByText('Button 1'));
    fireEvent.press(getByText('Button 2'));

    expect(button1Action).toHaveBeenCalled();
    expect(button2Action).toHaveBeenCalled();
  });

  test('should render buttons when provided mor then two', () => {
    const button1Action = jest.fn();
    const button2Action = jest.fn();
    const button3Action = jest.fn();

    const { getByText } = render(
      <Modal
        type="INFO"
        title="Sample Title"
        body="Sample Body"
        buttons={[
          { title: 'Button 1', action: button1Action },
          { title: 'Button 2', action: button2Action },
          { title: 'Button 3', action: button3Action },
        ]}
        onClose={jest.fn()}
        isVisible={true}
        hideIcon={false}
      />,
    );

    const button1 = getByText('Button 1');
    const button2 = getByText('Button 2');
    const button3 = getByText('Button 3');

    expect(button1).toBeTruthy();
    expect(button2).toBeTruthy();
    expect(button3).toBeTruthy();

    fireEvent.press(button1);
    fireEvent.press(button2);
    fireEvent.press(button3);

    expect(button1Action).toHaveBeenCalled();
    expect(button2Action).toHaveBeenCalled();
    expect(button3Action).toHaveBeenCalled();
  });
});
