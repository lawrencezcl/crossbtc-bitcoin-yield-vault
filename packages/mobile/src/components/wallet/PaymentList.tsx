import React from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity } from 'react-native';
import { format } from 'date-fns';
import { Colors, Spacing, Typography, BorderRadius } from '@/constants/theme';
import { BitcoinIcon, LightningIcon } from '@/components/icons';

interface Payment {
  id: string;
  type: 'lightning' | 'bitcoin';
  amount: number;
  timestamp: Date;
  status: 'pending' | 'completed' | 'failed';
  description?: string;
  address?: string;
  invoice?: string;
}

interface PaymentListProps {
  payments: Payment[];
  currency: 'lightning' | 'bitcoin';
}

export const PaymentList: React.FC<PaymentListProps> = ({ payments, currency }) => {
  const getStatusColor = (status: Payment['status']) => {
    switch (status) {
      case 'completed':
        return Colors.success;
      case 'pending':
        return Colors.warning;
      case 'failed':
        return Colors.error;
      default:
        return Colors.textTertiary;
    }
  };

  const getStatusText = (status: Payment['status']) => {
    switch (status) {
      case 'completed':
        return 'Completed';
      case 'pending':
        return 'Pending';
      case 'failed':
        return 'Failed';
      default:
        return status;
    }
  };

  const formatAmount = (amount: number) => {
    const absAmount = Math.abs(amount);
    const prefix = amount < 0 ? '-' : '+';
    return `${prefix}${absAmount.toFixed(8)} BTC`;
  };

  const renderPayment = ({ item }: { item: Payment }) => {
    const isOutgoing = item.amount < 0;
    const Icon = item.type === 'bitcoin' ? BitcoinIcon : LightningIcon;

    return (
      <TouchableOpacity style={styles.paymentItem}>
        <View style={styles.paymentLeft}>
          <View style={styles.iconContainer}>
            <Icon width={20} height={20} color={Colors.textSecondary} />
          </View>
          <View style={styles.paymentInfo}>
            <Text style={styles.paymentDescription}>
              {item.description || (isOutgoing ? 'Payment sent' : 'Payment received')}
            </Text>
            <Text style={styles.paymentTime}>
              {format(item.timestamp, 'MMM dd, yyyy HH:mm')}
            </Text>
          </View>
        </View>

        <View style={styles.paymentRight}>
          <Text
            style={[
              styles.paymentAmount,
              { color: isOutgoing ? Colors.textTertiary : Colors.text },
            ]}
          >
            {formatAmount(item.amount)}
          </Text>
          <View style={styles.statusContainer}>
            <View
              style={[
                styles.statusDot,
                { backgroundColor: getStatusColor(item.status) },
              ]}
            />
            <Text
              style={[
                styles.statusText,
                { color: getStatusColor(item.status) },
              ]}
            >
              {getStatusText(item.status)}
            </Text>
          </View>
        </View>
      </TouchableOpacity>
    );
  };

  if (payments.length === 0) {
    return (
      <View style={styles.emptyContainer}>
        <Text style={styles.emptyText}>No {currency} payments yet</Text>
        <Text style={styles.emptySubtext}>
          Your {currency} transactions will appear here
        </Text>
      </View>
    );
  }

  return (
    <FlatList
      data={payments}
      renderItem={renderPayment}
      keyExtractor={(item) => item.id}
      showsVerticalScrollIndicator={false}
      contentContainerStyle={styles.listContainer}
    />
  );
};

const styles = StyleSheet.create({
  listContainer: {
    paddingBottom: Spacing.md,
  },
  paymentItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: Spacing.md,
    paddingHorizontal: Spacing.sm,
    backgroundColor: Colors.backgroundTertiary,
    borderRadius: BorderRadius.md,
    marginBottom: Spacing.sm,
  },
  paymentLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  iconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: Colors.backgroundSecondary,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: Spacing.md,
  },
  paymentInfo: {
    flex: 1,
  },
  paymentDescription: {
    fontSize: Typography.base,
    fontWeight: Typography.medium,
    color: Colors.text,
    marginBottom: Spacing.xs,
  },
  paymentTime: {
    fontSize: Typography.sm,
    color: Colors.textTertiary,
  },
  paymentRight: {
    alignItems: 'flex-end',
  },
  paymentAmount: {
    fontSize: Typography.base,
    fontWeight: Typography.semibold,
    marginBottom: Spacing.xs,
  },
  statusContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  statusDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    marginRight: Spacing.xs,
  },
  statusText: {
    fontSize: Typography.xs,
    fontWeight: Typography.medium,
  },
  emptyContainer: {
    alignItems: 'center',
    paddingVertical: Spacing.xl,
  },
  emptyText: {
    fontSize: Typography.base,
    color: Colors.textSecondary,
    marginBottom: Spacing.xs,
  },
  emptySubtext: {
    fontSize: Typography.sm,
    color: Colors.textTertiary,
  },
});