import {
  getConnectedPeripheralIds,
  getDataTransferType,
  getIsDirectConnection,
  getIsShowOnboarding,
} from 'App/Store/Application/selectors';

import { mockedState } from 'App/Fixtures/mocks/mockedState';

describe('Application selectors', () => {
  test('should select isShowOnboarding from the state', () => {
    const selectedValue = getIsShowOnboarding(mockedState);

    expect(selectedValue).toEqual(mockedState.application.isShowOnboarding);
  });

  test('should select isDirectConnection from the state', () => {
    const selectedValue = getIsDirectConnection(mockedState);

    expect(selectedValue).toEqual(mockedState.application.isDirectConnection);
  });

  test('should select dataTransferType from the state', () => {
    const selectedValue = getDataTransferType(mockedState);

    expect(selectedValue).toEqual(mockedState.application.dataTransferType);
  });

  test('should select connectedPeripheralIds from the state', () => {
    const selectedValue = getConnectedPeripheralIds(mockedState);
    expect(selectedValue).toEqual(mockedState.application.connectedPeripheralIds);
  });
});
