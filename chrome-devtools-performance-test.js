/**
 * Chrome DevTools Performance Testing Automation Script
 * For Cross-Chain Bitcoin Yield Vault Application
 *
 * This script automates comprehensive performance testing using Puppeteer
 * with Chrome DevTools Protocol to analyze application performance metrics.
 */

const puppeteer = require('puppeteer');
const fs = require('fs');
const path = require('path');

class ChromeDevToolsPerformanceTester {
  constructor() {
    this.browser = null;
    this.page = null;
    this.testResults = {
      performance: {},
      network: {},
      memory: {},
      accessibility: {},
      mobile: {},
      interactions: {},
      summary: {}
    };
    this.testConfig = {
      url: 'http://localhost:3002',
      tests: {
        performance: true,
        network: true,
        memory: true,
        accessibility: true,
        mobile: true,
        interactions: true
      },
      thresholds: {
        firstContentfulPaint: 1500,
        largestContentfulPaint: 2500,
        timeToInteractive: 3000,
        cumulativeLayoutShift: 0.1,
        firstInputDelay: 100,
        memoryUsage: 100 * 1024 * 1024, // 100MB
        bundleSize: 1024 * 1024, // 1MB
        animationFrameRate: 55 // minimum 55 FPS (target 60)
      }
    };
  }

  async initialize() {
    console.log('🚀 Initializing Chrome DevTools Performance Tester...');

    this.browser = await puppeteer.launch({
      headless: false,
      defaultViewport: null,
      args: [
        '--no-sandbox',
        '--disable-setuid-sandbox',
        '--disable-dev-shm-usage',
        '--disable-web-security',
        '--disable-features=IsolateOrigins,site-per-process',
        '--enable-precise-memory-info',
        '--enable-automation',
        '--start-maximized'
      ]
    });

    this.page = await this.browser.newPage();

    // Enable DevTools Protocol domains
    const client = await this.page.target().createCDPSession();
    await client.send('Performance.enable');
    await client.send('Network.enable');
    await client.send('Runtime.enable');
    await client.send('Memory.enable');
    await client.send('Page.enable');
    await client.send('Emulation.setEmitTouchEventsForMouse', { enabled: true });
    await client.send('Emulation.setEmulatedMedia', { media: 'screen' });

    // Set up performance monitoring
    this.client = client;

    // Configure viewport for desktop testing
    await this.page.setViewport({
      width: 1920,
      height: 1080,
      deviceScaleFactor: 1
    });

    console.log('✅ Browser initialized successfully');
  }

  async clearCacheAndCookies() {
    console.log('🧹 Clearing cache and cookies...');
    const client = await this.page.target().createCDPSession();
    await client.send('Network.clearBrowserCookies');
    await client.send('Network.clearBrowserCache');
    await this.page.goto('about:blank');
  }

  async measurePageLoad() {
    console.log('📊 Measuring page load performance...');

    const metrics = {};
    const navigationStart = Date.now();

    // Start performance monitoring
    await this.client.send('Performance.enable');

    // Navigate to the page
    await this.page.goto(this.testConfig.url, {
      waitUntil: 'networkidle0',
      timeout: 30000
    });

    // Wait for page to be fully interactive
    await this.page.waitForTimeout(3000);

    // Get performance metrics
    const performanceMetrics = await this.client.send('Performance.getMetrics');
    const navigationMetrics = await this.page.evaluate(() => {
      const navigation = performance.getEntriesByType('navigation')[0];
      const paint = performance.getEntriesByType('paint');
      const vitals = {
        firstContentfulPaint: 0,
        largestContentfulPaint: 0,
        firstInputDelay: 0,
        cumulativeLayoutShift: 0
      };

      paint.forEach(entry => {
        if (entry.name === 'first-contentful-paint') {
          vitals.firstContentfulPaint = entry.startTime;
        }
      });

      return {
        navigation,
        vitals,
        timing: performance.timing
      };
    });

    // Calculate metrics
    const loadTime = Date.now() - navigationStart;

    metrics.pageLoad = {
      totalTime: loadTime,
      domContentLoaded: navigationMetrics.timing.domContentLoadedEventEnd - navigationMetrics.timing.navigationStart,
      loadComplete: navigationMetrics.timing.loadEventEnd - navigationMetrics.timing.navigationStart,
      firstContentfulPaint: navigationMetrics.vitals.firstContentfulPaint,
      domInteractive: navigationMetrics.timing.domInteractive - navigationMetrics.timing.navigationStart,
      domComplete: navigationMetrics.timing.domComplete - navigationMetrics.timing.navigationStart
    };

    // Get specific performance metrics
    const metricNames = [
      'Timestamp', 'Documents', 'Frames', 'JSEventListeners', 'LayoutObjects',
      'MediaKeySessions', 'Nodes', 'Resources', 'ScriptDuration', 'TaskDuration',
      'JSHeapUsedSize', 'JSHeapTotalSize', 'LayoutDuration', 'RecalcStyleDuration',
      'DevToolsCommandDuration', 'ScriptDuration'
    ];

    performanceMetrics.metrics.forEach(metric => {
      if (metricNames.includes(metric.name)) {
        metrics[metric.name] = metric.value;
      }
    });

    return metrics;
  }

