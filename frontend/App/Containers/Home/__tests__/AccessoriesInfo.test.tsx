import React from 'react';
import { render } from '@testing-library/react-native';
import AccessoriesInfo from '../AccessoriesInfo';

describe('AccessoriesInfo', () => {
  test('renders screen', () => {
    const tree = render(<AccessoriesInfo />).toJSON();
    expect(tree).toMatchSnapshot();
  });
});
