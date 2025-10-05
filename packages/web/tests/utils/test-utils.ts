import { Page, expect } from '@playwright/test';

export class TestUtils {
  constructor(private page: Page) {}

  /**
   * Wait for the page to be fully loaded
   */
  async waitForPageLoad(): Promise<void> {
    await this.page.waitForLoadState('networkidle');
    await this.page.waitForLoadState('domcontentloaded');
  }

  /**
   * Wait for and verify element is visible
   */
  async waitForElement(selector: string, timeout = 5000): Promise<void> {
    await this.page.waitForSelector(selector, {
      state: 'visible',
      timeout
    });
  }

  /**
   * Check if element exists
   */
  async elementExists(selector: string): Promise<boolean> {
    return await this.page.locator(selector).count() > 0;
  }

  /**
   * Wait for API response
   */
  async waitForApiResponse(url: string, timeout = 10000): Promise<void> {
    await this.page.waitForResponse(
      (response) => response.url().includes(url),
      { timeout }
    );
  }

  /**
   * Take screenshot with custom name
   */
  async takeScreenshot(name: string, fullPage = false): Promise<void> {
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const filename = `${name}-${timestamp}.png`;
    await this.page.screenshot({
      path: `test-results/screenshots/${filename}`,
      fullPage
    });
  }

  /**
   * Fill form with validation
   */
  async fillForm(selector: string, value: string): Promise<void> {
    await this.page.fill(selector, value);
    // Wait a bit for any validation to trigger
    await this.page.waitForTimeout(100);
  }

  /**
   * Click element and wait for navigation or response
   */
  async clickAndWait(selector: string, waitForResponse?: string): Promise<void> {
    if (waitForResponse) {
      const responsePromise = this.page.waitForResponse(
        (response) => response.url().includes(waitForResponse)
      );
      await this.page.click(selector);
      await responsePromise;
    } else {
      await this.page.click(selector);
      await this.page.waitForLoadState('networkidle');
    }
  }

  /**
   * Verify toast/notification appears
   */
  async verifyToast(message: string): Promise<void> {
    await this.page.waitForSelector(`[role="alert"], .toast, .notification`, {
      state: 'visible'
    });
    await expect(this.page.locator(`[role="alert"], .toast, .notification`))
      .toContainText(message);
  }

  /**
   * Verify modal is open
   */
  async verifyModalOpen(modalSelector: string): Promise<void> {
    await expect(this.page.locator(modalSelector)).toBeVisible();
    await expect(this.page.locator(modalSelector)).toHaveAttribute('aria-hidden', 'false');
  }

  /**
   * Verify modal is closed
   */
  async verifyModalClosed(modalSelector: string): Promise<void> {
    await expect(this.page.locator(modalSelector)).toBeHidden();
  }

  /**
   * Check responsive viewport
   */
  async setViewport(width: number, height: number): Promise<void> {
    await this.page.setViewportSize({ width, height });
    await this.page.waitForTimeout(500); // Allow for layout adjustments
  }

  /**
   * Scroll element into view
   */
  async scrollIntoView(selector: string): Promise<void> {
    await this.page.locator(selector).scrollIntoViewIfNeeded();
    await this.page.waitForTimeout(300);
  }

  /**
   * Hover over element
   */
  async hover(selector: string): Promise<void> {
    await this.page.hover(selector);
    await this.page.waitForTimeout(200);
  }

  /**
   * Type text with delay (simulates human typing)
   */
  async typeWithDelay(selector: string, text: string, delay = 50): Promise<void> {
    await this.page.type(selector, text, { delay });
  }

  /**
   * Verify element text contains expected content
   */
  async verifyTextContains(selector: string, expectedText: string): Promise<void> {
    await expect(this.page.locator(selector)).toContainText(expectedText);
  }

  /**
   * Verify element text exactly matches expected content
   */
  async verifyTextEquals(selector: string, expectedText: string): Promise<void> {
    await expect(this.page.locator(selector)).toHaveText(expectedText);
  }

  /**
   * Check if element is enabled
   */
  async isElementEnabled(selector: string): Promise<boolean> {
    return await this.page.locator(selector).isEnabled();
  }

  /**
   * Check if element is disabled
   */
  async isElementDisabled(selector: string): Promise<boolean> {
    return !(await this.page.locator(selector).isEnabled());
  }

  /**
   * Wait for loading spinner to disappear
   */
  async waitForLoadingComplete(): Promise<void> {
    const loadingSelectors = [
      '.loading',
      '.spinner',
      '[data-loading="true"]',
      '.skeleton'
    ];

    for (const selector of loadingSelectors) {
      try {
        await this.page.waitForSelector(selector, { state: 'hidden', timeout: 5000 });
      } catch {
        // Loading element not found or already hidden
      }
    }
  }

  /**
   * Get element text content
   */
  async getElementText(selector: string): Promise<string> {
    return await this.page.locator(selector).textContent() || '';
  }

  /**
   * Get element attribute value
   */
  async getElementAttribute(selector: string, attribute: string): Promise<string | null> {
    return await this.page.locator(selector).getAttribute(attribute);
  }
}

export default TestUtils;