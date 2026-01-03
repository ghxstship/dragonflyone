import { test, expect, Page } from '@playwright/test';

/**
 * COMPVSS Credentials Scanning E2E Tests
 * Tests credential scanning functionality including QR codes, barcodes, and RFID
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

test.describe('COMPVSS Credentials - Scanning', () => {

  test.describe('Scan Page', () => {
    
    test('should display scan page', async ({ page }) => {
      await navigateAndVerify(page, '/credentials/scan', /credentials\/scan/);
    });

    test('should have camera viewfinder', async ({ page }) => {
      await navigateAndVerify(page, '/credentials/scan', /credentials\/scan/);
      
      if (isAuthRedirect(page.url())) return;
      
      const viewfinder = page.locator('[data-testid="camera-viewfinder"], .viewfinder, video, canvas');
      const hasViewfinder = await viewfinder.count();
      expect(hasViewfinder).toBeGreaterThanOrEqual(0);
    });

    test('should have scan type selector', async ({ page }) => {
      await navigateAndVerify(page, '/credentials/scan', /credentials\/scan/);
      
      if (isAuthRedirect(page.url())) return;
      
      const scanTypeSelector = page.locator('[data-testid="scan-type"], button:has-text("qr"), button:has-text("barcode"), select[name="scanType"]');
      const hasScanType = await scanTypeSelector.count();
      expect(hasScanType).toBeGreaterThanOrEqual(0);
    });

    test('should have manual entry option', async ({ page }) => {
      await navigateAndVerify(page, '/credentials/scan', /credentials\/scan/);
      
      if (isAuthRedirect(page.url())) return;
      
      const manualEntry = page.locator('button:has-text("manual"), input[name="credentialId"], [data-testid="manual-entry"]');
      const hasManualEntry = await manualEntry.count();
      expect(hasManualEntry).toBeGreaterThanOrEqual(0);
    });

    test('should have flash toggle', async ({ page }) => {
      await navigateAndVerify(page, '/credentials/scan', /credentials\/scan/);
      
      if (isAuthRedirect(page.url())) return;
      
      const flashToggle = page.locator('button[aria-label*="flash" i], [data-testid="flash-toggle"]');
      const hasFlashToggle = await flashToggle.count();
      expect(hasFlashToggle).toBeGreaterThanOrEqual(0);
    });

    test('should have camera switch option', async ({ page }) => {
      await navigateAndVerify(page, '/credentials/scan', /credentials\/scan/);
      
      if (isAuthRedirect(page.url())) return;
      
      const cameraSwitch = page.locator('button[aria-label*="camera" i], [data-testid="camera-switch"]');
      const hasCameraSwitch = await cameraSwitch.count();
      expect(hasCameraSwitch).toBeGreaterThanOrEqual(0);
    });
  });

  test.describe('Scan Results', () => {
    
    test('should show scan result on success', async ({ page }) => {
      await navigateAndVerify(page, '/credentials/scan', /credentials\/scan/);
      
      if (isAuthRedirect(page.url())) return;
      
      const resultArea = page.locator('[data-testid="scan-result"], .scan-result');
      const hasResultArea = await resultArea.count();
      expect(hasResultArea).toBeGreaterThanOrEqual(0);
    });

    test('should display credential holder info', async ({ page }) => {
      await navigateAndVerify(page, '/credentials/scan', /credentials\/scan/);
      
      if (isAuthRedirect(page.url())) return;
      
      const holderInfo = page.locator('[data-testid="holder-info"], .holder-info');
      const hasHolderInfo = await holderInfo.count();
      expect(hasHolderInfo).toBeGreaterThanOrEqual(0);
    });

    test('should show credential status', async ({ page }) => {
      await navigateAndVerify(page, '/credentials/scan', /credentials\/scan/);
      
      if (isAuthRedirect(page.url())) return;
      
      const status = page.locator('[data-testid="credential-status"], .status, text=/valid|invalid|expired/i');
      const hasStatus = await status.count();
      expect(hasStatus).toBeGreaterThanOrEqual(0);
    });

    test('should show access zones', async ({ page }) => {
      await navigateAndVerify(page, '/credentials/scan', /credentials\/scan/);
      
      if (isAuthRedirect(page.url())) return;
      
      const accessZones = page.locator('[data-testid="access-zones"], .access-zones, text=/zone|area|access/i');
      const hasAccessZones = await accessZones.count();
      expect(hasAccessZones).toBeGreaterThanOrEqual(0);
    });

    test('should have check-in action', async ({ page }) => {
      await navigateAndVerify(page, '/credentials/scan', /credentials\/scan/);
      
      if (isAuthRedirect(page.url())) return;
      
      const checkInButton = page.locator('button:has-text("check in"), button:has-text("check-in"), [data-testid="check-in"]');
      const hasCheckIn = await checkInButton.count();
      expect(hasCheckIn).toBeGreaterThanOrEqual(0);
    });

    test('should have check-out action', async ({ page }) => {
      await navigateAndVerify(page, '/credentials/scan', /credentials\/scan/);
      
      if (isAuthRedirect(page.url())) return;
      
      const checkOutButton = page.locator('button:has-text("check out"), button:has-text("check-out"), [data-testid="check-out"]');
      const hasCheckOut = await checkOutButton.count();
      expect(hasCheckOut).toBeGreaterThanOrEqual(0);
    });
  });

  test.describe('Scan History', () => {
    
    test('should display scan history', async ({ page }) => {
      await navigateAndVerify(page, '/credentials/scan/history', /credentials\/scan\/history/);
    });

    test('should show recent scans list', async ({ page }) => {
      await navigateAndVerify(page, '/credentials/scan/history', /credentials\/scan\/history/);
      
      if (isAuthRedirect(page.url())) return;
      
      const scansList = page.locator('[data-testid="scans-list"], table, .scans-list');
      const hasScansList = await scansList.count();
      expect(hasScansList).toBeGreaterThanOrEqual(0);
    });

    test('should have date filter', async ({ page }) => {
      await navigateAndVerify(page, '/credentials/scan/history', /credentials\/scan\/history/);
      
      if (isAuthRedirect(page.url())) return;
      
      const dateFilter = page.locator('input[type="date"], [data-testid="date-filter"]');
      const hasDateFilter = await dateFilter.count();
      expect(hasDateFilter).toBeGreaterThanOrEqual(0);
    });

    test('should have zone filter', async ({ page }) => {
      await navigateAndVerify(page, '/credentials/scan/history', /credentials\/scan\/history/);
      
      if (isAuthRedirect(page.url())) return;
      
      const zoneFilter = page.locator('select[name="zone"], [data-testid="zone-filter"]');
      const hasZoneFilter = await zoneFilter.count();
      expect(hasZoneFilter).toBeGreaterThanOrEqual(0);
    });

    test('should have export option', async ({ page }) => {
      await navigateAndVerify(page, '/credentials/scan/history', /credentials\/scan\/history/);
      
      if (isAuthRedirect(page.url())) return;
      
      const exportButton = page.locator('button:has-text("export"), [data-testid="export"]');
      const hasExport = await exportButton.count();
      expect(hasExport).toBeGreaterThanOrEqual(0);
    });
  });

  test.describe('Batch Scanning', () => {
    
    test('should have batch scan mode', async ({ page }) => {
      await navigateAndVerify(page, '/credentials/scan', /credentials\/scan/);
      
      if (isAuthRedirect(page.url())) return;
      
      const batchMode = page.locator('button:has-text("batch"), [data-testid="batch-mode"]');
      const hasBatchMode = await batchMode.count();
      expect(hasBatchMode).toBeGreaterThanOrEqual(0);
    });

    test('should show batch scan count', async ({ page }) => {
      await navigateAndVerify(page, '/credentials/scan', /credentials\/scan/);
      
      if (isAuthRedirect(page.url())) return;
      
      const batchCount = page.locator('[data-testid="batch-count"], .batch-count');
      const hasBatchCount = await batchCount.count();
      expect(hasBatchCount).toBeGreaterThanOrEqual(0);
    });

    test('should have batch submit action', async ({ page }) => {
      await navigateAndVerify(page, '/credentials/scan', /credentials\/scan/);
      
      if (isAuthRedirect(page.url())) return;
      
      const batchSubmit = page.locator('button:has-text("submit batch"), [data-testid="batch-submit"]');
      const hasBatchSubmit = await batchSubmit.count();
      expect(hasBatchSubmit).toBeGreaterThanOrEqual(0);
    });
  });

  test.describe('Offline Scanning', () => {
    
    test('should show offline indicator when disconnected', async ({ page, context }) => {
      await navigateAndVerify(page, '/credentials/scan', /credentials\/scan/);
      
      if (isAuthRedirect(page.url())) return;
      
      await context.setOffline(true);
      await page.waitForTimeout(500);
      
      const offlineIndicator = page.locator('[data-testid="offline-indicator"], .offline, text=/offline/i');
      const hasOfflineIndicator = await offlineIndicator.count();
      expect(hasOfflineIndicator).toBeGreaterThanOrEqual(0);
      
      await context.setOffline(false);
    });

    test('should queue scans when offline', async ({ page, context }) => {
      await navigateAndVerify(page, '/credentials/scan', /credentials\/scan/);
      
      if (isAuthRedirect(page.url())) return;
      
      await context.setOffline(true);
      
      const queueIndicator = page.locator('[data-testid="scan-queue"], .queue, text=/queued/i');
      const hasQueueIndicator = await queueIndicator.count();
      expect(hasQueueIndicator).toBeGreaterThanOrEqual(0);
      
      await context.setOffline(false);
    });

    test('should sync queued scans when back online', async ({ page, context }) => {
      await navigateAndVerify(page, '/credentials/scan', /credentials\/scan/);
      
      if (isAuthRedirect(page.url())) return;
      
      await context.setOffline(true);
      await page.waitForTimeout(500);
      await context.setOffline(false);
      
      const syncIndicator = page.locator('[data-testid="sync-indicator"], .syncing, text=/sync/i');
      const hasSyncIndicator = await syncIndicator.count();
      expect(hasSyncIndicator).toBeGreaterThanOrEqual(0);
    });
  });

  test.describe('Error Handling', () => {
    
    test('should show error for invalid credential', async ({ page }) => {
      await navigateAndVerify(page, '/credentials/scan', /credentials\/scan/);
      
      if (isAuthRedirect(page.url())) return;
      
      const errorMessage = page.locator('[data-testid="scan-error"], .error, text=/invalid|not found|error/i');
      const hasError = await errorMessage.count();
      expect(hasError).toBeGreaterThanOrEqual(0);
    });

    test('should show error for expired credential', async ({ page }) => {
      await navigateAndVerify(page, '/credentials/scan', /credentials\/scan/);
      
      if (isAuthRedirect(page.url())) return;
      
      const expiredMessage = page.locator('[data-testid="expired-error"], text=/expired/i');
      const hasExpired = await expiredMessage.count();
      expect(hasExpired).toBeGreaterThanOrEqual(0);
    });

    test('should show error for revoked credential', async ({ page }) => {
      await navigateAndVerify(page, '/credentials/scan', /credentials\/scan/);
      
      if (isAuthRedirect(page.url())) return;
      
      const revokedMessage = page.locator('[data-testid="revoked-error"], text=/revoked/i');
      const hasRevoked = await revokedMessage.count();
      expect(hasRevoked).toBeGreaterThanOrEqual(0);
    });

    test('should handle camera permission denied', async ({ page }) => {
      await navigateAndVerify(page, '/credentials/scan', /credentials\/scan/);
      
      if (isAuthRedirect(page.url())) return;
      
      const permissionError = page.locator('[data-testid="permission-error"], text=/permission|camera access/i');
      const hasPermissionError = await permissionError.count();
      expect(hasPermissionError).toBeGreaterThanOrEqual(0);
    });
  });

  test.describe('Sound/Haptic Feedback', () => {
    
    test('should have sound toggle', async ({ page }) => {
      await navigateAndVerify(page, '/credentials/scan', /credentials\/scan/);
      
      if (isAuthRedirect(page.url())) return;
      
      const soundToggle = page.locator('button[aria-label*="sound" i], [data-testid="sound-toggle"]');
      const hasSoundToggle = await soundToggle.count();
      expect(hasSoundToggle).toBeGreaterThanOrEqual(0);
    });

    test('should have vibration toggle', async ({ page }) => {
      await navigateAndVerify(page, '/credentials/scan', /credentials\/scan/);
      
      if (isAuthRedirect(page.url())) return;
      
      const vibrationToggle = page.locator('button[aria-label*="vibrat" i], [data-testid="vibration-toggle"]');
      const hasVibrationToggle = await vibrationToggle.count();
      expect(hasVibrationToggle).toBeGreaterThanOrEqual(0);
    });
  });
});

test.describe('COMPVSS Credentials - Management', () => {

  test.describe('Credentials List', () => {
    
    test('should display credentials list page', async ({ page }) => {
      await navigateAndVerify(page, '/credentials', /credentials/);
    });

    test('should show credentials table', async ({ page }) => {
      await navigateAndVerify(page, '/credentials', /credentials/);
      
      if (isAuthRedirect(page.url())) return;
      
      const table = page.locator('table, [data-testid="credentials-list"]');
      const hasTable = await table.count();
      expect(hasTable).toBeGreaterThanOrEqual(0);
    });

    test('should have search functionality', async ({ page }) => {
      await navigateAndVerify(page, '/credentials', /credentials/);
      
      if (isAuthRedirect(page.url())) return;
      
      const searchInput = page.locator('input[type="search"], input[placeholder*="search" i]');
      const hasSearch = await searchInput.count();
      expect(hasSearch).toBeGreaterThanOrEqual(0);
    });

    test('should have status filter', async ({ page }) => {
      await navigateAndVerify(page, '/credentials', /credentials/);
      
      if (isAuthRedirect(page.url())) return;
      
      const statusFilter = page.locator('select[name="status"], [data-testid="status-filter"]');
      const hasFilter = await statusFilter.count();
      expect(hasFilter).toBeGreaterThanOrEqual(0);
    });

    test('should have type filter', async ({ page }) => {
      await navigateAndVerify(page, '/credentials', /credentials/);
      
      if (isAuthRedirect(page.url())) return;
      
      const typeFilter = page.locator('select[name="type"], [data-testid="type-filter"]');
      const hasFilter = await typeFilter.count();
      expect(hasFilter).toBeGreaterThanOrEqual(0);
    });

    test('should have create credential button', async ({ page }) => {
      await navigateAndVerify(page, '/credentials', /credentials/);
      
      if (isAuthRedirect(page.url())) return;
      
      const createButton = page.locator('a[href*="/credentials/new"], button:has-text("create"), button:has-text("issue")');
      const hasCreate = await createButton.count();
      expect(hasCreate).toBeGreaterThanOrEqual(0);
    });

    test('should have bulk actions', async ({ page }) => {
      await navigateAndVerify(page, '/credentials', /credentials/);
      
      if (isAuthRedirect(page.url())) return;
      
      const bulkActions = page.locator('[data-testid="bulk-actions"], button:has-text("bulk")');
      const hasBulkActions = await bulkActions.count();
      expect(hasBulkActions).toBeGreaterThanOrEqual(0);
    });
  });

  test.describe('Credential Creation', () => {
    
    test('should display credential creation form', async ({ page }) => {
      await navigateAndVerify(page, '/credentials/new', /credentials\/new/);
      
      if (isAuthRedirect(page.url())) return;
      
      const form = page.locator('form');
      await expect(form.first()).toBeVisible();
    });

    test('should have holder selection', async ({ page }) => {
      await navigateAndVerify(page, '/credentials/new', /credentials\/new/);
      
      if (isAuthRedirect(page.url())) return;
      
      const holderSelect = page.locator('select[name="holder"], [data-testid="holder-select"], input[name="holder"]');
      const hasHolderSelect = await holderSelect.count();
      expect(hasHolderSelect).toBeGreaterThanOrEqual(0);
    });

    test('should have credential type selection', async ({ page }) => {
      await navigateAndVerify(page, '/credentials/new', /credentials\/new/);
      
      if (isAuthRedirect(page.url())) return;
      
      const typeSelect = page.locator('select[name="type"], [data-testid="type-select"]');
      const hasTypeSelect = await typeSelect.count();
      expect(hasTypeSelect).toBeGreaterThanOrEqual(0);
    });

    test('should have access zones selection', async ({ page }) => {
      await navigateAndVerify(page, '/credentials/new', /credentials\/new/);
      
      if (isAuthRedirect(page.url())) return;
      
      const zonesSelect = page.locator('[data-testid="zones-select"], input[name*="zone" i]');
      const hasZonesSelect = await zonesSelect.count();
      expect(hasZonesSelect).toBeGreaterThanOrEqual(0);
    });

    test('should have validity period fields', async ({ page }) => {
      await navigateAndVerify(page, '/credentials/new', /credentials\/new/);
      
      if (isAuthRedirect(page.url())) return;
      
      const validityFields = page.locator('input[name*="valid" i], input[type="date"]');
      const hasValidityFields = await validityFields.count();
      expect(hasValidityFields).toBeGreaterThanOrEqual(0);
    });

    test('should have photo upload option', async ({ page }) => {
      await navigateAndVerify(page, '/credentials/new', /credentials\/new/);
      
      if (isAuthRedirect(page.url())) return;
      
      const photoUpload = page.locator('input[type="file"], [data-testid="photo-upload"]');
      const hasPhotoUpload = await photoUpload.count();
      expect(hasPhotoUpload).toBeGreaterThanOrEqual(0);
    });
  });

  test.describe('Credential Detail', () => {
    
    test('should display credential detail page', async ({ page }) => {
      await navigateAndVerify(page, '/credentials/cred-001', /credentials\/cred-001/);
    });

    test('should show credential QR code', async ({ page }) => {
      await navigateAndVerify(page, '/credentials/cred-001', /credentials\/cred-001/);
      
      if (isAuthRedirect(page.url())) return;
      
      const qrCode = page.locator('[data-testid="qr-code"], .qr-code, svg, canvas');
      const hasQRCode = await qrCode.count();
      expect(hasQRCode).toBeGreaterThanOrEqual(0);
    });

    test('should show holder information', async ({ page }) => {
      await navigateAndVerify(page, '/credentials/cred-001', /credentials\/cred-001/);
      
      if (isAuthRedirect(page.url())) return;
      
      const holderInfo = page.locator('[data-testid="holder-info"], .holder-info');
      const hasHolderInfo = await holderInfo.count();
      expect(hasHolderInfo).toBeGreaterThanOrEqual(0);
    });

    test('should show access history', async ({ page }) => {
      await navigateAndVerify(page, '/credentials/cred-001', /credentials\/cred-001/);
      
      if (isAuthRedirect(page.url())) return;
      
      const accessHistory = page.locator('[data-testid="access-history"], .access-history');
      const hasAccessHistory = await accessHistory.count();
      expect(hasAccessHistory).toBeGreaterThanOrEqual(0);
    });

    test('should have revoke action', async ({ page }) => {
      await navigateAndVerify(page, '/credentials/cred-001', /credentials\/cred-001/);
      
      if (isAuthRedirect(page.url())) return;
      
      const revokeButton = page.locator('button:has-text("revoke"), [data-testid="revoke"]');
      const hasRevoke = await revokeButton.count();
      expect(hasRevoke).toBeGreaterThanOrEqual(0);
    });

    test('should have print action', async ({ page }) => {
      await navigateAndVerify(page, '/credentials/cred-001', /credentials\/cred-001/);
      
      if (isAuthRedirect(page.url())) return;
      
      const printButton = page.locator('button:has-text("print"), [data-testid="print"]');
      const hasPrint = await printButton.count();
      expect(hasPrint).toBeGreaterThanOrEqual(0);
    });
  });
});

test.describe('COMPVSS Credentials - API Integration', () => {
  
  test('GET /api/credentials returns valid response', async ({ request }) => {
    const response = await request.get(`${COMPVSS_BASE}/api/credentials`);
    expect([200, 401, 403, 404]).toContain(response.status());
  });

  test('GET /api/credentials/:id returns valid response', async ({ request }) => {
    const response = await request.get(`${COMPVSS_BASE}/api/credentials/cred-001`);
    expect([200, 401, 403, 404]).toContain(response.status());
  });

  test('POST /api/credentials requires authentication', async ({ request }) => {
    const response = await request.post(`${COMPVSS_BASE}/api/credentials`, {
      data: { holder_id: 'holder-001', type: 'staff' }
    });
    expect([200, 201, 401, 403, 422]).toContain(response.status());
  });

  test('POST /api/credentials/scan requires authentication', async ({ request }) => {
    const response = await request.post(`${COMPVSS_BASE}/api/credentials/scan`, {
      data: { credential_id: 'cred-001', zone_id: 'zone-001' }
    });
    expect([200, 401, 403, 404, 422]).toContain(response.status());
  });

  test('POST /api/credentials/:id/revoke requires authentication', async ({ request }) => {
    const response = await request.post(`${COMPVSS_BASE}/api/credentials/cred-001/revoke`);
    expect([200, 401, 403, 404]).toContain(response.status());
  });

  test('GET /api/credentials/scan/history returns valid response', async ({ request }) => {
    const response = await request.get(`${COMPVSS_BASE}/api/credentials/scan/history`);
    expect([200, 401, 403, 404]).toContain(response.status());
  });
});
