import React, { useMemo, useState, useRef, useEffect } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useSelector } from 'react-redux';
import { SwipeListView } from 'react-native-swipe-list-view';
import { formatDistanceToNow } from 'date-fns';

import { Button, HeaderSimple as Header, Pressable, Selector } from 'App/Components';
import SelectModal from 'App/Components/EnergyHistory/SelectModal';
import ModalRow from 'App/Components/EnergyHistory/ModalSelectRow';
import { ApplicationStyles, Colors, Fonts, Metrics, isIOS } from 'App/Themes';
import { useAppDispatch, useAppSelector, useMount } from 'App/Hooks';
import { notificationActions, notificationSelectors } from 'App/Store/Notification';
import { SeverityType, StoredNotification } from 'App/Types/Notification';
import { getSeverityColor, getSeverityIcon, getSeverityTitle } from 'App/Services/Notifications';
import { WithTopBorder } from 'App/Hoc';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { HomeStackParamList } from 'App/Types/NavigationStackParamList';
import { Yeti6GState } from 'App/Types/Yeti';
import CloseIcon from 'App/Images/Icons/close.svg';

type Props = NativeStackScreenProps<HomeStackParamList, 'Notifications'>;

const OPEN_VALUE_WIDTH = -80;

const NOTIFICATION_TYPE = [
  {
    name: 'Critical',
    type: SeverityType.ERROR,
  },
  {
    name: 'Warning',
    type: SeverityType.WARNING,
  },
  {
    name: 'Insight',
    type: SeverityType.NOTICE,
  },
  {
    name: 'Information',
    type: SeverityType.INFO,
  },
];

