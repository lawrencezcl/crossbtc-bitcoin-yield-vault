# Cross-Chain Bitcoin Yield Vault - Manual Screen Capture Guide

## 📋 Overview

This guide provides step-by-step instructions for capturing comprehensive screen documentation of the Cross-Chain Bitcoin Yield Vault application running at **http://localhost:3003**.

## 🚀 Application Status Check

1. **Verify Application is Running:**
   - Open Chrome browser
   - Navigate to `http://localhost:3003`
   - Confirm the application loads with the CrossBTC dashboard

2. **Expected Loading Behavior:**
   - Initial loading states with skeleton animations (2-3 seconds)
   - Mock data loads showing:
     - Total Balance: 0.52500000 BTC
     - Principal: 0.50000000 BTC
     - Yield Earned: 0.02500000 BTC
     - Current APR: 7.50%

## 📸 Screen Capture Instructions

### 1. Dashboard Overview - Full Page Layout
**Purpose:** Show complete dashboard structure and Bitcoin theme

**Steps:**
1. Navigate to `http://localhost:3003`
2. Wait for content to load completely (skeleton animations disappear)
3. Press **F12** to open Chrome DevTools
4. Set viewport to **1920x1080** (Desktop)
5. **Zoom out** to fit entire page (Ctrl+- or Command+-)
6. **Capture** full page screenshot
7. **Include URL bar** and **DevTools** in view

