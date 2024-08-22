import React from 'react';
import { render } from '@testing-library/react-native';
import LineShadow from 'App/Components/Sidebar/LineShadow';

describe('DeviceStatusInfo', () => {
  const params = {
    d: 'M 0 0 L 0 0',
    strokeColor: 'black',
    fillColor: 'black',
    children: <></>,
    opacity: 0.2,
  };

  test('renders the component', () => {
    render(<LineShadow {...params} />);
  });
  test('renders the component without opacity', () => {
    render(<LineShadow {...params} opacity={undefined} />);
  });
});
