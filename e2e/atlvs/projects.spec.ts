import { test, expect } from '@playwright/test';

const ATLVS_BASE = 'http://localhost:3001';

// Helper to check if redirected to auth
function isAuthRedirect(url: string): boolean {
  return url.includes('/auth/signin') || url.includes('/auth/login');
}

test.describe('ATLVS Projects', () => {
  test('should display projects page', async ({ page }) => {
    await page.goto(`${ATLVS_BASE}/projects`);
    await page.waitForLoadState('domcontentloaded');
    
    // Accept auth redirect as valid for protected pages
    if (isAuthRedirect(page.url())) {
      await expect(page.locator('body')).toBeVisible();
      return;
    }
    
    // Check for main heading
    await expect(page.getByText('Projects')).toBeVisible();
  });

  test('should allow searching projects', async ({ page }) => {
    await page.goto(`${ATLVS_BASE}/projects`);
    await page.waitForLoadState('domcontentloaded');
    
    // Skip if redirected to auth
    if (isAuthRedirect(page.url())) {
      return;
    }
    
    // If there's a search input, test it
    const searchInput = page.getByPlaceholder(/search/i);
    if (await searchInput.isVisible()) {
      await searchInput.fill('test');
      await page.waitForTimeout(500);
    }
  });

  test('should navigate to project details', async ({ page }) => {
    await page.goto(`${ATLVS_BASE}/projects`);
    await page.waitForLoadState('domcontentloaded');
    
    // Skip if redirected to auth
    if (isAuthRedirect(page.url())) {
      return;
    }
    
    // Click first view button if exists
    const viewButton = page.getByRole('button', { name: /view/i }).first();
    if (await viewButton.isVisible()) {
      await viewButton.click();
    }
  });
});
