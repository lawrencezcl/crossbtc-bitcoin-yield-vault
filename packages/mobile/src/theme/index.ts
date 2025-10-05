export const Colors = {
  // Bitcoin brand colors
  bitcoin: '#F27A24',
  bitcoinLight: '#FFB366',
  bitcoinDark: '#CC5F1A',

  // Semantic colors
  primary: '#F27A24',
  primaryLight: '#FFB366',
  primaryDark: '#CC5F1A',

  success: '#10B981',
  successLight: '#34D399',
  successDark: '#059669',

  error: '#EF4444',
  errorLight: '#F87171',
  errorDark: '#DC2626',

  warning: '#F59E0B',
  warningLight: '#FCD34D',
  warningDark: '#D97706',

  info: '#3B82F6',
  infoLight: '#60A5FA',
  infoDark: '#2563EB',

  // Neutral colors
  background: '#FFFFFF',
  backgroundSecondary: '#F9FAFB',
  backgroundTertiary: '#F3F4F6',

  surface: '#FFFFFF',
  surfaceSecondary: '#F9FAFB',
  surfaceTertiary: '#F3F4F6',

  border: '#E5E7EB',
  borderLight: '#F3F4F6',
  borderDark: '#D1D5DB',

  text: '#111827',
  textSecondary: '#6B7280',
  textTertiary: '#9CA3AF',
  textInverse: '#FFFFFF',

  // Dark theme colors
  dark: {
    background: '#000000',
    backgroundSecondary: '#111827',
    backgroundTertiary: '#1F2937',

    surface: '#111827',
    surfaceSecondary: '#1F2937',
    surfaceTertiary: '#374151',

    border: '#374151',
    borderLight: '#4B5563',
    borderDark: '#1F2937',

    text: '#FFFFFF',
    textSecondary: '#D1D5DB',
    textTertiary: '#9CA3AF',
    textInverse: '#000000',
  }
};

export const Spacing = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  xxl: 48,
  xxxl: 64,
};

export const Typography = {
  // Font sizes
  xs: 12,
  sm: 14,
  base: 16,
  lg: 18,
  xl: 20,
  xl2: 24,
  xl3: 30,
  xl4: 36,

  // Font weights
  light: '300',
  normal: '400',
  medium: '500',
  semibold: '600',
  bold: '700',

  // Line heights
  tight: 1.2,
  normal: 1.5,
  relaxed: 1.75,
};

export const BorderRadius = {
  none: 0,
  sm: 4,
  md: 8,
  lg: 12,
  xl: 16,
  full: 9999,
};

export const Shadow = {
  sm: {
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  md: {
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  lg: {
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 10,
    },
    shadowOpacity: 0.15,
    shadowRadius: 20,
    elevation: 8,
  },
};

export const theme = {
  Colors,
  Spacing,
  Typography,
  BorderRadius,
  Shadow,
};

export type Theme = typeof theme;