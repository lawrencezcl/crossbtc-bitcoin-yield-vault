import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  RefreshControl,
} from 'react-native';
import { useQuery } from '@tanstack/react-query';

// Components
import { VaultBalanceCard } from '@/components/vault/VaultBalanceCard';
import { YieldOverview } from '@/components/vault/YieldOverview';
import { ActionButtons } from '@/components/common/ActionButtons';
import { LoadingSpinner } from '@/components/common/LoadingSpinner';

// Hooks
import { useVault } from '@/hooks/useVault';

// Theme
import { Colors, Spacing, Typography, BorderRadius } from '@/constants/theme';

export const HomeScreen: React.FC = () => {
  const [refreshing, setRefreshing] = useState(false);
  const {
    balance,
    isLoading,
    refetch,
    deposit,
    withdraw,
    claimYield
  } = useVault();

  const onRefresh = async () => {
    setRefreshing(true);
    await refetch();
    setRefreshing(false);
  };

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <LoadingSpinner size="large" />
        <Text style={styles.loadingText}>Loading vault data...</Text>
      </View>
    );
  }

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.contentContainer}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
      }
    >
      <View style={styles.header}>
        <Text style={styles.title}>CrossBTC Vault</Text>
        <Text style={styles.subtitle}>Bitcoin Yield with Instant Access</Text>
      </View>

      <VaultBalanceCard balance={balance} />

      <YieldOverview
        apr={balance.apr}
        totalYield={balance.totalYield}
        yieldStrategies={balance.yieldStrategies}
      />

      <ActionButtons
        onDeposit={deposit}
        onWithdraw={withdraw}
        onClaimYield={claimYield}
        disabled={isLoading}
      />

      <View style={styles.infoSection}>
        <Text style={styles.infoTitle}>How it works</Text>
        <Text style={styles.infoText}>
          Deposit Bitcoin to earn yield through DeFi strategies on Starknet.
          Access instant payments via Lightning Network while your Bitcoin
          continues to generate yield in the background.
        </Text>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  contentContainer: {
    padding: Spacing.md,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: Colors.background,
  },
  loadingText: {
    marginTop: Spacing.sm,
    fontSize: Typography.base,
    color: Colors.textSecondary,
  },
  header: {
    alignItems: 'center',
    marginBottom: Spacing.xl,
  },
  title: {
    fontSize: Typography.xxxl,
    fontWeight: Typography.bold,
    color: Colors.text,
    marginBottom: Spacing.xs,
  },
  subtitle: {
    fontSize: Typography.base,
    color: Colors.textSecondary,
    textAlign: 'center',
  },
  infoSection: {
    marginTop: Spacing.xl,
    padding: Spacing.md,
    backgroundColor: Colors.backgroundSecondary,
    borderRadius: BorderRadius.lg,
  },
  infoTitle: {
    fontSize: Typography.lg,
    fontWeight: Typography.semibold,
    color: Colors.text,
    marginBottom: Spacing.sm,
  },
  infoText: {
    fontSize: Typography.sm,
    color: Colors.textSecondary,
    lineHeight: Typography.normal * Typography.sm,
  },
});