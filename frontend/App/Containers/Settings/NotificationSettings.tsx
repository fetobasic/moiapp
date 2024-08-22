import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useSelector } from 'react-redux';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { SettingsStackParamList } from 'App/Types/NavigationStackParamList';

import { ApplicationStyles, Colors, Fonts, Metrics } from 'App/Themes';
import { Button, Switch, ExpandTile, HeaderSimple as Header, Pressable } from 'App/Components';
import renderElement from 'App/Services/RenderElement';
import Row from 'App/Components/Pairing/InfoRow';
import { useAppDispatch, useAppSelector, useEvents } from 'App/Hooks';
import { update } from 'App/Services/ConnectionControler';
import {
  LegacyYetiNotificationsGrouped,
  Y4000NotificationsGrouped,
  Y300500700NotificationsGrouped,
} from 'App/Config/Notifications';
import { isNotificationEnabled, toggleNotificationValue } from 'App/Services/Notifications';
import { devicesActions } from 'App/Store/Devices';
import { showConfirm } from 'App/Services/Alert';
import { navigationGoBack } from 'App/Navigation/AppNavigation';
import { getCurrentDevice } from 'App/Store/Devices/selectors';
import Information from 'App/Images/Icons/information.svg';
import WarningIcon from 'App/Images/NotificationIcons/warning.svg';
import CriticalIcon from 'App/Images/NotificationIcons/critical.svg';
import InformationNotificationIcon from 'App/Images/NotificationIcons/info.svg';
import {
  getYetiGeneration,
  getYetiThingName,
  isYeti300500700,
  isYeti6GThing,
  getYetiSize,
} from 'App/Services/ThingHelper';
import { Yeti6GState, YetiState } from 'App/Types/Yeti';
import { LegacyStoredNotificationType } from 'App/Types/Notification';
import { DeviceState } from 'App/Types/Devices';
import { useFeatureFlagWithPayload } from 'posthog-react-native';
import { env } from 'App/Config/AppConfig';

type Props = NativeStackScreenProps<SettingsStackParamList, 'NotificationSettings'>;
type YetiNotificationSectionKey =
  | keyof typeof LegacyYetiNotificationsGrouped
  | keyof typeof Y4000NotificationsGrouped
  | keyof typeof Y300500700NotificationsGrouped;

