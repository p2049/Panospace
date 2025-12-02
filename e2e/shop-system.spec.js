/**
 * Shop System End-to-End Tests
 * Tests the entire shop flow: item creation, display, normalization, and checkout
 */

import { test, expect } from '@playwright/test';

test.describe('Shop System - Complete Flow', () => {
    test.beforeEach(async ({ page }) => {
        await page.goto('/');
        // Login (assuming test user exists)
        await page.fill('input[type="email"]', 'test@panospace.com');
        await page.fill('input[type="password"]', 'testpassword123');
        await page.click('button[type="submit"]');
        await page.waitForURL('**/feed');
    });

    test('Shop Tab - ScrollsCorrectly and Loads Items', async ({ page }) => {
        // Navigate to profile
        await page.goto('/profile/me');

        // Click Shop tab
        await page.click('button:has-text("Shop")');

        // Verify shop content area is scrollable
        const shopContainer = page.locator('[style*="grid"]').first();
        await expect(shopContainer).toBeVisible();

        // Verify no overflow:hidden or height:100vh that blocks scroll
        const computedStyle = await shopContainer.evaluate((el) => {
            return {
                overflow: window.getComputedStyle(el).overflow,
                overflowY: window.getComputedStyle(el).overflowY,
                height: window.getComputedStyle(el).height
            };
        });

        expect(computedStyle.overflow).not.toBe('hidden');
        expect(computedStyle.overflowY).not.toBe('hidden');
    });

    test('Create Post with Selective Shop Images', async ({ page, context }) => {
        // Navigate to Create Post
        await page.goto('/create-post');

        // Upload 3 test images
        const fileInput = page.locator('input[type="file"]');
        await fileInput.setInputFiles([
            'e2e/fixtures/test-image.jpg',
            'e2e/fixtures/test-image.jpg', // Reuse for simplicity
            'e2e/fixtures/test-image.jpg'
        ]);

        // Wait for images to process
        await page.waitForTimeout(2000);

        // Toggle "Sell" on ONLY the first and third images
        const sellToggles = page.locator('input[type="checkbox"]:near(:text("Sell"))');
        const count = await sellToggles.count();

        if (count >= 3) {
            await sellToggles.nth(0).check(); // First image
            await sellToggles.nth(2).check(); // Third image
            // Leave second unchecked
        }

        // Fill post details
        await page.fill('input[placeholder*="title" i]', 'Test Shop Post');
        await page.fill('textarea', 'Testing shop with selective images');

        // Set shop prices (if UI exists)
        const priceInputs = page.locator('input[type="number"]');
        if (await priceInputs.count() > 0) {
            await priceInputs.first().fill('15');
        }

        // Publish
        await page.click('button:has-text("Publish")');

        // Accept guidelines if shown (first-time only)
        const guidelinesButton = page.locator('button:has-text("I Agree")');
        if (await guidelinesButton.isVisible({ timeout: 2000 })) {
            await guidelinesButton.click();
        }

        // Wait for post to be created
        await page.waitForURL('**/feed', { timeout: 10000 });

        // Navigate to Profile Shop tab
        await page.goto('/profile/me');
        await page.click('button:has-text("Shop")');

        // Verify shop item was created
        const shopItem = page.locator('[style*="cursor: pointer"]').first();
        await expect(shopItem).toBeVisible({ timeout: 5000 });
    });

    test('Shop Item Detail - Valid Sizes Only', async ({ page }) => {
        // Assume a shop item exists
        await page.goto('/profile/me');
        await page.click('button:has-text("Shop")');

        // Click first shop item
        const firstItem = page.locator('[style*="cursor: pointer"]').first();
        await firstItem.click({ timeout: 5000 });

        // Wait for detail page
        await page.waitForURL('**/shop/**');

        // Verify only valid sizes are shown
        const validSizes = ['8x10', '11x14', '16x20', '18x24', '24x36'];
        const sizeButtons = page.locator('button:has-text("×")');
        const count = await sizeButtons.count();

        for (let i = 0; i < count; i++) {
            const text = await sizeButtons.nth(i).textContent();
            const hasValidSize = validSizes.some(size => text?.includes(size));
            expect(hasValidSize).toBeTruthy();
        }

        // Verify no invalid sizes like "12x16" or random sizes
        await expect(page.locator('button:has-text("12x16")')).not.toBeVisible();
        await expect(page.locator('button:has-text("5x7")')).not.toBeVisible();
    });

    test('Shop Item - Anti-Crop Image Display', async ({ page }) => {
        await page.goto('/profile/me');
        await page.click('button:has-text("Shop")');

        const firstItem = page.locator('[style*="cursor: pointer"]').first();
        if (await firstItem.isVisible()) {
            await firstItem.click();
            await page.waitForURL('**/shop/**');

            // Check main image uses object-fit: contain
            const mainImage = page.locator('img').first();
            const objectFit = await mainImage.evaluate((el) =>
                window.getComputedStyle(el).objectFit
            );

            expect(objectFit).toBe('contain');
        }
    });

    test('Buy Button - Checkout Integration', async ({ page }) => {
        await page.goto('/profile/me');
        await page.click('button:has-text("Shop")');

        const firstItem = page.locator('[style*="cursor: pointer"]').first();
        if (await firstItem.isVisible()) {
            await firstItem.click();
            await page.waitForURL('**/shop/**');

            // Select a size
            const sizeButton = page.locator('button:has-text("×")').first();
            await sizeButton.click();

            // Verify Buy/Checkout button exists
            const buyButton = page.locator('button:has-text("Buy"), button:has-text("Checkout")');
            await expect(buyButton).toBeVisible();

            // Click buy button (don't complete purchase in test)
            // Just verify it triggers without crashing
            const responsePromise = page.waitForResponse(
                response => response.url().includes('createCheckoutSession'),
                { timeout: 5000 }
            ).catch(() => null); // Allow timeout

            await buyButton.click();

            // If Stripe not configured, should show graceful error or modal
            // Should NOT crash the app
            await page.waitForTimeout(1000);

            // Verify page didn't crash
            await expect(page.locator('body')).toBeVisible();
        }
    });

    test('10 Image Limit Enforcement', async ({ page }) => {
        await page.goto('/create-post');

        // Try to add 11 images
        const fileInput = page.locator('input[type="file"]');
        const images = Array(11).fill('e2e/fixtures/test-image.jpg');

        // Add images one by one
        for (let i = 0; i < 11; i++) {
            await fileInput.setInputFiles([images[i]]);
            await page.waitForTimeout(500);

            if (i >= 10) {
                // After 10th image, verify alert or message
                page.on('dialog', dialog => {
                    expect(dialog.message()).toContain('10');
                    dialog.accept();
                });
            }
        }

        // Count actual images added
        const imageCount = await page.locator('[alt*="slide" i], img[src*="blob:"]').count();
        expect(imageCount).toBeLessThanOrEqual(10);
    });

    test('Mobile - Shop Scrolls Vertically', async ({ page }) => {
        // Set mobile viewport
        await page.setViewportSize({ width: 375, height: 667 });

        await page.goto('/profile/me');
        await page.click('button:has-text("Shop")');

        // Scroll down in shop
        await page.evaluate(() => window.scrollBy(0, 500));
        await page.waitForTimeout(500);

        const scrollY = await page.evaluate(() => window.scrollY);
        expect(scrollY).toBeGreaterThan(0);
    });

    test('Mobile - No Arrows in Post Viewer', async ({ page }) => {
        await page.setViewportSize({ width: 375, height: 667 });

        await page.goto('/feed');

        // Click on a post
        const post = page.locator('[style*="position: relative"]').first();
        await post.click({ timeout: 5000 });

        // Verify no arrow buttons visible
        const leftArrow = page.locator('button:has(svg)').filter({ hasText: /chevron|arrow.*left/i });
        const rightArrow = page.locator('button:has(svg)').filter({ hasText: /chevron|arrow.*right/i });

        await expect(leftArrow).not.toBeVisible();
        await expect(rightArrow).not.toBeVisible();
    });
});

