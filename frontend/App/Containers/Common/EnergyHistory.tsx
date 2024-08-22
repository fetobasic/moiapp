import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { View, ScrollView, Text, StyleSheet } from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import SelectModal from 'App/Components/EnergyHistory/SelectModal';
import ModalRow from 'App/Components/EnergyHistory/ModalSelectRow';
import { HeaderSimple as Header, Button, Selector, InfoRow } from 'App/Components';
import { isEqual } from 'lodash';
import { ApplicationStyles, Colors, Fonts, Metrics } from 'App/Themes';
import { HomeStackParamList } from 'App/Types/NavigationStackParamList';
import { useAppDispatch, useAppSelector, useMount, usePrevious } from 'App/Hooks';
import ToggledRow from 'App/Components/EnergyHistory/ToggledRow';
import EnergyChart from 'App/Components/EnergyHistory/EnergyChart';
import { ERROR, getPrecisionByPeriod, getUsageReportChartData } from 'App/Services/UsageReport';
import { DateTypes, Toggle } from 'App/Types/HistoryType';
import { usageReportActions } from 'App/Store/UsageReport';
import { devicesSelectors } from 'App/Store/Devices';
import { isLatestVersion } from 'App/Services/FirmwareUpdates';
import { showWarning } from 'App/Services/Alert';
import callWithDelay from 'App/Services/CallWithDelay';
import { formatToKilo, getFormattedPeakDate } from 'App/Services/ChartHelpers';
import Spinner from 'react-native-loading-spinner-overlay';
import openBrowser from 'App/Services/Browser';
import Links from 'App/Config/Links';
import { getYetiThingName, isYeti6GThing } from 'App/Services/ThingHelper';
import renderElement from 'App/Services/RenderElement';
import InfoIcon from 'App/Images/Icons/information.svg';
import { YetiState } from 'App/Types/Yeti';
import { FirmwareVersion } from 'App/Types/FirmwareUpdate';

type Props = NativeStackScreenProps<HomeStackParamList, 'EnergyInfo'>;

export enum USAGE_TYPE {
  PAST_DAY = 'Past 24 Hours',
  PAST_TWO_WEEKS = 'Past 14 Days',
  PAST_MONTH = 'Past 30 Days',
  PAST_YEAR = 'Past Year',
  PAST_TWO_YEARS = 'Past 2 Years',
}

const dateTypesToUsage: { [key: string]: USAGE_TYPE } = {
  [DateTypes.PAST_DAY]: USAGE_TYPE.PAST_DAY,
  [DateTypes.PAST_TWO_WEEKS]: USAGE_TYPE.PAST_TWO_WEEKS,
  [DateTypes.PAST_MONTH]: USAGE_TYPE.PAST_MONTH,
  [DateTypes.PAST_YEAR]: USAGE_TYPE.PAST_YEAR,
  [DateTypes.PAST_TWO_YEARS]: USAGE_TYPE.PAST_TWO_YEARS,
};

const usageToUsageToDateTypes: { [key: string]: DateTypes } = {
  [USAGE_TYPE.PAST_DAY]: DateTypes.PAST_DAY,
  [USAGE_TYPE.PAST_TWO_WEEKS]: DateTypes.PAST_TWO_WEEKS,
  [USAGE_TYPE.PAST_MONTH]: DateTypes.PAST_MONTH,
  [USAGE_TYPE.PAST_YEAR]: DateTypes.PAST_YEAR,
  [USAGE_TYPE.PAST_TWO_YEARS]: DateTypes.PAST_TWO_YEARS,
};

type Row = {
  title: string;
  totalValue: string;
  trackColor: string;
  switchValue: boolean;
  onValueChange: (value: boolean) => void;
};

