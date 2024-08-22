export enum DeviceTypes {
  // YETI 6G
  YETI4000 = 'YETI4000',
  YETI300 = 'YETI300',
  YETI500 = 'YETI500',
  YETI700 = 'YETI700',
  YETI1000 = 'YETI1000',
  YETI1500 = 'YETI1500',
  YETI2000 = 'YETI2000',

  // YETI 5G
  YETI1500X = 'YETI1500X',
  YETI3000X = 'YETI3000X',
  YETI6000X = 'YETI6000X',

  // YETI 4G
  YETI1400 = 'YETI1400',
  YETI3000 = 'YETI3000',

  // Fridge
  ALTA50 = 'ALTA_50_FRIDGE',
  ALTA80 = 'ALTA_80_FRIDGE',
}

export type DeviceListType = {
  label: string;
  value: DeviceTypes;
  icon: number;
  panelInfo: number;
  width?: number;
};
