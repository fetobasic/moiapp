import React, { useEffect, useMemo, useRef, useState } from 'react';
import { View, ScrollView, StyleSheet, Text } from 'react-native';
import { ApplicationStyles, Colors, Fonts, Metrics } from 'App/Themes';
import { Button, HeaderSimple as Header, Pressable, SectionWithTitle, StyledRangeSlider } from 'App/Components';
import renderElement from 'App/Services/RenderElement';
import HelpIcon from 'App/Images/Icons/help.svg';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { SettingsStackParamList } from 'App/Types/NavigationStackParamList';
import { navigationGoBack } from 'App/Navigation/AppNavigation';
import { useDispatch, useSelector } from 'react-redux';
import { devicesActions } from 'App/Store/Devices';
import InformationIcon from 'App/Images/Icons/information.svg';
import { getCurrentDevice } from 'App/Store/Devices/selectors';
import { update } from 'App/Services/ConnectionControler';
import AppConfig from 'App/Config/AppConfig';
import { useAppSelector } from 'App/Hooks';
import { Yeti6GState } from 'App/Types/Yeti';
import { getPowerPortsLimits } from 'App/Services/ACInverter';

type Props = NativeStackScreenProps<SettingsStackParamList, 'PowerInputLimit'>;

const PowerInputLimit = ({ navigation, route }: Props) => {
  const { isConnected } = useAppSelector((state) => ({ isConnected: state.network.isConnected }));
  const device = useSelector(getCurrentDevice(route.params.device?.thingName || '')) as Yeti6GState;

  const aLmt = useMemo(() => device?.config?.ports?.acIn?.wall?.aLmt, [device?.config?.ports?.acIn?.wall?.aLmt]);
  const aChgLmt = useMemo(
    () => device?.config?.ports?.acIn?.wall?.aChgLmt ?? 3.3,
    [device?.config?.ports?.acIn?.wall?.aChgLmt],
  );
  const { minLimitA, maxLimitA, maxChgLimitA, maxLimitW } = getPowerPortsLimits(device);
  const wattsRate = useMemo(
    () => device?.config?.inv?.v ?? maxLimitW / maxLimitA,
    [device?.config?.inv?.v, maxLimitA, maxLimitW],
  );

  const [customLimit, setCustomLimit] = useState(aLmt);
  const [chgCustomLimit, setChgCustomLimit] = useState(aChgLmt);
  const [isChanged, setChanged] = useState<boolean>(false);
  const [isLoading, setLoading] = useState<boolean>(false);
  const dispatch = useDispatch();
  let timeOutId = useRef<NodeJS.Timeout>();

  const onLimitChangeHandler = (backup: number, _: any, fromUser: boolean) => {
    if (!fromUser) {
      return;
    }
    let value = backup;

    if (value <= minLimitA) {
      value = minLimitA;
    } else if (value >= maxLimitA) {
      value = maxLimitA;
    }

    if (value < chgCustomLimit) {
      setChgCustomLimit(value);
    }

    setCustomLimit(value);
    setChanged(true);
  };

  const onChgLimitChangeHandler = (backup: number, _: any, fromUser: boolean) => {
    if (!fromUser) {
      return;
    }
    let value = backup;

    if (value >= customLimit) {
      value = customLimit;
    }
    if (value >= maxChgLimitA) {
      value = maxChgLimitA;
    }

    setChgCustomLimit(value);
    setChanged(true);
  };

  useEffect(() => {
    if (isLoading && isConnected) {
      setChanged(false);
      setLoading(false);
      clearTimeout(timeOutId.current);
      navigationGoBack();
    }
  }, [aLmt, isConnected, isLoading]);

  const onSaveHandler = () => {
    setLoading(true);
    timeOutId.current = setTimeout(() => setLoading(false), AppConfig.loaderHideTime);
    update({
      thingName: device?.thingName || '',
      stateObject: {
        state: {
          desired: {
            // @ts-ignore TODO: we need to use complex and recursive Partial generic of Yeti6GState type
            ports: {
              acIn: { ...(device?.config?.ports?.acIn || {}), wall: { aLmt: customLimit, aChgLmt: chgCustomLimit } },
            },
          },
        },
      },
      isDirectConnection: Boolean(device?.isDirectConnection),
      updateDeviceState: (thingName, data) => {
        dispatch(devicesActions.devicesAddUpdate.request({ thingName, data }));
      },
      method: 'config',
    });
  };

  return (
    <View style={ApplicationStyles.mainContainer}>
      <Header
        title="Power+ Port Limits"
        isChangeSaved={isChanged}
        cbSave={onSaveHandler}
        rightSection={renderElement(
          <Pressable onPress={() => navigation.navigate('InputLimitsHelp')}>
            <HelpIcon />
          </Pressable>,
        )}
      />
      <ScrollView style={styles.container} contentContainerStyle={styles.scrollContainer}>
        <Text style={styles.description}>
          <Text style={ApplicationStyles.textNote}>Note:</Text> If the power used by the AC output ports exceeds the set
          If the power used by the AC output ports exceeds the set Input Limit, AC power pass-through stops and the
          battery is used as the power source.
        </Text>
        <SectionWithTitle containerStyle={styles.currentLimit}>
          <View style={styles.minMaxValue}>
            <Text style={Fonts.font.base.bodyOne} numberOfLines={1}>
              Input Limit -{' '}
              <Text style={ApplicationStyles.textGreen}>
                {Number(customLimit?.toFixed(1))} Amps ({(wattsRate * customLimit).toFixed(0)} W)
              </Text>
            </Text>
            <Text style={Fonts.font.base.caption}>
              Max: <Text style={ApplicationStyles.textRed}>{maxLimitW} W</Text>
            </Text>
          </View>
          <StyledRangeSlider
            showMarks
            showButtons
            useFloat
            disableRange
            min={0}
            max={maxLimitA}
            low={customLimit}
            onValueChanged={onLimitChangeHandler}
            handleButtonPress={setCustomLimit}
            // @ts-ignore
            markStep={(maxLimitA / 6).toFixed(1)}
            minLimit={chgCustomLimit}
            maxLimit={maxLimitA}
            markValue="A"
          />

          <View style={[styles.minMaxValue, styles.sectionCharge]}>
            <Text style={Fonts.font.base.bodyOne} numberOfLines={1}>
              Charge Limit -{' '}
              <Text style={ApplicationStyles.textBlue}>
                {Number(chgCustomLimit.toFixed(1))} Amps ({(wattsRate * chgCustomLimit).toFixed(0)} W)
              </Text>
            </Text>
            <Text style={Fonts.font.base.caption}>
              Max: <Text style={ApplicationStyles.textRed}>{maxLimitW} W</Text>
            </Text>
          </View>
          <StyledRangeSlider
            showMarks
            showButtons
            useFloat
            disableRange
            twoMaxLimit
            mainColor={Colors.blue}
            minLimitColor={Colors.green}
            min={0}
            max={maxLimitA}
            low={chgCustomLimit}
            onValueChanged={onChgLimitChangeHandler}
            handleButtonPress={setChgCustomLimit}
            // @ts-ignore
            markStep={(maxLimitA / 6).toFixed(1)}
            minLimit={customLimit}
            maxLimit={maxChgLimitA}
            markValue="A"
          />
        </SectionWithTitle>
        <View style={styles.sectionInfo}>
          <InformationIcon width={22} height={22} />
          <View style={styles.sectionInfoDescription}>
            <View style={ApplicationStyles.row}>
              <Text style={styles.textDot}>·</Text>
              <Text style={styles.textDescription}>
                Ensure the input limit does not exceed the capability of the power source connected to the Yeti.
              </Text>
            </View>
            <View style={styles.sectionInfoText}>
              <Text style={styles.textDot}>·</Text>
              <Text style={styles.textDescription}>
                Charging with more power generates more heat, so the fan has to work harder, resulting in more fan
                noise.
              </Text>
            </View>
            <View style={styles.sectionInfoText}>
              <Text style={styles.textDot}>·</Text>
              <Text style={styles.textDescription}>
                Charging with more power stresses the battery more and can reduce its lifespan.
              </Text>
            </View>
            <View style={styles.sectionInfoText}>
              <Text style={styles.textDot}>·</Text>
              <Text style={styles.textDescription}>
                Charging with less power means it takes more time to charge to full.
              </Text>
            </View>
          </View>
        </View>
      </ScrollView>
      <Button
        testID="powerInputLimitSaveBtn"
        inverse={!isChanged}
        disabled={!isChanged}
        showLoading={isLoading}
        style={styles.saveBtn}
        title="SAVE"
        onPress={onSaveHandler}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: Metrics.baseMargin,
    paddingVertical: Metrics.marginSection,
  },
  scrollContainer: {
    paddingBottom: 50,
  },
  description: {
    ...Fonts.font.base.bodyOne,
    marginHorizontal: Metrics.marginSection,
  },
  currentLimit: {
    paddingHorizontal: Metrics.baseMargin,
    paddingBottom: Metrics.halfMargin,
    marginBottom: Metrics.marginSection,
  },
  minMaxValue: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Metrics.smallMargin,
  },
  sectionCharge: {
    marginTop: Metrics.marginSection,
  },
  saveBtn: {
    paddingVertical: Metrics.marginSection,
    paddingHorizontal: Metrics.baseMargin,
    marginBottom: Metrics.smallMargin,
    width: '100%',
  },
  sectionInfo: {
    flexDirection: 'row',
    marginHorizontal: Metrics.smallMargin,
  },
  sectionInfoText: {
    flexDirection: 'row',
    marginTop: 4,
  },
  sectionInfoDescription: {
    flex: 1,
    marginLeft: Metrics.halfMargin,
  },
  textDot: {
    ...Fonts.font.base.caption,
    fontSize: 14,
    color: Colors.disabled,
    marginRight: Metrics.smallMargin,
  },
  textDescription: {
    ...Fonts.font.base.caption,
    color: Colors.disabled,
  },
});

export default PowerInputLimit;
