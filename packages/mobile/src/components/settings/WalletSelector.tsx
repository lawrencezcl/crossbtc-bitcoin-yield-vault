import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  Alert,
  StyleSheet,
} from 'react-native';
import { Colors, Spacing, Typography, BorderRadius } from '@/constants/theme';
import { BitcoinIcon, LightningIcon, StarknetIcon } from '@/components/icons';

interface WalletOption {
  id: string;
  name: string;
  type: 'bitcoin' | 'lightning' | 'starknet';
  address: string;
  balance: number;
  connected: boolean;
}

export const WalletSelector: React.FC = () => {
  const [wallets, setWallets] = useState<WalletOption[]>([
    {
      id: '1',
      name: 'Xverse Wallet',
      type: 'bitcoin',
      address: 'bc1qxy2kgdygjrsqtzq2n0yrf2493p83kkfjhx0wlh',
      balance: 0.50000000,
      connected: true,
    },
    {
      id: '2',
      name: 'Lightning Wallet',
      type: 'lightning',
      address: 'lnbc1...xyz',
      balance: 0.02500000,
      connected: true,
    },
    {
      id: '3',
      name: 'Starknet Wallet',
      type: 'starknet',
      address: '0x1234...5678',
      balance: 0.00000000,
      connected: false,
    },
  ]);

  const handleWalletToggle = (walletId: string) => {
    Alert.alert(
      'Connect Wallet',
      'This will open the wallet connection screen.',
      [
        { text: 'Connect', onPress: () => {/* Handle wallet connection */ } },
        { text: 'Cancel', style: 'cancel' },
      ]
    );
  };

  const getWalletIcon = (type: WalletOption['type']) => {
    switch (type) {
      case 'bitcoin':
        return BitcoinIcon;
      case 'lightning':
        return LightningIcon;
      case 'starknet':
        return StarknetIcon;
      default:
        return BitcoinIcon;
    }
  };

  const getWalletColor = (type: WalletOption['type']) => {
    switch (type) {
      case 'bitcoin':
        return Colors.bitcoin;
      case 'lightning':
        return Colors.lightning;
      case 'starknet':
        return Colors.starknet;
      default:
        return Colors.textSecondary;
    }
  };

  return (
    <View style={styles.container}>
      {wallets.map((wallet) => {
        const Icon = getWalletIcon(wallet.type);
        const color = getWalletColor(wallet.type);

        return (
          <TouchableOpacity
            key={wallet.id}
            style={styles.walletItem}
            onPress={() => handleWalletToggle(wallet.id)}
            activeOpacity={0.7}
          >
            <View style={styles.walletLeft}>
              <View style={[styles.iconContainer, { backgroundColor: `${color}20` }]}>
                <Icon width={24} height={24} color={color} />
              </View>
              <View style={styles.walletInfo}>
                <Text style={styles.walletName}>{wallet.name}</Text>
                <Text style={styles.walletAddress} numberOfLines={1}>
                  {wallet.address}
                </Text>
                <Text style={styles.walletBalance}>
                  {wallet.balance.toFixed(8)} BTC
                </Text>
              </View>
            </View>

            <View style={styles.walletRight}>
              <View
                style={[
                  styles.statusDot,
                  { backgroundColor: wallet.connected ? Colors.success : Colors.textTertiary },
                ]}
              />
              <Text
                style={[
                  styles.statusText,
                  { color: wallet.connected ? Colors.success : Colors.textTertiary },
                ]}
              >
                {wallet.connected ? 'Connected' : 'Disconnected'}
              </Text>
            </View>
          </TouchableOpacity>
        );
      })}

      <TouchableOpacity style={styles.addWalletButton}>
        <Text style={styles.addWalletButtonText}>+ Connect New Wallet</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    gap: Spacing.sm,
  },
  walletItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: Spacing.md,
    backgroundColor: Colors.backgroundTertiary,
    borderRadius: BorderRadius.md,
  },
  walletLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  iconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: Spacing.md,
  },
  walletInfo: {
    flex: 1,
  },
  walletName: {
    fontSize: Typography.base,
    fontWeight: Typography.semibold,
    color: Colors.text,
    marginBottom: Spacing.xs,
  },
  walletAddress: {
    fontSize: Typography.sm,
    color: Colors.textSecondary,
    marginBottom: Spacing.xs,
  },
  walletBalance: {
    fontSize: Typography.sm,
    fontWeight: Typography.medium,
    color: Colors.bitcoin,
  },
  walletRight: {
    alignItems: 'flex-end',
  },
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginBottom: Spacing.xs,
  },
  statusText: {
    fontSize: Typography.xs,
    fontWeight: Typography.medium,
  },
  addWalletButton: {
    padding: Spacing.md,
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: BorderRadius.md,
    alignItems: 'center',
    marginTop: Spacing.sm,
  },
  addWalletButtonText: {
    fontSize: Typography.base,
    fontWeight: Typography.medium,
    color: Colors.bitcoin,
  },
});