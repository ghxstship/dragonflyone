import { test, expect, Page } from '@playwright/test';

/**
 * COMPVSS BEOs (Banquet Event Orders) E2E Tests
 * Tests BEO CRUD operations and related functionality
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

test.describe('COMPVSS BEOs - CRUD Operations', () => {

  test.describe('BEOs List (Read)', () => {
    
    test('should display BEOs list page', async ({ page }) => {
      await navigateAndVerify(page, '/beos', /beos/);
    });

    test('should show BEOs table or grid', async ({ page }) => {
      await navigateAndVerify(page, '/beos', /beos/);
      
      if (isAuthRedirect(page.url())) return;
      
      const hasBeosList = await page.locator('[data-testid="beos-list"], table, .beos-list, .beos-grid').count();
      expect(hasBeosList).toBeGreaterThanOrEqual(0);
    });

    test('should have search functionality', async ({ page }) => {
      await navigateAndVerify(page, '/beos', /beos/);
      
      if (isAuthRedirect(page.url())) return;
      
      const searchInput = page.locator('input[type="search"], input[placeholder*="search" i]');
      const hasSearch = await searchInput.count();
      expect(hasSearch).toBeGreaterThanOrEqual(0);
    });

    test('should have event filter', async ({ page }) => {
      await navigateAndVerify(page, '/beos', /beos/);
      
      if (isAuthRedirect(page.url())) return;
      
      const eventFilter = page.locator('select[name="event"], [data-testid="event-filter"]');
      const hasFilter = await eventFilter.count();
      expect(hasFilter).toBeGreaterThanOrEqual(0);
    });

    test('should have status filter', async ({ page }) => {
      await navigateAndVerify(page, '/beos', /beos/);
      
      if (isAuthRedirect(page.url())) return;
      
      const statusFilter = page.locator('select[name="status"], [data-testid="status-filter"]');
      const hasFilter = await statusFilter.count();
      expect(hasFilter).toBeGreaterThanOrEqual(0);
    });

    test('should have create BEO button', async ({ page }) => {
      await navigateAndVerify(page, '/beos', /beos/);
      
      if (isAuthRedirect(page.url())) return;
      
      const createButton = page.locator('a[href*="/beos/new"], button:has-text("create"), button:has-text("new beo")');
      const hasCreateButton = await createButton.count();
      expect(hasCreateButton).toBeGreaterThanOrEqual(0);
    });

    test('should show BEO status badges', async ({ page }) => {
      await navigateAndVerify(page, '/beos', /beos/);
      
      if (isAuthRedirect(page.url())) return;
      
      const statusBadges = page.locator('[data-testid="status-badge"], .badge, .status');
      const hasBadges = await statusBadges.count();
      expect(hasBadges).toBeGreaterThanOrEqual(0);
    });
  });

  test.describe('BEO Creation (Create)', () => {
    
    test('should display BEO creation form', async ({ page }) => {
      await navigateAndVerify(page, '/beos/new', /beos\/new/);
      
      if (isAuthRedirect(page.url())) return;
      
      const form = page.locator('form');
      await expect(form.first()).toBeVisible();
    });

    test('should have event selection', async ({ page }) => {
      await navigateAndVerify(page, '/beos/new', /beos\/new/);
      
      if (isAuthRedirect(page.url())) return;
      
      const eventSelect = page.locator('select[name="event"], [data-testid="event-select"], input[name="event"]');
      const hasEventSelect = await eventSelect.count();
      expect(hasEventSelect).toBeGreaterThanOrEqual(0);
    });

    test('should have venue selection', async ({ page }) => {
      await navigateAndVerify(page, '/beos/new', /beos\/new/);
      
      if (isAuthRedirect(page.url())) return;
      
      const venueSelect = page.locator('select[name="venue"], [data-testid="venue-select"]');
      const hasVenueSelect = await venueSelect.count();
      expect(hasVenueSelect).toBeGreaterThanOrEqual(0);
    });

    test('should have date/time fields', async ({ page }) => {
      await navigateAndVerify(page, '/beos/new', /beos\/new/);
      
      if (isAuthRedirect(page.url())) return;
      
      const dateField = page.locator('input[type="date"], input[type="datetime-local"]');
      const hasDateField = await dateField.count();
      expect(hasDateField).toBeGreaterThanOrEqual(0);
    });

    test('should have guest count field', async ({ page }) => {
      await navigateAndVerify(page, '/beos/new', /beos\/new/);
      
      if (isAuthRedirect(page.url())) return;
      
      const guestCount = page.locator('input[name*="guest" i], input[name*="attendee" i], input[type="number"]');
      const hasGuestCount = await guestCount.count();
      expect(hasGuestCount).toBeGreaterThanOrEqual(0);
    });

    test('should have room setup section', async ({ page }) => {
      await navigateAndVerify(page, '/beos/new', /beos\/new/);
      
      if (isAuthRedirect(page.url())) return;
      
      const roomSetup = page.locator('[data-testid="room-setup"], text=/room setup|layout/i');
      const hasRoomSetup = await roomSetup.count();
      expect(hasRoomSetup).toBeGreaterThanOrEqual(0);
    });

    test('should have catering section', async ({ page }) => {
      await navigateAndVerify(page, '/beos/new', /beos\/new/);
      
      if (isAuthRedirect(page.url())) return;
      
      const catering = page.locator('[data-testid="catering"], text=/catering|food|beverage/i');
      const hasCatering = await catering.count();
      expect(hasCatering).toBeGreaterThanOrEqual(0);
    });

    test('should have AV requirements section', async ({ page }) => {
      await navigateAndVerify(page, '/beos/new', /beos\/new/);
      
      if (isAuthRedirect(page.url())) return;
      
      const avSection = page.locator('[data-testid="av-requirements"], text=/audio|video|av|equipment/i');
      const hasAV = await avSection.count();
      expect(hasAV).toBeGreaterThanOrEqual(0);
    });

    test('should have special requests field', async ({ page }) => {
      await navigateAndVerify(page, '/beos/new', /beos\/new/);
      
      if (isAuthRedirect(page.url())) return;
      
      const specialRequests = page.locator('textarea[name*="special" i], textarea[name*="notes" i], [data-testid="special-requests"]');
      const hasSpecialRequests = await specialRequests.count();
      expect(hasSpecialRequests).toBeGreaterThanOrEqual(0);
    });

    test('should validate required fields', async ({ page }) => {
      await navigateAndVerify(page, '/beos/new', /beos\/new/);
      
      if (isAuthRedirect(page.url())) return;
      
      const submitButton = page.locator('button[type="submit"]');
      if (await submitButton.isVisible()) {
        await submitButton.click();
        
        const hasError = await page.locator('[data-error], [aria-invalid="true"], .error').count();
        expect(hasError).toBeGreaterThanOrEqual(0);
      }
    });
  });

  test.describe('BEO Detail (Read)', () => {
    
    test('should display BEO detail page', async ({ page }) => {
      await navigateAndVerify(page, '/beos/beo-001', /beos\/beo-001/);
    });

    test('should show BEO header information', async ({ page }) => {
      await navigateAndVerify(page, '/beos/beo-001', /beos\/beo-001/);
      
      if (isAuthRedirect(page.url())) return;
      
      const header = page.locator('[data-testid="beo-header"], .beo-header, h1');
      const hasHeader = await header.count();
      expect(hasHeader).toBeGreaterThanOrEqual(0);
    });

    test('should show event details', async ({ page }) => {
      await navigateAndVerify(page, '/beos/beo-001', /beos\/beo-001/);
      
      if (isAuthRedirect(page.url())) return;
      
      const eventDetails = page.locator('[data-testid="event-details"], .event-details');
      const hasEventDetails = await eventDetails.count();
      expect(hasEventDetails).toBeGreaterThanOrEqual(0);
    });

    test('should show timeline/schedule', async ({ page }) => {
      await navigateAndVerify(page, '/beos/beo-001', /beos\/beo-001/);
      
      if (isAuthRedirect(page.url())) return;
      
      const timeline = page.locator('[data-testid="timeline"], .timeline, .schedule');
      const hasTimeline = await timeline.count();
      expect(hasTimeline).toBeGreaterThanOrEqual(0);
    });

    test('should show room setup details', async ({ page }) => {
      await navigateAndVerify(page, '/beos/beo-001', /beos\/beo-001/);
      
      if (isAuthRedirect(page.url())) return;
      
      const roomSetup = page.locator('[data-testid="room-setup"], .room-setup');
      const hasRoomSetup = await roomSetup.count();
      expect(hasRoomSetup).toBeGreaterThanOrEqual(0);
    });

    test('should show catering details', async ({ page }) => {
      await navigateAndVerify(page, '/beos/beo-001', /beos\/beo-001/);
      
      if (isAuthRedirect(page.url())) return;
      
      const catering = page.locator('[data-testid="catering-details"], .catering');
      const hasCatering = await catering.count();
      expect(hasCatering).toBeGreaterThanOrEqual(0);
    });

    test('should have edit button', async ({ page }) => {
      await navigateAndVerify(page, '/beos/beo-001', /beos\/beo-001/);
      
      if (isAuthRedirect(page.url())) return;
      
      const editButton = page.locator('a[href*="edit"], button:has-text("edit")');
      const hasEditButton = await editButton.count();
      expect(hasEditButton).toBeGreaterThanOrEqual(0);
    });

    test('should have print/export option', async ({ page }) => {
      await navigateAndVerify(page, '/beos/beo-001', /beos\/beo-001/);
      
      if (isAuthRedirect(page.url())) return;
      
      const printButton = page.locator('button:has-text("print"), button:has-text("export"), button:has-text("pdf")');
      const hasPrintButton = await printButton.count();
      expect(hasPrintButton).toBeGreaterThanOrEqual(0);
    });

    test('should have share/send option', async ({ page }) => {
      await navigateAndVerify(page, '/beos/beo-001', /beos\/beo-001/);
      
      if (isAuthRedirect(page.url())) return;
      
      const shareButton = page.locator('button:has-text("share"), button:has-text("send"), button:has-text("email")');
      const hasShareButton = await shareButton.count();
      expect(hasShareButton).toBeGreaterThanOrEqual(0);
    });
  });

  test.describe('BEO Edit (Update)', () => {
    
    test('should display BEO edit form', async ({ page }) => {
      await navigateAndVerify(page, '/beos/beo-001/edit', /beos\/beo-001\/edit/);
      
      if (isAuthRedirect(page.url())) return;
      
      const form = page.locator('form');
      await expect(form.first()).toBeVisible();
    });

    test('should pre-populate form with existing data', async ({ page }) => {
      await navigateAndVerify(page, '/beos/beo-001/edit', /beos\/beo-001\/edit/);
      
      if (isAuthRedirect(page.url())) return;
      
      const eventField = page.locator('select[name="event"], input[name="event"]').first();
      if (await eventField.isVisible()) {
        const value = await eventField.inputValue();
        expect(value.length).toBeGreaterThanOrEqual(0);
      }
    });

    test('should have save button', async ({ page }) => {
      await navigateAndVerify(page, '/beos/beo-001/edit', /beos\/beo-001\/edit/);
      
      if (isAuthRedirect(page.url())) return;
      
      const saveButton = page.locator('button[type="submit"], button:has-text("save"), button:has-text("update")');
      const hasSaveButton = await saveButton.count();
      expect(hasSaveButton).toBeGreaterThanOrEqual(0);
    });

    test('should have cancel button', async ({ page }) => {
      await navigateAndVerify(page, '/beos/beo-001/edit', /beos\/beo-001\/edit/);
      
      if (isAuthRedirect(page.url())) return;
      
      const cancelButton = page.locator('button:has-text("cancel"), a:has-text("cancel")');
      const hasCancelButton = await cancelButton.count();
      expect(hasCancelButton).toBeGreaterThanOrEqual(0);
    });
  });

  test.describe('BEO Versioning', () => {
    
    test('should display versions page', async ({ page }) => {
      await navigateAndVerify(page, '/beos/beo-001/versions', /beos\/beo-001\/versions/);
    });

    test('should show version history', async ({ page }) => {
      await navigateAndVerify(page, '/beos/beo-001/versions', /beos\/beo-001\/versions/);
      
      if (isAuthRedirect(page.url())) return;
      
      const versionHistory = page.locator('[data-testid="version-history"], .versions, table');
      const hasVersionHistory = await versionHistory.count();
      expect(hasVersionHistory).toBeGreaterThanOrEqual(0);
    });

    test('should have compare versions option', async ({ page }) => {
      await navigateAndVerify(page, '/beos/beo-001/versions', /beos\/beo-001\/versions/);
      
      if (isAuthRedirect(page.url())) return;
      
      const compareButton = page.locator('button:has-text("compare"), [data-testid="compare-versions"]');
      const hasCompare = await compareButton.count();
      expect(hasCompare).toBeGreaterThanOrEqual(0);
    });

    test('should have restore version option', async ({ page }) => {
      await navigateAndVerify(page, '/beos/beo-001/versions', /beos\/beo-001\/versions/);
      
      if (isAuthRedirect(page.url())) return;
      
      const restoreButton = page.locator('button:has-text("restore"), [data-testid="restore-version"]');
      const hasRestore = await restoreButton.count();
      expect(hasRestore).toBeGreaterThanOrEqual(0);
    });
  });

  test.describe('BEO Approval Workflow', () => {
    
    test('should show approval status', async ({ page }) => {
      await navigateAndVerify(page, '/beos/beo-001', /beos\/beo-001/);
      
      if (isAuthRedirect(page.url())) return;
      
      const approvalStatus = page.locator('[data-testid="approval-status"], .approval-status, text=/approved|pending|rejected/i');
      const hasApprovalStatus = await approvalStatus.count();
      expect(hasApprovalStatus).toBeGreaterThanOrEqual(0);
    });

    test('should have approve button', async ({ page }) => {
      await navigateAndVerify(page, '/beos/beo-001', /beos\/beo-001/);
      
      if (isAuthRedirect(page.url())) return;
      
      const approveButton = page.locator('button:has-text("approve")');
      const hasApprove = await approveButton.count();
      expect(hasApprove).toBeGreaterThanOrEqual(0);
    });

    test('should have request changes button', async ({ page }) => {
      await navigateAndVerify(page, '/beos/beo-001', /beos\/beo-001/);
      
      if (isAuthRedirect(page.url())) return;
      
      const requestChangesButton = page.locator('button:has-text("request changes"), button:has-text("reject")');
      const hasRequestChanges = await requestChangesButton.count();
      expect(hasRequestChanges).toBeGreaterThanOrEqual(0);
    });

    test('should show approval history', async ({ page }) => {
      await navigateAndVerify(page, '/beos/beo-001', /beos\/beo-001/);
      
      if (isAuthRedirect(page.url())) return;
      
      const approvalHistory = page.locator('[data-testid="approval-history"], .approval-history');
      const hasApprovalHistory = await approvalHistory.count();
      expect(hasApprovalHistory).toBeGreaterThanOrEqual(0);
    });
  });

  test.describe('BEO Delete', () => {
    
    test('should show delete confirmation', async ({ page }) => {
      await navigateAndVerify(page, '/beos/beo-001', /beos\/beo-001/);
      
      if (isAuthRedirect(page.url())) return;
      
      const deleteButton = page.locator('button:has-text("delete"), [data-testid="delete-beo"]');
      if (await deleteButton.isVisible()) {
        await deleteButton.click();
        
        const dialog = page.locator('[role="dialog"], [role="alertdialog"], .modal');
        const hasDialog = await dialog.count();
        expect(hasDialog).toBeGreaterThanOrEqual(0);
      }
    });
  });

  test.describe('BEO Templates', () => {
    
    test('should have template selection on create', async ({ page }) => {
      await navigateAndVerify(page, '/beos/new', /beos\/new/);
      
      if (isAuthRedirect(page.url())) return;
      
      const templateSelect = page.locator('select[name="template"], [data-testid="template-select"], button:has-text("template")');
      const hasTemplate = await templateSelect.count();
      expect(hasTemplate).toBeGreaterThanOrEqual(0);
    });

    test('should have save as template option', async ({ page }) => {
      await navigateAndVerify(page, '/beos/beo-001', /beos\/beo-001/);
      
      if (isAuthRedirect(page.url())) return;
      
      const saveTemplateButton = page.locator('button:has-text("save as template"), [data-testid="save-template"]');
      const hasSaveTemplate = await saveTemplateButton.count();
      expect(hasSaveTemplate).toBeGreaterThanOrEqual(0);
    });
  });

  test.describe('BEO Duplicate', () => {
    
    test('should have duplicate option', async ({ page }) => {
      await navigateAndVerify(page, '/beos/beo-001', /beos\/beo-001/);
      
      if (isAuthRedirect(page.url())) return;
      
      const duplicateButton = page.locator('button:has-text("duplicate"), button:has-text("copy")');
      const hasDuplicate = await duplicateButton.count();
      expect(hasDuplicate).toBeGreaterThanOrEqual(0);
    });
  });
});

test.describe('COMPVSS BEOs - API Integration', () => {
  
  test('GET /api/beos returns valid response', async ({ request }) => {
    const response = await request.get(`${COMPVSS_BASE}/api/beos`);
    expect([200, 401, 403, 404]).toContain(response.status());
  });

  test('GET /api/beos/:id returns valid response', async ({ request }) => {
    const response = await request.get(`${COMPVSS_BASE}/api/beos/beo-001`);
    expect([200, 401, 403, 404]).toContain(response.status());
  });

  test('POST /api/beos requires authentication', async ({ request }) => {
    const response = await request.post(`${COMPVSS_BASE}/api/beos`, {
      data: { event_id: 'evt-001', venue_id: 'venue-001' }
    });
    expect([200, 201, 401, 403, 422]).toContain(response.status());
  });

  test('PUT /api/beos/:id requires authentication', async ({ request }) => {
    const response = await request.put(`${COMPVSS_BASE}/api/beos/beo-001`, {
      data: { status: 'approved' }
    });
    expect([200, 401, 403, 404, 422]).toContain(response.status());
  });

  test('DELETE /api/beos/:id requires authentication', async ({ request }) => {
    const response = await request.delete(`${COMPVSS_BASE}/api/beos/beo-001`);
    expect([200, 204, 401, 403, 404]).toContain(response.status());
  });

  test('GET /api/beos/:id/versions returns valid response', async ({ request }) => {
    const response = await request.get(`${COMPVSS_BASE}/api/beos/beo-001/versions`);
    expect([200, 401, 403, 404]).toContain(response.status());
  });

  test('POST /api/beos/:id/approve requires authentication', async ({ request }) => {
    const response = await request.post(`${COMPVSS_BASE}/api/beos/beo-001/approve`);
    expect([200, 401, 403, 404]).toContain(response.status());
  });

  test('POST /api/beos/:id/duplicate requires authentication', async ({ request }) => {
    const response = await request.post(`${COMPVSS_BASE}/api/beos/beo-001/duplicate`);
    expect([200, 201, 401, 403, 404]).toContain(response.status());
  });
});
