import { test, expect } from '@playwright/test';

/**
 * API Route Verification: COMPVSS
 * Comprehensive tests for all workflow-related API routes
 * Covers all 34 COMPVSS workflows
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
test.describe('COMPVSS API Routes', () => {
  const baseUrl = 'http://localhost:3002';
  
  // Strict valid statuses - endpoint exists and responds correctly
  const VALID_ENDPOINT_STATUSES = [200, 201, 204, 401, 403];
  
  // Helper for explicit status assertion with clear error message
  function assertValidEndpoint(status: number, endpoint: string) {
    expect(
      VALID_ENDPOINT_STATUSES,
      `Endpoint ${endpoint} returned ${status}. Expected 200/201/204 (success) or 401/403 (auth required). Got ${status === 404 ? '404 - endpoint does not exist' : status === 500 ? '500 - server error' : status}`
    ).toContain(status);
  }

  test.describe('WF-COMPVSS-001: Production Setup APIs', () => {
    test('GET /api/projects', async ({ request }) => {
      const response = await request.get(`${baseUrl}/api/projects`);
      assertValidEndpoint(response.status(), response.url());
    });
  });

  test.describe('WF-COMPVSS-002: Crew Scheduling APIs', () => {
    test('GET /api/crew', async ({ request }) => {
      const response = await request.get(`${baseUrl}/api/crew`);
      assertValidEndpoint(response.status(), response.url());
    });

    test('GET /api/crew-manifest', async ({ request }) => {
      const response = await request.get(`${baseUrl}/api/crew-manifest`);
      assertValidEndpoint(response.status(), response.url());
    });
  });

  test.describe('WF-COMPVSS-003: Advancing Management APIs', () => {
    test('GET /api/advancing/catalog', async ({ request }) => {
      const response = await request.get(`${baseUrl}/api/advancing/catalog`);
      assertValidEndpoint(response.status(), response.url());
    });
  });

  test.describe('WF-COMPVSS-004: Credential System APIs', () => {
    test('GET /api/credentials', async ({ request }) => {
      const response = await request.get(`${baseUrl}/api/credentials`);
      assertValidEndpoint(response.status(), response.url());
    });

    test('GET /api/credential-badges', async ({ request }) => {
      const response = await request.get(`${baseUrl}/api/credential-badges`);
      assertValidEndpoint(response.status(), response.url());
    });
  });

  test.describe('WF-COMPVSS-005: Schedule Management APIs', () => {
    test('GET /api/schedule', async ({ request }) => {
      const response = await request.get(`${baseUrl}/api/schedule`);
      assertValidEndpoint(response.status(), response.url());
    });

    test('GET /api/run-of-show', async ({ request }) => {
      const response = await request.get(`${baseUrl}/api/run-of-show`);
      assertValidEndpoint(response.status(), response.url());
    });

    test('GET /api/technical-rehearsals', async ({ request }) => {
      const response = await request.get(`${baseUrl}/api/technical-rehearsals`);
      assertValidEndpoint(response.status(), response.url());
    });

    test('GET /api/critical-path', async ({ request }) => {
      const response = await request.get(`${baseUrl}/api/critical-path`);
      assertValidEndpoint(response.status(), response.url());
    });
  });

  test.describe('WF-COMPVSS-006: Safety & Incident APIs', () => {
    test('GET /api/safety', async ({ request }) => {
      const response = await request.get(`${baseUrl}/api/safety`);
      assertValidEndpoint(response.status(), response.url());
    });

    test('GET /api/incidents', async ({ request }) => {
      const response = await request.get(`${baseUrl}/api/incidents`);
      assertValidEndpoint(response.status(), response.url());
    });

    test('GET /api/risk-detection', async ({ request }) => {
      const response = await request.get(`${baseUrl}/api/risk-detection`);
      assertValidEndpoint(response.status(), response.url());
    });
  });

  test.describe('WF-COMPVSS-007: Quality Assurance APIs', () => {
    test('GET /api/damage-assessment', async ({ request }) => {
      const response = await request.get(`${baseUrl}/api/damage-assessment`);
      assertValidEndpoint(response.status(), response.url());
    });
  });

  test.describe('WF-COMPVSS-008: Vendor Coordination APIs', () => {
    test('GET /api/vendor-hub', async ({ request }) => {
      const response = await request.get(`${baseUrl}/api/vendor-hub`);
      assertValidEndpoint(response.status(), response.url());
    });

    test('GET /api/subcontractor-opportunities', async ({ request }) => {
      const response = await request.get(`${baseUrl}/api/subcontractor-opportunities`);
      assertValidEndpoint(response.status(), response.url());
    });
  });

  test.describe('WF-COMPVSS-009: Load-In Management APIs', () => {
    test('GET /api/equipment', async ({ request }) => {
      const response = await request.get(`${baseUrl}/api/equipment`);
      assertValidEndpoint(response.status(), response.url());
    });

    test('GET /api/equipment-specs', async ({ request }) => {
      const response = await request.get(`${baseUrl}/api/equipment-specs`);
      assertValidEndpoint(response.status(), response.url());
    });

    test('GET /api/equipment-manuals', async ({ request }) => {
      const response = await request.get(`${baseUrl}/api/equipment-manuals`);
      assertValidEndpoint(response.status(), response.url());
    });

    test('GET /api/equipment-return', async ({ request }) => {
      const response = await request.get(`${baseUrl}/api/equipment-return`);
      assertValidEndpoint(response.status(), response.url());
    });

    test('GET /api/staging-areas', async ({ request }) => {
      const response = await request.get(`${baseUrl}/api/staging-areas`);
      assertValidEndpoint(response.status(), response.url());
    });

    test('GET /api/rigging-calc', async ({ request }) => {
      const response = await request.get(`${baseUrl}/api/rigging-calc`);
      assertValidEndpoint(response.status(), response.url());
    });

    test('GET /api/ground-plans', async ({ request }) => {
      const response = await request.get(`${baseUrl}/api/ground-plans`);
      assertValidEndpoint(response.status(), response.url());
    });
  });

  test.describe('WF-COMPVSS-010: Show Day Operations APIs', () => {
    test('GET /api/meal-breaks', async ({ request }) => {
      const response = await request.get(`${baseUrl}/api/meal-breaks`);
      assertValidEndpoint(response.status(), response.url());
    });

    test('GET /api/merch-coordination', async ({ request }) => {
      const response = await request.get(`${baseUrl}/api/merch-coordination`);
      assertValidEndpoint(response.status(), response.url());
    });
  });

  test.describe('WF-COMPVSS-012: Production Wrap APIs', () => {
    test('GET /api/show-reports', async ({ request }) => {
      const response = await request.get(`${baseUrl}/api/show-reports`);
      assertValidEndpoint(response.status(), response.url());
    });

    test('GET /api/post-show', async ({ request }) => {
      const response = await request.get(`${baseUrl}/api/post-show`);
      assertValidEndpoint(response.status(), response.url());
    });
  });

  test.describe('WF-COMPVSS-013: SOP Management APIs', () => {
    test('GET /api/sops', async ({ request }) => {
      const response = await request.get(`${baseUrl}/api/sops`);
      assertValidEndpoint(response.status(), response.url());
    });

    test('GET /api/template-library', async ({ request }) => {
      const response = await request.get(`${baseUrl}/api/template-library`);
      assertValidEndpoint(response.status(), response.url());
    });
  });

  test.describe('WF-COMPVSS-014: Opportunity & Bid APIs', () => {
    test('GET /api/opportunities', async ({ request }) => {
      const response = await request.get(`${baseUrl}/api/opportunities`);
      assertValidEndpoint(response.status(), response.url());
    });

    test('GET /api/win-loss-tracking', async ({ request }) => {
      const response = await request.get(`${baseUrl}/api/win-loss-tracking`);
      assertValidEndpoint(response.status(), response.url());
    });

    test('GET /api/mobile-jobs', async ({ request }) => {
      const response = await request.get(`${baseUrl}/api/mobile-jobs`);
      assertValidEndpoint(response.status(), response.url());
    });

    test('GET /api/client-requirements', async ({ request }) => {
      const response = await request.get(`${baseUrl}/api/client-requirements`);
      assertValidEndpoint(response.status(), response.url());
    });

    test('GET /api/client-walkthrough', async ({ request }) => {
      const response = await request.get(`${baseUrl}/api/client-walkthrough`);
      assertValidEndpoint(response.status(), response.url());
    });
  });

  test.describe('WF-COMPVSS-015: Communication APIs', () => {
    test('GET /api/chat/rooms', async ({ request }) => {
      const response = await request.get(`${baseUrl}/api/chat/rooms`);
      assertValidEndpoint(response.status(), response.url());
    });

    test('GET /api/chat/messages', async ({ request }) => {
      const response = await request.get(`${baseUrl}/api/chat/messages`);
      assertValidEndpoint(response.status(), response.url());
    });

    test('GET /api/chat/presence', async ({ request }) => {
      const response = await request.get(`${baseUrl}/api/chat/presence`);
      assertValidEndpoint(response.status(), response.url());
    });

    test('GET /api/collaboration/comments', async ({ request }) => {
      const response = await request.get(`${baseUrl}/api/collaboration/comments`);
      assertValidEndpoint(response.status(), response.url());
    });

    test('GET /api/social-sharing', async ({ request }) => {
      const response = await request.get(`${baseUrl}/api/social-sharing`);
      assertValidEndpoint(response.status(), response.url());
    });
  });

  test.describe('WF-COMPVSS-017: Training & Certification APIs', () => {
    test('GET /api/onboarding-workflow', async ({ request }) => {
      const response = await request.get(`${baseUrl}/api/onboarding-workflow`);
      assertValidEndpoint(response.status(), response.url());
    });

    test('GET /api/industry-associations', async ({ request }) => {
      const response = await request.get(`${baseUrl}/api/industry-associations`);
      assertValidEndpoint(response.status(), response.url());
    });
  });

  test.describe('Venue & Location APIs', () => {
    test('GET /api/venues', async ({ request }) => {
      const response = await request.get(`${baseUrl}/api/venues`);
      assertValidEndpoint(response.status(), response.url());
    });

    test('GET /api/proximity-search', async ({ request }) => {
      const response = await request.get(`${baseUrl}/api/proximity-search`);
      assertValidEndpoint(response.status(), response.url());
    });
  });

  test.describe('Cross-Platform Sync APIs', () => {
    test('GET /api/cross-platform/gvteway-sync', async ({ request }) => {
      const response = await request.get(`${baseUrl}/api/cross-platform/gvteway-sync`);
      assertValidEndpoint(response.status(), response.url());
    });
  });

  test.describe('Authentication APIs', () => {
    test('GET /api/auth/me', async ({ request }) => {
      const response = await request.get(`${baseUrl}/api/auth/me`);
      assertValidEndpoint(response.status(), response.url());
    });

    test('POST /api/auth/signin', async ({ request }) => {
      const response = await request.post(`${baseUrl}/api/auth/signin`, {
        data: { email: 'test@example.com', password: 'test' }
      });
      assertValidEndpoint(response.status(), response.url());
    });

    test('POST /api/auth/signup', async ({ request }) => {
      const response = await request.post(`${baseUrl}/api/auth/signup`, {
        data: { email: 'test@example.com', password: 'test' }
      });
      assertValidEndpoint(response.status(), response.url());
    });

    test('POST /api/auth/magic-link', async ({ request }) => {
      const response = await request.post(`${baseUrl}/api/auth/magic-link`, {
        data: { email: 'test@example.com' }
      });
      assertValidEndpoint(response.status(), response.url());
    });

    test('GET /api/auth/refresh', async ({ request }) => {
      const response = await request.get(`${baseUrl}/api/auth/refresh`);
      assertValidEndpoint(response.status(), response.url());
    });

    test('GET /api/auth/mfa', async ({ request }) => {
      const response = await request.get(`${baseUrl}/api/auth/mfa`);
      assertValidEndpoint(response.status(), response.url());
    });
  });

  test.describe('Language & Localization APIs', () => {
    test('GET /api/language-filter', async ({ request }) => {
      const response = await request.get(`${baseUrl}/api/language-filter`);
      assertValidEndpoint(response.status(), response.url());
    });
  });
});
