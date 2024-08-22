import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { NativeStackScreenProps } from '@react-navigation/native-stack';

import { Button, HeaderSimple as Header, InfoRow, Pressable, TextInputPassword } from 'App/Components';

import { ApplicationStyles, Colors, Fonts, Metrics } from 'App/Themes';
import { PairingStackParamList } from 'App/Types/NavigationStackParamList';
import renderElement from 'App/Services/RenderElement';

import WiFiIcon from 'App/Images/Icons/wifi.svg';
import { useAppDispatch, useAppSelector, usePairingNavigation, usePrevious } from 'App/Hooks';
import { yetiActions } from 'App/Store/Yeti';

type Props = NativeStackScreenProps<PairingStackParamList, 'ChangeYetiWifiPassword'>;

function ChangeYetiWifiPassword({ route }: Props) {
  const dispatch = useAppDispatch();
  const navigation = usePairingNavigation('ChangeYetiWifiPassword');
  const { inProgress, error } = useAppSelector((state) => ({
    inProgress: state.yetiInfo.passwordChange.inProgress,
    error: state.yetiInfo.passwordChange.error,
  }));

  const [password, setPassword] = useState('');
  const prevInProgress = usePrevious(inProgress);

  const isEmptyPassword = useMemo(() => password === '', [password]);

  const handleNextButton = useCallback(() => {
    if (isEmptyPassword) {
      navigation.navigate('SelectWifiNetwork', {
        ...route.params,
      });
    } else {
      dispatch(yetiActions.yetiSetPassword.request({ password }));
    }
  }, [dispatch, isEmptyPassword, navigation, password, route.params]);

  useEffect(() => {
    if (prevInProgress && !inProgress && !error) {
      navigation.navigate('SelectWifiNetwork', {
        ...route.params,
      });
    }
  }, [error, inProgress, navigation, prevInProgress, route.params]);

  return (
    <SafeAreaView edges={['bottom']} style={ApplicationStyles.mainContainer}>
      <Header
        title="Wi-Fi"
        rightSection={renderElement(
          <Pressable onPress={handleNextButton}>
            <Text style={styles.textHeaderRight}>{isEmptyPassword ? 'Skip' : 'Save'}</Text>
          </Pressable>,
        )}
      />
      <View style={ApplicationStyles.container}>
        <View style={ApplicationStyles.flex}>
          <InfoRow
            withBorder={false}
            icon={renderElement(<WiFiIcon />)}
            title="Change Password"
            body={renderElement(
              <Text style={styles.textBody}>
                You have already joined the Yeti's network. This step allows you to change the default{' '}
                <Text style={styles.textHighlightGreen}>GOALZERO</Text> to your own secure password.{'\n\n'}
                <Text style={styles.textHighlightYellow}>Note</Text>: Password must be at least 8 characters long
                consisting of numbers and letters.
              </Text>,
            )}
          />
          <TextInputPassword
            focused
            onSubmitEditing={handleNextButton}
            placeholder="Password"
            value={password}
            onChangeText={setPassword}
            returnKeyType="go"
          />
        </View>
        <Button title="Next" onPress={handleNextButton} />
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  textBody: {
    marginTop: Metrics.smallMargin,
    ...Fonts.font.base.bodyOne,
    color: Colors.transparentWhite('0.6'),
  },
  textHighlightGreen: {
    color: Colors.green,
  },
  textHighlightYellow: {
    color: Colors.severity.yellow,
  },
  textHeaderRight: {
    ...Fonts.font.base.subtitleOne,
    color: Colors.green,
  },
});

export default ChangeYetiWifiPassword;
