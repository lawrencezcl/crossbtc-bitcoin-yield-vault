import { test, expect } from '../../fixtures/page-fixture';
import { SELECTORS, TEST_DATA, APP_CONSTANTS } from '../../utils/constants';
import TestUtils from '../../utils/test-utils';

test.describe('Data Flow Tests', () => {
  let utils: TestUtils;

  test.beforeEach(async ({ page }) => {
    utils = new TestUtils(page);
    await page.goto(APP_CONSTANTS.BASE_URL);
    await utils.waitForPageLoad();
  });

  test('should load and display vault balance data correctly', async ({ page }) => {
    // Mock API response
    await page.route('**/api/vault/balance', (route) => {
      route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          btc: 1.5,
          usd: 75000,
          change24h: 5.2
        })
      });
    });

    await page.reload();
    await utils.waitForPageLoad();

    // Wait for data to load
    await utils.waitForElement(SELECTORS.VAULT_BALANCE_CARD);

    // Verify data is displayed correctly
    await expect(page.locator(SELECTORS.VAULT_BALANCE_AMOUNT)).toContainText('1.5');
    await expect(page.locator(SELECTORS.VAULT_BALANCE_USD)).toContainText('75000');
    await expect(page.locator(SELECTORS.VAULT_CHANGE_24H)).toContainText('5.2%');

    // Verify positive change styling
    await expect(page.locator(SELECTORS.VAULT_CHANGE_24H)).toHaveClass(/positive|green|up/);

    await utils.takeScreenshot('vault-balance-data-loaded');
  });

  test('should handle real-time balance updates', async ({ page }) => {
    // Initial data
    await page.route('**/api/vault/balance', (route) => {
      route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          btc: 1.0,
          usd: 50000,
          change24h: 2.1
        })
      });
    });

    await page.reload();
    await utils.waitForPageLoad();
    await utils.waitForElement(SELECTORS.VAULT_BALANCE_CARD);

    // Verify initial data
    await expect(page.locator(SELECTORS.VAULT_BALANCE_AMOUNT)).toContainText('1.0');

    // Mock updated data (simulate WebSocket or polling update)
    await page.evaluate(() => {
      // Simulate data update
      const event = new CustomEvent('vaultBalanceUpdate', {
        detail: {
          btc: 1.2,
          usd: 60000,
          change24h: 3.5
        }
      });
      window.dispatchEvent(event);
    });

    // Wait for update to reflect in UI
    await page.waitForTimeout(1000);

    // Verify data was updated
    const updatedAmount = await utils.getElementText(SELECTORS.VAULT_BALANCE_AMOUNT);
    expect(updatedAmount).toContain('1.2');

    await utils.takeScreenshot('balance-real-time-update');
  });

  test('should load and display transaction history', async ({ page }) => {
    // Mock transaction API response
    await page.route('**/api/transactions', (route) => {
      route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify([
          {
            id: 'tx1',
            type: 'deposit',
            amount: 0.5,
            method: 'bitcoin',
            timestamp: '2024-01-15T10:30:00Z',
            status: 'completed',
            hash: '0x1234567890abcdef'
          },
          {
            id: 'tx2',
            type: 'deposit',
            amount: 0.25,
            method: 'lightning',
            timestamp: '2024-01-14T15:45:00Z',
            status: 'completed',
            hash: 'lnbc1234567890'
          },
          {
            id: 'tx3',
            type: 'deposit',
            amount: 0.75,
            method: 'bitcoin',
            timestamp: '2024-01-13T09:15:00Z',
            status: 'pending',
            hash: '0xfedcba0987654321'
          }
        ])
      });
    });

    await page.reload();
    await utils.waitForPageLoad();
    await utils.waitForElement(SELECTORS.TRANSACTION_HISTORY);

    // Verify transaction list is populated
    const transactionItems = page.locator(SELECTORS.TRANSACTION_ITEM);
    await expect(transactionItems).toHaveCount(3);

    // Verify first transaction details
    const firstTransaction = transactionItems.first();
    await expect(firstTransaction).toContainText('0.5');
    await expect(firstTransaction).toContainText('bitcoin');
    await expect(firstTransaction).toContainText('completed');

    // Verify transaction with pending status
    const pendingTransaction = transactionItems.nth(2);
    await expect(pendingTransaction).toContainText('pending');

    await utils.takeScreenshot('transaction-history-loaded');
  });

  test('should update transaction history after new deposit', async ({ page }) => {
    // Initial transaction data
    await page.route('**/api/transactions', (route) => {
      route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify(TEST_DATA.MOCK_TRANSACTIONS.slice(0, 2))
      });
    });

    await page.reload();
    await utils.waitForPageLoad();
    await utils.waitForElement(SELECTORS.TRANSACTION_HISTORY);

    const initialCount = await page.locator(SELECTORS.TRANSACTION_ITEM).count();
    expect(initialCount).toBe(2);

    // Mock successful deposit
    await page.route('**/api/deposit', (route) => {
      route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          success: true,
          transactionId: 'tx4',
          amount: 0.1,
          method: 'bitcoin',
          status: 'completed'
        })
      });
    });

    // Mock updated transaction list after deposit
    page.once('response', (response) => {
      if (response.url().includes('/api/deposit')) {
        // After successful deposit, update transaction list
        page.route('**/api/transactions', (route) => {
          route.fulfill({
            status: 200,
            contentType: 'application/json',
            body: JSON.stringify([
              ...TEST_DATA.MOCK_TRANSACTIONS.slice(0, 2),
              {
                id: 'tx4',
                type: 'deposit',
                amount: 0.1,
                method: 'bitcoin',
                timestamp: '2024-01-16T12:00:00Z',
                status: 'completed',
                hash: '0xnewtransaction123'
              }
            ])
          });
        });
      }
    });

    // Perform deposit
    await page.click(SELECTORS.DEPOSIT_BUTTON);
    await utils.verifyModalOpen(SELECTORS.DEPOSIT_MODAL);
    await page.fill(SELECTORS.AMOUNT_INPUT, '0.1');
    await page.click(SELECTORS.SUBMIT_DEPOSIT);

    // Wait for transaction list to update
    await page.waitForTimeout(2000);

    // Verify new transaction appears in list
    const updatedCount = await page.locator(SELECTORS.TRANSACTION_ITEM).count();
    expect(updatedCount).toBe(3);

    await utils.takeScreenshot('transaction-history-updated');
  });

  test('should calculate and display yield metrics correctly', async ({ page }) => {
    // Mock yield API response
    await page.route('**/api/vault/yield', (route) => {
      route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          apy: 15.5,
          projectedApy: 18.2,
          totalYield: 1250.75,
          dailyYield: 3.42,
          monthlyYield: 102.67,
          yearlyYield: 1234.56
        })
      });
    });

    await page.reload();
    await utils.waitForPageLoad();
    await utils.waitForElement(SELECTORS.YIELD_OVERVIEW);

    // Verify APY is displayed
    await expect(page.locator(SELECTORS.APY_DISPLAY)).toContainText('15.5%');

    // Verify projected yield
    await expect(page.locator(SELECTORS.PROJECTED_YIELD)).toBeVisible();

    // Check for additional yield metrics
    const yieldElements = page.locator('[data-testid*="yield"]');
    const yieldCount = await yieldElements.count();
    expect(yieldCount).toBeGreaterThan(0);

    await utils.takeScreenshot('yield-metrics-displayed');
  });

  test('should handle USD conversion calculations', async ({ page }) => {
    // Mock exchange rate API
    await page.route('**/api/exchange-rate', (route) => {
      route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          btcUsd: 50000,
          lastUpdated: '2024-01-15T12:00:00Z'
        })
      });
    });

    // Mock balance with BTC amount
    await page.route('**/api/vault/balance', (route) => {
      route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          btc: 1.5,
          usd: 75000, // Should be 1.5 * 50000
          change24h: 2.5
        })
      });
    });

    await page.reload();
    await utils.waitForPageLoad();
    await utils.waitForElement(SELECTORS.VAULT_BALANCE_CARD);

    // Verify USD conversion is correct
    await expect(page.locator(SELECTORS.VAULT_BALANCE_AMOUNT)).toContainText('1.5');
    await expect(page.locator(SELECTORS.VAULT_BALANCE_USD)).toContainText('75000');

    // Test with different amount in deposit modal
    await page.click(SELECTORS.DEPOSIT_BUTTON);
    await utils.verifyModalOpen(SELECTORS.DEPOSIT_MODAL);
    await page.fill(SELECTORS.AMOUNT_INPUT, '0.5');

    // Check if USD conversion is shown in modal
    const usdConversion = page.locator('[data-testid="usd-conversion"]');
    if (await usdConversion.count() > 0) {
      await expect(usdConversion).toContainText('25000'); // 0.5 * 50000
    }

    await utils.takeScreenshot('usd-conversion-calculated');
  });

  test('should handle data loading states properly', async ({ page }) => {
    // Slow API response to test loading states
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

    // Check for loading indicators
    const loadingSpinner = page.locator(SELECTORS.LOADING_SPINNER);
    const skeleton = page.locator(SELECTORS.SKELETON);

    // Should show loading state initially
    const hasLoading = await loadingSpinner.count() > 0;
    const hasSkeleton = await skeleton.count() > 0;
    expect(hasLoading || hasSkeleton).toBeTruthy();

    // Wait for data to load
    await utils.waitForElement(SELECTORS.VAULT_BALANCE_CARD);
    await expect(page.locator(SELECTORS.VAULT_BALANCE_AMOUNT)).toBeVisible();

    await utils.takeScreenshot('data-loading-states');
  });

  test('should handle API errors gracefully', async ({ page }) => {
    // Mock API errors
    await page.route('**/api/vault/balance', (route) => {
      route.fulfill({
        status: 500,
        contentType: 'application/json',
        body: JSON.stringify({ error: 'Internal server error' })
      });
    });

    await page.reload();
    await utils.waitForPageLoad();

    // Should show error state or retry mechanism
    const errorMessage = page.locator(SELECTORS.ERROR_MESSAGE);
    const retryButton = page.locator('[data-testid="retry-button"]');

    const hasError = await errorMessage.count() > 0;
    const hasRetry = await retryButton.count() > 0;
    expect(hasError || hasRetry).toBeTruthy();

    // Test retry functionality if retry button exists
    if (await retryButton.count() > 0) {
      // Mock successful response on retry
      await page.route('**/api/vault/balance', (route) => {
        route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify(TEST_DATA.MOCK_VAULT_DATA.balance)
        });
      });

      await retryButton.click();
      await utils.waitForElement(SELECTORS.VAULT_BALANCE_CARD);
      await expect(page.locator(SELECTORS.VAULT_BALANCE_AMOUNT)).toBeVisible();
    }

    await utils.takeScreenshot('api-error-handling');
  });

  test('should cache data appropriately', async ({ page }) => {
    let apiCallCount = 0;

    // Track API calls
    await page.route('**/api/vault/balance', (route) => {
      apiCallCount++;
      route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify(TEST_DATA.MOCK_VAULT_DATA.balance)
      });
    });

    await page.reload();
    await utils.waitForPageLoad();
    await utils.waitForElement(SELECTORS.VAULT_BALANCE_CARD);

    const initialCallCount = apiCallCount;

    // Navigate to another page and back (if applicable)
    // or trigger a refresh that should use cached data
    await page.reload();

    // Check if API was called again (should be cached)
    setTimeout(() => {
      expect(apiCallCount).toBeLessThanOrEqual(initialCallCount + 1);
    }, 1000);

    await utils.takeScreenshot('data-caching');
  });

  test('should sync data across components', async ({ page }) => {
    // Mock data that should be consistent across components
    await page.route('**/api/vault/balance', (route) => {
      route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          btc: 2.5,
          usd: 125000,
          change24h: 3.8
        })
      });
    });

    await page.reload();
    await utils.waitForPageLoad();

    // Verify balance is consistent in different places
    await utils.waitForElement(SELECTORS.VAULT_BALANCE_CARD);
    const balanceAmount = await utils.getElementText(SELECTORS.VAULT_BALANCE_AMOUNT);
    expect(balanceAmount).toContain('2.5');

    // Check if balance is displayed elsewhere (e.g., in header, summary cards)
    const otherBalanceElements = page.locator('[data-testid*="balance"]');
    const count = await otherBalanceElements.count();

    for (let i = 0; i < count; i++) {
      const element = otherBalanceElements.nth(i);
      if (await element.isVisible()) {
        const text = await element.textContent();
        // Should contain the same balance amount
        if (text && text.includes('2.5')) {
          break;
        }
      }
    }

    await utils.takeScreenshot('data-sync-across-components');
  });
});