function NotificationsScreen({ route }: Props) {
  const dispatch = useAppDispatch();
  const { device, severityType } = route?.params || {};
  const { devices } = useAppSelector((state) => ({
    devices: state.devicesInfo.data?.filter((d) => d?.thingName || (d as Yeti6GState)?.device?.identity?.thingName),
  }));

  const [showFilterModal, setShowFilterModal] = useState(false);
  const [showTypeModal, setShowTypeModal] = useState(false);
  const [showClearAllModal, setShowClearAllModal] = useState(false);

  const initDevice = useMemo(
    () =>
      device?.thingName
        ? { [device?.thingName || '']: device?.name || device?.thingName || '' }
        : Object.fromEntries(devices.map((d) => [d.thingName, d.name || d.thingName || ''])),
    [device?.name, device?.thingName, devices],
  );

  const [selectedDevices, setSelectedDevices] = useState<{ [key: string]: string }>(initDevice);
  const [tempSelectedDevices, setTempSelectedDevices] = useState(selectedDevices);
  const selectedDevicesRef = useRef(new Set(Object.keys(selectedDevices)));

  const initNotificationTypes = useMemo(
    () =>
      severityType
        ? { [severityType]: NOTIFICATION_TYPE.find(({ type }) => type === severityType)?.name || '' }
        : Object.fromEntries(NOTIFICATION_TYPE.map((d) => [d.type, d.name])),
    [severityType],
  );

  const [selectedNotificationTypes, setSelectedNotificationTypes] = useState<{ [key: string]: string }>(
    initNotificationTypes,
  );

  const isFiltered = useMemo(
    () =>
      Object.keys(selectedDevices).length < devices.length ||
      Object.keys(selectedNotificationTypes).length < NOTIFICATION_TYPE.length,
    [devices.length, selectedDevices, selectedNotificationTypes],
  );

  const [tempSelectedNotificationTypes, setTempSelectedNotificationTypes] = useState(selectedNotificationTypes);

  const notificationsList = useSelector(
    notificationSelectors.getGroupedNotifications(Object.keys(selectedDevices), Object.keys(selectedNotificationTypes)),
  );

  const filterTitle = useMemo(() => {
    const selectedDevicesCount = Object.keys(selectedDevices).length;

    if (selectedDevicesCount === 0) {
      return 'None';
    }

    if (selectedDevicesCount === devices.length) {
      return 'Show All';
    }

    return Object.values(selectedDevices).join(', ');
  }, [devices.length, selectedDevices]);

  const notificationTypeTitle = useMemo(() => {
    const selectedNotificationTypesCount = Object.keys(selectedNotificationTypes).length;

    if (selectedNotificationTypesCount === 0) {
      return 'None';
    }

    if (selectedNotificationTypesCount === NOTIFICATION_TYPE.length) {
      return 'Show All';
    }

    return Object.values(selectedNotificationTypes).join(', ');
  }, [selectedNotificationTypes]);

  const isEmptyNotifications = useMemo(
    () => !notificationsList.unviewed.length && !notificationsList.viewed.length,
    [notificationsList.unviewed.length, notificationsList.viewed.length],
  );

  const sendNotificationsViewed = (things: string[]) => {
    if (things?.length > 0) {
      dispatch(notificationActions.notificationsViewed({ thingNames: things }));
    }
  };

  useEffect(() => {
    Object.keys(selectedDevices).forEach((thingName) => selectedDevicesRef.current.add(thingName));
  }, [selectedDevices]);

  useMount(() => {
    return () => {
      dispatch(
        notificationActions.notificationsViewed({
          thingNames: Array.from(selectedDevicesRef.current),
          markAll: !device?.thingName,
        }),
      );
    };
  });

  const renderRow = (item: StoredNotification) => (
    <View>
      <WithTopBorder
        containerStyle={styles.rowContainer}
        contentStyle={{ backgroundColor: getSeverityColor(item.severity) }}
        borderColor={Colors.white}
        smallPadding>
        <View style={styles.rowSection}>
          <View style={styles.rowIcon}>{getSeverityIcon(item.severity)}</View>
          <View style={styles.rowMainSection}>
            <Text style={styles.rowTextType}>{item.title || getSeverityTitle(item.severity)}</Text>
            <Text style={styles.rowTextDevice}>{item.thingName}</Text>
            <Text style={styles.rowTextMessage}>{item.message}</Text>
            <Text style={styles.rowTextDate}>{formatDistanceToNow(new Date(item.date))} ago</Text>
          </View>
        </View>
        <Pressable
          style={styles.sectionCloseNotificationIcon}
          onPress={() => dispatch(notificationActions.notificationRemove({ id: item.id }))}>
          <CloseIcon color={Colors.background} />
        </Pressable>
      </WithTopBorder>
      {!item.viewed && <View style={styles.dotNew} />}
    </View>
  );

  const renderEmpty = () =>
    (isEmptyNotifications && <Text style={styles.emptyText}>You don&apos;t have any notifications</Text>) || null;

  return (
    <SafeAreaView edges={[]} style={ApplicationStyles.mainContainer}>
      <Header title="Notifications" />
      <View style={styles.sectionSelectors}>
        <Selector
          containerStyle={styles.selectorLeft}
          style={styles.selectorInput}
          placeholder="Device"
          value=" "
          onPress={() => setShowFilterModal(true)}>
          <Text numberOfLines={1} style={styles.selectorText}>
            {filterTitle}
          </Text>
        </Selector>
        <Selector
          containerStyle={styles.selectorRight}
          style={styles.selectorInput}
          placeholder="Type"
          value=" "
          onPress={() => setShowTypeModal(true)}>
          <Text numberOfLines={1} style={styles.selectorText}>
            {notificationTypeTitle}
          </Text>
        </Selector>
      </View>
      <SwipeListView
        useSectionList
        disableLeftSwipe
        disableRightSwipe
        useNativeDriver={false}
        style={styles.list}
        keyExtractor={(item) => `${item.id}`}
        renderItem={({ item }) => renderRow(item)}
        sections={[
          { title: '', data: notificationsList.unviewed },
          { title: 'Read Notifications', data: notificationsList.viewed },
        ]}
        renderSectionHeader={({ section }) =>
          section.title && section.data.length ? <Text style={styles.sectionTitle}>{section.title}</Text> : null
        }
        ListFooterComponent={renderEmpty}
        rightOpenValue={OPEN_VALUE_WIDTH}
      />
      {!isEmptyNotifications && (
        <View style={styles.sectionClearNotifications}>
          <Button inverse title="Clear Notifications" onPress={() => setShowClearAllModal(true)} />
        </View>
      )}
      <SelectModal
        title="Device"
        skipCloseFunction
        isVisible={showFilterModal}
        onClose={() => {
          setTempSelectedDevices(selectedDevices);
          setShowFilterModal(false);
        }}
        onDone={() => {
          const notInTempSelectedDevices = Object.keys(selectedDevices).filter((key) => !tempSelectedDevices[key]);
          sendNotificationsViewed(notInTempSelectedDevices);
          setSelectedDevices(tempSelectedDevices);
          setShowFilterModal(false);
        }}>
        {devices.map((deviceItem) => (
          <ModalRow
            key={deviceItem.thingName}
            title={deviceItem.name || ''}
            selectedType="check"
            selectedValue={tempSelectedDevices[deviceItem.thingName || '']}
            onPress={() =>
              setTempSelectedDevices((prev) => {
                const _devices = { ...prev };
                const isExist = !!_devices[deviceItem.thingName || ''];

                if (isExist) {
                  delete _devices[deviceItem.thingName || ''];
                } else {
                  _devices[deviceItem.thingName || ''] = deviceItem.name || deviceItem.thingName || '';
                }
                return _devices;
              })
            }
          />
        ))}
      </SelectModal>
      <SelectModal
        title="Notification Type"
        skipCloseFunction
        isVisible={showTypeModal}
        onClose={() => {
          setTempSelectedNotificationTypes(selectedNotificationTypes);
          setShowTypeModal(false);
        }}
        onDone={() => {
          setSelectedNotificationTypes(tempSelectedNotificationTypes);
          setShowTypeModal(false);
        }}>
        {NOTIFICATION_TYPE.map((notificationType) => (
          <ModalRow
            key={notificationType.type}
            title={notificationType.name}
            selectedType="check"
            selectedValue={tempSelectedNotificationTypes[notificationType.type]}
            onPress={() =>
              setTempSelectedNotificationTypes((prev) => {
                const types = { ...prev };
                const isExist = !!types[notificationType.type];

                if (isExist) {
                  delete types[notificationType.type];
                } else {
                  types[notificationType.type] = notificationType.name;
                }

                return types;
              })
            }
            icon={<View style={[styles.colorInfo, { backgroundColor: getSeverityColor(notificationType.type) }]} />}
          />
        ))}
      </SelectModal>
      <SelectModal
        title="Clear Notifications"
        isVisible={showClearAllModal}
        doneText="Clear All"
        hideButtons={isFiltered}
        onClose={() => {
          setShowClearAllModal(false);
        }}
        onDone={() => {
          dispatch(notificationActions.notificationRemoveAll(null));
          setShowClearAllModal(false);
        }}>
        <Text style={styles.textClearAllModal}>
          {isFiltered
            ? 'Clear all notifications or only those displayed with the selected filters?'
            : 'Do you want to clear all your notification messages?'}
        </Text>
        {isFiltered && (
          <View>
            <Button
              height={40}
              style={styles.btnClearSection}
              mainSectionStyle={styles.btnClear}
              title="Clear Filtered"
              onPress={() => {
                dispatch(
                  notificationActions.notificationRemoveAll({
                    things: Object.keys(selectedDevices),
                    types: Object.keys(selectedNotificationTypes),
                  }),
                );
                setShowClearAllModal(false);
              }}
            />
            <Button
              height={40}
              style={styles.btnClearSection}
              mainSectionStyle={styles.btnClear}
              inverse
              title="Clear All"
              textTitleInverseColor={Colors.red}
              onPress={() => {
                dispatch(notificationActions.notificationRemoveAll(null));
                setShowClearAllModal(false);
              }}
            />
            <Button
              height={40}
              style={styles.btnClearSection}
              mainSectionStyle={styles.btnClear}
              inverse
              title="Cancel"
              onPress={() => setShowClearAllModal(false)}
            />
          </View>
        )}
      </SelectModal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  sectionSelectors: {
    flexDirection: 'row',
    marginTop: Metrics.marginSection,
    marginHorizontal: Metrics.baseMargin,
  },
  selectorLeft: {
    flex: 1,
    marginRight: 10,
  },
  selectorRight: {
    flex: 1,
    marginLeft: 10,
  },
  selectorInput: {
    height: 0,
    marginTop: isIOS ? 0 : -20,
  },
  selectorText: {
    ...Fonts.font.base.bodyOne,
    lineHeight: isIOS ? 16 : 20,
    paddingHorizontal: Metrics.halfMargin,
    marginRight: 25,
  },
  clearAllSection: {
    paddingVertical: Metrics.marginSection,
  },
  textClearAll: {
    ...Fonts.font.base.bodyOne,
    color: Colors.green,
  },
  textClearAllModal: {
    ...Fonts.font.base.bodyTwo,
    textAlign: 'center',
  },
  colorInfo: {
    width: 8,
    height: 16,
    borderRadius: 4,
  },
  sectionTitle: {
    ...Fonts.font.base.caption,
    color: Colors.transparentWhite('0.87'),
    paddingLeft: 36,
    marginBottom: Metrics.smallMargin,
    backgroundColor: Colors.background,
  },
  rowContainer: {
    marginHorizontal: Metrics.baseMargin,
  },
  list: {
    flex: 1,
    marginTop: Metrics.marginSection,
    marginBottom: Metrics.smallMargin,
  },
  emptyText: {
    ...Fonts.font.condensed.subtitleTwo,
    justifyContent: 'center',
    alignSelf: 'center',
  },
  rowMainSection: {
    marginLeft: Metrics.halfMargin,
  },
  rowSection: {
    flexDirection: 'row',
  },
  rowIcon: {
    paddingTop: 4,
    paddingLeft: 4,
  },
  rowTextType: {
    ...Fonts.font.base.bodyTwo,
    color: Colors.background,
  },
  rowTextDevice: {
    ...Fonts.font.base.bodyOne,
    color: Colors.background,
  },
  rowTextMessage: {
    ...Fonts.font.base.caption,
    color: Colors.background,
    paddingVertical: Metrics.halfMargin,
    paddingRight: Metrics.bigMargin,
  },
  rowTextDate: {
    ...Fonts.font.base.bodyOne,
    color: Colors.background,
  },
  dotNew: {
    position: 'absolute',
    top: 28,
    left: 8,
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: Colors.severity.red,
    shadowColor: Colors.severity.red,
    shadowOpacity: 0.4,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 4,
    elevation: 4,
  },
  sectionCloseNotificationIcon: {
    position: 'absolute',
    top: 0,
    right: 8,
    padding: Metrics.halfMargin,
  },
  sectionClearNotifications: {
    paddingHorizontal: Metrics.baseMargin * 2,
    paddingTop: Metrics.baseMargin,
    paddingBottom: Metrics.bigMargin,
    backgroundColor: Colors.background,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    shadowColor: Colors.black,
    shadowOpacity: 0.4,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 4,
    elevation: 4,
  },
  btnClearSection: {
    marginTop: Metrics.smallMargin,
  },
  btnClear: {
    paddingVertical: Metrics.smallMargin,
  },
});

export default NotificationsScreen;
