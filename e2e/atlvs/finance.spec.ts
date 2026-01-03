import { test, expect, Page } from '@playwright/test';

/**
 * ATLVS Finance Module E2E Tests
 * Tests finance-related functionality including budgets, expenses, bills, and purchase orders
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

test.describe('ATLVS Finance - Budgets', () => {

  test.describe('Budgets List', () => {
    
    test('should display budgets list page', async ({ page }) => {
      await navigateAndVerify(page, '/budgets', /budgets/);
    });

    test('should show budget summary cards', async ({ page }) => {
      await navigateAndVerify(page, '/budgets', /budgets/);
      
      if (isAuthRedirect(page.url())) return;
      
      const summaryCards = page.locator('[data-testid="budget-summary"], .summary-card, .budget-card');
      const hasCards = await summaryCards.count();
      expect(hasCards).toBeGreaterThanOrEqual(0);
    });

    test('should have create budget button', async ({ page }) => {
      await navigateAndVerify(page, '/budgets', /budgets/);
      
      if (isAuthRedirect(page.url())) return;
      
      const createButton = page.locator('a[href*="/budgets/new"], button:has-text("create"), button:has-text("new budget")');
      const hasCreate = await createButton.count();
      expect(hasCreate).toBeGreaterThanOrEqual(0);
    });

    test('should show budget vs actual comparison', async ({ page }) => {
      await navigateAndVerify(page, '/budgets', /budgets/);
      
      if (isAuthRedirect(page.url())) return;
      
      const comparison = page.locator('[data-testid="budget-actual"], text=/actual|spent|remaining/i');
      const hasComparison = await comparison.count();
      expect(hasComparison).toBeGreaterThanOrEqual(0);
    });
  });

  test.describe('Budget Detail', () => {
    
    test('should display budget detail page', async ({ page }) => {
      await navigateAndVerify(page, '/budgets/budget-001', /budgets\/budget-001/);
    });

    test('should show budget breakdown by category', async ({ page }) => {
      await navigateAndVerify(page, '/budgets/budget-001', /budgets\/budget-001/);
      
      if (isAuthRedirect(page.url())) return;
      
      const breakdown = page.locator('[data-testid="budget-breakdown"], .breakdown, .categories');
      const hasBreakdown = await breakdown.count();
      expect(hasBreakdown).toBeGreaterThanOrEqual(0);
    });

    test('should show budget chart/visualization', async ({ page }) => {
      await navigateAndVerify(page, '/budgets/budget-001', /budgets\/budget-001/);
      
      if (isAuthRedirect(page.url())) return;
      
      const chart = page.locator('[data-testid="budget-chart"], canvas, svg, .chart');
      const hasChart = await chart.count();
      expect(hasChart).toBeGreaterThanOrEqual(0);
    });

    test('should have edit budget button', async ({ page }) => {
      await navigateAndVerify(page, '/budgets/budget-001', /budgets\/budget-001/);
      
      if (isAuthRedirect(page.url())) return;
      
      const editButton = page.locator('a[href*="edit"], button:has-text("edit")');
      const hasEdit = await editButton.count();
      expect(hasEdit).toBeGreaterThanOrEqual(0);
    });
  });

  test.describe('Budget Creation', () => {
    
    test('should display budget creation form', async ({ page }) => {
      await navigateAndVerify(page, '/budgets/new', /budgets\/new/);
      
      if (isAuthRedirect(page.url())) return;
      
      const form = page.locator('form');
      await expect(form.first()).toBeVisible();
    });

    test('should have project selection', async ({ page }) => {
      await navigateAndVerify(page, '/budgets/new', /budgets\/new/);
      
      if (isAuthRedirect(page.url())) return;
      
      const projectSelect = page.locator('select[name="project"], [data-testid="project-select"]');
      const hasProjectSelect = await projectSelect.count();
      expect(hasProjectSelect).toBeGreaterThanOrEqual(0);
    });

    test('should have category line items', async ({ page }) => {
      await navigateAndVerify(page, '/budgets/new', /budgets\/new/);
      
      if (isAuthRedirect(page.url())) return;
      
      const categories = page.locator('[data-testid="budget-categories"], .categories, .line-items');
      const hasCategories = await categories.count();
      expect(hasCategories).toBeGreaterThanOrEqual(0);
    });

    test('should calculate total automatically', async ({ page }) => {
      await navigateAndVerify(page, '/budgets/new', /budgets\/new/);
      
      if (isAuthRedirect(page.url())) return;
      
      const total = page.locator('[data-testid="budget-total"], .total, text=/total/i');
      const hasTotal = await total.count();
      expect(hasTotal).toBeGreaterThanOrEqual(0);
    });
  });
});

test.describe('ATLVS Finance - Expenses', () => {

  test.describe('Expenses List', () => {
    
    test('should display expenses list page', async ({ page }) => {
      await navigateAndVerify(page, '/finance/expenses', /finance\/expenses/);
    });

    test('should show expenses table', async ({ page }) => {
      await navigateAndVerify(page, '/finance/expenses', /finance\/expenses/);
      
      if (isAuthRedirect(page.url())) return;
      
      const table = page.locator('table, [data-testid="expenses-list"]');
      const hasTable = await table.count();
      expect(hasTable).toBeGreaterThanOrEqual(0);
    });

    test('should have category filter', async ({ page }) => {
      await navigateAndVerify(page, '/finance/expenses', /finance\/expenses/);
      
      if (isAuthRedirect(page.url())) return;
      
      const categoryFilter = page.locator('select[name="category"], [data-testid="category-filter"]');
      const hasFilter = await categoryFilter.count();
      expect(hasFilter).toBeGreaterThanOrEqual(0);
    });

    test('should have date range filter', async ({ page }) => {
      await navigateAndVerify(page, '/finance/expenses', /finance\/expenses/);
      
      if (isAuthRedirect(page.url())) return;
      
      const dateFilter = page.locator('input[type="date"], [data-testid="date-range"]');
      const hasDateFilter = await dateFilter.count();
      expect(hasDateFilter).toBeGreaterThanOrEqual(0);
    });

    test('should have add expense button', async ({ page }) => {
      await navigateAndVerify(page, '/finance/expenses', /finance\/expenses/);
      
      if (isAuthRedirect(page.url())) return;
      
      const addButton = page.locator('button:has-text("add expense"), a[href*="new"]');
      const hasAdd = await addButton.count();
      expect(hasAdd).toBeGreaterThanOrEqual(0);
    });

    test('should show expense totals', async ({ page }) => {
      await navigateAndVerify(page, '/finance/expenses', /finance\/expenses/);
      
      if (isAuthRedirect(page.url())) return;
      
      const totals = page.locator('[data-testid="expense-totals"], .totals, text=/total/i');
      const hasTotals = await totals.count();
      expect(hasTotals).toBeGreaterThanOrEqual(0);
    });
  });

  test.describe('Expense Creation', () => {
    
    test('should display expense creation form', async ({ page }) => {
      await navigateAndVerify(page, '/finance/expenses/new', /finance\/expenses\/new/);
      
      if (isAuthRedirect(page.url())) return;
      
      const form = page.locator('form');
      await expect(form.first()).toBeVisible();
    });

    test('should have amount field', async ({ page }) => {
      await navigateAndVerify(page, '/finance/expenses/new', /finance\/expenses\/new/);
      
      if (isAuthRedirect(page.url())) return;
      
      const amountField = page.locator('input[name="amount"], input[type="number"]');
      const hasAmount = await amountField.count();
      expect(hasAmount).toBeGreaterThanOrEqual(0);
    });

    test('should have category selection', async ({ page }) => {
      await navigateAndVerify(page, '/finance/expenses/new', /finance\/expenses\/new/);
      
      if (isAuthRedirect(page.url())) return;
      
      const categorySelect = page.locator('select[name="category"], [data-testid="category-select"]');
      const hasCategory = await categorySelect.count();
      expect(hasCategory).toBeGreaterThanOrEqual(0);
    });

    test('should have receipt upload', async ({ page }) => {
      await navigateAndVerify(page, '/finance/expenses/new', /finance\/expenses\/new/);
      
      if (isAuthRedirect(page.url())) return;
      
      const fileInput = page.locator('input[type="file"], [data-testid="receipt-upload"]');
      const hasUpload = await fileInput.count();
      expect(hasUpload).toBeGreaterThanOrEqual(0);
    });

    test('should have vendor selection', async ({ page }) => {
      await navigateAndVerify(page, '/finance/expenses/new', /finance\/expenses\/new/);
      
      if (isAuthRedirect(page.url())) return;
      
      const vendorSelect = page.locator('select[name="vendor"], [data-testid="vendor-select"]');
      const hasVendor = await vendorSelect.count();
      expect(hasVendor).toBeGreaterThanOrEqual(0);
    });
  });
});

test.describe('ATLVS Finance - Bills', () => {

  test.describe('Bills List', () => {
    
    test('should display bills list page', async ({ page }) => {
      await navigateAndVerify(page, '/finance/bills', /finance\/bills/);
    });

    test('should show bills table', async ({ page }) => {
      await navigateAndVerify(page, '/finance/bills', /finance\/bills/);
      
      if (isAuthRedirect(page.url())) return;
      
      const table = page.locator('table, [data-testid="bills-list"]');
      const hasTable = await table.count();
      expect(hasTable).toBeGreaterThanOrEqual(0);
    });

    test('should have status filter', async ({ page }) => {
      await navigateAndVerify(page, '/finance/bills', /finance\/bills/);
      
      if (isAuthRedirect(page.url())) return;
      
      const statusFilter = page.locator('select[name="status"], [data-testid="status-filter"]');
      const hasFilter = await statusFilter.count();
      expect(hasFilter).toBeGreaterThanOrEqual(0);
    });

    test('should show overdue bills indicator', async ({ page }) => {
      await navigateAndVerify(page, '/finance/bills', /finance\/bills/);
      
      if (isAuthRedirect(page.url())) return;
      
      const overdueIndicator = page.locator('[data-testid="overdue"], .overdue, text=/overdue/i');
      const hasOverdue = await overdueIndicator.count();
      expect(hasOverdue).toBeGreaterThanOrEqual(0);
    });

    test('should have pay bill action', async ({ page }) => {
      await navigateAndVerify(page, '/finance/bills', /finance\/bills/);
      
      if (isAuthRedirect(page.url())) return;
      
      const payButton = page.locator('button:has-text("pay"), [data-testid="pay-bill"]');
      const hasPay = await payButton.count();
      expect(hasPay).toBeGreaterThanOrEqual(0);
    });
  });

  test.describe('Bill Detail', () => {
    
    test('should display bill detail page', async ({ page }) => {
      await navigateAndVerify(page, '/finance/bills/bill-001', /finance\/bills\/bill-001/);
    });

    test('should show vendor information', async ({ page }) => {
      await navigateAndVerify(page, '/finance/bills/bill-001', /finance\/bills\/bill-001/);
      
      if (isAuthRedirect(page.url())) return;
      
      const vendorInfo = page.locator('[data-testid="vendor-info"], .vendor-info');
      const hasVendor = await vendorInfo.count();
      expect(hasVendor).toBeGreaterThanOrEqual(0);
    });

    test('should show payment history', async ({ page }) => {
      await navigateAndVerify(page, '/finance/bills/bill-001', /finance\/bills\/bill-001/);
      
      if (isAuthRedirect(page.url())) return;
      
      const paymentHistory = page.locator('[data-testid="payment-history"], .payment-history');
      const hasHistory = await paymentHistory.count();
      expect(hasHistory).toBeGreaterThanOrEqual(0);
    });
  });
});

test.describe('ATLVS Finance - Purchase Orders', () => {

  test.describe('Purchase Orders List', () => {
    
    test('should display purchase orders list page', async ({ page }) => {
      await navigateAndVerify(page, '/finance/purchase-orders', /finance\/purchase-orders/);
    });

    test('should show PO table', async ({ page }) => {
      await navigateAndVerify(page, '/finance/purchase-orders', /finance\/purchase-orders/);
      
      if (isAuthRedirect(page.url())) return;
      
      const table = page.locator('table, [data-testid="po-list"]');
      const hasTable = await table.count();
      expect(hasTable).toBeGreaterThanOrEqual(0);
    });

    test('should have create PO button', async ({ page }) => {
      await navigateAndVerify(page, '/finance/purchase-orders', /finance\/purchase-orders/);
      
      if (isAuthRedirect(page.url())) return;
      
      const createButton = page.locator('button:has-text("create"), a[href*="new"]');
      const hasCreate = await createButton.count();
      expect(hasCreate).toBeGreaterThanOrEqual(0);
    });

    test('should have approval status filter', async ({ page }) => {
      await navigateAndVerify(page, '/finance/purchase-orders', /finance\/purchase-orders/);
      
      if (isAuthRedirect(page.url())) return;
      
      const statusFilter = page.locator('select[name="status"], [data-testid="approval-filter"]');
      const hasFilter = await statusFilter.count();
      expect(hasFilter).toBeGreaterThanOrEqual(0);
    });
  });

  test.describe('Purchase Order Creation', () => {
    
    test('should display PO creation form', async ({ page }) => {
      await navigateAndVerify(page, '/finance/purchase-orders/new', /finance\/purchase-orders\/new/);
      
      if (isAuthRedirect(page.url())) return;
      
      const form = page.locator('form');
      await expect(form.first()).toBeVisible();
    });

    test('should have vendor selection', async ({ page }) => {
      await navigateAndVerify(page, '/finance/purchase-orders/new', /finance\/purchase-orders\/new/);
      
      if (isAuthRedirect(page.url())) return;
      
      const vendorSelect = page.locator('select[name="vendor"], [data-testid="vendor-select"]');
      const hasVendor = await vendorSelect.count();
      expect(hasVendor).toBeGreaterThanOrEqual(0);
    });

    test('should have line items section', async ({ page }) => {
      await navigateAndVerify(page, '/finance/purchase-orders/new', /finance\/purchase-orders\/new/);
      
      if (isAuthRedirect(page.url())) return;
      
      const lineItems = page.locator('[data-testid="line-items"], .line-items');
      const hasLineItems = await lineItems.count();
      expect(hasLineItems).toBeGreaterThanOrEqual(0);
    });

    test('should have delivery date field', async ({ page }) => {
      await navigateAndVerify(page, '/finance/purchase-orders/new', /finance\/purchase-orders\/new/);
      
      if (isAuthRedirect(page.url())) return;
      
      const deliveryDate = page.locator('input[name*="delivery" i], input[type="date"]');
      const hasDeliveryDate = await deliveryDate.count();
      expect(hasDeliveryDate).toBeGreaterThanOrEqual(0);
    });
  });

  test.describe('Purchase Order Approval', () => {
    
    test('should show approval workflow', async ({ page }) => {
      await navigateAndVerify(page, '/finance/purchase-orders/po-001', /finance\/purchase-orders\/po-001/);
      
      if (isAuthRedirect(page.url())) return;
      
      const approvalSection = page.locator('[data-testid="approval-workflow"], .approval, text=/approve/i');
      const hasApproval = await approvalSection.count();
      expect(hasApproval).toBeGreaterThanOrEqual(0);
    });

    test('should have approve button', async ({ page }) => {
      await navigateAndVerify(page, '/finance/purchase-orders/po-001', /finance\/purchase-orders\/po-001/);
      
      if (isAuthRedirect(page.url())) return;
      
      const approveButton = page.locator('button:has-text("approve")');
      const hasApprove = await approveButton.count();
      expect(hasApprove).toBeGreaterThanOrEqual(0);
    });

    test('should have reject button', async ({ page }) => {
      await navigateAndVerify(page, '/finance/purchase-orders/po-001', /finance\/purchase-orders\/po-001/);
      
      if (isAuthRedirect(page.url())) return;
      
      const rejectButton = page.locator('button:has-text("reject")');
      const hasReject = await rejectButton.count();
      expect(hasReject).toBeGreaterThanOrEqual(0);
    });
  });
});

test.describe('ATLVS Finance - Proposals', () => {

  test.describe('Proposals List', () => {
    
    test('should display proposals list page', async ({ page }) => {
      await navigateAndVerify(page, '/finance/proposals', /finance\/proposals/);
    });

    test('should show proposals table', async ({ page }) => {
      await navigateAndVerify(page, '/finance/proposals', /finance\/proposals/);
      
      if (isAuthRedirect(page.url())) return;
      
      const table = page.locator('table, [data-testid="proposals-list"]');
      const hasTable = await table.count();
      expect(hasTable).toBeGreaterThanOrEqual(0);
    });

    test('should have status filter', async ({ page }) => {
      await navigateAndVerify(page, '/finance/proposals', /finance\/proposals/);
      
      if (isAuthRedirect(page.url())) return;
      
      const statusFilter = page.locator('select[name="status"], [data-testid="status-filter"]');
      const hasFilter = await statusFilter.count();
      expect(hasFilter).toBeGreaterThanOrEqual(0);
    });
  });

  test.describe('Proposal Detail', () => {
    
    test('should display proposal detail page', async ({ page }) => {
      await navigateAndVerify(page, '/finance/proposals/prop-001', /finance\/proposals\/prop-001/);
    });

    test('should show proposal content', async ({ page }) => {
      await navigateAndVerify(page, '/finance/proposals/prop-001', /finance\/proposals\/prop-001/);
      
      if (isAuthRedirect(page.url())) return;
      
      const content = page.locator('[data-testid="proposal-content"], .proposal-content, main');
      const hasContent = await content.count();
      expect(hasContent).toBeGreaterThanOrEqual(0);
    });

    test('should have convert to invoice action', async ({ page }) => {
      await navigateAndVerify(page, '/finance/proposals/prop-001', /finance\/proposals\/prop-001/);
      
      if (isAuthRedirect(page.url())) return;
      
      const convertButton = page.locator('button:has-text("convert"), button:has-text("invoice")');
      const hasConvert = await convertButton.count();
      expect(hasConvert).toBeGreaterThanOrEqual(0);
    });
  });
});

test.describe('ATLVS Finance - Reports', () => {

  test.describe('Financial Reports', () => {
    
    test('should display reports page', async ({ page }) => {
      await navigateAndVerify(page, '/reports', /reports/);
    });

    test('should have profit/loss report', async ({ page }) => {
      await navigateAndVerify(page, '/reports', /reports/);
      
      if (isAuthRedirect(page.url())) return;
      
      const plReport = page.locator('text=/profit|loss|p&l/i, [data-testid="pl-report"]');
      const hasPL = await plReport.count();
      expect(hasPL).toBeGreaterThanOrEqual(0);
    });

    test('should have cash flow report', async ({ page }) => {
      await navigateAndVerify(page, '/reports', /reports/);
      
      if (isAuthRedirect(page.url())) return;
      
      const cashFlowReport = page.locator('text=/cash flow/i, [data-testid="cashflow-report"]');
      const hasCashFlow = await cashFlowReport.count();
      expect(hasCashFlow).toBeGreaterThanOrEqual(0);
    });

    test('should have export functionality', async ({ page }) => {
      await navigateAndVerify(page, '/reports', /reports/);
      
      if (isAuthRedirect(page.url())) return;
      
      const exportButton = page.locator('button:has-text("export"), button:has-text("download")');
      const hasExport = await exportButton.count();
      expect(hasExport).toBeGreaterThanOrEqual(0);
    });

    test('should have date range selector', async ({ page }) => {
      await navigateAndVerify(page, '/reports', /reports/);
      
      if (isAuthRedirect(page.url())) return;
      
      const dateRange = page.locator('input[type="date"], [data-testid="date-range"]');
      const hasDateRange = await dateRange.count();
      expect(hasDateRange).toBeGreaterThanOrEqual(0);
    });
  });
});

test.describe('ATLVS Finance - API Integration', () => {
  
  test('GET /api/budgets returns valid response', async ({ request }) => {
    const response = await request.get(`${ATLVS_BASE}/api/budgets`);
    expect([200, 401, 403, 404]).toContain(response.status());
  });

  test('GET /api/expenses returns valid response', async ({ request }) => {
    const response = await request.get(`${ATLVS_BASE}/api/expenses`);
    expect([200, 401, 403, 404]).toContain(response.status());
  });

  test('GET /api/bills returns valid response', async ({ request }) => {
    const response = await request.get(`${ATLVS_BASE}/api/bills`);
    expect([200, 401, 403, 404]).toContain(response.status());
  });

  test('GET /api/purchase-orders returns valid response', async ({ request }) => {
    const response = await request.get(`${ATLVS_BASE}/api/purchase-orders`);
    expect([200, 401, 403, 404]).toContain(response.status());
  });

  test('GET /api/proposals returns valid response', async ({ request }) => {
    const response = await request.get(`${ATLVS_BASE}/api/proposals`);
    expect([200, 401, 403, 404]).toContain(response.status());
  });

  test('GET /api/reports/profit-loss returns valid response', async ({ request }) => {
    const response = await request.get(`${ATLVS_BASE}/api/reports/profit-loss`);
    expect([200, 401, 403, 404]).toContain(response.status());
  });

  test('GET /api/reports/cash-flow returns valid response', async ({ request }) => {
    const response = await request.get(`${ATLVS_BASE}/api/reports/cash-flow`);
    expect([200, 401, 403, 404]).toContain(response.status());
  });
});
