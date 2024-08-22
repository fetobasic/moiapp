import React from 'react';
import { View, Text, StyleSheet, TextStyle } from 'react-native';
import { DrawerNavigationHelpers } from '@react-navigation/drawer/lib/typescript/src/types';

import { Pressable } from 'App/Components';
import { Colors, Fonts, Metrics } from 'App/Themes';
import { HomeStackParamList, DrawerStackParamList } from 'App/Types/NavigationStackParamList';

type Props = {
  navigation: DrawerNavigationHelpers;
  routeName: keyof DrawerStackParamList | keyof HomeStackParamList;
  icon: () => React.ReactElement;
  title: string;
  titleStyle?: TextStyle;
  value?: string | number;
  top?: boolean;
};

function DrawerItem(props: Props) {
  return (
    <View testID="drawerItem" style={[styles.container, props.top && styles.top]}>
      <Pressable
        testID="drawerItemPress"
        style={styles.sectionPressable}
        onPress={() => props.navigation.navigate(props.routeName)}>
        {props.icon()}
        <Text style={[styles.textTitle, props.titleStyle]}>{props.title}</Text>
        {props.value !== undefined && <Text style={styles.textValue}>{props.value}</Text>}
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    borderBottomColor: Colors.transparentWhite('0.12'),
    borderBottomWidth: 1,
  },
  top: {
    borderTopColor: Colors.transparentWhite('0.12'),
    borderTopWidth: 1,
  },
  sectionPressable: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: Metrics.marginSection,
  },
  textTitle: {
    flex: 1,
    ...Fonts.font.base.bodyTwo,
    paddingLeft: Metrics.halfMargin,
  },
  textValue: {
    ...Fonts.font.base.bodyTwo,
  },
});

export default DrawerItem;
