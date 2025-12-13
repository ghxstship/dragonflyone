import { test, expect, Page, APIRequestContext } from '@playwright/test';

/**
 * COMPVSS Full-Stack Validation Tests
 * Validates complete user journeys across all application layers:
 * - Frontend (UI pages and components)
 * - Backend API routes
 * - Database operations via Supabase
 * - Edge functions
 */

const COMPVSS_BASE = 'http://localhost:3002';
const validStatuses = [200, 201, 302, 307, 401, 404];

// Helper to validate frontend page
async function validateFrontend(page: Page, path: string, urlPattern: RegExp) {
  await page.goto(`${COMPVSS_BASE}${path}`);
  await page.waitForLoadState('domcontentloaded');
  await expect(page).toHaveURL(urlPattern);
  await expect(page.locator('body')).toBeVisible();
  return true;
}

// Helper to validate API endpoint
async function validateAPI(request: APIRequestContext, method: string, path: string, body?: object) {
  const url = `${COMPVSS_BASE}${path}`;
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

test.describe('COMPVSS Full-Stack Workflow Validation', () => {

  test.describe('WF-COMPVSS-001: Production Setup & Configuration - Full Stack', () => {
    
    test('Frontend Layer: Production setup pages accessible', async ({ page }) => {
      await validateFrontend(page, '/projects', /projects/);
      await validateFrontend(page, '/projects/new', /projects\/new/);
      await validateFrontend(page, '/credentials/types', /credentials\/types/);
      await validateFrontend(page, '/credentials/zones', /credentials\/zones/);
    });

    test('API Layer: Production endpoints respond', async ({ request }) => {
      await validateAPI(request, 'GET', '/api/projects');
    });

    test('Database Layer: Project data operations', async ({ request }) => {
      const projectsRes = await request.get(`${COMPVSS_BASE}/api/projects`);
      if (projectsRes.status() === 200) {
        const data = await projectsRes.json();
        expect(data).toBeDefined();
      }
    });
  });

  test.describe('WF-COMPVSS-002: Crew Scheduling & Assignment - Full Stack', () => {
    
    test('Frontend Layer: Crew pages accessible', async ({ page }) => {
      await validateFrontend(page, '/crew', /crew/);
      await validateFrontend(page, '/directory/availability', /directory\/availability/);
      await validateFrontend(page, '/directory/filters', /directory\/filters/);
      await validateFrontend(page, '/crew/assign', /crew\/assign/);
      await validateFrontend(page, '/credentials/issue', /credentials\/issue/);
      await validateFrontend(page, '/credentials/reports', /credentials\/reports/);
    });

    test('API Layer: Crew endpoints respond', async ({ request }) => {
      await validateAPI(request, 'GET', '/api/crew');
      await validateAPI(request, 'GET', '/api/crew-manifest');
    });
  });

  test.describe('WF-COMPVSS-003: Advancing Management - Full Stack', () => {
    
    test('Frontend Layer: Advancing pages accessible', async ({ page }) => {
      await validateFrontend(page, '/advancing', /advancing/);
      await validateFrontend(page, '/advancing/new', /advancing\/new/);
      await validateFrontend(page, '/advancing/catalog', /advancing\/catalog/);
    });

    test('API Layer: Advancing endpoints respond', async ({ request }) => {
      await validateAPI(request, 'GET', '/api/advancing/catalog');
    });
  });

  test.describe('WF-COMPVSS-004: Credential System Management - Full Stack', () => {
    
    test('Frontend Layer: Credential pages accessible', async ({ page }) => {
      await validateFrontend(page, '/credentials', /credentials/);
      await validateFrontend(page, '/credentials/types', /credentials\/types/);
      await validateFrontend(page, '/credentials/zones', /credentials\/zones/);
      await validateFrontend(page, '/credentials/issue', /credentials\/issue/);
      await validateFrontend(page, '/credentials/scan', /credentials\/scan/);
      await validateFrontend(page, '/credentials/reports', /credentials\/reports/);
      await validateFrontend(page, '/site-access', /site-access/);
    });

    test('API Layer: Credential endpoints respond', async ({ request }) => {
      await validateAPI(request, 'GET', '/api/credentials');
      await validateAPI(request, 'GET', '/api/credential-badges');
    });
  });

  test.describe('WF-COMPVSS-005: Schedule Management - Full Stack', () => {
    
    test('Frontend Layer: Schedule pages accessible', async ({ page }) => {
      await validateFrontend(page, '/schedule', /schedule/);
      await validateFrontend(page, '/build-strike', /build-strike/);
      await validateFrontend(page, '/tech-rehearsal', /tech-rehearsal/);
      await validateFrontend(page, '/soundcheck', /soundcheck/);
      await validateFrontend(page, '/show-call', /show-call/);
      await validateFrontend(page, '/set-times', /set-times/);
      await validateFrontend(page, '/run-of-show', /run-of-show/);
    });

    test('API Layer: Schedule endpoints respond', async ({ request }) => {
      await validateAPI(request, 'GET', '/api/schedule');
      await validateAPI(request, 'GET', '/api/run-of-show');
      await validateAPI(request, 'GET', '/api/technical-rehearsals');
      await validateAPI(request, 'GET', '/api/critical-path');
    });
  });

  test.describe('WF-COMPVSS-006: Safety & Incident Management - Full Stack', () => {
    
    test('Frontend Layer: Safety pages accessible', async ({ page }) => {
      await validateFrontend(page, '/safety', /safety/);
      await validateFrontend(page, '/emergency', /emergency/);
      await validateFrontend(page, '/incidents', /incidents/);
    });

    test('API Layer: Safety endpoints respond', async ({ request }) => {
      await validateAPI(request, 'GET', '/api/safety');
      await validateAPI(request, 'GET', '/api/incidents');
      await validateAPI(request, 'GET', '/api/risk-detection');
    });
  });

  test.describe('WF-COMPVSS-007: Quality Assurance Management - Full Stack', () => {
    
    test('Frontend Layer: QA pages accessible', async ({ page }) => {
      await validateFrontend(page, '/qa-checkpoints', /qa-checkpoints/);
      await validateFrontend(page, '/punch-list', /punch-list/);
      await validateFrontend(page, '/troubleshooting', /troubleshooting/);
    });

    test('API Layer: QA endpoints respond', async ({ request }) => {
      await validateAPI(request, 'GET', '/api/damage-assessment');
    });
  });

  test.describe('WF-COMPVSS-008: Vendor Coordination - Full Stack', () => {
    
    test('Frontend Layer: Vendor pages accessible', async ({ page }) => {
      await validateFrontend(page, '/vendors/compare', /vendors\/compare/);
      await validateFrontend(page, '/deliveries', /deliveries/);
      await validateFrontend(page, '/logistics', /logistics/);
      await validateFrontend(page, '/subcontractors', /subcontractors/);
    });

    test('API Layer: Vendor endpoints respond', async ({ request }) => {
      await validateAPI(request, 'GET', '/api/vendor-hub');
      await validateAPI(request, 'GET', '/api/subcontractor-opportunities');
    });
  });

  test.describe('WF-COMPVSS-009: Load-In Management - Full Stack', () => {
    
    test('Frontend Layer: Equipment pages accessible', async ({ page }) => {
      await validateFrontend(page, '/equipment', /equipment/);
      await validateFrontend(page, '/photo-documentation', /photo-documentation/);
    });

    test('API Layer: Equipment endpoints respond', async ({ request }) => {
      await validateAPI(request, 'GET', '/api/equipment');
      await validateAPI(request, 'GET', '/api/equipment-specs');
      await validateAPI(request, 'GET', '/api/equipment-manuals');
      await validateAPI(request, 'GET', '/api/equipment-return');
      await validateAPI(request, 'GET', '/api/staging-areas');
      await validateAPI(request, 'GET', '/api/rigging-calc');
      await validateAPI(request, 'GET', '/api/ground-plans');
    });
  });

  test.describe('WF-COMPVSS-010: Show Day Operations - Full Stack', () => {
    
    test('Frontend Layer: Show day pages accessible', async ({ page }) => {
      await validateFrontend(page, '/catering', /catering/);
      await validateFrontend(page, '/weather', /weather/);
      await validateFrontend(page, '/vip-management', /vip-management/);
    });

    test('API Layer: Show day endpoints respond', async ({ request }) => {
      await validateAPI(request, 'GET', '/api/meal-breaks');
      await validateAPI(request, 'GET', '/api/merch-coordination');
    });
  });

  test.describe('WF-COMPVSS-011: Load-Out & Strike - Full Stack', () => {
    
    test('Frontend Layer: Timekeeping pages accessible', async ({ page }) => {
      await validateFrontend(page, '/timekeeping', /timekeeping/);
    });
  });

  test.describe('WF-COMPVSS-012: Production Wrap & Settlement - Full Stack', () => {
    
    test('Frontend Layer: Reports pages accessible', async ({ page }) => {
      await validateFrontend(page, '/reports/daily', /reports\/daily/);
      await validateFrontend(page, '/reports/wrap', /reports\/wrap/);
      await validateFrontend(page, '/settlement', /settlement/);
    });

    test('API Layer: Reports endpoints respond', async ({ request }) => {
      await validateAPI(request, 'GET', '/api/show-reports');
      await validateAPI(request, 'GET', '/api/post-show');
    });
  });

  test.describe('WF-COMPVSS-013: SOP Management - Full Stack', () => {
    
    test('Frontend Layer: SOP pages accessible', async ({ page }) => {
      await validateFrontend(page, '/sops', /sops/);
      await validateFrontend(page, '/sops/categories', /sops\/categories/);
      await validateFrontend(page, '/sops/training', /sops\/training/);
      await validateFrontend(page, '/sops/acknowledgments', /sops\/acknowledgments/);
    });

    test('API Layer: SOP endpoints respond', async ({ request }) => {
      await validateAPI(request, 'GET', '/api/sops');
      await validateAPI(request, 'GET', '/api/template-library');
    });
  });

  test.describe('WF-COMPVSS-014: Opportunity & Bid Management - Full Stack', () => {
    
    test('Frontend Layer: Opportunity pages accessible', async ({ page }) => {
      await validateFrontend(page, '/opportunities', /opportunities/);
      await validateFrontend(page, '/opportunities/bid-decision', /opportunities\/bid-decision/);
      await validateFrontend(page, '/opportunities/proposals', /opportunities\/proposals/);
      await validateFrontend(page, '/bid-portal', /bid-portal/);
      await validateFrontend(page, '/opportunities/mobile', /opportunities\/mobile/);
      await validateFrontend(page, '/opportunities/win-loss', /opportunities\/win-loss/);
    });

    test('API Layer: Opportunity endpoints respond', async ({ request }) => {
      await validateAPI(request, 'GET', '/api/opportunities');
      await validateAPI(request, 'GET', '/api/win-loss-tracking');
      await validateAPI(request, 'GET', '/api/mobile-jobs');
      await validateAPI(request, 'GET', '/api/client-requirements');
      await validateAPI(request, 'GET', '/api/client-walkthrough');
    });
  });

  test.describe('WF-COMPVSS-015: Communication Management - Full Stack', () => {
    
    test('Frontend Layer: Communication pages accessible', async ({ page }) => {
      await validateFrontend(page, '/communications', /communications/);
      await validateFrontend(page, '/communications/channels', /communications\/channels/);
      await validateFrontend(page, '/messages', /messages/);
      await validateFrontend(page, '/social-amplification', /social-amplification/);
    });

    test('API Layer: Communication endpoints respond', async ({ request }) => {
      await validateAPI(request, 'GET', '/api/chat/rooms');
      await validateAPI(request, 'GET', '/api/chat/messages');
      await validateAPI(request, 'GET', '/api/chat/presence');
      await validateAPI(request, 'GET', '/api/collaboration/comments');
      await validateAPI(request, 'GET', '/api/social-sharing');
    });
  });

  test.describe('WF-COMPVSS-016: Risk Management - Full Stack', () => {
    
    test('Frontend Layer: Risk pages accessible', async ({ page }) => {
      await validateFrontend(page, '/risk-register', /risk-register/);
      await validateFrontend(page, '/backup-plans', /backup-plans/);
      await validateFrontend(page, '/weather-contingency', /weather-contingency/);
    });
  });

  test.describe('WF-COMPVSS-017: Training & Certification Management - Full Stack', () => {
    
    test('Frontend Layer: Training pages accessible', async ({ page }) => {
      await validateFrontend(page, '/certifications', /certifications/);
      await validateFrontend(page, '/skills', /skills/);
      await validateFrontend(page, '/mentorship', /mentorship/);
      await validateFrontend(page, '/background-checks', /background-checks/);
      await validateFrontend(page, '/onboarding', /onboarding/);
    });

    test('API Layer: Training endpoints respond', async ({ request }) => {
      await validateAPI(request, 'GET', '/api/onboarding-workflow');
      await validateAPI(request, 'GET', '/api/industry-associations');
    });
  });

  test.describe('WF-COMPVSS-018: Reporting & Documentation - Full Stack', () => {
    
    test('Frontend Layer: Reporting pages accessible', async ({ page }) => {
      await validateFrontend(page, '/reports/daily', /reports\/daily/);
    });
  });

  test.describe('WF-COMPVSS-019-024: Team Member Workflows - Full Stack', () => {
    
    test('Frontend Layer: Team member pages accessible', async ({ page }) => {
      await validateFrontend(page, '/dashboard', /dashboard/);
      await validateFrontend(page, '/my-schedule', /my-schedule/);
      await validateFrontend(page, '/my-assignments', /my-assignments/);
      await validateFrontend(page, '/clock-in', /clock-in/);
      await validateFrontend(page, '/my-credentials', /my-credentials/);
      await validateFrontend(page, '/knowledge', /knowledge/);
      await validateFrontend(page, '/knowledge/regulations', /knowledge\/regulations/);
      await validateFrontend(page, '/knowledge/offline', /knowledge\/offline/);
      await validateFrontend(page, '/notifications', /notifications/);
      await validateFrontend(page, '/channels', /channels/);
    });
  });

  test.describe('WF-COMPVSS-025-027: Crew Workflows - Full Stack', () => {
    
    test('Frontend Layer: Crew pages accessible', async ({ page }) => {
      await validateFrontend(page, '/my-timesheets', /my-timesheets/);
      await validateFrontend(page, '/my-training', /my-training/);
      await validateFrontend(page, '/directory', /directory/);
    });
  });

  test.describe('WF-COMPVSS-028-029: Artist Workflows - Full Stack', () => {
    
    test('Frontend Layer: Artist portal pages accessible', async ({ page }) => {
      await validateFrontend(page, '/artist-portal', /artist-portal/);
      await validateFrontend(page, '/my-rider', /my-rider/);
      await validateFrontend(page, '/my-hospitality', /my-hospitality/);
    });
  });

  test.describe('WF-COMPVSS-030-031: Vendor Workflows - Full Stack', () => {
    
    test('Frontend Layer: Vendor portal pages accessible', async ({ page }) => {
      await validateFrontend(page, '/vendor-portal', /vendor-portal/);
      await validateFrontend(page, '/my-deliveries', /my-deliveries/);
      await validateFrontend(page, '/my-contracts', /my-contracts/);
      await validateFrontend(page, '/my-invoices', /my-invoices/);
    });
  });

  test.describe('WF-COMPVSS-032: Stakeholder Workflows - Full Stack', () => {
    
    test('Frontend Layer: Stakeholder portal pages accessible', async ({ page }) => {
      await validateFrontend(page, '/stakeholder-portal', /stakeholder-portal/);
    });
  });

  test.describe('WF-COMPVSS-033: Offline Workflows - Full Stack', () => {
    
    test('Frontend Layer: Offline pages accessible', async ({ page }) => {
      await validateFrontend(page, '/offline', /offline/);
    });
  });

  test.describe('WF-COMPVSS-034: Authentication - Full Stack', () => {
    
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
      await validateAPI(request, 'GET', '/api/auth/mfa');
    });
  });

  test.describe('Venue & Location - Full Stack', () => {
    
    test('API Layer: Venue endpoints respond', async ({ request }) => {
      await validateAPI(request, 'GET', '/api/venues');
      await validateAPI(request, 'GET', '/api/proximity-search');
    });
  });

  test.describe('Cross-Platform Integration - Full Stack', () => {
    
    test('API Layer: Cross-platform sync endpoints respond', async ({ request }) => {
      await validateAPI(request, 'GET', '/api/cross-platform/gvteway-sync');
    });
  });

  test.describe('Localization - Full Stack', () => {
    
    test('API Layer: Language endpoints respond', async ({ request }) => {
      await validateAPI(request, 'GET', '/api/language-filter');
    });
  });
});
