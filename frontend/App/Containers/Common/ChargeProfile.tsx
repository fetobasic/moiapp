import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { isEqual } from 'lodash';
import { useSelector } from 'react-redux';
import { View, Text, ScrollView, StyleSheet } from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import Svg, { Defs, LinearGradient, Rect, Stop } from 'react-native-svg';

import { ApplicationStyles, Colors, Fonts, Metrics, isIOS } from 'App/Themes';
import { HeaderSimple as Header, CustomProfileInfo, Button, ExpandTile, Spinner } from 'App/Components';

import { getCurrentDevice } from 'App/Store/Devices/selectors';
import { ChargeProfileType } from 'App/Types/ChargeProfile';
import { HomeStackParamList } from 'App/Types/NavigationStackParamList';
import { ChargeProfile as ChargeProfileSetupType, Yeti6GConfig, Yeti6GState, YetiState } from 'App/Types/Yeti';
import { chargingProfileActions, chargingProfileSelectors } from 'App/Store/ChargingProfile';
import { useAppDispatch, useAppSelector, useEvents, useMount, usePrevious } from 'App/Hooks';
import { getDefaultProfile, getProfileDefaultSetup, isPredefinedProfile } from 'App/Services/ChargingProfile';
import { devicesActions, devicesSelectors } from 'App/Store/Devices';
import { showError, showInfo } from 'App/Services/Alert';
import { update } from 'App/Services/ConnectionControler';
import AppConfig from 'App/Config/AppConfig';
import callWithDelay from 'App/Services/CallWithDelay';
import renderElement from 'App/Services/RenderElement';
import { DEFAULT_PROFILE_NAME } from 'App/Config/ChargingProfile';
import { navigationGoBack } from 'App/Navigation/AppNavigation';
import { isLegacyYeti } from 'App/Services/Yeti';
import { store } from 'App/Store';
import { getYetiGeneration } from 'App/Services/ThingHelper';

export const chargeProfilesInfo = [
  {
    title: 'Performance',
    subTitle: 'Access the full capacity of your Goal Zero device. Ideal for off-grid events.',
    value: ChargeProfileType.Performance,
    re: 95,
    min: 0,
    max: 100,
  },
  {
    title: 'Battery Saver',
    subTitle: 'Preserve your Goal Zero device battery.',
    value: ChargeProfileType.BatterySaver,
    min: 15,
    max: 85,
    re: 80,
  },
  {
    title: 'Balanced',
    subTitle: 'The perfect balance between Performance and Battery Saver.',
    value: ChargeProfileType.Balanced,
    min: 2,
    max: 95,
    re: 90,
  },
  {
    title: 'Custom',
    subTitle: "Create a profile that's best for your needs.",
    value: ChargeProfileType.Custom,
    min: 0,
    re: 0,
    max: 100,
  },
];

const InfoRow = ({ min, re, max }: Omit<LinearRangeProps, 'batteryHealth'>) => (
  <View style={styles.infoContainer}>
    <Text style={styles.infoTitle}>
      Min: <Text style={ApplicationStyles.textGreen}>{min}%</Text>
    </Text>
    <Text style={styles.infoTitle}>
      Recharge Point: <Text style={styles.textBlue}>{re}%</Text>
    </Text>
    <Text style={styles.infoTitle}>
      Max: <Text style={ApplicationStyles.textGreen}>{max}%</Text>
    </Text>
  </View>
);

type LinearRangeProps = {
  min: number;
  max: number;
  re: number;
};

const LinearRange = ({ min, re, max }: LinearRangeProps) => (
  <View style={styles.trackContainer}>
    <View style={styles.track}>
      <Svg height={3} width={`${max - min}%`} style={[styles.gradient, { left: `${min}%` }]}>
        <Defs>
          <LinearGradient id="grad" x1="0" x2="1" y1="0" y2="0">
            <Stop offset="0" stopColor="#D6DF7B" stopOpacity="1" />
            <Stop offset="1" stopColor="#BDCC2A" stopOpacity="1" />
          </LinearGradient>
        </Defs>
        <Rect x="0" y="0" height="3" width="100%" fill="url(#grad)" />
      </Svg>
    </View>
    <View style={[styles.marker, { left: `${min}%` }]} />
    <View style={[styles.marker, { left: `${re}%`, backgroundColor: Colors.blue }]} />
    <View style={[styles.marker, { right: `${100 - max}%` }]} />
    <InfoRow min={min} re={re} max={max} />
  </View>
);

