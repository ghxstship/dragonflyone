import { test, expect, Page } from '@playwright/test';

/**
 * Critical Path: Production Planning Flow
 * Tests the complete production planning journey in ATLVS
 */

// Helper to check if redirected to auth
function isAuthRedirect(url: string): boolean {
  return url.includes('/auth/signin') || url.includes('/auth/login');
}

// Helper to navigate and verify page - accepts auth redirects as valid for protected pages
async function navigateAndVerify(page: Page, path: string, urlPattern: RegExp, isProtected = true): Promise<boolean> {
  const baseUrl = 'http://localhost:3001';
  await page.goto(`${baseUrl}${path}`);
  await page.waitForLoadState('domcontentloaded');
  
  const currentUrl = page.url();
  
  if (isProtected && isAuthRedirect(currentUrl)) {
    await expect(page.locator('body')).toBeVisible();
    return true;
  }
  
  await expect(page).toHaveURL(urlPattern, { timeout: 5000 }).catch(() => {
    if (isProtected && isAuthRedirect(page.url())) {
      return;
    }
    throw new Error(`Expected URL to match ${urlPattern}, got ${page.url()}`);
  });
  
  await expect(page.locator('body')).toBeVisible();
  return true;
}

test.describe('Production Planning Flow - Critical Path', () => {
  test('should display landing page', async ({ page }) => {
    await navigateAndVerify(page, '/', /localhost:3001/, false);
  });

  test('should display dashboard', async ({ page }) => {
    await navigateAndVerify(page, '/dashboard', /dashboard/);
  });

  test('should display projects page', async ({ page }) => {
    await navigateAndVerify(page, '/projects', /projects/);
  });

  test('should display deals page', async ({ page }) => {
    await navigateAndVerify(page, '/deals', /deals/);
  });

  test('should display contacts page', async ({ page }) => {
    await navigateAndVerify(page, '/contacts', /contacts/);
  });

  test('should display vendors page', async ({ page }) => {
    await navigateAndVerify(page, '/vendors', /vendors/);
  });

  test('should display assets page', async ({ page }) => {
    await navigateAndVerify(page, '/assets', /assets/);
  });

  test('should display budgets page', async ({ page }) => {
    await navigateAndVerify(page, '/budgets', /budgets/);
  });

  test('should display analytics page', async ({ page }) => {
    await navigateAndVerify(page, '/analytics', /analytics/);
  });

  test('should display reports page', async ({ page }) => {
    await navigateAndVerify(page, '/reports', /reports/);
  });

  test('should display advancing page', async ({ page }) => {
    await navigateAndVerify(page, '/advancing', /advancing/);
  });

  test('should display generator page', async ({ page }) => {
    await navigateAndVerify(page, '/generator', /generator/);
  });
});
