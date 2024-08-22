import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import Slider from 'App/Components/ChargeProfile/Slider';

describe('Slider', () => {
  test('renders the component with all params', () => {
    const { getByTestId } = render(
      <Slider
        onChange={jest.fn()}
        minimumTrackBackgroundColor={'#000'}
        maximumTrackBackgroundColor={'#000'}
        children={<></>}
      />,
    );
    const component = getByTestId('slider');

    expect(component).toBeTruthy();
  });

  test('renders the component with changed params', () => {
    const { getByTestId, rerender } = render(
      <Slider
        onChange={jest.fn()}
        minimumTrackBackgroundColor={'#000'}
        maximumTrackBackgroundColor={'#000'}
        children={<></>}
      />,
    );
    const component = getByTestId('slider');

    expect(component).toBeTruthy();

    rerender(
      <Slider
        min={10}
        max={90}
        steps={10}
        initialValue={15}
        minValueLimit={10}
        maxValueLimit={90}
        inverted={true}
        disabled={true}
        vertical={true}
        onChange={() => {}}
        minimumTrackBackgroundColor={['#FFF', '#000']}
        maximumTrackBackgroundColor={'#FFF'}
        children={<></>}
      />,
    );

    const verticalSliderControlUp = getByTestId('verticalSliderControl_up');
    fireEvent(verticalSliderControlUp, 'press');

    const verticalSliderControlDown = getByTestId('verticalSliderControl_down');
    fireEvent(verticalSliderControlDown, 'press');
  });
});
