import React, { useEffect, useMemo } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { DrawerScreenProps } from '@react-navigation/drawer';

import { Header, HomeEmpty, HomeYeti, HomeFridge } from 'App/Components';
import { ApplicationStyles } from 'App/Themes';
import { HomeStackParamList } from 'App/Types/NavigationStackParamList';
import { useAppSelector } from 'App/Hooks';
import { getCurrentDevice } from 'App/Store/Devices/selectors';
import { applicationActions } from 'App/Store/Application';
import BluetoothService from 'App/Services/Bluetooth';
import { YetiState } from 'App/Types/Yeti';
import { FridgeState } from 'App/Types/Fridge';
import { getYetiThingName, isYetiThing } from 'App/Services/ThingHelper';
import { isFridge } from 'App/Hooks/useMapDrawerData';

export const Bluetooth = BluetoothService.init();

type Props = DrawerScreenProps<HomeStackParamList, 'Home'>;

function HomeScreen({ navigation, route }: Props) {
  const { devices, lastDevice } = useAppSelector((state) => ({
    devices: state.devicesInfo.data,
    lastDevice: state.application.lastDevice,
  }));
  const device = useSelector(getCurrentDevice(lastDevice || '')) || devices?.[0];
  const dispatch = useDispatch();
  const showMarketingVideo = !devices.length || route.params?.showMarketingVideo;

  useEffect(() => {
    dispatch(applicationActions.setLastDevice(device?.thingName || ''));
  }, [device.thingName, dispatch]);

  const renderBody = useMemo(() => {
    let renderInfo = null;
    let hideNotifications = false;
    const isDevicesEmpty = !devices || devices.length === 0 || !device?.thingName;

    if (showMarketingVideo || isDevicesEmpty) {
      renderInfo = (
        <View style={ApplicationStyles.flex}>
          <HomeEmpty hasDevices={devices && devices.length > 0} navigation={navigation} route={route} />
        </View>
      );
    } else if (isYetiThing(getYetiThingName(device))) {
      renderInfo = <HomeYeti {...(device as YetiState)} />;
    } else if (isFridge(device.deviceType)) {
      hideNotifications = true;
      renderInfo = <HomeFridge {...(device as FridgeState)} />;
    }

    return (
      <>
        <Header
          device={isDevicesEmpty ? undefined : device}
          showMarketingVideo={showMarketingVideo}
          hideNotifications={hideNotifications}
          onMenuPress={() => navigation.toggleDrawer()}
          onNotificationsPress={() => navigation.navigate('Notifications', { device })}
          onSettingsPress={() => navigation.navigate('Settings', { device })}
        />
        <View style={ApplicationStyles.flex}>{renderInfo}</View>
      </>
    );
  }, [device, devices, navigation, showMarketingVideo, route]);

  return (
    <SafeAreaView edges={['bottom']} style={ApplicationStyles.mainContainer}>
      {renderBody}
    </SafeAreaView>
  );
}

export default HomeScreen;
