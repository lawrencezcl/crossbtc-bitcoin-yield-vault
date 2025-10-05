import { test, expect } from '../../fixtures/page-fixture';
import { SELECTORS, TEST_DATA, APP_CONSTANTS } from '../../utils/constants';
import TestUtils from '../../utils/test-utils';

test.describe('Performance Tests', () => {
  let utils: TestUtils;

  test.beforeEach(async ({ page }) => {
    utils = new TestUtils(page);
  });

  test('should load page within performance thresholds', async ({ page }) => {
    const startTime = Date.now();

    await page.goto(APP_CONSTANTS.BASE_URL);
    await utils.waitForPageLoad();

    const loadTime = Date.now() - startTime;

    // Verify page loads within acceptable time
    expect(loadTime).toBeLessThan(TEST_DATA.PERFORMANCE_THRESHOLDS.MAX_PAGE_LOAD_TIME);

    console.log(`Page load time: ${loadTime}ms`);

    // Get performance metrics
    const performanceMetrics = await page.evaluate(() => {
      const navigation = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming;
      return {
        domContentLoaded: navigation.domContentLoadedEventEnd - navigation.domContentLoadedEventStart,
        loadComplete: navigation.loadEventEnd - navigation.loadEventStart,
        firstPaint: performance.getEntriesByType('paint')[0]?.startTime || 0,
        firstContentfulPaint: performance.getEntriesByType('paint')[1]?.startTime || 0,
      };
    });

    console.log('Performance metrics:', performanceMetrics);

    // Verify key performance metrics
    expect(performanceMetrics.firstContentfulPaint).toBeLessThan(
      TEST_DATA.PERFORMANCE_THRESHOLDS.MAX_FIRST_CONTENTFUL_PAINT
    );

    await utils.takeScreenshot('performance-page-load');
  });

  test('should measure Core Web Vitals', async ({ page }) => {
    await page.goto(APP_CONSTANTS.BASE_URL);
    await utils.waitForPageLoad();

    // Get Core Web Vitals metrics
    const webVitals = await page.evaluate(() => {
      return new Promise((resolve) => {
        // Create a performance observer for LCP
        let lcp = 0;
        let cls = 0;
        let fid = 0;

        const observer = new PerformanceObserver((list) => {
          for (const entry of list.getEntries()) {
            if (entry.entryType === 'largest-contentful-paint') {
              lcp = entry.startTime;
            } else if (entry.entryType === 'layout-shift' && !(entry as any).hadRecentInput) {
              cls += (entry as any).value;
            } else if (entry.entryType === 'first-input') {
              fid = (entry as any).processingStart - entry.startTime;
            }
          }
        });

        observer.observe({ entryTypes: ['largest-contentful-paint', 'layout-shift', 'first-input'] });

        // Wait a bit for metrics to be collected
        setTimeout(() => {
          resolve({ lcp, cls, fid });
          observer.disconnect();
        }, 3000);
      });
    });

    console.log('Core Web Vitals:', webVitals);

    // Verify Core Web Vitals thresholds
    expect(webVitals.lcp).toBeLessThan(TEST_DATA.PERFORMANCE_THRESHOLDS.MAX_LARGEST_CONTENTFUL_PAINT);
    expect(webVitals.cls).toBeLessThan(TEST_DATA.PERFORMANCE_THRESHOLDS.MAX_CUMULATIVE_LAYOUT_SHIFT);
    expect(webVitals.fid).toBeLessThan(TEST_DATA.PERFORMANCE_THRESHOLDS.MAX_FIRST_INPUT_DELAY);

    await utils.takeScreenshot('performance-core-web-vitals');
  });

  test('should handle large datasets efficiently', async ({ page }) => {
    // Mock large transaction dataset
    const largeTransactionSet = Array.from({ length: 1000 }, (_, i) => ({
      id: `tx${i}`,
      type: 'deposit',
      amount: Math.random() * 0.1,
      method: i % 2 === 0 ? 'bitcoin' : 'lightning',
      timestamp: new Date(Date.now() - i * 60000).toISOString(),
      status: 'completed'
    }));

    await page.route('**/api/transactions', (route) => {
      route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify(largeTransactionSet)
      });
    });

    const startTime = Date.now();

    await page.goto(APP_CONSTANTS.BASE_URL);
    await utils.waitForPageLoad();

    const renderTime = Date.now() - startTime;

    // Should handle large datasets efficiently
    expect(renderTime).toBeLessThan(5000); // 5 seconds for large dataset

    console.log(`Large dataset render time: ${renderTime}ms`);

    // Verify virtual scrolling or pagination is working
    await utils.waitForElement(SELECTORS.TRANSACTION_HISTORY);

    // Check if only a reasonable number of items are rendered
    const visibleTransactions = page.locator(SELECTORS.TRANSACTION_ITEM);
    const visibleCount = await visibleTransactions.count();

    // Should not render all 1000 items at once
    expect(visibleCount).toBeLessThan(100);

    await utils.takeScreenshot('performance-large-dataset');
  });

  test('should maintain performance with rapid interactions', async ({ page }) => {
    await page.goto(APP_CONSTANTS.BASE_URL);
    await utils.waitForPageLoad();

    // Test rapid tab switching or component interactions
    const interactions = [
      () => page.hover(SELECTORS.VAULT_BALANCE_CARD),
      () => page.click(SELECTORS.DEPOSIT_BUTTON),
      () => page.click(SELECTORS.CLOSE_MODAL),
      () => page.hover(SELECTORS.YIELD_OVERVIEW),
      () => page.reload(),
    ];

    const startTime = Date.now();

    for (const interaction of interactions) {
      await interaction();
      await page.waitForTimeout(100);
    }

    const interactionTime = Date.now() - startTime;

    // Should handle rapid interactions efficiently
    expect(interactionTime).toBeLessThan(3000); // 3 seconds for all interactions

    console.log(`Rapid interactions time: ${interactionTime}ms`);

    await utils.takeScreenshot('performance-rapid-interactions');
  });

  test('should measure memory usage', async ({ page }) => {
    await page.goto(APP_CONSTANTS.BASE_URL);
    await utils.waitForPageLoad();

    // Get memory metrics
    const memoryMetrics = await page.evaluate(() => {
      if ('memory' in performance) {
        return {
          usedJSHeapSize: (performance as any).memory.usedJSHeapSize,
          totalJSHeapSize: (performance as any).memory.totalJSHeapSize,
          jsHeapSizeLimit: (performance as any).memory.jsHeapSizeLimit,
        };
      }
      return null;
    });

    if (memoryMetrics) {
      console.log('Memory usage:', memoryMetrics);

      // Memory usage should be reasonable (less than 50MB)
      expect(memoryMetrics.usedJSHeapSize).toBeLessThan(50 * 1024 * 1024);
    }

    // Simulate memory usage by opening/closing modal multiple times
    for (let i = 0; i < 10; i++) {
      await page.click(SELECTORS.DEPOSIT_BUTTON);
      await utils.waitForElement(SELECTORS.DEPOSIT_MODAL);
      await page.click(SELECTORS.CLOSE_MODAL);
      await page.waitForTimeout(100);
    }

    // Check memory usage after interactions
    const finalMemoryMetrics = await page.evaluate(() => {
      if ('memory' in performance) {
        return {
          usedJSHeapSize: (performance as any).memory.usedJSHeapSize,
        };
      }
      return null;
    });

    if (finalMemoryMetrics && memoryMetrics) {
      const memoryIncrease = finalMemoryMetrics.usedJSHeapSize - memoryMetrics.usedJSHeapSize;
      console.log(`Memory increase: ${memoryIncrease} bytes`);

      // Memory increase should be minimal
      expect(memoryIncrease).toBeLessThan(10 * 1024 * 1024); // Less than 10MB increase
    }

    await utils.takeScreenshot('performance-memory-usage');
  });

  test('should optimize images and assets', async ({ page }) => {
    // Monitor network requests
    const assets: { url: string; type: string; size: number; loadTime: number }[] = [];

    page.on('response', async (response) => {
      const url = response.url();
      const contentType = response.headers()['content-type'] || '';

      if (contentType.includes('image') || contentType.includes('font') || url.includes('.css') || url.includes('.js')) {
        const startTime = Date.now();
        const buffer = await response.body();
        const loadTime = Date.now() - startTime;

        assets.push({
          url,
          type: contentType.split('/')[0] || 'other',
          size: buffer.length,
          loadTime
        });
      }
    });

    await page.goto(APP_CONSTANTS.BASE_URL);
    await utils.waitForPageLoad();

    console.log('Assets loaded:', assets);

    // Check for large assets
    const largeAssets = assets.filter(asset => asset.size > 1024 * 1024); // > 1MB
    expect(largeAssets.length).toBe(0);

    // Check for slow-loading assets
    const slowAssets = assets.filter(asset => asset.loadTime > 3000); // > 3 seconds
    expect(slowAssets.length).toBe(0);

    // Verify images are optimized
    const images = assets.filter(asset => asset.type === 'image');
    for (const image of images) {
      // Images should be reasonably sized
      expect(image.size).toBeLessThan(500 * 1024); // Less than 500KB
    }

    await utils.takeScreenshot('performance-assets-optimized');
  });

  test('should handle animations smoothly', async ({ page }) => {
    await page.goto(APP_CONSTANTS.BASE_URL);
    await utils.waitForPageLoad();

    // Test modal animation performance
    await page.click(SELECTORS.DEPOSIT_BUTTON);

    // Measure animation performance
    const animationPerformance = await page.evaluate(() => {
      return new Promise((resolve) => {
        let frames = 0;
        let startTime = performance.now();

        function countFrames() {
          frames++;
          const currentTime = performance.now();

          if (currentTime - startTime < 1000) { // Count for 1 second
            requestAnimationFrame(countFrames);
          } else {
            resolve({ frames, duration: currentTime - startTime });
          }
        }

        requestAnimationFrame(countFrames);
      });
    });

    const fps = (animationPerformance as any).frames / ((animationPerformance as any).duration / 1000);

    // Should maintain reasonable frame rate during animations
    expect(fps).toBeGreaterThan(30); // At least 30 FPS

    console.log(`Animation FPS: ${fps.toFixed(2)}`);

    await page.click(SELECTORS.CLOSE_MODAL);

    await utils.takeScreenshot('performance-animations');
  });

  test('should test performance on different viewports', async ({ page }) => {
    const viewports = [
      TEST_DATA.VIEWPORTS.MOBILE_SMALL,
      TEST_DATA.VIEWPORTS.TABLET,
      TEST_DATA.VIEWPORTS.DESKTOP_LARGE
    ];

    const performanceResults = [];

    for (const viewport of viewports) {
      await page.setViewportSize(viewport);
      await page.goto(APP_CONSTANTS.BASE_URL);

      const startTime = Date.now();
      await utils.waitForPageLoad();
      const loadTime = Date.now() - startTime;

      performanceResults.push({
        viewport: `${viewport.width}x${viewport.height}`,
        loadTime
      });

      console.log(`Viewport ${viewport.width}x${viewport.height} load time: ${loadTime}ms`);

      // All viewports should load within reasonable time
      expect(loadTime).toBeLessThan(TEST_DATA.PERFORMANCE_THRESHOLDS.MAX_PAGE_LOAD_TIME);
    }

    // Performance should be consistent across viewports
    const loadTimes = performanceResults.map(r => r.loadTime);
    const maxLoadTime = Math.max(...loadTimes);
    const minLoadTime = Math.min(...loadTimes);
    const variance = maxLoadTime - minLoadTime;

    // Performance variance should be minimal
    expect(variance).toBeLessThan(1000); // Less than 1 second variance

    await utils.takeScreenshot('performance-viewport-comparison');
  });

  test('should measure bundle size and loading performance', async ({ page }) => {
    const bundleInfo = {
      jsFiles: [] as { url: string; size: number; loadTime: number }[],
      cssFiles: [] as { url: string; size: number; loadTime: number }[],
      totalSize: 0,
      totalLoadTime: 0
    };

    page.on('response', async (response) => {
      const url = response.url();
      const contentType = response.headers()['content-type'] || '';

      if (url.includes('.js') || contentType.includes('javascript')) {
        const startTime = Date.now();
        const buffer = await response.body();
        const loadTime = Date.now() - startTime;

        bundleInfo.jsFiles.push({
          url,
          size: buffer.length,
          loadTime
        });
      } else if (url.includes('.css') || contentType.includes('css')) {
        const startTime = Date.now();
        const buffer = await response.body();
        const loadTime = Date.now() - startTime;

        bundleInfo.cssFiles.push({
          url,
          size: buffer.length,
          loadTime
        });
      }
    });

    await page.goto(APP_CONSTANTS.BASE_URL);
    await utils.waitForPageLoad();

    // Calculate totals
    bundleInfo.totalSize = [...bundleInfo.jsFiles, ...bundleInfo.cssFiles]
      .reduce((sum, file) => sum + file.size, 0);
    bundleInfo.totalLoadTime = [...bundleInfo.jsFiles, ...bundleInfo.cssFiles]
      .reduce((sum, file) => sum + file.loadTime, 0);

    console.log('Bundle info:', bundleInfo);

    // Bundle size should be reasonable
    expect(bundleInfo.totalSize).toBeLessThan(2 * 1024 * 1024); // Less than 2MB

    // JavaScript bundle should be optimized
    const jsTotalSize = bundleInfo.jsFiles.reduce((sum, file) => sum + file.size, 0);
    expect(jsTotalSize).toBeLessThan(1024 * 1024); // Less than 1MB for JS

    await utils.takeScreenshot('performance-bundle-size');
  });

  test('should handle concurrent API requests efficiently', async ({ page }) => {
    // Mock multiple API endpoints
    await page.route('**/api/vault/balance', (route) => {
      setTimeout(() => {
        route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify(TEST_DATA.MOCK_VAULT_DATA.balance)
        });
      }, 500);
    });

    await page.route('**/api/vault/yield', (route) => {
      setTimeout(() => {
        route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify({ apy: 12.5 })
        });
      }, 600);
    });

    await page.route('**/api/transactions', (route) => {
      setTimeout(() => {
        route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify(TEST_DATA.MOCK_TRANSACTIONS)
        });
      }, 400);
    });

    const startTime = Date.now();

    await page.goto(APP_CONSTANTS.BASE_URL);
    await utils.waitForPageLoad();

    const concurrentLoadTime = Date.now() - startTime;

    // Should handle concurrent requests efficiently
    expect(concurrentLoadTime).toBeLessThan(2000); // Should not be much longer than longest single request

    console.log(`Concurrent API requests load time: ${concurrentLoadTime}ms`);

    await utils.takeScreenshot('performance-concurrent-requests');
  });
});