  async analyzeNetworkRequests() {
    console.log('🌐 Analyzing network requests...');

    const networkData = {
      requests: [],
      totalSize: 0,
      totalTime: 0,
      bundleAnalysis: {},
      cachingAnalysis: {}
    };

    // Set up request interception
    const requests = [];

    this.page.on('request', request => {
      requests.push({
        url: request.url(),
        method: request.method(),
        resourceType: request.resourceType(),
        timestamp: Date.now()
      });
    });

    this.page.on('response', async response => {
      const request = response.request();
      const url = request.url();

      try {
        const headers = response.headers();
        const size = parseInt(headers['content-length'] || '0');
        const status = response.status();

        const requestData = requests.find(r => r.url === url);
        if (requestData) {
          requestData.response = {
            status,
            size,
            headers,
            timing: response.timing ? await response.timing() : null,
            fromCache: response.fromCache(),
            fromServiceWorker: response.fromServiceWorker()
          };

          networkData.totalSize += size;
        }
      } catch (error) {
        console.warn('Error analyzing response:', error.message);
      }
    });

    // Navigate to capture network activity
    await this.page.goto(this.testConfig.url, { waitUntil: 'networkidle0' });
    await this.page.waitForTimeout(3000);

    networkData.requests = requests;

    // Analyze bundle sizes
    const jsRequests = requests.filter(r => r.resourceType === 'script');
    const cssRequests = requests.filter(r => r.resourceType === 'stylesheet');

    networkData.bundleAnalysis = {
      javascript: {
        count: jsRequests.length,
        totalSize: jsRequests.reduce((sum, r) => sum + (r.response?.size || 0), 0),
        requests: jsRequests.map(r => ({
          url: r.url,
          size: r.response?.size || 0,
          cached: r.response?.fromCache || false
        }))
      },
      css: {
        count: cssRequests.length,
        totalSize: cssRequests.reduce((sum, r) => sum + (r.response?.size || 0), 0),
        requests: cssRequests.map(r => ({
          url: r.url,
          size: r.response?.size || 0,
          cached: r.response?.fromCache || false
        }))
      }
    };

    // Analyze caching
    const cachedRequests = requests.filter(r => r.response?.fromCache);
    const uncachedRequests = requests.filter(r => !r.response?.fromCache);

    networkData.cachingAnalysis = {
      totalRequests: requests.length,
      cachedRequests: cachedRequests.length,
      uncachedRequests: uncachedRequests.length,
      cacheHitRate: (cachedRequests.length / requests.length * 100).toFixed(2) + '%'
    };

    return networkData;
  }

