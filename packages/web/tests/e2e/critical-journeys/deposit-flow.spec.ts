import { test, expect } from '../../fixtures/page-fixture';
import { SELECTORS, TEST_DATA, APP_CONSTANTS, ERROR_MESSAGES, SUCCESS_MESSAGES } from '../../utils/constants';
import TestUtils from '../../utils/test-utils';

test.describe('Deposit Flow - Critical User Journey', () => {
  let utils: TestUtils;

  test.beforeEach(async ({ page }) => {
    utils = new TestUtils(page);
    await page.goto(APP_CONSTANTS.BASE_URL);
    await utils.waitForPageLoad();
  });

  test('should open deposit modal when deposit button is clicked', async ({ page }) => {
    // Wait for deposit button to be visible
    await utils.waitForElement(SELECTORS.DEPOSIT_BUTTON);

    // Click deposit button
    await utils.clickAndWait(SELECTORS.DEPOSIT_BUTTON);

    // Verify deposit modal opens
    await utils.verifyModalOpen(SELECTORS.DEPOSIT_MODAL);
    await expect(page.locator(SELECTORS.DEPOSIT_MODAL)).toBeVisible();
    await expect(page.locator(SELECTORS.AMOUNT_INPUT)).toBeVisible();
    await expect(page.locator(SELECTORS.METHOD_TABS)).toBeVisible();

    await utils.takeScreenshot('deposit-modal-opened');
  });

  test('should display quick amount buttons', async ({ page }) => {
    await utils.clickAndWait(SELECTORS.DEPOSIT_BUTTON);
    await utils.verifyModalOpen(SELECTORS.DEPOSIT_MODAL);

    // Verify quick amount buttons are present
    await expect(page.locator(SELECTORS.QUICK_AMOUNT_BUTTONS)).toBeVisible();

    // Check that there are multiple quick amount buttons
    const quickButtons = page.locator(`${SELECTORS.QUICK_AMOUNT_BUTTONS} button`);
    await expect(quickButtons).toHaveCount(3); // Assuming 3 quick amount buttons

    await utils.takeScreenshot('quick-amount-buttons');
  });

  test('should allow switching between Bitcoin and Lightning methods', async ({ page }) => {
    await utils.clickAndWait(SELECTORS.DEPOSIT_BUTTON);
    await utils.verifyModalOpen(SELECTORS.DEPOSIT_MODAL);

    // Verify Bitcoin method is selected by default
    await expect(page.locator(SELECTORS.BITCOIN_METHOD)).toHaveClass(/active|selected/);

    // Click on Lightning method
    await page.click(SELECTORS.LIGHTNING_METHOD);

    // Verify Lightning method is now selected
    await expect(page.locator(SELECTORS.LIGHTNING_METHOD)).toHaveClass(/active|selected/);
    await expect(page.locator(SELECTORS.BITCOIN_METHOD)).not.toHaveClass(/active|selected/);

    // Switch back to Bitcoin
    await page.click(SELECTORS.BITCOIN_METHOD);
    await expect(page.locator(SELECTORS.BITCOIN_METHOD)).toHaveClass(/active|selected/);

    await utils.takeScreenshot('method-switching');
  });

  test('should validate amount input correctly', async ({ page }) => {
    await utils.clickAndWait(SELECTORS.DEPOSIT_BUTTON);
    await utils.verifyModalOpen(SELECTORS.DEPOSIT_MODAL);

    // Test valid amounts
    await utils.fillForm(SELECTORS.AMOUNT_INPUT, TEST_DATA.VALID_AMOUNTS.SMALL);
    await expect(page.locator(SELECTORS.VALIDATION_ERROR)).not.toBeVisible();

    await utils.fillForm(SELECTORS.AMOUNT_INPUT, TEST_DATA.VALID_AMOUNTS.MEDIUM);
    await expect(page.locator(SELECTORS.VALIDATION_ERROR)).not.toBeVisible();

    // Test invalid amounts
    await utils.fillForm(SELECTORS.AMOUNT_INPUT, TEST_DATA.INVALID_AMOUNTS.ZERO);
    await expect(page.locator(SELECTORS.VALIDATION_ERROR)).toBeVisible();
    await utils.verifyTextContains(SELECTORS.VALIDATION_ERROR, ERROR_MESSAGES.INVALID_AMOUNT);

    await utils.fillForm(SELECTORS.AMOUNT_INPUT, TEST_DATA.INVALID_AMOUNTS.NEGATIVE);
    await expect(page.locator(SELECTORS.VALIDATION_ERROR)).toBeVisible();

    await utils.fillForm(SELECTORS.AMOUNT_INPUT, TEST_DATA.INVALID_AMOUNTS.TEXT);
    await expect(page.locator(SELECTORS.VALIDATION_ERROR)).toBeVisible();

    await utils.takeScreenshot('amount-validation');
  });

  test('should enable submit button only with valid input', async ({ page }) => {
    await utils.clickAndWait(SELECTORS.DEPOSIT_BUTTON);
    await utils.verifyModalOpen(SELECTORS.DEPOSIT_MODAL);

    // Initially submit button should be disabled
    await expect(page.locator(SELECTORS.SUBMIT_DEPOSIT)).toBeDisabled();

    // Fill with valid amount
    await utils.fillForm(SELECTORS.AMOUNT_INPUT, TEST_DATA.VALID_AMOUNTS.SMALL);

    // Submit button should now be enabled
    await expect(page.locator(SELECTORS.SUBMIT_DEPOSIT)).toBeEnabled();

    // Fill with invalid amount
    await utils.fillForm(SELECTORS.AMOUNT_INPUT, TEST_DATA.INVALID_AMOUNTS.ZERO);

    // Submit button should be disabled again
    await expect(page.locator(SELECTORS.SUBMIT_DEPOSIT)).toBeDisabled();

    await utils.takeScreenshot('submit-button-state');
  });

  test('should use quick amount buttons correctly', async ({ page }) => {
    await utils.clickAndWait(SELECTORS.DEPOSIT_BUTTON);
    await utils.verifyModalOpen(SELECTORS.DEPOSIT_MODAL);

    // Click first quick amount button
    const quickButtons = page.locator(`${SELECTORS.QUICK_AMOUNT_BUTTONS} button`);
    await quickButtons.first().click();

    // Verify amount is filled in input
    const inputValue = await page.inputValue(SELECTORS.AMOUNT_INPUT);
    expect(inputValue).toBeTruthy();
    expect(inputValue).not.toBe('');

    // Verify submit button is enabled
    await expect(page.locator(SELECTORS.SUBMIT_DEPOSIT)).toBeEnabled();

    await utils.takeScreenshot('quick-amount-used');
  });

  test('should complete deposit flow successfully', async ({ mockDataPage }) => {
    utils = new TestUtils(mockDataPage);
    await mockDataPage.goto(APP_CONSTANTS.BASE_URL);
    await utils.waitForPageLoad();

    // Mock successful deposit API response
    await mockDataPage.route('**/api/deposit', (route) => {
      route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          success: true,
          transactionId: 'test-transaction-123',
          amount: TEST_DATA.VALID_AMOUNTS.SMALL,
          method: 'bitcoin'
        })
      });
    });

    // Open deposit modal
    await utils.clickAndWait(SELECTORS.DEPOSIT_BUTTON);
    await utils.verifyModalOpen(SELECTORS.DEPOSIT_MODAL);

    // Fill in valid amount
    await utils.fillForm(SELECTORS.AMOUNT_INPUT, TEST_DATA.VALID_AMOUNTS.SMALL);

    // Ensure Bitcoin method is selected
    await mockDataPage.click(SELECTORS.BITCOIN_METHOD);

    // Submit deposit
    await utils.clickAndWait(SELECTORS.SUBMIT_DEPOSIT, '/api/deposit');

    // Verify success message or modal close
    await utils.verifyToast(SUCCESS_MESSAGES.DEPOSIT_SUCCESS);

    // Verify modal is closed
    await utils.verifyModalClosed(SELECTORS.DEPOSIT_MODAL);

    // Verify transaction history is updated
    await utils.waitForElement(SELECTORS.TRANSACTION_HISTORY);
    const transactionItems = mockDataPage.locator(SELECTORS.TRANSACTION_ITEM);
    const initialCount = await transactionItems.count();
    expect(initialCount).toBeGreaterThan(0);

    await utils.takeScreenshot('deposit-completed');
  });

  test('should handle deposit errors gracefully', async ({ page }) => {
    // Mock failed deposit API response
    await page.route('**/api/deposit', (route) => {
      route.fulfill({
        status: 400,
        contentType: 'application/json',
        body: JSON.stringify({
          error: ERROR_MESSAGES.TRANSACTION_FAILED
        })
      });
    });

    // Open deposit modal
    await utils.clickAndWait(SELECTORS.DEPOSIT_BUTTON);
    await utils.verifyModalOpen(SELECTORS.DEPOSIT_MODAL);

    // Fill in valid amount
    await utils.fillForm(SELECTORS.AMOUNT_INPUT, TEST_DATA.VALID_AMOUNTS.SMALL);

    // Submit deposit
    await utils.clickAndWait(SELECTORS.SUBMIT_DEPOSIT, '/api/deposit');

    // Verify error message is shown
    await utils.verifyToast(ERROR_MESSAGES.TRANSACTION_FAILED);

    // Verify modal remains open for user to retry
    await utils.verifyModalOpen(SELECTORS.DEPOSIT_MODAL);

    await utils.takeScreenshot('deposit-error-handled');
  });

  test('should close modal when cancel button is clicked', async ({ page }) => {
    // Open deposit modal
    await utils.clickAndWait(SELECTORS.DEPOSIT_BUTTON);
    await utils.verifyModalOpen(SELECTORS.DEPOSIT_MODAL);

    // Close modal using close button
    await page.click(SELECTORS.CLOSE_MODAL);

    // Verify modal is closed
    await utils.verifyModalClosed(SELECTORS.DEPOSIT_MODAL);

    // Verify page is still functional
    await expect(page.locator(SELECTORS.MAIN_CONTENT)).toBeVisible();

    await utils.takeScreenshot('modal-closed');
  });

  test('should close modal when clicking outside', async ({ page }) => {
    // Open deposit modal
    await utils.clickAndWait(SELECTORS.DEPOSIT_BUTTON);
    await utils.verifyModalOpen(SELECTORS.DEPOSIT_MODAL);

    // Click outside modal (on backdrop)
    const modalBackdrop = page.locator('.modal-backdrop, [data-testid="modal-backdrop"]');
    if (await modalBackdrop.count() > 0) {
      await modalBackdrop.click();
    } else {
      // Fallback: click on main content area
      await page.locator(SELECTORS.MAIN_CONTENT).click({ force: true });
    }

    // Verify modal is closed
    await utils.verifyModalClosed(SELECTORS.DEPOSIT_MODAL);

    await utils.takeScreenshot('modal-closed-outside-click');
  });

  test('should handle keyboard navigation properly', async ({ page }) => {
    // Open deposit modal
    await utils.clickAndWait(SELECTORS.DEPOSIT_BUTTON);
    await utils.verifyModalOpen(SELECTORS.DEPOSIT_MODAL);

    // Test Tab navigation
    await page.keyboard.press('Tab');

    // Focus should be on amount input or another focusable element
    const focusedElement = await page.locator(':focus');
    await expect(focusedElement).toBeVisible();

    // Test Escape key to close modal
    await page.keyboard.press('Escape');
    await utils.verifyModalClosed(SELECTORS.DEPOSIT_MODAL);

    await utils.takeScreenshot('keyboard-navigation');
  });

  test('should work correctly on mobile devices', async ({ page }) => {
    // Set mobile viewport
    await utils.setViewport(TEST_DATA.VIEWPORTS.MOBILE_SMALL.width, TEST_DATA.VIEWPORTS.MOBILE_SMALL.height);

    // Open deposit modal
    await utils.clickAndWait(SELECTORS.DEPOSIT_BUTTON);
    await utils.verifyModalOpen(SELECTORS.DEPOSIT_MODAL);

    // Verify modal is properly sized for mobile
    await expect(page.locator(SELECTORS.DEPOSIT_MODAL)).toBeVisible();
    await expect(page.locator(SELECTORS.AMOUNT_INPUT)).toBeVisible();

    // Test touch interactions
    await page.tap(SELECTORS.AMOUNT_INPUT);
    await page.fill(SELECTORS.AMOUNT_INPUT, TEST_DATA.VALID_AMOUNTS.SMALL);

    // Tap quick amount button
    const quickButtons = page.locator(`${SELECTORS.QUICK_AMOUNT_BUTTONS} button`);
    await quickButtons.first().tap();

    // Tap submit button
    await page.tap(SELECTORS.SUBMIT_DEPOSIT);

    await utils.takeScreenshot('mobile-deposit-flow');
  });
});