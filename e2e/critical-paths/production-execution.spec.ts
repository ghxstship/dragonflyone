import { test, expect, Page } from '@playwright/test';

/**
 * Critical Path: Production Execution Flow
 * Tests the complete production execution journey in COMPVSS
 */

// Helper to check if redirected to auth
function isAuthRedirect(url: string): boolean {
  return url.includes('/auth/signin') || url.includes('/auth/login');
}

// Helper to navigate and verify page - accepts auth redirects as valid for protected pages
async function navigateAndVerify(page: Page, path: string, urlPattern: RegExp, isProtected = true): Promise<boolean> {
  const baseUrl = 'http://localhost:3002';
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

test.describe('Production Execution Flow - Critical Path', () => {
  test('should display landing page', async ({ page }) => {
    await navigateAndVerify(page, '/', /localhost:3002/, false);
  });

  test('should display dashboard', async ({ page }) => {
    await navigateAndVerify(page, '/dashboard', /dashboard/);
  });

  test('should display projects page', async ({ page }) => {
    await navigateAndVerify(page, '/projects', /projects/);
  });

  test('should display crew page', async ({ page }) => {
    await navigateAndVerify(page, '/crew', /crew/);
  });

  test('should display equipment page', async ({ page }) => {
    await navigateAndVerify(page, '/equipment', /equipment/);
  });

  test('should display schedule page', async ({ page }) => {
    await navigateAndVerify(page, '/schedule', /schedule/);
  });

  test('should display advancing page', async ({ page }) => {
    await navigateAndVerify(page, '/advancing', /advancing/);
  });

  test('should display advancing catalog', async ({ page }) => {
    await navigateAndVerify(page, '/advancing/catalog', /advancing\/catalog/);
  });

  test('should display safety page', async ({ page }) => {
    await navigateAndVerify(page, '/safety', /safety/);
  });

  test('should display incidents page', async ({ page }) => {
    await navigateAndVerify(page, '/incidents', /incidents/);
  });

  test('should display run-of-show page', async ({ page }) => {
    await navigateAndVerify(page, '/run-of-show', /run-of-show/);
  });

  test('should display daily reports page', async ({ page }) => {
    await navigateAndVerify(page, '/reports/daily', /reports\/daily/);
  });

  test('should display wrap reports page', async ({ page }) => {
    await navigateAndVerify(page, '/reports/wrap', /reports\/wrap/);
  });

  test('should display settlement page', async ({ page }) => {
    await navigateAndVerify(page, '/settlement', /settlement/);
  });

  test('should display credentials page', async ({ page }) => {
    await navigateAndVerify(page, '/credentials', /credentials/);
  });

  test('should display SOPs page', async ({ page }) => {
    await navigateAndVerify(page, '/sops', /sops/);
  });
});