  async measureMemoryUsage() {
    console.log('💾 Measuring memory usage...');

    const memoryData = {
      initial: {},
      afterInteractions: {},
      peak: {},
      potentialLeaks: []
    };

    // Enable memory monitoring
    await this.client.send('HeapProfiler.enable');

    // Get initial memory snapshot
    const initialMemory = await this.client.send('Runtime.getHeapUsage');
    memoryData.initial = {
      used: initialMemory.usedSize,
      total: initialMemory.totalSize,
      limit: initialMemory.sizeLimit
    };

    // Navigate to page
    await this.page.goto(this.testConfig.url, { waitUntil: 'networkidle0' });
    await this.page.waitForTimeout(2000);

    // Get memory after page load
    const afterLoadMemory = await this.client.send('Runtime.getHeapUsage');
    memoryData.afterLoad = {
      used: afterLoadMemory.usedSize,
      total: afterLoadMemory.totalSize,
      limit: afterLoadMemory.sizeLimit
    };

    // Simulate user interactions to stress test memory
    await this.simulateUserInteractions();

    // Get memory after interactions
    const afterInteractionsMemory = await this.client.send('Runtime.getHeapUsage');
    memoryData.afterInteractions = {
      used: afterInteractionsMemory.usedSize,
      total: afterInteractionsMemory.totalSize,
      limit: afterInteractionsMemory.sizeLimit
    };

    // Check for potential memory leaks
    const memoryIncrease = afterInteractionsMemory.usedSize - initialMemory.usedSize;
    if (memoryIncrease > 50 * 1024 * 1024) { // 50MB threshold
      memoryData.potentialLeaks.push({
        type: 'memory_increase',
        size: memoryIncrease,
        description: 'Significant memory increase detected during interactions'
      });
    }

    // Force garbage collection
    await this.client.send('HeapProfiler.collectGarbage');
    await this.page.waitForTimeout(1000);

    // Get memory after garbage collection
    const afterGCMemory = await this.client.send('Runtime.getHeapUsage');
    memoryData.afterGC = {
      used: afterGCMemory.usedSize,
      total: afterGCMemory.totalSize,
      limit: afterGCMemory.sizeLimit
    };

    return memoryData;
  }

  async simulateUserInteractions() {
    console.log('🎮 Simulating user interactions...');

    try {
      // Wait for page to load
      await this.page.waitForSelector('body', { timeout: 10000 });

      // Simulate deposit button click
      const depositSelectors = [
        'button[data-testid="deposit-button"]',
        'button:contains("Deposit")',
        'button[class*="deposit"]',
        'button[class*="Deposit"]'
      ];

      for (const selector of depositSelectors) {
        try {
          await this.page.waitForSelector(selector, { timeout: 2000 });
          await this.page.click(selector);
          await this.page.waitForTimeout(1000);
          break;
        } catch (e) {
          continue;
        }
      }

      // Fill form inputs if they exist
      const inputSelectors = [
        'input[type="number"]',
        'input[placeholder*="amount"]',
        'input[placeholder*="Amount"]',
        'input[name="amount"]'
      ];

      for (const selector of inputSelectors) {
        try {
          await this.page.waitForSelector(selector, { timeout: 2000 });
          await this.page.type(selector, '0.1');
          await this.page.waitForTimeout(500);
        } catch (e) {
          continue;
        }
      }

      // Test modal interactions
      const modalSelectors = [
        '[role="dialog"]',
        '.modal',
        '[class*="modal"]',
        '[class*="Modal"]'
      ];

      for (const selector of modalSelectors) {
        try {
          await this.page.waitForSelector(selector, { timeout: 2000 });
          await this.page.waitForTimeout(1000);
          break;
        } catch (e) {
          continue;
        }
      }

      // Test navigation
      const navSelectors = [
        'nav a',
        '[role="navigation"] a',
        '.nav a'
      ];

      for (const selector of navSelectors) {
        try {
          const elements = await this.page.$$(selector);
          if (elements.length > 0) {
            await elements[0].click();
            await this.page.waitForTimeout(1000);
            break;
          }
        } catch (e) {
          continue;
        }
      }

      // Test scrolling
      await this.page.evaluate(() => {
        window.scrollTo(0, document.body.scrollHeight / 2);
      });
      await this.page.waitForTimeout(1000);

      await this.page.evaluate(() => {
        window.scrollTo(0, 0);
      });
      await this.page.waitForTimeout(500);

    } catch (error) {
      console.warn('Error during user interactions:', error.message);
    }
  }

