import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { SvgProps } from 'react-native-svg';

import { Yeti6GState, Yeti6GStatus, YetiState } from 'App/Types/Yeti';
import { Colors, Fonts, Metrics } from 'App/Themes';
import { useAppDispatch } from 'App/Hooks';
import { alertError, clearAlert } from 'App/Services/Alert';
import { thingUpdaters, update } from 'App/Services/ConnectionControler';
import { getPortKey, isLegacyYeti, isYeti6G } from 'App/Services/Yeti';
import { devicesActions } from 'App/Store/Devices';
import { cacheActions } from 'App/Store/Cache';
import { Switch } from 'App/Components';
import PortStates, { appPort12VOutStates, appPortAcOutStates } from 'App/Config/PortStates';
import { DeviceState } from 'App/Types/Devices';
import { FridgeState } from 'App/Types/Fridge';
import AppConfig from 'App/Config/AppConfig';

type Props = {
  device: DeviceState;
  icon: React.FC<SvgProps>;
  title: string;
  type: 'v12PortStatus' | 'usbPortStatus' | 'acPortStatus';
  isDisabled?: boolean;
};

function PortStatusRow(props: Props) {
  const dispatch = useAppDispatch();

  const isAllPortsLocked = useMemo(
    () => (props.device as Exclude<DeviceState, FridgeState>)?.isLockAllPorts,
    [props.device],
  );
  const legacyYeti = isLegacyYeti(props.device?.thingName || '');
  const is6gYeti = useMemo(
    () => isYeti6G(props.device?.thingName || '') || props.device?.deviceType?.startsWith('Y6G'),
    [props.device?.deviceType, props.device?.thingName],
  );

  const powerUnits = 'w';

  const portValue = useMemo(() => {
    if (!legacyYeti) {
      const device = props.device as Yeti6GState;

      return {
        v12PortStatus: `${device?.status?.ports?.v12Out?.[powerUnits] || '0'} W`,
        usbPortStatus: `${device?.status?.ports?.usbOut?.[powerUnits] || '0'} W`,
        acPortStatus: `${device?.status?.ports?.acOut?.[powerUnits] || '0'} W`,
      }[props.type];
    }
  }, [legacyYeti, props.device, props.type]);

  const [isEnabled, setIsEnabled] = useState(
    !!(legacyYeti
      ? (props.device as YetiState)?.[props.type]
      : (props.device as Yeti6GState)?.status?.ports?.[getPortKey(props.type)]?.s),
  );
  const [isLocked, setIsLocked] = useState(isAllPortsLocked);
  const [switchColor, setSwitchColor] = useState(isEnabled ? Colors.green : Colors.gray);
  const [isPassThrough, setIsPassThrough] = useState(false);
  const timerId = useRef<NodeJS.Timer | null>(null);

  const onChange = useCallback(() => {
    const newIsEnabled = !isEnabled;
    setIsEnabled(newIsEnabled);

    if (newIsEnabled) {
      setSwitchColor(Colors.greenDisable);
    } else {
      setSwitchColor(Colors.grayDisable);
    }

    setIsLocked(true);

    let portState: Record<string, any> | { ports: Yeti6GStatus['ports'] };
    if (legacyYeti) {
      portState = { [props.type]: newIsEnabled ? PortStates.enabled : PortStates.disabled };
    } else {
      portState = {
        ports: {
          [getPortKey(props.type)]: {
            s: newIsEnabled ? appPort12VOutStates.APP_PORT_12V_OUT_ON : appPort12VOutStates.APP_PORT_12V_OUT_OFF,
          },
        },
      };
    }

    update({
      thingName: props.device?.thingName || '',
      stateObject: {
        state: {
          desired: portState,
        },
      },
      isDirectConnection: props.device?.isDirectConnection || false,
      updateDeviceState: (thingName, data) => dispatch(devicesActions.devicesAddUpdate.request({ thingName, data })),
      changeSwitchState: (thingName, state) => dispatch(devicesActions.blockAllPorts({ thingName, state })),
      method: 'status',
    });

    timerId.current = alertError(
      `${props.device?.name || 'unknown'}: Port ${props.title} cannot be toggled now. Please try again later.`,
      () => {
        dispatch(cacheActions.changeAppRateInfo({ isBlockedShowAppRate: true }));
        dispatch(
          devicesActions.devicesAddUpdate.request({
            thingName: props.device?.thingName || '',
            data: {
              isConnected: false,
            },
          }),
        );
      },
    );
  }, [
    isEnabled,
    legacyYeti,
    props.device?.thingName,
    props.device?.isDirectConnection,
    props.device?.name,
    props.title,
    props.type,
    dispatch,
  ]);

  useEffect(() => {
    const updater = thingUpdaters[props.device?.thingName || ''];

    if (updater && updater.scheduling) {
      if (isAllPortsLocked) {
        setIsLocked(true);
      }
      return;
    }

    let portState;
    if (legacyYeti) {
      portState = (props.device as YetiState)?.[props.type];
    } else {
      portState = (props.device as Yeti6GState)?.status?.ports?.[getPortKey(props.type)]?.s;
    }

    let _isEnabled = !!portState;
    let _switchColor = Colors.green;

    if (isLocked) {
      _isEnabled = isEnabled;
      _switchColor = Colors.greenDisable;
    }

    if (
      legacyYeti || !is6gYeti
        ? portState === PortStates.portFault
        : (props.type === 'v12PortStatus' && portState === appPort12VOutStates.APP_PORT_12V_OUT_FAULT) ||
          (props.type === 'acPortStatus' && portState === appPortAcOutStates.APP_PORT_AC_OUT_FAULT) ||
          (props.type === 'usbPortStatus' && portState === PortStates.portFault)
    ) {
      _switchColor = isLocked ? Colors.portErrorDisable : Colors.portError;
    }

    setIsEnabled(_isEnabled);
    setSwitchColor(_switchColor);
    setIsLocked(isAllPortsLocked);
    clearAlert(timerId.current);

    // passThrough is on if:
    //   - props.type is 'acPortStatus'
    //   - AC port is on
    //   - Y6G
    //   - status.ports.acOut.s = 2
    if (!legacyYeti && props.type === 'acPortStatus') {
      setIsPassThrough(
        (props.device as Yeti6GState)?.status?.ports?.acOut?.s === appPortAcOutStates.APP_PORT_AC_OUT_INVERTER_SOURCE,
      );
    }

    return () => {
      clearAlert(timerId.current);
    };
  }, [isAllPortsLocked, isEnabled, isLocked, isPassThrough, legacyYeti, props.device, props.type, is6gYeti]);

  const renderStatusText = () => {
    const textColor = isEnabled && !props?.isDisabled ? switchColor : undefined;

    //error case is special in that we don't care if it's enabled or not, we want the text to stay red
    if (switchColor === Colors.portError || switchColor === Colors.portErrorDisable) {
      return (
        <>
          Status: <Text style={{ color: props?.isDisabled ? textColor : switchColor }}>Error</Text>
        </>
      );
    }

    if (isEnabled && props.type === 'acPortStatus' && !legacyYeti) {
      return (
        <>
          Source: <Text style={{ color: textColor }}>{isPassThrough ? 'AC Input' : 'Battery'}</Text>
        </>
      );
    }

    return (
      <>
        Status: <Text style={{ color: textColor }}>{isEnabled ? 'On' : 'Off'}</Text>
      </>
    );
  };

  const iconColor = useMemo(() => {
    if (props?.isDisabled) {
      return Colors.disabled;
    }
    if (switchColor === Colors.portError) {
      return Colors.portError;
    }
    return isEnabled ? switchColor : isLocked ? Colors.grayDisable : Colors.transparentWhite('0.87');
  }, [isEnabled, props?.isDisabled, switchColor, isLocked]);

  let v12OutAmperage = 0;
  if (isEnabled && !isLegacyYeti(props.device?.thingName || '')) {
    const device = props.device as Yeti6GState;
    const v12Out = device?.status?.ports?.v12Out;
    const v12OutVoltage = v12Out?.v || (AppConfig.defaultYeti6g12vConstantVoltage as number);
    v12OutAmperage = !v12Out?.a ? Number(((v12Out?.w || 0) / v12OutVoltage).toFixed(1).replace('.0', '')) : v12Out.a;
  }
  const acOutAmperage = (isEnabled && (props.device as Yeti6GState)?.status?.ports?.acOut?.a) || 0;
  const showV12OutAmperage = !legacyYeti && props.type === 'v12PortStatus';
  const showAcOutAmperage = !legacyYeti && props.type === 'acPortStatus';
  const portState = legacyYeti
    ? (props.device as YetiState)[props.type]
    : (props.device as Yeti6GState)?.status?.ports?.[getPortKey(props.type)]?.s;
  const isPortError =
    legacyYeti || !is6gYeti
      ? portState === PortStates.portFault
      : (props.type === 'v12PortStatus' && portState === appPort12VOutStates.APP_PORT_12V_OUT_FAULT) ||
        (props.type === 'acPortStatus' && portState === appPortAcOutStates.APP_PORT_AC_OUT_FAULT) ||
        (props.type === 'usbPortStatus' && portState === PortStates.portFault);

  return (
    <View testID="portStatusRow" style={styles.container}>
      <View style={styles.sectionIcon}>{!!props.icon && <props.icon color={iconColor} />}</View>
      <View style={styles.sectionText}>
        <Text style={[styles.textTitle, (props?.isDisabled && styles.disabledText) || (isLocked && styles.lockedText)]}>
          {props.title}
        </Text>
        <Text
          style={[styles.textStatus, (props?.isDisabled && styles.disabledText) || (isLocked && styles.lockedText)]}>
          {renderStatusText()}
        </Text>
      </View>
      <View style={styles.switchRow}>
        <View style={styles.switchRowValues}>
          {!legacyYeti && (
            <Text style={[styles.textValue, { color: !isEnabled || props?.isDisabled ? Colors.gray : switchColor }]}>
              {isPortError || !isEnabled ? '0 W' : portValue}
            </Text>
          )}

          {showV12OutAmperage && (
            <Text
              style={[
                styles.amperageText,
                {
                  color: v12OutAmperage === 0 || props.isDisabled ? Colors.border : Colors.border,
                },
              ]}>
              {isPortError || !isEnabled ? '0' : v12OutAmperage} A
            </Text>
          )}

          {showAcOutAmperage && (
            <Text
              style={[
                styles.amperageText,
                {
                  color: acOutAmperage === 0 || props.isDisabled ? Colors.border : Colors.disabled,
                },
              ]}>
              {isPortError || !isEnabled ? '0' : (props.device as Yeti6GState)?.status?.ports?.acOut?.a || '0'} A
            </Text>
          )}
        </View>
        <Switch
          value={isEnabled}
          disabled={props?.isDisabled}
          locked={isLocked}
          onPress={onChange}
          error={isPortError}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    flexDirection: 'row',
    paddingVertical: 4,
    alignItems: 'center',
  },
  sectionText: {
    flex: 1,
    paddingLeft: 4,
    paddingVertical: Metrics.smallMargin,
  },
  sectionIcon: {
    width: 64,
    height: 64,
    justifyContent: 'center',
    alignItems: 'center',
  },
  textTitle: {
    flex: 1,
    ...Fonts.font.base.bodyTwo,
    color: Colors.transparentWhite('0.87'),
  },
  disabledText: {
    color: Colors.disabled,
  },
  lockedText: {
    color: Colors.grayDisable,
  },
  textStatus: {
    flex: 1,
    ...Fonts.font.base.caption,
  },
  switchRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  switchRowValues: { alignItems: 'flex-end' },
  textValue: {
    ...Fonts.font.base.bodyTwo,
    marginRight: Metrics.smallMargin / 2,
  },
  amperageText: {
    ...Fonts.font.base.caption,
    marginRight: Metrics.smallMargin / 2,
  },
});

export default PortStatusRow;
