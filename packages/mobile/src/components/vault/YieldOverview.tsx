import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Colors, Spacing, Typography, BorderRadius } from '@/constants/theme';

interface YieldStrategy {
  name: string;
  allocation: number;
  apr: number;
}

interface YieldOverviewProps {
  apr: number;
  totalYield: number;
  yieldStrategies: YieldStrategy[];
}

export const YieldOverview: React.FC<YieldOverviewProps> = ({
  apr,
  totalYield,
  yieldStrategies,
}) => {
  const monthlyYield = (totalYield * apr) / 12;
  const projectedAnnualYield = totalYield * apr;

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Yield Overview</Text>

      <View style={styles.metricsContainer}>
        <View style={styles.metricItem}>
          <Text style={styles.metricLabel}>Current APR</Text>
          <Text style={styles.aprValue}>{apr}%</Text>
        </View>

        <View style={styles.metricItem}>
          <Text style={styles.metricLabel}>Monthly Yield</Text>
          <Text style={styles.metricValue}>
            {monthlyYield.toFixed(8)} BTC
          </Text>
        </View>

        <View style={styles.metricItem}>
          <Text style={styles.metricLabel}>Projected Annual</Text>
          <Text style={styles.metricValue}>
            {projectedAnnualYield.toFixed(8)} BTC
          </Text>
        </View>
      </View>

      <View style={styles.strategiesContainer}>
        <Text style={styles.strategiesTitle}>Active Strategies</Text>
        {yieldStrategies.map((strategy, index) => (
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
            <Text style={styles.allocationText}>
              {strategy.allocation}% allocation
            </Text>
          </View>
        ))}
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
  title: {
    fontSize: Typography.lg,
    fontWeight: Typography.semibold,
    color: Colors.text,
    marginBottom: Spacing.md,
  },
  metricsContainer: {
    marginBottom: Spacing.lg,
  },
  metricItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: Spacing.sm,
  },
  metricLabel: {
    fontSize: Typography.base,
    color: Colors.textSecondary,
  },
  metricValue: {
    fontSize: Typography.base,
    fontWeight: Typography.semibold,
    color: Colors.text,
  },
  aprValue: {
    fontSize: Typography.xl,
    fontWeight: Typography.bold,
    color: Colors.success,
  },
  strategiesContainer: {
    borderTopWidth: 1,
    borderTopColor: Colors.border,
    paddingTop: Spacing.md,
  },
  strategiesTitle: {
    fontSize: Typography.base,
    fontWeight: Typography.semibold,
    color: Colors.text,
    marginBottom: Spacing.md,
  },
  strategyItem: {
    marginBottom: Spacing.md,
  },
  strategyHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.sm,
  },
  strategyName: {
    fontSize: Typography.sm,
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
    fontSize: Typography.xs,
    color: Colors.textTertiary,
  },
});