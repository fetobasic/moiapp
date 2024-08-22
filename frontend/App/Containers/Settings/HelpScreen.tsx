import React from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';
import { ApplicationStyles, Metrics } from 'App/Themes';
import { HeaderSimple as Header, InformationRow as Row } from 'App/Components';
import HelpIcon from 'App/Images/Icons/help.svg';
import MailIcon from 'App/Images/Icons/mail.svg';
import CallIcon from 'App/Images/Icons/call.svg';
import GroupIcon from 'App/Images/Icons/group.svg';
import InventoryIcon from 'App/Images/Icons/inventory.svg';
import LanguageIcon from 'App/Images/Icons/language.svg';
import { openLink } from 'App/Services/Linking';
import LINKS from 'App/Config/Links';

type Props = {
  navigation: any;
};

const HelpScreen = ({ navigation }: Props) => {
  const rows = [
    { title: 'Pairing Mode', onPress: () => navigation.navigate('PairingMode') },
    { title: 'App Help Guide', icon: <HelpIcon />, onPress: () => openLink(LINKS.appHelpGuide) },
    { title: 'Email Us', icon: <MailIcon />, onPress: () => navigation.navigate('EmailUs') },
    { title: 'Call Us', icon: <CallIcon />, onPress: () => openLink(LINKS.goalZeroSupportPhone) },
    { title: 'Join Our Online Community', icon: <GroupIcon />, onPress: () => openLink(LINKS.goalZeroOnlineCommunity) },
    { title: 'Register Product', icon: <InventoryIcon />, onPress: () => openLink(LINKS.goalZeroProductRegistration) },
    { title: 'Visit Our Site', icon: <LanguageIcon />, onPress: () => openLink(LINKS.goalZeroHome) },
  ];

  return (
    <View style={ApplicationStyles.mainContainer}>
      <Header title="Help" />
      <ScrollView style={styles.container}>
        {rows.map(({ title, icon, onPress }) => (
          <Row
            testID={`press_${title.replace(/ /g, '')}`}
            key={title}
            title={title}
            rightIcon={icon}
            onPress={onPress}
          />
        ))}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingVertical: Metrics.marginSection,
    paddingHorizontal: Metrics.baseMargin,
  },
});

export default HelpScreen;