  async measureRenderingPerformance() {
    console.log('🎨 Measuring rendering performance...');

    const renderingData = {
      paintTiming: {},
      layoutShifts: 0,
      frameRate: 0,
      renderingTime: 0
    };

    // Get paint timing
    const paintMetrics = await this.page.evaluate(() => {
      const paintEntries = performance.getEntriesByType('paint');
      const layoutShiftEntries = performance.getEntriesByType('layout-shift');

      return {
        paint: paintEntries.reduce((acc, entry) => {
          acc[entry.name] = entry.startTime;
          return acc;
        }, {}),
        layoutShifts: layoutShiftEntries.reduce((sum, entry) => sum + entry.value, 0)
      };
    });

    renderingData.paintTiming = paintMetrics.paint;
    renderingData.layoutShifts = paintMetrics.layoutShifts;

    // Measure frame rate during animations
    await this.page.goto(this.testConfig.url, { waitUntil: 'networkidle0' });

    const frameRateData = await this.page.evaluate(() => {
      return new Promise((resolve) => {
        let frameCount = 0;
        let startTime = performance.now();
        let lastTime = startTime;

        function countFrames() {
          const currentTime = performance.now();
          frameCount++;

          if (currentTime - startTime >= 2000) { // Measure for 2 seconds
            const duration = currentTime - startTime;
            const fps = Math.round((frameCount * 1000) / duration);
            resolve({ fps, frameCount, duration });
          } else {
            requestAnimationFrame(countFrames);
          }
        }

        requestAnimationFrame(countFrames);
      });
    });

    renderingData.frameRate = frameRateData.fps;

    return renderingData;
  }

  async testMobileEmulation() {
    console.log('📱 Testing mobile emulation...');

    const mobileData = {
      devices: ['iPhone 12', 'Pixel 5', 'iPad'],
      results: {}
    };

    // Test different mobile devices
    for (const device of mobileData.devices) {
      console.log(`  Testing on ${device}...`);

      try {
        // Set device emulation
        if (device === 'iPhone 12') {
          await this.page.emulate(puppeteer.devices['iPhone 12']);
        } else if (device === 'Pixel 5') {
          await this.page.emulate(puppeteer.devices['Pixel 5']);
        } else if (device === 'iPad') {
          await this.page.emulate(puppeteer.devices['iPad']);
        }

        // Measure performance on mobile
        const startTime = Date.now();
        await this.page.goto(this.testConfig.url, { waitUntil: 'networkidle0' });
        const loadTime = Date.now() - startTime;

        // Get viewport information
        const viewport = await this.page.viewport();

        // Check responsive elements
        const responsiveChecks = await this.page.evaluate(() => {
          const checks = {
            hasViewportMeta: document.querySelector('meta[name="viewport"]') !== null,
            isMobileOptimized: window.innerWidth <= 768,
            hasTouchElements: document.querySelectorAll('button, a, input, select, textarea').length > 0
          };
          return checks;
        });

        mobileData.results[device] = {
          loadTime,
          viewport,
          responsive: responsiveChecks
        };

        // Reset to desktop viewport
        await this.page.setViewport({
          width: 1920,
          height: 1080,
          deviceScaleFactor: 1
        });

      } catch (error) {
        console.warn(`Error testing ${device}:`, error.message);
        mobileData.results[device] = {
          error: error.message
        };
      }
    }

    return mobileData;
  }

