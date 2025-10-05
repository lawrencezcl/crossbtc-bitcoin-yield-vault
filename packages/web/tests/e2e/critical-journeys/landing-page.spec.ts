import { test, expect } from '../../fixtures/page-fixture';
import { SELECTORS, TEST_DATA, APP_CONSTANTS } from '../../utils/constants';
import TestUtils from '../../utils/test-utils';

test.describe('Landing Page - Critical User Journey', () => {
  let utils: TestUtils;

  test.beforeEach(async ({ page }) => {
    utils = new TestUtils(page);
  });

  test('should load landing page successfully', async ({ page }) => {
    await page.goto(APP_CONSTANTS.BASE_URL);
    await utils.waitForPageLoad();

    // Verify page title
    await expect(page).toHaveTitle(/Cross-Chain Bitcoin Yield Vault/);

    // Verify main components are visible
    await utils.waitForElement(SELECTORS.HEADER);
    await utils.waitForElement(SELECTORS.MAIN_CONTENT);
    await utils.waitForElement(SELECTORS.HERO_SECTION);

    // Verify application name is present
    await expect(page.locator(SELECTORS.HEADER)).toContainText(APP_CONSTANTS.APP_NAME);

    // Take screenshot for visual regression
    await utils.takeScreenshot('landing-page-loaded');
  });

  test('should display vault balance information', async ({ mockDataPage }) => {
    utils = new TestUtils(mockDataPage);
    await mockDataPage.goto(APP_CONSTANTS.BASE_URL);
    await utils.waitForPageLoad();

    // Wait for vault balance card to load
    await utils.waitForElement(SELECTORS.VAULT_BALANCE_CARD);

    // Verify vault balance is displayed
    await expect(mockDataPage.locator(SELECTORS.VAULT_BALANCE_AMOUNT)).toBeVisible();
    await expect(mockDataPage.locator(SELECTORS.VAULT_BALANCE_USD)).toBeVisible();
    await expect(mockDataPage.locator(SELECTORS.VAULT_CHANGE_24H)).toBeVisible();

    // Verify the values are not empty
    const btcAmount = await utils.getElementText(SELECTORS.VAULT_BALANCE_AMOUNT);
    const usdAmount = await utils.getElementText(SELECTORS.VAULT_BALANCE_USD);
    const change24h = await utils.getElementText(SELECTORS.VAULT_CHANGE_24H);

    expect(btcAmount).toBeTruthy();
    expect(usdAmount).toBeTruthy();
    expect(change24h).toBeTruthy();

    // Verify the data matches our mock data
    await expect(mockDataPage.locator(SELECTORS.VAULT_BALANCE_AMOUNT)).toContainText('0.5');
    await expect(mockDataPage.locator(SELECTORS.VAULT_BALANCE_USD)).toContainText('25000');

    await utils.takeScreenshot('vault-balance-display');
  });

  test('should display yield overview information', async ({ mockDataPage }) => {
    utils = new TestUtils(mockDataPage);
    await mockDataPage.goto(APP_CONSTANTS.BASE_URL);
    await utils.waitForPageLoad();

    // Wait for yield overview to load
    await utils.waitForElement(SELECTORS.YIELD_OVERVIEW);

    // Verify APY is displayed
    await expect(mockDataPage.locator(SELECTORS.APY_DISPLAY)).toBeVisible();
    await expect(mockDataPage.locator(SELECTORS.PROJECTED_YIELD)).toBeVisible();

    // Verify APY value is reasonable
    const apyText = await utils.getElementText(SELECTORS.APY_DISPLAY);
    expect(apyText).toContain('%');

    // Verify projected yield is displayed
    const projectedYield = await utils.getElementText(SELECTORS.PROJECTED_YIELD);
    expect(projectedYield).toBeTruthy();

    await utils.takeScreenshot('yield-overview-display');
  });

  test('should show transaction history', async ({ mockDataPage }) => {
    utils = new TestUtils(mockDataPage);
    await mockDataPage.goto(APP_CONSTANTS.BASE_URL);
    await utils.waitForPageLoad();

    // Wait for transaction history to load
    await utils.waitForElement(SELECTORS.TRANSACTION_HISTORY);

    // Verify transaction list is visible
    await expect(mockDataPage.locator(SELECTORS.TRANSACTION_LIST)).toBeVisible();

    // Verify at least one transaction is displayed
    await expect(mockDataPage.locator(SELECTORS.TRANSACTION_ITEM)).toHaveCount(TEST_DATA.MOCK_TRANSACTIONS.length);

    // Verify transaction data structure
    const firstTransaction = mockDataPage.locator(SELECTORS.TRANSACTION_ITEM).first();
    await expect(firstTransaction).toBeVisible();

    await utils.takeScreenshot('transaction-history-display');
  });

  test('should be responsive on different viewports', async ({ page }) => {
    await page.goto(APP_CONSTANTS.BASE_URL);
    await utils.waitForPageLoad();

    // Test mobile viewport
    await utils.setViewport(TEST_DATA.VIEWPORTS.MOBILE_SMALL.width, TEST_DATA.VIEWPORTS.MOBILE_SMALL.height);
    await expect(page.locator(SELECTORS.HEADER)).toBeVisible();
    await expect(page.locator(SELECTORS.MAIN_CONTENT)).toBeVisible();
    await utils.takeScreenshot('mobile-viewport');

    // Test tablet viewport
    await utils.setViewport(TEST_DATA.VIEWPORTS.TABLET.width, TEST_DATA.VIEWPORTS.TABLET.height);
    await expect(page.locator(SELECTORS.HEADER)).toBeVisible();
    await expect(page.locator(SELECTORS.MAIN_CONTENT)).toBeVisible();
    await utils.takeScreenshot('tablet-viewport');

    // Test desktop viewport
    await utils.setViewport(TEST_DATA.VIEWPORTS.DESKTOP_LARGE.width, TEST_DATA.VIEWPORTS.DESKTOP_LARGE.height);
    await expect(page.locator(SELECTORS.HEADER)).toBeVisible();
    await expect(page.locator(SELECTORS.MAIN_CONTENT)).toBeVisible();
    await utils.takeScreenshot('desktop-viewport');
  });

  test('should handle network errors gracefully', async ({ page }) => {
    // Mock network failure
    await page.route('**/api/**', (route) => {
      route.fulfill({
        status: 500,
        contentType: 'application/json',
        body: JSON.stringify({ error: 'Internal Server Error' })
      });
    });

    await page.goto(APP_CONSTANTS.BASE_URL);
    await utils.waitForPageLoad();

    // Verify page still loads even with API errors
    await expect(page.locator(SELECTORS.HEADER)).toBeVisible();
    await expect(page.locator(SELECTORS.MAIN_CONTENT)).toBeVisible();

    // Verify error handling is present
    // This will depend on how your app handles errors
    await utils.takeScreenshot('network-error-handling');
  });

  test('should have proper accessibility attributes', async ({ page }) => {
    await page.goto(APP_CONSTANTS.BASE_URL);
    await utils.waitForPageLoad();

    // Check for proper semantic HTML
    await expect(page.locator('main')).toBeVisible();
    await expect(page.locator('header')).toBeVisible();
    await expect(page.locator('nav')).toBeVisible();

    // Check for ARIA labels where appropriate
    await expect(page.locator('[role="main"]')).toBeVisible();

    // Check for proper heading hierarchy
    const h1 = page.locator('h1');
    await expect(h1).toBeVisible();
    const h1Count = await h1.count();
    expect(h1Count).toBeLessThanOrEqual(1); // Should have at most one h1

    await utils.takeScreenshot('accessibility-check');
  });

  test('should load within performance thresholds', async ({ page }) => {
    const startTime = Date.now();

    await page.goto(APP_CONSTANTS.BASE_URL);
    await utils.waitForPageLoad();

    const loadTime = Date.now() - startTime;

    // Verify page loads within acceptable time
    expect(loadTime).toBeLessThan(TEST_DATA.PERFORMANCE_THRESHOLDS.MAX_PAGE_LOAD_TIME);

    console.log(`Page loaded in ${loadTime}ms`);
  });

  test('should have working navigation', async ({ page }) => {
    await page.goto(APP_CONSTANTS.BASE_URL);
    await utils.waitForPageLoad();

    // Check if navigation elements are present
    const navigation = page.locator(SELECTORS.NAVIGATION);
    if (await navigation.count() > 0) {
      await expect(navigation).toBeVisible();
    }

    // Check for mobile menu toggle on mobile viewport
    await utils.setViewport(TEST_DATA.VIEWPORTS.MOBILE_SMALL.width, TEST_DATA.VIEWPORTS.MOBILE_SMALL.height);
    const mobileMenuToggle = page.locator(SELECTORS.MOBILE_MENU_TOGGLE);
    if (await mobileMenuToggle.count() > 0) {
      await expect(mobileMenuToggle).toBeVisible();
    }

    await utils.takeScreenshot('navigation-elements');
  });
});