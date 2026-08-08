// src/constants/layout.js
import {Dimensions, Platform} from 'react-native';

const {width, height} = Dimensions.get('window');

export const Layout = {
  window: {width, height},
  isSmallDevice: width < 375,
  isTablet: width >= 768,
};

export const Spacing = {
  xs: 4,
  sm: 8,
  md: 12,
  base: 16,
  lg: 20,
  xl: 24,
  '2xl': 32,
  '3xl': 40,
  '4xl': 48,
  '5xl': 64,
};

export const BorderRadius = {
  none: 0,
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  '2xl': 24,
  full: 9999,
};

export const Shadow = {
  none: {},
  xs: {
    shadowColor: '#292524',
    shadowOffset: {width: 0, height: 1},
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  sm: {
    shadowColor: '#292524',
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 2,
  },
  md: {
    shadowColor: '#292524',
    shadowOffset: {width: 0, height: 4},
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  lg: {
    shadowColor: '#292524',
    shadowOffset: {width: 0, height: 8},
    shadowOpacity: 0.12,
    shadowRadius: 16,
    elevation: 8,
  },
  xl: {
    shadowColor: '#292524',
    shadowOffset: {width: 0, height: 16},
    shadowOpacity: 0.15,
    shadowRadius: 24,
    elevation: 12,
  },
};

export const StatusBarHeight = Platform.OS === 'android' ? 0 : 44;
