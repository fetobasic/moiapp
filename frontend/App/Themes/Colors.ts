const colors = {
  white: 'rgba(255, 255, 255, 1)',
  black: 'rgba(0, 0, 0, 1)',
  transparentWhite: (opacity: string) => `rgba(255, 255, 255, ${opacity})`,
  transparentBlack: (opacity: string) => `rgba(0, 0, 0, ${opacity})`,
  overlay: 'rgba(0, 0, 0, 0.5)',
  darkGray: 'rgba(74, 74, 74, 1)',
  lightGray: 'rgba(154, 153, 153, 1)',
  steel: 'rgba(204, 204, 204, 1)',
  border: 'rgba(54, 54, 54, 1)',
  portWarning: 'rgba(255, 205, 29, 1)',
  yellowBorder: 'rgba(250, 253, 79, 1)',
  portWarningDisable: 'rgba(255, 205, 29, 0.5)',
  note: 'rgba(255, 205, 29, 1)',
  middleGray: 'rgba(225, 225, 225, 1)',
  gray: 'rgba(147, 147, 147, 1)',
  dark: 'rgba(18, 18, 18, 1)',
  darkBrown: 'rgba(30, 27, 28, 1)',
  background: 'rgba(27, 27, 27, 1)',
  backgroundModal: 'rgba(46, 46, 46, 1)',
  backgroundHeader: 'rgba(57, 62, 68, 1)',
  coal: 'rgba(74, 74, 74, 1)',
  green: 'rgba(191, 210, 43, 1)',
  escape: 'rgba(5, 209, 5, 1)',
  lightGreen: 'rgba(5, 209, 5, 1)',
  blue: 'rgba(28, 154, 214, 1)',
  red: 'rgba(255, 83, 29, 1)',
  portError: 'rgba(255, 83, 29, 1)',
  portErrorDisable: 'rgba(254, 82, 29, 0.5)',
  link: 'rgba(38, 168, 236, 1)',
  iconGray: 'rgba(128, 128, 128, 1)',
  transparent: 'rgba(0,0,0,0)',
  ricePaper: 'rgba(255,255,255, 0.75)',
  buttonDisabled: 'rgba(255,255,255, 0.38)',
  disabled: 'rgba(133, 133, 133, 1)',
  ember: 'rgba(164, 0, 48, 0.5)',
  separator: 'rgba(142, 141, 147, 1)',
  greenDisable: 'rgba(190, 209, 43, 0.65)',
  grayDisable: 'rgba(147, 147, 147, 0.65)',
  textInputBackground: 'rgba(255,255,255, 0.07)',
  textInputBackgroundDark: 'rgba(150,150,150, 0.07)',
  disabledSegment: 'rgba(255,255,255, 0.12)',
  listBorder: 'rgba(255,255,255, 0.2)',
  dotNotActive: 'rgba(255,255,255, 0.38)',
  mediumEmphasis: 'rgba(255,255,255, 0.6)',
  highEmphasis: 'rgba(255,255,255, 0.87)',
  phoneId: 'rgba(136,136,136, 1)',
  radarDot: 'rgba(50,50,50, 1)',
  // slider doesn't accept rgba
  sliderSelected: '#bdcc2f',
  sliderBlank: '#3a3a3c',
  sliderThumbColor: '#fff',
  sliderThumbBorderColor: '#fff',
  backgroundShade: 'rgba(0, 0, 0, 0.4)',
  dropdownBackground: 'rgba(46, 46, 46, 1)',
  gradient: 'rgba(108, 108, 108, 1)',
  devicesHubRowBackground: 'rgba(39, 39, 39, 1)',
  segmentSelected: 'rgba(99, 99, 102, 1)',
  segmentBackground: 'rgba(42, 43, 44, 1)',
  combiner: 'rgba(0, 240, 255, 1)',
  severity: {
    green: 'rgba(191, 210, 43, 1)',
    yellow: 'rgba(255, 205, 29, 1)',
    red: 'rgba(255, 83, 29, 1)',
    blue: 'rgba(28, 154, 214, 1)',
    gray: 'rgba(255, 255, 255, 0.87)',
  },
  temperature: {
    min: 'rgba(0, 0, 255, 1)',
    max: 'rgba(237, 28, 36, 1)',
  },
  notification: {
    lightYellow: 'rgba(255, 252, 49, 1)',
    lightBlue: 'rgba(133, 249, 254, 1)',
    lightOrange: 'rgba(255, 149, 49, 1)',
    yellow: 'rgba(255, 245, 47, 1)',
  },
  combinerStatus: {
    available: 'rgba(3, 207, 3, 1)',
    syncing: 'rgba(255, 205, 29, 1)',
    active: 'rgba(28, 154, 214, 1)',
  },
};

export default colors;
