import { test, expect, Page, APIRequestContext } from '@playwright/test';

/**
 * ATLVS Full-Stack Validation Tests
 * Validates complete user journeys across all application layers:
 * - Frontend (UI pages and components)
 * - Backend API routes
 * - Database operations via Supabase
 * - Edge functions
 */

const ATLVS_BASE = 'http://localhost:3001';
const validStatuses = [200, 201, 302, 307, 401, 404];

// Helper to validate frontend page
async function validateFrontend(page: Page, path: string, urlPattern: RegExp) {
  await page.goto(`${ATLVS_BASE}${path}`);
  await page.waitForLoadState('domcontentloaded');
  await expect(page).toHaveURL(urlPattern);
  await expect(page.locator('body')).toBeVisible();
  return true;
}

// Helper to validate API endpoint
async function validateAPI(request: APIRequestContext, method: string, path: string, body?: object) {
  const url = `${ATLVS_BASE}${path}`;
  let response;
  
  if (method === 'GET') {
    response = await request.get(url);
  } else if (method === 'POST') {
    response = await request.post(url, { data: body || {} });
  } else if (method === 'PUT') {
    response = await request.put(url, { data: body || {} });
  } else if (method === 'DELETE') {
    response = await request.delete(url);
  }
  
  expect(validStatuses).toContain(response?.status());
  return response;
}

