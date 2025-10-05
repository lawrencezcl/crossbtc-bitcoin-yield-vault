/**
 * Theme configuration for CrossBTC Mobile App
 * Bitcoin-inspired color scheme and typography
 */

export const Colors = {
  // Brand colors
  bitcoin: '#F7931A',
  bitcoinLight: '#FFB84D',
  bitcoinDark: '#CC7A1A',

  // Starknet colors
  starknet: '#6B46C1',
  starknetLight: '#8B5CF6',
  starknetDark: '#4C1D95',

  // Lightning Network colors
  lightning: '#FBB040',
  lightningLight: '#FFD966',
  lightningDark: '#D4A017',

  // Background colors
  background: '#0A0A0A',
  backgroundSecondary: '#1A1A1A',
  backgroundTertiary: '#2A2A2A',

  // Text colors
  text: '#FFFFFF',
  textSecondary: '#A0A0A0',
  textTertiary: '#707070',

  // UI colors
  border: '#333333',
  borderLight: '#404040',
  success: '#10B981',
  warning: '#F59E0B',
  error: '#EF4444',
  info: '#3B82F6',

  // Semantic colors
  profit: '#10B981',
  loss: '#EF4444',
  neutral: '#6B7280',
};

export const Spacing = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  xxl: 48,
};

export const Typography = {
  // Font sizes
  xs: 12,
  sm: 14,
  base: 16,
  lg: 18,
  xl: 20,
  xxl: 24,
  xxxl: 32,

  // Font weights
  regular: '400',
  medium: '500',
  semibold: '600',
  bold: '700',

  // Line heights
  tight: 1.2,
  normal: 1.4,
  relaxed: 1.6,
};

export const BorderRadius = {
  sm: 4,
  md: 8,
  lg: 12,
  xl: 16,
  full: 9999,
};

export const Shadow = {
  sm: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  md: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
    elevation: 4,
  },
  lg: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 8,
  },
};

export const theme = {
  colors: Colors,
  spacing: Spacing,
  typography: Typography,
  borderRadius: BorderRadius,
  shadow: Shadow,
};