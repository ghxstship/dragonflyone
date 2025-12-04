import { test, expect } from '@playwright/test';

/**
 * Critical Path: Production Planning Flow
 * Tests the complete production planning journey in ATLVS
 */
test.describe('Production Planning Flow - Critical Path', () => {
  const baseUrl = 'http://localhost:3001';

  test('should display landing page', async ({ page }) => {
    await page.goto(baseUrl);
    await page.waitForLoadState('domcontentloaded');
    
    await expect(page.locator('body')).toBeVisible();
  });

  test('should display dashboard', async ({ page }) => {
    await page.goto(`${baseUrl}/dashboard`);
    await page.waitForLoadState('domcontentloaded');
    
    await expect(page).toHaveURL(/dashboard/);
  });

  test('should display projects page', async ({ page }) => {
    await page.goto(`${baseUrl}/projects`);
    await page.waitForLoadState('domcontentloaded');
    
    await expect(page).toHaveURL(/projects/);
  });

  test('should display deals page', async ({ page }) => {
    await page.goto(`${baseUrl}/deals`);
    await page.waitForLoadState('domcontentloaded');
    
    await expect(page).toHaveURL(/deals/);
  });

  test('should display contacts page', async ({ page }) => {
    await page.goto(`${baseUrl}/contacts`);
    await page.waitForLoadState('domcontentloaded');
    
    await expect(page).toHaveURL(/contacts/);
  });

  test('should display vendors page', async ({ page }) => {
    await page.goto(`${baseUrl}/vendors`);
    await page.waitForLoadState('domcontentloaded');
    
    await expect(page).toHaveURL(/vendors/);
  });

  test('should display assets page', async ({ page }) => {
    await page.goto(`${baseUrl}/assets`);
    await page.waitForLoadState('domcontentloaded');
    
    await expect(page).toHaveURL(/assets/);
  });

  test('should display budgets page', async ({ page }) => {
    await page.goto(`${baseUrl}/budgets`);
    await page.waitForLoadState('domcontentloaded');
    
    await expect(page).toHaveURL(/budgets/);
  });

  test('should display analytics page', async ({ page }) => {
    await page.goto(`${baseUrl}/analytics`);
    await page.waitForLoadState('domcontentloaded');
    
    await expect(page).toHaveURL(/analytics/);
  });

  test('should display reports page', async ({ page }) => {
    await page.goto(`${baseUrl}/reports`);
    await page.waitForLoadState('domcontentloaded');
    
    await expect(page).toHaveURL(/reports/);
  });

  test('should display advancing page', async ({ page }) => {
    await page.goto(`${baseUrl}/advancing`);
    await page.waitForLoadState('domcontentloaded');
    
    await expect(page).toHaveURL(/advancing/);
  });

  test('should display generator page', async ({ page }) => {
    await page.goto(`${baseUrl}/generator`);
    await page.waitForLoadState('domcontentloaded');
    
    await expect(page).toHaveURL(/generator/);
  });
});
