import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import FileLogger from '../FileLogger';

// ls Files Mock: ['file1', 'file2']

describe('FileLogger', () => {
  test('renders screen', () => {
    const tree = render(<FileLogger />).toJSON();
    expect(tree).toMatchSnapshot();
  });
  test('delete file', () => {
    const { getByTestId } = render(<FileLogger defaultFiles={['file1', 'file2']} />);

    const selectFile = getByTestId('selectFile_file1');
    fireEvent.press(selectFile);

    const deleteFile = getByTestId('deleteFile');
    fireEvent.press(deleteFile);
  });

  test('delete all files', () => {
    const { getByTestId } = render(<FileLogger defaultFiles={['file1', 'file2']} />);

    const deleteFile = getByTestId('deleteAllFiles');
    fireEvent.press(deleteFile);
  });

  test('share File', () => {
    const { getByTestId } = render(<FileLogger defaultFiles={['file1', 'file2']} />);

    const selectFile = getByTestId('selectFile_file1');
    fireEvent.press(selectFile);

    const shareBtn = getByTestId('shareBtn');
    fireEvent.press(shareBtn);
  });

  test('share non selected File', () => {
    const { getByTestId } = render(<FileLogger />);

    const shareBtn = getByTestId('shareBtn');
    fireEvent.press(shareBtn);
  });
});
