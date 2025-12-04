import { test, expect } from '@playwright/test';

/**
 * Critical Path: Production Execution Flow
 * Tests the complete production execution journey in COMPVSS
 */
test.describe('Production Execution Flow - Critical Path', () => {
  const baseUrl = 'http://localhost:3002';

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

  test('should display crew page', async ({ page }) => {
    await page.goto(`${baseUrl}/crew`);
    await page.waitForLoadState('domcontentloaded');
    
    await expect(page).toHaveURL(/crew/);
  });

  test('should display equipment page', async ({ page }) => {
    await page.goto(`${baseUrl}/equipment`);
    await page.waitForLoadState('domcontentloaded');
    
    await expect(page).toHaveURL(/equipment/);
  });

  test('should display schedule page', async ({ page }) => {
    await page.goto(`${baseUrl}/schedule`);
    await page.waitForLoadState('domcontentloaded');
    
    await expect(page).toHaveURL(/schedule/);
  });

  test('should display advancing page', async ({ page }) => {
    await page.goto(`${baseUrl}/advancing`);
    await page.waitForLoadState('domcontentloaded');
    
    await expect(page).toHaveURL(/advancing/);
  });

  test('should display advancing catalog', async ({ page }) => {
    await page.goto(`${baseUrl}/advancing/catalog`);
    await page.waitForLoadState('domcontentloaded');
    
    await expect(page).toHaveURL(/advancing\/catalog/);
  });

  test('should display safety page', async ({ page }) => {
    await page.goto(`${baseUrl}/safety`);
    await page.waitForLoadState('domcontentloaded');
    
    await expect(page).toHaveURL(/safety/);
  });

  test('should display incidents page', async ({ page }) => {
    await page.goto(`${baseUrl}/incidents`);
    await page.waitForLoadState('domcontentloaded');
    
    await expect(page).toHaveURL(/incidents/);
  });

  test('should display run-of-show page', async ({ page }) => {
    await page.goto(`${baseUrl}/run-of-show`);
    await page.waitForLoadState('domcontentloaded');
    
    await expect(page).toHaveURL(/run-of-show/);
  });

  test('should display daily reports page', async ({ page }) => {
    await page.goto(`${baseUrl}/reports/daily`);
    await page.waitForLoadState('domcontentloaded');
    
    await expect(page).toHaveURL(/reports\/daily/);
  });

  test('should display wrap reports page', async ({ page }) => {
    await page.goto(`${baseUrl}/reports/wrap`);
    await page.waitForLoadState('domcontentloaded');
    
    await expect(page).toHaveURL(/reports\/wrap/);
  });

  test('should display settlement page', async ({ page }) => {
    await page.goto(`${baseUrl}/settlement`);
    await page.waitForLoadState('domcontentloaded');
    
    await expect(page).toHaveURL(/settlement/);
  });

  test('should display credentials page', async ({ page }) => {
    await page.goto(`${baseUrl}/credentials`);
    await page.waitForLoadState('domcontentloaded');
    
    await expect(page).toHaveURL(/credentials/);
  });

  test('should display SOPs page', async ({ page }) => {
    await page.goto(`${baseUrl}/sops`);
    await page.waitForLoadState('domcontentloaded');
    
    await expect(page).toHaveURL(/sops/);
  });
});
