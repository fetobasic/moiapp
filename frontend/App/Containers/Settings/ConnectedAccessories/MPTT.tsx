import React from 'react';
import { StyleSheet, View } from 'react-native';
import { ApplicationStyles, Colors, Metrics } from 'App/Themes';
import { HeaderSimple as Header, InformationRow as Row } from 'App/Components';
import MPTTIcon from 'App/Images/Icons/MPPT.svg';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { SettingsStackParamList } from 'App/Types/NavigationStackParamList';
import { YetiState } from 'App/Types/Yeti';

type Props = NativeStackScreenProps<SettingsStackParamList, 'Mptt'>;

const Mptt = ({ route }: Props) => {
  const device = route.params.device as YetiState;

  return (
    <View style={ApplicationStyles.mainContainer}>
      <Header title="MPPT" />
      <View style={styles.container}>
        <Row
          style={styles.infoRow}
          textStyle={styles.textStyle}
          title="MPPT"
          addLeftIcon={<MPTTIcon color={Colors.white} />}
          subTitle="The MPPT connection is shown when a MPPT is detected on the expansion port."
          trimSubTitle={false}
        />
        <Row
          title="Firmware Version"
          subTitle="Updated by Yeti."
          description={`Version ${device?.foreignAcsry?.firmwareVersion || 0}`}
        />
      </View>
    </View>
  );
};

export default Mptt;

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: Metrics.baseMargin,
    paddingVertical: Metrics.marginSection,
  },
  infoRow: {
    marginTop: Metrics.halfMargin,
  },
  textStyle: {
    marginLeft: 10,
  },
});
