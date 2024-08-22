import { useEffect, useRef } from 'react';
import { RootState, AppDispatch } from 'typesafe-actions';
import { TypedUseSelectorHook, useDispatch, useSelector } from 'react-redux';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';

import {
  HomeStackParamList,
  PairingStackParamList,
  DrawerStackParamList,
  SettingsStackParamList,
  LoginStackParamList,
} from 'App/Types/NavigationStackParamList';

export const useAppDispatch = (): any => useDispatch<AppDispatch>();
export const useAppSelector: TypedUseSelectorHook<RootState> = useSelector;
// eslint-disable-next-line react-hooks/exhaustive-deps
export const useMount = (func: any) => useEffect(() => func(), []);
export const usePrevious = <T>(value: T): T | undefined => {
  const ref = useRef<T>(value);
  useEffect(() => {
    ref.current = value;
  });
  return ref.current;
};

export const useHomeNavigation = (mainPage: keyof HomeStackParamList) =>
  useNavigation<StackNavigationProp<HomeStackParamList, typeof mainPage>>();
export const usePairingNavigation = (mainPage: keyof PairingStackParamList) =>
  useNavigation<StackNavigationProp<PairingStackParamList, typeof mainPage>>();
export const useDrawerNavigation = (mainPage: keyof DrawerStackParamList) =>
  useNavigation<StackNavigationProp<DrawerStackParamList, typeof mainPage>>();
export const useSettingsNavigation = (mainPage: keyof SettingsStackParamList) =>
  useNavigation<StackNavigationProp<SettingsStackParamList, typeof mainPage>>();
export const useLoginNavigation = (mainPage: keyof LoginStackParamList) =>
  useNavigation<StackNavigationProp<LoginStackParamList, typeof mainPage>>();
