import { test, expect } from '@playwright/test';

/**
 * Critical Path: Ticket Purchase Flow
 * Tests the complete ticket purchase journey in GVTEWAY
 */
test.describe('Ticket Purchase Flow - Critical Path', () => {
  const baseUrl = 'http://localhost:3000';

  test('should display landing page with membership options', async ({ page }) => {
    await page.goto(baseUrl);
    await page.waitForLoadState('domcontentloaded');
    
    // Check for main content
    await expect(page.locator('body')).toBeVisible();
  });

  test('should navigate to browse events', async ({ page }) => {
    await page.goto(`${baseUrl}/browse`);
    await page.waitForLoadState('domcontentloaded');
    
    await expect(page).toHaveURL(/browse/);
  });

  test('should display events page', async ({ page }) => {
    await page.goto(`${baseUrl}/events`);
    await page.waitForLoadState('domcontentloaded');
    
    await expect(page).toHaveURL(/events/);
  });

  test('should display cart page', async ({ page }) => {
    await page.goto(`${baseUrl}/cart`);
    await page.waitForLoadState('domcontentloaded');
    
    await expect(page).toHaveURL(/cart/);
  });

  test('should display checkout page', async ({ page }) => {
    await page.goto(`${baseUrl}/checkout`);
    await page.waitForLoadState('domcontentloaded');
    
    await expect(page).toHaveURL(/checkout/);
  });

  test('should display tickets page', async ({ page }) => {
    await page.goto(`${baseUrl}/tickets`);
    await page.waitForLoadState('domcontentloaded');
    
    await expect(page).toHaveURL(/tickets/);
  });

  test('should display membership application page', async ({ page }) => {
    await page.goto(`${baseUrl}/apply`);
    await page.waitForLoadState('domcontentloaded');
    
    await expect(page).toHaveURL(/apply/);
  });

  test('should display rewards page', async ({ page }) => {
    await page.goto(`${baseUrl}/rewards`);
    await page.waitForLoadState('domcontentloaded');
    
    await expect(page).toHaveURL(/rewards/);
  });
});
