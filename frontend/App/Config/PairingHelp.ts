import { DeviceListType, DeviceTypes } from 'App/Types/PairingType';
import { Images } from 'App/Themes';

const YetiPRODeviceList: DeviceListType[] = [
  {
    label: 'Yeti PRO 4000',
    value: DeviceTypes.YETI4000,
    icon: Images.yetiDevice.yeti4000_front,
    panelInfo: Images.yetiDevice.yeti4000PanelInfo,
    width: 100,
  },
];

const Yeti300500700DeviceList: DeviceListType[] = [
  {
    label: 'Yeti 300',
    value: DeviceTypes.YETI300,
    icon: Images.yetiDevice.yeti300_front,
    panelInfo: Images.yetiDevice.yeti300500700PanelInfo,
    width: 75,
  },
  {
    label: 'Yeti 500',
    value: DeviceTypes.YETI500,
    icon: Images.yetiDevice.yeti500_front,
    panelInfo: Images.yetiDevice.yeti300500700PanelInfo,
    width: 85,
  },
  {
    label: 'Yeti 700',
    value: DeviceTypes.YETI700,
    icon: Images.yetiDevice.yeti700_front,
    panelInfo: Images.yetiDevice.yeti300500700PanelInfo,
  },
];

const Yeti100015002000DeviceList: DeviceListType[] = [
  {
    label: 'Yeti 1000',
    value: DeviceTypes.YETI1000,
    icon: Images.yetiDevice.yeti1000_front,
    panelInfo: Images.yetiDevice.yeti100015002000PanelInfo,
    width: 85,
  },
  {
    label: 'Yeti 1500',
    value: DeviceTypes.YETI1500,
    icon: Images.yetiDevice.yeti1500_front,
    panelInfo: Images.yetiDevice.yeti100015002000PanelInfo,
    width: 90,
  },
  {
    label: 'Yeti PRO 2000',
    value: DeviceTypes.YETI2000,
    icon: Images.yetiDevice.yeti2000_front,
    panelInfo: Images.yetiDevice.yeti100015002000PanelInfo,
    width: 95,
  },
];

const FridgeFreezerDeviceList: DeviceListType[] = [
  {
    label: 'Alta 50',
    value: DeviceTypes.ALTA50,
    icon: Images.fridgeDevice.alta50_front,
    panelInfo: Images.yetiDevice.alta50PanelInfo,
    width: 100,
  },
  {
    label: 'Alta 80',
    value: DeviceTypes.ALTA80,
    icon: Images.fridgeDevice.alta80_front,
    panelInfo: Images.yetiDevice.alta80PanelInfo,
    width: 120,
  },
];

const YetiXDeviceList: DeviceListType[] = [
  {
    label: 'Yeti 6000X',
    value: DeviceTypes.YETI6000X,
    icon: Images.yetiDevice.yeti6000X_front,
    panelInfo: Images.yetiDevice.yeti1400PanelInfo,
  },
  {
    label: 'Yeti 3000X',
    value: DeviceTypes.YETI3000X,
    icon: Images.yetiDevice.yeti3000X_front,
    panelInfo: Images.yetiDevice.yeti1400PanelInfo,
  },
  {
    label: 'Yeti 1500X',
    value: DeviceTypes.YETI1500X,
    icon: Images.yetiDevice.yeti1500X_front,
    panelInfo: Images.yetiDevice.yeti1400PanelInfo,
  },
];

const YetiLithiumDeviceList: DeviceListType[] = [
  {
    label: 'Yeti 3000 Lithium',
    value: DeviceTypes.YETI3000,
    icon: Images.yetiDevice.yeti3000_front,
    panelInfo: Images.yetiDevice.yeti1400PanelInfo,
  },
  {
    label: 'Yeti 1400 Lithium',
    value: DeviceTypes.YETI1400,
    icon: Images.yetiDevice.yeti1400_front,
    panelInfo: Images.yetiDevice.yeti1400PanelInfo,
  },
];

const FullDeviceList = [
  ...Yeti300500700DeviceList,
  ...Yeti100015002000DeviceList,
  ...YetiPRODeviceList,
  ...YetiXDeviceList,
  ...YetiLithiumDeviceList,
  ...FridgeFreezerDeviceList,
];

export {
  YetiXDeviceList,
  YetiPRODeviceList,
  Yeti300500700DeviceList,
  FridgeFreezerDeviceList,
  YetiLithiumDeviceList,
  Yeti100015002000DeviceList,
  FullDeviceList,
};
