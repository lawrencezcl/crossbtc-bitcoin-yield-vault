import { test, expect } from '../../fixtures/page-fixture';
import { SELECTORS, TEST_DATA, APP_CONSTANTS, ERROR_MESSAGES } from '../../utils/constants';
import TestUtils from '../../utils/test-utils';

test.describe('Deposit Modal - Component Interaction', () => {
  let utils: TestUtils;

  test.beforeEach(async ({ page }) => {
    utils = new TestUtils(page);
    await page.goto(APP_CONSTANTS.BASE_URL);
    await utils.waitForPageLoad();
  });

  test('should open modal with correct initial state', async ({ page }) => {
    await utils.clickAndWait(SELECTORS.DEPOSIT_BUTTON);
    await utils.verifyModalOpen(SELECTORS.DEPOSIT_MODAL);

    // Verify modal elements are present
    await expect(page.locator(SELECTORS.AMOUNT_INPUT)).toBeVisible();
    await expect(page.locator(SELECTORS.METHOD_TABS)).toBeVisible();
    await expect(page.locator(SELECTORS.BITCOIN_METHOD)).toBeVisible();
    await expect(page.locator(SELECTORS.LIGHTNING_METHOD)).toBeVisible();
    await expect(page.locator(SELECTORS.QUICK_AMOUNT_BUTTONS)).toBeVisible();
    await expect(page.locator(SELECTORS.SUBMIT_DEPOSIT)).toBeVisible();
    await expect(page.locator(SELECTORS.CLOSE_MODAL)).toBeVisible();

    // Verify initial state
    await expect(page.locator(SELECTORS.AMOUNT_INPUT)).toHaveValue('');
    await expect(page.locator(SELECTORS.SUBMIT_DEPOSIT)).toBeDisabled();
    await expect(page.locator(SELECTORS.BITCOIN_METHOD)).toHaveClass(/active|selected/);

    await utils.takeScreenshot('deposit-modal-initial-state');
  });

  test('should handle amount input changes correctly', async ({ page }) => {
    await utils.clickAndWait(SELECTORS.DEPOSIT_BUTTON);
    await utils.verifyModalOpen(SELECTORS.DEPOSIT_MODAL);

    const amountInput = page.locator(SELECTORS.AMOUNT_INPUT);

    // Test typing valid amount
    await amountInput.fill(TEST_DATA.VALID_AMOUNTS.MEDIUM);
    await expect(amountInput).toHaveValue(TEST_DATA.VALID_AMOUNTS.MEDIUM);
    await expect(page.locator(SELECTORS.SUBMIT_DEPOSIT)).toBeEnabled();

    // Test clearing input
    await amountInput.fill('');
    await expect(amountInput).toHaveValue('');
    await expect(page.locator(SELECTORS.SUBMIT_DEPOSIT)).toBeDisabled();

    // Test decimal input
    await amountInput.fill(TEST_DATA.VALID_AMOUNTS.SMALL);
    await expect(amountInput).toHaveValue(TEST_DATA.VALID_AMOUNTS.SMALL);

    await utils.takeScreenshot('deposit-modal-amount-input');
  });

  test('should validate amount input in real-time', async ({ page }) => {
    await utils.clickAndWait(SELECTORS.DEPOSIT_BUTTON);
    await utils.verifyModalOpen(SELECTORS.DEPOSIT_MODAL);

    const amountInput = page.locator(SELECTORS.AMOUNT_INPUT);

    // Test invalid amounts
    await amountInput.fill(TEST_DATA.INVALID_AMOUNTS.ZERO);
    await expect(page.locator(SELECTORS.VALIDATION_ERROR)).toBeVisible();

    await amountInput.fill(TEST_DATA.INVALID_AMOUNTS.NEGATIVE);
    await expect(page.locator(SELECTORS.VALIDATION_ERROR)).toBeVisible();

    await amountInput.fill(TEST_DATA.INVALID_AMOUNTS.TEXT);
    await expect(page.locator(SELECTORS.VALIDATION_ERROR)).toBeVisible();

    // Test valid amount clears error
    await amountInput.fill(TEST_DATA.VALID_AMOUNTS.SMALL);
    await expect(page.locator(SELECTORS.VALIDATION_ERROR)).not.toBeVisible();

    await utils.takeScreenshot('deposit-modal-validation');
  });

  test('should handle quick amount buttons correctly', async ({ page }) => {
    await utils.clickAndWait(SELECTORS.DEPOSIT_BUTTON);
    await utils.verifyModalOpen(SELECTORS.DEPOSIT_MODAL);

    const quickButtons = page.locator(`${SELECTORS.QUICK_AMOUNT_BUTTONS} button`);
    const buttonCount = await quickButtons.count();

    // Test each quick amount button
    for (let i = 0; i < buttonCount; i++) {
      const button = quickButtons.nth(i);
      await button.click();

      // Verify amount is filled
      const amountInput = page.locator(SELECTORS.AMOUNT_INPUT);
      const inputValue = await amountInput.inputValue();
      expect(inputValue).toBeTruthy();
      expect(inputValue).not.toBe('');

      // Verify submit button is enabled
      await expect(page.locator(SELECTORS.SUBMIT_DEPOSIT)).toBeEnabled();

      // Clear for next iteration
      await amountInput.fill('');
    }

    await utils.takeScreenshot('deposit-modal-quick-amounts');
  });

  test('should switch between Bitcoin and Lightning methods', async ({ page }) => {
    await utils.clickAndWait(SELECTORS.DEPOSIT_BUTTON);
    await utils.verifyModalOpen(SELECTORS.DEPOSIT_MODAL);

    // Initially Bitcoin should be selected
    await expect(page.locator(SELECTORS.BITCOIN_METHOD)).toHaveClass(/active|selected/);

    // Switch to Lightning
    await page.click(SELECTORS.LIGHTNING_METHOD);
    await expect(page.locator(SELECTORS.LIGHTNING_METHOD)).toHaveClass(/active|selected/);
    await expect(page.locator(SELECTORS.BITCOIN_METHOD)).not.toHaveClass(/active|selected/);

    // Verify Lightning-specific UI elements appear
    const lightningSpecificElements = page.locator('[data-testid="lightning-specific"]');
    if (await lightningSpecificElements.count() > 0) {
      await expect(lightningSpecificElements).toBeVisible();
    }

    // Switch back to Bitcoin
    await page.click(SELECTORS.BITCOIN_METHOD);
    await expect(page.locator(SELECTORS.BITCOIN_METHOD)).toHaveClass(/active|selected/);
    await expect(page.locator(SELECTORS.LIGHTNING_METHOD)).not.toHaveClass(/active|selected/);

    await utils.takeScreenshot('deposit-modal-method-switching');
  });

  test('should handle form submission correctly', async ({ mockDataPage }) => {
    utils = new TestUtils(mockDataPage);
    await mockDataPage.goto(APP_CONSTANTS.BASE_URL);
    await utils.waitForPageLoad();

    // Mock successful API response
    await mockDataPage.route('**/api/deposit', (route) => {
      route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          success: true,
          transactionId: 'test-123',
          amount: TEST_DATA.VALID_AMOUNTS.SMALL
        })
      });
    });

    await utils.clickAndWait(SELECTORS.DEPOSIT_BUTTON);
    await utils.verifyModalOpen(SELECTORS.DEPOSIT_MODAL);

    // Fill form
    await mockDataPage.fill(SELECTORS.AMOUNT_INPUT, TEST_DATA.VALID_AMOUNTS.SMALL);

    // Submit form
    await utils.clickAndWait(SELECTORS.SUBMIT_DEPOSIT, '/api/deposit');

    // Verify success handling
    await utils.verifyModalClosed(SELECTORS.DEPOSIT_MODAL);

    await utils.takeScreenshot('deposit-modal-submission-success');
  });

  test('should handle submission errors correctly', async ({ page }) => {
    // Mock API error
    await page.route('**/api/deposit', (route) => {
      route.fulfill({
        status: 400,
        contentType: 'application/json',
        body: JSON.stringify({
          error: ERROR_MESSAGES.TRANSACTION_FAILED
        })
      });
    });

    await utils.clickAndWait(SELECTORS.DEPOSIT_BUTTON);
    await utils.verifyModalOpen(SELECTORS.DEPOSIT_MODAL);

    // Fill form
    await page.fill(SELECTORS.AMOUNT_INPUT, TEST_DATA.VALID_AMOUNTS.SMALL);

    // Submit form
    await utils.clickAndWait(SELECTORS.SUBMIT_DEPOSIT, '/api/deposit');

    // Verify error handling
    await utils.verifyToast(ERROR_MESSAGES.TRANSACTION_FAILED);
    await utils.verifyModalOpen(SELECTORS.DEPOSIT_MODAL);

    await utils.takeScreenshot('deposit-modal-submission-error');
  });

  test('should close modal with different methods', async ({ page }) => {
    await utils.clickAndWait(SELECTORS.DEPOSIT_BUTTON);
    await utils.verifyModalOpen(SELECTORS.DEPOSIT_MODAL);

    // Test close button
    await page.click(SELECTORS.CLOSE_MODAL);
    await utils.verifyModalClosed(SELECTORS.DEPOSIT_MODAL);

    // Reopen for next test
    await utils.clickAndWait(SELECTORS.DEPOSIT_BUTTON);
    await utils.verifyModalOpen(SELECTORS.DEPOSIT_MODAL);

    // Test escape key
    await page.keyboard.press('Escape');
    await utils.verifyModalClosed(SELECTORS.DEPOSIT_MODAL);

    // Reopen for next test
    await utils.clickAndWait(SELECTORS.DEPOSIT_BUTTON);
    await utils.verifyModalOpen(SELECTORS.DEPOSIT_MODAL);

    // Test click outside
    const backdrop = page.locator('.modal-backdrop, [data-testid="modal-backdrop"]');
    if (await backdrop.count() > 0) {
      await backdrop.click();
    } else {
      await page.locator('body').click({ force: true });
    }
    await utils.verifyModalClosed(SELECTORS.DEPOSIT_MODAL);

    await utils.takeScreenshot('deposit-modal-close-methods');
  });

  test('should handle keyboard navigation properly', async ({ page }) => {
    await utils.clickAndWait(SELECTORS.DEPOSIT_BUTTON);
    await utils.verifyModalOpen(SELECTORS.DEPOSIT_MODAL);

    // Test tab navigation
    await page.keyboard.press('Tab');
    let focusedElement = await page.locator(':focus');
    await expect(focusedElement).toBeVisible();

    // Continue tabbing through elements
    for (let i = 0; i < 5; i++) {
      await page.keyboard.press('Tab');
      focusedElement = await page.locator(':focus');
      await expect(focusedElement).toBeVisible();
    }

    // Test shift+tab for backward navigation
    for (let i = 0; i < 3; i++) {
      await page.keyboard.press('Shift+Tab');
      focusedElement = await page.locator(':focus');
      await expect(focusedElement).toBeVisible();
    }

    // Test Enter key on submit button
    await page.fill(SELECTORS.AMOUNT_INPUT, TEST_DATA.VALID_AMOUNTS.SMALL);
    await page.keyboard.press('Tab'); // Navigate to submit button
    await page.keyboard.press('Enter');

    await utils.takeScreenshot('deposit-modal-keyboard-navigation');
  });

  test('should be responsive on different screen sizes', async ({ page }) => {
    // Test mobile
    await utils.setViewport(TEST_DATA.VIEWPORTS.MOBILE_SMALL.width, TEST_DATA.VIEWPORTS.MOBILE_SMALL.height);
    await utils.clickAndWait(SELECTORS.DEPOSIT_BUTTON);
    await utils.verifyModalOpen(SELECTORS.DEPOSIT_MODAL);
    await utils.takeScreenshot('deposit-modal-mobile');

    await page.click(SELECTORS.CLOSE_MODAL);

    // Test tablet
    await utils.setViewport(TEST_DATA.VIEWPORTS.TABLET.width, TEST_DATA.VIEWPORTS.TABLET.height);
    await utils.clickAndWait(SELECTORS.DEPOSIT_BUTTON);
    await utils.verifyModalOpen(SELECTORS.DEPOSIT_MODAL);
    await utils.takeScreenshot('deposit-modal-tablet');

    await page.click(SELECTORS.CLOSE_MODAL);

    // Test desktop
    await utils.setViewport(TEST_DATA.VIEWPORTS.DESKTOP_LARGE.width, TEST_DATA.VIEWPORTS.DESKTOP_LARGE.height);
    await utils.clickAndWait(SELECTORS.DEPOSIT_BUTTON);
    await utils.verifyModalOpen(SELECTORS.DEPOSIT_MODAL);
    await utils.takeScreenshot('deposit-modal-desktop');
  });

  test('should handle touch interactions on mobile', async ({ page }) => {
    await utils.setViewport(TEST_DATA.VIEWPORTS.MOBILE_SMALL.width, TEST_DATA.VIEWPORTS.MOBILE_SMALL.height);
    await utils.clickAndWait(SELECTORS.DEPOSIT_BUTTON);
    await utils.verifyModalOpen(SELECTORS.DEPOSIT_MODAL);

    // Test touch interactions
    await page.tap(SELECTORS.AMOUNT_INPUT);
    await page.fill(SELECTORS.AMOUNT_INPUT, TEST_DATA.VALID_AMOUNTS.SMALL);

    const quickButtons = page.locator(`${SELECTORS.QUICK_AMOUNT_BUTTONS} button`);
    await quickButtons.first().tap();

    await page.tap(SELECTORS.LIGHTNING_METHOD);

    await page.tap(SELECTORS.SUBMIT_DEPOSIT);

    await utils.takeScreenshot('deposit-modal-touch-interactions');
  });

  test('should have proper accessibility attributes', async ({ page }) => {
    await utils.clickAndWait(SELECTORS.DEPOSIT_BUTTON);
    await utils.verifyModalOpen(SELECTORS.DEPOSIT_MODAL);

    // Check for proper ARIA attributes
    const modal = page.locator(SELECTORS.DEPOSIT_MODAL);
    await expect(modal).toHaveAttribute('role', 'dialog');
    await expect(modal).toHaveAttribute('aria-modal', 'true');

    // Check for proper labels
    const amountInput = page.locator(SELECTORS.AMOUNT_INPUT);
    await expect(amountInput).toHaveAttribute('aria-label');

    // Check for focus management
    await expect(page.locator(':focus')).toBeVisible();

    await utils.takeScreenshot('deposit-modal-accessibility');
  });

  test('should prevent form submission with invalid data', async ({ page }) => {
    await utils.clickAndWait(SELECTORS.DEPOSIT_BUTTON);
    await utils.verifyModalOpen(SELECTORS.DEPOSIT_MODAL);

    // Try submitting with empty form
    await expect(page.locator(SELECTORS.SUBMIT_DEPOSIT)).toBeDisabled();

    // Fill with invalid amount
    await page.fill(SELECTORS.AMOUNT_INPUT, TEST_DATA.INVALID_AMOUNTS.ZERO);
    await expect(page.locator(SELECTORS.SUBMIT_DEPOSIT)).toBeDisabled();

    // Fill with valid amount
    await page.fill(SELECTORS.AMOUNT_INPUT, TEST_DATA.VALID_AMOUNTS.SMALL);
    await expect(page.locator(SELECTORS.SUBMIT_DEPOSIT)).toBeEnabled();

    await utils.takeScreenshot('deposit-modal-form-prevention');
  });
});