import { test, expect } from '@playwright/test';

test.describe('Create Post Flow', () => {
    test.beforeEach(async ({ page }) => {
        // Login with test user
        await page.goto('/login');
        await page.fill('input[type="email"]', 'test@panospace.com');
        await page.fill('input[type="password"]', 'testpassword');
        await page.click('button[type="submit"]');
        await page.waitForURL('/');
    });

    test('User can create multi-image post', async ({ page }) => {
        await page.goto('/create');

        // Upload images
        const fileInput = page.locator('input[type="file"]');
        await fileInput.setInputFiles([
            'test/fixtures/image1.jpg',
            'test/fixtures/image2.jpg',
        ]);

        // Wait for previews
        await expect(page.locator('.slide-preview')).toHaveCount(2);

        // Fill post details
        await page.fill('input[name="title"]', 'Test Post');
        await page.fill('textarea[name="description"]', 'Test description');
        await page.fill('input[name="tags"]', 'landscape, nature');

        // Submit
        await page.click('button:has-text("Publish")');

        // Should navigate to post detail
        await expect(page).toHaveURL(/\/post\/.+/);
        await expect(page.locator('h1')).toContainText('Test Post');
    });

    test('User can add images to shop', async ({ page }) => {
        await page.goto('/create');

        // Upload image
        const fileInput = page.locator('input[type="file"]');
        await fileInput.setInputFiles(['test/fixtures/image1.jpg']);

        // Toggle shop
        await page.click('input[name="addToShop"]');

        // Select print sizes
        await page.click('button:has-text("8x10")');
        await page.click('button:has-text("11x14")');

        // Set custom price
        await page.fill('input[name="price-8x10"]', '29.99');

        // Submit
        await page.fill('input[name="title"]', 'Shop Test');
        await page.click('button:has-text("Publish")');

        await expect(page).toHaveURL(/\/post\/.+/);

        // Go to profile shop tab
        await page.goto('/profile/me');
        await page.click('button:has-text("Shop")');

        // Should see shop item
        await expect(page.locator('.shop-item')).toHaveCount(1);
    });
});

test.describe('Feed Ranking', () => {
    test('Shows personalized feed', async ({ page }) => {
        await page.goto('/login');
        await page.fill('input[type="email"]', 'test@panospace.com');
        await page.fill('input[type="password"]', 'testpassword');
        await page.click('button[type="submit"]');
        await page.waitForURL('/');

        // Feed should load posts
        await expect(page.locator('.post')).toHaveCount.greaterThan(0);

        // Scroll to load more
        await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
        await page.waitForTimeout(1000);

        // Should have loaded more posts
        const postCount = await page.locator('.post').count();
        expect(postCount).toBeGreaterThan(5);
    });
});

test.describe('Search', () => {
    test('Can search users and posts', async ({ page }) => {
        await page.goto('/login');
        await page.fill('input[type="email"]', 'test@panospace.com');
        await page.fill('input[type="password"]', 'testpassword');
        await page.click('button[type="submit"]');

        await page.goto('/search');

        // Search for users
        await page.fill('input[placeholder*="Search"]', 'john');
        await page.waitForTimeout(500);

        // Should show results
        await expect(page.locator('.user-result')).toHaveCount.greaterThan(0);

        // Switch to posts tab
        await page.click('button:has-text("Posts")');

        // Search posts by tag
        await page.fill('input[placeholder*="Search"]', 'landscape');
        await page.waitForTimeout(500);

        await expect(page.locator('.post-result')).toHaveCount.greaterThan(0);
    });
});
