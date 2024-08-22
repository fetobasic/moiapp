import { getFirmwareUpdateData, getFirmwareVersions } from 'App/Store/FirmwareUpdate/selectors';
import { mockedState } from 'App/Fixtures/mocks/mockedState';

describe('FirmwareUpdate selectors', () => {
  test('should select the firmwareUpdate data from the state', () => {
    const selectedData = getFirmwareUpdateData(mockedState);

    expect(selectedData).toEqual(mockedState.firmwareUpdate.data);
  });

  test('should select the firmwareVersions from the state', () => {
    const selectedVersions = getFirmwareVersions(mockedState);

    expect(selectedVersions).toEqual(mockedState.firmwareUpdate.firmwareVersions);
  });
});
