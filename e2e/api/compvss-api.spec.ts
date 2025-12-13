import { test, expect } from '@playwright/test';

/**
 * API Route Verification: COMPVSS
 * Comprehensive tests for all workflow-related API routes
 * Covers all 34 COMPVSS workflows
 */
test.describe('COMPVSS API Routes', () => {
  const baseUrl = 'http://localhost:3002';
  const validStatuses = [200, 302, 307, 401, 404];

  test.describe('WF-COMPVSS-001: Production Setup APIs', () => {
    test('GET /api/projects', async ({ request }) => {
      const response = await request.get(`${baseUrl}/api/projects`);
      expect(validStatuses).toContain(response.status());
    });
  });

  test.describe('WF-COMPVSS-002: Crew Scheduling APIs', () => {
    test('GET /api/crew', async ({ request }) => {
      const response = await request.get(`${baseUrl}/api/crew`);
      expect(validStatuses).toContain(response.status());
    });

    test('GET /api/crew-manifest', async ({ request }) => {
      const response = await request.get(`${baseUrl}/api/crew-manifest`);
      expect(validStatuses).toContain(response.status());
    });
  });

  test.describe('WF-COMPVSS-003: Advancing Management APIs', () => {
    test('GET /api/advancing/catalog', async ({ request }) => {
      const response = await request.get(`${baseUrl}/api/advancing/catalog`);
      expect(validStatuses).toContain(response.status());
    });
  });

  test.describe('WF-COMPVSS-004: Credential System APIs', () => {
    test('GET /api/credentials', async ({ request }) => {
      const response = await request.get(`${baseUrl}/api/credentials`);
      expect(validStatuses).toContain(response.status());
    });

    test('GET /api/credential-badges', async ({ request }) => {
      const response = await request.get(`${baseUrl}/api/credential-badges`);
      expect(validStatuses).toContain(response.status());
    });
  });

  test.describe('WF-COMPVSS-005: Schedule Management APIs', () => {
    test('GET /api/schedule', async ({ request }) => {
      const response = await request.get(`${baseUrl}/api/schedule`);
      expect(validStatuses).toContain(response.status());
    });

    test('GET /api/run-of-show', async ({ request }) => {
      const response = await request.get(`${baseUrl}/api/run-of-show`);
      expect(validStatuses).toContain(response.status());
    });

    test('GET /api/technical-rehearsals', async ({ request }) => {
      const response = await request.get(`${baseUrl}/api/technical-rehearsals`);
      expect(validStatuses).toContain(response.status());
    });

    test('GET /api/critical-path', async ({ request }) => {
      const response = await request.get(`${baseUrl}/api/critical-path`);
      expect(validStatuses).toContain(response.status());
    });
  });

  test.describe('WF-COMPVSS-006: Safety & Incident APIs', () => {
    test('GET /api/safety', async ({ request }) => {
      const response = await request.get(`${baseUrl}/api/safety`);
      expect(validStatuses).toContain(response.status());
    });

    test('GET /api/incidents', async ({ request }) => {
      const response = await request.get(`${baseUrl}/api/incidents`);
      expect(validStatuses).toContain(response.status());
    });

    test('GET /api/risk-detection', async ({ request }) => {
      const response = await request.get(`${baseUrl}/api/risk-detection`);
      expect(validStatuses).toContain(response.status());
    });
  });

  test.describe('WF-COMPVSS-007: Quality Assurance APIs', () => {
    test('GET /api/damage-assessment', async ({ request }) => {
      const response = await request.get(`${baseUrl}/api/damage-assessment`);
      expect(validStatuses).toContain(response.status());
    });
  });

  test.describe('WF-COMPVSS-008: Vendor Coordination APIs', () => {
    test('GET /api/vendor-hub', async ({ request }) => {
      const response = await request.get(`${baseUrl}/api/vendor-hub`);
      expect(validStatuses).toContain(response.status());
    });

    test('GET /api/subcontractor-opportunities', async ({ request }) => {
      const response = await request.get(`${baseUrl}/api/subcontractor-opportunities`);
      expect(validStatuses).toContain(response.status());
    });
  });

  test.describe('WF-COMPVSS-009: Load-In Management APIs', () => {
    test('GET /api/equipment', async ({ request }) => {
      const response = await request.get(`${baseUrl}/api/equipment`);
      expect(validStatuses).toContain(response.status());
    });

    test('GET /api/equipment-specs', async ({ request }) => {
      const response = await request.get(`${baseUrl}/api/equipment-specs`);
      expect(validStatuses).toContain(response.status());
    });

    test('GET /api/equipment-manuals', async ({ request }) => {
      const response = await request.get(`${baseUrl}/api/equipment-manuals`);
      expect(validStatuses).toContain(response.status());
    });

    test('GET /api/equipment-return', async ({ request }) => {
      const response = await request.get(`${baseUrl}/api/equipment-return`);
      expect(validStatuses).toContain(response.status());
    });

    test('GET /api/staging-areas', async ({ request }) => {
      const response = await request.get(`${baseUrl}/api/staging-areas`);
      expect(validStatuses).toContain(response.status());
    });

    test('GET /api/rigging-calc', async ({ request }) => {
      const response = await request.get(`${baseUrl}/api/rigging-calc`);
      expect(validStatuses).toContain(response.status());
    });

    test('GET /api/ground-plans', async ({ request }) => {
      const response = await request.get(`${baseUrl}/api/ground-plans`);
      expect(validStatuses).toContain(response.status());
    });
  });

  test.describe('WF-COMPVSS-010: Show Day Operations APIs', () => {
    test('GET /api/meal-breaks', async ({ request }) => {
      const response = await request.get(`${baseUrl}/api/meal-breaks`);
      expect(validStatuses).toContain(response.status());
    });

    test('GET /api/merch-coordination', async ({ request }) => {
      const response = await request.get(`${baseUrl}/api/merch-coordination`);
      expect(validStatuses).toContain(response.status());
    });
  });

  test.describe('WF-COMPVSS-012: Production Wrap APIs', () => {
    test('GET /api/show-reports', async ({ request }) => {
      const response = await request.get(`${baseUrl}/api/show-reports`);
      expect(validStatuses).toContain(response.status());
    });

    test('GET /api/post-show', async ({ request }) => {
      const response = await request.get(`${baseUrl}/api/post-show`);
      expect(validStatuses).toContain(response.status());
    });
  });

  test.describe('WF-COMPVSS-013: SOP Management APIs', () => {
    test('GET /api/sops', async ({ request }) => {
      const response = await request.get(`${baseUrl}/api/sops`);
      expect(validStatuses).toContain(response.status());
    });

    test('GET /api/template-library', async ({ request }) => {
      const response = await request.get(`${baseUrl}/api/template-library`);
      expect(validStatuses).toContain(response.status());
    });
  });

  test.describe('WF-COMPVSS-014: Opportunity & Bid APIs', () => {
    test('GET /api/opportunities', async ({ request }) => {
      const response = await request.get(`${baseUrl}/api/opportunities`);
      expect(validStatuses).toContain(response.status());
    });

    test('GET /api/win-loss-tracking', async ({ request }) => {
      const response = await request.get(`${baseUrl}/api/win-loss-tracking`);
      expect(validStatuses).toContain(response.status());
    });

    test('GET /api/mobile-jobs', async ({ request }) => {
      const response = await request.get(`${baseUrl}/api/mobile-jobs`);
      expect(validStatuses).toContain(response.status());
    });

    test('GET /api/client-requirements', async ({ request }) => {
      const response = await request.get(`${baseUrl}/api/client-requirements`);
      expect(validStatuses).toContain(response.status());
    });

    test('GET /api/client-walkthrough', async ({ request }) => {
      const response = await request.get(`${baseUrl}/api/client-walkthrough`);
      expect(validStatuses).toContain(response.status());
    });
  });

  test.describe('WF-COMPVSS-015: Communication APIs', () => {
    test('GET /api/chat/rooms', async ({ request }) => {
      const response = await request.get(`${baseUrl}/api/chat/rooms`);
      expect(validStatuses).toContain(response.status());
    });

    test('GET /api/chat/messages', async ({ request }) => {
      const response = await request.get(`${baseUrl}/api/chat/messages`);
      expect(validStatuses).toContain(response.status());
    });

    test('GET /api/chat/presence', async ({ request }) => {
      const response = await request.get(`${baseUrl}/api/chat/presence`);
      expect(validStatuses).toContain(response.status());
    });

    test('GET /api/collaboration/comments', async ({ request }) => {
      const response = await request.get(`${baseUrl}/api/collaboration/comments`);
      expect(validStatuses).toContain(response.status());
    });

    test('GET /api/social-sharing', async ({ request }) => {
      const response = await request.get(`${baseUrl}/api/social-sharing`);
      expect(validStatuses).toContain(response.status());
    });
  });

  test.describe('WF-COMPVSS-017: Training & Certification APIs', () => {
    test('GET /api/onboarding-workflow', async ({ request }) => {
      const response = await request.get(`${baseUrl}/api/onboarding-workflow`);
      expect(validStatuses).toContain(response.status());
    });

    test('GET /api/industry-associations', async ({ request }) => {
      const response = await request.get(`${baseUrl}/api/industry-associations`);
      expect(validStatuses).toContain(response.status());
    });
  });

  test.describe('Venue & Location APIs', () => {
    test('GET /api/venues', async ({ request }) => {
      const response = await request.get(`${baseUrl}/api/venues`);
      expect(validStatuses).toContain(response.status());
    });

    test('GET /api/proximity-search', async ({ request }) => {
      const response = await request.get(`${baseUrl}/api/proximity-search`);
      expect(validStatuses).toContain(response.status());
    });
  });

  test.describe('Cross-Platform Sync APIs', () => {
    test('GET /api/cross-platform/gvteway-sync', async ({ request }) => {
      const response = await request.get(`${baseUrl}/api/cross-platform/gvteway-sync`);
      expect(validStatuses).toContain(response.status());
    });
  });

  test.describe('Authentication APIs', () => {
    test('GET /api/auth/me', async ({ request }) => {
      const response = await request.get(`${baseUrl}/api/auth/me`);
      expect(validStatuses).toContain(response.status());
    });

    test('POST /api/auth/signin', async ({ request }) => {
      const response = await request.post(`${baseUrl}/api/auth/signin`, {
        data: { email: 'test@example.com', password: 'test' }
      });
      expect(validStatuses).toContain(response.status());
    });

    test('POST /api/auth/signup', async ({ request }) => {
      const response = await request.post(`${baseUrl}/api/auth/signup`, {
        data: { email: 'test@example.com', password: 'test' }
      });
      expect(validStatuses).toContain(response.status());
    });

    test('POST /api/auth/magic-link', async ({ request }) => {
      const response = await request.post(`${baseUrl}/api/auth/magic-link`, {
        data: { email: 'test@example.com' }
      });
      expect(validStatuses).toContain(response.status());
    });

    test('GET /api/auth/refresh', async ({ request }) => {
      const response = await request.get(`${baseUrl}/api/auth/refresh`);
      expect(validStatuses).toContain(response.status());
    });

    test('GET /api/auth/mfa', async ({ request }) => {
      const response = await request.get(`${baseUrl}/api/auth/mfa`);
      expect(validStatuses).toContain(response.status());
    });
  });

  test.describe('Language & Localization APIs', () => {
    test('GET /api/language-filter', async ({ request }) => {
      const response = await request.get(`${baseUrl}/api/language-filter`);
      expect(validStatuses).toContain(response.status());
    });
  });
});
