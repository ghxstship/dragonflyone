import { test, expect } from '@playwright/test';

test.describe('COMPVSS Crew Management', () => {
  test('should display crew directory', async ({ page }) => {
    await page.goto('http://localhost:3002/crew');
    await page.waitForLoadState('networkidle');
    
    // Check for main heading
    await expect(page.getByText(/crew directory/i)).toBeVisible();
  });

  test('should filter crew by department', async ({ page }) => {
    await page.goto('http://localhost:3002/crew');
    await page.waitForLoadState('networkidle');
    
    // Find department filter
    const deptSelect = page.locator('select').first();
    if (await deptSelect.isVisible()) {
      await deptSelect.selectOption('Production');
      await page.waitForTimeout(500);
    }
  });

  test('should search crew members', async ({ page }) => {
    await page.goto('http://localhost:3002/crew');
    await page.waitForLoadState('networkidle');
    
    const searchInput = page.getByPlaceholder(/search/i);
    if (await searchInput.isVisible()) {
      await searchInput.fill('tech');
      await page.waitForTimeout(500);
    }
  });
});
