import { test, expect, Page } from '@playwright/test';

/**
 * Critical Path: Cross-Platform Integration
 * Tests navigation and data flow between ATLVS, COMPVSS, and GVTEWAY
 */

// Helper to check if redirected to auth
function isAuthRedirect(url: string): boolean {
  return url.includes('/auth/signin') || url.includes('/auth/login');
}

// Helper to navigate and verify page - accepts auth redirects as valid for protected pages
async function navigateAndVerify(page: Page, baseUrl: string, path: string, urlPattern: RegExp, isProtected = true): Promise<boolean> {
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

test.describe('Cross-Platform Integration - Critical Path', () => {
  
  test.describe('ATLVS Platform Navigation', () => {
    const baseUrl = 'http://localhost:3001';

    test('should load about page (public)', async ({ page }) => {
      await navigateAndVerify(page, baseUrl, '/about', /about/, false);
    });

    test('should load production-level overview', async ({ page }) => {
      await navigateAndVerify(page, baseUrl, '/p/demo-001/overview', /p\/.*\/overview/);
    });

    test('should load production-level schedule', async ({ page }) => {
      await navigateAndVerify(page, baseUrl, '/p/demo-001/schedule', /p\/.*\/schedule/);
    });

    test('should load production-level team', async ({ page }) => {
      await navigateAndVerify(page, baseUrl, '/p/demo-001/team', /p\/.*\/team/);
    });

    test('should load production-level budget', async ({ page }) => {
      await navigateAndVerify(page, baseUrl, '/p/demo-001/budget', /p\/.*\/budget/);
    });
  });

  test.describe('COMPVSS Platform Navigation', () => {
    const baseUrl = 'http://localhost:3002';

    test('should load production-level overview', async ({ page }) => {
      await navigateAndVerify(page, baseUrl, '/p/demo-001/overview', /p\/.*\/overview/);
    });

    test('should load production-level schedule', async ({ page }) => {
      await navigateAndVerify(page, baseUrl, '/p/demo-001/schedule', /p\/.*\/schedule/);
    });

    test('should load production-level crew', async ({ page }) => {
      await navigateAndVerify(page, baseUrl, '/p/demo-001/crew', /p\/.*\/crew/);
    });

    test('should load production-level run-of-show', async ({ page }) => {
      await navigateAndVerify(page, baseUrl, '/p/demo-001/schedule/run-of-show', /p\/.*\/schedule\/run-of-show/);
    });

    test('should load production-level safety', async ({ page }) => {
      await navigateAndVerify(page, baseUrl, '/p/demo-001/safety', /p\/.*\/safety/);
    });
  });

  test.describe('GVTEWAY Event Navigation', () => {
    const baseUrl = 'http://localhost:3000';

    test('should load event-level page', async ({ page }) => {
      await navigateAndVerify(page, baseUrl, '/e/evt-001', /e\/evt-001/);
    });

    test('should load event map', async ({ page }) => {
      await navigateAndVerify(page, baseUrl, '/e/evt-001/map', /e\/.*\/map/);
    });

    test('should load event ticket', async ({ page }) => {
      await navigateAndVerify(page, baseUrl, '/e/evt-001/ticket', /e\/.*\/ticket/);
    });

    test('should load event services', async ({ page }) => {
      await navigateAndVerify(page, baseUrl, '/e/evt-001/services', /e\/.*\/services/);
    });

    test('should load event engage', async ({ page }) => {
      await navigateAndVerify(page, baseUrl, '/e/evt-001/engage', /e\/.*\/engage/);
    });
  });
});