**Key Elements to Verify:**
- ✅ CrossBTC header with Bitcoin logo
- ✅ Navigation menu (Dashboard, Activity, Settings)
- ✅ 3-column grid layout
- ✅ Vault Balance Card (left column)
- ✅ Yield Overview (right column)
- ✅ Recent Activity section
- ✅ Bitcoin orange color scheme (#f27a24)

---

### 2. Vault Balance Card - Component Detail
**Purpose:** Focus on vault balance component details and interactions

**Steps:**
1. Use DevTools **Element Selector** (Ctrl+Shift+C) to select the vault balance card
2. **Scroll** the vault card into center view
3. **Zoom in** to clearly see card details
4. **Hover** over the Deposit button (should show hover state)
5. **Capture** close-up view

**Expected Content:**
- ✅ Total Balance: 0.52500000 BTC
- ✅ Principal: 0.50000000 BTC
- ✅ Yield Earned: +0.02500000 BTC (green text)
- ✅ 24h Change: +2.30% (green badge)
- ✅ Current APR: 7.50% (Bitcoin orange)
- ✅ Deposit button with Bitcoin glow effect
- ✅ Withdraw button (outline style)

---

### 3. Yield Overview - Metrics Dashboard
**Purpose:** Show yield metrics, risk indicators, and strategy breakdown

**Steps:**
1. **Select** the Yield Overview card with DevTools element selector
2. **Center** the card in viewport
3. **Ensure** all metrics are visible
4. **Capture** detailed view

**Expected Content:**
- ✅ Current Yield Rate: 0.75% with progress bar
- ✅ Total Earned: 0.02500000 BTC (green background)
- ✅ Projected Annual: 0.0375 BTC (blue background)
- ✅ APR: 7.50% (large display)
- ✅ Risk Level: MEDIUM (warning badge)
- ✅ Active Strategies: Troves (60%) + Vesu Lending (40%)
- ✅ Last Distribution timestamp

---

### 4. Deposit Modal - Bitcoin Method
**Purpose:** Document deposit modal with Bitcoin method selected

**Steps:**
1. **Click** the **Deposit** button in the vault balance card
2. **Wait** for modal to open with smooth animation
3. **Verify** Bitcoin method is selected (default)
4. **Enter** amount: "0.01" in the input field
5. **Observe** USD value calculation appears
6. **Capture** with modal fully visible

**Expected Features:**
- ✅ Modal overlay with backdrop blur
- ✅ Bitcoin logo in modal title
- ✅ Amount input with "0.01" entered
- ✅ Quick amount buttons (0.001, 0.01, 0.1, 1 BTC)
- ✅ Bitcoin method selected (orange highlight)
- ✅ "~10-60 min" processing time
- ✅ USD value: ~$430 (0.01 × 43,000)
- ✅ Method information panel
- ✅ Cancel and Deposit buttons

---

### 5. Deposit Modal - Lightning Method
**Purpose:** Show Lightning Network method comparison

**Steps:**
1. **Click** the **Lightning** button in the deposit modal
2. **Observe** method switching animation
3. **Notice** color change to blue theme
4. **Verify** "Instant" processing time
5. **Capture** Lightning method view

**Expected Differences:**
- ✅ Lightning button selected (blue highlight)
- ✅ Zap icon instead of Bitcoin
- ✅ "Instant" processing time
- ✅ Blue-themed information panel
- ✅ Updated method description

---

### 6. Transaction History Section
**Purpose:** Document transaction list with status indicators

**Steps:**
1. **Close** the deposit modal (click Cancel or outside)
2. **Scroll** down to "Recent Activity" section
3. **Ensure** all transactions are visible
4. **Capture** transaction history

**Expected Transactions:**
- ✅ Bitcoin deposit via Lightning (completed) - Green status
- ✅ Daily yield distribution (completed) - Green status
- ✅ Bitcoin deposit via on-chain (pending) - Yellow status

**Visual Elements:**
- ✅ Color-coded status indicators (green/yellow/red dots)
- ✅ Green amounts for deposits/yield (+0.30000000 BTC)
- ✅ Transaction descriptions and timestamps
- ✅ Status badges (completed/pending)

---

### 7. Mobile Responsive View
**Purpose:** Show mobile-first responsive design

**Steps:**
1. **Open** Chrome DevTools (F12)
2. **Click** device toggle icon (or Ctrl+Shift+M)
3. **Select** iPhone 12 or similar mobile device
4. **Refresh** page if needed
5. **Scroll** to see mobile layout
6. **Capture** mobile view

**Expected Mobile Layout:**
- ✅ Stacked single column layout
- ✅ Compact navigation (possibly hamburger menu)
- ✅ Touch-friendly buttons and spacing
- ✅ Readable text sizes
- ✅ Maintained Bitcoin theme

---

### 8. Tablet Responsive View
**Purpose:** Show medium screen adaptation

**Steps:**
1. **In DevTools**, select iPad or tablet device
2. **Observe** layout adaptation
3. **Capture** tablet view

**Expected Tablet Layout:**
- ✅ Adapted 2-column or modified grid
- ✅ Larger touch targets than mobile
- ✅ Optimized spacing and typography
- ✅ Preserved functionality

---

### 9. Component State Variations
**Purpose:** Document interactive states and micro-interactions

**Steps:**
1. **Hover Effects:** Hover over buttons and capture
2. **Focus States:** Tab through elements and capture focus rings
3. **Loading States:** Open browser network tab and set to "Slow 3G", refresh page
4. **Capture** skeleton loading animations
5. **Error States:** Temporarily disable network to see error handling

**Expected States:**
- ✅ Button hover effects with shadows/color changes
- ✅ Focus rings for accessibility
- ✅ Skeleton loading animations
- ✅ Smooth transitions between states
- ✅ Error handling displays

---

### 10. Bitcoin Theme Design System
**Purpose:** Show consistent design language and theming

**Steps:**
1. **Open** DevTools Elements panel
2. **Inspect** various components to show CSS classes
3. **Use** color picker to verify Bitcoin theme colors
4. **Capture** with DevTools showing applied styles

**Expected Design Elements:**
- ✅ Bitcoin orange (#f27a24) primary color
- ✅ Consistent spacing and typography
- ✅ Professional financial interface design
- ✅ Accessible color contrasts
- ✅ Modern card-based layout

---

### 11. Technical Implementation Details
**Purpose:** Show clean code structure and zero errors

**Steps:**
1. **Open** Chrome DevTools Console tab
2. **Verify** zero JavaScript errors
3. **Open** Network tab and show clean resource loading
4. **Open** Performance tab and run a performance recording
5. **Capture** technical view

**Expected Technical Features:**
- ✅ Zero JavaScript errors in console
- ✅ Clean network requests with no failures
- ✅ Optimized bundle sizes
- ✅ Fast loading times
- ✅ Component-based architecture

---

## 🎯 Quality Checklist

For each screenshot, verify:

### Visual Quality
- [ ] High resolution (minimum 1920x1080)
- [ ] Clear, not blurry
- [ ] Good lighting/contrast
- [ ] Complete elements visible

### Technical Accuracy
- [ ] URL visible in browser bar
- [ ] DevTools open and showing relevant information
- [ ] Responsive testing tools visible where applicable
- [ ] Timestamp/context preserved

### Content Coverage
- [ ] All required elements are visible
- [ ] Interactive states shown where requested
- [ ] Mock data displaying correctly
- [ ] Bitcoin theme consistent throughout

## 📁 File Organization

Name your screenshots with this convention:
```
YYYY-MM-DD-[number]-[description].png
Example: 2025-10-05-01-dashboard-overview.png
```

**Required Screenshots:**
1. `dashboard-overview` - Full page layout
2. `vault-balance-card` - Component detail
3. `yield-overview` - Metrics dashboard
4. `deposit-modal-bitcoin` - Bitcoin method
5. `deposit-modal-lightning` - Lightning method
6. `transaction-history` - Activity list
7. `mobile-view` - Responsive mobile
8. `tablet-view` - Responsive tablet
9. `component-states` - Interactive states
10. `design-system` - Theme implementation
11. `technical-details` - DevTools view

## ⚡ Quick Tips

- Use **Chrome DevTools Screenshots** (DevTools > Three dots > Capture screenshot)
- **Right-click** > "Inspect" for quick element selection
- **Ctrl+Shift+P** > "Screenshot" for advanced capture options
- **Save** in PNG format for best quality
- **Keep** browser window maximized for consistent captures

## 🔍 Verification

After capturing all screenshots:
1. Review each image for quality and completeness
2. Verify all requested features are documented
3. Check that responsive behavior is clearly shown
4. Ensure technical details are visible
5. Confirm design system consistency

---

**Application URL:** http://localhost:3003
**Framework:** Next.js 12.3.4 with React 18
**Status:** ✅ FULLY OPERATIONAL
**Theme:** Bitcoin Orange (#f27a24)
**Design:** Mobile-first responsive layout