import React, { ReactNode } from 'react';
import {
  View,
  StyleSheet,
  ViewStyle,
} from 'react-native';
import { Colors, Spacing, BorderRadius, Shadow } from '@/theme';

interface CardProps {
  children: ReactNode;
  style?: ViewStyle;
  padding?: 'none' | 'sm' | 'md' | 'lg';
  variant?: 'default' | 'outlined' | 'elevated';
}

export const Card: React.FC<CardProps> = ({
  children,
  style,
  padding = 'md',
  variant = 'default',
}) => {
  const getCardStyle = (): ViewStyle => {
    const baseStyle: ViewStyle = {
      borderRadius: BorderRadius.lg,
      backgroundColor: Colors.surface,
      overflow: 'hidden',
    };

    // Padding styles
    const paddingStyles: Record<string, ViewStyle> = {
      none: {},
      sm: { padding: Spacing.sm },
      md: { padding: Spacing.md },
      lg: { padding: Spacing.lg },
    };

    // Variant styles
    const variantStyles: Record<string, ViewStyle> = {
      default: {
        borderWidth: 1,
        borderColor: Colors.border,
      },
      outlined: {
        borderWidth: 1,
        borderColor: Colors.borderDark,
      },
      elevated: {
        ...Shadow.lg,
      },
    };

    return {
      ...baseStyle,
      ...paddingStyles[padding],
      ...variantStyles[variant],
    };
  };

  return (
    <View style={[getCardStyle(), style]}>
      {children}
    </View>
  );
};

const styles = StyleSheet.create({
  // Additional styles can be added here if needed
});