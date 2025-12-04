import { test, expect } from '@playwright/test';

/**
 * Critical Path: Cross-Platform Integration
 * Tests navigation and data flow between ATLVS, COMPVSS, and GVTEWAY
 */
test.describe('Cross-Platform Integration - Critical Path', () => {
  
  test.describe('ATLVS Platform Navigation', () => {
    const baseUrl = 'http://localhost:3001';

    test('should load about page (public)', async ({ page }) => {
      await page.goto(`${baseUrl}/about`);
      await page.waitForLoadState('domcontentloaded');
      
      await expect(page).toHaveURL(/about/);
    });

    test('should load production-level overview', async ({ page }) => {
      await page.goto(`${baseUrl}/p/demo-001/overview`);
      await page.waitForLoadState('domcontentloaded');
      
      await expect(page).toHaveURL(/p\/.*\/overview/);
    });

    test('should load production-level schedule', async ({ page }) => {
      await page.goto(`${baseUrl}/p/demo-001/schedule`);
      await page.waitForLoadState('domcontentloaded');
      
      await expect(page).toHaveURL(/p\/.*\/schedule/);
    });

    test('should load production-level team', async ({ page }) => {
      await page.goto(`${baseUrl}/p/demo-001/team`);
      await page.waitForLoadState('domcontentloaded');
      
      await expect(page).toHaveURL(/p\/.*\/team/);
    });

    test('should load production-level budget', async ({ page }) => {
      await page.goto(`${baseUrl}/p/demo-001/budget`);
      await page.waitForLoadState('domcontentloaded');
      
      await expect(page).toHaveURL(/p\/.*\/budget/);
    });
  });

  test.describe('COMPVSS Platform Navigation', () => {
    const baseUrl = 'http://localhost:3002';

    test('should load production-level overview', async ({ page }) => {
      await page.goto(`${baseUrl}/p/demo-001/overview`);
      await page.waitForLoadState('domcontentloaded');
      
      await expect(page).toHaveURL(/p\/.*\/overview/);
    });

    test('should load production-level schedule', async ({ page }) => {
      await page.goto(`${baseUrl}/p/demo-001/schedule`);
      await page.waitForLoadState('domcontentloaded');
      
      await expect(page).toHaveURL(/p\/.*\/schedule/);
    });

    test('should load production-level crew', async ({ page }) => {
      await page.goto(`${baseUrl}/p/demo-001/crew`);
      await page.waitForLoadState('domcontentloaded');
      
      await expect(page).toHaveURL(/p\/.*\/crew/);
    });

    test('should load production-level run-of-show', async ({ page }) => {
      await page.goto(`${baseUrl}/p/demo-001/schedule/run-of-show`);
      await page.waitForLoadState('domcontentloaded');
      
      await expect(page).toHaveURL(/p\/.*\/schedule\/run-of-show/);
    });

    test('should load production-level safety', async ({ page }) => {
      await page.goto(`${baseUrl}/p/demo-001/safety`);
      await page.waitForLoadState('domcontentloaded');
      
      await expect(page).toHaveURL(/p\/.*\/safety/);
    });
  });

  test.describe('GVTEWAY Event Navigation', () => {
    const baseUrl = 'http://localhost:3000';

    test('should load event-level page', async ({ page }) => {
      await page.goto(`${baseUrl}/e/evt-001`);
      await page.waitForLoadState('domcontentloaded');
      
      await expect(page).toHaveURL(/e\/evt-001/);
    });

    test('should load event map', async ({ page }) => {
      await page.goto(`${baseUrl}/e/evt-001/map`);
      await page.waitForLoadState('domcontentloaded');
      
      await expect(page).toHaveURL(/e\/.*\/map/);
    });

    test('should load event ticket', async ({ page }) => {
      await page.goto(`${baseUrl}/e/evt-001/ticket`);
      await page.waitForLoadState('domcontentloaded');
      
      await expect(page).toHaveURL(/e\/.*\/ticket/);
    });

    test('should load event services', async ({ page }) => {
      await page.goto(`${baseUrl}/e/evt-001/services`);
      await page.waitForLoadState('domcontentloaded');
      
      await expect(page).toHaveURL(/e\/.*\/services/);
    });

    test('should load event engage', async ({ page }) => {
      await page.goto(`${baseUrl}/e/evt-001/engage`);
      await page.waitForLoadState('domcontentloaded');
      
      await expect(page).toHaveURL(/e\/.*\/engage/);
    });
  });
});
