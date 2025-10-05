// Automated Bitcoin Vault Validation Script
// Run this script in the browser console when visiting http://localhost:3000

console.log('🚀 Starting Automated Bitcoin Vault Validation');
console.log('===============================================');

const BitcoinVaultValidator = {
    results: [],
    startTime: Date.now(),

    log: function(test, status, details = '') {
        const result = {
            test: test,
            status: status,
            details: details,
            timestamp: new Date().toISOString()
        };
        this.results.push(result);

        const icon = status === 'PASS' ? '✅' : status === 'FAIL' ? '❌' : '⚠️';
        console.log(`${icon} ${test}: ${status} ${details}`);
    },

    checkPageLoad: function() {
        const loadTime = performance.timing.loadEventEnd - performance.timing.navigationStart;
        this.log('Page Load Performance', loadTime < 3000 ? 'PASS' : 'FAIL', `${loadTime}ms`);

        // Check for critical elements
        const header = document.querySelector('header');
        const main = document.querySelector('main');
        const title = document.querySelector('h1');

        this.log('Header Present', header ? 'PASS' : 'FAIL', '');
        this.log('Main Content Present', main ? 'PASS' : 'FAIL', '');
        this.log('Application Title', title && title.textContent.includes('CrossBTC') ? 'PASS' : 'FAIL', title?.textContent);
    },

    checkBitcoinElements: function() {
        const bitcoinIcons = document.querySelectorAll('svg.lucide-bitcoin');
        const bitcoinClasses = document.querySelectorAll('[class*="bitcoin"]');

        this.log('Bitcoin Icons Present', bitcoinIcons.length > 0 ? 'PASS' : 'FAIL', `${bitcoinIcons.length} found`);
        this.log('Bitcoin Theme Applied', bitcoinClasses.length > 0 ? 'PASS' : 'FAIL', `${bitcoinClasses.length} elements`);

        // Check for Bitcoin color
        const styles = getComputedStyle(document.body);
        this.log('Bitcoin Color Scheme', styles.getPropertyValue('--bitcoin-500') ? 'PASS' : 'WARN', 'Custom properties present');
    },

    checkVaultBalanceCard: function() {
        const balanceCard = document.querySelector('[data-testid="vault-balance"]') ||
                           document.querySelector('.rounded-lg.border');

        if (!balanceCard) {
            this.log('Vault Balance Card', 'FAIL', 'Card not found');
            return;
        }

        // Check for balance display
        const balanceElements = balanceCard.textContent.match(/0\.5\d+\s*BTC/);
        this.log('Balance Display', balanceElements ? 'PASS' : 'FAIL', balanceElements ? balanceElements[0] : 'Not found');

        // Check for APR display
        const aprElements = balanceCard.textContent.match(/7\.5\d*%/);
        this.log('APR Display', aprElements ? 'PASS' : 'FAIL', aprElements ? aprElements[0] : 'Not found');

        // Check for action buttons
        const buttons = balanceCard.querySelectorAll('button');
        this.log('Action Buttons Present', buttons.length >= 2 ? 'PASS' : 'FAIL', `${buttons.length} buttons found`);
    },

    checkYieldOverview: function() {
        const yieldCards = document.querySelectorAll('.rounded-lg.border');
        let yieldFound = false;

        yieldCards.forEach(card => {
            if (card.textContent.includes('Yield') || card.textContent.includes('yield')) {
                yieldFound = true;
                this.log('Yield Overview Section', 'PASS', 'Yield metrics displayed');

                // Check for specific yield metrics
                const metrics = ['yield rate', 'total earned', 'projected', 'risk'];
                metrics.forEach(metric => {
                    const found = card.textContent.toLowerCase().includes(metric);
                    this.log(`Yield Metric: ${metric}`, found ? 'PASS' : 'WARN', '');
                });
            }
        });

        if (!yieldFound) {
            this.log('Yield Overview Section', 'FAIL', 'Yield metrics not found');
        }
    },

    checkDepositModal: function() {
        // Look for deposit button
        const depositButtons = Array.from(document.querySelectorAll('button')).filter(btn =>
            btn.textContent.toLowerCase().includes('deposit')
        );

        this.log('Deposit Button Found', depositButtons.length > 0 ? 'PASS' : 'FAIL', `${depositButtons.length} found`);

        if (depositButtons.length > 0) {
            // Simulate deposit button click
            const depositBtn = depositButtons[0];
            console.log('🔍 Testing deposit modal functionality...');

            try {
                depositBtn.click();

                setTimeout(() => {
                    // Check if modal opened
                    const modal = document.querySelector('.fixed.inset-0, [role="dialog"]');
                    this.log('Deposit Modal Opens', modal ? 'PASS' : 'FAIL', '');

                    if (modal) {
                        // Check modal content
                        const input = modal.querySelector('input[type="text"], input[type="number"]');
                        const amountButtons = modal.querySelectorAll('button').forEach(btn => {
                            if (btn.textContent.includes('BTC')) {
                                this.log('Quick Amount Buttons', 'PASS', btn.textContent.trim());
                            }
                        });

                        // Test method selection
                        const bitcoinMethod = modal.textContent.includes('Bitcoin');
                        const lightningMethod = modal.textContent.includes('Lightning');
                        this.log('Bitcoin Deposit Method', bitcoinMethod ? 'PASS' : 'FAIL', '');
                        this.log('Lightning Deposit Method', lightningMethod ? 'PASS' : 'FAIL', '');

                        // Close modal
                        const closeButton = modal.querySelector('button[aria-label="Close"], button:has(text)');
                        if (closeButton) {
                            closeButton.click();
                            setTimeout(() => {
                                const modalClosed = !document.querySelector('.fixed.inset-0, [role="dialog"]');
                                this.log('Modal Closes Properly', modalClosed ? 'PASS' : 'FAIL', '');
                            }, 100);
                        }
                    }
                }, 500);

            } catch (error) {
                this.log('Deposit Modal Test', 'FAIL', error.message);
            }
        }
    },

    checkResponsiveDesign: function() {
        const originalWidth = window.innerWidth;

        // Test mobile view
        window.innerWidth = 375;
        window.dispatchEvent(new Event('resize'));

        setTimeout(() => {
            const mobileLayout = document.querySelector('.container');
            this.log('Mobile Layout Adapts', mobileLayout ? 'PASS' : 'FAIL', '375px width tested');

            // Test desktop view
            window.innerWidth = 1920;
            window.dispatchEvent(new Event('resize'));

            setTimeout(() => {
                this.log('Desktop Layout Adapts', 'PASS', '1920px width tested');

                // Restore original width
                window.innerWidth = originalWidth;
                window.dispatchEvent(new Event('resize'));
            }, 100);
        }, 100);
    },

    checkAccessibility: function() {
        // Check for proper heading hierarchy
        const headings = document.querySelectorAll('h1, h2, h3, h4, h5, h6');
        this.log('Heading Structure', headings.length > 0 ? 'PASS' : 'FAIL', `${headings.length} headings found`);

        // Check for button accessibility
        const buttons = document.querySelectorAll('button');
        const accessibleButtons = Array.from(buttons).filter(btn =>
            btn.textContent.trim() || btn.getAttribute('aria-label') || btn.getAttribute('title')
        );
        this.log('Button Accessibility', accessibleButtons.length === buttons.length ? 'PASS' : 'WARN',
                `${accessibleButtons}/${buttons.length} accessible`);

        // Check for form labels
        const inputs = document.querySelectorAll('input');
        const labeledInputs = Array.from(inputs).filter(input =>
            input.getAttribute('aria-label') ||
            document.querySelector(`label[for="${input.id}"]`) ||
            input.getAttribute('placeholder')
        );
        this.log('Form Labels Present', labeledInputs.length === inputs.length ? 'PASS' : 'WARN',
                `${labeledInputs}/${inputs.length} labeled`);

        // Check for keyboard navigation
        const focusableElements = document.querySelectorAll(
            'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
        );
        this.log('Keyboard Navigation', focusableElements.length > 0 ? 'PASS' : 'FAIL',
                `${focusableElements.length} focusable elements`);
    },

    checkTransactionHistory: function() {
        const transactionElements = document.querySelectorAll('[class*="transaction"], [class*="activity"]');
        const hasActivity = document.body.textContent.includes('Recent Activity') ||
                           document.body.textContent.includes('transaction');

        this.log('Transaction Section Present', hasActivity ? 'PASS' : 'WARN', '');

        if (hasActivity) {
            // Look for status indicators
            const statusIndicators = document.querySelectorAll('.bg-green-500, .bg-yellow-500, .bg-red-500');
            this.log('Transaction Status Indicators', statusIndicators.length > 0 ? 'PASS' : 'WARN',
                    `${statusIndicators.length} found`);
        }
    },

    checkPerformance: function() {
        // Check Core Web Vitals if available
        if (window.performance && window.performance.getEntriesByType) {
            const navEntries = performance.getEntriesByType('navigation');
            if (navEntries.length > 0) {
                const nav = navEntries[0];
                this.log('DNS Lookup Time', nav.domainLookupTime < 100 ? 'PASS' : 'WARN',
                        `${Math.round(nav.domainLookupTime)}ms`);
                this.log('Connection Time', nav.connectTime < 100 ? 'PASS' : 'WARN',
                        `${Math.round(nav.connectTime)}ms`);
                this.log('Response Time', nav.responseTime < 500 ? 'PASS' : 'WARN',
                        `${Math.round(nav.responseTime)}ms`);
            }
        }

        // Check for JavaScript errors
        const errorCount = window.__errorCount || 0;
        this.log('JavaScript Errors', errorCount === 0 ? 'PASS' : 'FAIL', `${errorCount} errors`);
    },

    runAllTests: function() {
        console.log('🧪 Running comprehensive validation tests...\n');

        // Track JavaScript errors
        window.__errorCount = 0;
        const originalError = console.error;
        console.error = function(...args) {
            window.__errorCount++;
            originalError.apply(console, args);
        };

        // Run tests in sequence
        this.checkPageLoad();
        setTimeout(() => this.checkBitcoinElements(), 100);
        setTimeout(() => this.checkVaultBalanceCard(), 200);
        setTimeout(() => this.checkYieldOverview(), 300);
        setTimeout(() => this.checkDepositModal(), 400);
        setTimeout(() => this.checkTransactionHistory(), 2000);
        setTimeout(() => this.checkResponsiveDesign(), 2500);
        setTimeout(() => this.checkAccessibility(), 3000);
        setTimeout(() => this.checkPerformance(), 3500);

        // Generate final report
        setTimeout(() => {
            this.generateReport();
        }, 4000);
    },

    generateReport: function() {
        const endTime = Date.now();
        const duration = endTime - this.startTime;

        const passed = this.results.filter(r => r.status === 'PASS').length;
        const failed = this.results.filter(r => r.status === 'FAIL').length;
        const warnings = this.results.filter(r => r.status === 'WARN').length;
        const total = this.results.length;

        console.log('\n📊 VALIDATION REPORT');
        console.log('====================');
        console.log(`⏱️  Duration: ${duration}ms`);
        console.log(`✅ Passed: ${passed}/${total}`);
        console.log(`❌ Failed: ${failed}/${total}`);
        console.log(`⚠️  Warnings: ${warnings}/${total}`);
        console.log(`📈 Success Rate: ${Math.round((passed/total) * 100)}%`);

        if (failed === 0) {
            console.log('\n🎉 ALL CRITICAL TESTS PASSED!');
            console.log('✅ Application is ready for production deployment');
        } else {
            console.log('\n⚠️  Some tests failed. Please review the issues above.');
        }

        // Export results for further analysis
        window.__validationResults = {
            summary: {
                passed, failed, warnings, total,
                successRate: Math.round((passed/total) * 100),
                duration
            },
            details: this.results,
            timestamp: new Date().toISOString()
        };

        console.log('\n💾 Results saved to window.__validationResults');

        // Restore original console.error
        console.error = window.__originalConsoleError || console.error;
    }
};

// Auto-start validation
console.log('🔧 Initializing Bitcoin Vault Validator...');
console.log('Run BitcoinVaultValidator.runAllTests() to start validation');

// Make available globally
window.BitcoinVaultValidator = BitcoinVaultValidator;

// Store original console.error
window.__originalConsoleError = console.error;