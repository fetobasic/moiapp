import React, { useState } from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import DeviceInfo from 'react-native-device-info';
import { useDispatch } from 'react-redux';

import awsConf from 'aws/aws-config';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { HeaderSimple as Header, Pressable, InformationRow as Row, SwitchRow } from 'App/Components';
import { ApplicationStyles, Colors, Fonts, Metrics } from 'App/Themes';
import { HomeStackParamList } from 'App/Types/NavigationStackParamList';
import { openLink } from 'App/Services/Linking';
import DeviceIcon from 'App/Images/Icons/phoneDevice.svg';
import CrossIcon from 'App/Images/Icons/cross.svg';
import SecretSettings from './SecretSettings';
import openBrowser from 'App/Services/Browser';
import Links from 'App/Config/Links';
import { isDev, isTest, isAlpha } from 'App/Config/AppConfig';
import { useAppSelector } from 'App/Hooks';
import { applicationActions } from 'App/Store/Application';
import { setToClipboard } from 'App/Services/Clipboard';

const PRESS_TIME = 5;

type Props = NativeStackScreenProps<HomeStackParamList, 'ApplicationSettings'>;

function ApplicationSettingsScreen({ navigation }: Props) {
  const [clickCount, setClickCount] = useState(0);
  const [showSecretView, setShowSecretView] = useState(false);

  const dispatch = useDispatch();
  const { isFileLoggerEnabled } = useAppSelector((state) => ({
    isFileLoggerEnabled: state.application.isFileLoggerEnabled,
  }));

  const handleVersionPress = () => {
    setToClipboard(DeviceInfo.getVersion());

    const updatedClickCount = clickCount + 1;
    setClickCount(updatedClickCount);

    if (updatedClickCount === PRESS_TIME) {
      setShowSecretView(true);
    }
  };

  const handleClosePress = () => {
    setShowSecretView(false);
    setClickCount(0);
  };

  const rows = [
    { title: 'Version', description: DeviceInfo.getVersion(), onPressText: handleVersionPress, useClipboard: true },
    { title: 'Units', onPress: () => navigation.navigate('Units') },
    {
      title: 'Rate the App',
      icon: <DeviceIcon />,
      onPress: () => openLink(Links.appReviewUrl),
    },
    { title: 'Terms and Conditions', onPress: () => openBrowser(Links.termsUrl) },
    { title: 'Privacy Policy', onPress: () => openBrowser(Links.privacyUrl) },
  ];

  const secretRows = [
    { title: 'Secret App Settings', iconSettings: { icon: <CrossIcon />, handlePress: handleClosePress } },
    { title: 'Build', description: DeviceInfo.getBuildNumber(), useClipboard: true },
    {
      title: 'Environment',
      description: awsConf.env,
      useClipboard: true,
    },
    { title: 'Phone ID', description: DeviceInfo.getUniqueIdSync(), style: styles.smallText, useClipboard: true },
  ];

  return (
    <SafeAreaView edges={['bottom']} style={ApplicationStyles.mainContainer}>
      <View style={ApplicationStyles.mainContainer}>
        <Header title="App Settings" />
        <ScrollView style={styles.container}>
          <View>
            {rows.map(({ title, icon, onPress, onPressText, description, useClipboard }) => (
              <Pressable key={title} onPress={onPressText}>
                <Row
                  skipClipboardValue
                  useClipboard={useClipboard}
                  title={title}
                  rightIcon={icon}
                  onPress={onPress}
                  description={description}
                  descriptionStyle={{ color: Colors.gray }}
                />
              </Pressable>
            ))}
            {(isDev || isTest || isAlpha) && (
              <View>
                <SwitchRow
                  title="File Logger"
                  value={isFileLoggerEnabled || false}
                  onChange={() => dispatch(applicationActions.changeFileLoggerState(!isFileLoggerEnabled))}
                />
                {isFileLoggerEnabled && <Row title="Logger Files" onPress={() => navigation.navigate('FileLogger')} />}
              </View>
            )}
          </View>
          <View style={styles.secretContainer}>{showSecretView && <SecretSettings rows={secretRows} />}</View>
        </ScrollView>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingVertical: Metrics.marginSection,
    paddingHorizontal: Metrics.baseMargin,
  },
  smallText: {
    ...Fonts.font.base.caption,
    opacity: 0.87,
  },
  secretContainer: {
    marginTop: Metrics.smallMargin,
  },
});

export default ApplicationSettingsScreen;
