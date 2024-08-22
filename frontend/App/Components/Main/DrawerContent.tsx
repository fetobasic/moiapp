import React from 'react';
import { View, StyleSheet, FlatList } from 'react-native';
import { DrawerContentComponentProps } from '@react-navigation/drawer';
import { ApplicationStyles, Colors, Metrics } from 'App/Themes';
import LogoImg from 'App/Images/logo.svg';
import AccountCircleIcon from 'App/Images/Icons/accountCircle.svg';
import { useAppDispatch, useAppSelector, useMapDrawerData } from 'App/Hooks';
import { Button, InformationRow as Row } from 'App/Components';
import { MainDevice, SidebarFooter, EmptyRow, menu } from 'App/Components/Sidebar';
import { authActions } from 'App/Store/Auth';

function DrawerContent(props: DrawerContentComponentProps) {
  const { navigation } = props;
  const dispatch = useAppDispatch();

  const { notifications, devices, user } = useAppSelector((state) => ({
    devices: state.devicesInfo.data,
    notifications: state.notification.notifications || [],
    user: state.auth.user,
  }));
  const { email = '' } = user || {};

  const goToAccount = () => {
    if (email) {
      navigation.navigate('EditAccount');
    } else {
      dispatch(authActions.setSignInState(false));
      navigation.navigate('LoginNav');
    }
  };
  const goToWelcome = () => {
    navigation.navigate('Home', { showMarketingVideo: true });
  };

  const drawerData = useMapDrawerData(devices);

  return (
    <View style={ApplicationStyles.mainContainer}>
      <View style={styles.wrapper}>
        <View style={styles.sidebarTopSection}>
          <View accessible={true} accessibilityLabel="Goal Zero Logo" style={styles.logo}>
            <LogoImg onPress={goToWelcome} />
          </View>
          <Row
            accessibilityLabel="Account Name"
            subTitle={email || 'Account'}
            subTitleTextStyle={{ color: Colors.transparentWhite('0.87') }}
            leftIconStyle={styles.accountIcon}
            addLeftIcon={<AccountCircleIcon />}
            onPress={goToAccount}
            contentStyle={styles.accountContent}
            rightIcon={
              email ? undefined : (
                <Button
                  style={styles.logInButton}
                  mainSectionStyle={styles.logInButtonSection}
                  height={33}
                  title="LOG IN"
                  accessibilityLabel="LOG IN"
                  onPress={goToAccount}
                />
              )
            }
          />
          <SidebarFooter
            navigation={navigation}
            goToHelp={() => navigation.navigate('HelpNav')}
            notificationsLength={notifications.filter((notification) => !notification.viewed).length}
            isNewNotification={!!notifications.find((notification) => !notification.viewed)}
          />
        </View>
        <View style={styles.content}>
          <FlatList
            style={ApplicationStyles.flex}
            data={drawerData}
            keyExtractor={({ main: { thingName } }, ind) => `${thingName}-${ind}`}
            renderItem={({ item: { main, childDevices } }) => <MainDevice childDevices={childDevices} item={main} />}
            ListEmptyComponent={<EmptyRow />}
            ListFooterComponent={
              <Button
                inverse
                style={styles.footerButton}
                title={menu.connectNewDevice.text}
                accessibilityLabel="CONNECT NEW DEVICE"
                onPress={() => navigation.navigate(menu.connectNewDevice.route)}
              />
            }
          />
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    flex: 1,
    paddingTop: 56,
    paddingBottom: Metrics.marginSection,
    paddingHorizontal: 5,
  },
  sidebarTopSection: {
    marginBottom: Metrics.halfMargin,
  },
  logo: {
    paddingHorizontal: Metrics.baseMargin,
    marginBottom: Metrics.baseMargin,
  },
  accountIcon: {
    width: 32,
    height: 32,
    justifyContent: 'center',
    alignItems: 'center',
    alignSelf: 'center',
    marginRight: Metrics.smallMargin,
  },
  content: {
    flex: 1,
  },
  footerButton: {
    marginVertical: Metrics.halfMargin,
  },
  accountContent: {
    paddingVertical: 4,
    height: 56,
    justifyContent: 'center',
  },
  logInButton: {
    width: 88,
  },
  logInButtonSection: {
    paddingVertical: 6,
  },
});

export default DrawerContent;
