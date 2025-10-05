import React from 'react';
import { View, TouchableOpacity, Text, StyleSheet } from 'react-native';
import { Colors, Spacing, Typography, BorderRadius } from '@/constants/theme';

interface ActionButtonsProps {
  onDeposit?: () => void;
  onWithdraw?: () => void;
  onSend?: () => void;
  onReceive?: () => void;
  onClaimYield?: () => void;
  disabled?: boolean;
  variant?: 'vault' | 'wallet';
}

export const ActionButtons: React.FC<ActionButtonsProps> = ({
  onDeposit,
  onWithdraw,
  onSend,
  onReceive,
  onClaimYield,
  disabled = false,
  variant = 'vault',
}) => {
  if (variant === 'wallet') {
    return (
      <View style={styles.walletButtonContainer}>
        <TouchableOpacity
          style={[styles.walletButton, styles.sendButton, disabled && styles.disabledButton]}
          onPress={onSend}
          disabled={disabled}
        >
          <Text style={[styles.walletButtonText, disabled && styles.disabledButtonText]}>
            Send
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.walletButton, styles.receiveButton, disabled && styles.disabledButton]}
          onPress={onReceive}
          disabled={disabled}
        >
          <Text style={[styles.walletButtonText, disabled && styles.disabledButtonText]}>
            Receive
          </Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={styles.vaultButtonContainer}>
      <TouchableOpacity
        style={[styles.vaultButton, styles.depositButton, disabled && styles.disabledButton]}
        onPress={onDeposit}
        disabled={disabled}
      >
        <Text style={[styles.vaultButtonText, disabled && styles.disabledButtonText]}>
          Deposit Bitcoin
        </Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={[styles.vaultButton, styles.withdrawButton, disabled && styles.disabledButton]}
        onPress={onWithdraw}
        disabled={disabled}
      >
        <Text style={[styles.vaultButtonText, disabled && styles.disabledButtonText]}>
          Withdraw Bitcoin
        </Text>
      </TouchableOpacity>

      {onClaimYield && (
        <TouchableOpacity
          style={[styles.vaultButton, styles.claimButton, disabled && styles.disabledButton]}
          onPress={onClaimYield}
          disabled={disabled}
        >
          <Text style={[styles.vaultButtonText, disabled && styles.disabledButtonText]}>
            Claim Yield
          </Text>
        </TouchableOpacity>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  vaultButtonContainer: {
    gap: Spacing.md,
    marginVertical: Spacing.lg,
  },
  vaultButton: {
    paddingVertical: Spacing.md,
    paddingHorizontal: Spacing.lg,
    borderRadius: BorderRadius.lg,
    alignItems: 'center',
    ...Shadow.md,
  },
  depositButton: {
    backgroundColor: Colors.bitcoin,
  },
  withdrawButton: {
    backgroundColor: Colors.backgroundSecondary,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  claimButton: {
    backgroundColor: Colors.success,
  },
  vaultButtonText: {
    fontSize: Typography.base,
    fontWeight: Typography.semibold,
    color: Colors.text,
  },

  walletButtonContainer: {
    flexDirection: 'row',
    gap: Spacing.md,
    marginVertical: Spacing.lg,
  },
  walletButton: {
    flex: 1,
    paddingVertical: Spacing.md,
    paddingHorizontal: Spacing.lg,
    borderRadius: BorderRadius.lg,
    alignItems: 'center',
    ...Shadow.md,
  },
  sendButton: {
    backgroundColor: Colors.backgroundSecondary,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  receiveButton: {
    backgroundColor: Colors.bitcoin,
  },
  walletButtonText: {
    fontSize: Typography.base,
    fontWeight: Typography.semibold,
    color: Colors.text,
  },

  disabledButton: {
    backgroundColor: Colors.backgroundTertiary,
    borderColor: Colors.borderLight,
    ...Shadow.sm,
  },
  disabledButtonText: {
    color: Colors.textTertiary,
  },
});