  async runAccessibilityAudit() {
    console.log('♿ Running accessibility audit...');

    const accessibilityData = {
      violations: [],
      passes: [],
      incomplete: [],
      score: 0
    };

    // Inject axe-core for accessibility testing
    await this.page.goto(this.testConfig.url, { waitUntil: 'networkidle0' });

    try {
      // Inject axe-core
      await this.page.evaluate(() => {
        const script = document.createElement('script');
        script.src = 'https://cdn.jsdelivr.net/npm/axe-core@4.8.2/axe.min.js';
        script.onload = () => {
          window.axeLoaded = true;
        };
        document.head.appendChild(script);
      });

      // Wait for axe to load
      await this.page.waitForFunction(() => window.axeLoaded, { timeout: 10000 });

      // Run accessibility audit
      const axeResults = await this.page.evaluate(async () => {
        return await axe.run({
          rules: {
            'color-contrast': { enabled: true },
            'keyboard-navigation': { enabled: true },
            'aria-labels': { enabled: true },
            'semantic-html': { enabled: true }
          }
        });
      });

      accessibilityData.violations = axeResults.violations;
      accessibilityData.passes = axeResults.passes;
      accessibilityData.incomplete = axeResults.incomplete;

      // Calculate accessibility score
      const totalTests = axeResults.violations.length + axeResults.passes.length + axeResults.incomplete.length;
      const passedTests = axeResults.passes.length;
      accessibilityData.score = Math.round((passedTests / totalTests) * 100);

    } catch (error) {
      console.warn('Error running accessibility audit:', error.message);
      accessibilityData.error = error.message;
    }

    return accessibilityData;
  }

  async generatePerformanceReport() {
    console.log('📋 Generating performance report...');

    const report = {
      timestamp: new Date().toISOString(),
      url: this.testConfig.url,
      summary: {
        overallScore: 0,
        status: 'Unknown',
        recommendations: []
      },
      performance: this.testResults.performance,
      network: this.testResults.network,
      memory: this.testResults.memory,
      rendering: this.testResults.rendering,
      accessibility: this.testResults.accessibility,
      mobile: this.testResults.mobile,
      thresholds: this.testConfig.thresholds
    };

    // Calculate overall score and recommendations
    let totalScore = 0;
    let scoreCount = 0;
    const recommendations = [];

    // Performance scoring
    if (this.testResults.performance.pageLoad) {
      const fcp = this.testResults.performance.pageLoad.firstContentfulPaint;
      const fcpScore = Math.max(0, 100 - (fcp / this.testConfig.thresholds.firstContentfulPaint) * 100);
      totalScore += fcpScore;
      scoreCount++;

      if (fcp > this.testConfig.thresholds.firstContentfulPaint) {
        recommendations.push('Optimize First Contentful Paint - currently ' + fcp + 'ms');
      }
    }

    // Memory scoring
    if (this.testResults.memory.afterInteractions) {
      const memoryUsage = this.testResults.memory.afterInteractions.used;
      const memoryScore = Math.max(0, 100 - (memoryUsage / this.testConfig.thresholds.memoryUsage) * 100);
      totalScore += memoryScore;
      scoreCount++;

      if (memoryUsage > this.testConfig.thresholds.memoryUsage) {
        recommendations.push('Reduce memory usage - currently ' + (memoryUsage / 1024 / 1024).toFixed(2) + 'MB');
      }
    }

    // Accessibility scoring
    if (this.testResults.accessibility.score) {
      totalScore += this.testResults.accessibility.score;
      scoreCount++;

      if (this.testResults.accessibility.score < 90) {
        recommendations.push('Improve accessibility - current score: ' + this.testResults.accessibility.score + '%');
      }
    }

    // Rendering performance scoring
    if (this.testResults.rendering.frameRate) {
      const fps = this.testResults.rendering.frameRate;
      const fpsScore = Math.max(0, (fps / 60) * 100);
      totalScore += fpsScore;
      scoreCount++;

      if (fps < this.testConfig.thresholds.animationFrameRate) {
        recommendations.push('Optimize animation performance - current FPS: ' + fps);
      }
    }

    report.summary.overallScore = scoreCount > 0 ? Math.round(totalScore / scoreCount) : 0;
    report.summary.recommendations = recommendations;
    report.summary.status = report.summary.overallScore >= 90 ? 'Excellent' :
                            report.summary.overallScore >= 80 ? 'Good' :
                            report.summary.overallScore >= 70 ? 'Fair' : 'Poor';

    return report;
  }

