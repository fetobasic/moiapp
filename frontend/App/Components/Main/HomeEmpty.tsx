import React, { useEffect, useState } from 'react';
import { View, StyleSheet, Text } from 'react-native';
import Video from 'react-native-video';

import Pressable from 'App/Components/Pressable';
import { Metrics, Fonts, Colors, isIOS } from 'App/Themes';
import { Button } from 'App/Components';
import { menu } from 'App/Components/Sidebar';
import LINKS from 'App/Config/Links';
import { openLink } from 'App/Services/Linking';
import { useHomeNavigation } from 'App/Hooks';
import { DrawerScreenProps } from '@react-navigation/drawer';
import { HomeStackParamList } from 'App/Types/NavigationStackParamList';
import { useAppState } from '@react-native-community/hooks';

type Props = DrawerScreenProps<HomeStackParamList, 'Home'> & {
  hasDevices?: boolean;
};

function HomeEmpty({ navigation, hasDevices = false }: Props) {
  const homeNav = useHomeNavigation('StartPairing');
  const title = hasDevices ? 'My Devices' : menu.connectNewDevice.text;
  const currentAppState = useAppState();
  const [videoPaused, setVideoPaused] = useState(false);

  useEffect(() => {
    if (currentAppState === 'active') {
      setVideoPaused(false);
    } else {
      setVideoPaused(true);
    }
  }, [currentAppState]);

  return (
    <View testID="homeEmpty" style={styles.content}>
      {/* @ts-ignore */}
      <Video
        accessible={true}
        accessibilityLabel="Welcome Video"
        style={styles.videoPlayer}
        source={require('App/Videos/Welcome.mp4')}
        resizeMode="cover"
        repeat={true}
        muted={true}
        paused={videoPaused}
        ignoreSilentSwitch={'obey'}
        rate={1.0}
        /* TODO: iOS only uncomment when this is fixed: There seems to be a bug with this property causing the app to crash when switching
        from background to foreground few times while the video is playing.
        WORKAROUND: was to use the paused property with the useAppState hook to pause/play the video when the app is in the background/foreground.
        */
        //playWhenInactive={true}
      />
      <View accessible={true} accessibilityLabel="Footer Button" style={styles.moreInfoSection}>
        <Button
          testID="homeEmptyBtn"
          style={styles.footerButton}
          title={title}
          onPress={() => (hasDevices ? navigation.openDrawer() : homeNav.navigate('StartPairing'))}
        />
        <Pressable testID="homeEmptyBtnMore" style={styles.moreInfoButton} onPress={() => openLink(LINKS.goalZeroHome)}>
          <Text accessible={true} accessibilityLabel="SHOP NOW" style={styles.moreInfoText}>
            SHOP NOW
          </Text>
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  content: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  footerButton: {
    justifyContent: 'flex-end',
    marginBottom: 10,
  },
  moreInfoSection: {
    marginBottom: isIOS ? -5 : Metrics.smallMargin,
    padding: Metrics.baseMargin,
    justifyContent: 'flex-end',
  },
  moreInfoButton: {
    //margin: Metrics.marginSection,
    justifyContent: 'center',
    flexDirection: 'row',
  },
  moreInfoText: {
    ...Fonts.font.base.button,
    color: Colors.green,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  videoPlayer: {
    width: Metrics.screenWidth,
    height: Metrics.screenHeight,
    position: 'absolute',
    top: 0,
    left: 0,
    marginTop: -70,
  },
});

export default HomeEmpty;
