import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  RefreshControl,
} from 'react-native';
import { useQuery } from '@tanstack/react-query';
import { Button, Card } from '@/components/ui';
import { Colors, Spacing, Typography } from '@/theme';
import { useVault } from '@/hooks/useVault';

export const VaultScreen: React.FC = () => {
  const [refreshing, setRefreshing] = useState(false);
  const {
    balance,
    isLoading,
    error,
    deposit,
    withdraw,
    refresh
  } = useVault();

  const { data: vaultData, isLoading: vaultLoading } = useQuery({
    queryKey: ['vault-data'],
    queryFn: async () => {
      // Mock vault data
      return {
        totalBalance: 0.52500000,
        principal: 0.50000000,
        yield: 0.02500000,
        apr: 8.5,
        monthlyYield: 0.00354167,
        projectedAnnualYield: 0.04250000,
        yieldStrategies: [
          { name: 'Troves Lending', allocation: 40, apr: 8.5 },
          { name: 'Vesu Borrowing', allocation: 35, apr: 9.2 },
          { name: 'Lido Staking', allocation: 25, apr: 6.8 },
        ],
        transactions: [
          {
            id: 1,
            type: 'deposit',
            amount: 0.10000000,
            timestamp: new Date('2024-01-15'),
            status: 'completed'
          },
          {
            id: 2,
            type: 'yield',
            amount: 0.00123456,
            timestamp: new Date('2024-01-14'),
            status: 'completed'
          },
          {
            id: 3,
            type: 'deposit',
            amount: 0.40000000,
            timestamp: new Date('2024-01-10'),
            status: 'completed'
          },
        ]
      };
    },
  });

  const onRefresh = async () => {
    setRefreshing(true);
    await refresh();
    await new Promise(resolve => setTimeout(resolve, 1000));
    setRefreshing(false);
  };

  if (isLoading || vaultLoading) {
    return (
      <View style={styles.loadingContainer}>
        <Text>Loading vault data...</Text>
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.errorContainer}>
        <Text style={styles.errorText}>Error loading vault: {error.message}</Text>
        <Button title="Retry" onPress={refresh} />
      </View>
    );
  }

  return (
    <ScrollView
      style={styles.container}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
      }
    >
      <View style={styles.header}>
        <Text style={styles.title}>Bitcoin Yield Vault</Text>
        <Text style={styles.subtitle}>Maximize your Bitcoin earnings</Text>
      </View>

      {/* Balance Card */}
      <Card style={styles.balanceCard}>
        <Text style={styles.balanceLabel}>Total Balance</Text>
        <Text style={styles.balanceAmount}>
          {vaultData?.totalBalance.toFixed(8)} BTC
        </Text>
        <Text style={styles.balanceUsd}>
          ≈ ${(vaultData?.totalBalance * 43000).toLocaleString()}
        </Text>

        <View style={styles.balanceBreakdown}>
          <View style={styles.balanceItem}>
            <Text style={styles.balanceItemLabel}>Principal</Text>
            <Text style={styles.balanceItemValue}>
              {vaultData?.principal.toFixed(8)} BTC
            </Text>
          </View>
          <View style={styles.balanceItem}>
            <Text style={styles.balanceItemLabel}>Yield Earned</Text>
            <Text style={[styles.balanceItemValue, styles.yieldText]}>
              +{vaultData?.yield.toFixed(8)} BTC
            </Text>
          </View>
        </View>
      </Card>

      {/* Yield Overview */}
      <Card style={styles.yieldCard}>
        <Text style={styles.cardTitle}>Yield Overview</Text>

        <View style={styles.aprContainer}>
          <Text style={styles.aprLabel}>Current APR</Text>
          <Text style={styles.aprValue}>{vaultData?.apr}%</Text>
        </View>

        <View style={styles.yieldMetrics}>
          <View style={styles.metricItem}>
            <Text style={styles.metricLabel}>Monthly Yield</Text>
            <Text style={styles.metricValue}>
              {vaultData?.monthlyYield.toFixed(8)} BTC
            </Text>
          </View>
          <View style={styles.metricItem}>
            <Text style={styles.metricLabel}>Projected Annual</Text>
            <Text style={styles.metricValue}>
              {vaultData?.projectedAnnualYield.toFixed(8)} BTC
            </Text>
          </View>
        </View>
      </Card>

      {/* Action Buttons */}
      <View style={styles.actionButtons}>
        <Button
          title="Deposit"
          variant="primary"
          size="lg"
          style={styles.actionButton}
          onPress={() => {/* Handle deposit */}}
        />
        <Button
          title="Withdraw"
          variant="outline"
          size="lg"
          style={styles.actionButton}
          onPress={() => {/* Handle withdraw */}}
        />
      </View>

      {/* Yield Strategies */}
      <Card style={styles.strategiesCard}>
        <Text style={styles.cardTitle}>Yield Strategies</Text>
        {vaultData?.yieldStrategies.map((strategy, index) => (
          <View key={index} style={styles.strategyItem}>
            <View style={styles.strategyHeader}>
              <Text style={styles.strategyName}>{strategy.name}</Text>
              <Text style={styles.strategyApr}>{strategy.apr}% APR</Text>
            </View>
            <View style={styles.allocationBar}>
              <View
                style={[
                  styles.allocationFill,
                  { width: `${strategy.allocation}%` }
                ]}
              />
            </View>
            <Text style={styles.allocationText}>{strategy.allocation}% allocation</Text>
          </View>
        ))}
      </Card>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.backgroundSecondary,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: Spacing.lg,
  },
  errorText: {
    color: Colors.error,
    textAlign: 'center',
    marginBottom: Spacing.md,
  },
  header: {
    padding: Spacing.lg,
    alignItems: 'center',
  },
  title: {
    fontSize: Typography.xl2,
    fontWeight: Typography.bold,
    color: Colors.text,
    marginBottom: Spacing.sm,
  },
  subtitle: {
    fontSize: Typography.base,
    color: Colors.textSecondary,
  },
  balanceCard: {
    margin: Spacing.md,
    alignItems: 'center',
  },
  balanceLabel: {
    fontSize: Typography.sm,
    color: Colors.textSecondary,
    marginBottom: Spacing.sm,
  },
  balanceAmount: {
    fontSize: Typography.xl3,
    fontWeight: Typography.bold,
    color: Colors.bitcoin,
    marginBottom: Spacing.xs,
  },
  balanceUsd: {
    fontSize: Typography.base,
    color: Colors.textSecondary,
    marginBottom: Spacing.lg,
  },
  balanceBreakdown: {
    width: '100%',
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  balanceItem: {
    alignItems: 'center',
  },
  balanceItemLabel: {
    fontSize: Typography.sm,
    color: Colors.textSecondary,
    marginBottom: Spacing.xs,
  },
  balanceItemValue: {
    fontSize: Typography.lg,
    fontWeight: Typography.semibold,
    color: Colors.text,
  },
  yieldText: {
    color: Colors.success,
  },
  yieldCard: {
    margin: Spacing.md,
  },
  cardTitle: {
    fontSize: Typography.lg,
    fontWeight: Typography.semibold,
    color: Colors.text,
    marginBottom: Spacing.md,
  },
  aprContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.md,
  },
  aprLabel: {
    fontSize: Typography.base,
    color: Colors.textSecondary,
  },
  aprValue: {
    fontSize: Typography.xl,
    fontWeight: Typography.bold,
    color: Colors.success,
  },
  yieldMetrics: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  metricItem: {
    flex: 1,
    alignItems: 'center',
  },
  metricLabel: {
    fontSize: Typography.sm,
    color: Colors.textSecondary,
    marginBottom: Spacing.xs,
  },
  metricValue: {
    fontSize: Typography.base,
    fontWeight: Typography.semibold,
    color: Colors.text,
  },
  actionButtons: {
    flexDirection: 'row',
    paddingHorizontal: Spacing.md,
    gap: Spacing.md,
    marginBottom: Spacing.md,
  },
  actionButton: {
    flex: 1,
  },
  strategiesCard: {
    margin: Spacing.md,
  },
  strategyItem: {
    marginBottom: Spacing.md,
  },
  strategyHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: Spacing.sm,
  },
  strategyName: {
    fontSize: Typography.base,
    fontWeight: Typography.medium,
    color: Colors.text,
  },
  strategyApr: {
    fontSize: Typography.sm,
    color: Colors.success,
    fontWeight: Typography.semibold,
  },
  allocationBar: {
    height: 8,
    backgroundColor: Colors.backgroundTertiary,
    borderRadius: 4,
    marginBottom: Spacing.xs,
  },
  allocationFill: {
    height: '100%',
    backgroundColor: Colors.bitcoin,
    borderRadius: 4,
  },
  allocationText: {
    fontSize: Typography.sm,
    color: Colors.textTertiary,
  },
});

export default VaultScreen;