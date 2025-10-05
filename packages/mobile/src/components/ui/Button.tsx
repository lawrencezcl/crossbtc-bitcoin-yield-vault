import React from 'react';
import {
  TouchableOpacity,
  Text,
  StyleSheet,
  ActivityIndicator,
  ViewStyle,
  TextStyle,
  TouchableOpacityProps,
} from 'react-native';
import { Colors, Typography, BorderRadius, Spacing, Shadow } from '@/theme';

interface ButtonProps extends TouchableOpacityProps {
  title: string;
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
  loading?: boolean;
  disabled?: boolean;
  style?: ViewStyle;
  textStyle?: TextStyle;
}

export const Button: React.FC<ButtonProps> = ({
  title,
  variant = 'primary',
  size = 'md',
  loading = false,
  disabled = false,
  style,
  textStyle,
  ...props
}) => {
  const getButtonStyle = (): ViewStyle => {
    const baseStyle: ViewStyle = {
      borderRadius: BorderRadius.md,
      alignItems: 'center',
      justifyContent: 'center',
      flexDirection: 'row',
    };

    // Size styles
    const sizeStyles: Record<string, ViewStyle> = {
      sm: {
        paddingHorizontal: Spacing.md,
        paddingVertical: Spacing.sm,
        minHeight: 36,
      },
      md: {
        paddingHorizontal: Spacing.lg,
        paddingVertical: Spacing.md,
        minHeight: 44,
      },
      lg: {
        paddingHorizontal: Spacing.xl,
        paddingVertical: Spacing.lg,
        minHeight: 52,
      },
    };

    // Variant styles
    const variantStyles: Record<string, ViewStyle> = {
      primary: {
        backgroundColor: disabled ? Colors.border : Colors.bitcoin,
        ...Shadow.md,
      },
      secondary: {
        backgroundColor: disabled ? Colors.border : Colors.surfaceTertiary,
        ...Shadow.sm,
      },
      outline: {
        backgroundColor: 'transparent',
        borderWidth: 1,
        borderColor: disabled ? Colors.border : Colors.bitcoin,
      },
      ghost: {
        backgroundColor: 'transparent',
      },
    };

    return {
      ...baseStyle,
      ...sizeStyles[size],
      ...variantStyles[variant],
    };
  };

  const getTextStyle = (): TextStyle => {
    const baseStyle: TextStyle = {
      fontFamily: 'System',
      fontWeight: Typography.semibold,
    };

    const sizeStyles: Record<string, TextStyle> = {
      sm: {
        fontSize: Typography.sm,
      },
      md: {
        fontSize: Typography.base,
      },
      lg: {
        fontSize: Typography.lg,
      },
    };

    const variantStyles: Record<string, TextStyle> = {
      primary: {
        color: Colors.textInverse,
      },
      secondary: {
        color: Colors.text,
      },
      outline: {
        color: disabled ? Colors.textTertiary : Colors.bitcoin,
      },
      ghost: {
        color: disabled ? Colors.textTertiary : Colors.bitcoin,
      },
    };

    return {
      ...baseStyle,
      ...sizeStyles[size],
      ...variantStyles[variant],
    };
  };

  return (
    <TouchableOpacity
      style={[getButtonStyle(), style]}
      disabled={disabled || loading}
      activeOpacity={0.7}
      {...props}
    >
      {loading ? (
        <ActivityIndicator
          size="small"
          color={variant === 'primary' ? Colors.textInverse : Colors.bitcoin}
          style={{ marginRight: Spacing.sm }}
        />
      ) : null}
      <Text style={[getTextStyle(), textStyle]}>{title}</Text>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  // Additional styles can be added here if needed
});