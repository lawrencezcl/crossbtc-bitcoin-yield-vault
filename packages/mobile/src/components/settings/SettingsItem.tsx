import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  Switch,
  StyleSheet,
} from 'react-native';
import { Colors, Spacing, Typography, BorderRadius } from '@/constants/theme';

interface SettingsItemProps {
  label: string;
  description?: string;
  type: 'button' | 'toggle';
  value?: boolean;
  onToggle?: (value: boolean) => void;
  onPress?: () => void;
  disabled?: boolean;
}

export const SettingsItem: React.FC<SettingsItemProps> = ({
  label,
  description,
  type,
  value,
  onToggle,
  onPress,
  disabled = false,
}) => {
  if (type === 'toggle') {
    return (
      <View style={[styles.container, styles.toggleContainer]}>
        <View style={styles.content}>
          <Text
            style={[
              styles.label,
              disabled && styles.disabledText,
            ]}
          >
            {label}
          </Text>
          {description && (
            <Text
              style={[
                styles.description,
                disabled && styles.disabledDescription,
              ]}
            >
              {description}
            </Text>
          )}
        </View>

        <Switch
          value={value}
          onValueChange={onToggle}
          disabled={disabled}
          trackColor={{
            false: Colors.backgroundTertiary,
            true: Colors.bitcoin,
          }}
          thumbColor={Colors.text}
        />
      </View>
    );
  }

  return (
    <TouchableOpacity
      style={[styles.container, disabled && styles.disabledContainer]}
      onPress={onPress}
      disabled={disabled}
      activeOpacity={0.7}
    >
      <View style={styles.content}>
        <Text
          style={[
            styles.label,
            disabled && styles.disabledText,
          ]}
        >
          {label}
        </Text>
        {description && (
          <Text
            style={[
              styles.description,
              disabled && styles.disabledDescription,
            ]}
          >
            {description}
          </Text>
        )}
      </View>

      <Text style={styles.arrow}>
        {'>'}
      </Text>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: Spacing.md,
    paddingHorizontal: Spacing.sm,
    backgroundColor: Colors.backgroundSecondary,
    borderRadius: BorderRadius.md,
    marginBottom: Spacing.sm,
  },
  toggleContainer: {
    paddingRight: Spacing.md,
  },
  content: {
    flex: 1,
  },
  label: {
    fontSize: Typography.base,
    fontWeight: Typography.medium,
    color: Colors.text,
    marginBottom: Spacing.xs,
  },
  description: {
    fontSize: Typography.sm,
    color: Colors.textSecondary,
    lineHeight: Typography.normal * Typography.sm,
  },
  arrow: {
    fontSize: Typography.lg,
    color: Colors.textTertiary,
    fontWeight: '300',
  },
  disabledContainer: {
    opacity: 0.5,
  },
  disabledText: {
    color: Colors.textTertiary,
  },
  disabledDescription: {
    color: Colors.textTertiary,
  },
});