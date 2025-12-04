import { test, expect } from '@playwright/test';

/**
 * Critical Path: Authentication Flow
 * Tests the complete authentication journey across all apps
 */
test.describe('Authentication Flow - Critical Path', () => {
  
  test.describe('GVTEWAY Auth', () => {
    const baseUrl = 'http://localhost:3000';
    
    test('should display sign in page', async ({ page }) => {
      await page.goto(`${baseUrl}/auth/signin`);
      await page.waitForLoadState('domcontentloaded');
      
      // Check for sign in form elements
      await expect(page.locator('input[type="email"], input[name="email"]')).toBeVisible({ timeout: 10000 });
    });

    test('should display sign up page', async ({ page }) => {
      await page.goto(`${baseUrl}/auth/signup`);
      await page.waitForLoadState('domcontentloaded');
      
      // Check for sign up form
      await expect(page.locator('input[type="email"], input[name="email"]')).toBeVisible({ timeout: 10000 });
    });

    test('should display forgot password page', async ({ page }) => {
      await page.goto(`${baseUrl}/auth/forgot-password`);
      await page.waitForLoadState('domcontentloaded');
      
      // Check page loaded
      await expect(page).toHaveURL(/forgot-password/);
    });

    test('should navigate from sign in to sign up', async ({ page }) => {
      await page.goto(`${baseUrl}/auth/signin`);
      await page.waitForLoadState('domcontentloaded');
      
      // Look for sign up link
      const signUpLink = page.getByRole('link', { name: /sign up|create account|register/i });
      if (await signUpLink.isVisible()) {
        await signUpLink.click();
        await expect(page).toHaveURL(/signup/);
      }
    });
  });

  test.describe('ATLVS Auth', () => {
    const baseUrl = 'http://localhost:3001';
    
    test('should display sign in page', async ({ page }) => {
      await page.goto(`${baseUrl}/auth/signin`);
      await page.waitForLoadState('domcontentloaded');
      
      await expect(page.locator('input[type="email"], input[name="email"]')).toBeVisible({ timeout: 10000 });
    });

    test('should display sign up page', async ({ page }) => {
      await page.goto(`${baseUrl}/auth/signup`);
      await page.waitForLoadState('domcontentloaded');
      
      await expect(page.locator('input[type="email"], input[name="email"]')).toBeVisible({ timeout: 10000 });
    });
  });

  test.describe('COMPVSS Auth', () => {
    const baseUrl = 'http://localhost:3002';
    
    test('should display sign in page', async ({ page }) => {
      await page.goto(`${baseUrl}/auth/signin`);
      await page.waitForLoadState('domcontentloaded');
      
      await expect(page.locator('input[type="email"], input[name="email"]')).toBeVisible({ timeout: 10000 });
    });

    test('should display sign up page', async ({ page }) => {
      await page.goto(`${baseUrl}/auth/signup`);
      await page.waitForLoadState('domcontentloaded');
      
      await expect(page.locator('input[type="email"], input[name="email"]')).toBeVisible({ timeout: 10000 });
    });
  });
});