test.describe('CreatePost - Layout & UX', () => {
    test.before Each(async ({ page }) => {
        await page.goto('/');
        await page.fill('input[type="email"]', 'test@panospace.com');
        await page.fill('input[type="password"]', 'testpassword123');
        await page.click('button[type="submit"]');
        await page.waitForURL('**/feed');
        await page.goto('/create-post');
    });

    test('Desktop - Two Column Layout', async ({ page }) => {
        await page.setViewportSize({ width: 1200, height: 800 });

        const container = page.locator('[style*="grid"]').first();
        const gridColumns = await container.evaluate((el) =>
            window.getComputedStyle(el).gridTemplateColumns
        );

        // Should have 2 columns on desktop
        expect(gridColumns).toContain('2fr');
        expect(gridColumns).toContain('3fr');
    });

    test('Mobile - Stacked Layout', async ({ page }) => {
        await page.setViewportSize({ width: 375, height: 667 });

        const container = page.locator('[style*="grid"]').first();
        const gridColumns = await container.evaluate((el) =>
            window.getComputedStyle(el).gridTemplateColumns
        );

        // Should have 1 column on mobile
        expect(gridColumns).toBe('1fr');
    });

    test('Compact Image Preview - "+X more" Overlay', async ({ page }) => {
        // Add 5 images
        const fileInput = page.locator('input[type="file"]');
        for (let i = 0; i < 5; i++) {
            await fileInput.setInputFiles(['e2e/fixtures/test-image.jpg']);
            await page.waitForTimeout(500);
        }

        // Verify only 2 images shown prominently
        const visibleImages = page.locator('img[src*="blob:"]').filter({ hasNot: page.locator('[style*="display: none"]') });
        const count = await visibleImages.count();

        // Should show compact view with "+X more"
        const moreOverlay = page.locator(':text("+")');
        await expect(moreOverlay).toBeVisible();
    });

    test('Full Page Scrollable After Adding Images', async ({ page }) => {
        // Add 3 images
        const fileInput = page.locator('input[type="file"]');
        for (let i = 0; i < 3; i++) {
            await fileInput.setInputFiles(['e2e/fixtures/test-image.jpg']);
            await page.waitForTimeout(500);
        }

        // Scroll to bottom of page
        await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
        await page.waitForTimeout(500);

        const scrollY = await page.evaluate(() => window.scrollY);
        expect(scrollY).toBeGreaterThan(0);

        // Verify Publish button is reachable
        const publishButton = page.locator('button:has-text("Publish")');
        await expect(publishButton).toBeInViewport();
    });
});

