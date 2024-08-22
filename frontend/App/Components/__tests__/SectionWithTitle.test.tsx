import React from 'react';
import { render } from '@testing-library/react-native';
import SectionWithTitle from 'App/Components/SectionWithTitle';
import { Colors } from 'App/Themes';

describe('SectionWithTitle component', () => {
  test('renders the component with a title', () => {
    const { getByText } = render(<SectionWithTitle title="Section Title">Child Component</SectionWithTitle>);
    const title = getByText('Section Title');

    expect(title).toBeTruthy();
  });

  test('adds active styles when isActive is true', () => {
    const { getByText } = render(
      <SectionWithTitle isActive={true} title="Section Title">
        Child Component
      </SectionWithTitle>,
    );
    const component = getByText('Section Title');

    expect(component).toHaveStyle({ color: Colors.green });
  });
});
