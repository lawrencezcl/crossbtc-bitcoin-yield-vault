import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Colors, Spacing, Typography, BorderRadius } from '@/constants/theme';
import { BitcoinIcon, LightningIcon } from '@/components/icons';

interface WalletCardProps {
  balance: number;
  currency: 'bitcoin' | 'lightning';
}

export const WalletCard: React.FC<WalletCardProps> = ({ balance, currency }) => {
  const btcPrice = 43000; // Mock BTC price
  const balanceUsd = balance * btcPrice;

  const Icon = currency === 'bitcoin' ? BitcoinIcon : LightningIcon;
  const currencyName = currency === 'bitcoin' ? 'Bitcoin' : 'Lightning';
  const currencyColor = currency === 'bitcoin' ? Colors.bitcoin : Colors.lightning;

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View style={styles.currencyInfo}>
          <Icon width={24} height={24} color={currencyColor} />
          <Text style={styles.currencyName}>{currencyName}</Text>
        </View>
        <Text style={styles.balanceLabel}>Available Balance</Text>
      </View>

      <Text style={styles.balanceAmount}>
        {balance.toFixed(8)} BTC
      </Text>

      <Text style={styles.balanceUsd}>
        ≈ ${balanceUsd.toLocaleString()}
      </Text>

      <View style={styles.statusContainer}>
        <View style={[styles.statusDot, { backgroundColor: currencyColor }]} />
        <Text style={styles.statusText}>
          {currency === 'lightning' ? 'Instant payments' : 'On-chain transfers'}
        </Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: Colors.backgroundSecondary,
    borderRadius: BorderRadius.lg,
    padding: Spacing.lg,
    marginVertical: Spacing.md,
    ...Shadow.md,
  },
  header: {
    marginBottom: Spacing.md,
  },
  currencyInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: Spacing.xs,
  },
  currencyName: {
    fontSize: Typography.lg,
    fontWeight: Typography.semibold,
    color: Colors.text,
    marginLeft: Spacing.sm,
  },
  balanceLabel: {
    fontSize: Typography.sm,
    color: Colors.textSecondary,
  },
  balanceAmount: {
    fontSize: Typography.xxxl,
    fontWeight: Typography.bold,
    color: Colors.text,
    marginBottom: Spacing.xs,
  },
  balanceUsd: {
    fontSize: Typography.base,
    color: Colors.textSecondary,
    marginBottom: Spacing.md,
  },
  statusContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingTop: Spacing.md,
    borderTopWidth: 1,
    borderTopColor: Colors.border,
  },
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: Spacing.sm,
  },
  statusText: {
    fontSize: Typography.sm,
    color: Colors.textTertiary,
  },
});