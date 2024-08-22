import { render } from '@testing-library/react-native';
import Spinner from 'App/Components/Spinner';

describe('Spinner', () => {
  test('does not render when visible is false', () => {
    const { queryByTestId } = render(<Spinner visible={false} />);
    const spinner = queryByTestId('spinner');
    expect(spinner).toBeNull();
  });

  test('renders when visible is true', () => {
    const { queryByTestId } = render(<Spinner visible={true} />);
    const spinner = queryByTestId('spinner');
    expect(spinner).toBeTruthy();
  });
});
