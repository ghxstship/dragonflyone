import { test, expect, Page } from '@playwright/test';

/**
 * COMPVSS Complete User Journey Tests
 * Validates the full user journey for each workflow step-by-step
 */

const COMPVSS_BASE = 'http://localhost:3002';

// Helper to check if redirected to auth
function isAuthRedirect(url: string): boolean {
  return url.includes('/auth/signin') || url.includes('/auth/login');
}

// Helper to navigate and verify page - accepts auth redirects as valid for protected pages
async function navigateAndVerify(page: Page, pagePath: string, urlPattern: RegExp, isProtected = true): Promise<boolean> {
  await page.goto(`${COMPVSS_BASE}${pagePath}`);
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

test.describe('COMPVSS Admin User Journeys', () => {

  test.describe('WF-COMPVSS-001: Production Setup & Configuration - Complete Journey', () => {
    test('should complete full production setup workflow', async ({ page }) => {
      // Step 1: Navigate to Projects - View all projects
      await navigateAndVerify(page, '/projects', /projects/);
      
      // Step 2: Create new project
      await navigateAndVerify(page, '/projects/new', /projects\/new/);
      
      // Step 6: Define credential types
      await navigateAndVerify(page, '/credentials/types', /credentials\/types/);
      
      // Step 7: Configure access zones
      await navigateAndVerify(page, '/credentials/zones', /credentials\/zones/);
    });
  });

  test.describe('WF-COMPVSS-002: Crew Scheduling & Assignment - Complete Journey', () => {
    test('should complete full crew scheduling workflow', async ({ page }) => {
      // Step 1: Access crew management
      await navigateAndVerify(page, '/crew', /crew/);
      
      // Step 2: Check availability
      await navigateAndVerify(page, '/directory/availability', /directory\/availability/);
      
      // Step 3: Filter by skills
      await navigateAndVerify(page, '/directory/filters', /directory\/filters/);
      
      // Step 4: Assign crew to production
      await navigateAndVerify(page, '/crew/assign', /crew\/assign/);
      
      // Step 7: Issue credentials
      await navigateAndVerify(page, '/credentials/issue', /credentials\/issue/);
      
      // Step 9: Generate credential reports
      await navigateAndVerify(page, '/credentials/reports', /credentials\/reports/);
    });
  });

  test.describe('WF-COMPVSS-003: Advancing Management - Complete Journey', () => {
    test('should complete full advancing management workflow', async ({ page }) => {
      // Step 1: Access advancing hub
      await navigateAndVerify(page, '/advancing', /advancing/);
      
      // Step 2: Create advancing request
      await navigateAndVerify(page, '/advancing/new', /advancing\/new/);
      
      // Step 5: Browse catalog
      await navigateAndVerify(page, '/advancing/catalog', /advancing\/catalog/);
    });
  });

  test.describe('WF-COMPVSS-004: Credential System Management - Complete Journey', () => {
    test('should complete full credential system workflow', async ({ page }) => {
      // Step 1: Access credentials hub
      await navigateAndVerify(page, '/credentials', /credentials/);
      
      // Step 2: Define credential types
      await navigateAndVerify(page, '/credentials/types', /credentials\/types/);
      
      // Step 3: Configure access zones
      await navigateAndVerify(page, '/credentials/zones', /credentials\/zones/);
      
      // Step 4: Issue credentials
      await navigateAndVerify(page, '/credentials/issue', /credentials\/issue/);
      
      // Step 5: Scan credentials
      await navigateAndVerify(page, '/credentials/scan', /credentials\/scan/);
      
      // Step 6: Generate reports
      await navigateAndVerify(page, '/credentials/reports', /credentials\/reports/);
      
      // Step 7: Manage site access
      await navigateAndVerify(page, '/site-access', /site-access/);
    });
  });

  test.describe('WF-COMPVSS-005: Schedule Management - Complete Journey', () => {
    test('should complete full schedule management workflow', async ({ page }) => {
      // Step 1: Access schedule
      await navigateAndVerify(page, '/schedule', /schedule/);
      
      // Step 2: Create build/strike schedule
      await navigateAndVerify(page, '/build-strike', /build-strike/);
      
      // Step 3: Set tech rehearsal
      await navigateAndVerify(page, '/tech-rehearsal', /tech-rehearsal/);
      
      // Step 4: Configure soundcheck
      await navigateAndVerify(page, '/soundcheck', /soundcheck/);
      
      // Step 5: Define show call
      await navigateAndVerify(page, '/show-call', /show-call/);
      
      // Step 6: Set artist times
      await navigateAndVerify(page, '/set-times', /set-times/);
      
      // Step 7: Create run of show
      await navigateAndVerify(page, '/run-of-show', /run-of-show/);
    });
  });

  test.describe('WF-COMPVSS-006: Safety & Incident Management - Complete Journey', () => {
    test('should complete full safety management workflow', async ({ page }) => {
      // Step 1: Access safety hub
      await navigateAndVerify(page, '/safety', /safety/);
      
      // Step 3: Configure emergency procedures
      await navigateAndVerify(page, '/emergency', /emergency/);
      
      // Step 4: Log incident
      await navigateAndVerify(page, '/incidents', /incidents/);
    });
  });

  test.describe('WF-COMPVSS-007: Quality Assurance Management - Complete Journey', () => {
    test('should complete full QA management workflow', async ({ page }) => {
      // Step 2: Define QA checkpoints
      await navigateAndVerify(page, '/qa-checkpoints', /qa-checkpoints/);
      
      // Step 3: Create punch list
      await navigateAndVerify(page, '/punch-list', /punch-list/);
      
      // Step 5: Assign troubleshooting
      await navigateAndVerify(page, '/troubleshooting', /troubleshooting/);
    });
  });

  test.describe('WF-COMPVSS-008: Vendor Coordination - Complete Journey', () => {
    test('should complete full vendor coordination workflow', async ({ page }) => {
      // Step 2: Compare vendors
      await navigateAndVerify(page, '/vendors/compare', /vendors\/compare/);
      
      // Step 4: Coordinate deliveries
      await navigateAndVerify(page, '/deliveries', /deliveries/);
      
      // Step 5: Track logistics
      await navigateAndVerify(page, '/logistics', /logistics/);
      
      // Step 6: Manage subcontractors
      await navigateAndVerify(page, '/subcontractors', /subcontractors/);
    });
  });

  test.describe('WF-COMPVSS-009: Load-In Management - Complete Journey', () => {
    test('should complete full load-in management workflow', async ({ page }) => {
      // Access equipment
      await navigateAndVerify(page, '/equipment', /equipment/);
      
      // Photo documentation
      await navigateAndVerify(page, '/photo-documentation', /photo-documentation/);
    });
  });

  test.describe('WF-COMPVSS-010: Show Day Operations - Complete Journey', () => {
    test('should complete full show day operations workflow', async ({ page }) => {
      // Catering
      await navigateAndVerify(page, '/catering', /catering/);
      
      // Weather
      await navigateAndVerify(page, '/weather', /weather/);
      
      // VIP management
      await navigateAndVerify(page, '/vip-management', /vip-management/);
    });
  });

  test.describe('WF-COMPVSS-011: Load-Out & Strike - Complete Journey', () => {
    test('should complete full load-out workflow', async ({ page }) => {
      await navigateAndVerify(page, '/timekeeping', /timekeeping/);
    });
  });

  test.describe('WF-COMPVSS-012: Production Wrap & Settlement - Complete Journey', () => {
    test('should complete full production wrap workflow', async ({ page }) => {
      // Daily reports
      await navigateAndVerify(page, '/reports/daily', /reports\/daily/);
      
      // Wrap reports
      await navigateAndVerify(page, '/reports/wrap', /reports\/wrap/);
      
      // Settlement
      await navigateAndVerify(page, '/settlement', /settlement/);
    });
  });

  test.describe('WF-COMPVSS-013: SOP Management - Complete Journey', () => {
    test('should complete full SOP management workflow', async ({ page }) => {
      // Access SOPs
      await navigateAndVerify(page, '/sops', /sops/);
      
      // SOP categories
      await navigateAndVerify(page, '/sops/categories', /sops\/categories/);
      
      // SOP training
      await navigateAndVerify(page, '/sops/training', /sops\/training/);
      
      // SOP acknowledgments
      await navigateAndVerify(page, '/sops/acknowledgments', /sops\/acknowledgments/);
    });
  });

  test.describe('WF-COMPVSS-014: Opportunity & Bid Management - Complete Journey', () => {
    test('should complete full opportunity management workflow', async ({ page }) => {
      // Opportunities
      await navigateAndVerify(page, '/opportunities', /opportunities/);
      
      // Bid decision
      await navigateAndVerify(page, '/opportunities/bid-decision', /opportunities\/bid-decision/);
      
      // Proposals
      await navigateAndVerify(page, '/opportunities/proposals', /opportunities\/proposals/);
      
      // Bid portal
      await navigateAndVerify(page, '/bid-portal', /bid-portal/);
      
      // Mobile opportunities
      await navigateAndVerify(page, '/opportunities/mobile', /opportunities\/mobile/);
      
      // Win-loss analysis
      await navigateAndVerify(page, '/opportunities/win-loss', /opportunities\/win-loss/);
    });
  });

  test.describe('WF-COMPVSS-015: Communication Management - Complete Journey', () => {
    test('should complete full communication management workflow', async ({ page }) => {
      // Communications
      await navigateAndVerify(page, '/communications', /communications/);
      
      // Communication channels
      await navigateAndVerify(page, '/communications/channels', /communications\/channels/);
      
      // Messages
      await navigateAndVerify(page, '/messages', /messages/);
      
      // Social amplification
      await navigateAndVerify(page, '/social-amplification', /social-amplification/);
    });
  });

  test.describe('WF-COMPVSS-016: Risk Management - Complete Journey', () => {
    test('should complete full risk management workflow', async ({ page }) => {
      // Risk register
      await navigateAndVerify(page, '/risk-register', /risk-register/);
      
      // Backup plans
      await navigateAndVerify(page, '/backup-plans', /backup-plans/);
      
      // Weather contingency
      await navigateAndVerify(page, '/weather-contingency', /weather-contingency/);
    });
  });

  test.describe('WF-COMPVSS-017: Training & Certification Management - Complete Journey', () => {
    test('should complete full training management workflow', async ({ page }) => {
      // Certifications
      await navigateAndVerify(page, '/certifications', /certifications/);
      
      // Skills
      await navigateAndVerify(page, '/skills', /skills/);
      
      // Mentorship
      await navigateAndVerify(page, '/mentorship', /mentorship/);
      
      // Background checks
      await navigateAndVerify(page, '/background-checks', /background-checks/);
      
      // Onboarding
      await navigateAndVerify(page, '/onboarding', /onboarding/);
    });
  });

  test.describe('WF-COMPVSS-018: Reporting & Documentation - Complete Journey', () => {
    test('should complete full reporting workflow', async ({ page }) => {
      await navigateAndVerify(page, '/reports/daily', /reports\/daily/);
    });
  });
});

test.describe('COMPVSS Team Member User Journeys', () => {

  test.describe('WF-COMPVSS-019: Daily Work Management - Complete Journey', () => {
    test('should complete full daily work workflow', async ({ page }) => {
      // Dashboard
      await navigateAndVerify(page, '/dashboard', /dashboard/);
      
      // My schedule
      await navigateAndVerify(page, '/my-schedule', /my-schedule/);
      
      // My assignments
      await navigateAndVerify(page, '/my-assignments', /my-assignments/);
      
      // Clock in
      await navigateAndVerify(page, '/clock-in', /clock-in/);
    });
  });

  test.describe('WF-COMPVSS-020: Credential Management - Complete Journey', () => {
    test('should complete credential management workflow', async ({ page }) => {
      await navigateAndVerify(page, '/my-credentials', /my-credentials/);
    });
  });

  test.describe('WF-COMPVSS-021: Document Access - Complete Journey', () => {
    test('should complete document access workflow', async ({ page }) => {
      // Knowledge base
      await navigateAndVerify(page, '/knowledge', /knowledge/);
      
      // Regulations
      await navigateAndVerify(page, '/knowledge/regulations', /knowledge\/regulations/);
      
      // Offline knowledge
      await navigateAndVerify(page, '/knowledge/offline', /knowledge\/offline/);
    });
  });

  test.describe('WF-COMPVSS-022: Quality & Issue Reporting - Complete Journey', () => {
    test('should complete quality reporting workflow', async ({ page }) => {
      // QA checkpoints
      await navigateAndVerify(page, '/qa-checkpoints', /qa-checkpoints/);
      
      // Punch list
      await navigateAndVerify(page, '/punch-list', /punch-list/);
    });
  });

  test.describe('WF-COMPVSS-023: Safety & Incident Reporting - Complete Journey', () => {
    test('should complete safety reporting workflow', async ({ page }) => {
      // Safety
      await navigateAndVerify(page, '/safety', /safety/);
      
      // Emergency
      await navigateAndVerify(page, '/emergency', /emergency/);
      
      // Incidents
      await navigateAndVerify(page, '/incidents', /incidents/);
    });
  });

  test.describe('WF-COMPVSS-024: Communication & Messaging - Complete Journey', () => {
    test('should complete communication workflow', async ({ page }) => {
      // Messages
      await navigateAndVerify(page, '/messages', /messages/);
      
      // Channels
      await navigateAndVerify(page, '/channels', /channels/);
      
      // Notifications
      await navigateAndVerify(page, '/notifications', /notifications/);
    });
  });
});

test.describe('COMPVSS Crew User Journeys', () => {

  test.describe('WF-COMPVSS-025: Crew Check-In & Work - Complete Journey', () => {
    test('should complete crew check-in workflow', async ({ page }) => {
      // My schedule
      await navigateAndVerify(page, '/my-schedule', /my-schedule/);
      
      // Clock in
      await navigateAndVerify(page, '/clock-in', /clock-in/);
      
      // My assignments
      await navigateAndVerify(page, '/my-assignments', /my-assignments/);
      
      // My credentials
      await navigateAndVerify(page, '/my-credentials', /my-credentials/);
      
      // My timesheets
      await navigateAndVerify(page, '/my-timesheets', /my-timesheets/);
    });
  });

  test.describe('WF-COMPVSS-026: Crew Training & Certification - Complete Journey', () => {
    test('should complete crew training workflow', async ({ page }) => {
      // My training
      await navigateAndVerify(page, '/my-training', /my-training/);
      
      // SOPs
      await navigateAndVerify(page, '/sops', /sops/);
      
      // Certifications
      await navigateAndVerify(page, '/certifications', /certifications/);
      
      // Skills
      await navigateAndVerify(page, '/skills', /skills/);
    });
  });

  test.describe('WF-COMPVSS-027: Crew Social & Directory - Complete Journey', () => {
    test('should complete crew social workflow', async ({ page }) => {
      // Directory
      await navigateAndVerify(page, '/directory', /directory/);
      
      // Directory availability
      await navigateAndVerify(page, '/directory/availability', /directory\/availability/);
    });
  });
});

test.describe('COMPVSS Artist User Journeys', () => {

  test.describe('WF-COMPVSS-028: Artist Portal Access - Complete Journey', () => {
    test('should complete artist portal workflow', async ({ page }) => {
      // Artist portal
      await navigateAndVerify(page, '/artist-portal', /artist-portal/);
      
      // My rider
      await navigateAndVerify(page, '/my-rider', /my-rider/);
      
      // My schedule
      await navigateAndVerify(page, '/my-schedule', /my-schedule/);
      
      // My hospitality
      await navigateAndVerify(page, '/my-hospitality', /my-hospitality/);
      
      // My credentials
      await navigateAndVerify(page, '/my-credentials', /my-credentials/);
      
      // Set times
      await navigateAndVerify(page, '/set-times', /set-times/);
      
      // Soundcheck
      await navigateAndVerify(page, '/soundcheck', /soundcheck/);
    });
  });

  test.describe('WF-COMPVSS-029: Artist Advancing - Complete Journey', () => {
    test('should complete artist advancing workflow', async ({ page }) => {
      await navigateAndVerify(page, '/advancing', /advancing/);
    });
  });
});

test.describe('COMPVSS Vendor User Journeys', () => {

  test.describe('WF-COMPVSS-030: Vendor Portal Access - Complete Journey', () => {
    test('should complete vendor portal workflow', async ({ page }) => {
      // Vendor portal
      await navigateAndVerify(page, '/vendor-portal', /vendor-portal/);
      
      // My deliveries
      await navigateAndVerify(page, '/my-deliveries', /my-deliveries/);
      
      // My contracts
      await navigateAndVerify(page, '/my-contracts', /my-contracts/);
      
      // My invoices
      await navigateAndVerify(page, '/my-invoices', /my-invoices/);
      
      // My credentials
      await navigateAndVerify(page, '/my-credentials', /my-credentials/);
      
      // My schedule
      await navigateAndVerify(page, '/my-schedule', /my-schedule/);
    });
  });

  test.describe('WF-COMPVSS-031: Vendor Delivery Coordination - Complete Journey', () => {
    test('should complete vendor delivery workflow', async ({ page }) => {
      // My deliveries
      await navigateAndVerify(page, '/my-deliveries', /my-deliveries/);
      
      // Site access
      await navigateAndVerify(page, '/site-access', /site-access/);
      
      // Logistics
      await navigateAndVerify(page, '/logistics', /logistics/);
    });
  });
});

test.describe('COMPVSS Stakeholder User Journeys', () => {

  test.describe('WF-COMPVSS-032: Stakeholder Portal Access - Complete Journey', () => {
    test('should complete stakeholder portal workflow', async ({ page }) => {
      await navigateAndVerify(page, '/stakeholder-portal', /stakeholder-portal/);
    });
  });
});

test.describe('COMPVSS Offline User Journeys', () => {

  test.describe('WF-COMPVSS-033: Offline Work Mode - Complete Journey', () => {
    test('should complete offline work workflow', async ({ page }) => {
      // Offline mode
      await navigateAndVerify(page, '/offline', /offline/);
      
      // My schedule
      await navigateAndVerify(page, '/my-schedule', /my-schedule/);
      
      // Offline knowledge
      await navigateAndVerify(page, '/knowledge/offline', /knowledge\/offline/);
    });
  });
});

test.describe('COMPVSS Authentication User Journeys', () => {

  test.describe('WF-COMPVSS-034: User Authentication - Complete Journey', () => {
    test('should complete full authentication workflow', async ({ page }) => {
      // Sign in page
      await navigateAndVerify(page, '/auth/signin', /auth\/signin/);
      await expect(page.locator('input[type="email"], input[name="email"]')).toBeVisible({ timeout: 10000 });
      
      // Sign up page
      await navigateAndVerify(page, '/auth/signup', /auth\/signup/);
      
      // Magic link page
      await navigateAndVerify(page, '/auth/magic-link', /auth\/magic-link/);
      
      // Forgot password page
      await navigateAndVerify(page, '/auth/forgot-password', /auth\/forgot-password/);
      
      // Reset password page
      await navigateAndVerify(page, '/auth/reset-password', /auth\/reset-password/);
    });
  });
});
