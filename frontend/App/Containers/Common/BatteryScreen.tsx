import React, { useCallback, useMemo, useState } from 'react';
import { View, ScrollView, StyleSheet, Text, ViewStyle } from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { Button, HeaderSimple as Header, Pressable } from 'App/Components';
import { ApplicationStyles, Colors, Fonts, Metrics } from 'App/Themes';
import { HomeStackParamList } from 'App/Types/NavigationStackParamList';
import { Yeti6GState, Yeti6GStatus, YetiState } from 'App/Types/Yeti';
import { convertTemperature } from 'App/Services/ConvertTemperature';
import { useAppDispatch, useAppSelector } from 'App/Hooks';
import { TemperatureUnits } from 'App/Types/Units';
import { modalInfo } from 'App/Services/Alert';
import { update } from 'App/Services/ConnectionControler';
import { getYetiThingName, isYeti6GThing, isYeti300500700 } from 'App/Services/ThingHelper';
import { devicesActions, devicesSelectors } from 'App/Store/Devices';
import { setToClipboard } from 'App/Services/Clipboard';

enum YetiType {
  YETI_6G = 'YETI_6G',
  YETI_LEGACY = 'YETI_LEGACY',
}

type Props = NativeStackScreenProps<HomeStackParamList, 'BatteryScreen'>;

type BatteryInfoRow = {
  title: string;
  subTitle: string | null;
  info: string;
  infoStyle: any;
  allowedRow: YetiType[];
  infoWrapperStyle?: ViewStyle;
  numberOfLines?: number;
  useClipboard?: boolean;
};

type BatteryInfo = {
  allowedSection: YetiType[];
  rows: BatteryInfoRow[];
  content: JSX.Element | null;
}[];