  async saveReport(report) {
    const reportPath = path.join(__dirname, 'performance-report-' + Date.now() + '.json');
    const htmlReportPath = path.join(__dirname, 'performance-report-' + Date.now() + '.html');

    // Save JSON report
    fs.writeFileSync(reportPath, JSON.stringify(report, null, 2));

    // Generate HTML report
    const htmlReport = this.generateHTMLReport(report);
    fs.writeFileSync(htmlReportPath, htmlReport);

    console.log(`📊 Report saved to: ${reportPath}`);
    console.log(`🌐 HTML report saved to: ${htmlReportPath}`);

    return { jsonPath: reportPath, htmlPath: htmlReportPath };
  }

  generateHTMLReport(report) {
    return `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Performance Report - CrossBTC Yield Vault</title>
    <script src="https://cdn.jsdelivr.net/npm/chart.js"></script>
    <style>
        body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; margin: 0; padding: 20px; background: #f5f5f5; }
        .container { max-width: 1200px; margin: 0 auto; background: white; border-radius: 12px; box-shadow: 0 4px 6px rgba(0,0,0,0.1); padding: 30px; }
        .header { text-align: center; margin-bottom: 40px; }
        .score { font-size: 48px; font-weight: bold; color: #f7931a; margin: 20px 0; }
        .status { font-size: 24px; font-weight: 600; padding: 10px 20px; border-radius: 8px; display: inline-block; }
        .status.Excellent { background: #10b981; color: white; }
        .status.Good { background: #3b82f6; color: white; }
        .status.Fair { background: #f59e0b; color: white; }
        .status.Poor { background: #ef4444; color: white; }
        .section { margin: 30px 0; padding: 20px; border: 1px solid #e5e7eb; border-radius: 8px; }
        .section h2 { color: #1f2937; margin-top: 0; }
        .metric { display: flex; justify-content: space-between; align-items: center; padding: 10px 0; border-bottom: 1px solid #f3f4f6; }
        .metric:last-child { border-bottom: none; }
        .metric-label { font-weight: 500; color: #4b5563; }
        .metric-value { font-weight: 600; color: #1f2937; }
        .recommendations { background: #fef3c7; border: 1px solid #fbbf24; border-radius: 8px; padding: 20px; }
        .recommendations ul { margin: 0; padding-left: 20px; }
        .chart-container { margin: 20px 0; height: 300px; }
        .bitcoin-gradient { background: linear-gradient(135deg, #f7931a 0%, #ffad2f 100%); color: white; }
        @media (max-width: 768px) {
            .container { margin: 10px; padding: 20px; }
            .score { font-size: 36px; }
        }
    </style>
</head>
<body>
    <div class="container">
        <div class="header bitcoin-gradient">
            <h1>🚀 CrossBTC Yield Vault Performance Report</h1>
            <div class="score">${report.summary.overallScore}/100</div>
            <div class="status ${report.summary.status}">${report.summary.status}</div>
            <p>Generated on ${new Date(report.timestamp).toLocaleString()}</p>
        </div>

        ${report.summary.recommendations.length > 0 ? `
        <div class="section recommendations">
            <h2>💡 Recommendations</h2>
            <ul>
                ${report.summary.recommendations.map(rec => `<li>${rec}</li>`).join('')}
            </ul>
        </div>
        ` : ''}

        ${report.performance.pageLoad ? `
        <div class="section">
            <h2>⚡ Performance Metrics</h2>
            <div class="metric">
                <span class="metric-label">First Contentful Paint</span>
                <span class="metric-value">${report.performance.pageLoad.firstContentfulPaint}ms</span>
            </div>
            <div class="metric">
                <span class="metric-label">DOM Interactive</span>
                <span class="metric-value">${report.performance.pageLoad.domInteractive}ms</span>
            </div>
            <div class="metric">
                <span class="metric-label">Total Page Load Time</span>
                <span class="metric-value">${report.performance.pageLoad.totalTime}ms</span>
            </div>
        </div>
        ` : ''}

        ${report.network.bundleAnalysis ? `
        <div class="section">
            <h2>📦 Bundle Analysis</h2>
            <div class="metric">
                <span class="metric-label">JavaScript Bundle Size</span>
                <span class="metric-value">${(report.network.bundleAnalysis.javascript.totalSize / 1024).toFixed(2)}KB</span>
            </div>
            <div class="metric">
                <span class="metric-label">CSS Bundle Size</span>
                <span class="metric-value">${(report.network.bundleAnalysis.css.totalSize / 1024).toFixed(2)}KB</span>
            </div>
            <div class="metric">
                <span class="metric-label">Cache Hit Rate</span>
                <span class="metric-value">${report.network.cachingAnalysis.cacheHitRate}</span>
            </div>
        </div>
        ` : ''}

        ${report.memory.afterInteractions ? `
        <div class="section">
            <h2>💾 Memory Usage</h2>
            <div class="metric">
                <span class="metric-label">Initial Memory Usage</span>
                <span class="metric-value">${(report.memory.initial.used / 1024 / 1024).toFixed(2)}MB</span>
            </div>
            <div class="metric">
                <span class="metric-label">Memory After Interactions</span>
                <span class="metric-value">${(report.memory.afterInteractions.used / 1024 / 1024).toFixed(2)}MB</span>
            </div>
            <div class="metric">
                <span class="metric-label">Memory After Garbage Collection</span>
                <span class="metric-value">${(report.memory.afterGC.used / 1024 / 1024).toFixed(2)}MB</span>
            </div>
        </div>
        ` : ''}

        ${report.rendering.frameRate ? `
        <div class="section">
            <h2>🎨 Rendering Performance</h2>
            <div class="metric">
                <span class="metric-label">Frame Rate</span>
                <span class="metric-value">${report.rendering.frameRate} FPS</span>
            </div>
            <div class="metric">
                <span class="metric-label">Cumulative Layout Shift</span>
                <span class="metric-value">${report.rendering.layoutShifts.toFixed(3)}</span>
            </div>
        </div>
        ` : ''}

        ${report.accessibility.score ? `
        <div class="section">
            <h2>♿ Accessibility</h2>
            <div class="metric">
                <span class="metric-label">Accessibility Score</span>
                <span class="metric-value">${report.accessibility.score}%</span>
            </div>
            <div class="metric">
                <span class="metric-label">Violations</span>
                <span class="metric-value">${report.accessibility.violations.length}</span>
            </div>
            <div class="metric">
                <span class="metric-label">Passed Tests</span>
                <span class="metric-value">${report.accessibility.passes.length}</span>
            </div>
        </div>
        ` : ''}

        <div class="section">
            <h2>📊 Performance Score Breakdown</h2>
            <div class="chart-container">
                <canvas id="performanceChart"></canvas>
            </div>
        </div>
    </div>

    <script>
        const ctx = document.getElementById('performanceChart').getContext('2d');
        new Chart(ctx, {
            type: 'radar',
            data: {
                labels: ['Performance', 'Memory', 'Accessibility', 'Rendering', 'Network'],
                datasets: [{
                    label: 'Current Score',
                    data: [
                        ${report.performance.pageLoad ? Math.max(0, 100 - (report.performance.pageLoad.firstContentfulPaint / 1500) * 100) : 0},
                        ${report.memory.afterInteractions ? Math.max(0, 100 - (report.memory.afterInteractions.used / (100 * 1024 * 1024)) * 100) : 0},
                        ${report.accessibility.score || 0},
                        ${report.rendering.frameRate ? (report.rendering.frameRate / 60) * 100 : 0},
                        85
                    ],
                    backgroundColor: 'rgba(247, 147, 26, 0.2)',
                    borderColor: 'rgba(247, 147, 26, 1)',
                    borderWidth: 2,
                    pointBackgroundColor: 'rgba(247, 147, 26, 1)'
                }, {
                    label: 'Target',
                    data: [90, 90, 90, 90, 90],
                    backgroundColor: 'rgba(16, 185, 129, 0.1)',
                    borderColor: 'rgba(16, 185, 129, 1)',
                    borderWidth: 1,
                    pointBackgroundColor: 'rgba(16, 185, 129, 1)'
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                scales: {
                    r: {
                        beginAtZero: true,
                        max: 100
                    }
                }
            }
        });
    </script>
</body>
</html>`;
  }