type Props = NativeStackScreenProps<HomeStackParamList, 'ChargeProfile'>;

function ChargeProfile({ route }: Props) {
  const dispatch = useAppDispatch();
  const { track } = useEvents();
  const device = useSelector(getCurrentDevice(route.params.device.thingName || ''));
  const thingName = useMemo(() => device?.thingName || '', [device]);
  const legacyYeti = useMemo(() => isLegacyYeti(thingName), [thingName]);
  const yeti6G = device as Yeti6GState;

  const { deviceProfileName, deviceProfileSetup, storedActiveProfileName, storedCustomSetup, isConnected } =
    useSelector(chargingProfileSelectors.getProfileInfo(thingName));

  const { dataFetching, dataFetchingError, isDirectConnection, devicesInfo, chargingProfile } = useAppSelector(
    (state) => ({
      dataFetching: state.chargingProfile.fetching,
      dataFetchingError: state.chargingProfile.error,
      isDirectConnection: state.application.isDirectConnection,
      devicesInfo: state.devicesInfo,
      chargingProfile: state.chargingProfile,
    }),
  );

  const [selectedProfileName, setSelectedProfileName] = useState(deviceProfileName);
  const [customSetup, setCustomSetup] = useState<ChargeProfileSetupType>(
    storedCustomSetup || getProfileDefaultSetup(DEFAULT_PROFILE_NAME),
  );

  const [expandedTileIndices, setExpandedTileIndices] = useState<number[]>([]);

  const isChangeSaved =
    getDefaultProfile(deviceProfileName)?.title !== getDefaultProfile(selectedProfileName)?.title ||
    (deviceProfileName === 'CUSTOM' && !isEqual(deviceProfileSetup, customSetup));

  const prevChargingProfile = usePrevious(chargingProfile);
  const prevDeviceInfo = usePrevious(devicesInfo);

  const currDeviceProfile = devicesSelectors.getChargingProfileSetup(devicesInfo, thingName);
  const prevDeviceProfile = devicesSelectors.getChargingProfileSetup(prevDeviceInfo, thingName);

  const [allowEditing, setAllowEditing] = useState(isConnected);
  const [isLoading, setIsLoading] = useState(false);
  const [expectedProfileName, setExpectedProfileName] = useState<ChargeProfileType | ''>('');

  const switchTimer = useRef<NodeJS.Timeout | null>(null);
  const stopSwitching = useRef<boolean>(false);

  useMount(() => {
    return () => {
      if (switchTimer.current) {
        clearTimeout(switchTimer.current);
        switchTimer.current = null;
      }
    };
  });

  const getCurrentProfileSetup = useCallback(
    (profileName: ChargeProfileType) =>
      isPredefinedProfile(profileName) || !storedCustomSetup ? getProfileDefaultSetup(profileName) : storedCustomSetup,
    [storedCustomSetup],
  );

  const changeDeviceState = useCallback(
    (setup: ChargeProfileSetupType) => {
      if (legacyYeti) {
        dispatch(
          devicesActions.devicesAddUpdate.request({
            thingName,
            data: {
              chargeProfile: { ...setup },
            },
          }),
        );
      } else {
        dispatch(
          devicesActions.devicesAddUpdate.request({
            thingName,
            data: {
              // @ts-ignore TODO: we need to use complex and recursive Partial generic of Yeti6GState type
              config: {
                chgPrfl: {
                  min: setup.min,
                  max: setup.max,
                  rchg: setup.re,
                },
              },
            },
          }),
        );
      }
    },
    [dispatch, legacyYeti, thingName],
  );

  const allowSwitchProcessing = () => {
    if (switchTimer.current) {
      clearTimeout(switchTimer.current);
      switchTimer.current = null;
    }
    stopSwitching.current = false;
  };

  const doneSwitchProcessing = () => {
    if (switchTimer.current) {
      clearTimeout(switchTimer.current);
      switchTimer.current = null;
    }
    stopSwitching.current = true;
  };

  const setInitialStates = useCallback(() => {
    setAllowEditing(isConnected);
    setIsLoading(false);
    setExpectedProfileName('');
  }, [isConnected]);

  const finishAndStoreActiveProfile = useCallback(
    (profileName: ChargeProfileType, resetState = false) => {
      doneSwitchProcessing();

      if (resetState) {
        setInitialStates();
      }

      dispatch(
        chargingProfileActions.chargingProfileSetActiveProfile(thingName, {
          name: profileName,
        }),
      );
    },
    [dispatch, setInitialStates, thingName],
  );

  const setErrorTimeout = useCallback(
    (message: string, desiredProfileSetup: ChargeProfileSetupType) => {
      // lock interface for set period until updated profile is reported
      if (switchTimer.current) {
        clearTimeout(switchTimer.current);
      }
      switchTimer.current = setTimeout(() => {
        const activeSetup = chargingProfileSelectors.getProfileInfo(thingName)(store.getState()).deviceProfileSetup;
        setInitialStates();
        if (!isEqual(activeSetup, desiredProfileSetup)) {
          callWithDelay(() => {
            showError(message);
          });
        }
      }, AppConfig.chargeProfileCheckTimeout);
    },
    [setInitialStates, thingName],
  );

  const activateProfile = useCallback(
    (profileName: ChargeProfileType) => {
      let setup: ChargeProfileSetupType = { ...getCurrentProfileSetup(profileName) };

      if (profileName === ChargeProfileType.Custom) {
        setup = customSetup;
      }

      let desired: { chargeProfile: YetiState['chargeProfile'] } | { chgPrfl: Yeti6GConfig['chgPrfl'] } = {
        chgPrfl: {
          min: setup.min,
          max: setup.max,
          rchg: setup.re,
        },
      };

      if (legacyYeti) {
        desired = { chargeProfile: setup };
      }

      // send request to Direct or AWS API
      update({
        thingName: device.thingName || '',
        method: 'config',
        // @ts-ignore TODO: we need to use complex and recursive Partial generic of AwsState type
        stateObject: { state: { desired } },
        isDirectConnection,
        updateDeviceState: (_thingName, data) =>
          dispatch(devicesActions.devicesAddUpdate.request({ thingName: _thingName, data })),
        changeSwitchState: (_thingName, state) =>
          dispatch(devicesActions.blockChargingProfile({ thingName: _thingName, state })),
        changeDeviceState: () => changeDeviceState(setup),
        debounceTimeout: AppConfig.debounceLongTimeout,
      });
    },
    [
      changeDeviceState,
      customSetup,
      device.thingName,
      dispatch,
      getCurrentProfileSetup,
      isDirectConnection,
      legacyYeti,
    ],
  );

  const lockAndActivateProfile = useCallback(
    (profileName: ChargeProfileType) => {
      setIsLoading(true);
      setAllowEditing(false);
      setExpectedProfileName(profileName);

      activateProfile(profileName);

      const defaultSetup = getDefaultProfile(profileName)?.setup;
      const chargeProfileConfig: ChargeProfileSetupType =
        profileName === ChargeProfileType.Custom
          ? customSetup
          : { max: defaultSetup?.max || 0, min: defaultSetup?.min || 0, re: defaultSetup?.re || 0 };

      track('thing_charge_profile_changed', {
        thingName: device?.thingName,
        model: device?.model,
        gen: getYetiGeneration(device?.thingName, device?.model),
        chargeProfileType: profileName,
        chargeProfileConfig,
      });

      if (profileName === ChargeProfileType.Custom && deviceProfileName === profileName) {
        callWithDelay(() => {
          showInfo(<Text style={styles.subTitle}>Custom charging profile was updated</Text>, 'Saved!', () =>
            navigationGoBack(),
          );
        });
      } else {
        callWithDelay(() => {
          showInfo(
            <Text style={styles.subTitle}>
              Charging profile was changed from {'\n'}"
              <Text style={{ color: Colors.green }}>{getDefaultProfile(deviceProfileName)?.title}</Text>" to "
              <Text style={{ color: Colors.green }}>{getDefaultProfile(selectedProfileName)?.title}</Text>".
            </Text>,
            'Saved!',
            () => navigationGoBack(),
          );
        });
      }
    },
    [activateProfile, customSetup, device?.model, device?.thingName, deviceProfileName, selectedProfileName, track],
  );

  const selectProfileHandler = () => {
    if (!isConnected) {
      return;
    }

    if (!isEqual(storedCustomSetup, customSetup)) {
      // store setup first to be able to compare it with reported in ListProfiles
      // and avoid unnecessary popup
      storeProfileNow();
    }

    // if desired profile has the same setup as current
    // just update stored active profile name
    // expectedProfileName remains null
    const desiredProfileSetup = isPredefinedProfile(selectedProfileName)
      ? getProfileDefaultSetup(selectedProfileName)
      : storedCustomSetup;

    setErrorTimeout(
      `Could not switch to ${getDefaultProfile(selectedProfileName)?.title} profile. Please try again later.`,
      desiredProfileSetup,
    );

    lockAndActivateProfile(selectedProfileName);
  };

  const hasConnectionChanged = useCallback(() => {
    const prevConnectedState = devicesSelectors.getConnectedState(prevDeviceInfo, thingName);

    return prevConnectedState !== isConnected;
  }, [isConnected, prevDeviceInfo, thingName]);

  const checkForConnectionChange = useCallback(() => {
    // there are 3 cases for controls lock
    // - connection dropped
    // - data is fetching = isLoading == true
    // - error occurred and app state might be inconsistent
    if (hasConnectionChanged() && !isConnected) {
      // prevent switching profile error to come up
      if (switchTimer.current) {
        clearTimeout(switchTimer.current);
        switchTimer.current = null;
      }

      callWithDelay(() => {
        if (isLoading) {
          showError(
            `Could not switch to ${
              getDefaultProfile(expectedProfileName)?.title
            } profile because Yeti was disconnected. Please try again later.`,
          );
        } else {
          showInfo('Yeti was disconnected.');
        }
      });
      doneSwitchProcessing();

      setAllowEditing(false);
      setIsLoading(false);
      setExpectedProfileName('');
      return;
    }
    // works when connection restored
    const shouldAllowEditing = !isLoading && isConnected && !dataFetching && !dataFetchingError;

    if (allowEditing !== shouldAllowEditing) {
      setAllowEditing(shouldAllowEditing);
      setIsLoading(Boolean(isConnected && isLoading));
    }
  }, [
    allowEditing,
    dataFetching,
    dataFetchingError,
    expectedProfileName,
    hasConnectionChanged,
    isConnected,
    isLoading,
  ]);

  const checkForInternalSwitch = useCallback(() => {
    const { setup: prevStoredCustomSetup } = chargingProfileSelectors.getCustomStoredProfile(
      prevChargingProfile,
      thingName,
    );

    // nothing was expected, but app changed existing custom setup
    // internal case - CustomProfile screen change request
    if (
      !expectedProfileName &&
      (deviceProfileName === ChargeProfileType.Custom || isEqual(deviceProfileSetup, prevStoredCustomSetup)) &&
      !isEqual(prevStoredCustomSetup, storedCustomSetup) &&
      prevStoredCustomSetup
    ) {
      setErrorTimeout(
        `Could not update ${getDefaultProfile(ChargeProfileType.Custom)?.title} profile. Please try again later.`,
        deviceProfileSetup as ChargeProfileSetupType,
      );
      // cannot use this.doneSwitchProcessing() here as it would clear timeout
      stopSwitching.current = true;

      lockAndActivateProfile(ChargeProfileType.Custom);
      return true;
    }

    // profile switch occurred, was expected and it matches reported
    // internal case
    if (deviceProfileName === expectedProfileName) {
      // true means also re-initialize state
      finishAndStoreActiveProfile(deviceProfileName, true);
      return true;
    }

    // switch to custom when it matches one of predefined
    // deviceProfileName would contain predefined name in this case
    // internal case
    if (expectedProfileName === ChargeProfileType.Custom && deviceProfileName !== expectedProfileName) {
      // true means also re-initialize state
      finishAndStoreActiveProfile(expectedProfileName, true);
      return true;
    }
    return false;
  }, [
    deviceProfileName,
    deviceProfileSetup,
    expectedProfileName,
    finishAndStoreActiveProfile,
    lockAndActivateProfile,
    prevChargingProfile,
    setErrorTimeout,
    storedCustomSetup,
    thingName,
  ]);

  const checkForExternalSwitch = useCallback(() => {
    if (expectedProfileName) {
      return false;
    }

    // nothing expected, but profile has changed
    // external change - predefined profile
    if (deviceProfileName !== storedActiveProfileName) {
      finishAndStoreActiveProfile(deviceProfileName);

      if (deviceProfileName === ChargeProfileType.Custom) {
        dispatch(
          chargingProfileActions.chargingProfileUpdateCustomProfile(thingName, {
            setup: deviceProfileSetup,
          }),
        );
      }

      return true;
    }

    const { setup: prevStoredCustomSetup } = chargingProfileSelectors.getCustomStoredProfile(
      prevChargingProfile,
      thingName,
    );

    // nothing expected, but profile has changed
    // external change - custom profile
    if (
      deviceProfileName === ChargeProfileType.Custom &&
      !isEqual(deviceProfileSetup, storedCustomSetup) &&
      isEqual(prevStoredCustomSetup, storedCustomSetup)
    ) {
      setAllowEditing(false);
      doneSwitchProcessing();

      // no screen locking here as we only update redux state
      dispatch(
        chargingProfileActions.chargingProfileUpdateCustomProfile(thingName, {
          setup: deviceProfileSetup,
        }),
      );

      return true;
    }
    return false;
  }, [
    deviceProfileName,
    deviceProfileSetup,
    dispatch,
    expectedProfileName,
    finishAndStoreActiveProfile,
    prevChargingProfile,
    storedActiveProfileName,
    storedCustomSetup,
    thingName,
  ]);

  useEffect(() => {
    checkForConnectionChange();
  }, [isConnected, checkForConnectionChange]);

  useEffect(() => {
    const propsChanged =
      !isEqual(prevChargingProfile, chargingProfile) || !isEqual(prevDeviceProfile, currDeviceProfile);

    // ignore state updates as we rely on device or redux state
    if (!propsChanged) {
      return;
    }

    if (stopSwitching.current) {
      if (isLoading) {
        setInitialStates();
      }
      allowSwitchProcessing();
    }

    const handled = checkForInternalSwitch();
    if (!handled) {
      checkForExternalSwitch();
    }
  }, [
    chargingProfile,
    checkForExternalSwitch,
    checkForInternalSwitch,
    currDeviceProfile,
    isLoading,
    prevChargingProfile,
    prevDeviceProfile,
    setInitialStates,
  ]);

  const chargeProfilesInfoWithEnergy = chargeProfilesInfo.map((profile) => {
    const soh = yeti6G?.lifetime?.batt?.soh ?? 100;

    if (profile.value === ChargeProfileType.Custom) {
      profile.min = customSetup.min;
      profile.max = customSetup.max;
      profile.re = customSetup.re;
    }

    let cap: number = legacyYeti
      ? parseInt(device?.model?.split(' ')?.[1] || '', 10)
      : (yeti6G?.device?.batt?.whCap ?? 1) * (soh / 100);

    // TODO: accessible energy should respect also tanks capacity in the future
    // if (legacyYeti) {
    //   cap += device?.foreignAcsry?.tankCapacity;
    // } else {
    //   const xNodes = device?.device?.xNodes || {};

    //   Object.entries(xNodes).forEach(([xNodeName, xNodeAccessory]) => {
    //     if (xNodes[xNodeName].hostId.startsWith(Accessories.TANK_PRO)) {
    //       const tankCap = xNodeAccessory?.whCap ?? 0;
    //       const tankSoh = xNodeAccessory?.soh ?? 100;

    //       cap += tankCap * (tankSoh / 100);
    //     }
    //   });
    // }

    const energy = Math.round(cap * ((profile.max - profile.min) / 100));

    return { ...profile, energy };
  });

  const debounceTimer = useRef<NodeJS.Timeout | null>(null);

  const storeProfileNow = useCallback(() => {
    dispatch(
      chargingProfileActions.chargingProfileUpdateCustomProfile(thingName, {
        setup: customSetup,
      }),
    );
  }, [dispatch, customSetup, thingName]);

  useMount(() => {
    return () => {
      if (debounceTimer.current) {
        clearTimeout(debounceTimer.current);
      }
    };
  });

  const toggleCollapse = useCallback(
    (index: number) => {
      expandedTileIndices.includes(index)
        ? setExpandedTileIndices(expandedTileIndices.filter((item) => item !== index))
        : setExpandedTileIndices([...expandedTileIndices, index]);
    },
    [expandedTileIndices],
  );

  const onPressHandler = useCallback(
    (value: ChargeProfileType, index: number) => {
      selectedProfileName !== value ? setExpandedTileIndices([index]) : toggleCollapse(index);

      setSelectedProfileName(value);
    },
    [selectedProfileName, toggleCollapse],
  );

  return (
    <View style={ApplicationStyles.mainContainer}>
      <Header title="Charge Profile" isChangeSaved={isChangeSaved && isConnected} cbSave={selectProfileHandler} />
      <ScrollView style={styles.container} contentContainerStyle={styles.scrollContent}>
        {chargeProfilesInfoWithEnergy.map(({ title, subTitle, value, re, min, max, energy }, index) => (
          <ExpandTile
            key={value}
            style={styles.expandTile}
            contentStyle={styles.contentStyle}
            title={renderElement(
              <View style={styles.tileHeader}>
                <Text style={styles.tileTitle}>{title}</Text>
                {value !== ChargeProfileType.Custom && (
                  <Text style={[styles.tileTitle, selectedProfileName === value && { color: Colors.green }]}>
                    {min}% - {max}%
                  </Text>
                )}
              </View>,
            )}
            subTitle={renderElement(<Text style={styles.subTitle}>{subTitle}</Text>)}
            expanded={expandedTileIndices.includes(index)}
            onPress={() => onPressHandler(value, index)}
            toggleCollapse={() => toggleCollapse(index)}
            paddingVertical={Metrics.halfMargin}
            isRadio
            checked={selectedProfileName === value}>
            <>
              <View>
                <View style={styles.divider} />
                <Text style={styles.title}>{`${min}% - Minimum discharge`}</Text>
                <Text style={styles.description}>Will allow discharge to {min}% before disabling outputs.</Text>
              </View>
              <View>
                <View style={styles.divider} />
                <Text style={styles.title}>{`${re}% - Recharge Point`}</Text>
                <Text style={styles.description}>Will restart charging once discharged to {re}%.</Text>
              </View>
              <View>
                <View style={styles.divider} />
                <Text style={styles.title}>{`${max}% - Maximum charge`}</Text>
                <Text style={styles.description}>Will stop charging once {max}% is reached.</Text>
              </View>
              <View style={styles.divider} />
              {value === ChargeProfileType.Custom ? (
                <CustomProfileInfo energy={energy} setup={customSetup} onCustomProfileSetupChange={setCustomSetup} />
              ) : (
                <>
                  <Text style={styles.title}>
                    <Text style={ApplicationStyles.textGreen}>{energy} Wh</Text> - Accessible Energy
                  </Text>
                  <LinearRange re={re} min={min} max={max} />
                </>
              )}
            </>
          </ExpandTile>
        ))}
      </ScrollView>

      <View style={styles.btnWrapper}>
        <Button
          style={styles.saveBtn}
          title="SAVE"
          onPress={selectProfileHandler}
          inverse={!isChangeSaved && isConnected && allowEditing}
          disabled={!isChangeSaved && isConnected && allowEditing}
        />
      </View>

      <Spinner visible={isLoading} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: Metrics.smallMargin,
    paddingVertical: Metrics.marginSection,
  },
  scrollContent: {
    paddingBottom: 100,
  },
  expandTile: {
    paddingBottom: 2,
    paddingHorizontal: 2,
    marginBottom: Metrics.smallMargin,
  },
  contentStyle: {
    paddingHorizontal: Metrics.smallMargin,
  },
  divider: {
    height: 1,
    backgroundColor: Colors.border,
    marginHorizontal: -Metrics.baseMargin,
    marginTop: Metrics.marginSection,
  },
  tileHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  tileTitle: {
    ...Fonts.font.base.bodyTwo,
    color: Colors.transparentWhite('0.87'),
  },
  title: {
    ...Fonts.font.base.bodyOne,
    marginTop: Metrics.halfMargin,
  },
  subTitle: {
    ...Fonts.font.base.bodyOne,
    color: Colors.disabled,
    marginTop: 2,
  },
  description: {
    ...Fonts.font.base.caption,
    color: Colors.gray,
    marginTop: 2,
  },
  textBlue: {
    color: Colors.blue,
  },
  trackContainer: {
    marginTop: Metrics.marginSection,
  },
  track: {
    overflow: 'hidden',
    borderColor: Colors.border,
    backgroundColor: Colors.border,
  },
  gradient: {
    borderColor: Colors.border,
  },
  marker: {
    top: -6,
    width: 2,
    height: 16,
    borderRadius: 1,
    position: 'absolute',
    backgroundColor: Colors.white,
  },
  infoContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: Metrics.baseMargin,
  },
  infoTitle: {
    ...Fonts.font.base.caption,
    color: Colors.transparentWhite('0.87'),
  },
  btnWrapper: {
    position: 'absolute',
    flexDirection: 'row',
    paddingHorizontal: Metrics.baseMargin,
    paddingVertical: Metrics.smallMargin,
    backgroundColor: Colors.background,
    bottom: 0,
    paddingBottom: isIOS ? Metrics.bigMargin : Metrics.halfMargin,
  },
  saveBtn: {
    flex: 1,
  },
});

export default ChargeProfile;
