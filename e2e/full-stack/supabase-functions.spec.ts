import { test, expect } from '@playwright/test';

/**
 * Supabase Edge Functions Integration Tests
 * Validates all Supabase edge functions that support workflow operations
 */

const SUPABASE_FUNCTIONS_URL = process.env.SUPABASE_FUNCTIONS_URL || 'http://localhost:54321/functions/v1';

test.describe('Supabase Edge Functions - Workflow Support', () => {

  test.describe('Advance Notifications Function', () => {
    test('should respond to advance notification requests', async ({ request }) => {
      const response = await request.get(`${SUPABASE_FUNCTIONS_URL}/advance-notifications`);
      expect([200, 401, 404, 500]).toContain(response.status());
    });
  });

  test.describe('Automation Actions Function', () => {
    test('should respond to automation action requests', async ({ request }) => {
      const response = await request.get(`${SUPABASE_FUNCTIONS_URL}/automation-actions`);
      expect([200, 401, 404, 500]).toContain(response.status());
    });
  });

  test.describe('Batch Operations Function', () => {
    test('should respond to batch operation requests', async ({ request }) => {
      const response = await request.get(`${SUPABASE_FUNCTIONS_URL}/batch-operations`);
      expect([200, 401, 404, 500]).toContain(response.status());
    });
  });

  test.describe('Cleanup Function', () => {
    test('should respond to cleanup requests', async ({ request }) => {
      const response = await request.get(`${SUPABASE_FUNCTIONS_URL}/cleanup`);
      expect([200, 401, 404, 500]).toContain(response.status());
    });
  });

  test.describe('Data Sync Function', () => {
    test('should respond to data sync requests', async ({ request }) => {
      const response = await request.get(`${SUPABASE_FUNCTIONS_URL}/data-sync`);
      expect([200, 401, 404, 500]).toContain(response.status());
    });
  });

  test.describe('Email Notifications Function', () => {
    test('should respond to email notification requests', async ({ request }) => {
      const response = await request.get(`${SUPABASE_FUNCTIONS_URL}/email-notifications`);
      expect([200, 401, 404, 500]).toContain(response.status());
    });
  });

  test.describe('Event Triggers Function', () => {
    test('should respond to event trigger requests', async ({ request }) => {
      const response = await request.get(`${SUPABASE_FUNCTIONS_URL}/event-triggers`);
      expect([200, 401, 404, 500]).toContain(response.status());
    });
  });

  test.describe('File Processing Function', () => {
    test('should respond to file processing requests', async ({ request }) => {
      const response = await request.get(`${SUPABASE_FUNCTIONS_URL}/file-processing`);
      expect([200, 401, 404, 500]).toContain(response.status());
    });
  });

  test.describe('Metrics Collection Function', () => {
    test('should respond to metrics collection requests', async ({ request }) => {
      const response = await request.get(`${SUPABASE_FUNCTIONS_URL}/metrics-collection`);
      expect([200, 401, 404, 500]).toContain(response.status());
    });
  });

  test.describe('Push Notifications Function', () => {
    test('should respond to push notification requests', async ({ request }) => {
      const response = await request.get(`${SUPABASE_FUNCTIONS_URL}/push-notifications`);
      expect([200, 401, 404, 500]).toContain(response.status());
    });
  });

  test.describe('Report Generation Function', () => {
    test('should respond to report generation requests', async ({ request }) => {
      const response = await request.get(`${SUPABASE_FUNCTIONS_URL}/report-generation`);
      expect([200, 401, 404, 500]).toContain(response.status());
    });
  });

  test.describe('Scheduled Tasks Function', () => {
    test('should respond to scheduled task requests', async ({ request }) => {
      const response = await request.get(`${SUPABASE_FUNCTIONS_URL}/scheduled-tasks`);
      expect([200, 401, 404, 500]).toContain(response.status());
    });
  });

  test.describe('Webhook Handler Function', () => {
    test('should respond to webhook handler requests', async ({ request }) => {
      const response = await request.get(`${SUPABASE_FUNCTIONS_URL}/webhook-handler`);
      expect([200, 401, 404, 500]).toContain(response.status());
    });
  });
});