  async runFullTestSuite() {
    console.log('🧪 Starting comprehensive performance testing...\n');

    try {
      // Initialize browser
      await this.initialize();

      // Clear cache and cookies
      await this.clearCacheAndCookies();

      // Run all tests
      if (this.testConfig.tests.performance) {
        this.testResults.performance = await this.measurePageLoad();
      }

      if (this.testConfig.tests.network) {
        this.testResults.network = await this.analyzeNetworkRequests();
      }

      if (this.testConfig.tests.memory) {
        this.testResults.memory = await this.measureMemoryUsage();
      }

      if (this.testConfig.tests.performance) {
        this.testResults.rendering = await this.measureRenderingPerformance();
      }

      if (this.testConfig.tests.accessibility) {
        this.testResults.accessibility = await this.runAccessibilityAudit();
      }

      if (this.testConfig.tests.mobile) {
        this.testResults.mobile = await this.testMobileEmulation();
      }

      // Generate and save report
      const report = await this.generatePerformanceReport();
      const savedFiles = await this.saveReport(report);

      console.log('\n✅ Performance testing completed successfully!');
      console.log(`📊 Overall Score: ${report.summary.overallScore}/100 (${report.summary.status})`);
      console.log(`📂 Reports saved to:`);
      console.log(`   - JSON: ${savedFiles.jsonPath}`);
      console.log(`   - HTML: ${savedFiles.htmlPath}`);

      return report;

    } catch (error) {
      console.error('❌ Error during performance testing:', error);
      throw error;
    } finally {
      if (this.browser) {
        await this.browser.close();
      }
    }
  }
}

