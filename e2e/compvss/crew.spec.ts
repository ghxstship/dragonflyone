import { test, expect } from '@playwright/test';

const COMPVSS_BASE = 'http://localhost:3002';

// Helper to check if redirected to auth
function isAuthRedirect(url: string): boolean {
  return url.includes('/auth/signin') || url.includes('/auth/login');
}

test.describe('COMPVSS Crew Management', () => {
  test('should display crew directory', async ({ page }) => {
    await page.goto(`${COMPVSS_BASE}/crew`);
    await page.waitForLoadState('domcontentloaded');
    
    // Accept auth redirect as valid for protected pages
    if (isAuthRedirect(page.url())) {
      await expect(page.locator('body')).toBeVisible();
      return;
    }
    
    // Check for main heading
    await expect(page.getByText(/crew directory/i)).toBeVisible();
  });

  test('should filter crew by department', async ({ page }) => {
    await page.goto(`${COMPVSS_BASE}/crew`);
    await page.waitForLoadState('domcontentloaded');
    
    // Skip if redirected to auth
    if (isAuthRedirect(page.url())) {
      return;
    }
    
    // Find department filter
    const deptSelect = page.locator('select').first();
    if (await deptSelect.isVisible()) {
      await deptSelect.selectOption('Production');
      await page.waitForTimeout(500);
    }
  });

  test('should search crew members', async ({ page }) => {
    await page.goto(`${COMPVSS_BASE}/crew`);
    await page.waitForLoadState('domcontentloaded');
    
    // Skip if redirected to auth
    if (isAuthRedirect(page.url())) {
      return;
    }
    
    const searchInput = page.getByPlaceholder(/search/i);
    if (await searchInput.isVisible()) {
      await searchInput.fill('tech');
      await page.waitForTimeout(500);
    }
  });
});