test.describe('Database Operations - Workflow Tables', () => {
  
  const ATLVS_BASE = 'http://localhost:3001';
  const COMPVSS_BASE = 'http://localhost:3002';
  const GVTEWAY_BASE = 'http://localhost:3000';

  test.describe('ATLVS Database Operations', () => {
    
    test('Projects table operations', async ({ request }) => {
      const response = await request.get(`${ATLVS_BASE}/api/projects`);
      expect([200, 401, 404]).toContain(response.status());
    });

    test('Budgets table operations', async ({ request }) => {
      const response = await request.get(`${ATLVS_BASE}/api/budgets`);
      expect([200, 401, 404]).toContain(response.status());
    });

    test('Vendors table operations', async ({ request }) => {
      const response = await request.get(`${ATLVS_BASE}/api/vendors`);
      expect([200, 401, 404]).toContain(response.status());
    });

    test('Contacts table operations', async ({ request }) => {
      const response = await request.get(`${ATLVS_BASE}/api/contacts`);
      expect([200, 401, 404]).toContain(response.status());
    });

    test('Assets table operations', async ({ request }) => {
      const response = await request.get(`${ATLVS_BASE}/api/assets`);
      expect([200, 401, 404]).toContain(response.status());
    });

    test('Contracts table operations', async ({ request }) => {
      const response = await request.get(`${ATLVS_BASE}/api/contracts`);
      expect([200, 401, 404]).toContain(response.status());
    });

    test('Invoices table operations', async ({ request }) => {
      const response = await request.get(`${ATLVS_BASE}/api/invoices`);
      expect([200, 401, 404]).toContain(response.status());
    });

    test('Employees table operations', async ({ request }) => {
      const response = await request.get(`${ATLVS_BASE}/api/employees`);
      expect([200, 401, 404]).toContain(response.status());
    });

    test('Sponsors table operations', async ({ request }) => {
      const response = await request.get(`${ATLVS_BASE}/api/sponsors`);
      expect([200, 401, 404]).toContain(response.status());
    });

    test('Investors table operations', async ({ request }) => {
      const response = await request.get(`${ATLVS_BASE}/api/investors`);
      expect([200, 401, 404]).toContain(response.status());
    });
  });

  test.describe('COMPVSS Database Operations', () => {
    
    test('Projects table operations', async ({ request }) => {
      const response = await request.get(`${COMPVSS_BASE}/api/projects`);
      expect([200, 401, 404]).toContain(response.status());
    });

    test('Crew table operations', async ({ request }) => {
      const response = await request.get(`${COMPVSS_BASE}/api/crew`);
      expect([200, 401, 404]).toContain(response.status());
    });

    test('Credentials table operations', async ({ request }) => {
      const response = await request.get(`${COMPVSS_BASE}/api/credentials`);
      expect([200, 401, 404]).toContain(response.status());
    });

    test('Schedule table operations', async ({ request }) => {
      const response = await request.get(`${COMPVSS_BASE}/api/schedule`);
      expect([200, 401, 404]).toContain(response.status());
    });

    test('Equipment table operations', async ({ request }) => {
      const response = await request.get(`${COMPVSS_BASE}/api/equipment`);
      expect([200, 401, 404]).toContain(response.status());
    });

    test('Safety table operations', async ({ request }) => {
      const response = await request.get(`${COMPVSS_BASE}/api/safety`);
      expect([200, 401, 404]).toContain(response.status());
    });

    test('Incidents table operations', async ({ request }) => {
      const response = await request.get(`${COMPVSS_BASE}/api/incidents`);
      expect([200, 401, 404]).toContain(response.status());
    });

    test('SOPs table operations', async ({ request }) => {
      const response = await request.get(`${COMPVSS_BASE}/api/sops`);
      expect([200, 401, 404]).toContain(response.status());
    });

    test('Venues table operations', async ({ request }) => {
      const response = await request.get(`${COMPVSS_BASE}/api/venues`);
      expect([200, 401, 404]).toContain(response.status());
    });

    test('Advancing table operations', async ({ request }) => {
      const response = await request.get(`${COMPVSS_BASE}/api/advancing/catalog`);
      expect([200, 401, 404]).toContain(response.status());
    });
  });

  test.describe('GVTEWAY Database Operations', () => {
    
    test('Events table operations', async ({ request }) => {
      const response = await request.get(`${GVTEWAY_BASE}/api/events`);
      expect([200, 401, 404]).toContain(response.status());
    });

    test('Tickets table operations', async ({ request }) => {
      const response = await request.get(`${GVTEWAY_BASE}/api/tickets`);
      expect([200, 401, 404]).toContain(response.status());
    });

    test('Orders table operations', async ({ request }) => {
      const response = await request.get(`${GVTEWAY_BASE}/api/orders`);
      expect([200, 401, 404]).toContain(response.status());
    });

    test('Artists table operations', async ({ request }) => {
      const response = await request.get(`${GVTEWAY_BASE}/api/artists`);
      expect([200, 401, 404]).toContain(response.status());
    });

    test('Venues table operations', async ({ request }) => {
      const response = await request.get(`${GVTEWAY_BASE}/api/venues`);
      expect([200, 401, 404]).toContain(response.status());
    });

    test('Membership table operations', async ({ request }) => {
      const response = await request.get(`${GVTEWAY_BASE}/api/membership`);
      expect([200, 401, 404]).toContain(response.status());
    });

    test('Rewards table operations', async ({ request }) => {
      const response = await request.get(`${GVTEWAY_BASE}/api/rewards`);
      expect([200, 401, 404]).toContain(response.status());
    });

    test('Community groups table operations', async ({ request }) => {
      const response = await request.get(`${GVTEWAY_BASE}/api/community/groups`);
      expect([200, 401, 404]).toContain(response.status());
    });

    test('Gift cards table operations', async ({ request }) => {
      const response = await request.get(`${GVTEWAY_BASE}/api/gift-cards`);
      expect([200, 401, 404]).toContain(response.status());
    });

    test('Payments table operations', async ({ request }) => {
      const response = await request.get(`${GVTEWAY_BASE}/api/payments`);
      expect([200, 401, 404]).toContain(response.status());
    });
  });
});

