import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Colors, Spacing, Typography, BorderRadius } from '@/constants/theme';

interface VaultBalanceProps {
  balance: {
    total: number;
    principal: number;
    yield: number;
    apr: number;
    totalYield: number;
  };
}

export const VaultBalanceCard: React.FC<VaultBalanceProps> = ({ balance }) => {
  const btcPrice = 43000; // Mock BTC price
  const totalUsd = balance.total * btcPrice;

  return (
    <View style={styles.container}>
      <Text style={styles.label}>Total Balance</Text>
      <Text style={styles.totalAmount}>
        {balance.total.toFixed(8)} BTC
      </Text>
      <Text style={styles.usdAmount}>
        ≈ ${totalUsd.toLocaleString()}
      </Text>

      <View style={styles.breakdown}>
        <View style={styles.breakdownItem}>
          <Text style={styles.breakdownLabel}>Principal</Text>
          <Text style={styles.breakdownValue}>
            {balance.principal.toFixed(8)} BTC
          </Text>
        </View>
        <View style={styles.divider} />
        <View style={styles.breakdownItem}>
          <Text style={styles.breakdownLabel}>Yield Earned</Text>
          <Text style={[styles.breakdownValue, styles.yieldValue]}>
            +{balance.yield.toFixed(8)} BTC
          </Text>
        </View>
      </View>

      <View style={styles.aprContainer}>
        <View style={styles.aprItem}>
          <Text style={styles.aprLabel}>Current APR</Text>
          <Text style={styles.aprValue}>{balance.apr}%</Text>
        </View>
        <View style={styles.aprItem}>
          <Text style={styles.aprLabel}>Total Yield</Text>
          <Text style={styles.aprValue}>{balance.totalYield.toFixed(8)} BTC</Text>
        </View>
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
    alignItems: 'center',
    ...Shadow.md,
  },
  label: {
    fontSize: Typography.sm,
    color: Colors.textSecondary,
    marginBottom: Spacing.sm,
  },
  totalAmount: {
    fontSize: Typography.xxxl,
    fontWeight: Typography.bold,
    color: Colors.bitcoin,
    marginBottom: Spacing.xs,
  },
  usdAmount: {
    fontSize: Typography.base,
    color: Colors.textSecondary,
    marginBottom: Spacing.lg,
  },
  breakdown: {
    flexDirection: 'row',
    width: '100%',
    alignItems: 'center',
    marginBottom: Spacing.lg,
  },
  breakdownItem: {
    flex: 1,
    alignItems: 'center',
  },
  breakdownLabel: {
    fontSize: Typography.sm,
    color: Colors.textSecondary,
    marginBottom: Spacing.xs,
  },
  breakdownValue: {
    fontSize: Typography.lg,
    fontWeight: Typography.semibold,
    color: Colors.text,
  },
  yieldValue: {
    color: Colors.success,
  },
  divider: {
    width: 1,
    height: 40,
    backgroundColor: Colors.border,
    marginHorizontal: Spacing.md,
  },
  aprContainer: {
    flexDirection: 'row',
    width: '100%',
    justifyContent: 'space-around',
    paddingTop: Spacing.md,
    borderTopWidth: 1,
    borderTopColor: Colors.border,
  },
  aprItem: {
    alignItems: 'center',
  },
  aprLabel: {
    fontSize: Typography.sm,
    color: Colors.textSecondary,
    marginBottom: Spacing.xs,
  },
  aprValue: {
    fontSize: Typography.lg,
    fontWeight: Typography.semibold,
    color: Colors.text,
  },
});