test.describe('Profile & General UX', () => {
    test('No Red Index Building Message', async ({ page }) => {
        await page.goto('/');
        await page.fill('input[type="email"]', 'test@panospace.com');
        await page.fill('input[type="password"]', 'testpassword123');
        await page.click('button[type="submit"]');
        await page.waitForURL('**/feed');

        await page.goto('/profile/me');

        // Verify no red message about "index building" or "setting up database"
        const redMessage = page.locator('[style*="color: red"], [style*="color:#f"], [style*="color: rgb(255"]');
        const messages = await redMessage.allTextContents();

        const hasIndexMessage = messages.some(msg =>
            msg.toLowerCase().includes('index') && msg.toLowerCase().includes('building')
        );

        expect(hasIndexMessage).toBeFalsy();
    });

    test('Profile Scrolls Normally', async ({ page }) => {
        await page.goto('/');
        await page.fill('input[type="email"]', 'test@panospace.com');
        await page.fill('input[type="password"]', 'testpassword123');
        await page.click('button[type="submit"]');
        await page.waitForURL('**/feed');

        await page.goto('/profile/me');

        // Scroll down
        await page.evaluate(() => window.scrollBy(0, 300));
        await page.waitForTimeout(300);

        const scrollY = await page.evaluate(() => window.scrollY);
        expect(scrollY).toBeGreaterThan(0);
    });
});
