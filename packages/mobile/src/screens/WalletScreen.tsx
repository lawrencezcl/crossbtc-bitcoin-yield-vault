import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { useQuery } from '@tanstack/react-query';

// Components
import { WalletCard } from '@/components/wallet/WalletCard';
import { PaymentList } from '@/components/wallet/PaymentList';
import { ActionButtons } from '@/components/common/ActionButtons';
import { LoadingSpinner } from '@/components/common/LoadingSpinner';

// Hooks
import { useWallet } from '@/hooks/useWallet';

// Theme
import { Colors, Spacing, Typography, BorderRadius } from '@/constants/theme';

export const WalletScreen: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'lightning' | 'bitcoin'>('lightning');
  const {
    balance,
    payments,
    isLoading,
    createPayment,
    sendPayment,
    refresh
  } = useWallet();

  const handleSendPayment = () => {
    Alert.alert(
      'Send Payment',
      'Choose payment method:',
      [
        { text: 'Lightning', onPress: () => sendPayment('lightning') },
        { text: 'Bitcoin', onPress: () => sendPayment('bitcoin') },
        { text: 'Cancel', style: 'cancel' },
      ]
    );
  };

  const handleReceivePayment = () => {
    Alert.alert(
      'Receive Payment',
      'Choose receive method:',
      [
        { text: 'Lightning', onPress: () => createPayment('lightning') },
        { text: 'Bitcoin', onPress: () => createPayment('bitcoin') },
        { text: 'Cancel', style: 'cancel' },
      ]
    );
  };

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <LoadingSpinner size="large" />
        <Text style={styles.loadingText}>Loading wallet data...</Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.contentContainer}>
      <View style={styles.header}>
        <Text style={styles.title}>Instant Payments</Text>
        <TouchableOpacity style={styles.refreshButton} onPress={refresh}>
          <Text style={styles.refreshButtonText}>Refresh</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.tabContainer}>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'lightning' && styles.activeTab]}
          onPress={() => setActiveTab('lightning')}
        >
          <Text style={[styles.tabText, activeTab === 'lightning' && styles.activeTabText]}>
            Lightning
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'bitcoin' && styles.activeTab]}
          onPress={() => setActiveTab('bitcoin')}
        >
          <Text style={[styles.tabText, activeTab === 'bitcoin' && styles.activeTabText]}>
            Bitcoin
          </Text>
        </TouchableOpacity>
      </View>

      <WalletCard
        balance={activeTab === 'lightning' ? balance.lightning : balance.bitcoin}
        currency={activeTab}
      />

      <ActionButtons
        onSend={handleSendPayment}
        onReceive={handleReceivePayment}
        disabled={isLoading}
      />

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Recent Payments</Text>
        <PaymentList
          payments={payments.filter(p => p.type === activeTab)}
          currency={activeTab}
        />
      </View>

      <View style={styles.infoSection}>
        <Text style={styles.infoTitle}>Instant Access</Text>
        <Text style={styles.infoText}>
          {activeTab === 'lightning'
            ? 'Lightning Network provides instant Bitcoin payments with minimal fees, perfect for everyday transactions while your main Bitcoin continues earning yield.'
            : 'Bitcoin on-chain payments provide maximum security and decentralization for larger transactions.'
          }
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
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.lg,
  },
  title: {
    fontSize: Typography.xl,
    fontWeight: Typography.bold,
    color: Colors.text,
  },
  refreshButton: {
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    backgroundColor: Colors.backgroundSecondary,
    borderRadius: BorderRadius.md,
  },
  refreshButtonText: {
    fontSize: Typography.sm,
    color: Colors.textSecondary,
    fontWeight: Typography.semibold,
  },
  tabContainer: {
    flexDirection: 'row',
    backgroundColor: Colors.backgroundSecondary,
    borderRadius: BorderRadius.lg,
    padding: Spacing.xs,
    marginBottom: Spacing.lg,
  },
  tab: {
    flex: 1,
    paddingVertical: Spacing.sm,
    paddingHorizontal: Spacing.md,
    borderRadius: BorderRadius.md,
    alignItems: 'center',
  },
  activeTab: {
    backgroundColor: Colors.bitcoin,
  },
  tabText: {
    fontSize: Typography.sm,
    fontWeight: Typography.semibold,
    color: Colors.textSecondary,
  },
  activeTabText: {
    color: Colors.text,
  },
  section: {
    marginTop: Spacing.lg,
  },
  sectionTitle: {
    fontSize: Typography.lg,
    fontWeight: Typography.semibold,
    color: Colors.text,
    marginBottom: Spacing.md,
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