import { Dimensions } from 'react-native';
import { isIOS } from './Platforms';

const { width: screenWidth, height: screenHeight } = Dimensions.get('window');

// Used via Metrics.baseMargin
const metrics = {
  bigMargin: 32,
  baseMargin: 24,
  halfMargin: 12,
  smallMargin: 8,
  marginSection: 16,
  navBarHeight: 60,
  screenWidth: screenWidth < screenHeight ? screenWidth : screenHeight,
  screenHeight: screenWidth < screenHeight ? screenHeight : screenWidth,
  marginVertical: 10,

  // OLD METRICS
  // Remove these when we're done
  historyHeight: 60,
  buttonRadius: 4,
  batteryRadius: 8,
  orderButtonRadius: 18,
  historyChart: {
    width: screenWidth - 32,
    height: 300,
  },
  icons: {
    tiny: 15,
    small: 22.5,
    help: 27,
    medium: 30,
    close: 35,
    large: 45,
    xl: 50,
    yeti: {
      height: 46.5,
      width: 64.5,
    },
    pairingYeti: {
      height: 103,
      width: 145.5,
    },
    v12: {
      height: isIOS ? 42 : 39.5,
      width: isIOS ? 52 : 49.7,
    },
    v120: {
      height: 36.5,
      width: 36.5,
    },
    usb: {
      height: 20,
      width: 47.5,
    },
    back: {
      height: 25,
      width: 25,
    },
    yetiIconNotActiveBig: {
      height: 144,
      width: 203,
    },
    yetiTurnOn: {
      height: 180,
      width: 328,
    },
    yetiConnectToPhone: {
      height: 76,
      width: 243,
    },
    wifi: {
      height: 126,
      width: 126,
    },
    wifiIcon: {
      height: 24,
      width: 24,
    },
    bigWifiIcon: {
      height: 64,
      width: 78,
    },
    add: {
      height: 54.5,
      width: 55,
    },
    charging: {
      height: 55,
      width: 50,
    },
    trashIcon: {
      height: 25,
      width: 20,
    },
    updateIcon: {
      height: 24,
      width: 20,
    },
    wifiLevelIcon: {
      height: 17,
      width: 20,
    },
    selectConnect: {
      height: 70,
      width: 273,
    },
    directConnectIcon: {
      height: 33,
      width: 32,
    },
    anywhereConnectIcon: {
      height: 33,
      width: 30,
    },
    wifiButton: {
      height: 15.55,
      width: 22,
    },
    bluetoothButton: {
      height: 20,
      width: 12.71,
    },
    notification: {
      height: 20,
      width: 16.4,
    },
    notificationNew: {
      height: 24,
      width: 24.6,
    },
    settings: {
      height: 20,
      width: 20,
    },
    yetiPlaceholder: {
      height: 77.57,
      width: 111.72,
    },
    port: {
      height: 64,
      width: 64,
    },
    eye: {
      width: 24,
      height: 24,
    },
    information: {
      width: 24,
      height: 24,
    },
    warning: {
      width: 24,
      height: 24,
    },
  },
  images: {
    small: 20,
    medium: 40,
    large: 60,
    spiner: 100,
    logo: {
      height: 40,
      width: 200,
    },
    yetiInterface: {
      height: 152,
      width: 328,
    },
    yetiMainPage: {
      height: 128,
      width: 128,
    },
    yetiDevicesHub: {
      height: 90,
    },
  },
};

export default metrics;
