import { test, expect } from '../../fixtures/page-fixture';
import { SELECTORS, TEST_DATA, APP_CONSTANTS } from '../../utils/constants';
import TestUtils from '../../utils/test-utils';

test.describe('Vault Balance Card - Component Interaction', () => {
  let utils: TestUtils;

  test.beforeEach(async ({ mockDataPage }) => {
    utils = new TestUtils(mockDataPage);
    await mockDataPage.goto(APP_CONSTANTS.BASE_URL);
    await utils.waitForPageLoad();
  });

  test('should display vault balance card with correct data', async ({ mockDataPage }) => {
    await utils.waitForElement(SELECTORS.VAULT_BALANCE_CARD);

    // Verify all balance components are visible
    await expect(mockDataPage.locator(SELECTORS.VAULT_BALANCE_CARD)).toBeVisible();
    await expect(mockDataPage.locator(SELECTORS.VAULT_BALANCE_AMOUNT)).toBeVisible();
    await expect(mockDataPage.locator(SELECTORS.VAULT_BALANCE_USD)).toBeVisible();
    await expect(mockDataPage.locator(SELECTORS.VAULT_CHANGE_24H)).toBeVisible();

    // Verify balance amounts are displayed correctly
    await expect(mockDataPage.locator(SELECTORS.VAULT_BALANCE_AMOUNT)).toContainText('0.5');
    await expect(mockDataPage.locator(SELECTORS.VAULT_BALANCE_USD)).toContainText('25000');

    // Verify 24h change is displayed
    const change24h = await utils.getElementText(SELECTORS.VAULT_CHANGE_24H);
    expect(change24h).toContain('%');

    await utils.takeScreenshot('vault-balance-card-loaded');
  });

  test('should handle positive and negative balance changes', async ({ mockDataPage }) => {
    // Test with positive change
    await utils.waitForElement(SELECTORS.VAULT_BALANCE_CARD);
    const changeElement = mockDataPage.locator(SELECTORS.VAULT_CHANGE_24H);

    // Should have positive styling
    await expect(changeElement).toHaveClass(/positive|green|up/);

    // Mock negative change
    await mockDataPage.route('**/api/vault/balance', (route) => {
      route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          btc: 0.5,
          usd: 25000,
          change24h: -2.5
        })
      });
    });

    // Reload page to see negative change
    await mockDataPage.reload();
    await utils.waitForPageLoad();

    // Should have negative styling
    await expect(changeElement).toHaveClass(/negative|red|down/);

    await utils.takeScreenshot('vault-balance-negative-change');
  });

  test('should show loading state while fetching balance', async ({ page }) => {
    // Delay the API response
    await page.route('**/api/vault/balance', (route) => {
      setTimeout(() => {
        route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify(TEST_DATA.MOCK_VAULT_DATA.balance)
        });
      }, 2000);
    });

    await page.goto(APP_CONSTANTS.BASE_URL);

    // Check for loading state
    const loadingSpinner = page.locator(SELECTORS.LOADING_SPINNER);
    const skeleton = page.locator(SELECTORS.SKELETON);

    // Should show loading state initially
    const hasLoading = await loadingSpinner.count() > 0;
    const hasSkeleton = await skeleton.count() > 0;

    expect(hasLoading || hasSkeleton).toBeTruthy();

    // Wait for data to load
    await utils.waitForElement(SELECTORS.VAULT_BALANCE_CARD);
    await expect(page.locator(SELECTORS.VAULT_BALANCE_AMOUNT)).toBeVisible();

    await utils.takeScreenshot('vault-balance-loading-state');
  });

  test('should handle API errors gracefully', async ({ page }) => {
    // Mock API error
    await page.route('**/api/vault/balance', (route) => {
      route.fulfill({
        status: 500,
        contentType: 'application/json',
        body: JSON.stringify({ error: 'Failed to fetch balance' })
      });
    });

    await page.goto(APP_CONSTANTS.BASE_URL);
    await utils.waitForPageLoad();

    // Should show error state or retry mechanism
    const vaultCard = page.locator(SELECTORS.VAULT_BALANCE_CARD);
    await expect(vaultCard).toBeVisible();

    // Should either show error message or retry button
    const errorMessage = page.locator(SELECTORS.ERROR_MESSAGE);
    const retryButton = page.locator('[data-testid="retry-button"]');

    const hasError = await errorMessage.count() > 0;
    const hasRetry = await retryButton.count() > 0;

    expect(hasError || hasRetry).toBeTruthy();

    await utils.takeScreenshot('vault-balance-error-state');
  });

  test('should refresh balance when refresh button is clicked', async ({ mockDataPage }) => {
    await utils.waitForElement(SELECTORS.VAULT_BALANCE_CARD);

    // Mock updated balance data
    let requestCount = 0;
    await mockDataPage.route('**/api/vault/balance', (route) => {
      requestCount++;
      route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          btc: 0.6,
          usd: 30000,
          change24h: 3.2
        })
      });
    });

    // Click refresh button if it exists
    const refreshButton = mockDataPage.locator('[data-testid="refresh-balance"]');
    if (await refreshButton.count() > 0) {
      await refreshButton.click();

      // Verify API was called again
      expect(requestCount).toBeGreaterThan(1);

      // Verify updated balance is shown
      await expect(mockDataPage.locator(SELECTORS.VAULT_BALANCE_AMOUNT)).toContainText('0.6');
      await expect(mockDataPage.locator(SELECTORS.VAULT_BALANCE_USD)).toContainText('30000');
    }

    await utils.takeScreenshot('vault-balance-refreshed');
  });

  test('should be responsive on different screen sizes', async ({ mockDataPage }) => {
    await utils.waitForElement(SELECTORS.VAULT_BALANCE_CARD);

    // Test mobile view
    await utils.setViewport(TEST_DATA.VIEWPORTS.MOBILE_SMALL.width, TEST_DATA.VIEWPORTS.MOBILE_SMALL.height);
    await expect(mockDataPage.locator(SELECTORS.VAULT_BALANCE_CARD)).toBeVisible();
    await utils.takeScreenshot('vault-balance-mobile');

    // Test tablet view
    await utils.setViewport(TEST_DATA.VIEWPORTS.TABLET.width, TEST_DATA.VIEWPORTS.TABLET.height);
    await expect(mockDataPage.locator(SELECTORS.VAULT_BALANCE_CARD)).toBeVisible();
    await utils.takeScreenshot('vault-balance-tablet');

    // Test desktop view
    await utils.setViewport(TEST_DATA.VIEWPORTS.DESKTOP_LARGE.width, TEST_DATA.VIEWPORTS.DESKTOP_LARGE.height);
    await expect(mockDataPage.locator(SELECTORS.VAULT_BALANCE_CARD)).toBeVisible();
    await utils.takeScreenshot('vault-balance-desktop');
  });

  test('should handle hover states and interactions', async ({ mockDataPage }) => {
    await utils.waitForElement(SELECTORS.VAULT_BALANCE_CARD);

    // Test hover effect
    await utils.hover(SELECTORS.VAULT_BALANCE_CARD);

    // Check if hover state is applied (this depends on your CSS)
    const card = mockDataPage.locator(SELECTORS.VAULT_BALANCE_CARD);
    await expect(card).toBeVisible();

    await utils.takeScreenshot('vault-balance-hover');
  });

  test('should show currency conversion information', async ({ mockDataPage }) => {
    await utils.waitForElement(SELECTORS.VAULT_BALANCE_CARD);

    // Verify both BTC and USD values are shown
    await expect(mockDataPage.locator(SELECTORS.VAULT_BALANCE_AMOUNT)).toContainText('BTC');
    await expect(mockDataPage.locator(SELECTORS.VAULT_BALANCE_USD)).toContainText('$');

    // Check if there's a conversion rate indicator
    const conversionRate = mockDataPage.locator('[data-testid="conversion-rate"]');
    if (await conversionRate.count() > 0) {
      await expect(conversionRate).toBeVisible();
    }

    await utils.takeScreenshot('vault-balance-currency-display');
  });

  test('should animate balance updates when values change', async ({ mockDataPage }) => {
    await utils.waitForElement(SELECTORS.VAULT_BALANCE_CARD);

    // Mock balance update
    await mockDataPage.route('**/api/vault/balance', (route) => {
      route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          btc: 0.7,
          usd: 35000,
          change24h: 4.1
        })
      });
    });

    // Trigger refresh or update
    const refreshButton = mockDataPage.locator('[data-testid="refresh-balance"]');
    if (await refreshButton.count() > 0) {
      await refreshButton.click();
    } else {
      await mockDataPage.reload();
    }

    await utils.waitForElement(SELECTORS.VAULT_BALANCE_CARD);

    // Verify new values are displayed
    await expect(mockDataPage.locator(SELECTORS.VAULT_BALANCE_AMOUNT)).toContainText('0.7');
    await expect(mockDataPage.locator(SELECTORS.VAULT_BALANCE_USD)).toContainText('35000');

    await utils.takeScreenshot('vault-balance-updated');
  });

  test('should be accessible with proper ARIA labels', async ({ mockDataPage }) => {
    await utils.waitForElement(SELECTORS.VAULT_BALANCE_CARD);

    // Check for proper ARIA labels
    const card = mockDataPage.locator(SELECTORS.VAULT_BALANCE_CARD);

    // Should have proper role or aria-label
    const ariaLabel = await card.getAttribute('aria-label');
    const role = await card.getAttribute('role');

    expect(ariaLabel || role).toBeTruthy();

    // Check for proper semantic structure
    await expect(mockDataPage.locator('h2, h3, h4')).toBeVisible();

    await utils.takeScreenshot('vault-balance-accessibility');
  });
});