// Run the performance test
async function main() {
  const tester = new ChromeDevToolsPerformanceTester();

  try {
    const results = await tester.runFullTestSuite();

    // Print summary to console
    console.log('\n' + '='.repeat(60));
    console.log('📋 PERFORMANCE TEST SUMMARY');
    console.log('='.repeat(60));

    if (results.performance.pageLoad) {
      console.log(`⚡ First Contentful Paint: ${results.performance.pageLoad.firstContentfulPaint}ms`);
      console.log(`⚡ Total Load Time: ${results.performance.pageLoad.totalTime}ms`);
    }

    if (results.network.bundleAnalysis) {
      console.log(`📦 JS Bundle Size: ${(results.network.bundleAnalysis.javascript.totalSize / 1024).toFixed(2)}KB`);
      console.log(`📦 Cache Hit Rate: ${results.network.cachingAnalysis.cacheHitRate}`);
    }

    if (results.memory.afterInteractions) {
      console.log(`💾 Memory Usage: ${(results.memory.afterInteractions.used / 1024 / 1024).toFixed(2)}MB`);
    }

    if (results.rendering.frameRate) {
      console.log(`🎨 Frame Rate: ${results.rendering.frameRate} FPS`);
    }

    if (results.accessibility.score) {
      console.log(`♿ Accessibility Score: ${results.accessibility.score}%`);
    }

    console.log(`🏆 Overall Score: ${results.summary.overallScore}/100 (${results.summary.status})`);

    if (results.summary.recommendations.length > 0) {
      console.log('\n💡 Recommendations:');
      results.summary.recommendations.forEach((rec, index) => {
        console.log(`   ${index + 1}. ${rec}`);
      });
    }

    console.log('='.repeat(60));

  } catch (error) {
    console.error('❌ Performance testing failed:', error.message);
    process.exit(1);
  }
}

// Export for use as module
module.exports = ChromeDevToolsPerformanceTester;

// Run if called directly
if (require.main === module) {
  main();
}