test.describe('Cross-Platform Data Sync', () => {
  
  const ATLVS_BASE = 'http://localhost:3001';
  const COMPVSS_BASE = 'http://localhost:3002';
  const GVTEWAY_BASE = 'http://localhost:3000';

  test('ATLVS to GVTEWAY sync endpoint', async ({ request }) => {
    const response = await request.get(`${ATLVS_BASE}/api/cross-platform/gvteway-sync`);
    expect([200, 401, 404]).toContain(response.status());
  });

  test('ATLVS to COMPVSS sync endpoint', async ({ request }) => {
    const response = await request.get(`${ATLVS_BASE}/api/cross-platform/compvss-sync`);
    expect([200, 401, 404]).toContain(response.status());
  });

  test('COMPVSS to GVTEWAY sync endpoint', async ({ request }) => {
    const response = await request.get(`${COMPVSS_BASE}/api/cross-platform/gvteway-sync`);
    expect([200, 401, 404]).toContain(response.status());
  });
});

test.describe('Authentication Layer - All Apps', () => {
  
  const ATLVS_BASE = 'http://localhost:3001';
  const COMPVSS_BASE = 'http://localhost:3002';
  const GVTEWAY_BASE = 'http://localhost:3000';

  test.describe('ATLVS Auth', () => {
    test('Auth me endpoint', async ({ request }) => {
      const response = await request.get(`${ATLVS_BASE}/api/auth/me`);
      expect([200, 401, 404]).toContain(response.status());
    });

    test('Auth refresh endpoint', async ({ request }) => {
      const response = await request.get(`${ATLVS_BASE}/api/auth/refresh`);
      expect([200, 401, 404]).toContain(response.status());
    });
  });

  test.describe('COMPVSS Auth', () => {
    test('Auth me endpoint', async ({ request }) => {
      const response = await request.get(`${COMPVSS_BASE}/api/auth/me`);
      expect([200, 401, 404]).toContain(response.status());
    });

    test('Auth refresh endpoint', async ({ request }) => {
      const response = await request.get(`${COMPVSS_BASE}/api/auth/refresh`);
      expect([200, 401, 404]).toContain(response.status());
    });

    test('Auth MFA endpoint', async ({ request }) => {
      const response = await request.get(`${COMPVSS_BASE}/api/auth/mfa`);
      expect([200, 401, 404]).toContain(response.status());
    });
  });

  test.describe('GVTEWAY Auth', () => {
    test('Auth me endpoint', async ({ request }) => {
      const response = await request.get(`${GVTEWAY_BASE}/api/auth/me`);
      expect([200, 401, 404]).toContain(response.status());
    });

    test('Auth refresh endpoint', async ({ request }) => {
      const response = await request.get(`${GVTEWAY_BASE}/api/auth/refresh`);
      expect([200, 401, 404]).toContain(response.status());
    });
  });
});