function EnergyHistory({ route, navigation }: Props) {
  const dispatch = useAppDispatch();
  const thingName = useMemo(() => getYetiThingName(route?.params?.device) || '', [route?.params?.device]);
  const device = useMemo(() => route?.params?.device, [route?.params?.device]);
  const isYeti6G = useMemo(
    () => isYeti6GThing(thingName) || device?.deviceType?.startsWith('Y6G'),
    [device?.deviceType, thingName],
  );
  const defaultChartType = isYeti6G ? DateTypes.PAST_MONTH : DateTypes.PAST_DAY;

  const {
    reportData,
    dataFetching,
    dataFetchingError,
    firmwareVersions,
    devicesInfo,
    showEnergyInChart,
    showEnergyOutChart,
    showBatteryChart,
    chartType,
  } = useAppSelector((state) => ({
    reportData: state.usageReport.reportData,
    dataFetching: state.usageReport.fetching,
    dataFetchingError: state.usageReport.error,
    firmwareVersions: state.firmwareUpdate.firmwareVersions,
    devicesInfo: state.devicesInfo,
    showEnergyInChart: state.usageReport.showEnergyInChart || Toggle.ON,
    showEnergyOutChart: state.usageReport.showEnergyOutChart || Toggle.ON,
    showBatteryChart: state.usageReport.showBatteryChart || Toggle.ON,
    chartType: state.usageReport.chartType || defaultChartType,
  }));

  const [showUsageModal, setShowUsageModal] = useState<boolean>(false);
  const [usage, setUsage] = useState<DateTypes>(chartType);
  const [tempUsage, setTempUsage] = useState<DateTypes>(usage);
  const [isChanged, setChanged] = useState<boolean>(false);

  const [isEnergyInToggle, setIsEnergyInToggle] = useState<boolean>(showEnergyInChart === Toggle.ON);
  const [isEnergyOutToggle, setIsEnergyOutToggle] = useState<boolean>(showEnergyOutChart === Toggle.ON);
  const [isBatteryToggle, setIsBatteryToggle] = useState<boolean>(showBatteryChart === Toggle.ON);

  const prevReportData = usePrevious(reportData);
  const prevDataFetching = usePrevious(dataFetching);

  const prevSelectedItem = usePrevious(usage);

  const titleInput = useMemo(
    () =>
      [DateTypes.PAST_YEAR, DateTypes.PAST_TWO_YEARS].includes(usage) ? 'Usage Kilowatt-Hours' : 'Usage Watt-Hours',
    [usage],
  );

  const modalTitle = useMemo(
    () =>
      [DateTypes.PAST_YEAR, DateTypes.PAST_TWO_YEARS].includes(tempUsage) ? 'Usage Kilowatt-Hours' : 'Usage Watt-Hours',
    [tempUsage],
  );

  const convertReportToChartData = useCallback(
    () =>
      getUsageReportChartData(
        reportData?.[thingName || '']?.[getPrecisionByPeriod(usage)]?.data || null,
        usage,
        !isYeti6G,
      ),
    [thingName, isYeti6G, reportData, usage],
  );

  const [usageReport, setUsageReport] = useState(convertReportToChartData());

  const isConnected = useMemo(
    () => devicesSelectors.getConnectedState(devicesInfo, thingName || ''),
    [thingName, devicesInfo],
  );

  const showDataFetchingError = useCallback(() => {
    let message = '';

    // if report data is cached then error cannot appear
    // because saga ends
    // so this code running means cache was invalid

    if (dataFetchingError === ERROR.CSV_PARSE) {
      const { firmwareVersion } = device as YetiState;
      const lastVersion: FirmwareVersion = firmwareVersions?.[device?.deviceType || '']?.[0] || {
        version: '0.0.0',
        date: '',
      };

      message = isLatestVersion(firmwareVersion || '0.0.0', lastVersion)
        ? 'Try again later.'
        : 'Upgrade Yeti’s firmware or try again later.';
    } else if (!isConnected) {
      message = 'Check your Internet connection or try again later.';
    } else {
      // there is a chance that we're connected, but error still occurs
      message = 'Try again later.';
    }
    // reset to initial state, so error doesn't persist
    dispatch(usageReportActions.usageReportClearError());

    callWithDelay(() => {
      showWarning(`Could not get history data.\n${message}`, () => {}, 'Info');
    });
  }, [dataFetchingError, device, dispatch, firmwareVersions, isConnected]);

  const loadData = useCallback(
    (period?: DateTypes) => {
      dispatch(
        usageReportActions.usageReportData.request({
          thingName: thingName || '',
          periodInPast: period || usage,
          isLegacy: !isYeti6G,
        }),
      );
    },
    [thingName, dispatch, isYeti6G, usage],
  );

  useMount(() => {
    loadData();
  });

  useEffect(() => {
    if (prevDataFetching && !dataFetching) {
      if (dataFetchingError) {
        showDataFetchingError();
        return;
      }

      if (!isEqual(prevReportData, reportData)) {
        setUsageReport(convertReportToChartData());
      }
    }
  }, [
    convertReportToChartData,
    dataFetching,
    dataFetchingError,
    prevDataFetching,
    prevReportData,
    reportData,
    showDataFetchingError,
  ]);

  useEffect(() => {
    if (!isEqual(prevSelectedItem, usage)) {
      setUsageReport(convertReportToChartData());
    }
  }, [convertReportToChartData, prevSelectedItem, usage]);

  const handleDropdownValueChange = useCallback(
    (item: DateTypes) => {
      setUsage(item);
      loadData(item);
      setChanged(true);
    },
    [loadData],
  );

  const bet: number[] = useMemo(() => [...(usageReport?.data?.soc || [])], [usageReport?.data?.soc]);
  const whIn: number[] = useMemo(() => [...(usageReport?.data?.whIn || [])], [usageReport?.data?.whIn]);
  const whOut: number[] = useMemo(() => [...(usageReport?.data?.whOut || [])], [usageReport?.data?.whOut]);
  const wPkIn: number[] = useMemo(() => [...(usageReport?.data?.wPkIn || [])], [usageReport?.data?.wPkIn]);
  const wPkOut: number[] = useMemo(() => [...(usageReport?.data?.wPkOut || [])], [usageReport?.data?.wPkOut]);
  const maxPkInDate: any[] = useMemo(
    () => [...(usageReport?.data?.wPkInMaxDate || [])],
    [usageReport?.data?.wPkInMaxDate],
  );
  const maxPkOutDate: any[] = useMemo(
    () => [...(usageReport?.data?.wPkOutMaxDate || [])],
    [usageReport?.data?.wPkOutMaxDate],
  );

  const pkInMax = useMemo(() => (wPkIn.length ? Math.max(...wPkIn) : 0), [wPkIn]);
  const pkOutMax = useMemo(() => (wPkOut.length ? Math.max(...wPkOut) : 0), [wPkOut]);

  const disconnectedStateData = useMemo(
    () => usageReport?.disconnectedStateData || [],
    [usageReport?.disconnectedStateData],
  );

  const xLabels = useMemo(() => [...(usageReport?.xLabels || [])], [usageReport?.xLabels]);
  const datePkInMax = useMemo(
    () => (wPkIn.length ? maxPkInDate[wPkIn.lastIndexOf(pkInMax)] : null),
    [maxPkInDate, pkInMax, wPkIn],
  );
  const datePkOutMax = useMemo(
    () => (wPkOut.length ? maxPkOutDate[wPkOut.lastIndexOf(pkOutMax)] : null),
    [maxPkOutDate, pkOutMax, wPkOut],
  );

  const whInTotal = useMemo(
    // @ts-ignore TODO: must be removed, when this field will be provided by UsageReport
    () => (usageReport?.data?.whInGrandTotal || 0).toFixed(0),
    // @ts-ignore TODO: must be removed, when this field will be provided by UsageReport
    [usageReport?.data?.whInGrandTotal],
  );
  const whOutTotal = useMemo(
    // @ts-ignore TODO: must be removed, when this field will be provided by UsageReport
    () => (usageReport?.data?.whOutGrandTotal || 0).toFixed(0),
    // @ts-ignore TODO: must be removed, when this field will be provided by UsageReport
    [usageReport?.data?.whOutGrandTotal],
  );

  const totalEnergyInRow: Row = useMemo(
    () => ({
      title: 'Total Energy In',
      totalValue: `${formatToKilo(whInTotal, 'k')}Wh`,
      trackColor: Colors.blue,
      switchValue: isEnergyInToggle,
      onValueChange: () => setIsEnergyInToggle(!isEnergyInToggle),
    }),
    [isEnergyInToggle, whInTotal],
  );

  const totalEnergyOutRow: Row = useMemo(
    () => ({
      title: 'Total Energy Out',
      totalValue: `${formatToKilo(whOutTotal, 'k')}Wh`,
      trackColor: Colors.lightGreen,
      switchValue: isEnergyOutToggle,
      onValueChange: () => setIsEnergyOutToggle(!isEnergyOutToggle),
    }),
    [isEnergyOutToggle, whOutTotal],
  );

  const batteryRow: Row = useMemo(
    () => ({
      title: 'Battery',
      totalValue: '',
      trackColor: Colors.green,
      switchValue: isBatteryToggle,
      onValueChange: () => setIsBatteryToggle(!isBatteryToggle),
    }),
    [isBatteryToggle],
  );

  const toggleData: Row[] = useMemo(
    () => (isYeti6G ? [totalEnergyInRow, totalEnergyOutRow, batteryRow] : [totalEnergyInRow, totalEnergyOutRow]),
    [batteryRow, isYeti6G, totalEnergyInRow, totalEnergyOutRow],
  );

  const transformData = useMemo(() => {
    const updatedWhOut = whOut.length === 0 ? Array(xLabels.length).fill(0) : whOut;
    const updatedWhIn = whIn.length === 0 ? Array(xLabels.length).fill(0) : whIn;
    const updatedBet = bet.length === 0 ? Array(xLabels.length).fill(0) : bet;

    const disconnectedStateXLabels: string[] = disconnectedStateData.map((item) => {
      const intersectionIndex = xLabels.findIndex((xLabel) => xLabel === item.date);

      if (intersectionIndex !== -1) {
        updatedWhOut[intersectionIndex] = item.whOut;
        updatedWhIn[intersectionIndex] = item.whIn;
        updatedBet[intersectionIndex] = item.soc;
      }

      return item.date as string;
    });

    const whOutData = updatedWhOut
      .map((value: number, index: number) => ({
        x: xLabels?.[index],
        y: value,
      }))
      .filter(({ x }) => x);

    const whInData = updatedWhIn
      .map((value: number, index: number) => ({
        x: xLabels?.[index],
        y: value,
      }))
      .filter(({ x }) => x);

    const betData = updatedBet
      .map((value: number, index: number) => ({
        x: xLabels?.[index],
        y: value,
      }))
      .filter(({ x }) => x);

    return {
      whOutData,
      whInData,
      betData,
      disconnectedStateXLabels,
    };
  }, [whOut, xLabels, whIn, bet, disconnectedStateData]);

  const selectModalItem = useCallback((title: string) => {
    const date = usageToUsageToDateTypes[title];
    setTempUsage(date);
  }, []);

  const saveEnergyHistory = useCallback(() => {
    dispatch(
      usageReportActions.setEnergyHistory({
        showEnergyInChart: isEnergyInToggle ? Toggle.ON : Toggle.OFF,
        showEnergyOutChart: isEnergyOutToggle ? Toggle.ON : Toggle.OFF,
        showBatteryChart: isBatteryToggle ? Toggle.ON : Toggle.OFF,
        chartType: usage,
      }),
    );
    navigation.goBack();
  }, [dispatch, isBatteryToggle, isEnergyInToggle, isEnergyOutToggle, navigation, usage]);

  const goToReadMore = () => {
    openBrowser(Links.historyScreenMoreInfoPage);
  };

  return (
    <View style={ApplicationStyles.mainContainer}>
      <Header title="Energy History" isChangeSaved={isChanged} cbSave={saveEnergyHistory} />
      <ScrollView style={styles.mainSection}>
        <Selector
          containerStyle={styles.inputUsage}
          sectionStyle={styles.inputBorderSection}
          placeholder={titleInput}
          value={dateTypesToUsage[usage]}
          onPress={() => setShowUsageModal(true)}
        />
        <EnergyChart
          showEnergyIn={isEnergyInToggle}
          showEnergyOut={isEnergyOutToggle}
          showBattery={Boolean(isBatteryToggle && isYeti6G)}
          showPercentageLine={Boolean(isYeti6G)}
          whIn={transformData.whInData}
          whOut={transformData.whOutData}
          chartType={usage}
          batterySoc={transformData.betData}
          disconnectedStateXLabels={transformData.disconnectedStateXLabels}
        />
        <View style={styles.mainContainer}>
          <InfoRow
            containerWBStyle={styles.infoRow}
            withBorder={false}
            body={renderElement(
              <View>
                <Text style={styles.textBody}>
                  Gaps indicate device was turned off. Hollow bars indicate your app was disconnected.
                </Text>
                <Text style={styles.textBody}>
                  <Text style={{ color: Colors.portWarning }}>Note:</Text> To get the latest data, make sure your device
                  is connected to the cloud.
                </Text>
              </View>,
            )}
            icon={renderElement(<InfoIcon />)}
          />
          <View style={[styles.row, styles.topBorder, styles.rowIndent]}>
            <View>
              <Text style={styles.textTitle}>Total</Text>
            </View>
            <View>
              <Text style={styles.textTitle}>{formatToKilo(Number(whInTotal) + Number(whOutTotal), 'k')}Wh</Text>
            </View>
          </View>
          {toggleData.map(({ title, totalValue, trackColor, switchValue, onValueChange }) => (
            <ToggledRow
              key={title}
              title={title}
              totalValue={totalValue}
              trackColor={trackColor}
              switchValue={switchValue}
              onPress={(value: boolean) => {
                onValueChange(value);
                setChanged(true);
              }}
            />
          ))}
          {isYeti6G && (
            <>
              <View style={[styles.row, styles.rowIndent]}>
                <View>
                  <Text style={styles.textTitle}>Peak Power In</Text>
                  {datePkInMax && <Text style={styles.dateTitle}>{getFormattedPeakDate(usage, datePkInMax)}</Text>}
                </View>
                <View>
                  <Text style={styles.textTitle}>{`${formatToKilo(pkInMax, 'k')}W`}</Text>
                </View>
              </View>
              <View style={[styles.row, styles.topBorder, styles.rowIndent]}>
                <View>
                  <Text style={styles.textTitle}>Peak Power Out</Text>
                  {datePkOutMax && <Text style={styles.dateTitle}>{getFormattedPeakDate(usage, datePkOutMax)}</Text>}
                </View>
                <View>
                  <Text style={styles.textTitle}>{`${formatToKilo(pkOutMax, 'k')}W`}</Text>
                </View>
              </View>
            </>
          )}
          <View style={styles.row}>
            <Button inverse title="read more about energy history" onPress={goToReadMore} style={styles.readMoreBtn} />
          </View>
        </View>
        <View style={ApplicationStyles.row}>
          <SelectModal
            isVisible={showUsageModal}
            title={modalTitle}
            onDone={() => {
              handleDropdownValueChange(tempUsage);
            }}
            onClose={() => setShowUsageModal(false)}>
            {[
              USAGE_TYPE.PAST_DAY,
              USAGE_TYPE.PAST_TWO_WEEKS,
              USAGE_TYPE.PAST_MONTH,
              USAGE_TYPE.PAST_YEAR,
              USAGE_TYPE.PAST_TWO_YEARS,
            ].map((usageTypeItem) => (
              <ModalRow
                key={usageTypeItem}
                title={usageTypeItem}
                selectedValue={dateTypesToUsage[tempUsage]}
                onPress={selectModalItem}
              />
            ))}
          </SelectModal>
        </View>
      </ScrollView>
      <Button
        style={styles.button}
        title="Save Settings"
        onPress={saveEnergyHistory}
        disabled={!isChanged}
        inverse={!isChanged}
      />
      <Spinner visible={dataFetching} textContent="" cancelable={false} color={Colors.green} />
    </View>
  );
}

