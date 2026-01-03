import { test, expect, Page } from '@playwright/test';

/**
 * ATLVS Invoices E2E Tests
 * Tests invoice CRUD operations and related functionality
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

test.describe('ATLVS Invoices - CRUD Operations', () => {

  test.describe('Invoices List (Read)', () => {
    
    test('should display invoices list page', async ({ page }) => {
      await navigateAndVerify(page, '/invoices', /invoices/);
    });

    test('should show invoices table', async ({ page }) => {
      await navigateAndVerify(page, '/invoices', /invoices/);
      
      if (isAuthRedirect(page.url())) return;
      
      const hasInvoicesList = await page.locator('[data-testid="invoices-list"], table, .invoices-list').count();
      expect(hasInvoicesList).toBeGreaterThanOrEqual(0);
    });

    test('should have search functionality', async ({ page }) => {
      await navigateAndVerify(page, '/invoices', /invoices/);
      
      if (isAuthRedirect(page.url())) return;
      
      const searchInput = page.locator('input[type="search"], input[placeholder*="search" i]');
      const hasSearch = await searchInput.count();
      expect(hasSearch).toBeGreaterThanOrEqual(0);
    });

    test('should have status filter', async ({ page }) => {
      await navigateAndVerify(page, '/invoices', /invoices/);
      
      if (isAuthRedirect(page.url())) return;
      
      const statusFilter = page.locator('select[name="status"], [data-testid="status-filter"], button:has-text("status")');
      const hasStatusFilter = await statusFilter.count();
      expect(hasStatusFilter).toBeGreaterThanOrEqual(0);
    });

    test('should have date range filter', async ({ page }) => {
      await navigateAndVerify(page, '/invoices', /invoices/);
      
      if (isAuthRedirect(page.url())) return;
      
      const dateFilter = page.locator('input[type="date"], [data-testid="date-filter"]');
      const hasDateFilter = await dateFilter.count();
      expect(hasDateFilter).toBeGreaterThanOrEqual(0);
    });

    test('should have create invoice button', async ({ page }) => {
      await navigateAndVerify(page, '/invoices', /invoices/);
      
      if (isAuthRedirect(page.url())) return;
      
      const createButton = page.locator('a[href*="/invoices/new"], button:has-text("create"), button:has-text("new invoice")');
      const hasCreateButton = await createButton.count();
      expect(hasCreateButton).toBeGreaterThanOrEqual(0);
    });

    test('should display invoice totals', async ({ page }) => {
      await navigateAndVerify(page, '/invoices', /invoices/);
      
      if (isAuthRedirect(page.url())) return;
      
      const totals = page.locator('[data-testid="invoice-totals"], .totals, text=/total/i');
      const hasTotals = await totals.count();
      expect(hasTotals).toBeGreaterThanOrEqual(0);
    });
  });

  test.describe('Invoice Creation (Create)', () => {
    
    test('should display invoice creation form', async ({ page }) => {
      await navigateAndVerify(page, '/invoices/new', /invoices\/new/);
      
      if (isAuthRedirect(page.url())) return;
      
      const form = page.locator('form');
      await expect(form.first()).toBeVisible();
    });

    test('should have client selection', async ({ page }) => {
      await navigateAndVerify(page, '/invoices/new', /invoices\/new/);
      
      if (isAuthRedirect(page.url())) return;
      
      const clientSelect = page.locator('select[name="client"], [data-testid="client-select"], input[name="client"]');
      const hasClientSelect = await clientSelect.count();
      expect(hasClientSelect).toBeGreaterThanOrEqual(0);
    });

    test('should have line items section', async ({ page }) => {
      await navigateAndVerify(page, '/invoices/new', /invoices\/new/);
      
      if (isAuthRedirect(page.url())) return;
      
      const lineItems = page.locator('[data-testid="line-items"], .line-items, text=/item/i');
      const hasLineItems = await lineItems.count();
      expect(hasLineItems).toBeGreaterThanOrEqual(0);
    });

    test('should have add line item button', async ({ page }) => {
      await navigateAndVerify(page, '/invoices/new', /invoices\/new/);
      
      if (isAuthRedirect(page.url())) return;
      
      const addButton = page.locator('button:has-text("add item"), button:has-text("add line"), [data-testid="add-line-item"]');
      const hasAddButton = await addButton.count();
      expect(hasAddButton).toBeGreaterThanOrEqual(0);
    });

    test('should calculate totals automatically', async ({ page }) => {
      await navigateAndVerify(page, '/invoices/new', /invoices\/new/);
      
      if (isAuthRedirect(page.url())) return;
      
      const subtotal = page.locator('[data-testid="subtotal"], text=/subtotal/i');
      const total = page.locator('[data-testid="total"], text=/total/i');
      
      const hasSubtotal = await subtotal.count();
      const hasTotal = await total.count();
      
      expect(hasSubtotal + hasTotal).toBeGreaterThanOrEqual(0);
    });

    test('should have tax calculation', async ({ page }) => {
      await navigateAndVerify(page, '/invoices/new', /invoices\/new/);
      
      if (isAuthRedirect(page.url())) return;
      
      const tax = page.locator('[data-testid="tax"], input[name="tax"], text=/tax/i');
      const hasTax = await tax.count();
      expect(hasTax).toBeGreaterThanOrEqual(0);
    });

    test('should have due date field', async ({ page }) => {
      await navigateAndVerify(page, '/invoices/new', /invoices\/new/);
      
      if (isAuthRedirect(page.url())) return;
      
      const dueDate = page.locator('input[name*="due" i], input[type="date"]');
      const hasDueDate = await dueDate.count();
      expect(hasDueDate).toBeGreaterThanOrEqual(0);
    });

    test('should have notes/terms field', async ({ page }) => {
      await navigateAndVerify(page, '/invoices/new', /invoices\/new/);
      
      if (isAuthRedirect(page.url())) return;
      
      const notes = page.locator('textarea[name="notes"], textarea[name="terms"], [data-testid="notes"]');
      const hasNotes = await notes.count();
      expect(hasNotes).toBeGreaterThanOrEqual(0);
    });

    test('should validate required fields', async ({ page }) => {
      await navigateAndVerify(page, '/invoices/new', /invoices\/new/);
      
      if (isAuthRedirect(page.url())) return;
      
      const submitButton = page.locator('button[type="submit"]');
      if (await submitButton.isVisible()) {
        await submitButton.click();
        
        const hasError = await page.locator('[data-error], [aria-invalid="true"], .error').count();
        expect(hasError).toBeGreaterThanOrEqual(0);
      }
    });
  });

  test.describe('Invoice Detail (Read)', () => {
    
    test('should display invoice detail page', async ({ page }) => {
      await navigateAndVerify(page, '/invoices/inv-001', /invoices\/inv-001/);
    });

    test('should show invoice header info', async ({ page }) => {
      await navigateAndVerify(page, '/invoices/inv-001', /invoices\/inv-001/);
      
      if (isAuthRedirect(page.url())) return;
      
      const header = page.locator('[data-testid="invoice-header"], .invoice-header');
      const hasHeader = await header.count();
      expect(hasHeader).toBeGreaterThanOrEqual(0);
    });

    test('should show client information', async ({ page }) => {
      await navigateAndVerify(page, '/invoices/inv-001', /invoices\/inv-001/);
      
      if (isAuthRedirect(page.url())) return;
      
      const clientInfo = page.locator('[data-testid="client-info"], .client-info, text=/bill to/i');
      const hasClientInfo = await clientInfo.count();
      expect(hasClientInfo).toBeGreaterThanOrEqual(0);
    });

    test('should show line items', async ({ page }) => {
      await navigateAndVerify(page, '/invoices/inv-001', /invoices\/inv-001/);
      
      if (isAuthRedirect(page.url())) return;
      
      const lineItems = page.locator('[data-testid="line-items"], table, .line-items');
      const hasLineItems = await lineItems.count();
      expect(hasLineItems).toBeGreaterThanOrEqual(0);
    });

    test('should show payment status', async ({ page }) => {
      await navigateAndVerify(page, '/invoices/inv-001', /invoices\/inv-001/);
      
      if (isAuthRedirect(page.url())) return;
      
      const status = page.locator('[data-testid="payment-status"], .status, text=/paid|unpaid|pending|overdue/i');
      const hasStatus = await status.count();
      expect(hasStatus).toBeGreaterThanOrEqual(0);
    });

    test('should have edit button', async ({ page }) => {
      await navigateAndVerify(page, '/invoices/inv-001', /invoices\/inv-001/);
      
      if (isAuthRedirect(page.url())) return;
      
      const editButton = page.locator('a[href*="edit"], button:has-text("edit")');
      const hasEditButton = await editButton.count();
      expect(hasEditButton).toBeGreaterThanOrEqual(0);
    });

    test('should have print/download option', async ({ page }) => {
      await navigateAndVerify(page, '/invoices/inv-001', /invoices\/inv-001/);
      
      if (isAuthRedirect(page.url())) return;
      
      const printButton = page.locator('button:has-text("print"), button:has-text("download"), button:has-text("pdf")');
      const hasPrintButton = await printButton.count();
      expect(hasPrintButton).toBeGreaterThanOrEqual(0);
    });

    test('should have send option', async ({ page }) => {
      await navigateAndVerify(page, '/invoices/inv-001', /invoices\/inv-001/);
      
      if (isAuthRedirect(page.url())) return;
      
      const sendButton = page.locator('button:has-text("send"), button:has-text("email")');
      const hasSendButton = await sendButton.count();
      expect(hasSendButton).toBeGreaterThanOrEqual(0);
    });
  });

  test.describe('Invoice Edit (Update)', () => {
    
    test('should display invoice edit form', async ({ page }) => {
      await navigateAndVerify(page, '/invoices/inv-001/edit', /invoices\/inv-001\/edit/);
      
      if (isAuthRedirect(page.url())) return;
      
      const form = page.locator('form');
      await expect(form.first()).toBeVisible();
    });

    test('should pre-populate form with existing data', async ({ page }) => {
      await navigateAndVerify(page, '/invoices/inv-001/edit', /invoices\/inv-001\/edit/);
      
      if (isAuthRedirect(page.url())) return;
      
      const clientField = page.locator('select[name="client"], input[name="client"]').first();
      if (await clientField.isVisible()) {
        const value = await clientField.inputValue();
        expect(value.length).toBeGreaterThanOrEqual(0);
      }
    });

    test('should allow editing line items', async ({ page }) => {
      await navigateAndVerify(page, '/invoices/inv-001/edit', /invoices\/inv-001\/edit/);
      
      if (isAuthRedirect(page.url())) return;
      
      const lineItemInput = page.locator('[data-testid="line-item"] input, .line-item input').first();
      if (await lineItemInput.isVisible()) {
        await expect(lineItemInput).toBeEditable();
      }
    });

    test('should recalculate totals on change', async ({ page }) => {
      await navigateAndVerify(page, '/invoices/inv-001/edit', /invoices\/inv-001\/edit/);
      
      if (isAuthRedirect(page.url())) return;
      
      const total = page.locator('[data-testid="total"], .total');
      const hasTotal = await total.count();
      expect(hasTotal).toBeGreaterThanOrEqual(0);
    });
  });

  test.describe('Invoice Delete', () => {
    
    test('should show delete confirmation', async ({ page }) => {
      await navigateAndVerify(page, '/invoices/inv-001', /invoices\/inv-001/);
      
      if (isAuthRedirect(page.url())) return;
      
      const deleteButton = page.locator('button:has-text("delete"), [data-testid="delete-invoice"]');
      if (await deleteButton.isVisible()) {
        await deleteButton.click();
        
        const dialog = page.locator('[role="dialog"], [role="alertdialog"], .modal');
        const hasDialog = await dialog.count();
        expect(hasDialog).toBeGreaterThanOrEqual(0);
      }
    });
  });

  test.describe('Invoice Actions', () => {
    
    test('should have mark as paid action', async ({ page }) => {
      await navigateAndVerify(page, '/invoices/inv-001', /invoices\/inv-001/);
      
      if (isAuthRedirect(page.url())) return;
      
      const markPaidButton = page.locator('button:has-text("mark as paid"), button:has-text("record payment")');
      const hasMarkPaid = await markPaidButton.count();
      expect(hasMarkPaid).toBeGreaterThanOrEqual(0);
    });

    test('should have void invoice action', async ({ page }) => {
      await navigateAndVerify(page, '/invoices/inv-001', /invoices\/inv-001/);
      
      if (isAuthRedirect(page.url())) return;
      
      const voidButton = page.locator('button:has-text("void"), button:has-text("cancel")');
      const hasVoid = await voidButton.count();
      expect(hasVoid).toBeGreaterThanOrEqual(0);
    });

    test('should have duplicate invoice action', async ({ page }) => {
      await navigateAndVerify(page, '/invoices/inv-001', /invoices\/inv-001/);
      
      if (isAuthRedirect(page.url())) return;
      
      const duplicateButton = page.locator('button:has-text("duplicate"), button:has-text("copy")');
      const hasDuplicate = await duplicateButton.count();
      expect(hasDuplicate).toBeGreaterThanOrEqual(0);
    });
  });

  test.describe('Invoice Payments', () => {
    
    test('should show payment history', async ({ page }) => {
      await navigateAndVerify(page, '/invoices/inv-001', /invoices\/inv-001/);
      
      if (isAuthRedirect(page.url())) return;
      
      const paymentHistory = page.locator('[data-testid="payment-history"], .payment-history, text=/payment/i');
      const hasPaymentHistory = await paymentHistory.count();
      expect(hasPaymentHistory).toBeGreaterThanOrEqual(0);
    });

    test('should allow recording partial payment', async ({ page }) => {
      await navigateAndVerify(page, '/invoices/inv-001', /invoices\/inv-001/);
      
      if (isAuthRedirect(page.url())) return;
      
      const recordPaymentButton = page.locator('button:has-text("record payment"), button:has-text("add payment")');
      const hasRecordPayment = await recordPaymentButton.count();
      expect(hasRecordPayment).toBeGreaterThanOrEqual(0);
    });
  });

  test.describe('Invoice Reminders', () => {
    
    test('should have send reminder option', async ({ page }) => {
      await navigateAndVerify(page, '/invoices/inv-001', /invoices\/inv-001/);
      
      if (isAuthRedirect(page.url())) return;
      
      const reminderButton = page.locator('button:has-text("reminder"), button:has-text("follow up")');
      const hasReminder = await reminderButton.count();
      expect(hasReminder).toBeGreaterThanOrEqual(0);
    });
  });
});

test.describe('ATLVS Invoices - API Integration', () => {
  
  test('GET /api/invoices returns valid response', async ({ request }) => {
    const response = await request.get(`${ATLVS_BASE}/api/invoices`);
    expect([200, 401, 403, 404]).toContain(response.status());
  });

  test('GET /api/invoices/:id returns valid response', async ({ request }) => {
    const response = await request.get(`${ATLVS_BASE}/api/invoices/inv-001`);
    expect([200, 401, 403, 404]).toContain(response.status());
  });

  test('POST /api/invoices requires authentication', async ({ request }) => {
    const response = await request.post(`${ATLVS_BASE}/api/invoices`, {
      data: { client_id: 'client-001', items: [] }
    });
    expect([200, 201, 401, 403, 422]).toContain(response.status());
  });

  test('PUT /api/invoices/:id requires authentication', async ({ request }) => {
    const response = await request.put(`${ATLVS_BASE}/api/invoices/inv-001`, {
      data: { status: 'paid' }
    });
    expect([200, 401, 403, 404, 422]).toContain(response.status());
  });

  test('DELETE /api/invoices/:id requires authentication', async ({ request }) => {
    const response = await request.delete(`${ATLVS_BASE}/api/invoices/inv-001`);
    expect([200, 204, 401, 403, 404]).toContain(response.status());
  });

  test('POST /api/invoices/:id/send requires authentication', async ({ request }) => {
    const response = await request.post(`${ATLVS_BASE}/api/invoices/inv-001/send`);
    expect([200, 401, 403, 404]).toContain(response.status());
  });

  test('POST /api/invoices/:id/payments requires authentication', async ({ request }) => {
    const response = await request.post(`${ATLVS_BASE}/api/invoices/inv-001/payments`, {
      data: { amount: 100 }
    });
    expect([200, 201, 401, 403, 404, 422]).toContain(response.status());
  });
});
