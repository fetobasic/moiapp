import React, { useState } from 'react';
import { View, KeyboardAvoidingView, Keyboard, Text, StyleSheet } from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';

import { Button, HeaderSimple as Header, TextInput } from 'App/Components';

import { ApplicationStyles, Colors, Metrics, isIOS } from 'App/Themes';
import { SettingsStackParamList } from 'App/Types/NavigationStackParamList';
import { useAppDispatch } from 'App/Hooks';
import { showInfo } from 'App/Services/Alert';
import { devicesActions } from 'App/Store/Devices';
import { isLegacyYeti } from 'App/Services/Yeti';
import { update } from 'App/Services/ConnectionControler';
import ValidationErrorList from 'App/Components/ValidationErrorList';

type Props = NativeStackScreenProps<SettingsStackParamList, 'ChangeName'>;

function ChangeName({ route, navigation }: Props) {
  const { device } = route.params;
  const dispatch = useAppDispatch();

  const [name, setName] = useState(device?.name || '');
  const [isLoading, setIsLoading] = useState(false);
  const isBtnDisabled = name === device.name;

  const handleChangeName = (skipModal?: boolean) => {
    // Check for empty name
    if (/^\s*$/.test(name)) {
      showInfo("Name can't be empty");
      return;
    }

    const showModal = () =>
      showInfo(
        <Text>
          Your Goal Zero device was renamed from “<Text style={styles.name}>{device.name}</Text>” to "
          <Text style={styles.name}>{name}</Text>".
        </Text>,
        'Renamed!',
        () => navigation.goBack(),
      );

    Keyboard.dismiss();
    setIsLoading(true);

    const desired = isLegacyYeti(device.thingName || '') ? { name } : { identity: { lbl: name } };

    dispatch(
      devicesActions.devicesChangeName({
        thingName: device.thingName || '',
        name,
        cb: () => {
          setIsLoading(false);

          if (skipModal) {
            navigation.goBack();
          } else {
            showModal();
          }
        },
      }),
    );

    // send request to Direct or AWS API
    // @ts-ignore TODO: `update` function signature must be refactored with complex and recursive Partial stateObject
    update({
      thingName: device.thingName || '',
      method: 'device',
      stateObject: { state: { desired } },
      isDirectConnection: Boolean(device.isDirectConnection),
    });
  };

  return (
    <View style={ApplicationStyles.mainContainer}>
      <Header title="Name" isChangeSaved={!isBtnDisabled} cbSave={() => handleChangeName(true)} />
      <KeyboardAvoidingView style={styles.container} behavior={isIOS ? 'padding' : 'height'}>
        <View style={[ApplicationStyles.section, styles.container]}>
          <TextInput
            focused
            placeholder="Device Name"
            value={name}
            onChangeText={setName}
            returnKeyType="go"
            maxLength={32}
          />
          <ValidationErrorList style={styles.validation} errorList={['Max 32 Characters']} />
        </View>
        <Button
          testID="saveBtn"
          style={styles.saveBtn}
          title="SAVE"
          showLoading={isLoading}
          onPress={handleChangeName}
          disabled={isBtnDisabled}
          inverse={isBtnDisabled}
        />
      </KeyboardAvoidingView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  name: {
    color: Colors.green,
  },
  validation: {
    paddingHorizontal: Metrics.halfMargin,
    marginBottom: Metrics.marginSection,
  },
  saveBtn: {
    marginHorizontal: Metrics.marginSection,
    marginVertical: Metrics.bigMargin,
  },
});

export default ChangeName;
