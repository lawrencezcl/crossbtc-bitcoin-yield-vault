import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Switch,
  Alert,
} from 'react-native';

// Components
import { SettingsItem } from '@/components/settings/SettingsItem';
import { WalletSelector } from '@/components/settings/WalletSelector';

// Theme
import { Colors, Spacing, Typography, BorderRadius } from '@/constants/theme';

export const SettingsScreen: React.FC = () => {
  const [biometricEnabled, setBiometricEnabled] = React.useState(false);
  const [notificationsEnabled, setNotificationsEnabled] = React.useState(true);
  const [darkMode, setDarkMode] = React.useState(true);

  const handleAbout = () => {
    Alert.alert(
      'About CrossBTC',
      'Cross-Chain Bitcoin Yield Vault v1.0.0\n\nEarn yield on your Bitcoin with instant Lightning Network access.\n\nBuilt with ❤️ by the CrossBTC Team',
      [{ text: 'OK' }]
    );
  };

  const handleSecurity = () => {
    Alert.alert(
      'Security',
      'Manage your security settings including biometric authentication and encryption options.',
      [{ text: 'OK' }]
    );
  };

  const handleExportData = () => {
    Alert.alert(
      'Export Data',
      'Export your transaction history and vault data for backup purposes.',
      [
        { text: 'Export', style: 'default' },
        { text: 'Cancel', style: 'cancel' },
      ]
    );
  };

  const handleSignOut = () => {
    Alert.alert(
      'Sign Out',
      'Are you sure you want to sign out? Make sure you have backed up your wallet.',
      [
        { text: 'Sign Out', style: 'destructive' },
        { text: 'Cancel', style: 'cancel' },
      ]
    );
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.contentContainer}>
      <View style={styles.header}>
        <Text style={styles.title}>Settings</Text>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Wallet</Text>
        <WalletSelector />
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Security</Text>

        <SettingsItem
          label="Biometric Authentication"
          description="Use Face ID or fingerprint to secure your wallet"
          type="toggle"
          value={biometricEnabled}
          onToggle={setBiometricEnabled}
        />

        <SettingsItem
          label="Security Settings"
          description="Advanced security options"
          type="button"
          onPress={handleSecurity}
        />
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Preferences</Text>

        <SettingsItem
          label="Push Notifications"
          description="Receive alerts for deposits and yield payments"
          type="toggle"
          value={notificationsEnabled}
          onToggle={setNotificationsEnabled}
        />

        <SettingsItem
          label="Dark Mode"
          description="Use dark theme"
          type="toggle"
          value={darkMode}
          onToggle={setDarkMode}
        />
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Data</Text>

        <SettingsItem
          label="Export Transaction History"
          description="Download your complete transaction history"
          type="button"
          onPress={handleExportData}
        />

        <SettingsItem
          label="Clear Cache"
          description="Clear app cache to free up space"
          type="button"
          onPress={() => Alert.alert('Clear Cache', 'Cache cleared successfully!')}
        />
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Support</Text>

        <SettingsItem
          label="Help Center"
          description="Get help with using CrossBTC"
          type="button"
          onPress={() => Alert.alert('Help Center', 'Opening help center...')}
        />

        <SettingsItem
          label="Contact Support"
          description="Get in touch with our support team"
          type="button"
          onPress={() => Alert.alert('Support', 'support@crossbtc.io')}
        />

        <SettingsItem
          label="About"
          description="App version and information"
          type="button"
          onPress={handleAbout}
        />
      </View>

      <View style={styles.section}>
        <TouchableOpacity style={styles.signOutButton} onPress={handleSignOut}>
          <Text style={styles.signOutButtonText}>Sign Out</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.footer}>
        <Text style={styles.footerText}>
          CrossBTC v1.0.0
        </Text>
        <Text style={styles.footerText}>
          Made with ❤️ for Bitcoin
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
  header: {
    marginBottom: Spacing.xl,
  },
  title: {
    fontSize: Typography.xl,
    fontWeight: Typography.bold,
    color: Colors.text,
  },
  section: {
    marginBottom: Spacing.xl,
  },
  sectionTitle: {
    fontSize: Typography.lg,
    fontWeight: Typography.semibold,
    color: Colors.text,
    marginBottom: Spacing.md,
  },
  signOutButton: {
    backgroundColor: Colors.error,
    paddingVertical: Spacing.md,
    paddingHorizontal: Spacing.lg,
    borderRadius: BorderRadius.lg,
    alignItems: 'center',
  },
  signOutButtonText: {
    fontSize: Typography.base,
    fontWeight: Typography.semibold,
    color: Colors.text,
  },
  footer: {
    alignItems: 'center',
    marginTop: Spacing.xl,
    marginBottom: Spacing.lg,
  },
  footerText: {
    fontSize: Typography.sm,
    color: Colors.textTertiary,
    marginBottom: Spacing.xs,
  },
});