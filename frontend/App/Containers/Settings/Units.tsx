import React, { useCallback, useEffect, useState } from 'react';
import { StyleSheet, ScrollView, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { NativeStackScreenProps } from '@react-navigation/native-stack';

import { Button, HeaderSimple as Header, RadioButtons, InfoRow } from 'App/Components';
import { ApplicationStyles, Colors, Fonts, Metrics } from 'App/Themes';
import SectionWithTitle from 'App/Components/SectionWithTitle';
import { TemperatureUnits } from 'App/Types/Units';
import { useAppDispatch, useAppSelector } from 'App/Hooks';
import { applicationActions } from 'App/Store/Application';
import { HomeStackParamList } from 'App/Types/NavigationStackParamList';
import renderElement from 'App/Services/RenderElement';

import Information from 'App/Images/Icons/information.svg';

type TemperatureItem = {
  value: TemperatureUnits;
  label: string;
};

const data: TemperatureItem[] = [
  {
    value: TemperatureUnits.fahrenheit,
    label: 'Fahrenheit ˚F',
  },
  {
    value: TemperatureUnits.celsius,
    label: 'Celsius ˚C',
  },
];

type Props = NativeStackScreenProps<HomeStackParamList, 'Units'>;

function UnitsScreen({ navigation }: Props) {
  const dispatch = useAppDispatch();

  const { temperature } = useAppSelector((state) => ({
    temperature: state.application.units?.temperature || TemperatureUnits.fahrenheit,
  }));

  const selectedVal = data.find(({ value: itemValue }) => itemValue === temperature);

  const [selectedTemperature, setSelectedTemperature] = useState<TemperatureItem | undefined>(selectedVal);

  useEffect(() => {
    setSelectedTemperature(selectedVal);
  }, [selectedVal]);

  const selectedValue = {
    value: selectedTemperature?.value || '',
    label: selectedTemperature?.label || '',
  };

  const handleChangeUnits = useCallback(({ value, label }: { value: string | number; label: string }) => {
    setSelectedTemperature({ value: value as TemperatureUnits, label });
  }, []);

  const handleSubmit = useCallback(() => {
    dispatch(applicationActions.setUnits({ temperature: selectedTemperature?.value as TemperatureUnits }));
    navigation.goBack();
  }, [dispatch, navigation, selectedTemperature]);

  return (
    <SafeAreaView edges={['bottom']} style={ApplicationStyles.loginContainer}>
      <Header title="Units" />
      <ScrollView style={styles.wrapper} contentContainerStyle={styles.scrollViewContent}>
        <View>
          <InfoRow
            withBorder={false}
            icon={renderElement(<Information />)}
            title="Choose how to show the temperature on this phone. Temperature is shown as ˚F. This does not change the functionality of your device(s)."
            titleTextStyles={styles.textInfo}
            subTitle={renderElement(
              <Text style={styles.textInfo}>
                <Text style={styles.textHighlight}>Note:</Text> The temperature setting on Alta Fridge devices will be
                mirrored in the app.
              </Text>,
            )}
          />
          <SectionWithTitle title="Temperature" containerStyle={styles.borderedContainer}>
            <RadioButtons hasBorder data={data} selectedValue={selectedValue} onChange={handleChangeUnits} />
          </SectionWithTitle>
        </View>
        <View>
          <Button style={styles.button} title="Save" onPress={handleSubmit} />
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollViewContent: { flexGrow: 1, justifyContent: 'space-between' },
  wrapper: {
    paddingHorizontal: Metrics.baseMargin,
    paddingBottom: Metrics.smallMargin,
  },
  borderedContainer: { marginHorizontal: 0 },
  button: {
    marginTop: Metrics.marginSection,
    marginBottom: Metrics.smallMargin,
  },
  textBody: {
    ...Fonts.font.base.bodyTwo,
    color: Colors.transparentWhite('0.87'),
  },
  textInfo: {
    ...Fonts.font.base.bodyOne,
    color: Colors.transparentWhite('0.87'),
  },
  textHighlight: {
    color: Colors.note,
  },
});

export default UnitsScreen;
