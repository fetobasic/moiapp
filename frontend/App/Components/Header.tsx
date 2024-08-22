import React, { useMemo } from 'react';
import { View, Image, Text, StyleSheet } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import MenuIcon from 'App/Images/Icons/menu.svg';
import LostWiFiIcon from 'App/Images/Icons/wifi_off_small.svg';
import LostBluetoothIcon from 'App/Images/Icons/bluetoothOff.svg';
import LostDirectWiFiIcon from 'App/Images/Icons/wifiOffDirectConnected_small.svg';

import WiFiIconDirect from 'App/Images/Icons/wifiDirect.svg';
import WiFiIcon from 'App/Images/Icons/wifi.svg';
import BluetoothIcon from 'App/Images/Icons/bluetooth.svg';

import Pressable from 'App/Components/Pressable';
import { Colors, Fonts, Images, Metrics } from 'App/Themes';
import { isFridge } from 'App/Hooks/useMapDrawerData';
import LogoImg from 'App/Images/logo.svg';
import { useAppSelector } from 'App/Hooks';
import { DeviceState } from 'App/Types/Devices';

type Props = {
  device: DeviceState | undefined;
  hideNotifications?: boolean;
  onMenuPress: () => void;
  onNotificationsPress: () => void;
  onSettingsPress: () => void;
  showMarketingVideo?: boolean;
};

function Header({
  device,
  onMenuPress,
  onNotificationsPress,
  onSettingsPress,
  hideNotifications,
  showMarketingVideo = false,
}: Props) {
  const { notifications } = useAppSelector((state) => ({
    notifications: state.notification.notifications || [],
  }));
  const hasNewNotifications = !!notifications.find(
    (notification) => !notification.viewed && notification.thingName === device?.thingName,
  );

  const insets = useSafeAreaInsets();
  const isHideInfo = useMemo(() => !device || showMarketingVideo, [device, showMarketingVideo]);

  const renderConnectInfo = () => {
    if (isHideInfo || !device) {
      return null;
    }

    let textStatus = 'n/a';
    let iconStatus = null;
    if (device?.isDirectConnection || isFridge(device.deviceType)) {
      textStatus = 'Direct Connected';
      iconStatus = !device.isConnected ? LostBluetoothIcon : BluetoothIcon;
      if (device.dataTransferType === 'wifi') {
        textStatus = 'Wi-Fi Direct Connected';
        iconStatus = !device.isConnected ? LostDirectWiFiIcon : WiFiIconDirect;
      }
    } else {
      textStatus = 'Cloud Connected';
      iconStatus = !device.isConnected ? LostWiFiIcon : WiFiIcon;
    }

    return (
      <View style={styles.header}>
        {iconStatus &&
          React.createElement(iconStatus, { width: 16, height: 16, color: Colors.transparentWhite('0.87') })}
        <Text style={styles.textStatus}>{!device.isConnected ? 'Connection Lost' : textStatus}</Text>
      </View>
    );
  };

  return (
    <View style={[styles.container, { height: styles.container.height + insets.top }]}>
      <View style={styles.headerShadow}>
        <View style={styles.headerContainer}>
          <View style={styles.header}>
            <Pressable
              accessible={true}
              accessibilityLabel="Sidebar button"
              style={styles.menuIcon}
              onPress={onMenuPress}>
              <MenuIcon />
            </Pressable>

            <View style={styles.textSection}>
              {isHideInfo ? (
                <View accessible={true} accessibilityLabel="Header logo" style={styles.logo}>
                  <LogoImg />
                </View>
              ) : (
                <Text numberOfLines={1} style={styles.headerTitle}>
                  {device?.model || device?.name}
                </Text>
              )}
              {renderConnectInfo()}
            </View>
            {device && !showMarketingVideo && (
              <View style={[styles.buttonsSection, hideNotifications && styles.oneButton]}>
                {!hideNotifications && (
                  <Pressable style={styles.actionIconSection} onPress={onNotificationsPress}>
                    <Image
                      source={hasNewNotifications ? Images.notificationNew : Images.notification}
                      style={hasNewNotifications ? styles.notificationNewIcon : styles.notificationIcon}
                    />
                  </Pressable>
                )}

                <Pressable style={styles.actionIconSection} onPress={onSettingsPress}>
                  <Image source={Images.settings} style={styles.settingsIcon} />
                </Pressable>
              </View>
            )}
          </View>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    height: 70,
    width: Metrics.screenWidth,
    marginBottom: Metrics.smallMargin,
    zIndex: 1,
  },
  headerShadow: {
    bottom: 0,
    height: '100%',
    borderBottomRightRadius: 25,
    borderBottomLeftRadius: 25,
    width: Metrics.screenWidth,
    elevation: 7,
    shadowOpacity: 0.7,
    shadowRadius: 5,
    shadowColor: Colors.black,
    shadowOffset: {
      width: 0,
      height: 4,
    },
  },
  headerContainer: {
    ...StyleSheet.absoluteFillObject,
    bottom: 5,
    flexDirection: 'row',
    width: Metrics.screenWidth,
    paddingHorizontal: Metrics.baseMargin,
    borderBottomRightRadius: 25,
    borderBottomLeftRadius: 25,
    backgroundColor: Colors.background,
    alignItems: 'flex-end',
    paddingBottom: Metrics.halfMargin,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  menuIcon: {
    width: 40 + Metrics.baseMargin,
  },
  textSection: {
    flex: 1,
  },
  headerTitle: {
    color: 'white',
    fontSize: 20,
    lineHeight: 32,
    textAlign: 'center',
    fontWeight: '500',
    fontFamily: Fonts.type.condensed,
    paddingHorizontal: Metrics.marginSection,
  },
  headerSubtitle: {
    color: Colors.transparentWhite('0.87'),
    fontSize: 12,
    lineHeight: 16,
    textAlign: 'center',
    fontWeight: '300',
  },
  buttonsSection: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: 40 + Metrics.baseMargin,
  },
  oneButton: {
    justifyContent: 'flex-end',
  },
  actionIconSection: {
    justifyContent: 'center',
  },
  notificationIcon: {
    ...Metrics.icons.notification,
  },
  notificationNewIcon: {
    ...Metrics.icons.notificationNew,
  },
  settingsIcon: {
    ...Metrics.icons.settings,
  },
  textStatus: {
    ...Fonts.font.base.caption,
    color: Colors.transparentWhite('0.87'),
    marginLeft: Metrics.smallMargin,
  },
  logo: {
    paddingHorizontal: Metrics.baseMargin,
    marginBottom: Metrics.marginVertical,
  },
});

export default Header;
