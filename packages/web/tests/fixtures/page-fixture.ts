import { test as base, expect, Page } from '@playwright/test';

// Define custom fixtures
export interface PageFixtures {
  authenticatedPage: Page;
  mockDataPage: Page;
}

// Extend base test with custom fixtures
export const test = base.extend<PageFixtures>({
  authenticatedPage: async ({ page, context }, use) => {
    // Setup authenticated state if needed
    // For now, we'll use the base page
    await use(page);
  },

  mockDataPage: async ({ page }, use) => {
    // Mock API responses for consistent testing
    await page.route('**/api/vault/balance', (route) => {
      route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          btc: 0.5,
          usd: 25000,
          change24h: 2.5
        })
      });
    });

    await page.route('**/api/vault/apy', (route) => {
      route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          apy: 12.5,
          projected: 15.2
        })
      });
    });

    await page.route('**/api/transactions', (route) => {
      route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify([
          {
            id: '1',
            type: 'deposit',
            amount: 0.1,
            method: 'bitcoin',
            timestamp: '2024-01-15T10:30:00Z',
            status: 'completed'
          },
          {
            id: '2',
            type: 'deposit',
            amount: 0.05,
            method: 'lightning',
            timestamp: '2024-01-14T15:45:00Z',
            status: 'completed'
          }
        ])
      });
    });

    await use(page);
  }
});

export { expect } from '@playwright/test';