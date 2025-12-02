import { test, expect } from '@playwright/test';
import path from 'path';

// Test fixtures paths
const FIXTURE_IMAGE_NORMAL = path.join(__dirname, 'fixtures', 'test-image-normal.jpg');
const FIXTURE_IMAGE_AI = path.join(__dirname, 'fixtures', 'test-image-ai.jpg');
const FIXTURE_IMAGE_NUDITY = path.join(__dirname, 'fixtures', 'test-image-nudity.jpg');

test.describe('Panospace E2E Tests', () => {
    test.beforeEach(async ({ page }) => {
        // Navigate to app running on emulators
        await page.goto('http://localhost:5173');
    });

    test.describe('Authentication Flow', () => {
        test('should complete signup flow', async ({ page }) => {
            // Navigate to signup
            await page.click('text=Sign Up');
            await expect(page).toHaveURL(/.*signup/);

            // Fill signup form
            const timestamp = Date.now();
            const email = `test-${timestamp}@example.com`;
            const password = 'TestPassword123!';

            await page.fill('input[type="email"]', email);
            await page.fill('input[placeholder="Password"]', password);
            await page.fill('input[placeholder="Confirm Password"]', password);

            // Submit
            await page.click('button[type="submit"]');

            // Should redirect to feed
            await expect(page).toHaveURL('/', { timeout: 10000 });
            await expect(page.locator('text=Latest')).toBeVisible();
        });

        test('should complete login flow', async ({ page }) => {
            // First create a user (using existing test user or create one)
            await page.goto('http://localhost:5173/login');

            await page.fill('input[type="email"]', 'test@example.com');
            await page.fill('input[type="password"]', 'password123');
            await page.click('button:has-text("Log In")');

            // Should redirect to feed
            await expect(page).toHaveURL('/', { timeout: 10000 });
        });

        test('should handle login errors', async ({ page }) => {
            await page.goto('http://localhost:5173/login');

            await page.fill('input[type="email"]', 'invalid@example.com');
            await page.fill('input[type="password"]', 'wrongpassword');
            await page.click('button:has-text("Log In")');

            // Should show error message
            await expect(page.locator('text=/Failed to log in/i')).toBeVisible({ timeout: 5000 });
        });
    });

    test.describe('Create Post Flow', () => {
        test.beforeEach(async ({ page }) => {
            // Login first
            await page.goto('http://localhost:5173/login');
            await page.fill('input[type="email"]', 'test@example.com');
            await page.fill('input[type="password"]', 'password123');
            await page.click('button:has-text("Log In")');
            await page.waitForURL('/', { timeout: 10000 });
        });

        test('should create post with images and text', async ({ page }) => {
            // Navigate to create post
            await page.click('[href="/create"]');
            await expect(page).toHaveURL('/create');

            // Add first image
            const fileInput1 = page.locator('input[type="file"]');
            await fileInput1.setInputFiles(FIXTURE_IMAGE_NORMAL);

            // Wait for compression
            await page.waitForTimeout(1000);

            // Add second image
            await fileInput1.setInputFiles(FIXTURE_IMAGE_NORMAL);
            await page.waitForTimeout(1000);

            // Add text slide
            await page.click('button:has-text("Add Text")');
            await page.fill('textarea[placeholder*="Type your story"]', 'This is my test post!');

            // Publish
            await page.click('button:has-text("Publish")');

            // Accept guidelines
            await expect(page.locator('text=Community Guidelines')).toBeVisible();
            await page.click('button:has-text("I Certify & Publish")');

            // Wait for upload to complete
            await expect(page.locator('text=Done!')).toBeVisible({ timeout: 30000 });

            // Should redirect to feed
            await expect(page).toHaveURL('/', { timeout: 5000 });

            // Verify post appears in feed
            await expect(page.locator('text=This is my test post!')).toBeVisible({ timeout: 5000 });
        });

        test('should reject AI-generated image', async ({ page }) => {
            // This test assumes AI detection is implemented
            // Navigate to create post
            await page.click('[href="/create"]');

            // Try to upload AI image
            const fileInput = page.locator('input[type="file"]');
            await fileInput.setInputFiles(FIXTURE_IMAGE_AI);

            // Should show rejection message
            await expect(page.locator('text=/AI.*not allowed/i')).toBeVisible({ timeout: 5000 });
        });

        test('should reject nudity image', async ({ page }) => {
            // Navigate to create post
            await page.click('[href="/create"]');

            // Try to upload nudity image
            const fileInput = page.locator('input[type="file"]');
            await fileInput.setInputFiles(FIXTURE_IMAGE_NUDITY);

            // Should show rejection message
            await expect(page.locator('text=/inappropriate.*content/i')).toBeVisible({ timeout: 5000 });
        });
    });

    test.describe('Feed and Profile', () => {
        test.beforeEach(async ({ page }) => {
            // Login
            await page.goto('http://localhost:5173/login');
            await page.fill('input[type="email"]', 'test@example.com');
            await page.fill('input[type="password"]', 'password123');
            await page.click('button:has-text("Log In")');
            await page.waitForURL('/');
        });

        test('should view post in fullscreen with signed URLs', async ({ page }) => {
            // Wait for posts to load
            await page.waitForSelector('[data-testid="post-item"], .post-card', { timeout: 10000 });

            // Click on first post
            await page.click('[data-testid="post-item"], .post-card');

            // Should open fullscreen viewer
            await expect(page.locator('[data-testid="fullscreen-viewer"]')).toBeVisible();

            // Verify image loads (signed URL should be fetched)
            const image = page.locator('img[src*="http"]').first();
            await expect(image).toBeVisible();

            // Check that image actually loaded
            await expect(image).toHaveJSProperty('complete', true);
        });

        test('should navigate to profile and view posts', async ({ page }) => {
            // Click profile link
            await page.click('[href="/profile/me"]');
            await expect(page).toHaveURL(/.*profile/);

            // Should show user info
            await expect(page.locator('text=Test User, text=test@example.com')).toBeVisible();

            // Should show posts grid
            await expect(page.locator('text=PORTFOLIO')).toBeVisible();
        });

        test('should switch between Latest and Discover tabs', async ({ page }) => {
            // Click Discover tab
            await page.click('button:has-text("Discover")');

            // Wait for posts to reload
            await page.waitForTimeout(1000);

            // Click Latest tab
            await page.click('button:has-text("Latest")');

            // Posts should reload
            await page.waitForTimeout(1000);
        });
    });

    test.describe('Search Flow', () => {
        test.beforeEach(async ({ page }) => {
            // Login
            await page.goto('http://localhost:5173/login');
            await page.fill('input[type="email"]', 'test@example.com');
            await page.fill('input[type="password"]', 'password123');
            await page.click('button:has-text("Log In")');
            await page.waitForURL('/');
        });

        test('should search for posts', async ({ page }) => {
            // Navigate to search
            await page.click('[href="/search"]');
            await expect(page).toHaveURL('/search');

            // Search for a term
            await page.fill('input[placeholder*="Search"]', 'test');

            // Wait for debounce and results
            await page.waitForTimeout(600);

            // Should show results or no results message
            const hasResults = await page.locator('[data-testid="search-result"]').count() > 0;
            const hasNoResults = await page.locator('text=No results found').isVisible();

            expect(hasResults || hasNoResults).toBeTruthy();
        });

        test('should search for artists', async ({ page }) => {
            await page.click('[href="/search"]');

            // Switch to Artists tab
            await page.click('button:has-text("Artists")');

            // Search
            await page.fill('input[placeholder*="Search"]', 'test');
            await page.waitForTimeout(600);

            // Should show user results
            const hasResults = await page.locator('text=Test User').isVisible().catch(() => false);
            expect(hasResults || await page.locator('text=No results found').isVisible()).toBeTruthy();
        });
    });

    test.describe('Accessibility', () => {
        test('feed page should have no critical a11y violations', async ({ page }) => {
            await page.goto('http://localhost:5173/login');
            await page.fill('input[type="email"]', 'test@example.com');
            await page.fill('input[type="password"]', 'password123');
            await page.click('button:has-text("Log In")');
            await page.waitForURL('/');

            // Run axe accessibility scan
            const accessibilityScanResults = await page.evaluate(async () => {
                // @ts-ignore
                const axe = await import('https://cdnjs.cloudflare.com/ajax/libs/axe-core/4.7.2/axe.min.js');
                // @ts-ignore
                return await axe.run();
            });

            const violations = accessibilityScanResults.violations.filter(
                v => v.impact === 'critical' || v.impact === 'serious'
            );

            expect(violations.length).toBe(0);
        });
    });

    test.describe('Logout', () => {
        test('should logout successfully', async ({ page }) => {
            // Login
            await page.goto('http://localhost:5173/login');
            await page.fill('input[type="email"]', 'test@example.com');
            await page.fill('input[type="password"]', 'password123');
            await page.click('button:has-text("Log In")');
            await page.waitForURL('/');

            // Go to profile
            await page.click('[href="/profile/me"]');

            // Click logout
            await page.click('button:has-text("Log Out")');

            // Should redirect to login
            await expect(page).toHaveURL(/.*login/, { timeout: 5000 });
        });
    });
});
