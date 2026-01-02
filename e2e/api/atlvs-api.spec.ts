import { test, expect } from '@playwright/test';

/**
 * API Route Verification: ATLVS
 * Comprehensive tests for all workflow-related API routes
 * Covers all 31 ATLVS workflows
 * 
 * These tests verify that API endpoints exist and respond appropriately.
 * For unauthenticated requests, we expect either:
 * - 200: Success (public endpoint or auth not required)
 * - 401: Unauthorized (auth required - correct behavior)
 * - 403: Forbidden (auth required with different permissions)
 * 
 * We explicitly DO NOT accept:
 * - 400: Bad Request (indicates malformed test, not endpoint existence)
 * - 404: Not Found (indicates endpoint doesn't exist - test failure)
 * - 500: Server Error (indicates bug - test failure)
 */
test.describe('ATLVS API Routes', () => {
  const baseUrl = 'http://localhost:3001';
  
  // Strict valid statuses - endpoint exists and responds correctly
  const VALID_ENDPOINT_STATUSES = [200, 201, 204, 401, 403];
  
  // Helper for explicit status assertion with clear error message
  function assertValidEndpoint(status: number, endpoint: string) {
    expect(
      VALID_ENDPOINT_STATUSES,
      `Endpoint ${endpoint} returned ${status}. Expected 200/201/204 (success) or 401/403 (auth required). Got ${status === 404 ? '404 - endpoint does not exist' : status === 500 ? '500 - server error' : status}`
    ).toContain(status);
  }

  test.describe('WF-ATLVS-001: Production Creation APIs', () => {
    test('GET /api/projects', async ({ request }) => {
      const response = await request.get(`${baseUrl}/api/projects`);
      assertValidEndpoint(response.status(), response.url());
    });

    test('GET /api/productions', async ({ request }) => {
      const response = await request.get(`${baseUrl}/api/productions`);
      assertValidEndpoint(response.status(), response.url());
    });
  });

  test.describe('WF-ATLVS-002: Budget Management APIs', () => {
    test('GET /api/budgets', async ({ request }) => {
      const response = await request.get(`${baseUrl}/api/budgets`);
      assertValidEndpoint(response.status(), response.url());
    });

    test('GET /api/budget-variance', async ({ request }) => {
      const response = await request.get(`${baseUrl}/api/budget-variance`);
      assertValidEndpoint(response.status(), response.url());
    });
  });

  test.describe('WF-ATLVS-003: Vendor Management APIs', () => {
    test('GET /api/vendors', async ({ request }) => {
      const response = await request.get(`${baseUrl}/api/vendors`);
      assertValidEndpoint(response.status(), response.url());
    });

    test('GET /api/vendor-onboarding', async ({ request }) => {
      const response = await request.get(`${baseUrl}/api/vendor-onboarding`);
      assertValidEndpoint(response.status(), response.url());
    });

    test('GET /api/vendor-scorecards', async ({ request }) => {
      const response = await request.get(`${baseUrl}/api/vendor-scorecards`);
      assertValidEndpoint(response.status(), response.url());
    });

    test('GET /api/vendor-portal', async ({ request }) => {
      const response = await request.get(`${baseUrl}/api/vendor-portal`);
      assertValidEndpoint(response.status(), response.url());
    });
  });

  test.describe('WF-ATLVS-004: Sponsor Acquisition APIs', () => {
    test('GET /api/sponsors', async ({ request }) => {
      const response = await request.get(`${baseUrl}/api/sponsors`);
      assertValidEndpoint(response.status(), response.url());
    });

    test('GET /api/opportunities', async ({ request }) => {
      const response = await request.get(`${baseUrl}/api/opportunities`);
      assertValidEndpoint(response.status(), response.url());
    });
  });

  test.describe('WF-ATLVS-005: Investor Relations APIs', () => {
    test('GET /api/investors', async ({ request }) => {
      const response = await request.get(`${baseUrl}/api/investors`);
      assertValidEndpoint(response.status(), response.url());
    });
  });

  test.describe('WF-ATLVS-006: Venue Setup APIs', () => {
    test('GET /api/venues', async ({ request }) => {
      const response = await request.get(`${baseUrl}/api/venues`);
      assertValidEndpoint(response.status(), response.url());
    });

    test('GET /api/venue-booking', async ({ request }) => {
      const response = await request.get(`${baseUrl}/api/venue-booking`);
      assertValidEndpoint(response.status(), response.url());
    });
  });

  test.describe('WF-ATLVS-007: Asset Inventory APIs', () => {
    test('GET /api/assets', async ({ request }) => {
      const response = await request.get(`${baseUrl}/api/assets`);
      assertValidEndpoint(response.status(), response.url());
    });

    test('GET /api/asset-analytics', async ({ request }) => {
      const response = await request.get(`${baseUrl}/api/asset-analytics`);
      assertValidEndpoint(response.status(), response.url());
    });

    test('GET /api/asset-insurance', async ({ request }) => {
      const response = await request.get(`${baseUrl}/api/asset-insurance`);
      assertValidEndpoint(response.status(), response.url());
    });

    test('GET /api/rental-equipment', async ({ request }) => {
      const response = await request.get(`${baseUrl}/api/rental-equipment`);
      assertValidEndpoint(response.status(), response.url());
    });
  });

  test.describe('WF-ATLVS-008: Contract Lifecycle APIs', () => {
    test('GET /api/contracts', async ({ request }) => {
      const response = await request.get(`${baseUrl}/api/contracts`);
      assertValidEndpoint(response.status(), response.url());
    });
  });

  test.describe('WF-ATLVS-009: Compliance Management APIs', () => {
    test('GET /api/compliance', async ({ request }) => {
      const response = await request.get(`${baseUrl}/api/compliance`);
      assertValidEndpoint(response.status(), response.url());
    });
  });

  test.describe('WF-ATLVS-010: Expense Management APIs', () => {
    test('GET /api/expenses', async ({ request }) => {
      const response = await request.get(`${baseUrl}/api/expenses`);
      assertValidEndpoint(response.status(), response.url());
    });
  });

  test.describe('WF-ATLVS-011: Invoice Processing APIs', () => {
    test('GET /api/invoices', async ({ request }) => {
      const response = await request.get(`${baseUrl}/api/invoices`);
      assertValidEndpoint(response.status(), response.url());
    });

    test('GET /api/accounts-receivable', async ({ request }) => {
      const response = await request.get(`${baseUrl}/api/accounts-receivable`);
      assertValidEndpoint(response.status(), response.url());
    });
  });

  test.describe('WF-ATLVS-012: Permit Management APIs', () => {
    test('GET /api/permits', async ({ request }) => {
      const response = await request.get(`${baseUrl}/api/permits`);
      assertValidEndpoint(response.status(), response.url());
    });
  });

  test.describe('WF-ATLVS-013: Insurance Management APIs', () => {
    test('GET /api/insurance', async ({ request }) => {
      const response = await request.get(`${baseUrl}/api/insurance`);
      assertValidEndpoint(response.status(), response.url());
    });
  });

  test.describe('WF-ATLVS-014: Procurement APIs', () => {
    test('GET /api/purchase-orders', async ({ request }) => {
      const response = await request.get(`${baseUrl}/api/purchase-orders`);
      assertValidEndpoint(response.status(), response.url());
    });

    test('GET /api/quotes', async ({ request }) => {
      const response = await request.get(`${baseUrl}/api/quotes`);
      assertValidEndpoint(response.status(), response.url());
    });
  });

  test.describe('WF-ATLVS-015: RFP Management APIs', () => {
    test('GET /api/rfp', async ({ request }) => {
      const response = await request.get(`${baseUrl}/api/rfp`);
      assertValidEndpoint(response.status(), response.url());
    });
  });

  test.describe('WF-ATLVS-016: Advancing APIs', () => {
    test('GET /api/advances', async ({ request }) => {
      const response = await request.get(`${baseUrl}/api/advances`);
      assertValidEndpoint(response.status(), response.url());
    });
  });

  test.describe('WF-ATLVS-017: Workforce Management APIs', () => {
    test('GET /api/employees', async ({ request }) => {
      const response = await request.get(`${baseUrl}/api/employees`);
      assertValidEndpoint(response.status(), response.url());
    });

    test('GET /api/timesheets', async ({ request }) => {
      const response = await request.get(`${baseUrl}/api/timesheets`);
      assertValidEndpoint(response.status(), response.url());
    });

    test('GET /api/skills-matrix', async ({ request }) => {
      const response = await request.get(`${baseUrl}/api/skills-matrix`);
      assertValidEndpoint(response.status(), response.url());
    });

    test('GET /api/commissions', async ({ request }) => {
      const response = await request.get(`${baseUrl}/api/commissions`);
      assertValidEndpoint(response.status(), response.url());
    });
  });

  test.describe('WF-ATLVS-018: CRM APIs', () => {
    test('GET /api/contacts', async ({ request }) => {
      const response = await request.get(`${baseUrl}/api/contacts`);
      assertValidEndpoint(response.status(), response.url());
    });

    test('GET /api/deals', async ({ request }) => {
      const response = await request.get(`${baseUrl}/api/deals`);
      assertValidEndpoint(response.status(), response.url());
    });

    test('GET /api/calendar-integration', async ({ request }) => {
      const response = await request.get(`${baseUrl}/api/calendar-integration`);
      assertValidEndpoint(response.status(), response.url());
    });
  });

  test.describe('WF-ATLVS-019: Analytics APIs', () => {
    test('GET /api/analytics', async ({ request }) => {
      const response = await request.get(`${baseUrl}/api/analytics`);
      assertValidEndpoint(response.status(), response.url());
    });

    test('GET /api/metrics', async ({ request }) => {
      const response = await request.get(`${baseUrl}/api/metrics`);
      assertValidEndpoint(response.status(), response.url());
    });

    test('GET /api/churn-analysis', async ({ request }) => {
      const response = await request.get(`${baseUrl}/api/churn-analysis`);
      assertValidEndpoint(response.status(), response.url());
    });

    test('GET /api/anomaly-detection', async ({ request }) => {
      const response = await request.get(`${baseUrl}/api/anomaly-detection`);
      assertValidEndpoint(response.status(), response.url());
    });
  });

  test.describe('WF-ATLVS-020: API & Integration APIs', () => {
    test('GET /api/data-export', async ({ request }) => {
      const response = await request.get(`${baseUrl}/api/data-export`);
      assertValidEndpoint(response.status(), response.url());
    });

    test('GET /api/data-warehouse/connections', async ({ request }) => {
      const response = await request.get(`${baseUrl}/api/data-warehouse/connections`);
      assertValidEndpoint(response.status(), response.url());
    });

    test('GET /api/data-warehouse/pipelines', async ({ request }) => {
      const response = await request.get(`${baseUrl}/api/data-warehouse/pipelines`);
      assertValidEndpoint(response.status(), response.url());
    });

    test('GET /api/data-warehouse/exports', async ({ request }) => {
      const response = await request.get(`${baseUrl}/api/data-warehouse/exports`);
      assertValidEndpoint(response.status(), response.url());
    });
  });

  test.describe('WF-ATLVS-021: Task Management APIs', () => {
    test('GET /api/task-management', async ({ request }) => {
      const response = await request.get(`${baseUrl}/api/task-management`);
      assertValidEndpoint(response.status(), response.url());
    });
  });

  test.describe('Cross-Platform Sync APIs', () => {
    test('GET /api/cross-platform/gvteway-sync', async ({ request }) => {
      const response = await request.get(`${baseUrl}/api/cross-platform/gvteway-sync`);
      assertValidEndpoint(response.status(), response.url());
    });

    test('GET /api/cross-platform/compvss-sync', async ({ request }) => {
      const response = await request.get(`${baseUrl}/api/cross-platform/compvss-sync`);
      assertValidEndpoint(response.status(), response.url());
    });
  });

  test.describe('Finance APIs', () => {
    test('GET /api/payment-processing', async ({ request }) => {
      const response = await request.get(`${baseUrl}/api/payment-processing`);
      assertValidEndpoint(response.status(), response.url());
    });

    test('GET /api/currencies', async ({ request }) => {
      const response = await request.get(`${baseUrl}/api/currencies`);
      assertValidEndpoint(response.status(), response.url());
    });

    test('GET /api/ledger-accounts', async ({ request }) => {
      const response = await request.get(`${baseUrl}/api/ledger-accounts`);
      assertValidEndpoint(response.status(), response.url());
    });

    test('GET /api/credit-card-reconciliation', async ({ request }) => {
      const response = await request.get(`${baseUrl}/api/credit-card-reconciliation`);
      assertValidEndpoint(response.status(), response.url());
    });

    test('GET /api/retainers', async ({ request }) => {
      const response = await request.get(`${baseUrl}/api/retainers`);
      assertValidEndpoint(response.status(), response.url());
    });

    test('GET /api/grants', async ({ request }) => {
      const response = await request.get(`${baseUrl}/api/grants`);
      assertValidEndpoint(response.status(), response.url());
    });
  });

  test.describe('Organization APIs', () => {
    test('GET /api/organizations', async ({ request }) => {
      const response = await request.get(`${baseUrl}/api/organizations`);
      assertValidEndpoint(response.status(), response.url());
    });
  });

  test.describe('Privacy APIs', () => {
    test('GET /api/privacy/consent', async ({ request }) => {
      const response = await request.get(`${baseUrl}/api/privacy/consent`);
      assertValidEndpoint(response.status(), response.url());
    });

    test('GET /api/privacy/dsr', async ({ request }) => {
      const response = await request.get(`${baseUrl}/api/privacy/dsr`);
      assertValidEndpoint(response.status(), response.url());
    });
  });

  test.describe('Enterprise APIs', () => {
    test('GET /api/enterprise/white-label', async ({ request }) => {
      const response = await request.get(`${baseUrl}/api/enterprise/white-label`);
      assertValidEndpoint(response.status(), response.url());
    });

    test('GET /api/enterprise/data-residency', async ({ request }) => {
      const response = await request.get(`${baseUrl}/api/enterprise/data-residency`);
      assertValidEndpoint(response.status(), response.url());
    });
  });

  test.describe('Strategic APIs', () => {
    test('GET /api/strategic-goals', async ({ request }) => {
      const response = await request.get(`${baseUrl}/api/strategic-goals`);
      assertValidEndpoint(response.status(), response.url());
    });
  });
});
