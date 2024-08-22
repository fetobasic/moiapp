import React, { useCallback } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { SvgProps } from 'react-native-svg';

import ExpandTile from 'App/Components/ExpandTile';
import PortDCLowVolatge from 'App/Images/Icons/port-dc-low-voltage.svg';
import PortDCHighVoltage from 'App/Images/Icons/port-dc-high-voltage.svg';
import PortACChargeIcon from 'App/Images/Icons/port-ac-charge.svg';
import renderElement from 'App/Services/RenderElement';
import { Fonts, Metrics, Colors } from 'App/Themes';
import { Yeti6GState, PortStatus } from 'App/Types/Yeti';
import { isYeti300500700 } from 'App/Services/ThingHelper';
import AppConfig from 'App/Config/AppConfig';
import semver from 'semver';

const EMPTY_PORTS = {
  acIn: {
    s: 0,
    w: 0,
    a: 0,
  },
  lvDcIn: {
    s: 0,
    w: 0,
    a: 0,
  },
  hvDcIn: {
    s: 0,
    w: 0,
    a: 0,
  },
};

const getPortTextStatus = (status: number) => {
  switch (status) {
    case PortStatus.Inactive:
      return 'Off';
    case PortStatus.Detected:
      return 'Detected';
    case PortStatus.Charging:
      return 'On';
    default:
      return 'Error';
  }
};

const getPortColorStatus = (status: number, isDisabled?: boolean) => {
  if (isDisabled) {
    return Colors.disabled;
  }
  switch (status) {
    case PortStatus.Inactive:
      return Colors.transparentWhite('0.87');
    case PortStatus.Detected:
      return Colors.transparentWhite('0.87');
    case PortStatus.Charging:
      return Colors.green;
    default:
      return Colors.portError;
  }
};

type InputPortRowProps = {
  icon: React.FC<SvgProps>;
  title: string;
  status: number;
  wattage: number;
  amperage?: number;
  powerUnits: 'a' | 'w';
  isDisabled?: boolean;
};

const InputPortRow = (props: InputPortRowProps) => {
  const color = getPortColorStatus(props.status, props?.isDisabled);
  const textStatus = getPortTextStatus(props.status);
  const errorStatus = props.status === PortStatus.Error;

  return (
    <View style={styles.inputPortRowContainer}>
      <props.icon color={color} style={styles.rowIcon} />

      <View style={styles.portInfo}>
        <View style={styles.portTextSection}>
          <Text style={[styles.inputPortRowTitle, props?.isDisabled && styles.inputDisabled]}>{props.title}</Text>
        </View>

        {errorStatus ? (
          <Text style={[styles.inputPortRowStatus, props?.isDisabled ? styles.inputDisabled : styles.inputActive]}>
            Status: <Text style={{ color }}>Error</Text>
          </Text>
        ) : (
          <Text style={[styles.inputPortRowStatus, props?.isDisabled ? styles.inputDisabled : styles.inputActive]}>
            Status: <Text style={{ color }}>{textStatus}</Text>
          </Text>
        )}
      </View>

      {!errorStatus && (
        <View style={styles.inputPortRowValues}>
          <Text
            style={[
              styles.inputPortRowWattage,
              { color: props.status === PortStatus.Inactive ? Colors.transparentWhite('0.5') : color },
            ]}>
            {textStatus !== 'Off' ? props.wattage : 0} W
          </Text>

          <Text
            style={[styles.inputPortRowAmperage, { color: textStatus !== 'Off' ? Colors.disabled : Colors.border }]}>
            {props.amperage} A
          </Text>
        </View>
      )}
    </View>
  );
};

type YetiInputPortsProps = {
  device?: Yeti6GState;
  isDisabled?: boolean;
};

export const YetiInputPorts = (props: YetiInputPortsProps) => {
  const [isExpanded, setIsExpanded] = React.useState(false);

  const toggleCollapse = useCallback(() => {
    setIsExpanded(!isExpanded);
  }, [isExpanded]);

  const ports = props?.device?.status?.ports || EMPTY_PORTS;
  const powerUnits = 'w';

  const getAcInputPower = (acPorts: any, units = 'w') => {
    if (
      semver.lt(props?.device?.device?.fw || '0.0.0', AppConfig.minFirmwareVersionForCorrectPassthroughWatts) &&
      acPorts?.acIn?.s === 2 &&
      acPorts?.acOut?.s === 2
    ) {
      return acPorts?.acIn?.[units] + acPorts?.acOut?.[units];
    }
    return acPorts?.acIn?.[units];
  };

  return (
    <ExpandTile
      title={renderElement(
        <Text style={[styles.expandTileTitle, props?.isDisabled && styles.expandDisabledTitle]}>Input Ports</Text>,
      )}
      isDisabled={props?.isDisabled}
      expanded={isExpanded}
      onPress={toggleCollapse}
      toggleCollapse={toggleCollapse}
      style={styles.expandTile}>
      <>
        <InputPortRow
          icon={PortDCLowVolatge}
          title="Low Voltage DC"
          status={ports.lvDcIn?.s}
          wattage={ports.lvDcIn?.[powerUnits]}
          amperage={ports.lvDcIn?.a}
          powerUnits={powerUnits}
          isDisabled={props?.isDisabled}
        />
        {!isYeti300500700(props?.device as Yeti6GState) && (
          <InputPortRow
            icon={PortDCHighVoltage}
            title="High Voltage DC"
            status={ports.hvDcIn?.s}
            wattage={ports.hvDcIn?.[powerUnits]}
            amperage={ports.hvDcIn?.a}
            powerUnits={powerUnits}
            isDisabled={props?.isDisabled}
          />
        )}
        <InputPortRow
          icon={PortACChargeIcon}
          title="AC"
          status={ports.acIn?.s}
          wattage={getAcInputPower(ports, powerUnits)}
          amperage={ports.acIn?.a}
          powerUnits={powerUnits}
          isDisabled={props?.isDisabled}
        />
      </>
    </ExpandTile>
  );
};

const styles = StyleSheet.create({
  expandTile: {
    marginHorizontal: Metrics.baseMargin,
    marginTop: Metrics.halfMargin,
  },
  expandTileTitle: {
    marginLeft: 4,
    ...Fonts.font.base.caption,
  },
  expandDisabledTitle: {
    color: Colors.disabled,
  },
  inputPortRowContainer: {
    padding: 0,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  portTextSection: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'center',
  },
  portInfo: {
    flex: 1,
    paddingVertical: Metrics.smallMargin,
  },
  inputPortRowTitle: {
    flex: 1,
    ...Fonts.font.base.bodyTwo,
  },
  inputPortRowValues: {
    alignItems: 'flex-end',
  },
  inputPortRowWattage: {
    ...Fonts.font.base.bodyTwo,
  },
  inputPortRowAmperage: {
    ...Fonts.font.base.caption,
  },
  inputPortRowStatus: {
    flex: 1,
    ...Fonts.font.base.caption,
  },
  inputActive: {
    color: Colors.transparentWhite('0.87'),
  },
  inputDisabled: {
    color: Colors.disabled,
  },
  rowIcon: { left: -6 },
});