const styles = StyleSheet.create({
  mainContainer: {
    paddingVertical: Metrics.marginSection,
  },
  textBody: {
    ...Fonts.font.base.caption,
    color: Colors.transparentWhite('0.87'),
  },
  infoRow: {
    paddingHorizontal: 0,
    paddingVertical: 0,
    paddingBottom: Metrics.smallMargin,
  },
  row: {
    flex: 1,
    justifyContent: 'space-between',
    flexDirection: 'row',
  },
  rowIndent: {
    paddingVertical: 14,
    paddingHorizontal: Metrics.halfMargin,
  },
  textTitle: {
    ...Fonts.font.base.bodyTwo,
    color: Colors.white,
  },
  dateTitle: {
    ...Fonts.font.base.bodyOne,
    color: Colors.white,
  },
  topBorder: {
    borderTopWidth: 1,
    borderColor: Colors.border,
  },
  switchContainer: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    alignItems: 'flex-end',
  },
  switchIndent: {
    marginRight: 12,
  },
  inputUsage: {
    marginTop: Metrics.marginSection,
  },
  inputBorderSection: {
    borderColor: Colors.border,
  },
  mainSection: {
    paddingHorizontal: Metrics.baseMargin,
    paddingVertical: Metrics.marginSection,
  },
  switchSection: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  center: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  button: {
    marginHorizontal: Metrics.baseMargin,
    marginBottom: Metrics.baseMargin,
    marginTop: Metrics.halfMargin,
  },
  readMoreBtn: {
    width: '100%',
    marginBottom: Metrics.baseMargin,
    marginTop: Metrics.smallMargin,
  },
});

export default EnergyHistory;
