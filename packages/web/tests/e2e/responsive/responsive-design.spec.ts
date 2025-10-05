import { test, expect } from '../../fixtures/page-fixture';
import { SELECTORS, TEST_DATA, APP_CONSTANTS } from '../../utils/constants';
import TestUtils from '../../utils/test-utils';

test.describe('Responsive Design Tests', () => {
  let utils: TestUtils;

  test.beforeEach(async ({ mockDataPage }) => {
    utils = new TestUtils(mockDataPage);
  });

  test.describe('Mobile Viewports', () => {
    test('should display correctly on iPhone SE (375x667)', async ({ mockDataPage }) => {
      await utils.setViewport(TEST_DATA.VIEWPORTS.MOBILE_SMALL.width, TEST_DATA.VIEWPORTS.MOBILE_SMALL.height);
      await mockDataPage.goto(APP_CONSTANTS.BASE_URL);
      await utils.waitForPageLoad();

      // Check main elements are visible and properly sized
      await expect(mockDataPage.locator(SELECTORS.HEADER)).toBeVisible();
      await expect(mockDataPage.locator(SELECTORS.MAIN_CONTENT)).toBeVisible();
      await expect(mockDataPage.locator(SELECTORS.VAULT_BALANCE_CARD)).toBeVisible();

      // Check for mobile-specific elements
      const mobileMenu = mockDataPage.locator(SELECTORS.MOBILE_MENU_TOGGLE);
      if (await mobileMenu.count() > 0) {
        await expect(mobileMenu).toBeVisible();
      }

      // Verify no horizontal scrolling
      const bodyWidth = await mockDataPage.evaluate(() => document.body.scrollWidth);
      const viewportWidth = TEST_DATA.VIEWPORTS.MOBILE_SMALL.width;
      expect(bodyWidth).toBeLessThanOrEqual(viewportWidth);

      await utils.takeScreenshot('mobile-iphone-se');
    });

    test('should display correctly on iPhone 12 (390x844)', async ({ mockDataPage }) => {
      await utils.setViewport(TEST_DATA.VIEWPORTS.MOBILE_LARGE.width, TEST_DATA.VIEWPORTS.MOBILE_LARGE.height);
      await mockDataPage.goto(APP_CONSTANTS.BASE_URL);
      await utils.waitForPageLoad();

      // Check layout adapts to larger mobile screen
      await expect(mockDataPage.locator(SELECTORS.HEADER)).toBeVisible();
      await expect(mockDataPage.locator(SELECTORS.VAULT_BALANCE_CARD)).toBeVisible();
      await expect(mockDataPage.locator(SELECTORS.YIELD_OVERVIEW)).toBeVisible();

      // Test mobile menu functionality
      const mobileMenu = mockDataPage.locator(SELECTORS.MOBILE_MENU_TOGGLE);
      if (await mobileMenu.count() > 0) {
        await mobileMenu.click();
        await expect(mockDataPage.locator(SELECTORS.MOBILE_MENU)).toBeVisible();
      }

      await utils.takeScreenshot('mobile-iphone-12');
    });

    test('should handle touch interactions correctly', async ({ mockDataPage }) => {
      await utils.setViewport(TEST_DATA.VIEWPORTS.MOBILE_SMALL.width, TEST_DATA.VIEWPORTS.MOBILE_SMALL.height);
      await mockDataPage.goto(APP_CONSTANTS.BASE_URL);
      await utils.waitForPageLoad();

      // Test tap on deposit button
      if (await utils.elementExists(SELECTORS.DEPOSIT_BUTTON)) {
        await mockDataPage.tap(SELECTORS.DEPOSIT_BUTTON);
        await utils.verifyModalOpen(SELECTORS.DEPOSIT_MODAL);
        await mockDataPage.tap(SELECTORS.CLOSE_MODAL);
      }

      // Test swipe gestures (if applicable)
      const card = mockDataPage.locator(SELECTORS.VAULT_BALANCE_CARD);
      if (await card.count() > 0) {
        await card.tap();
        await mockDataPage.waitForTimeout(200);
      }

      await utils.takeScreenshot('mobile-touch-interactions');
    });
  });

  test.describe('Tablet Viewports', () => {
    test('should display correctly on iPad (768x1024)', async ({ mockDataPage }) => {
      await utils.setViewport(TEST_DATA.VIEWPORTS.TABLET.width, TEST_DATA.VIEWPORTS.TABLET.height);
      await mockDataPage.goto(APP_CONSTANTS.BASE_URL);
      await utils.waitForPageLoad();

      // Check tablet-specific layout
      await expect(mockDataPage.locator(SELECTORS.HEADER)).toBeVisible();
      await expect(mockDataPage.locator(SELECTORS.VAULT_BALANCE_CARD)).toBeVisible();
      await expect(mockDataPage.locator(SELECTORS.YIELD_OVERVIEW)).toBeVisible();
      await expect(mockDataPage.locator(SELECTORS.TRANSACTION_HISTORY)).toBeVisible();

      // Check navigation layout
      const navigation = mockDataPage.locator(SELECTORS.NAVIGATION);
      if (await navigation.count() > 0) {
        await expect(navigation).toBeVisible();
      }

      // Verify content is properly spaced
      const vaultCard = mockDataPage.locator(SELECTORS.VAULT_BALANCE_CARD);
      await expect(vaultCard).toBeVisible();

      await utils.takeScreenshot('tablet-ipad');
    });

    test('should handle orientation changes', async ({ mockDataPage }) => {
      // Test portrait
      await utils.setViewport(TEST_DATA.VIEWPORTS.TABLET.width, TEST_DATA.VIEWPORTS.TABLET.height);
      await mockDataPage.goto(APP_CONSTANTS.BASE_URL);
      await utils.waitForPageLoad();
      await utils.takeScreenshot('tablet-portrait');

      // Test landscape
      await utils.setViewport(TEST_DATA.VIEWPORTS.TABLET.height, TEST_DATA.VIEWPORTS.TABLET.width);
      await mockDataPage.waitForTimeout(500); // Allow for layout adjustment
      await utils.takeScreenshot('tablet-landscape');

      // Verify elements remain visible in both orientations
      await expect(mockDataPage.locator(SELECTORS.HEADER)).toBeVisible();
      await expect(mockDataPage.locator(SELECTORS.VAULT_BALANCE_CARD)).toBeVisible();
    });
  });

  test.describe('Desktop Viewports', () => {
    test('should display correctly on small desktop (1024x768)', async ({ mockDataPage }) => {
      await utils.setViewport(TEST_DATA.VIEWPORTS.DESKTOP_SMALL.width, TEST_DATA.VIEWPORTS.DESKTOP_SMALL.height);
      await mockDataPage.goto(APP_CONSTANTS.BASE_URL);
      await utils.waitForPageLoad();

      // Check desktop layout
      await expect(mockDataPage.locator(SELECTORS.HEADER)).toBeVisible();
      await expect(mockDataPage.locator(SELECTORS.VAULT_BALANCE_CARD)).toBeVisible();
      await expect(mockDataPage.locator(SELECTORS.YIELD_OVERVIEW)).toBeVisible();
      await expect(mockDataPage.locator(SELECTORS.TRANSACTION_HISTORY)).toBeVisible();

      // Check for full navigation
      const navigation = mockDataPage.locator(SELECTORS.NAVIGATION);
      if (await navigation.count() > 0) {
        await expect(navigation).toBeVisible();
      }

      await utils.takeScreenshot('desktop-small');
    });

    test('should display correctly on large desktop (1920x1080)', async ({ mockDataPage }) => {
      await utils.setViewport(TEST_DATA.VIEWPORTS.DESKTOP_LARGE.width, TEST_DATA.VIEWPORTS.DESKTOP_LARGE.height);
      await mockDataPage.goto(APP_CONSTANTS.BASE_URL);
      await utils.waitForPageLoad();

      // Check desktop layout
      await expect(mockDataPage.locator(SELECTORS.HEADER)).toBeVisible();
      await expect(mockDataPage.locator(SELECTORS.MAIN_CONTENT)).toBeVisible();

      // Verify content is properly centered on large screens
      const mainContent = mockDataPage.locator(SELECTORS.MAIN_CONTENT);
      await expect(mainContent).toBeVisible();

      await utils.takeScreenshot('desktop-large');
    });

    test('should handle ultra-wide screens', async ({ mockDataPage }) => {
      await utils.setViewport(2560, 1440); // 2K resolution
      await mockDataPage.goto(APP_CONSTANTS.BASE_URL);
      await utils.waitForPageLoad();

      // Verify content doesn't stretch too wide
      const mainContent = mockDataPage.locator(SELECTORS.MAIN_CONTENT);
      await expect(mainContent).toBeVisible();

      // Check for max-width constraints
      const mainContentWidth = await mainContent.evaluate(el => {
        return window.getComputedStyle(el).maxWidth;
      });
      expect(mainContentWidth).not.toBe('none');

      await utils.takeScreenshot('desktop-ultrawide');
    });
  });

  test.describe('Modal Responsiveness', () => {
    test('should display modal correctly on mobile', async ({ mockDataPage }) => {
      await utils.setViewport(TEST_DATA.VIEWPORTS.MOBILE_SMALL.width, TEST_DATA.VIEWPORTS.MOBILE_SMALL.height);
      await mockDataPage.goto(APP_CONSTANTS.BASE_URL);
      await utils.waitForPageLoad();

      if (await utils.elementExists(SELECTORS.DEPOSIT_BUTTON)) {
        await mockDataPage.click(SELECTORS.DEPOSIT_BUTTON);
        await utils.verifyModalOpen(SELECTORS.DEPOSIT_MODAL);

        // Verify modal fits on mobile screen
        const modal = mockDataPage.locator(SELECTORS.DEPOSIT_MODAL);
        await expect(modal).toBeVisible();

        // Check modal doesn't exceed viewport
        const modalBox = await modal.boundingBox();
        if (modalBox) {
          expect(modalBox.width).toBeLessThanOrEqual(TEST_DATA.VIEWPORTS.MOBILE_SMALL.width - 32); // Account for padding
          expect(modalBox.height).toBeLessThanOrEqual(TEST_DATA.VIEWPORTS.MOBILE_SMALL.height - 32);
        }

        await utils.takeScreenshot('modal-mobile');
      }
    });

    test('should display modal correctly on tablet', async ({ mockDataPage }) => {
      await utils.setViewport(TEST_DATA.VIEWPORTS.TABLET.width, TEST_DATA.VIEWPORTS.TABLET.height);
      await mockDataPage.goto(APP_CONSTANTS.BASE_URL);
      await utils.waitForPageLoad();

      if (await utils.elementExists(SELECTORS.DEPOSIT_BUTTON)) {
        await mockDataPage.click(SELECTORS.DEPOSIT_BUTTON);
        await utils.verifyModalOpen(SELECTORS.DEPOSIT_MODAL);

        await utils.takeScreenshot('modal-tablet');
      }
    });

    test('should display modal correctly on desktop', async ({ mockDataPage }) => {
      await utils.setViewport(TEST_DATA.VIEWPORTS.DESKTOP_LARGE.width, TEST_DATA.VIEWPORTS.DESKTOP_LARGE.height);
      await mockDataPage.goto(APP_CONSTANTS.BASE_URL);
      await utils.waitForPageLoad();

      if (await utils.elementExists(SELECTORS.DEPOSIT_BUTTON)) {
        await mockDataPage.click(SELECTORS.DEPOSIT_BUTTON);
        await utils.verifyModalOpen(SELECTORS.DEPOSIT_MODAL);

        await utils.takeScreenshot('modal-desktop');
      }
    });
  });

  test.describe('Typography and Spacing', () => {
    test('should maintain readable font sizes across viewports', async ({ mockDataPage }) => {
      const viewports = [
        TEST_DATA.VIEWPORTS.MOBILE_SMALL,
        TEST_DATA.VIEWPORTS.TABLET,
        TEST_DATA.VIEWPORTS.DESKTOP_LARGE
      ];

      for (const viewport of viewports) {
        await utils.setViewport(viewport.width, viewport.height);
        await mockDataPage.goto(APP_CONSTANTS.BASE_URL);
        await utils.waitForPageLoad();

        // Check font sizes are readable
        const heading = mockDataPage.locator('h1, h2, h3').first();
        const fontSize = await heading.evaluate(el => {
          return window.getComputedStyle(el).fontSize;
        });

        // Font size should be at least 16px for readability
        const fontSizeNum = parseInt(fontSize);
        expect(fontSizeNum).toBeGreaterThanOrEqual(16);

        await utils.takeScreenshot(`typography-${viewport.width}x${viewport.height}`);
      }
    });

    test('should maintain proper spacing between elements', async ({ mockDataPage }) => {
      await utils.setViewport(TEST_DATA.VIEWPORTS.MOBILE_SMALL.width, TEST_DATA.VIEWPORTS.MOBILE_SMALL.height);
      await mockDataPage.goto(APP_CONSTANTS.BASE_URL);
      await utils.waitForPageLoad();

      // Check that elements don't overlap
      const cards = mockDataPage.locator('[data-testid*="card"]');
      const cardCount = await cards.count();

      if (cardCount > 1) {
        for (let i = 0; i < cardCount - 1; i++) {
          const card1 = cards.nth(i);
          const card2 = cards.nth(i + 1);

          const box1 = await card1.boundingBox();
          const box2 = await card2.boundingBox();

          if (box1 && box2) {
            // Check for vertical spacing
            expect(Math.abs(box2.y - (box1.y + box1.height))).toBeGreaterThanOrEqual(16);
          }
        }
      }

      await utils.takeScreenshot('spacing-mobile');
    });
  });

  test.describe('Performance on Different Viewports', () => {
    test('should load quickly on mobile', async ({ page }) => {
      await utils.setViewport(TEST_DATA.VIEWPORTS.MOBILE_SMALL.width, TEST_DATA.VIEWPORTS.MOBILE_SMALL.height);

      const startTime = Date.now();
      await page.goto(APP_CONSTANTS.BASE_URL);
      await utils.waitForPageLoad();
      const loadTime = Date.now() - startTime;

      // Should load quickly on mobile
      expect(loadTime).toBeLessThan(TEST_DATA.PERFORMANCE_THRESHOLDS.MAX_PAGE_LOAD_TIME);
      console.log(`Mobile load time: ${loadTime}ms`);
    });

    test('should handle rapid viewport changes', async ({ mockDataPage }) => {
      await mockDataPage.goto(APP_CONSTANTS.BASE_URL);
      await utils.waitForPageLoad();

      const viewports = [
        TEST_DATA.VIEWPORTS.MOBILE_SMALL,
        TEST_DATA.VIEWPORTS.TABLET,
        TEST_DATA.VIEWPORTS.DESKTOP_LARGE,
        TEST_DATA.VIEWPORTS.MOBILE_LARGE
      ];

      for (const viewport of viewports) {
        await utils.setViewport(viewport.width, viewport.height);
        await mockDataPage.waitForTimeout(300); // Allow for layout adjustment

        // Verify elements are still visible
        await expect(mockDataPage.locator(SELECTORS.HEADER)).toBeVisible();
        await expect(mockDataPage.locator(SELECTORS.VAULT_BALANCE_CARD)).toBeVisible();
      }

      await utils.takeScreenshot('rapid-viewport-changes');
    });
  });

  test.describe('Accessibility Across Viewports', () => {
    test('should maintain accessibility on all screen sizes', async ({ mockDataPage }) => {
      const viewports = [
        TEST_DATA.VIEWPORTS.MOBILE_SMALL,
        TEST_DATA.VIEWPORTS.TABLET,
        TEST_DATA.VIEWPORTS.DESKTOP_LARGE
      ];

      for (const viewport of viewports) {
        await utils.setViewport(viewport.width, viewport.height);
        await mockDataPage.goto(APP_CONSTANTS.BASE_URL);
        await utils.waitForPageLoad();

        // Check for proper heading structure
        const headings = mockDataPage.locator('h1, h2, h3, h4, h5, h6');
        await expect(headings.first()).toBeVisible();

        // Check for proper ARIA labels
        const interactiveElements = mockDataPage.locator('button, a, input, select, textarea');
        const count = await interactiveElements.count();

        for (let i = 0; i < Math.min(count, 5); i++) {
          const element = interactiveElements.nth(i);
          const ariaLabel = await element.getAttribute('aria-label');
          const title = await element.getAttribute('title');
          const text = await element.textContent();

          // Interactive elements should have accessible labels
          if (await element.isVisible()) {
            expect(ariaLabel || title || text).toBeTruthy();
          }
        }

        await utils.takeScreenshot(`accessibility-${viewport.width}x${viewport.height}`);
      }
    });
  });
});