import Colors from './Colors';
import { isIOS } from './Platforms';
import { PixelRatio, TextStyle } from 'react-native';

const type = {
  base: 'Roboto-Medium',
  condensed: 'RobotoCondensed-Medium',
  condensedBold: 'RobotoCondensed-Bold',
};

const size = {
  h1: 32,
  h2: 24,
  h3: 20,
  regular: 17,
  xlarge: 16,
  large: 15,
  medium: 14,
  small: 12,
  xsmall: 10,
  tiny: 8.5,
};

const style: { [key: string]: TextStyle } = {
  h1: {
    fontFamily: type.base,
    fontSize: size.h1,
    lineHeight: 48,
    fontWeight: isIOS ? '500' : 'normal',
    color: Colors.white,
  },
  h2: {
    fontFamily: type.base,
    fontSize: size.h2,
    lineHeight: 36,
    fontWeight: isIOS ? '500' : 'normal',
    color: Colors.white,
  },
  h3: {
    fontFamily: type.condensed,
    fontSize: size.h3,
    lineHeight: 32,
    fontWeight: isIOS ? '500' : 'normal',
    color: Colors.white,
  },
  subtitleOne: {
    fontFamily: type.base,
    fontSize: size.xlarge,
    lineHeight: 24,
    fontWeight: isIOS ? '400' : 'normal',
    color: Colors.white,
  },
  subtitleTwo: {
    fontFamily: type.base,
    fontSize: size.medium,
    lineHeight: 20,
    fontWeight: isIOS ? '500' : 'normal',
    color: Colors.white,
  },
  bodyOne: {
    fontFamily: type.base,
    fontSize: size.medium,
    lineHeight: 20,
    fontWeight: isIOS ? '400' : 'normal',
    color: Colors.transparentWhite('0.87'),
  },
  bodyTwo: {
    fontFamily: type.base,
    fontSize: size.xlarge,
    lineHeight: 24,
    fontWeight: isIOS ? '400' : 'normal',
    color: Colors.transparentWhite('0.87'),
  },
  button: {
    fontFamily: type.base,
    fontSize: size.medium,
    lineHeight: 20,
    fontWeight: isIOS ? '700' : 'bold',
    textTransform: 'uppercase',
    color: Colors.white,
  },
  caption: {
    fontFamily: type.base,
    fontSize: size.small,
    lineHeight: 16,
    fontWeight: isIOS ? '300' : 'normal',
    color: Colors.transparentWhite('0.7'),
  },
};

const font = {
  base: {
    ...style,
  },
  condensed: {
    h1: {
      ...style.h1,
      fontFamily: isIOS ? type.condensed : type.condensedBold,
    },
    h2: {
      ...style.h2,
      fontFamily: isIOS ? type.condensed : type.condensedBold,
    },
    h3: {
      ...style.h3,
      fontFamily: isIOS ? type.condensed : type.condensedBold,
    },
    subtitleOne: {
      ...style.subtitleOne,
      fontFamily: isIOS ? type.condensed : type.condensedBold,
    },
    subtitleTwo: {
      ...style.subtitleTwo,
      fontFamily: isIOS ? type.condensed : type.condensedBold,
    },
    bodyOne: {
      ...style.bodyOne,
      fontFamily: isIOS ? type.condensed : type.condensedBold,
    },
    bodyTwo: {
      ...style.bodyTwo,
      fontFamily: isIOS ? type.condensed : type.condensedBold,
    },
    button: {
      ...style.button,
      fontFamily: isIOS ? type.condensed : type.condensedBold,
    },
    caption: {
      ...style.caption,
      fontFamily: isIOS ? type.condensed : type.condensedBold,
    },
  },
};

export default {
  type,
  size,
  style,
  font,
  fontScale: PixelRatio.getFontScale(),
};
