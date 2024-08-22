import { runSaga } from 'redux-saga';
import {
  addOrUpdateDevice,
  changeAcsryModeState,
  changeAcsryTankCapacityState,
  changeAllBatteryItemsState,
  changeAllNotificationsState,
  changeAllPortsState,
  changeChargingProfileState,
  changeFirmwareUpdateNotificationState,
  changeName,
  changeSettings,
  checkCurrentState,
  checkDevices,
  checkPairedThings,
  removeDevice,
  unpairAllDevices,
  unpairPhone,
  updateAllDevice,
} from 'App/Store/Devices/sagas';
import * as actions from 'App/Store/Devices/actions';
import { initialState } from 'App/Store/Devices/reducers';
import { devicesSelectors } from 'App/Store/Devices';
// eslint-disable-next-line @typescript-eslint/no-unused-vars
import { unregister } from 'App/Services/Aws';
import { yeti6G, yetiLegacy } from 'App/Fixtures/mocks/mockedState';
import { applicationActions, applicationSelectors } from 'App/Store/Application';
import { notificationActions } from 'App/Store/Notification';
import { advanceTo } from 'jest-date-mock';
import { Bluetooth } from 'App/Containers/Home/HomeScreen';
import { SeverityType } from 'App/Types/Notification';

const thingName = 'testThingName';

beforeAll(() => {
  Bluetooth.getDeviceState = jest.fn().mockImplementation(() =>
    Promise.resolve({
      ok: true,
      data: yeti6G,
    }),
  );
});

