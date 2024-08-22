import React, { useCallback, useEffect, useState } from 'react';
import { StyleSheet, ScrollView, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import renderElement from 'App/Services/RenderElement';
import { Button, CheckBox, HeaderSimple as Header, InfoRow } from 'App/Components';
import { ApplicationStyles, Colors, Fonts, Metrics } from 'App/Themes';
import { useAppDispatch, useAppSelector, useEvents } from 'App/Hooks';
import HelpIcon from 'App/Images/Icons/information.svg';
import { authActions } from 'App/Store/Auth';
import { modalInfo, showError } from 'App/Services/Alert';
import { navigate } from 'App/Navigation/AppNavigation';

const deleteItems = [
  { id: 1, text: 'My mobile device will be logged out and will no longer be cloud connected.' },
  { id: 2, text: 'I will no longer receive real time notifications.' },
  { id: 3, text: 'My products will remain cloud connected until factory reset.' },
  { id: 4, text: 'All of my Goal Zero app and website account information will be deleted.' },
];

function DeleteAccountScreen() {
  const dispatch = useAppDispatch();
  const { track, identify } = useEvents();

  const [inputIds, setInputIds] = useState<number[]>([]);

  const { isDeleteUserRequestSuccess, isDeleteUserLoading, deleteUserError } = useAppSelector((state) => ({
    isDeleteUserRequestSuccess: state.auth.deleteUserRequestSuccess,
    isDeleteUserLoading: state.auth.requests?.deleteUser,
    deleteUserError: state.auth.errors?.deleteUser,
  }));

  useEffect(() => {
    if (isDeleteUserRequestSuccess) {
      track('user_deleted');
      identify({ reset: true });

      modalInfo({
        title: 'Success!',
        body: 'Your account was deleted.',
        type: 'INFO',
        buttons: [
          {
            title: 'OK',
            action: () => {
              navigate('Home');
            },
          },
        ],
      });
    }
  }, [dispatch, identify, isDeleteUserRequestSuccess, track]);

  useEffect(() => {
    if (deleteUserError) {
      showError(deleteUserError);
    }
  }, [deleteUserError]);

  const handleDeleteAccount = useCallback(() => {
    if (inputIds.length === deleteItems.length) {
      dispatch(authActions.deleteUser.request());
    }
  }, [dispatch, inputIds.length]);

  const handleInput = (name: number, value: boolean) => {
    setInputIds((prevInput) => {
      if (value) {
        return [...prevInput, name];
      }
      return prevInput.filter((el) => el !== name);
    });
  };

  return (
    <SafeAreaView edges={['bottom']} style={ApplicationStyles.loginContainer}>
      <Header title="Delete Account" />
      <ScrollView style={styles.wrapper}>
        <InfoRow
          title=""
          withBorder={false}
          style={styles.infoRow}
          icon={renderElement(<HelpIcon />)}
          body={renderElement(
            <View>
              <Text style={styles.textBody}>Are you sure you want to delete your account?</Text>
              <Text style={styles.textListItem}>
                Check off the following information to confirm that you want to delete your account.
              </Text>
            </View>,
          )}
        />
        <View style={styles.containerContent}>
          {deleteItems.map(({ text, id }) => (
            <CheckBox
              key={id}
              hasBorder
              roundCheckbox
              value={inputIds.includes(id)}
              onPress={() => handleInput(id, !inputIds.includes(id))}
              body={renderElement(
                <View style={styles.container}>
                  <Text style={styles.textBody}>{text}</Text>
                </View>,
              )}
            />
          ))}
        </View>
        <InfoRow
          title=""
          withBorder={false}
          style={styles.infoRow}
          icon={renderElement(<HelpIcon />)}
          body={renderElement(
            <View>
              <Text style={styles.textListItem}>
                Create a new account anytime to enable all the cloud features we offer.
              </Text>
            </View>,
          )}
        />
        <View style={styles.containerContent}>
          <Button
            style={styles.button}
            inverse={inputIds.length !== deleteItems.length}
            disabled={inputIds.length !== deleteItems.length || isDeleteUserLoading}
            showLoading={isDeleteUserLoading && inputIds.length === deleteItems.length}
            title="Delete Account"
            onPress={handleDeleteAccount}
          />
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  wrapper: {
    paddingBottom: Metrics.smallMargin,
  },
  containerContent: {
    paddingHorizontal: Metrics.baseMargin,
  },
  infoRow: {
    paddingHorizontal: 12,
  },
  button: {
    marginTop: Metrics.marginSection,
  },
  inputs: { flex: 1 },
  footer: { flex: 1, justifyContent: 'flex-end' },
  textInput: {
    marginTop: Metrics.marginSection,
  },
  textBody: {
    ...Fonts.font.base.bodyTwo,
    color: Colors.transparentWhite('0.87'),
  },
  textListItem: { ...Fonts.font.base.bodyOne, color: Colors.transparentWhite('0.87') },
  textHighlight: {
    color: Colors.green,
  },
});

export default DeleteAccountScreen;
