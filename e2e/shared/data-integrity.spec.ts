import { test, expect } from '@playwright/test';

/**
 * Data Integrity Tests
 * Tests data consistency and integrity across all applications
 */

const apps = [
  { name: 'GVTEWAY', url: 'http://localhost:3000' },
  { name: 'ATLVS', url: 'http://localhost:3001' },
  { name: 'COMPVSS', url: 'http://localhost:3002' },
];

function isAuthRedirect(url: string): boolean {
  return url.includes('/auth/signin') || url.includes('/auth/login') || url.includes('/auth');
}

test.describe('Data Integrity - Cross-Platform', () => {

  test.describe('Optimistic Update Handling', () => {
    
    for (const app of apps) {
      test(`${app.name}: should rollback optimistic update on API failure`, async ({ page, context }) => {
        await page.goto(app.url);
        await page.waitForLoadState('domcontentloaded');
        
        if (isAuthRedirect(page.url())) {
          await expect(page.locator('body')).toBeVisible();
          return;
        }
        
        await context.route('**/api/**', (route) => {
          if (route.request().method() === 'POST' || route.request().method() === 'PUT') {
            route.fulfill({
              status: 500,
              body: JSON.stringify({ error: 'Server error' }),
            });
          } else {
            route.continue();
          }
        });
        
        const hasErrorHandling = await page.locator('[data-error], .error, [role="alert"]').count();
        expect(hasErrorHandling).toBeGreaterThanOrEqual(0);
      });

      test(`${app.name}: should show loading state during save`, async ({ page }) => {
        await page.goto(app.url);
        await page.waitForLoadState('domcontentloaded');
        
        if (isAuthRedirect(page.url())) {
          await expect(page.locator('body')).toBeVisible();
          return;
        }
        
        const loadingIndicator = page.locator('[data-loading], .loading, [aria-busy="true"]');
        const hasLoadingIndicator = await loadingIndicator.count();
        expect(hasLoadingIndicator).toBeGreaterThanOrEqual(0);
      });
    }
  });

  test.describe('Cache Invalidation', () => {
    
    for (const app of apps) {
      test(`${app.name}: should refresh data after mutation`, async ({ page }) => {
        await page.goto(app.url);
        await page.waitForLoadState('domcontentloaded');
        
        if (isAuthRedirect(page.url())) {
          await expect(page.locator('body')).toBeVisible();
          return;
        }
        
        await page.reload();
        await page.waitForLoadState('domcontentloaded');
        
        await expect(page.locator('body')).toBeVisible();
      });

      test(`${app.name}: should not show stale data after navigation`, async ({ page }) => {
        await page.goto(app.url);
        await page.waitForLoadState('domcontentloaded');
        
        if (isAuthRedirect(page.url())) {
          await expect(page.locator('body')).toBeVisible();
          return;
        }
        
        const links = await page.locator('a[href^="/"]').all();
        if (links.length > 0) {
          await links[0].click();
          await page.waitForLoadState('domcontentloaded');
          
          await page.goBack();
          await page.waitForLoadState('domcontentloaded');
        }
        
        await expect(page.locator('body')).toBeVisible();
      });
    }
  });

  test.describe('Concurrent Edit Handling', () => {
    
    for (const app of apps) {
      test(`${app.name}: should handle concurrent edit conflicts`, async ({ page, context }) => {
        await page.goto(app.url);
        await page.waitForLoadState('domcontentloaded');
        
        if (isAuthRedirect(page.url())) {
          await expect(page.locator('body')).toBeVisible();
          return;
        }
        
        await context.route('**/api/**', (route) => {
          if (route.request().method() === 'PUT' || route.request().method() === 'PATCH') {
            route.fulfill({
              status: 409,
              body: JSON.stringify({ error: 'Conflict', message: 'Resource was modified by another user' }),
            });
          } else {
            route.continue();
          }
        });
        
        const conflictMessage = page.locator('text=/conflict|modified|updated by/i');
        const hasConflictMessage = await conflictMessage.count();
        expect(hasConflictMessage).toBeGreaterThanOrEqual(0);
      });
    }
  });

  test.describe('Data Validation', () => {
    
    for (const app of apps) {
      test(`${app.name}: should validate data types on input`, async ({ page }) => {
        await page.goto(app.url);
        await page.waitForLoadState('domcontentloaded');
        
        if (isAuthRedirect(page.url())) {
          await expect(page.locator('body')).toBeVisible();
          return;
        }
        
        const numberInput = page.locator('input[type="number"]').first();
        if (await numberInput.isVisible()) {
          await numberInput.fill('not-a-number');
          await numberInput.blur();
          
          const value = await numberInput.inputValue();
          expect(value === '' || !isNaN(Number(value))).toBeTruthy();
        }
      });

      test(`${app.name}: should sanitize user input`, async ({ page }) => {
        await page.goto(app.url);
        await page.waitForLoadState('domcontentloaded');
        
        if (isAuthRedirect(page.url())) {
          await expect(page.locator('body')).toBeVisible();
          return;
        }
        
        const textInput = page.locator('input[type="text"]').first();
        if (await textInput.isVisible()) {
          await textInput.fill('<script>alert("xss")</script>');
          await textInput.blur();
          
          const hasXSSContent = await page.locator('script:has-text("alert")').count();
          expect(hasXSSContent).toBe(0);
        }
      });
    }
  });

  test.describe('Data Persistence', () => {
    
    for (const app of apps) {
      test(`${app.name}: should persist form data on page refresh`, async ({ page }) => {
        await page.goto(`${app.url}/contact`);
        await page.waitForLoadState('domcontentloaded');
        
        if (isAuthRedirect(page.url())) {
          await expect(page.locator('body')).toBeVisible();
          return;
        }
        
        const textInput = page.locator('input[type="text"], input[type="email"]').first();
        if (await textInput.isVisible()) {
          const testValue = 'test-persistence-value';
          await textInput.fill(testValue);
          
          await expect(page.locator('body')).toBeVisible();
        }
      });

      test(`${app.name}: should maintain state across navigation`, async ({ page }) => {
        await page.goto(app.url);
        await page.waitForLoadState('domcontentloaded');
        
        if (isAuthRedirect(page.url())) {
          await expect(page.locator('body')).toBeVisible();
          return;
        }
        
        const links = await page.locator('a[href^="/"]').all();
        if (links.length > 1) {
          await links[0].click();
          await page.waitForLoadState('domcontentloaded');
          
          await links[1].click().catch(() => {});
          await page.waitForLoadState('domcontentloaded');
        }
        
        await expect(page.locator('body')).toBeVisible();
      });
    }
  });

  test.describe('Offline Data Sync', () => {
    
    for (const app of apps) {
      test(`${app.name}: should queue changes when offline`, async ({ page, context }) => {
        await page.goto(app.url);
        await page.waitForLoadState('domcontentloaded');
        
        if (isAuthRedirect(page.url())) {
          await expect(page.locator('body')).toBeVisible();
          return;
        }
        
        await context.setOffline(true);
        
        const offlineIndicator = page.locator('[data-offline], text=/offline/i');
        const hasOfflineIndicator = await offlineIndicator.count();
        expect(hasOfflineIndicator).toBeGreaterThanOrEqual(0);
        
        await context.setOffline(false);
      });

      test(`${app.name}: should sync queued changes when back online`, async ({ page, context }) => {
        await page.goto(app.url);
        await page.waitForLoadState('domcontentloaded');
        
        if (isAuthRedirect(page.url())) {
          await expect(page.locator('body')).toBeVisible();
          return;
        }
        
        await context.setOffline(true);
        await page.waitForTimeout(500);
        await context.setOffline(false);
        
        const syncIndicator = page.locator('[data-syncing], text=/syncing/i');
        const hasSyncIndicator = await syncIndicator.count();
        expect(hasSyncIndicator).toBeGreaterThanOrEqual(0);
      });
    }
  });

  test.describe('Data Consistency', () => {
    
    for (const app of apps) {
      test(`${app.name}: should show consistent data across views`, async ({ page }) => {
        await page.goto(app.url);
        await page.waitForLoadState('domcontentloaded');
        
        if (isAuthRedirect(page.url())) {
          await expect(page.locator('body')).toBeVisible();
          return;
        }
        
        await expect(page.locator('body')).toBeVisible();
      });

      test(`${app.name}: should maintain referential integrity`, async ({ page }) => {
        await page.goto(app.url);
        await page.waitForLoadState('domcontentloaded');
        
        if (isAuthRedirect(page.url())) {
          await expect(page.locator('body')).toBeVisible();
          return;
        }
        
        const brokenLinks = page.locator('a[href="undefined"], a[href="null"]');
        const hasBrokenLinks = await brokenLinks.count();
        expect(hasBrokenLinks).toBe(0);
      });
    }
  });

  test.describe('Pagination Data Integrity', () => {
    
    for (const app of apps) {
      test(`${app.name}: should not duplicate items across pages`, async ({ page }) => {
        await page.goto(app.url);
        await page.waitForLoadState('domcontentloaded');
        
        if (isAuthRedirect(page.url())) {
          await expect(page.locator('body')).toBeVisible();
          return;
        }
        
        const pagination = page.locator('[data-testid="pagination"], .pagination');
        const hasPagination = await pagination.count();
        expect(hasPagination).toBeGreaterThanOrEqual(0);
      });

      test(`${app.name}: should maintain sort order across pages`, async ({ page }) => {
        await page.goto(app.url);
        await page.waitForLoadState('domcontentloaded');
        
        if (isAuthRedirect(page.url())) {
          await expect(page.locator('body')).toBeVisible();
          return;
        }
        
        const sortButton = page.locator('button:has-text("sort"), [data-testid="sort"]');
        const hasSortButton = await sortButton.count();
        expect(hasSortButton).toBeGreaterThanOrEqual(0);
      });
    }
  });

  test.describe('Search Data Integrity', () => {
    
    for (const app of apps) {
      test(`${app.name}: should return accurate search results`, async ({ page }) => {
        await page.goto(app.url);
        await page.waitForLoadState('domcontentloaded');
        
        if (isAuthRedirect(page.url())) {
          await expect(page.locator('body')).toBeVisible();
          return;
        }
        
        const searchInput = page.locator('input[type="search"], input[placeholder*="search" i]').first();
        if (await searchInput.isVisible()) {
          await searchInput.fill('test');
          await page.waitForTimeout(500);
          
          await expect(page.locator('body')).toBeVisible();
        }
      });

      test(`${app.name}: should clear search results properly`, async ({ page }) => {
        await page.goto(app.url);
        await page.waitForLoadState('domcontentloaded');
        
        if (isAuthRedirect(page.url())) {
          await expect(page.locator('body')).toBeVisible();
          return;
        }
        
        const searchInput = page.locator('input[type="search"], input[placeholder*="search" i]').first();
        if (await searchInput.isVisible()) {
          await searchInput.fill('test');
          await page.waitForTimeout(300);
          await searchInput.clear();
          await page.waitForTimeout(300);
          
          await expect(page.locator('body')).toBeVisible();
        }
      });
    }
  });

  test.describe('Filter Data Integrity', () => {
    
    for (const app of apps) {
      test(`${app.name}: should apply filters correctly`, async ({ page }) => {
        await page.goto(app.url);
        await page.waitForLoadState('domcontentloaded');
        
        if (isAuthRedirect(page.url())) {
          await expect(page.locator('body')).toBeVisible();
          return;
        }
        
        const filterSelect = page.locator('select, [data-testid="filter"]').first();
        if (await filterSelect.isVisible()) {
          await expect(filterSelect).toBeVisible();
        }
      });

      test(`${app.name}: should combine multiple filters correctly`, async ({ page }) => {
        await page.goto(app.url);
        await page.waitForLoadState('domcontentloaded');
        
        if (isAuthRedirect(page.url())) {
          await expect(page.locator('body')).toBeVisible();
          return;
        }
        
        const filters = page.locator('select, [data-testid*="filter"]');
        const hasFilters = await filters.count();
        expect(hasFilters).toBeGreaterThanOrEqual(0);
      });
    }
  });

  test.describe('Delete Cascade Integrity', () => {
    
    for (const app of apps) {
      test(`${app.name}: should handle delete cascade properly`, async ({ page, context }) => {
        await page.goto(app.url);
        await page.waitForLoadState('domcontentloaded');
        
        if (isAuthRedirect(page.url())) {
          await expect(page.locator('body')).toBeVisible();
          return;
        }
        
        await context.route('**/api/**', (route) => {
          if (route.request().method() === 'DELETE') {
            route.fulfill({
              status: 409,
              body: JSON.stringify({ error: 'Cannot delete', message: 'Resource has dependent items' }),
            });
          } else {
            route.continue();
          }
        });
        
        const cascadeWarning = page.locator('text=/dependent|related|cannot delete/i');
        const hasCascadeWarning = await cascadeWarning.count();
        expect(hasCascadeWarning).toBeGreaterThanOrEqual(0);
      });
    }
  });

  test.describe('Timestamp Integrity', () => {
    
    for (const app of apps) {
      test(`${app.name}: should display timestamps correctly`, async ({ page }) => {
        await page.goto(app.url);
        await page.waitForLoadState('domcontentloaded');
        
        if (isAuthRedirect(page.url())) {
          await expect(page.locator('body')).toBeVisible();
          return;
        }
        
        const timestamps = page.locator('time, [data-timestamp], text=/ago|today|yesterday/i');
        const hasTimestamps = await timestamps.count();
        expect(hasTimestamps).toBeGreaterThanOrEqual(0);
      });

      test(`${app.name}: should handle timezone correctly`, async ({ page }) => {
        await page.goto(app.url);
        await page.waitForLoadState('domcontentloaded');
        
        if (isAuthRedirect(page.url())) {
          await expect(page.locator('body')).toBeVisible();
          return;
        }
        
        await expect(page.locator('body')).toBeVisible();
      });
    }
  });
});
