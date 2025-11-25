import { test, expect } from '@playwright/test';

test.describe('ATLVS Projects', () => {
  test('should display projects page', async ({ page }) => {
    await page.goto('http://localhost:3001/projects');
    
    // Wait for page to load
    await page.waitForLoadState('networkidle');
    
    // Check for main heading
    await expect(page.getByText('Projects')).toBeVisible();
  });

  test('should allow searching projects', async ({ page }) => {
    await page.goto('http://localhost:3001/projects');
    await page.waitForLoadState('networkidle');
    
    // If there's a search input, test it
    const searchInput = page.getByPlaceholder(/search/i);
    if (await searchInput.isVisible()) {
      await searchInput.fill('test');
      await page.waitForTimeout(500);
    }
  });

  test('should navigate to project details', async ({ page }) => {
    await page.goto('http://localhost:3001/projects');
    await page.waitForLoadState('networkidle');
    
    // Click first view button if exists
    const viewButton = page.getByRole('button', { name: /view/i }).first();
    if (await viewButton.isVisible()) {
      await viewButton.click();
    }
  });
});
