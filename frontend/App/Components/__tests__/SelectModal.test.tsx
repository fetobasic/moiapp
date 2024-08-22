import { fireEvent, render } from '@testing-library/react-native';
import SelectModal from 'App/Components/SelectModal';

jest.useFakeTimers();
describe('SelectModal', () => {
  const data = [
    { value: 1, label: 'Option 1' },
    { value: 2, label: 'Option 2' },
    { value: 3, label: 'Option 3' },
  ];

  test('renders with the provided data and options', () => {
    const { getByText } = render(
      <SelectModal data={data} value={data[0]} visible={true} onChange={jest.fn()} onCancel={jest.fn()} />,
    );

    for (const item of data) {
      expect(getByText(item.label)).toBeTruthy();
    }
  });

  test('calls onChange when applying changes', () => {
    const onChange = jest.fn();
    const { getByText } = render(
      <SelectModal data={data} value={data[0]} visible={true} onChange={onChange} onCancel={jest.fn()} />,
    );

    const applyButton = getByText('APPLY');
    fireEvent.press(applyButton);

    expect(onChange).toHaveBeenCalledWith(data[0]);
  });

  test('calls onCancel when canceling changes', () => {
    const onCancel = jest.fn();
    const { getByText } = render(
      <SelectModal data={data} value={data[0]} visible={true} onChange={jest.fn()} onCancel={onCancel} />,
    );

    const cancelButton = getByText('CANCEL');
    fireEvent.press(cancelButton);

    expect(onCancel).toHaveBeenCalled();
  });
});