const NotificationSettings = ({ route }: Props) => {
  const dispatch = useAppDispatch();
  const { track } = useEvents();
  const deviceThingName = useMemo(() => getYetiThingName(route.params.device), [route.params.device]);
  const device: DeviceState = useSelector(getCurrentDevice(deviceThingName));
  const isYeti6G = useMemo(() => isYeti6GThing(deviceThingName), [deviceThingName]);
  const isYeti300500700Model = useMemo(() => isYeti300500700(device as Yeti6GState | YetiState), [device]);
  const initialEnabledNumber = useMemo(
    () => (!isYeti6G ? (device as YetiState)?.notify?.enabled || 0 : (device as Yeti6GState)?.config?.notify || [0, 0]),
    [device, isYeti6G],
  );

  const [currentEnabledNumber, setCurrentEnabledNumber] = useState(initialEnabledNumber);
  const changedNotifications = useRef<{ [type: string]: boolean }>({});

  const { isDirectConnection } = useAppSelector((state) => ({
    isDirectConnection: state.application.isDirectConnection,
  }));
  const isShowFirmwareUpdateNotifications = (device as Yeti6GState)?.isShowFirmwareUpdateNotifications;
  const [initIsShowFirmwareUpdate, setInitIsShowFirmwareUpdate] = useState(isShowFirmwareUpdateNotifications);
  const [isShowFirmwareUpdate, setIsShowFirmwareUpdate] = useState(initIsShowFirmwareUpdate);
  const [isHiddenNotificationsFeatureEnabled, hiddenNotifications = []] = useFeatureFlagWithPayload(
    `${env}-hidden-notifications`,
  );

  useEffect(() => {
    setInitIsShowFirmwareUpdate(isShowFirmwareUpdateNotifications);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    const cEnNumber = !isYeti6G
      ? (device as YetiState)?.notify?.enabled || 0
      : (device as Yeti6GState)?.config?.notify || [0, 0];

    setCurrentEnabledNumber(cEnNumber);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [(device as YetiState)?.notify?.enabled, (device as Yeti6GState)?.config?.notify, isYeti6G]);

  const Yeti6GNotificationsGrouped = isYeti300500700Model ? Y300500700NotificationsGrouped : Y4000NotificationsGrouped;
  const YetiNotifications = isYeti6G ? Yeti6GNotificationsGrouped : LegacyYetiNotificationsGrouped;
  // remove the notifications from the list of each group if their bit is listed in hiddenNotifications
  if (isHiddenNotificationsFeatureEnabled) {
    Object.keys(YetiNotifications).forEach((key) => {
      const group = YetiNotifications[key as YetiNotificationSectionKey];
      YetiNotifications[key as YetiNotificationSectionKey] = group.filter(
        (notification) =>
          !hiddenNotifications[getYetiSize(device)]?.includes(notification.value || -1) &&
          !hiddenNotifications[getYetiSize(device)]?.includes(-1),
      );
    });
  }

  const [expandedSections, setExpandedSections] = useState<Record<YetiNotificationSectionKey, boolean>>({
    CriticalNotifications: false,
    WarningNotifications: false,
    InformationNotifications: false,
  });

  const resetDefaultHandlerByType = useCallback(
    (type: YetiNotificationSectionKey) => {
      return () => {
        let enabledNumber = currentEnabledNumber;

        YetiNotifications[type].forEach((notification) => {
          if (notification.enabledByDefault && notification.typeId === LegacyStoredNotificationType.firmwareUpdate) {
            setIsShowFirmwareUpdate(true);
          } else {
            if (
              notification.enabledByDefault &&
              !isNotificationEnabled(enabledNumber, notification.value || 0, isYeti6G)
            ) {
              enabledNumber = toggleNotificationValue(enabledNumber, notification.value || 0, isYeti6G);

              changedNotifications.current[notification.typeId] = isNotificationEnabled(
                enabledNumber,
                notification.value || 0,
                isYeti6G,
              );
            }

            if (
              !notification.enabledByDefault &&
              isNotificationEnabled(enabledNumber, notification.value || 0, isYeti6G)
            ) {
              enabledNumber = toggleNotificationValue(enabledNumber, notification.value || 0, isYeti6G);

              changedNotifications.current[notification.typeId] = isNotificationEnabled(
                enabledNumber,
                notification.value || 0,
                isYeti6G,
              );
            }
          }
        });

        setCurrentEnabledNumber(enabledNumber);
      };
    },
    [YetiNotifications, currentEnabledNumber, isYeti6G],
  );

  const turnOnAllHandlerByType = useCallback(
    (type: YetiNotificationSectionKey) => {
      return () => {
        let enabledNumber = currentEnabledNumber;

        YetiNotifications[type].forEach((notification) => {
          if (notification.typeId === LegacyStoredNotificationType.firmwareUpdate) {
            setIsShowFirmwareUpdate(true);
          } else if (!isNotificationEnabled(enabledNumber, notification.value || 0, isYeti6G)) {
            enabledNumber = toggleNotificationValue(enabledNumber, notification.value || 0, isYeti6G);

            changedNotifications.current[notification.typeId] = isNotificationEnabled(
              enabledNumber,
              notification.value || 0,
              isYeti6G,
            );
          }
        });

        setCurrentEnabledNumber(enabledNumber);
      };
    },
    [YetiNotifications, currentEnabledNumber, isYeti6G],
  );

  const turnOffAllHandlerByType = useCallback(
    (type: YetiNotificationSectionKey) => {
      return () => {
        let enabledNumber = currentEnabledNumber;

        YetiNotifications[type].forEach((notification) => {
          if (notification.typeId === LegacyStoredNotificationType.firmwareUpdate) {
            setIsShowFirmwareUpdate(false);
          } else if (isNotificationEnabled(enabledNumber, notification.value || 0, isYeti6G)) {
            enabledNumber = toggleNotificationValue(enabledNumber, notification.value || 0, isYeti6G);
            changedNotifications.current[notification.typeId] = isNotificationEnabled(
              enabledNumber,
              notification.value || 0,
              isYeti6G,
            );
          }
        });

        setCurrentEnabledNumber(enabledNumber);
      };
    },
    [YetiNotifications, currentEnabledNumber, isYeti6G],
  );

  const toggleSectionCollapse = useCallback((sectionKey: YetiNotificationSectionKey) => {
    return () => {
      setExpandedSections((prev) => ({ ...prev, [sectionKey]: !prev[sectionKey] }));
    };
  }, []);

  const onSaveHandler = useCallback(() => {
    if (!isYeti6G) {
      dispatch(devicesActions.firmwareUpdateToggled({ thingName: deviceThingName, state: isShowFirmwareUpdate }));
    }

    const trackParams = {
      thingName: deviceThingName,
      model: device?.model,
      gen: getYetiGeneration(device?.thingName, device?.model),
    };

    Object.keys(changedNotifications.current).forEach((key) => {
      track('thing_notification_toggled', {
        ...trackParams,
        notificationType: key,
        enabled: changedNotifications.current[key],
      });
    });

    changedNotifications.current = {};

    update({
      thingName: getYetiThingName(device),
      stateObject: {
        state: {
          // @ts-expect-error TODO: we need to use complex and recursive Partial generic of stateObject type
          desired: isYeti6G
            ? {
                notify: currentEnabledNumber as number[],
              }
            : ({
                notify: {
                  enabled: currentEnabledNumber as number,
                },
              } as YetiState),
        },
      },
      isDirectConnection,
      updateDeviceState: (thingName, data) => dispatch(devicesActions.devicesAddUpdate.request({ thingName, data })),
      changeSwitchState: (thingName, state) => dispatch(devicesActions.blockAllNotifications({ thingName, state })),
      method: 'config',
    });

    navigationGoBack();
  }, [
    isYeti6G,
    track,
    deviceThingName,
    device,
    currentEnabledNumber,
    isDirectConnection,
    dispatch,
    isShowFirmwareUpdate,
  ]);

  const notifications = [
    {
      sectionTitle: 'Critical Notifications',
      key: 'CriticalNotifications' as YetiNotificationSectionKey,
      icon: (
        <View style={styles.iconWrapper}>
          <CriticalIcon />
        </View>
      ),
      titleColor: Colors.portError,
      sectionDescription: 'System critical events that may require immediate attention.',
      rows: YetiNotifications.CriticalNotifications,
      expanded: expandedSections.CriticalNotifications,
      handlers: true,
      resetDefaultHandler: resetDefaultHandlerByType('CriticalNotifications'),
      turnOnAllHandler: turnOnAllHandlerByType('CriticalNotifications'),
      turnOffAllHandler: () => {
        const isAnyCriticalNotificationsEnabled = YetiNotifications.CriticalNotifications.some((notification) =>
          isNotificationEnabled(currentEnabledNumber, notification.value || 0, isYeti6G),
        );

        if (isAnyCriticalNotificationsEnabled) {
          showConfirm(
            'Critical Notifications',
            'To stay informed of critical events, Critical Notifications are recommended. Are you sure you want to disable all notifications?',
            turnOffAllHandlerByType('CriticalNotifications'),
            {
              cancelTitle: 'Cancel',
              confirmTitle: 'Turn off all',
            },
            () => {},
            true,
          );
        }
      },
    },
    {
      sectionTitle: 'Warning Notifications',
      key: 'WarningNotifications' as YetiNotificationSectionKey,
      icon: (
        <View style={styles.iconWrapper}>
          <WarningIcon />
        </View>
      ),
      titleColor: Colors.portWarning,
      sectionDescription: 'Important events that, if left unattended, may lead to critical events.',
      rows: YetiNotifications.WarningNotifications,
      expanded: expandedSections.WarningNotifications,
      handlers: true,
      resetDefaultHandler: resetDefaultHandlerByType('WarningNotifications'),
      turnOnAllHandler: turnOnAllHandlerByType('WarningNotifications'),
      turnOffAllHandler: turnOffAllHandlerByType('WarningNotifications'),
    },
    {
      sectionTitle: 'Information Notifications',
      key: 'InformationNotifications' as YetiNotificationSectionKey,
      icon: (
        <View style={styles.iconWrapper}>
          <InformationNotificationIcon />
        </View>
      ),
      titleColor: Colors.blue,
      sectionDescription: 'General useful information about your device and its operation.',
      rows: YetiNotifications.InformationNotifications,
      expanded: expandedSections.InformationNotifications,
      handlers: true,
      resetDefaultHandler: resetDefaultHandlerByType('InformationNotifications'),
      turnOnAllHandler: turnOnAllHandlerByType('InformationNotifications'),
      turnOffAllHandler: turnOffAllHandlerByType('InformationNotifications'),
    },
  ];

  const isEqualsEnabledNumber =
    JSON.stringify(currentEnabledNumber) === JSON.stringify(initialEnabledNumber) &&
    initIsShowFirmwareUpdate === isShowFirmwareUpdate;

  return (
    <View style={ApplicationStyles.mainContainer}>
      <Header title="Notification Settings" cbSave={onSaveHandler} isChangeSaved={!isEqualsEnabledNumber} />
      <ScrollView style={ApplicationStyles.flex} contentContainerStyle={styles.scrollViewContent}>
        <Row
          withBorder={false}
          style={styles.description}
          icon={renderElement(<Information />)}
          sectionTextStyle={styles.sectionMain}
          body={renderElement(
            <View>
              <Text style={styles.textDescription}>
                Select the push and in-app notifications you'd like to receive from "
                <Text style={styles.note}>{device?.name}</Text>".
              </Text>
              <Text style={styles.textDescription}>
                <Text style={styles.warn}>Note:</Text> Notifications only apply when Cloud Connected
              </Text>
            </View>,
          )}
        />

        <View style={styles.rowsWrapper}>
          {notifications.map((section) => (
            <ExpandTile
              key={section.key}
              leftIcon={renderElement(<View>{section.icon}</View>)}
              title={renderElement(
                <Text style={[styles.title, { color: section.titleColor }]}>{section.sectionTitle}</Text>,
              )}
              subTitle={renderElement(<Text style={styles.subTitle}>{section.sectionDescription}</Text>)}
              expanded={section.expanded}
              onPress={toggleSectionCollapse(section.key)}
              toggleCollapse={toggleSectionCollapse(section.key)}
              contentStyle={styles.expandTileContent}
              style={styles.sectionContainer}
              paddingVertical={Metrics.halfMargin}>
              <View>
                {section.handlers && (
                  <View style={styles.sectionHandlers}>
                    <Pressable onPress={section.turnOffAllHandler}>
                      <Text style={styles.controlsText}>Turn off all</Text>
                    </Pressable>
                    <Pressable onPress={section.turnOnAllHandler}>
                      <Text style={styles.controlsText}>Turn on all</Text>
                    </Pressable>
                    <Pressable onPress={section.resetDefaultHandler}>
                      <Text style={styles.controlsText}>Reset default</Text>
                    </Pressable>
                  </View>
                )}
                {section.rows.map((row) => (
                  <View key={row.title}>
                    <View style={styles.divider} />

                    <View style={styles.switchContainer}>
                      <View style={styles.switchTitle}>
                        <Text numberOfLines={1} style={styles.rowTitle}>
                          {row.title}
                        </Text>
                      </View>
                      <Switch
                        value={
                          row.typeId === LegacyStoredNotificationType.firmwareUpdate
                            ? Boolean(isShowFirmwareUpdate)
                            : isNotificationEnabled(currentEnabledNumber, row.value || 0, isYeti6G)
                        }
                        onPress={() => {
                          if (row.typeId === LegacyStoredNotificationType.firmwareUpdate) {
                            setIsShowFirmwareUpdate(!isShowFirmwareUpdate);
                          } else {
                            const enabled = toggleNotificationValue(currentEnabledNumber, row.value || 0, isYeti6G);
                            changedNotifications.current[row.typeId] = isNotificationEnabled(
                              enabled,
                              row.value || 0,
                              isYeti6G,
                            );

                            setCurrentEnabledNumber(enabled);
                          }
                        }}
                      />
                    </View>
                  </View>
                ))}
              </View>
            </ExpandTile>
          ))}
        </View>
      </ScrollView>
      <Button
        style={styles.button}
        title="SAVE"
        disabled={isEqualsEnabledNumber}
        inverse={isEqualsEnabledNumber}
        textTitleInverseColor={isEqualsEnabledNumber ? Colors.gray : Colors.background}
        onPress={onSaveHandler}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  scrollViewContent: {
    paddingBottom: Metrics.bigMargin,
  },
  description: {
    marginHorizontal: Metrics.marginSection,
  },
  expandTileContent: { paddingBottom: Metrics.smallMargin },
  textDescription: {
    ...Fonts.font.base.bodyOne,
    marginLeft: Metrics.halfMargin,
  },
  sectionMain: {
    paddingLeft: 0,
  },
  note: {
    color: Colors.green,
  },
  warn: {
    color: Colors.portWarning,
  },
  title: {
    marginTop: 3,
    ...Fonts.font.base.bodyTwo,
  },
  subTitle: {
    ...Fonts.font.base.caption,
  },
  rowsWrapper: {
    marginHorizontal: Metrics.marginSection,
  },
  button: {
    paddingHorizontal: Metrics.marginSection,
    paddingVertical: Metrics.smallMargin,
    marginBottom: Metrics.baseMargin,
  },
  divider: {
    height: 1,
    marginVertical: Metrics.halfMargin,
    marginHorizontal: -Metrics.baseMargin,
    backgroundColor: Colors.border,
  },
  rowTitle: {
    ...Fonts.font.base.bodyTwo,
    marginRight: Metrics.smallMargin,
  },
  controlsText: {
    ...Fonts.font.base.button,
    marginHorizontal: Metrics.smallMargin,
    color: Colors.green,
    fontSize: 12,
  },
  sectionContainer: {
    padding: 2,
  },
  sectionHandlers: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: Metrics.marginSection,
    marginBottom: Metrics.smallMargin,
  },
  switchTitle: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    marginLeft: Metrics.smallMargin,
  },
  switchContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  iconWrapper: {
    width: 32,
    height: 32,
    justifyContent: 'center',
    alignItems: 'center',
  },
});

export default React.memo(NotificationSettings);
