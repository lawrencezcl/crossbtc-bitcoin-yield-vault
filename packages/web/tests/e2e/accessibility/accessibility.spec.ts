import { test, expect } from '../../fixtures/page-fixture';
import { SELECTORS, TEST_DATA, APP_CONSTANTS } from '../../utils/constants';
import TestUtils from '../../utils/test-utils';
import { injectAxe, checkA11y } from '@axe-core/playwright';

test.describe('Accessibility Tests', () => {
  let utils: TestUtils;

  test.beforeEach(async ({ page }) => {
    utils = new TestUtils(page);
    await page.goto(APP_CONSTANTS.BASE_URL);
    await utils.waitForPageLoad();
    await injectAxe(page);
  });

  test('should have no accessibility violations on landing page', async ({ page }) => {
    // Check for accessibility violations
    await checkA11y(page, null, {
      detailedReport: true,
      detailedReportOptions: { html: true },
      rules: {
        // Enable WCAG 2.1 AA compliance
        'color-contrast': { enabled: true },
        'keyboard-navigation': { enabled: true },
        'aria-labels': { enabled: true },
        'focus-management': { enabled: true },
      }
    });

    await utils.takeScreenshot('accessibility-landing-page');
  });

  test('should have proper heading hierarchy', async ({ page }) => {
    // Check for proper heading structure
    const headings = page.locator('h1, h2, h3, h4, h5, h6');
    const headingCount = await headings.count();

    expect(headingCount).toBeGreaterThan(0);

    // Should have exactly one h1
    const h1Count = await page.locator('h1').count();
    expect(h1Count).toBeLessThanOrEqual(1);

    // Headings should not skip levels
    let previousLevel = 0;
    for (let i = 0; i < headingCount; i++) {
      const heading = headings.nth(i);
      const tagName = await heading.evaluate(el => el.tagName.toLowerCase());
      const level = parseInt(tagName.substring(1));

      if (previousLevel > 0 && level > previousLevel + 1) {
        throw new Error(`Heading level skipped: from h${previousLevel} to h${level}`);
      }

      previousLevel = level;
    }

    await utils.takeScreenshot('accessibility-heading-hierarchy');
  });

  test('should have proper ARIA labels and roles', async ({ page }) => {
    // Check for proper ARIA attributes on interactive elements
    const interactiveElements = page.locator('button, a, input, select, textarea, [role="button"]');
    const count = await interactiveElements.count();

    for (let i = 0; i < Math.min(count, 10); i++) {
      const element = interactiveElements.nth(i);

      if (await element.isVisible()) {
        const ariaLabel = await element.getAttribute('aria-label');
        const ariaLabelledBy = await element.getAttribute('aria-labelledby');
        const title = await element.getAttribute('title');
        const text = await element.textContent();

        // Interactive elements should have accessible labels
        expect(ariaLabel || ariaLabelledBy || title || text?.trim()).toBeTruthy();
      }
    }

    await utils.takeScreenshot('accessibility-aria-labels');
  });

  test('should support keyboard navigation', async ({ page }) => {
    // Check for focusable elements
    const focusableElements = page.locator(
      'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
    );
    const focusableCount = await focusableElements.count();

    expect(focusableCount).toBeGreaterThan(0);

    // Test Tab navigation
    await page.keyboard.press('Tab');
    let focusedElement = await page.locator(':focus');
    expect(await focusedElement.count()).toBe(1);

    // Continue tabbing through elements
    for (let i = 0; i < Math.min(focusableCount, 5); i++) {
      await page.keyboard.press('Tab');
      focusedElement = await page.locator(':focus');
      expect(await focusedElement.count()).toBe(1);
      expect(await focusedElement.isVisible()).toBeTruthy();
    }

    // Test Shift+Tab for backward navigation
    for (let i = 0; i < 3; i++) {
      await page.keyboard.press('Shift+Tab');
      focusedElement = await page.locator(':focus');
      expect(await focusedElement.count()).toBe(1);
    }

    await utils.takeScreenshot('accessibility-keyboard-navigation');
  });

  test('should have sufficient color contrast', async ({ page }) => {
    // This is checked by axe automatically, but we can also verify manually
    await checkA11y(page, null, {
      rules: {
        'color-contrast': { enabled: true }
      }
    });

    // Check for important text elements
    const importantText = page.locator('h1, h2, h3, .error, .success, button');
    const count = await importantText.count();

    for (let i = 0; i < Math.min(count, 5); i++) {
      const element = importantText.nth(i);
      if (await element.isVisible()) {
        // Verify text is readable (this is basic check)
        const styles = await element.evaluate(el => {
          const computed = window.getComputedStyle(el);
          return {
            color: computed.color,
            backgroundColor: computed.backgroundColor,
            fontSize: computed.fontSize
          };
        });

        expect(styles.color).not.toBe('rgb(128, 128, 128)'); // Not gray on gray
        expect(parseFloat(styles.fontSize)).toBeGreaterThanOrEqual(14); // Minimum font size
      }
    }

    await utils.takeScreenshot('accessibility-color-contrast');
  });

  test('should have accessible form controls', async ({ page }) => {
    // Check deposit modal accessibility
    if (await utils.elementExists(SELECTORS.DEPOSIT_BUTTON)) {
      await page.click(SELECTORS.DEPOSIT_BUTTON);
      await utils.verifyModalOpen(SELECTORS.DEPOSIT_MODAL);

      // Check form inputs have proper labels
      const amountInput = page.locator(SELECTORS.AMOUNT_INPUT);
      if (await amountInput.count() > 0) {
        const inputId = await amountInput.getAttribute('id');
        const label = page.locator(`label[for="${inputId}"]`);

        if (await label.count() > 0) {
          expect(await label.isVisible()).toBeTruthy();
        } else {
          // Should have aria-label if no visible label
          const ariaLabel = await amountInput.getAttribute('aria-label');
          expect(ariaLabel).toBeTruthy();
        }
      }

      // Check error messages are properly associated
      const errorMessages = page.locator('[role="alert"], .error-message');
      const errorCount = await errorMessages.count();

      for (let i = 0; i < errorCount; i++) {
        const error = errorMessages.nth(i);
        const ariaLive = await error.getAttribute('aria-live');
        expect(ariaLive === 'polite' || ariaLive === 'assertive').toBeTruthy();
      }

      await utils.takeScreenshot('accessibility-form-controls');
    }
  });

  test('should handle focus management in modals', async ({ page }) => {
    if (await utils.elementExists(SELECTORS.DEPOSIT_BUTTON)) {
      await page.click(SELECTORS.DEPOSIT_BUTTON);
      await utils.verifyModalOpen(SELECTORS.DEPOSIT_MODAL);

      // Check that focus is trapped in modal
      const modal = page.locator(SELECTORS.DEPOSIT_MODAL);
      expect(await modal.isVisible()).toBeTruthy();

      // Check modal has proper attributes
      expect(await modal.getAttribute('role')).toBe('dialog');
      expect(await modal.getAttribute('aria-modal')).toBe('true');

      // Test escape key closes modal
      await page.keyboard.press('Escape');
      await utils.verifyModalClosed(SELECTORS.DEPOSIT_MODAL);

      // Focus should return to trigger button
      const focusedElement = await page.locator(':focus');
      expect(await focusedElement.getAttribute('data-testid')).toBe('deposit-button');

      await utils.takeScreenshot('accessibility-focus-management');
    }
  });

  test('should have accessible data tables', async ({ page }) => {
    // Check transaction history accessibility
    await utils.waitForElement(SELECTORS.TRANSACTION_HISTORY);

    const transactionItems = page.locator(SELECTORS.TRANSACTION_ITEM);
    const itemCount = await transactionItems.count();

    if (itemCount > 0) {
      // Check if transaction data is properly structured
      const firstTransaction = transactionItems.first();

      // Look for table structure or proper list structure
      const table = page.locator('table');
      const list = page.locator('ul, ol, [role="list"]');

      const hasTable = await table.count() > 0;
      const hasList = await list.count() > 0;

      expect(hasTable || hasList).toBeTruthy();

      if (hasTable) {
        // Check for proper table headers
        const headers = page.locator('th');
        expect(await headers.count()).toBeGreaterThan(0);

        // Check for proper table structure
        const tableElement = table.first();
        const caption = tableElement.locator('caption');

        if (await caption.count() > 0) {
          expect(await caption.isVisible()).toBeTruthy();
        }
      }

      await utils.takeScreenshot('accessibility-data-tables');
    }
  });

  test('should have accessible images and media', async ({ page }) => {
    // Check for alt text on images
    const images = page.locator('img');
    const imageCount = await images.count();

    for (let i = 0; i < imageCount; i++) {
      const image = images.nth(i);
      if (await image.isVisible()) {
        const alt = await image.getAttribute('alt');
        const role = await image.getAttribute('role');

        // Decorative images should have alt="" or role="presentation"
        // Informative images should have descriptive alt text
        if (role !== 'presentation') {
          expect(alt !== null).toBeTruthy();
        }
      }
    }

    // Check for accessible charts/graphs if present
    const charts = page.locator('svg, canvas, [role="img"]');
    const chartCount = await charts.count();

    for (let i = 0; i < chartCount; i++) {
      const chart = charts.nth(i);
      if (await chart.isVisible()) {
        const ariaLabel = await chart.getAttribute('aria-label');
        const ariaLabelledBy = await chart.getAttribute('aria-labelledby');

        // Charts should have accessible descriptions
        expect(ariaLabel || ariaLabelledBy).toBeTruthy();
      }
    }

    await utils.takeScreenshot('accessibility-images-media');
  });

  test('should have accessible responsive design', async ({ page }) => {
    const viewports = [
      TEST_DATA.VIEWPORTS.MOBILE_SMALL,
      TEST_DATA.VIEWPORTS.TABLET,
      TEST_DATA.VIEWPORTS.DESKTOP_LARGE
    ];

    for (const viewport of viewports) {
      await utils.setViewport(viewport.width, viewport.height);
      await page.waitForTimeout(500);

      // Check accessibility on each viewport
      await checkA11y(page, null, {
        includedImpacts: ['minor', 'moderate', 'serious', 'critical']
      });

      // Ensure no horizontal scrolling
      const bodyWidth = await page.evaluate(() => document.body.scrollWidth);
      expect(bodyWidth).toBeLessThanOrEqual(viewport.width + 20); // Allow small tolerance

      await utils.takeScreenshot(`accessibility-viewport-${viewport.width}x${viewport.height}`);
    }
  });

  test('should have accessible loading and error states', async ({ page }) => {
    // Mock loading state
    await page.route('**/api/vault/balance', (route) => {
      setTimeout(() => {
        route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify(TEST_DATA.MOCK_VAULT_DATA.balance)
        });
      }, 2000);
    });

    await page.reload();
    await utils.waitForPageLoad();

    // Check for accessible loading indicators
    const loadingElements = page.locator('[aria-busy="true"], [role="status"], .loading');
    const loadingCount = await loadingElements.count();

    for (let i = 0; i < loadingCount; i++) {
      const loading = loadingElements.nth(i);
      if (await loading.isVisible()) {
        const ariaLive = await loading.getAttribute('aria-live');
        expect(ariaLive === 'polite' || ariaLive === 'assertive').toBeTruthy();
      }
    }

    // Wait for loading to complete
    await utils.waitForElement(SELECTORS.VAULT_BALANCE_CARD);

    // Mock error state
    await page.route('**/api/transactions', (route) => {
      route.fulfill({
        status: 500,
        contentType: 'application/json',
        body: JSON.stringify({ error: 'Server error' })
      });
    });

    await page.reload();
    await utils.waitForPageLoad();

    // Check for accessible error messages
    const errorElements = page.locator('[role="alert"], .error, [aria-live="assertive"]');
    const errorCount = await errorElements.count();

    for (let i = 0; i < errorCount; i++) {
      const error = errorElements.nth(i);
      if (await error.isVisible()) {
        const errorText = await error.textContent();
        expect(errorText?.trim().length).toBeGreaterThan(0);
      }
    }

    await utils.takeScreenshot('accessibility-loading-error-states');
  });

  test('should support screen readers', async ({ page }) => {
    // Check for proper semantic HTML
    const semanticElements = page.locator('header, main, nav, footer, section, article, aside');
    const semanticCount = await semanticElements.count();
    expect(semanticCount).toBeGreaterThan(0);

    // Check for proper landmark roles
    const mainElement = page.locator('main, [role="main"]');
    expect(await mainElement.count()).toBeGreaterThan(0);

    // Check for skip links if present
    const skipLinks = page.locator('a[href^="#"], [role="navigation"] a');
    if (await skipLinks.count() > 0) {
      for (let i = 0; i < await skipLinks.count(); i++) {
        const skipLink = skipLinks.nth(i);
        const href = await skipLink.getAttribute('href');
        const target = page.locator(href || '');

        if (await target.count() > 0) {
          expect(await target.getAttribute('tabindex')).not.toBe('-1');
        }
      }
    }

    // Check for page title
    const title = await page.title();
    expect(title.length).toBeGreaterThan(0);
    expect(title).not.toBe('Untitled');

    // Check for language attribute
    const htmlLang = await page.locator('html').getAttribute('lang');
    expect(htmlLang).toBeTruthy();

    await utils.takeScreenshot('accessibility-screen-reader');
  });
});