describe('Devices sagas', () => {
  describe('addOrUpdateDevice', () => {
    test('should add a new device when thingName does not exist', async () => {
      jest.spyOn(devicesSelectors, 'getDevicesInfoData').mockReturnValue([{ thingName }]);
      const payload = { data: {}, withReplace: false };

      const dispatched: [] = [];

      await runSaga(
        { dispatch: (action) => dispatched.push(action), getState: () => initialState },
        addOrUpdateDevice,
        actions.devicesAddUpdate.request(payload),
      ).toPromise();

      expect(dispatched).toEqual([actions.devicesAddUpdate.success({ data: [{ thingName }, {}] })]);
    });

    test('should handle devicesAddUpdate failure', async () => {
      jest.spyOn(devicesSelectors, 'getDevicesInfoData').mockReturnValue([]);
      const payload = { data: {}, withReplace: false };

      const dispatched: [] = [];

      await runSaga(
        { dispatch: (action) => dispatched.push(action), getState: () => initialState },
        addOrUpdateDevice,
        actions.devicesAddUpdate.request(payload),
      ).toPromise();

      expect(dispatched).toContainEqual(actions.devicesAddUpdate.failure());
    });

    test('should update an existing device when thingName exists and withReplace is true', async () => {
      jest.spyOn(devicesSelectors, 'getDevicesInfoData').mockReturnValue([{ thingName }]);
      const payload = { thingName, data: {}, withReplace: true };

      const dispatched: [] = [];

      await runSaga(
        {
          dispatch: (action) => dispatched.push(action),
          getState: () => initialState,
        },
        addOrUpdateDevice,
        actions.devicesAddUpdate.request(payload),
      ).toPromise();

      expect(dispatched).toContainEqual(actions.devicesAddUpdate.success({ data: [{ thingName }] }));
    });

    test('should update an existing device when thingName exists and withReplace is false', async () => {
      jest.spyOn(devicesSelectors, 'getDevicesInfoData').mockReturnValue([{ thingName }]);
      const payload = { thingName, data: {}, withReplace: false };

      const dispatched: [] = [];

      await runSaga(
        {
          dispatch: (action) => dispatched.push(action),
          getState: () => initialState,
        },
        addOrUpdateDevice,
        actions.devicesAddUpdate.request(payload),
      ).toPromise();

      expect(dispatched).toContainEqual(actions.devicesAddUpdate.success({ data: [{ thingName }] }));
    });
  });

  test('should dispatch the success action with the provided data', async () => {
    const payload = { data: [{ thingName }] };

    const dispatched: [] = [];

    await runSaga(
      { dispatch: (action) => dispatched.push(action) },
      updateAllDevice,
      actions.devicesUpdateAll.request(payload),
    ).toPromise();

    expect(dispatched).toContainEqual(actions.devicesAddUpdate.success(payload));
  });

  describe('removeDevice', () => {
    unregister = jest.fn();

    test('should handle the removal of an existing device', async () => {
      jest.spyOn(devicesSelectors, 'getDevicesInfoData').mockReturnValue([yetiLegacy]);
      const dispatched: [] = [];

      await runSaga(
        { dispatch: (action) => dispatched.push(action), getState: () => initialState },
        removeDevice,
        actions.devicesRemove({ thingName: yetiLegacy.thingName }),
      ).toPromise();
      expect(dispatched).toEqual([
        applicationActions.removeConnectedPeripheralId(yetiLegacy.peripheralId),
        notificationActions.notificationToggle.success({ isEnabled: false }),
        notificationActions.notificationRemoveAll({
          things: [yetiLegacy.thingName],
          types: Object.values(SeverityType),
        }),
        applicationActions.changeDirectConnectionState(false),
        applicationActions.setLastDevice(''),
        actions.devicesEmpty(),
      ]);
    });

    test('should handle the removal of a non-existing device', async () => {
      jest.spyOn(devicesSelectors, 'getDevicesInfoData').mockReturnValue([yetiLegacy]);
      const dispatched: [] = [];

      await runSaga(
        { dispatch: (action) => dispatched.push(action), getState: () => initialState },
        removeDevice,
        actions.devicesRemove({ thingName: 'nonExistingDevice' }),
      ).toPromise();

      expect(dispatched).toContainEqual(actions.devicesFailure());
    });

    test('should handle the removal empty changes device', async () => {
      jest.spyOn(devicesSelectors, 'getDevicesInfoData').mockReturnValue([yeti6G, yetiLegacy]);
      const dispatched: [] = [];

      await runSaga(
        { dispatch: (action) => dispatched.push(action), getState: () => initialState },
        removeDevice,
        actions.devicesRemove({ thingName: yetiLegacy.thingName }),
      ).toPromise();

      expect(dispatched).toEqual([
        applicationActions.removeConnectedPeripheralId(yetiLegacy.peripheralId),
        actions.devicesAddUpdate.success({ data: [yeti6G] }),
      ]);
    });
  });

  describe('checkDevices', () => {
    test('should dispatch devicesExists when there are devices', async () => {
      jest.spyOn(devicesSelectors, 'getDevicesInfoData').mockReturnValue([yeti6G]);
      const dispatched: [] = [];

      await runSaga(
        { dispatch: (action) => dispatched.push(action), getState: () => initialState },
        checkDevices,
      ).toPromise();

      expect(dispatched).toContainEqual(actions.devicesExists());
    });

    test('should dispatch devicesEmpty when there are no devices', async () => {
      jest.spyOn(devicesSelectors, 'getDevicesInfoData').mockReturnValue([]);
      const dispatched: [] = [];

      await runSaga(
        { dispatch: (action) => dispatched.push(action), getState: () => initialState },
        checkDevices,
      ).toPromise();

      expect(dispatched).toContainEqual(actions.devicesEmpty());
    });
  });

  describe('changeName', () => {
    const payload = { thingName, name: 'NewThingName', cb: jest.fn() };

    test('should handle successful name change', async () => {
      jest.spyOn(devicesSelectors, 'getDevicesInfoData').mockReturnValue([yeti6G]);
      const mockApi = { alterYetiName: jest.fn(() => ({ ok: true })) };
      const dispatched: [] = [];

      await runSaga(
        { dispatch: (action) => dispatched.push(action), getState: () => initialState },
        changeName,
        mockApi,
        actions.devicesChangeName(payload),
      ).toPromise();

      expect(dispatched).toContainEqual(actions.devicesAddUpdate.success({ data: [{ name: 'NewThingName' }] }));
      expect(payload.cb).toHaveBeenCalled();
    });

    test('should handle failed name change when isDirectConnection is true', async () => {
      jest.spyOn(devicesSelectors, 'getDevicesInfoData').mockReturnValue([yeti6G]);
      const mockApi = { alterYetiName: jest.fn(() => ({ ok: false })) };
      const dispatched: [] = [];

      await runSaga(
        { dispatch: (action) => dispatched.push(action), getState: () => initialState },
        changeName,
        mockApi,
        actions.devicesChangeName(payload),
      ).toPromise();

      expect(dispatched).toContainEqual(actions.devicesFailure());
    });
  });

  describe('checkCurrentState', () => {
    const mockApi = { checkState: jest.fn(() => ({ ok: true, data: {} })) };
    const payload = { peripheralId: yeti6G.peripheralId, deviceType: 'Y6G_4000', thingName: yeti6G.thingName };

    test('should handle successful state check with direct connection', async () => {
      jest.spyOn(devicesSelectors, 'getDevicesInfoData').mockReturnValue([yeti6G]);
      const dispatched: [] = [];
      advanceTo(new Date());
      const dateSync = new Date().toISOString();

      await runSaga(
        { dispatch: (action) => dispatched.push(action), getState: () => initialState },
        checkCurrentState,
        mockApi,
        actions.checkYetiState(payload),
      ).toPromise();

      expect(dispatched).toEqual([
        actions.devicesAddUpdate.success({
          data: [
            {
              ...yeti6G,
              dateSync,
              isConnected: true,
              isLockAllBatteryItems: false,
              isLockAllNotifications: false,
              isLockAllPorts: false,
              isLockChangeAcsryMode: false,
              isLockChangeAcsryTankCapacity: false,
              isLockChangeChargingProfile: false,
            },
          ],
        }),
      ]);
    });

    test('should handle successful state check with wifi connection', async () => {
      advanceTo(new Date());
      const dateSync = new Date().toISOString();
      jest.spyOn(devicesSelectors, 'getDevicesInfoData').mockReturnValue([{ ...yeti6G, dataTransferType: 'wifi' }]);
      const dispatched: [] = [];

      await runSaga(
        { dispatch: (action) => dispatched.push(action), getState: () => initialState },
        checkCurrentState,
        mockApi,
        actions.checkYetiState(payload),
      ).toPromise();

      expect(dispatched).toEqual([
        actions.devicesAddUpdate.success({
          data: [
            {
              ...yeti6G,
              dataTransferType: 'wifi',
              dateSync,
              isConnected: true,
              isLockAllBatteryItems: false,
              isLockAllNotifications: false,
              isLockAllPorts: false,
              isLockChangeAcsryMode: false,
              isLockChangeAcsryTankCapacity: false,
              isLockChangeChargingProfile: false,
            },
          ],
        }),
      ]);
    });

    test('should show error "Unable to verify update"', async () => {
      advanceTo(new Date());
      const dateSync = new Date().toISOString();
      const directFirmwareUpdateStartTime: number = Math.floor(Date.now() / 1000) - 7 * 60; // 7 minutes in the past
      jest
        .spyOn(devicesSelectors, 'getDevicesInfoData')
        .mockReturnValue([{ ...yeti6G, directFirmwareUpdateStartTime }]);
      const dispatched: [] = [];

      await runSaga(
        { dispatch: (action) => dispatched.push(action), getState: () => initialState },
        checkCurrentState,
        mockApi,
        actions.checkYetiState(payload),
      ).toPromise();

      expect(dispatched).toEqual([
        actions.devicesAddUpdate.success({
          data: [
            {
              ...yeti6G,
              directFirmwareUpdateStartTime: 0,
              dateSync,
              isConnected: true,
              isLockAllBatteryItems: false,
              isLockAllNotifications: false,
              isLockAllPorts: false,
              isLockChangeAcsryMode: false,
              isLockChangeAcsryTankCapacity: false,
              isLockChangeChargingProfile: false,
            },
          ],
        }),
      ]);
    });

    test('should show info "Updated successfully"', async () => {
      advanceTo(new Date());
      const dateSync = new Date().toISOString();
      const directFirmwareUpdateStartTime: number = Math.floor(Date.now() / 1000) - 3 * 60; // 3 minutes in the past
      jest
        .spyOn(devicesSelectors, 'getDevicesInfoData')
        .mockReturnValue([{ ...yeti6G, dataTransferType: 'wifi', directFirmwareUpdateStartTime }]);
      const dispatched: [] = [];

      const _mockApi = {
        checkState: jest.fn(() => ({
          ok: true,
          data: {
            thingName: yeti6G.thingName,
            firmwareVersion: '1.3.8',
          },
        })),
      };

      await runSaga(
        { dispatch: (action) => dispatched.push(action), getState: () => initialState },
        checkCurrentState,
        _mockApi,
        actions.checkYetiState(payload),
      ).toPromise();

      expect(dispatched).toEqual([
        actions.devicesAddUpdate.success({
          data: [
            {
              ...yeti6G,
              dateSync,
              directFirmwareUpdateStartTime: 0,
              dataTransferType: 'wifi',
              firmwareVersion: '1.3.8',
              isConnected: true,
              isLockAllBatteryItems: false,
              isLockAllNotifications: false,
              isLockAllPorts: false,
              isLockChangeAcsryMode: false,
              isLockChangeAcsryTankCapacity: false,
              isLockChangeChargingProfile: false,
            },
          ],
        }),
      ]);
    });

    test('should handle state check with no devices', async () => {
      jest.spyOn(devicesSelectors, 'getDevicesInfoData').mockReturnValue([]);
      const dispatched: [] = [];

      await runSaga(
        { dispatch: (action) => dispatched.push(action), getState: () => initialState },
        checkCurrentState,
        mockApi,
        actions.checkYetiState(payload),
      ).toPromise();

      expect(dispatched).toContainEqual(actions.devicesFailure());
    });

    test('should handle failed state check', async () => {
      jest.spyOn(devicesSelectors, 'getDevicesInfoData').mockReturnValue([{ ...yeti6G, dataTransferType: 'wifi' }]);
      const dispatched: [] = [];

      await runSaga(
        { dispatch: (action) => dispatched.push(action), getState: () => initialState },
        checkCurrentState,
        mockApi,
        actions.checkYetiState({ ...payload, peripheralId: 'testPeripheralId' }),
      ).toPromise();

      expect(dispatched).toEqual([
        actions.devicesAddUpdate.success({ data: [{ ...yeti6G, dataTransferType: 'wifi' }] }),
      ]);
    });
  });

  describe('checkPairedThings ', () => {
    jest.spyOn(applicationSelectors, 'getIsDirectConnection').mockReturnValue(false);
    jest.spyOn(devicesSelectors, 'getDevicesInfoData').mockReturnValue([yetiLegacy]);

    test('should handle paired things with a successful response and non-direct connection', async () => {
      const mockApi = { getThings: jest.fn(() => ({ ok: true, data: [yetiLegacy] })) };
      const dispatched: [] = [];

      await runSaga(
        { dispatch: (action) => dispatched.push(action), getState: () => initialState },
        checkPairedThings,
        mockApi,
        actions.checkPairedThings.request(),
      ).toPromise();

      expect(dispatched).toContainEqual(actions.checkPairedThings.success());
    });

    test('should handle paired non-existing things', async () => {
      jest.spyOn(devicesSelectors, 'getDevicesInfoData').mockReturnValue([yetiLegacy]);
      const mockApi = { getThings: jest.fn(() => ({ ok: true, data: [yeti6G] })) };
      const dispatched: [] = [];

      await runSaga(
        { dispatch: (action) => dispatched.push(action), getState: () => initialState },
        checkPairedThings,
        mockApi,
        actions.checkPairedThings.request(),
      ).toPromise();

      expect(dispatched).toContainEqual(actions.checkPairedThings.success());
    });

    test('should handle paired things with an error response', async () => {
      const mockApi = { getThings: jest.fn(() => ({ ok: false })) };
      const dispatched: [] = [];

      await runSaga(
        { dispatch: (action) => dispatched.push(action), getState: () => initialState },
        checkPairedThings,
        mockApi,
      ).toPromise();

      expect(dispatched).toContainEqual(actions.checkPairedThings.failure());
    });
  });

  describe('', () => {
    jest.spyOn(devicesSelectors, 'getDevicesInfoData').mockReturnValue([yetiLegacy]);
    const state = true;

    test('should handle changeDeviceDataState non-existing things', async () => {
      const dispatched: [] = [];

      await runSaga(
        { dispatch: (action) => dispatched.push(action), getState: () => initialState },
        changeAllPortsState,
        actions.blockAllPorts({ thingName, state }),
      ).toPromise();

      expect(dispatched).toContainEqual(actions.devicesFailure());
    });

    test('should handle changeAllPortsState', async () => {
      const dispatched: [] = [];

      await runSaga(
        { dispatch: (action) => dispatched.push(action), getState: () => initialState },
        changeAllPortsState,
        actions.blockAllPorts({ thingName: yetiLegacy.thingName, state }),
      ).toPromise();

      expect(dispatched).toEqual([
        actions.devicesAddUpdate.success({ data: [{ ...yetiLegacy, isLockAllPorts: true }] }),
      ]);
    });

    test('should handle changeAllNotificationsState', async () => {
      const dispatched: [] = [];

      await runSaga(
        { dispatch: (action) => dispatched.push(action), getState: () => initialState },
        changeAllNotificationsState,
        actions.blockAllNotifications({ thingName: yetiLegacy.thingName, state }),
      ).toPromise();

      expect(dispatched).toEqual([
        actions.devicesAddUpdate.success({ data: [{ ...yetiLegacy, isLockAllNotifications: true }] }),
      ]);
    });

    test('should handle changeAllBatteryItemsState', async () => {
      const dispatched: [] = [];

      await runSaga(
        { dispatch: (action) => dispatched.push(action), getState: () => initialState },
        changeAllBatteryItemsState,
        actions.blockAllBatteryItems({ thingName: yetiLegacy.thingName, state }),
      ).toPromise();

      expect(dispatched).toEqual([
        actions.devicesAddUpdate.success({ data: [{ ...yetiLegacy, isLockAllBatteryItems: true }] }),
      ]);
    });

    test('should handle changeFirmwareUpdateNotificationState', async () => {
      const dispatched: [] = [];

      await runSaga(
        { dispatch: (action) => dispatched.push(action), getState: () => initialState },
        changeFirmwareUpdateNotificationState,
        actions.firmwareUpdateToggled({ thingName: yetiLegacy.thingName, state }),
      ).toPromise();

      expect(dispatched).toEqual([actions.devicesAddUpdate.success({ data: [{ ...yetiLegacy }] })]);
    });

    test('should handle changeAcsryTankCapacityState', async () => {
      const dispatched: [] = [];

      await runSaga(
        { dispatch: (action) => dispatched.push(action), getState: () => initialState },
        changeAcsryTankCapacityState,
        actions.lockAcsryCapacity({ thingName: yetiLegacy.thingName, state }),
      ).toPromise();

      expect(dispatched).toEqual([
        actions.devicesAddUpdate.success({ data: [{ ...yetiLegacy, isLockChangeAcsryTankCapacity: true }] }),
      ]);
    });

    test('should handle changeAcsryModeState', async () => {
      const dispatched: [] = [];

      await runSaga(
        { dispatch: (action) => dispatched.push(action), getState: () => initialState },
        changeAcsryModeState,
        actions.lockAcsryMode({ thingName: yetiLegacy.thingName, state }),
      ).toPromise();

      expect(dispatched).toEqual([
        actions.devicesAddUpdate.success({ data: [{ ...yetiLegacy, isLockChangeAcsryMode: true }] }),
        actions.devicesAddUpdate.success({ data: [{ ...yetiLegacy, isLockChangeAcsryTankCapacity: true }] }),
      ]);
    });

    test('should handle changeChargingProfileState', async () => {
      const dispatched: [] = [];

      await runSaga(
        { dispatch: (action) => dispatched.push(action), getState: () => initialState },
        changeChargingProfileState,
        actions.blockChargingProfile({ thingName: yetiLegacy.thingName, state }),
      ).toPromise();

      expect(dispatched).toEqual([
        actions.devicesAddUpdate.success({ data: [{ ...yetiLegacy, isLockChangeChargingProfile: true }] }),
      ]);
    });
  });

  describe('changeSettings Saga', () => {
    jest.spyOn(devicesSelectors, 'getDevicesInfoData').mockReturnValue([yetiLegacy]);
    const param = 'testParam';

    test('should update device settings', async () => {
      const dispatched: [] = [];

      await runSaga(
        { dispatch: (action) => dispatched.push(action), getState: () => initialState },
        changeSettings,
        actions.changeSettings({ thingName: yetiLegacy.thingName, param, state: true }),
      ).toPromise();

      expect(dispatched).toEqual([
        actions.devicesAddUpdate.success({
          data: [{ ...yetiLegacy, settings: { [param]: true, temperature: 'FAHRENHEIT', voltage: 'V120' } }],
        }),
      ]);
    });

    test('should handle a device not found and dispatch failure action', async () => {
      const dispatched: [] = [];

      await runSaga(
        { dispatch: (action) => dispatched.push(action), getState: () => initialState },
        changeSettings,
        actions.changeSettings({ thingName, param, state: true }),
      ).toPromise();

      expect(dispatched).toContainEqual(actions.devicesFailure());
    });
  });

  describe('unpairPhone', () => {
    const mockApi = { unpairPhoneFromThing: jest.fn(() => ({ ok: true })) };

    test('should unpair the phone from the device and dispatch success action', async () => {
      jest.spyOn(applicationSelectors, 'getIsDirectConnection').mockReturnValue(false);
      const dispatched: [] = [];

      await runSaga(
        { dispatch: (action) => dispatched.push(action), getState: () => initialState },
        unpairPhone,
        mockApi,
        actions.unpair.request({ thingName: yeti6G.thingName }),
      ).toPromise();

      expect(dispatched).toContainEqual(actions.unpair.success());
    });

    test('should handle direct connection mode and dispatch success action', async () => {
      jest.spyOn(applicationSelectors, 'getIsDirectConnection').mockReturnValue(true);
      const dispatched: [] = [];

      await runSaga(
        { dispatch: (action) => dispatched.push(action), getState: () => initialState },
        unpairPhone,
        mockApi,
        actions.unpair.request({ thingName }),
      ).toPromise();

      expect(dispatched).toContainEqual(actions.unpair.success());
    });
  });

  test('should unpair all devices and dispatch success action', async () => {
    const mockApi = { unpairPhoneFromThing: jest.fn(() => ({ ok: true })) };
    jest.spyOn(devicesSelectors, 'getDevicesInfoData').mockReturnValue([yetiLegacy]);
    const dispatched: [] = [];

    await runSaga(
      { dispatch: (action) => dispatched.push(action), getState: () => initialState },
      unpairAllDevices,
      mockApi,
    ).toPromise();

    expect(dispatched).toEqual([
      applicationActions.removeConnectedPeripheralId(yetiLegacy.peripheralId),
      notificationActions.notificationToggle.success({ isEnabled: false }),
      notificationActions.notificationRemoveAll({ things: [yetiLegacy.thingName], types: Object.values(SeverityType) }),
      applicationActions.changeDirectConnectionState(false),
      applicationActions.setLastDevice(''),
      actions.devicesEmpty(),
      actions.unpair.success(),
    ]);
  });
});
