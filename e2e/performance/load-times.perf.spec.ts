import { test, expect } from '@playwright/test';

/**
 * Performance Testing: Page Load Times
 * Tests that critical pages load within acceptable thresholds
 */
test.describe('Performance - Page Load Times', () => {
  const LOAD_THRESHOLD_MS = 5000; // 5 seconds max for initial load

  test.describe('GVTEWAY Performance', () => {
    const baseUrl = 'http://localhost:3000';

    test('landing page loads within threshold', async ({ page }) => {
      const startTime = Date.now();
      await page.goto(baseUrl);
      await page.waitForLoadState('domcontentloaded');
      const loadTime = Date.now() - startTime;
      
      expect(loadTime).toBeLessThan(LOAD_THRESHOLD_MS);
      console.log(`GVTEWAY Landing: ${loadTime}ms`);
    });

    test('events page loads within threshold', async ({ page }) => {
      const startTime = Date.now();
      await page.goto(`${baseUrl}/events`);
      await page.waitForLoadState('domcontentloaded');
      const loadTime = Date.now() - startTime;
      
      expect(loadTime).toBeLessThan(LOAD_THRESHOLD_MS);
      console.log(`GVTEWAY Events: ${loadTime}ms`);
    });

    test('browse page loads within threshold', async ({ page }) => {
      const startTime = Date.now();
      await page.goto(`${baseUrl}/browse`);
      await page.waitForLoadState('domcontentloaded');
      const loadTime = Date.now() - startTime;
      
      expect(loadTime).toBeLessThan(LOAD_THRESHOLD_MS);
      console.log(`GVTEWAY Browse: ${loadTime}ms`);
    });
  });

  test.describe('ATLVS Performance', () => {
    const baseUrl = 'http://localhost:3001';

    test('landing page loads within threshold', async ({ page }) => {
      const startTime = Date.now();
      await page.goto(baseUrl);
      await page.waitForLoadState('domcontentloaded');
      const loadTime = Date.now() - startTime;
      
      expect(loadTime).toBeLessThan(LOAD_THRESHOLD_MS);
      console.log(`ATLVS Landing: ${loadTime}ms`);
    });

    test('dashboard loads within threshold', async ({ page }) => {
      const startTime = Date.now();
      await page.goto(`${baseUrl}/dashboard`);
      await page.waitForLoadState('domcontentloaded');
      const loadTime = Date.now() - startTime;
      
      expect(loadTime).toBeLessThan(LOAD_THRESHOLD_MS);
      console.log(`ATLVS Dashboard: ${loadTime}ms`);
    });

    test('projects page loads within threshold', async ({ page }) => {
      const startTime = Date.now();
      await page.goto(`${baseUrl}/projects`);
      await page.waitForLoadState('domcontentloaded');
      const loadTime = Date.now() - startTime;
      
      expect(loadTime).toBeLessThan(LOAD_THRESHOLD_MS);
      console.log(`ATLVS Projects: ${loadTime}ms`);
    });

    test('analytics page loads within threshold', async ({ page }) => {
      const startTime = Date.now();
      await page.goto(`${baseUrl}/analytics`);
      await page.waitForLoadState('domcontentloaded');
      const loadTime = Date.now() - startTime;
      
      expect(loadTime).toBeLessThan(LOAD_THRESHOLD_MS);
      console.log(`ATLVS Analytics: ${loadTime}ms`);
    });
  });

  test.describe('COMPVSS Performance', () => {
    const baseUrl = 'http://localhost:3002';

    test('landing page loads within threshold', async ({ page }) => {
      const startTime = Date.now();
      await page.goto(baseUrl);
      await page.waitForLoadState('domcontentloaded');
      const loadTime = Date.now() - startTime;
      
      expect(loadTime).toBeLessThan(LOAD_THRESHOLD_MS);
      console.log(`COMPVSS Landing: ${loadTime}ms`);
    });

    test('dashboard loads within threshold', async ({ page }) => {
      const startTime = Date.now();
      await page.goto(`${baseUrl}/dashboard`);
      await page.waitForLoadState('domcontentloaded');
      const loadTime = Date.now() - startTime;
      
      expect(loadTime).toBeLessThan(LOAD_THRESHOLD_MS);
      console.log(`COMPVSS Dashboard: ${loadTime}ms`);
    });

    test('crew page loads within threshold', async ({ page }) => {
      const startTime = Date.now();
      await page.goto(`${baseUrl}/crew`);
      await page.waitForLoadState('domcontentloaded');
      const loadTime = Date.now() - startTime;
      
      expect(loadTime).toBeLessThan(LOAD_THRESHOLD_MS);
      console.log(`COMPVSS Crew: ${loadTime}ms`);
    });

    test('schedule page loads within threshold', async ({ page }) => {
      const startTime = Date.now();
      await page.goto(`${baseUrl}/schedule`);
      await page.waitForLoadState('domcontentloaded');
      const loadTime = Date.now() - startTime;
      
      expect(loadTime).toBeLessThan(LOAD_THRESHOLD_MS);
      console.log(`COMPVSS Schedule: ${loadTime}ms`);
    });
  });
});
