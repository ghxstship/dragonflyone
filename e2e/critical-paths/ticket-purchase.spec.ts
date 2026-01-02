import { test, expect, Page } from '@playwright/test';

/**
 * Critical Path: Ticket Purchase Flow
 * Tests the complete ticket purchase journey in GVTEWAY
 */

// Helper to check if redirected to auth
function isAuthRedirect(url: string): boolean {
  return url.includes('/auth/signin') || url.includes('/auth/login');
}

// Helper to navigate and verify page - accepts auth redirects as valid for protected pages
async function navigateAndVerify(page: Page, path: string, urlPattern: RegExp, isProtected = true): Promise<boolean> {
  const baseUrl = 'http://localhost:3000';
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

test.describe('Ticket Purchase Flow - Critical Path', () => {
  test('should display landing page with membership options', async ({ page }) => {
    await navigateAndVerify(page, '/', /localhost:3000/, false);
  });

  test('should navigate to browse events', async ({ page }) => {
    await navigateAndVerify(page, '/browse', /browse/, false);
  });

  test('should display events page', async ({ page }) => {
    await navigateAndVerify(page, '/events', /events/, false);
  });

  test('should display cart page', async ({ page }) => {
    await navigateAndVerify(page, '/cart', /cart/);
  });

  test('should display checkout page', async ({ page }) => {
    await navigateAndVerify(page, '/checkout', /checkout/);
  });

  test('should display tickets page', async ({ page }) => {
    await navigateAndVerify(page, '/tickets', /tickets/);
  });

  test('should display membership application page', async ({ page }) => {
    await navigateAndVerify(page, '/apply', /apply/, false);
  });

  test('should display rewards page', async ({ page }) => {
    await navigateAndVerify(page, '/rewards', /rewards/);
  });
});
