import React from 'react';
import { View, StyleSheet } from 'react-native';
import NotificationIcon from 'App/Images/Icons/notification.svg';
import NotificationFillIcon from 'App/Images/Icons/notificationFill.svg';
import SettingsIcon from 'App/Images/Icons/settings.svg';
import HelpIcon from 'App/Images/Icons/help.svg';
import { InformationRow as Row, Button } from 'App/Components';
import { DrawerNavigationHelpers } from '@react-navigation/drawer/src/types';
import { Colors, Metrics } from 'App/Themes';

export const menu = {
  connectNewDevice: { text: 'Connect new Device', route: 'StartPairing' },
  notifications: { text: 'Notifications', route: 'Notifications' },
  appSettings: { text: 'App Settings', route: 'ApplicationSettings' },
  help: { text: 'Help', route: 'Help' },
};

type Props = {
  navigation: DrawerNavigationHelpers;
  goToHelp: () => void;
  notificationsLength: number;
  isNewNotification: boolean;
};

function SidebarFooter({ notificationsLength, navigation, goToHelp, isNewNotification }: Props) {
  return (
    <View>
      <Row
        accessibilityLabel="Notifications"
        contentStyle={styles.rowContent}
        key={0}
        subTitle={menu.notifications.text}
        subTitleTextStyle={{ color: Colors.transparentWhite('0.87') }}
        addLeftIcon={isNewNotification ? <NotificationFillIcon /> : <NotificationIcon />}
        onPress={() => navigation.navigate(menu.notifications.route)}
        leftIconStyle={styles.leftIcon}
        descriptionIcon={
          !notificationsLength ? undefined : (
            <Button
              accessibilityLabel="NEW"
              style={styles.logInButton}
              mainSectionStyle={styles.logInButtonSection}
              height={32}
              title={`NEW ${notificationsLength > 99 ? '99+' : notificationsLength}`}
              onPress={() => navigation.navigate(menu.notifications.route)}
            />
          )
        }
      />
      <Row
        accessibilityLabel="App Settings"
        contentStyle={styles.rowContent}
        key={1}
        subTitle={menu.appSettings.text}
        subTitleTextStyle={{ color: Colors.transparentWhite('0.87') }}
        addLeftIcon={<SettingsIcon />}
        onPress={() => navigation.navigate(menu.appSettings.route)}
        leftIconStyle={styles.leftIcon}
      />
      <Row
        accessibilityLabel="Help"
        contentStyle={styles.rowContent}
        key={2}
        subTitle={menu.help.text}
        subTitleTextStyle={{ color: Colors.transparentWhite('0.87') }}
        addLeftIcon={<HelpIcon />}
        onPress={goToHelp}
        leftIconStyle={styles.leftIcon}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  rowContent: {
    height: 56,
    paddingVertical: 4,
    justifyContent: 'center',
  },
  leftIcon: {
    width: 32,
    height: 32,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: Metrics.smallMargin,
  },
  logInButton: {
    width: 80,
  },
  logInButtonSection: {
    paddingVertical: 5,
  },
});

export default SidebarFooter;