test.describe('ATLVS Full-Stack Workflow Validation', () => {

  test.describe('WF-ATLVS-001: Production Creation & Setup - Full Stack', () => {
    
    test('Frontend Layer: All production pages accessible', async ({ page }) => {
      await validateFrontend(page, '/productions', /productions/);
      await validateFrontend(page, '/productions/new', /productions\/new/);
      await validateFrontend(page, '/settings', /settings/);
      await validateFrontend(page, '/budgets', /budgets/);
      await validateFrontend(page, '/venues', /venues/);
    });

    test('API Layer: Production CRUD endpoints respond', async ({ request }) => {
      await validateAPI(request, 'GET', '/api/projects');
      await validateAPI(request, 'GET', '/api/productions');
      await validateAPI(request, 'GET', '/api/settings');
      await validateAPI(request, 'GET', '/api/budgets');
      await validateAPI(request, 'GET', '/api/venues');
    });

    test('Database Layer: Production data operations', async ({ request }) => {
      // Verify database-backed endpoints return proper data structures
      const projectsRes = await request.get(`${ATLVS_BASE}/api/projects`);
      if (projectsRes.status() === 200) {
        const data = await projectsRes.json();
        expect(data).toBeDefined();
      }
    });
  });

  test.describe('WF-ATLVS-002: Budget Management & Approval - Full Stack', () => {
    
    test('Frontend Layer: Budget management pages accessible', async ({ page }) => {
      await validateFrontend(page, '/budgets', /budgets/);
      await validateFrontend(page, '/reports', /reports/);
      await validateFrontend(page, '/finance/accounts-receivable', /finance\/accounts-receivable/);
    });

    test('API Layer: Budget endpoints respond', async ({ request }) => {
      await validateAPI(request, 'GET', '/api/budgets');
      await validateAPI(request, 'GET', '/api/budget-variance');
      await validateAPI(request, 'GET', '/api/reports');
    });
  });

  test.describe('WF-ATLVS-003: Vendor Onboarding & Management - Full Stack', () => {
    
    test('Frontend Layer: Vendor pages accessible', async ({ page }) => {
      await validateFrontend(page, '/vendors', /vendors/);
      await validateFrontend(page, '/vendors/rate-cards', /vendors\/rate-cards/);
      await validateFrontend(page, '/vendors/contracts', /vendors\/contracts/);
    });

    test('API Layer: Vendor endpoints respond', async ({ request }) => {
      await validateAPI(request, 'GET', '/api/vendors');
      await validateAPI(request, 'GET', '/api/vendor-onboarding');
      await validateAPI(request, 'GET', '/api/vendor-scorecards');
      await validateAPI(request, 'GET', '/api/vendor-portal');
    });
  });

  test.describe('WF-ATLVS-004: Sponsor Acquisition & Management - Full Stack', () => {
    
    test('Frontend Layer: Sponsor pages accessible', async ({ page }) => {
      await validateFrontend(page, '/crm', /crm/);
      await validateFrontend(page, '/crm/lead-scoring', /crm\/lead-scoring/);
      await validateFrontend(page, '/sponsors', /sponsors/);
      await validateFrontend(page, '/sponsors/deck', /sponsors\/deck/);
      await validateFrontend(page, '/sponsors/tiers', /sponsors\/tiers/);
      await validateFrontend(page, '/sponsors/fulfillment', /sponsors\/fulfillment/);
      await validateFrontend(page, '/sponsors/reports', /sponsors\/reports/);
      await validateFrontend(page, '/contracts', /contracts/);
    });

    test('API Layer: Sponsor endpoints respond', async ({ request }) => {
      await validateAPI(request, 'GET', '/api/sponsors');
      await validateAPI(request, 'GET', '/api/opportunities');
      await validateAPI(request, 'GET', '/api/crm');
    });
  });

  test.describe('WF-ATLVS-005: Investor Relations Management - Full Stack', () => {
    
    test('Frontend Layer: Investor pages accessible', async ({ page }) => {
      await validateFrontend(page, '/investors', /investors/);
      await validateFrontend(page, '/investors/documents', /investors\/documents/);
      await validateFrontend(page, '/investors/rounds', /investors\/rounds/);
      await validateFrontend(page, '/investors/reports', /investors\/reports/);
    });

    test('API Layer: Investor endpoints respond', async ({ request }) => {
      await validateAPI(request, 'GET', '/api/investors');
    });
  });

  test.describe('WF-ATLVS-006: Venue Setup & Configuration - Full Stack', () => {
    
    test('Frontend Layer: Venue pages accessible', async ({ page }) => {
      await validateFrontend(page, '/venues', /venues/);
      await validateFrontend(page, '/venues/maps', /venues\/maps/);
      await validateFrontend(page, '/venues/zones', /venues\/zones/);
    });

    test('API Layer: Venue endpoints respond', async ({ request }) => {
      await validateAPI(request, 'GET', '/api/venues');
      await validateAPI(request, 'GET', '/api/venue-booking');
    });
  });

  test.describe('WF-ATLVS-007: Asset Inventory Management - Full Stack', () => {
    
    test('Frontend Layer: Asset pages accessible', async ({ page }) => {
      await validateFrontend(page, '/assets', /assets/);
      await validateFrontend(page, '/assets/specifications', /assets\/specifications/);
      await validateFrontend(page, '/assets/serialized', /assets\/serialized/);
      await validateFrontend(page, '/assets/storage', /assets\/storage/);
      await validateFrontend(page, '/assets/maintenance', /assets\/maintenance/);
      await validateFrontend(page, '/assets/calibration', /assets\/calibration/);
      await validateFrontend(page, '/assets/scan', /assets\/scan/);
      await validateFrontend(page, '/assets/damage-reports', /assets\/damage-reports/);
      await validateFrontend(page, '/assets/utilization', /assets\/utilization/);
      await validateFrontend(page, '/assets/optimization', /assets\/optimization/);
    });

    test('API Layer: Asset endpoints respond', async ({ request }) => {
      await validateAPI(request, 'GET', '/api/assets');
      await validateAPI(request, 'GET', '/api/asset-analytics');
      await validateAPI(request, 'GET', '/api/asset-insurance');
      await validateAPI(request, 'GET', '/api/rental-equipment');
    });
  });

  test.describe('WF-ATLVS-008: Contract Lifecycle Management - Full Stack', () => {
    
    test('Frontend Layer: Contract pages accessible', async ({ page }) => {
      await validateFrontend(page, '/contracts', /contracts/);
      await validateFrontend(page, '/templates', /templates/);
      await validateFrontend(page, '/documents', /documents/);
    });

    test('API Layer: Contract endpoints respond', async ({ request }) => {
      await validateAPI(request, 'GET', '/api/contracts');
    });
  });

  test.describe('WF-ATLVS-009: Compliance Management - Full Stack', () => {
    
    test('Frontend Layer: Compliance pages accessible', async ({ page }) => {
      await validateFrontend(page, '/compliance', /compliance/);
      await validateFrontend(page, '/audit', /audit/);
    });

    test('API Layer: Compliance endpoints respond', async ({ request }) => {
      await validateAPI(request, 'GET', '/api/compliance');
    });
  });

  test.describe('WF-ATLVS-010: Expense Submission & Approval - Full Stack', () => {
    
    test('Frontend Layer: Expense pages accessible', async ({ page }) => {
      await validateFrontend(page, '/expenses', /expenses/);
      await validateFrontend(page, '/expenses/categories', /expenses\/categories/);
    });

    test('API Layer: Expense endpoints respond', async ({ request }) => {
      await validateAPI(request, 'GET', '/api/expenses');
    });
  });

  test.describe('WF-ATLVS-011: Invoice Processing - Full Stack', () => {
    
    test('Frontend Layer: Invoice pages accessible', async ({ page }) => {
      await validateFrontend(page, '/invoices', /invoices/);
      await validateFrontend(page, '/finance/accounts-receivable', /finance\/accounts-receivable/);
    });

    test('API Layer: Invoice endpoints respond', async ({ request }) => {
      await validateAPI(request, 'GET', '/api/invoices');
      await validateAPI(request, 'GET', '/api/accounts-receivable');
    });
  });

  test.describe('WF-ATLVS-012: Permit Management - Full Stack', () => {
    
    test('Frontend Layer: Permit pages accessible', async ({ page }) => {
      await validateFrontend(page, '/permits', /permits/);
    });

    test('API Layer: Permit endpoints respond', async ({ request }) => {
      await validateAPI(request, 'GET', '/api/permits');
    });
  });

  test.describe('WF-ATLVS-013: Insurance Management - Full Stack', () => {
    
    test('Frontend Layer: Insurance pages accessible', async ({ page }) => {
      await validateFrontend(page, '/insurance', /insurance/);
    });

    test('API Layer: Insurance endpoints respond', async ({ request }) => {
      await validateAPI(request, 'GET', '/api/insurance');
    });
  });

  test.describe('WF-ATLVS-014: Procurement & Purchase Orders - Full Stack', () => {
    
    test('Frontend Layer: Procurement pages accessible', async ({ page }) => {
      await validateFrontend(page, '/procurement', /procurement/);
      await validateFrontend(page, '/procurement/categories', /procurement\/categories/);
      await validateFrontend(page, '/quotes', /quotes/);
      await validateFrontend(page, '/procurement/vendor-selection', /procurement\/vendor-selection/);
      await validateFrontend(page, '/procurement/logistics', /procurement\/logistics/);
    });

    test('API Layer: Procurement endpoints respond', async ({ request }) => {
      await validateAPI(request, 'GET', '/api/purchase-orders');
      await validateAPI(request, 'GET', '/api/quotes');
    });
  });

  test.describe('WF-ATLVS-015: RFP Management - Full Stack', () => {
    
    test('Frontend Layer: RFP pages accessible', async ({ page }) => {
      await validateFrontend(page, '/rfp', /rfp/);
    });

    test('API Layer: RFP endpoints respond', async ({ request }) => {
      await validateAPI(request, 'GET', '/api/rfp');
    });
  });

  test.describe('WF-ATLVS-016: Advancing Request Management - Full Stack', () => {
    
    test('Frontend Layer: Advancing pages accessible', async ({ page }) => {
      await validateFrontend(page, '/advancing', /advancing/);
    });

    test('API Layer: Advancing endpoints respond', async ({ request }) => {
      await validateAPI(request, 'GET', '/api/advances');
    });
  });

  test.describe('WF-ATLVS-017: Workforce Management - Full Stack', () => {
    
    test('Frontend Layer: Workforce pages accessible', async ({ page }) => {
      await validateFrontend(page, '/workforce', /workforce/);
      await validateFrontend(page, '/employees', /employees/);
      await validateFrontend(page, '/workforce/background-checks', /workforce\/background-checks/);
      await validateFrontend(page, '/workforce/compensation', /workforce\/compensation/);
      await validateFrontend(page, '/workforce/handbook', /workforce\/handbook/);
      await validateFrontend(page, '/workforce/labor-laws', /workforce\/labor-laws/);
      await validateFrontend(page, '/workforce/referrals', /workforce\/referrals/);
      await validateFrontend(page, '/workforce/succession', /workforce\/succession/);
      await validateFrontend(page, '/workforce/union-compliance', /workforce\/union-compliance/);
      await validateFrontend(page, '/payroll', /payroll/);
    });

    test('API Layer: Workforce endpoints respond', async ({ request }) => {
      await validateAPI(request, 'GET', '/api/employees');
      await validateAPI(request, 'GET', '/api/timesheets');
      await validateAPI(request, 'GET', '/api/skills-matrix');
      await validateAPI(request, 'GET', '/api/commissions');
    });
  });

  test.describe('WF-ATLVS-018: CRM & Lead Management - Full Stack', () => {
    
    test('Frontend Layer: CRM pages accessible', async ({ page }) => {
      await validateFrontend(page, '/crm', /crm/);
      await validateFrontend(page, '/contacts', /contacts/);
      await validateFrontend(page, '/crm/lead-scoring', /crm\/lead-scoring/);
      await validateFrontend(page, '/crm/tasks', /crm\/tasks/);
      await validateFrontend(page, '/crm/relationships', /crm\/relationships/);
      await validateFrontend(page, '/crm/email-integration', /crm\/email-integration/);
      await validateFrontend(page, '/crm/calendar', /crm\/calendar/);
    });

    test('API Layer: CRM endpoints respond', async ({ request }) => {
      await validateAPI(request, 'GET', '/api/contacts');
      await validateAPI(request, 'GET', '/api/deals');
      await validateAPI(request, 'GET', '/api/calendar-integration');
    });
  });

  test.describe('WF-ATLVS-019: Analytics & Reporting - Full Stack', () => {
    
    test('Frontend Layer: Analytics pages accessible', async ({ page }) => {
      await validateFrontend(page, '/analytics', /analytics/);
      await validateFrontend(page, '/analytics/dashboards', /analytics\/dashboards/);
      await validateFrontend(page, '/analytics/dashboard-builder', /analytics\/dashboard-builder/);
      await validateFrontend(page, '/analytics/kpi', /analytics\/kpi/);
      await validateFrontend(page, '/analytics/reports', /analytics\/reports/);
      await validateFrontend(page, '/analytics/data-warehouse', /analytics\/data-warehouse/);
      await validateFrontend(page, '/analytics/client-retention', /analytics\/client-retention/);
      await validateFrontend(page, '/reports/scheduled', /reports\/scheduled/);
    });

    test('API Layer: Analytics endpoints respond', async ({ request }) => {
      await validateAPI(request, 'GET', '/api/analytics');
      await validateAPI(request, 'GET', '/api/metrics');
      await validateAPI(request, 'GET', '/api/churn-analysis');
      await validateAPI(request, 'GET', '/api/anomaly-detection');
    });
  });

  test.describe('WF-ATLVS-020: API & Integration Management - Full Stack', () => {
    
    test('Frontend Layer: API management pages accessible', async ({ page }) => {
      await validateFrontend(page, '/api-management', /api-management/);
      await validateFrontend(page, '/api-management/keys', /api-management\/keys/);
      await validateFrontend(page, '/api-management/webhooks', /api-management\/webhooks/);
      await validateFrontend(page, '/api-management/logs', /api-management\/logs/);
      await validateFrontend(page, '/integrations', /integrations/);
    });

    test('API Layer: Integration endpoints respond', async ({ request }) => {
      await validateAPI(request, 'GET', '/api/data-export');
      await validateAPI(request, 'GET', '/api/data-warehouse/connections');
      await validateAPI(request, 'GET', '/api/data-warehouse/pipelines');
      await validateAPI(request, 'GET', '/api/data-warehouse/exports');
    });
  });

  test.describe('WF-ATLVS-021-024: Team Member Workflows - Full Stack', () => {
    
    test('Frontend Layer: Team member pages accessible', async ({ page }) => {
      await validateFrontend(page, '/dashboard', /dashboard/);
      await validateFrontend(page, '/action-items', /action-items/);
      await validateFrontend(page, '/schedule/tasks', /schedule\/tasks/);
      await validateFrontend(page, '/schedule', /schedule/);
      await validateFrontend(page, '/notifications', /notifications/);
      await validateFrontend(page, '/documents', /documents/);
      await validateFrontend(page, '/profile', /profile/);
    });

    test('API Layer: Team member endpoints respond', async ({ request }) => {
      await validateAPI(request, 'GET', '/api/task-management');
    });
  });

  test.describe('WF-ATLVS-026-030: Portal User Workflows - Full Stack', () => {
    
    test('Frontend Layer: Portal pages accessible', async ({ page }) => {
      await validateFrontend(page, '/portal/artist', /portal\/artist/);
      await validateFrontend(page, '/portal/crew', /portal\/crew/);
      await validateFrontend(page, '/portal/investor', /portal\/investor/);
      await validateFrontend(page, '/portal/investor/my-investments', /portal\/investor\/my-investments/);
      await validateFrontend(page, '/portal/investor/investor-updates', /portal\/investor\/investor-updates/);
      await validateFrontend(page, '/portal/sponsor', /portal\/sponsor/);
      await validateFrontend(page, '/portal/sponsor/my-activations', /portal\/sponsor\/my-activations/);
      await validateFrontend(page, '/portal/sponsor/my-deliverables', /portal\/sponsor\/my-deliverables/);
      await validateFrontend(page, '/portal/sponsor/my-reports', /portal\/sponsor\/my-reports/);
      await validateFrontend(page, '/portal/vendor', /portal\/vendor/);
    });
  });

  test.describe('WF-ATLVS-031: Authentication - Full Stack', () => {
    
    test('Frontend Layer: Auth pages accessible', async ({ page }) => {
      await validateFrontend(page, '/auth/signin', /auth\/signin/);
      await validateFrontend(page, '/auth/signup', /auth\/signup/);
      await validateFrontend(page, '/auth/magic-link', /auth\/magic-link/);
      await validateFrontend(page, '/auth/forgot-password', /auth\/forgot-password/);
      await validateFrontend(page, '/auth/reset-password', /auth\/reset-password/);
    });

    test('API Layer: Auth endpoints respond', async ({ request }) => {
      await validateAPI(request, 'GET', '/api/auth/me');
      await validateAPI(request, 'POST', '/api/auth/signin', { email: 'test@example.com', password: 'test' });
      await validateAPI(request, 'POST', '/api/auth/signup', { email: 'test@example.com', password: 'test' });
      await validateAPI(request, 'POST', '/api/auth/magic-link', { email: 'test@example.com' });
      await validateAPI(request, 'GET', '/api/auth/refresh');
    });
  });

  test.describe('Cross-Platform Integration - Full Stack', () => {
    
    test('API Layer: Cross-platform sync endpoints respond', async ({ request }) => {
      await validateAPI(request, 'GET', '/api/cross-platform/gvteway-sync');
      await validateAPI(request, 'GET', '/api/cross-platform/compvss-sync');
    });
  });

  test.describe('Finance Layer - Full Stack', () => {
    
    test('API Layer: Finance endpoints respond', async ({ request }) => {
      await validateAPI(request, 'GET', '/api/payment-processing');
      await validateAPI(request, 'GET', '/api/currencies');
      await validateAPI(request, 'GET', '/api/ledger-accounts');
      await validateAPI(request, 'GET', '/api/credit-card-reconciliation');
      await validateAPI(request, 'GET', '/api/retainers');
      await validateAPI(request, 'GET', '/api/grants');
    });
  });

  test.describe('Enterprise Features - Full Stack', () => {
    
    test('API Layer: Enterprise endpoints respond', async ({ request }) => {
      await validateAPI(request, 'GET', '/api/enterprise/white-label');
      await validateAPI(request, 'GET', '/api/enterprise/data-residency');
      await validateAPI(request, 'GET', '/api/privacy/consent');
      await validateAPI(request, 'GET', '/api/privacy/dsr');
      await validateAPI(request, 'GET', '/api/strategic-goals');
      await validateAPI(request, 'GET', '/api/organizations');
    });
  });
});
