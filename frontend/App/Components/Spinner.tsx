import React from 'react';
import { StyleSheet, ActivityIndicator, View } from 'react-native';
import { Colors } from 'App/Themes';

type Props = {
  visible: boolean;
};

function Spinner(props: Props) {
  if (!props.visible) {
    return null;
  }

  return (
    <View style={styles.container} testID="spinner">
      <ActivityIndicator size="large" color={Colors.green} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: Colors.transparentBlack('0.25'),
    justifyContent: 'center',
    alignItems: 'center',
  },
});

export default Spinner;
