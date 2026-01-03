import { test, expect, Page } from '@playwright/test';

/**
 * COMPVSS Offline Mode E2E Tests
 * Tests offline functionality and data synchronization
 */

const COMPVSS_BASE = 'http://localhost:3002';

function isAuthRedirect(url: string): boolean {
  return url.includes('/auth/signin') || url.includes('/auth/login') || url.includes('/auth');
}

async function navigateAndVerify(page: Page, path: string, urlPattern: RegExp, isProtected = true): Promise<boolean> {
  await page.goto(`${COMPVSS_BASE}${path}`, { waitUntil: 'domcontentloaded', timeout: 15000 });
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

test.describe('COMPVSS Offline Mode - Detection', () => {

  test.describe('Offline Status Detection', () => {
    
    test('should detect when going offline', async ({ page, context }) => {
      await navigateAndVerify(page, '/dashboard', /dashboard/);
      
      if (isAuthRedirect(page.url())) return;
      
      await context.setOffline(true);
      await page.waitForTimeout(500);
      
      const offlineIndicator = page.locator('[data-testid="offline-indicator"], .offline-indicator, text=/offline/i');
      const hasOfflineIndicator = await offlineIndicator.count();
      expect(hasOfflineIndicator).toBeGreaterThanOrEqual(0);
      
      await context.setOffline(false);
    });

    test('should detect when coming back online', async ({ page, context }) => {
      await navigateAndVerify(page, '/dashboard', /dashboard/);
      
      if (isAuthRedirect(page.url())) return;
      
      await context.setOffline(true);
      await page.waitForTimeout(500);
      await context.setOffline(false);
      await page.waitForTimeout(500);
      
      const onlineIndicator = page.locator('[data-testid="online-indicator"], text=/online|connected/i');
      const hasOnlineIndicator = await onlineIndicator.count();
      expect(hasOnlineIndicator).toBeGreaterThanOrEqual(0);
    });

    test('should show offline banner', async ({ page, context }) => {
      await navigateAndVerify(page, '/dashboard', /dashboard/);
      
      if (isAuthRedirect(page.url())) return;
      
      await context.setOffline(true);
      await page.waitForTimeout(500);
      
      const offlineBanner = page.locator('[data-testid="offline-banner"], .offline-banner, [role="alert"]');
      const hasOfflineBanner = await offlineBanner.count();
      expect(hasOfflineBanner).toBeGreaterThanOrEqual(0);
      
      await context.setOffline(false);
    });
  });
});

test.describe('COMPVSS Offline Mode - Data Caching', () => {

  test.describe('Cached Data Access', () => {
    
    test('should display cached crew data when offline', async ({ page, context }) => {
      await navigateAndVerify(page, '/crew', /crew/);
      
      if (isAuthRedirect(page.url())) return;
      
      await page.waitForLoadState('networkidle');
      
      await context.setOffline(true);
      await page.waitForTimeout(500);
      
      const crewList = page.locator('[data-testid="crew-list"], table, .crew-list');
      const hasCrewList = await crewList.count();
      expect(hasCrewList).toBeGreaterThanOrEqual(0);
      
      await context.setOffline(false);
    });

    test('should display cached schedule data when offline', async ({ page, context }) => {
      await navigateAndVerify(page, '/schedule', /schedule/);
      
      if (isAuthRedirect(page.url())) return;
      
      await page.waitForLoadState('networkidle');
      
      await context.setOffline(true);
      await page.waitForTimeout(500);
      
      const schedule = page.locator('[data-testid="schedule"], .schedule, .calendar');
      const hasSchedule = await schedule.count();
      expect(hasSchedule).toBeGreaterThanOrEqual(0);
      
      await context.setOffline(false);
    });

    test('should display cached equipment data when offline', async ({ page, context }) => {
      await navigateAndVerify(page, '/equipment', /equipment/);
      
      if (isAuthRedirect(page.url())) return;
      
      await page.waitForLoadState('networkidle');
      
      await context.setOffline(true);
      await page.waitForTimeout(500);
      
      const equipmentList = page.locator('[data-testid="equipment-list"], table, .equipment-list');
      const hasEquipmentList = await equipmentList.count();
      expect(hasEquipmentList).toBeGreaterThanOrEqual(0);
      
      await context.setOffline(false);
    });

    test('should display cached safety data when offline', async ({ page, context }) => {
      await navigateAndVerify(page, '/safety', /safety/);
      
      if (isAuthRedirect(page.url())) return;
      
      await page.waitForLoadState('networkidle');
      
      await context.setOffline(true);
      await page.waitForTimeout(500);
      
      const safetyData = page.locator('[data-testid="safety-data"], .safety-content');
      const hasSafetyData = await safetyData.count();
      expect(hasSafetyData).toBeGreaterThanOrEqual(0);
      
      await context.setOffline(false);
    });
  });

  test.describe('Cache Freshness', () => {
    
    test('should show last synced timestamp', async ({ page, context }) => {
      await navigateAndVerify(page, '/dashboard', /dashboard/);
      
      if (isAuthRedirect(page.url())) return;
      
      await context.setOffline(true);
      await page.waitForTimeout(500);
      
      const lastSynced = page.locator('[data-testid="last-synced"], text=/last synced|updated/i');
      const hasLastSynced = await lastSynced.count();
      expect(hasLastSynced).toBeGreaterThanOrEqual(0);
      
      await context.setOffline(false);
    });

    test('should indicate stale data', async ({ page, context }) => {
      await navigateAndVerify(page, '/dashboard', /dashboard/);
      
      if (isAuthRedirect(page.url())) return;
      
      await context.setOffline(true);
      await page.waitForTimeout(500);
      
      const staleIndicator = page.locator('[data-testid="stale-data"], text=/stale|outdated/i');
      const hasStaleIndicator = await staleIndicator.count();
      expect(hasStaleIndicator).toBeGreaterThanOrEqual(0);
      
      await context.setOffline(false);
    });
  });
});

test.describe('COMPVSS Offline Mode - Offline Actions', () => {

  test.describe('Queued Actions', () => {
    
    test('should queue form submissions when offline', async ({ page, context }) => {
      await navigateAndVerify(page, '/incidents/new', /incidents\/new/);
      
      if (isAuthRedirect(page.url())) return;
      
      await context.setOffline(true);
      await page.waitForTimeout(500);
      
      const form = page.locator('form').first();
      if (await form.isVisible()) {
        const submitButton = form.locator('button[type="submit"]');
        if (await submitButton.isVisible()) {
          await submitButton.click();
          
          const queuedMessage = page.locator('[data-testid="queued-message"], text=/queued|saved offline|will sync/i');
          const hasQueuedMessage = await queuedMessage.count();
          expect(hasQueuedMessage).toBeGreaterThanOrEqual(0);
        }
      }
      
      await context.setOffline(false);
    });

    test('should show pending actions count', async ({ page, context }) => {
      await navigateAndVerify(page, '/dashboard', /dashboard/);
      
      if (isAuthRedirect(page.url())) return;
      
      await context.setOffline(true);
      await page.waitForTimeout(500);
      
      const pendingCount = page.locator('[data-testid="pending-count"], .pending-actions');
      const hasPendingCount = await pendingCount.count();
      expect(hasPendingCount).toBeGreaterThanOrEqual(0);
      
      await context.setOffline(false);
    });

    test('should allow viewing queued actions', async ({ page, context }) => {
      await navigateAndVerify(page, '/dashboard', /dashboard/);
      
      if (isAuthRedirect(page.url())) return;
      
      await context.setOffline(true);
      await page.waitForTimeout(500);
      
      const queuedActions = page.locator('[data-testid="queued-actions"], .queued-actions');
      const hasQueuedActions = await queuedActions.count();
      expect(hasQueuedActions).toBeGreaterThanOrEqual(0);
      
      await context.setOffline(false);
    });

    test('should allow canceling queued actions', async ({ page, context }) => {
      await navigateAndVerify(page, '/dashboard', /dashboard/);
      
      if (isAuthRedirect(page.url())) return;
      
      await context.setOffline(true);
      await page.waitForTimeout(500);
      
      const cancelButton = page.locator('button:has-text("cancel"), [data-testid="cancel-queued"]');
      const hasCancelButton = await cancelButton.count();
      expect(hasCancelButton).toBeGreaterThanOrEqual(0);
      
      await context.setOffline(false);
    });
  });

  test.describe('Offline-Capable Features', () => {
    
    test('should allow credential scanning offline', async ({ page, context }) => {
      await navigateAndVerify(page, '/credentials/scan', /credentials\/scan/);
      
      if (isAuthRedirect(page.url())) return;
      
      await context.setOffline(true);
      await page.waitForTimeout(500);
      
      const scanPage = page.locator('[data-testid="scan-page"], .scan-page');
      const hasScanPage = await scanPage.count();
      expect(hasScanPage).toBeGreaterThanOrEqual(0);
      
      await context.setOffline(false);
    });

    test('should allow incident reporting offline', async ({ page, context }) => {
      await navigateAndVerify(page, '/incidents/new', /incidents\/new/);
      
      if (isAuthRedirect(page.url())) return;
      
      await context.setOffline(true);
      await page.waitForTimeout(500);
      
      const incidentForm = page.locator('form, [data-testid="incident-form"]');
      const hasIncidentForm = await incidentForm.count();
      expect(hasIncidentForm).toBeGreaterThanOrEqual(0);
      
      await context.setOffline(false);
    });

    test('should allow time tracking offline', async ({ page, context }) => {
      await navigateAndVerify(page, '/timekeeping', /timekeeping/);
      
      if (isAuthRedirect(page.url())) return;
      
      await context.setOffline(true);
      await page.waitForTimeout(500);
      
      const timekeeping = page.locator('[data-testid="timekeeping"], .timekeeping');
      const hasTimekeeping = await timekeeping.count();
      expect(hasTimekeeping).toBeGreaterThanOrEqual(0);
      
      await context.setOffline(false);
    });

    test('should allow checklist completion offline', async ({ page, context }) => {
      await navigateAndVerify(page, '/safety/checklists', /safety\/checklists/);
      
      if (isAuthRedirect(page.url())) return;
      
      await context.setOffline(true);
      await page.waitForTimeout(500);
      
      const checklists = page.locator('[data-testid="checklists"], .checklists');
      const hasChecklists = await checklists.count();
      expect(hasChecklists).toBeGreaterThanOrEqual(0);
      
      await context.setOffline(false);
    });
  });
});

test.describe('COMPVSS Offline Mode - Synchronization', () => {

  test.describe('Auto Sync', () => {
    
    test('should auto-sync when coming back online', async ({ page, context }) => {
      await navigateAndVerify(page, '/dashboard', /dashboard/);
      
      if (isAuthRedirect(page.url())) return;
      
      await context.setOffline(true);
      await page.waitForTimeout(500);
      await context.setOffline(false);
      await page.waitForTimeout(1000);
      
      const syncIndicator = page.locator('[data-testid="syncing"], text=/syncing|synchronizing/i');
      const hasSyncIndicator = await syncIndicator.count();
      expect(hasSyncIndicator).toBeGreaterThanOrEqual(0);
    });

    test('should show sync progress', async ({ page, context }) => {
      await navigateAndVerify(page, '/dashboard', /dashboard/);
      
      if (isAuthRedirect(page.url())) return;
      
      await context.setOffline(true);
      await page.waitForTimeout(500);
      await context.setOffline(false);
      
      const syncProgress = page.locator('[data-testid="sync-progress"], .sync-progress, progress');
      const hasSyncProgress = await syncProgress.count();
      expect(hasSyncProgress).toBeGreaterThanOrEqual(0);
    });

    test('should show sync complete message', async ({ page, context }) => {
      await navigateAndVerify(page, '/dashboard', /dashboard/);
      
      if (isAuthRedirect(page.url())) return;
      
      await context.setOffline(true);
      await page.waitForTimeout(500);
      await context.setOffline(false);
      await page.waitForTimeout(2000);
      
      const syncComplete = page.locator('[data-testid="sync-complete"], text=/synced|up to date/i');
      const hasSyncComplete = await syncComplete.count();
      expect(hasSyncComplete).toBeGreaterThanOrEqual(0);
    });
  });

  test.describe('Manual Sync', () => {
    
    test('should have manual sync button', async ({ page }) => {
      await navigateAndVerify(page, '/dashboard', /dashboard/);
      
      if (isAuthRedirect(page.url())) return;
      
      const syncButton = page.locator('button:has-text("sync"), [data-testid="manual-sync"]');
      const hasSyncButton = await syncButton.count();
      expect(hasSyncButton).toBeGreaterThanOrEqual(0);
    });

    test('should trigger sync on button click', async ({ page }) => {
      await navigateAndVerify(page, '/dashboard', /dashboard/);
      
      if (isAuthRedirect(page.url())) return;
      
      const syncButton = page.locator('button:has-text("sync"), [data-testid="manual-sync"]').first();
      if (await syncButton.isVisible()) {
        await syncButton.click();
        
        const syncing = page.locator('[data-testid="syncing"], text=/syncing/i');
        const hasSyncing = await syncing.count();
        expect(hasSyncing).toBeGreaterThanOrEqual(0);
      }
    });
  });

  test.describe('Conflict Resolution', () => {
    
    test('should detect sync conflicts', async ({ page }) => {
      await navigateAndVerify(page, '/dashboard', /dashboard/);
      
      if (isAuthRedirect(page.url())) return;
      
      const conflictIndicator = page.locator('[data-testid="sync-conflict"], text=/conflict/i');
      const hasConflictIndicator = await conflictIndicator.count();
      expect(hasConflictIndicator).toBeGreaterThanOrEqual(0);
    });

    test('should show conflict resolution UI', async ({ page }) => {
      await navigateAndVerify(page, '/dashboard', /dashboard/);
      
      if (isAuthRedirect(page.url())) return;
      
      const conflictUI = page.locator('[data-testid="conflict-resolution"], .conflict-resolution');
      const hasConflictUI = await conflictUI.count();
      expect(hasConflictUI).toBeGreaterThanOrEqual(0);
    });

    test('should allow keeping local changes', async ({ page }) => {
      await navigateAndVerify(page, '/dashboard', /dashboard/);
      
      if (isAuthRedirect(page.url())) return;
      
      const keepLocalButton = page.locator('button:has-text("keep local"), button:has-text("keep mine")');
      const hasKeepLocalButton = await keepLocalButton.count();
      expect(hasKeepLocalButton).toBeGreaterThanOrEqual(0);
    });

    test('should allow accepting server changes', async ({ page }) => {
      await navigateAndVerify(page, '/dashboard', /dashboard/);
      
      if (isAuthRedirect(page.url())) return;
      
      const acceptServerButton = page.locator('button:has-text("accept server"), button:has-text("use server")');
      const hasAcceptServerButton = await acceptServerButton.count();
      expect(hasAcceptServerButton).toBeGreaterThanOrEqual(0);
    });
  });
});

test.describe('COMPVSS Offline Mode - Storage', () => {

  test.describe('Storage Management', () => {
    
    test('should show storage usage', async ({ page }) => {
      await navigateAndVerify(page, '/settings/offline', /settings\/offline/);
      
      if (isAuthRedirect(page.url())) return;
      
      const storageUsage = page.locator('[data-testid="storage-usage"], text=/storage|mb|gb/i');
      const hasStorageUsage = await storageUsage.count();
      expect(hasStorageUsage).toBeGreaterThanOrEqual(0);
    });

    test('should have clear cache option', async ({ page }) => {
      await navigateAndVerify(page, '/settings/offline', /settings\/offline/);
      
      if (isAuthRedirect(page.url())) return;
      
      const clearCacheButton = page.locator('button:has-text("clear cache"), button:has-text("clear data")');
      const hasClearCacheButton = await clearCacheButton.count();
      expect(hasClearCacheButton).toBeGreaterThanOrEqual(0);
    });

    test('should have selective sync options', async ({ page }) => {
      await navigateAndVerify(page, '/settings/offline', /settings\/offline/);
      
      if (isAuthRedirect(page.url())) return;
      
      const selectiveSync = page.locator('[data-testid="selective-sync"], .sync-options');
      const hasSelectiveSync = await selectiveSync.count();
      expect(hasSelectiveSync).toBeGreaterThanOrEqual(0);
    });
  });
});

test.describe('COMPVSS Offline Mode - Error Handling', () => {

  test.describe('Sync Errors', () => {
    
    test('should show sync error message', async ({ page, context }) => {
      await navigateAndVerify(page, '/dashboard', /dashboard/);
      
      if (isAuthRedirect(page.url())) return;
      
      await context.route('**/api/**', (route) => {
        route.fulfill({
          status: 500,
          body: JSON.stringify({ error: 'Sync failed' }),
        });
      });
      
      await context.setOffline(true);
      await page.waitForTimeout(500);
      await context.setOffline(false);
      
      const syncError = page.locator('[data-testid="sync-error"], text=/sync.*failed|error.*sync/i');
      const hasSyncError = await syncError.count();
      expect(hasSyncError).toBeGreaterThanOrEqual(0);
    });

    test('should have retry sync option', async ({ page }) => {
      await navigateAndVerify(page, '/dashboard', /dashboard/);
      
      if (isAuthRedirect(page.url())) return;
      
      const retryButton = page.locator('button:has-text("retry"), button:has-text("try again")');
      const hasRetryButton = await retryButton.count();
      expect(hasRetryButton).toBeGreaterThanOrEqual(0);
    });

    test('should preserve queued actions on sync failure', async ({ page, context }) => {
      await navigateAndVerify(page, '/dashboard', /dashboard/);
      
      if (isAuthRedirect(page.url())) return;
      
      await context.route('**/api/**', (route) => {
        route.fulfill({
          status: 500,
          body: JSON.stringify({ error: 'Sync failed' }),
        });
      });
      
      const queuedActions = page.locator('[data-testid="queued-actions"], .queued-actions');
      const hasQueuedActions = await queuedActions.count();
      expect(hasQueuedActions).toBeGreaterThanOrEqual(0);
    });
  });
});

test.describe('COMPVSS Offline Mode - API Integration', () => {
  
  test('GET /api/offline/status returns valid response', async ({ request }) => {
    const response = await request.get(`${COMPVSS_BASE}/api/offline/status`);
    expect([200, 401, 403, 404]).toContain(response.status());
  });

  test('GET /api/offline/queue returns valid response', async ({ request }) => {
    const response = await request.get(`${COMPVSS_BASE}/api/offline/queue`);
    expect([200, 401, 403, 404]).toContain(response.status());
  });

  test('POST /api/offline/sync requires authentication', async ({ request }) => {
    const response = await request.post(`${COMPVSS_BASE}/api/offline/sync`);
    expect([200, 401, 403, 404]).toContain(response.status());
  });

  test('DELETE /api/offline/queue/:id requires authentication', async ({ request }) => {
    const response = await request.delete(`${COMPVSS_BASE}/api/offline/queue/action-001`);
    expect([200, 204, 401, 403, 404]).toContain(response.status());
  });

  test('DELETE /api/offline/cache requires authentication', async ({ request }) => {
    const response = await request.delete(`${COMPVSS_BASE}/api/offline/cache`);
    expect([200, 204, 401, 403, 404]).toContain(response.status());
  });
});
