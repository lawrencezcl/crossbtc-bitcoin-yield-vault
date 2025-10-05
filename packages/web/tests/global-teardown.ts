import { FullConfig } from '@playwright/test';

async function globalTeardown(config: FullConfig) {
  console.log('🧹 Starting global teardown for Cross-Chain Bitcoin Yield Vault E2E tests');

  // Cleanup test data, database connections, etc.
  console.log('🗑️ Cleaning up test data...');

  // Close any open connections or perform other cleanup tasks
  console.log('✅ Global teardown completed');
}

export default globalTeardown;