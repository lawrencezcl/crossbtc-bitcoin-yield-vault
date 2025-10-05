import { chromium, FullConfig } from '@playwright/test';

async function globalSetup(config: FullConfig) {
  console.log('🚀 Starting global setup for Cross-Chain Bitcoin Yield Vault E2E tests');

  // Setup database or other global state if needed
  console.log('📊 Setting up test data...');

  // Wait for the application to be ready
  const browser = await chromium.launch();
  const context = await browser.newContext();
  const page = await context.newPage();

  try {
    // Check if the application is running
    await page.goto(config.webServer?.url || 'http://localhost:3000');
    await page.waitForLoadState('networkidle');

    // Take a screenshot of the initial state for reference
    await page.screenshot({
      path: 'test-results/setup-initial-state.png',
      fullPage: true
    });

    console.log('✅ Application is ready for testing');
  } catch (error) {
    console.error('❌ Failed to connect to the application:', error);
    throw error;
  } finally {
    await context.close();
    await browser.close();
  }

  console.log('🎯 Global setup completed');
}

export default globalSetup;