function BatteryScreen({ route }: Props) {
  const dispatch = useAppDispatch();
  const [disabled, setDisabled] = useState<boolean>(false);

  const { temperatureUnits, isDirectConnection } = useAppSelector((state) => ({
    temperatureUnits: state.application.units?.temperature || TemperatureUnits.fahrenheit,
    isDirectConnection: state.application.isDirectConnection,
  }));
  const yetiThingName = useMemo(() => getYetiThingName(route?.params?.device), [route?.params?.device]);
  const device = useAppSelector(devicesSelectors.getCurrentDevice(yetiThingName));
  const isYeti6G = useMemo(
    () => isYeti6GThing(yetiThingName) || device?.deviceType?.startsWith('Y6G'),
    [device?.deviceType, yetiThingName],
  );
  const yetiType = useMemo(() => (isYeti6G ? YetiType.YETI_6G : YetiType.YETI_LEGACY), [isYeti6G]);
  const isYeti357 = useMemo(
    () =>
      isYeti300500700(device) ||
      device?.deviceType?.startsWith('Y6G_3') ||
      device?.deviceType?.startsWith('Y6G_5') ||
      device?.deviceType?.startsWith('Y6G_7'),
    [device],
  );

  const device6G = device as Yeti6GState;
  const deviceLegacy = device as YetiState;
  const serialNumber = device6G?.device?.batt?.sn || '--';
  const temperatureData = device6G?.status?.batt?.cHtsTmp || deviceLegacy?.temperature;
  const temperature = temperatureData ? convertTemperature(temperatureUnits, temperatureData) : '--';

  const inverterTemperature = device6G?.status?.inv?.cTmp
    ? convertTemperature(temperatureUnits, device6G?.status?.inv?.cTmp)
    : '--';
  const bmsTemperature = device6G?.status?.batt?.cTmp
    ? convertTemperature(temperatureUnits, device6G?.status?.batt?.cTmp)
    : '--';
  const relativeHumidity = parseInt(`${device6G?.status?.batt?.pctHtsRh}`, 10) || '--';
  let stateOfCharge: string | number | undefined = 0;
  if (isYeti6G) {
    if (typeof device6G?.status?.batt?.soc === 'number') {
      stateOfCharge = device6G?.status?.batt?.soc;
    }
  } else {
    if (typeof deviceLegacy?.socPercent === 'number') {
      stateOfCharge = deviceLegacy?.socPercent;
    }
  }
  if (typeof stateOfCharge !== 'number') {
    stateOfCharge = '--';
  }
  const stateOfHealth = device6G?.lifetime?.batt?.soh || '--';
  const batteryVoltage = device6G?.status?.batt?.v || deviceLegacy?.volts || '--';
  const wNetAvg = device6G?.status?.batt?.WNetAvg || device6G?.status?.batt?.wNetAvg;
  const powerInOut = wNetAvg || '--';
  const storedEnergy = device6G?.status?.batt?.whRem || deviceLegacy?.whStored || '--';
  const cRating =
    wNetAvg && device6G?.device?.batt?.whCap
      ? Number((wNetAvg / device6G?.device?.batt?.whCap).toFixed(2).replace('.00', ''))
      : '--';
  const currentInOut =
    wNetAvg && device6G?.status?.batt?.v ? Number((wNetAvg / device6G?.status?.batt?.v).toFixed(2)) : '--';

  const lifetimeBatteryCycles = device6G?.lifetime?.batt?.cyc || '--';
  const [userBatteryCycles, setUserBatteryCycles] = useState<number | string>(device6G?.status?.batt?.cyc || '--');

  const lifetimeEnergyIn = device6G?.lifetime?.batt?.whIn || '--';
  const [userEnergyIn, setUserEnergyIn] = useState<number | string>(device6G?.status?.batt?.whIn || '--');

  const lifetimeEnergyOut = device6G?.lifetime?.batt?.whOut || '--';
  const [userEnergyOut, setUserEnergyOut] = useState<number | string>(device6G?.status?.batt?.whOut || '--');

  const totalUserWhOut = deviceLegacy?.whOut || '--';

  const changeState = useCallback(
    async (desired: Partial<Yeti6GStatus>) => {
      setDisabled(true);

      await update({
        thingName: yetiThingName,
        stateObject: {
          state: {
            desired: desired as Yeti6GState,
          },
        },
        isDirectConnection,
        updateDeviceState: (_thingName, data) =>
          dispatch(devicesActions.devicesAddUpdate.request({ thingName: _thingName, data })),
        changeSwitchState: (_thingName, state) =>
          dispatch(devicesActions.blockAllBatteryItems({ thingName: _thingName, state })),
        method: 'status',
      });

      setDisabled(false);
    },
    [yetiThingName, dispatch, isDirectConnection],
  );

  const resetUserSettings = useCallback(
    async (desired: Partial<Yeti6GStatus>, title: string) => {
      return new Promise<boolean>((resolve) => {
        modalInfo({
          hideIcon: true,
          title: 'Reset',
          body: `Are you sure you want to reset ${title}?`,
          type: 'INFO',
          buttons: [
            {
              title: 'Cancel',
              inverse: true,
              action: () => resolve(false),
            },
            {
              title: 'Reset',
              action: async () => {
                await changeState(desired);
                resolve(true);
              },
            },
          ],
        });
      });
    },
    [changeState],
  );

  const resetUserCycles = useCallback(async () => {
    const state = { batt: { cyc: 0 } as any };
    if (await resetUserSettings(state, 'User Battery Cycles')) {
      setUserBatteryCycles(0);
    }
  }, [resetUserSettings]);

  const resetUserEnergyIn = useCallback(async () => {
    const state = { batt: { whIn: 0 } as any };
    if (await resetUserSettings(state, 'User Energy In')) {
      setUserEnergyIn(0);
    }
  }, [resetUserSettings]);

  const resetUserEnergyOut = useCallback(async () => {
    const state = { batt: { whOut: 0 } as any };
    if (await resetUserSettings(state, 'User Energy Out')) {
      setUserEnergyOut(0);
    }
  }, [resetUserSettings]);

  const batteryInfoRows = useMemo(
    () =>
      [
        {
          allowedSection: [YetiType.YETI_6G],
          rows: [
            {
              title: 'Serial Number',
              subTitle: null,
              info: serialNumber,
              infoStyle: { fontSize: 12, textAlign: 'left' },
              infoWrapperStyle: {
                flex: 1,
                flexDirection: 'row',
                justifyContent: 'flex-end',
              },
              numberOfLines: 2,
              allowedRow: [YetiType.YETI_6G],
              useClipboard: true,
            },
          ],
          content: null,
        },
        {
          allowedSection: [YetiType.YETI_6G, YetiType.YETI_LEGACY],
          rows: [
            {
              title: 'Temperature',
              subTitle: 'The ambient battery pack/cell temperature.',
              info: temperature,
              allowedRow: [YetiType.YETI_6G],
            },
            {
              title: 'Temperature',
              subTitle: 'The battery pack temperature.',
              info: temperature,
              allowedRow: [YetiType.YETI_LEGACY],
            },
            {
              title: 'Inverter Temperature',
              subTitle: 'The power electronics temperature.',
              info: inverterTemperature,
              allowedRow: isYeti357 ? [] : [YetiType.YETI_6G],
            },
            {
              title: 'BMS Temperature',
              subTitle: 'The battery protection circuit temperature.',
              info: bmsTemperature,
              allowedRow: [YetiType.YETI_6G],
            },
            {
              title: 'Relative Humidity',
              subTitle: 'The ambient humidity percent.',
              info: `${relativeHumidity} %`,
              allowedRow: isYeti357 ? [] : [YetiType.YETI_6G],
            },
          ],
          content: null,
        },
        {
          allowedSection: [YetiType.YETI_6G, YetiType.YETI_LEGACY],
          rows: [
            {
              title: 'State of Charge',
              subTitle: 'Remaining battery charge.',
              info: `${stateOfCharge} %`,
              allowedRow: [YetiType.YETI_6G, YetiType.YETI_LEGACY],
            },
            {
              title: 'State of Health',
              subTitle: 'Remaining battery capacity.',
              info: `${stateOfHealth} %`,
              allowedRow: [YetiType.YETI_6G],
            },
            {
              title: 'Battery Voltage',
              subTitle: 'The amount of electrical potential the battery holds.',
              info: `${batteryVoltage} V`,
              allowedRow: [YetiType.YETI_6G, YetiType.YETI_LEGACY],
            },
          ],
          content: null,
        },
        {
          allowedSection: [YetiType.YETI_6G, YetiType.YETI_LEGACY],
          rows: [
            {
              title: 'Net Power',
              subTitle: null,
              info: `${powerInOut} W`,
              allowedRow: [YetiType.YETI_6G],
            },
            {
              title: 'Net Current',
              subTitle: null,
              info: `${currentInOut} A`,
              allowedRow: [YetiType.YETI_6G],
            },
            {
              title: 'Stored Energy',
              subTitle: 'Energy from 0% to current charge.',
              info: `${storedEnergy} Wh`,
              allowedRow: [YetiType.YETI_6G, YetiType.YETI_LEGACY],
            },
            {
              title: 'C Rating',
              subTitle: 'C-rating measures the speed at which a battery is fully charged or discharged.',
              info: `${cRating} C`,
              allowedRow: [YetiType.YETI_6G],
            },
          ],
          content: null,
        },
        {
          allowedSection: [YetiType.YETI_6G],
          rows: [
            {
              title: 'Lifetime Battery Cycles',
              subTitle: null,
              info: `${lifetimeBatteryCycles}`,
              allowedRow: [YetiType.YETI_6G],
            },
            {
              title: 'User Battery Cycles',
              subTitle: null,
              info: `${userBatteryCycles}`,
              allowedRow: [YetiType.YETI_6G],
            },
          ],
          content: <Button disabled={disabled} inverse onPress={resetUserCycles} title="RESET USER CYCLES" />,
        },
        {
          allowedSection: [YetiType.YETI_6G],
          rows: [
            {
              title: 'Lifetime Energy In',
              subTitle: null,
              info: `${lifetimeEnergyIn} Wh`,
              allowedRow: [YetiType.YETI_6G],
            },
            {
              title: 'User Energy In',
              subTitle: null,
              info: `${userEnergyIn} Wh`,
              allowedRow: [YetiType.YETI_6G],
            },
          ],
          content: <Button disabled={disabled} inverse onPress={resetUserEnergyIn} title="RESET USER ENERGY IN" />,
        },
        {
          allowedSection: [YetiType.YETI_6G],
          rows: [
            {
              title: 'Lifetime Energy Out',
              subTitle: null,
              info: `${lifetimeEnergyOut} Wh`,
              allowedRow: [YetiType.YETI_6G],
            },
            {
              title: 'User Energy Out',
              subTitle: null,
              info: `${userEnergyOut} Wh`,
              allowedRow: [YetiType.YETI_6G],
            },
          ],
          content: <Button disabled={disabled} inverse onPress={resetUserEnergyOut} title="RESET USER ENERGY OUT" />,
        },
        {
          allowedSection: [YetiType.YETI_LEGACY],
          rows: [
            {
              title: 'Total User Wh Out',
              subTitle: null,
              info: `${totalUserWhOut} Wh`,
              allowedRow: [YetiType.YETI_LEGACY],
            },
          ],
          content: null,
        },
      ] as BatteryInfo,
    [
      batteryVoltage,
      bmsTemperature,
      cRating,
      currentInOut,
      disabled,
      inverterTemperature,
      lifetimeBatteryCycles,
      lifetimeEnergyIn,
      lifetimeEnergyOut,
      powerInOut,
      relativeHumidity,
      resetUserCycles,
      resetUserEnergyIn,
      resetUserEnergyOut,
      serialNumber,
      stateOfCharge,
      stateOfHealth,
      storedEnergy,
      temperature,
      totalUserWhOut,
      userBatteryCycles,
      userEnergyIn,
      userEnergyOut,
      isYeti357,
    ],
  );

  return (
    <View style={ApplicationStyles.mainContainer}>
      <Header title="Yeti Battery" />
      <ScrollView>
        <View style={styles.mainContainer}>
          {batteryInfoRows
            .filter((sectionItem) => sectionItem.allowedSection.some((modelName) => modelName === yetiType))
            .map((sectionItem, ind) => (
              <View style={styles.container} key={ind}>
                {sectionItem.rows
                  .filter((rowItem) => rowItem.allowedRow.some((modelName) => modelName === yetiType))
                  .map((rowItem, index) => (
                    <Pressable
                      disabled={!rowItem.useClipboard}
                      key={rowItem.title}
                      onPress={() => setToClipboard(rowItem.info)}>
                      <View style={styles.sectionInfo}>
                        <View style={styles.row}>
                          {rowItem.title && (
                            <View style={styles.textTitleWrapper}>
                              <Text style={styles.textTitle}>{rowItem.title}</Text>
                            </View>
                          )}
                          {rowItem.info && (
                            <View style={rowItem.infoWrapperStyle}>
                              <Text
                                numberOfLines={rowItem.numberOfLines || 1}
                                ellipsizeMode="tail"
                                style={[styles.textTitle, rowItem.infoStyle]}>
                                {rowItem.info}
                              </Text>
                            </View>
                          )}
                        </View>
                        {rowItem.subTitle && (
                          <View>
                            <Text style={styles.textSubTitle}>{rowItem.subTitle}</Text>
                          </View>
                        )}
                      </View>
                      {Boolean(index !== sectionItem.rows.length - 1 || sectionItem.content) && (
                        <View style={styles.lineWrapper}>
                          <View style={styles.line} />
                        </View>
                      )}
                    </Pressable>
                  ))}
                {sectionItem.content && <View style={styles.contentWrapper}>{sectionItem.content}</View>}
              </View>
            ))}
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  mainContainer: { padding: Metrics.marginSection },
  container: {
    borderColor: Colors.border,
    borderWidth: 1,
    borderRadius: 8,
    marginBottom: Metrics.marginSection,
  },
  sectionInfo: {
    paddingVertical: 14,
    paddingHorizontal: Metrics.baseMargin,
  },
  row: { flex: 1, justifyContent: 'space-between', flexDirection: 'row' },
  textTitleWrapper: {
    paddingRight: 20,
  },
  textTitle: { ...Fonts.font.base.bodyTwo, color: Colors.transparentWhite('0.87'), maxWidth: 200, textAlign: 'right' },
  textSubTitle: { ...Fonts.font.base.bodyOne, color: Colors.gray },
  lineWrapper: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  line: {
    height: 1,
    width: '95%',
    backgroundColor: Colors.border,
  },
  contentWrapper: { padding: 8 },
});

export default BatteryScreen;
