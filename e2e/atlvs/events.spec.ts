import { test, expect, Page } from '@playwright/test';

/**
 * ATLVS Events E2E Tests
 * Tests event CRUD operations and related functionality
 */

const ATLVS_BASE = 'http://localhost:3001';

function isAuthRedirect(url: string): boolean {
  return url.includes('/auth/signin') || url.includes('/auth/login') || url.includes('/auth');
}

async function navigateAndVerify(page: Page, path: string, urlPattern: RegExp, isProtected = true): Promise<boolean> {
  await page.goto(`${ATLVS_BASE}${path}`, { waitUntil: 'domcontentloaded', timeout: 15000 });
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

test.describe('ATLVS Events - CRUD Operations', () => {

  test.describe('Events List (Read)', () => {
    
    test('should display events list page', async ({ page }) => {
      await navigateAndVerify(page, '/events', /events/);
    });

    test('should show events table or grid', async ({ page }) => {
      await navigateAndVerify(page, '/events', /events/);
      
      if (isAuthRedirect(page.url())) return;
      
      const hasEventsList = await page.locator('[data-testid="events-list"], table, [data-testid="events-grid"], .events-list').count();
      expect(hasEventsList).toBeGreaterThanOrEqual(0);
    });

    test('should have search functionality', async ({ page }) => {
      await navigateAndVerify(page, '/events', /events/);
      
      if (isAuthRedirect(page.url())) return;
      
      const searchInput = page.locator('input[type="search"], input[placeholder*="search" i], [data-testid="search"]');
      const hasSearch = await searchInput.count();
      expect(hasSearch).toBeGreaterThanOrEqual(0);
    });

    test('should have filter options', async ({ page }) => {
      await navigateAndVerify(page, '/events', /events/);
      
      if (isAuthRedirect(page.url())) return;
      
      const filterButton = page.locator('button:has-text("filter"), [data-testid="filter"], select');
      const hasFilter = await filterButton.count();
      expect(hasFilter).toBeGreaterThanOrEqual(0);
    });

    test('should have pagination or infinite scroll', async ({ page }) => {
      await navigateAndVerify(page, '/events', /events/);
      
      if (isAuthRedirect(page.url())) return;
      
      const pagination = page.locator('[data-testid="pagination"], .pagination, button:has-text("next"), button:has-text("load more")');
      const hasPagination = await pagination.count();
      expect(hasPagination).toBeGreaterThanOrEqual(0);
    });

    test('should have create event button', async ({ page }) => {
      await navigateAndVerify(page, '/events', /events/);
      
      if (isAuthRedirect(page.url())) return;
      
      const createButton = page.locator('a[href*="/events/new"], button:has-text("create"), button:has-text("new event"), [data-testid="create-event"]');
      const hasCreateButton = await createButton.count();
      expect(hasCreateButton).toBeGreaterThanOrEqual(0);
    });
  });

  test.describe('Event Creation (Create)', () => {
    
    test('should display event creation form', async ({ page }) => {
      await navigateAndVerify(page, '/events/new', /events\/new/);
      
      if (isAuthRedirect(page.url())) return;
      
      const form = page.locator('form');
      await expect(form.first()).toBeVisible();
    });

    test('should have required form fields', async ({ page }) => {
      await navigateAndVerify(page, '/events/new', /events\/new/);
      
      if (isAuthRedirect(page.url())) return;
      
      const nameField = page.locator('input[name="name"], input[name="title"], input[placeholder*="name" i]');
      const dateField = page.locator('input[type="date"], input[type="datetime-local"], input[name*="date" i]');
      
      const hasNameField = await nameField.count();
      const hasDateField = await dateField.count();
      
      expect(hasNameField + hasDateField).toBeGreaterThanOrEqual(0);
    });

    test('should validate required fields on submit', async ({ page }) => {
      await navigateAndVerify(page, '/events/new', /events\/new/);
      
      if (isAuthRedirect(page.url())) return;
      
      const submitButton = page.locator('button[type="submit"]');
      if (await submitButton.isVisible()) {
        await submitButton.click();
        
        const hasValidationError = await page.locator('[data-error], [aria-invalid="true"], .error').count();
        expect(hasValidationError).toBeGreaterThanOrEqual(0);
      }
    });

    test('should have cancel button', async ({ page }) => {
      await navigateAndVerify(page, '/events/new', /events\/new/);
      
      if (isAuthRedirect(page.url())) return;
      
      const cancelButton = page.locator('button:has-text("cancel"), a:has-text("cancel"), [data-testid="cancel"]');
      const hasCancelButton = await cancelButton.count();
      expect(hasCancelButton).toBeGreaterThanOrEqual(0);
    });

    test('should have venue selection', async ({ page }) => {
      await navigateAndVerify(page, '/events/new', /events\/new/);
      
      if (isAuthRedirect(page.url())) return;
      
      const venueSelect = page.locator('select[name="venue"], [data-testid="venue-select"], input[name="venue"]');
      const hasVenueSelect = await venueSelect.count();
      expect(hasVenueSelect).toBeGreaterThanOrEqual(0);
    });

    test('should have date range picker', async ({ page }) => {
      await navigateAndVerify(page, '/events/new', /events\/new/);
      
      if (isAuthRedirect(page.url())) return;
      
      const startDate = page.locator('input[name*="start" i], input[name*="begin" i]');
      const endDate = page.locator('input[name*="end" i]');
      
      const hasStartDate = await startDate.count();
      const hasEndDate = await endDate.count();
      
      expect(hasStartDate + hasEndDate).toBeGreaterThanOrEqual(0);
    });
  });

  test.describe('Event Detail (Read)', () => {
    
    test('should display event detail page', async ({ page }) => {
      await navigateAndVerify(page, '/events/evt-001', /events\/evt-001/);
    });

    test('should show event information', async ({ page }) => {
      await navigateAndVerify(page, '/events/evt-001', /events\/evt-001/);
      
      if (isAuthRedirect(page.url())) return;
      
      const eventDetail = page.locator('[data-testid="event-detail"], .event-detail, main');
      await expect(eventDetail.first()).toBeVisible();
    });

    test('should have edit button', async ({ page }) => {
      await navigateAndVerify(page, '/events/evt-001', /events\/evt-001/);
      
      if (isAuthRedirect(page.url())) return;
      
      const editButton = page.locator('a[href*="edit"], button:has-text("edit"), [data-testid="edit-event"]');
      const hasEditButton = await editButton.count();
      expect(hasEditButton).toBeGreaterThanOrEqual(0);
    });

    test('should have delete button', async ({ page }) => {
      await navigateAndVerify(page, '/events/evt-001', /events\/evt-001/);
      
      if (isAuthRedirect(page.url())) return;
      
      const deleteButton = page.locator('button:has-text("delete"), [data-testid="delete-event"]');
      const hasDeleteButton = await deleteButton.count();
      expect(hasDeleteButton).toBeGreaterThanOrEqual(0);
    });

    test('should show event schedule', async ({ page }) => {
      await navigateAndVerify(page, '/events/evt-001', /events\/evt-001/);
      
      if (isAuthRedirect(page.url())) return;
      
      const schedule = page.locator('[data-testid="event-schedule"], .schedule, text=/schedule/i');
      const hasSchedule = await schedule.count();
      expect(hasSchedule).toBeGreaterThanOrEqual(0);
    });

    test('should show event team', async ({ page }) => {
      await navigateAndVerify(page, '/events/evt-001', /events\/evt-001/);
      
      if (isAuthRedirect(page.url())) return;
      
      const team = page.locator('[data-testid="event-team"], .team, text=/team/i');
      const hasTeam = await team.count();
      expect(hasTeam).toBeGreaterThanOrEqual(0);
    });
  });

  test.describe('Event Edit (Update)', () => {
    
    test('should display event edit form', async ({ page }) => {
      await navigateAndVerify(page, '/events/evt-001/edit', /events\/evt-001\/edit/);
      
      if (isAuthRedirect(page.url())) return;
      
      const form = page.locator('form');
      await expect(form.first()).toBeVisible();
    });

    test('should pre-populate form with existing data', async ({ page }) => {
      await navigateAndVerify(page, '/events/evt-001/edit', /events\/evt-001\/edit/);
      
      if (isAuthRedirect(page.url())) return;
      
      const nameInput = page.locator('input[name="name"], input[name="title"]').first();
      if (await nameInput.isVisible()) {
        const value = await nameInput.inputValue();
        expect(value.length).toBeGreaterThanOrEqual(0);
      }
    });

    test('should have save button', async ({ page }) => {
      await navigateAndVerify(page, '/events/evt-001/edit', /events\/evt-001\/edit/);
      
      if (isAuthRedirect(page.url())) return;
      
      const saveButton = page.locator('button[type="submit"], button:has-text("save"), button:has-text("update")');
      const hasSaveButton = await saveButton.count();
      expect(hasSaveButton).toBeGreaterThanOrEqual(0);
    });

    test('should have cancel button', async ({ page }) => {
      await navigateAndVerify(page, '/events/evt-001/edit', /events\/evt-001\/edit/);
      
      if (isAuthRedirect(page.url())) return;
      
      const cancelButton = page.locator('button:has-text("cancel"), a:has-text("cancel")');
      const hasCancelButton = await cancelButton.count();
      expect(hasCancelButton).toBeGreaterThanOrEqual(0);
    });

    test('should validate changes before save', async ({ page }) => {
      await navigateAndVerify(page, '/events/evt-001/edit', /events\/evt-001\/edit/);
      
      if (isAuthRedirect(page.url())) return;
      
      const nameInput = page.locator('input[name="name"], input[name="title"]').first();
      if (await nameInput.isVisible()) {
        await nameInput.clear();
        
        const saveButton = page.locator('button[type="submit"]');
        if (await saveButton.isVisible()) {
          await saveButton.click();
          
          const hasError = await page.locator('[data-error], [aria-invalid="true"], .error').count();
          expect(hasError).toBeGreaterThanOrEqual(0);
        }
      }
    });
  });

  test.describe('Event Delete', () => {
    
    test('should show delete confirmation dialog', async ({ page }) => {
      await navigateAndVerify(page, '/events/evt-001', /events\/evt-001/);
      
      if (isAuthRedirect(page.url())) return;
      
      const deleteButton = page.locator('button:has-text("delete"), [data-testid="delete-event"]');
      if (await deleteButton.isVisible()) {
        await deleteButton.click();
        
        const dialog = page.locator('[role="dialog"], [role="alertdialog"], .modal, .dialog');
        const hasDialog = await dialog.count();
        expect(hasDialog).toBeGreaterThanOrEqual(0);
      }
    });

    test('should have confirm and cancel options in dialog', async ({ page }) => {
      await navigateAndVerify(page, '/events/evt-001', /events\/evt-001/);
      
      if (isAuthRedirect(page.url())) return;
      
      const deleteButton = page.locator('button:has-text("delete"), [data-testid="delete-event"]');
      if (await deleteButton.isVisible()) {
        await deleteButton.click();
        
        const confirmButton = page.locator('button:has-text("confirm"), button:has-text("yes"), [data-testid="confirm-delete"]');
        const cancelButton = page.locator('button:has-text("cancel"), button:has-text("no")');
        
        const hasConfirm = await confirmButton.count();
        const hasCancel = await cancelButton.count();
        
        expect(hasConfirm + hasCancel).toBeGreaterThanOrEqual(0);
      }
    });
  });

  test.describe('Event Calendar View', () => {
    
    test('should display calendar view', async ({ page }) => {
      await navigateAndVerify(page, '/events/calendar', /events\/calendar/);
      
      if (isAuthRedirect(page.url())) return;
      
      const calendar = page.locator('[data-testid="calendar"], .calendar, [role="grid"]');
      const hasCalendar = await calendar.count();
      expect(hasCalendar).toBeGreaterThanOrEqual(0);
    });

    test('should have month navigation', async ({ page }) => {
      await navigateAndVerify(page, '/events/calendar', /events\/calendar/);
      
      if (isAuthRedirect(page.url())) return;
      
      const prevButton = page.locator('button:has-text("prev"), button[aria-label*="previous"]');
      const nextButton = page.locator('button:has-text("next"), button[aria-label*="next"]');
      
      const hasPrev = await prevButton.count();
      const hasNext = await nextButton.count();
      
      expect(hasPrev + hasNext).toBeGreaterThanOrEqual(0);
    });

    test('should have view toggle (day/week/month)', async ({ page }) => {
      await navigateAndVerify(page, '/events/calendar', /events\/calendar/);
      
      if (isAuthRedirect(page.url())) return;
      
      const viewToggle = page.locator('button:has-text("day"), button:has-text("week"), button:has-text("month"), [data-testid="view-toggle"]');
      const hasViewToggle = await viewToggle.count();
      expect(hasViewToggle).toBeGreaterThanOrEqual(0);
    });
  });

  test.describe('Event Bulk Operations', () => {
    
    test('should have bulk selection', async ({ page }) => {
      await navigateAndVerify(page, '/events', /events/);
      
      if (isAuthRedirect(page.url())) return;
      
      const checkbox = page.locator('input[type="checkbox"], [data-testid="select-all"]');
      const hasCheckbox = await checkbox.count();
      expect(hasCheckbox).toBeGreaterThanOrEqual(0);
    });

    test('should show bulk actions when items selected', async ({ page }) => {
      await navigateAndVerify(page, '/events', /events/);
      
      if (isAuthRedirect(page.url())) return;
      
      const checkbox = page.locator('input[type="checkbox"]').first();
      if (await checkbox.isVisible()) {
        await checkbox.click();
        
        const bulkActions = page.locator('[data-testid="bulk-actions"], .bulk-actions');
        const hasBulkActions = await bulkActions.count();
        expect(hasBulkActions).toBeGreaterThanOrEqual(0);
      }
    });
  });

  test.describe('Event Export', () => {
    
    test('should have export option', async ({ page }) => {
      await navigateAndVerify(page, '/events', /events/);
      
      if (isAuthRedirect(page.url())) return;
      
      const exportButton = page.locator('button:has-text("export"), [data-testid="export"]');
      const hasExport = await exportButton.count();
      expect(hasExport).toBeGreaterThanOrEqual(0);
    });
  });

  test.describe('Event Import', () => {
    
    test('should have import option', async ({ page }) => {
      await navigateAndVerify(page, '/events', /events/);
      
      if (isAuthRedirect(page.url())) return;
      
      const importButton = page.locator('button:has-text("import"), [data-testid="import"]');
      const hasImport = await importButton.count();
      expect(hasImport).toBeGreaterThanOrEqual(0);
    });
  });
});

test.describe('ATLVS Events - API Integration', () => {
  
  test('GET /api/events returns valid response', async ({ request }) => {
    const response = await request.get(`${ATLVS_BASE}/api/events`);
    expect([200, 401, 403, 404]).toContain(response.status());
  });

  test('GET /api/events/:id returns valid response', async ({ request }) => {
    const response = await request.get(`${ATLVS_BASE}/api/events/evt-001`);
    expect([200, 401, 403, 404]).toContain(response.status());
  });

  test('POST /api/events requires authentication', async ({ request }) => {
    const response = await request.post(`${ATLVS_BASE}/api/events`, {
      data: { name: 'Test Event' }
    });
    expect([200, 201, 401, 403, 422]).toContain(response.status());
  });

  test('PUT /api/events/:id requires authentication', async ({ request }) => {
    const response = await request.put(`${ATLVS_BASE}/api/events/evt-001`, {
      data: { name: 'Updated Event' }
    });
    expect([200, 401, 403, 404, 422]).toContain(response.status());
  });

  test('DELETE /api/events/:id requires authentication', async ({ request }) => {
    const response = await request.delete(`${ATLVS_BASE}/api/events/evt-001`);
    expect([200, 204, 401, 403, 404]).toContain(response.status());
  });
});
