import { SubjectType, YetiType } from 'App/Types/FeedbackForm';
import { BluetoothDevice } from './BluetoothDevices';
import { ConnectionType, DataTransferType } from './ConnectionType';
import { DeviceState, DeviceType } from './Devices';
import { DeviceListType } from './PairingType';

export type DrawerStackParamList = {
  HomeNav: {
    device: DeviceState;
  };
  UpdateFirmware: { isUpdateAttention: boolean; thingName: string; goBack?: () => void };
};

export type HomeStackParamList = {
  Home?: {
    device?: DeviceState;
    showMarketingVideo?: boolean;
  };
  StartPairing:
    | {
        reconnect: boolean;
        connectionType: ConnectionType;
        fromSettings?: boolean;
        initialRouteName?: string;
      }
    | undefined;
  UpdateFirmware: { thingName: string; isUpdateAttention: boolean; goBack?: () => void };
  Settings: { device: DeviceState };
  PortsInfo: { device: DeviceState };
  AccessoriesInfo: { device: DeviceState };
  BatteryScreen: { device: DeviceState };
  EnergyInfo: { device: DeviceState };
  ChargeProfile: { device: DeviceState };
  Notifications: { device: DeviceState; severityType?: string };
  FeedbackFormModal: {
    feedbackSubject: SubjectType;
    firmwareVersionFailed?: string;
    thingName?: string;
    yeti?: YetiType;
    navigateToTop?: boolean;
    rollback?: () => void;
  };
  ApplicationSettings: undefined;
  EditAccount: undefined;
  DeleteAccount: undefined;
  Units: undefined;
  ResetPassword: {
    content: {
      title: string;
      body: string;
      buttonText: string;
    };
  };
  HelpNav: undefined;
  TankPro: { device: DeviceState; tanksPro: Record<string, any> };
  TankBattery: { device: DeviceState; key: string };
  EmailUs: {
    device: DeviceState;
    feedbackSubject: SubjectType;
    firmwareVersionFailed?: string;
    thingName?: string;
    yeti?: YetiType;
  };
  LoginNav: {
    connectionType: ConnectionType;
    onSuccess?: (params?: any) => void;
    fromSettings?: boolean;
    goBackAfterLogin?: boolean;
  };
  ForgotPassword: {
    content: {
      title: string;
      body: string;
      buttonText: string;
    };
  };
  FileLogger: undefined;
};

export type HelpStackParamList = {
  Help: undefined;
  PairingMode: undefined;
  PairingModeHelp: { device: DeviceListType };
  EmailUs: {
    device: DeviceState;
    feedbackSubject: SubjectType;
    firmwareVersionFailed?: string;
    thingName?: string;
    yeti?: YetiType;
  };
};

export type SettingsStackParamList = {
  DeviceSettings: { device: DeviceState };
  ChangeName: { device: DeviceState };
  UpdateFirmware: { thingName: string; goBack?: () => void };
  Connection: { device: DeviceState };
  NotificationSettings: { device: DeviceState };
  BatteryScreen: { device: DeviceState };
  EnergyInfo: { device: DeviceState };
  ChargeProfile: { device: DeviceState };
  ACInputLimits: { device: DeviceState };
  AcChargeInputLimit: { device: DeviceState };
  ConnectedAccessories: { device: DeviceState };
  EscapeScreen: { device: DeviceState; escapeScreen: { id: string } };
  TankPro: { device: DeviceState; tanksPro: Record<string, any> };
  PowerInputLimit: { device: DeviceState };
  TankBattery: { device: DeviceState; key: string };
  SelectWifiNetwork: {
    device?: BluetoothDevice;
    connectionType: ConnectionType;
    dataTransferType: DataTransferType;
    deviceType?: DeviceType;
    navigateTo?: string;
    fromSettings?: boolean;
    onSuccess?: (params?: any) => void;
    goBackAfterLogin?: boolean;
  };
  EnterWifiPassword: {
    device?: BluetoothDevice;
    connectionType: ConnectionType;
    dataTransferType: DataTransferType;
    ssid: string;
    deviceType?: DeviceType;
    isConnectedScreen?: boolean;
  };
  Link: { device: DeviceState };
  Mptt: { device: DeviceState };
  Combiner: { device: DeviceState; id: string };
  CombinerStatus: { isYeti20004000: boolean };
  AcInputLimits: { thingName: string };
  InputLimitsHelp: undefined;
  AcCurrentLimitsHelp: undefined;
  AcProfileHelp: undefined;
  HelpNav: undefined;
  ErrorCodes: undefined;
  BatteryProtectionMode: undefined;
  ConnectYeti: {
    connectionType: ConnectionType;
    dataTransferType: DataTransferType;
    device?: Partial<BluetoothDevice & { thingName?: string }>;
    ssid?: string;
    wifiPassword?: string | null;
    deviceType?: DeviceType;
    skipConnectToWifi?: boolean;
    fromSettings?: boolean;
  };
  EmailUs: {
    device: DeviceState;
    feedbackSubject: SubjectType;
    firmwareVersionFailed?: string;
    thingName?: string;
    yeti?: YetiType;
  };
};

export type PairingStackParamList = {
  AddNewDevice?: { reconnect: boolean; connectionType: ConnectionType; goBackAfterLogin?: boolean };
  PairingModeHelp: { device: DeviceListType };
  PairingMode: undefined;
  BluetoothHelp: undefined;
  SelectConnect: {
    device?: BluetoothDevice;
    dataTransferType: DataTransferType;
    connectionType?: ConnectionType;
    deviceType?: DeviceType;
  };
  Connection: { device: DeviceState };
  ConnectYeti: {
    connectionType: ConnectionType;
    dataTransferType: DataTransferType;
    device?: Partial<BluetoothDevice & { thingName?: string }>;
    ssid?: string;
    wifiPassword?: string | null;
    deviceType?: DeviceType;
    skipConnectToWifi?: boolean;
    fromSettings?: boolean;
  };
  FindWifiNetwork: {
    device?: BluetoothDevice;
    connectionType: ConnectionType;
    dataTransferType: DataTransferType;
    deviceType?: DeviceType;
  };
  ChangeYetiWifiPassword: {
    device?: BluetoothDevice;
    connectionType: ConnectionType;
    dataTransferType: DataTransferType;
    deviceType?: DeviceType;
  };
  SelectWifiNetwork: {
    device?: BluetoothDevice;
    connectionType: ConnectionType;
    dataTransferType: DataTransferType;
    deviceType?: DeviceType;
    navigateTo?: string;
    fromSettings?: boolean;
    onSuccess?: (params?: any) => void;
    goBackAfterLogin?: boolean;
  };
  EnterWifiPassword: {
    device?: BluetoothDevice;
    connectionType: ConnectionType;
    dataTransferType: DataTransferType;
    ssid: string;
    deviceType?: DeviceType;
    isConnectedScreen?: boolean;
  };
  EnterNetworkManually?: {};
  HelpNav: undefined;
  LoginNav: {
    connectionType: ConnectionType;
    onSuccess?: (params?: any) => void;
    fromSettings?: boolean;
    goBackAfterLogin?: boolean;
  };
  UpdateFirmware: { isUpdateAttention: boolean; thingName: string; goBack?: () => void };
};

export type LoginStackParamList = {
  LogIn: {
    connectionType: ConnectionType;
    onSuccess?: (params?: any) => void;
    fromSettings?: boolean;
    goBackAfterLogin?: boolean;
  };
  ForgotPassword?: {
    content: {
      title: string;
      body: string;
      buttonText: string;
    };
  };
  CreateAccount: undefined;
};
