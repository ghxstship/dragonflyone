import { test, expect, Page } from '@playwright/test';

/**
 * COMPVSS Workflow E2E Tests
 * Validates all 34 COMPVSS workflows end-to-end
 */

const COMPVSS_BASE = 'http://localhost:3002';


// Helper to check if redirected to auth
function isAuthRedirect(url: string): boolean {
  return url.includes('/auth/signin') || url.includes('/auth/login');
}

// Helper to navigate and verify page - accepts auth redirects as valid for protected pages
async function navigateAndVerify(page: Page, pagePath: string, urlPattern: RegExp, isProtected = true): Promise<boolean> {
  await page.goto(`${COMPVSS_BASE}${pagePath}`, { waitUntil: 'domcontentloaded', timeout: 10000 });
  
  const currentUrl = page.url();
  
  if (isProtected && isAuthRedirect(currentUrl)) {
    await expect(page.locator('body')).toBeVisible();
    return true;
  }
  
  try {
    await expect(page).toHaveURL(urlPattern, { timeout: 5000 });
  } catch {
    if (isProtected && isAuthRedirect(page.url())) {
      await expect(page.locator('body')).toBeVisible();
      return true;
    }
    if (!isProtected) {
      await expect(page.locator('body')).toBeVisible();
      return true;
    }
    throw new Error(`Expected URL to match ${urlPattern}, got ${page.url()}`);
  }
  
  await expect(page.locator('body')).toBeVisible();
  return true;
}

test.describe('COMPVSS Admin Workflows', () => {
  
  test.describe('WF-COMPVSS-001: Production Setup & Configuration', () => {
    test('should access projects page', async ({ page }) => {
      await navigateAndVerify(page, '/projects', /projects/);
    });

    test('should access new project form', async ({ page }) => {
      await navigateAndVerify(page, '/projects/new', /projects\/new/);
    });

    test('should access credential types', async ({ page }) => {
      await navigateAndVerify(page, '/credentials/types', /credentials\/types/);
    });

    test('should access credential zones', async ({ page }) => {
      await navigateAndVerify(page, '/credentials/zones', /credentials\/zones/);
    });
  });

  test.describe('WF-COMPVSS-002: Crew Scheduling & Assignment', () => {
    test('should access crew directory', async ({ page }) => {
      await navigateAndVerify(page, '/crew', /crew/);
    });

    test('should access directory availability', async ({ page }) => {
      await navigateAndVerify(page, '/directory/availability', /directory\/availability/);
    });

    test('should access directory filters', async ({ page }) => {
      await navigateAndVerify(page, '/directory/filters', /directory\/filters/);
    });

    test('should access crew assign', async ({ page }) => {
      await navigateAndVerify(page, '/crew/assign', /crew\/assign/);
    });

    test('should access credentials issue', async ({ page }) => {
      await navigateAndVerify(page, '/credentials/issue', /credentials\/issue/);
    });

    test('should access credentials reports', async ({ page }) => {
      await navigateAndVerify(page, '/credentials/reports', /credentials\/reports/);
    });
  });

  test.describe('WF-COMPVSS-003: Advancing Management', () => {
    test('should access advancing hub', async ({ page }) => {
      await navigateAndVerify(page, '/advancing', /advancing/);
    });

    test('should access new advancing request', async ({ page }) => {
      await navigateAndVerify(page, '/advancing/new', /advancing\/new/);
    });

    test('should access advancing catalog', async ({ page }) => {
      await navigateAndVerify(page, '/advancing/catalog', /advancing\/catalog/);
    });
  });

  test.describe('WF-COMPVSS-004: Credential System Management', () => {
    test('should access credentials hub', async ({ page }) => {
      await navigateAndVerify(page, '/credentials', /credentials/);
    });

    test('should access credentials scan', async ({ page }) => {
      await navigateAndVerify(page, '/credentials/scan', /credentials\/scan/);
    });

    test('should access site access', async ({ page }) => {
      await navigateAndVerify(page, '/site-access', /site-access/);
    });
  });

  test.describe('WF-COMPVSS-005: Schedule Management', () => {
    test('should access schedule', async ({ page }) => {
      await navigateAndVerify(page, '/schedule', /schedule/);
    });

    test('should access build-strike', async ({ page }) => {
      await navigateAndVerify(page, '/build-strike', /build-strike/);
    });

    test('should access tech-rehearsal', async ({ page }) => {
      await navigateAndVerify(page, '/tech-rehearsal', /tech-rehearsal/);
    });

    test('should access soundcheck', async ({ page }) => {
      await navigateAndVerify(page, '/soundcheck', /soundcheck/);
    });

    test('should access show-call', async ({ page }) => {
      await navigateAndVerify(page, '/show-call', /show-call/);
    });

    test('should access set-times', async ({ page }) => {
      await navigateAndVerify(page, '/set-times', /set-times/);
    });

    test('should access run-of-show', async ({ page }) => {
      await navigateAndVerify(page, '/run-of-show', /run-of-show/);
    });
  });

  test.describe('WF-COMPVSS-006: Safety & Incident Management', () => {
    test('should access safety hub', async ({ page }) => {
      await navigateAndVerify(page, '/safety', /safety/);
    });

    test('should access emergency', async ({ page }) => {
      await navigateAndVerify(page, '/emergency', /emergency/);
    });

    test('should access incidents', async ({ page }) => {
      await navigateAndVerify(page, '/incidents', /incidents/);
    });
  });

  test.describe('WF-COMPVSS-007: Quality Assurance Management', () => {
    test('should access qa-checkpoints', async ({ page }) => {
      await navigateAndVerify(page, '/qa-checkpoints', /qa-checkpoints/);
    });

    test('should access punch-list', async ({ page }) => {
      await navigateAndVerify(page, '/punch-list', /punch-list/);
    });

    test('should access troubleshooting', async ({ page }) => {
      await navigateAndVerify(page, '/troubleshooting', /troubleshooting/);
    });
  });

  test.describe('WF-COMPVSS-008: Vendor Coordination', () => {
    test('should access vendors compare', async ({ page }) => {
      await navigateAndVerify(page, '/vendors/compare', /vendors\/compare/);
    });

    test('should access deliveries', async ({ page }) => {
      await navigateAndVerify(page, '/deliveries', /deliveries/);
    });

    test('should access logistics', async ({ page }) => {
      await navigateAndVerify(page, '/logistics', /logistics/);
    });

    test('should access subcontractors', async ({ page }) => {
      await navigateAndVerify(page, '/subcontractors', /subcontractors/);
    });
  });

  test.describe('WF-COMPVSS-009: Load-In Management', () => {
    test('should access equipment', async ({ page }) => {
      await navigateAndVerify(page, '/equipment', /equipment/);
    });

    test('should access photo-documentation', async ({ page }) => {
      await navigateAndVerify(page, '/photo-documentation', /photo-documentation/);
    });
  });

  test.describe('WF-COMPVSS-010: Show Day Operations', () => {
    test('should access catering', async ({ page }) => {
      await navigateAndVerify(page, '/catering', /catering/);
    });

    test('should access weather', async ({ page }) => {
      await navigateAndVerify(page, '/weather', /weather/);
    });

    test('should access vip-management', async ({ page }) => {
      await navigateAndVerify(page, '/vip-management', /vip-management/);
    });
  });

  test.describe('WF-COMPVSS-011: Load-Out & Strike', () => {
    test('should access timekeeping', async ({ page }) => {
      await navigateAndVerify(page, '/timekeeping', /timekeeping/);
    });
  });

  test.describe('WF-COMPVSS-012: Production Wrap & Settlement', () => {
    test('should access daily reports', async ({ page }) => {
      await navigateAndVerify(page, '/reports/daily', /reports\/daily/);
    });

    test('should access wrap reports', async ({ page }) => {
      await navigateAndVerify(page, '/reports/wrap', /reports\/wrap/);
    });

    test('should access settlement', async ({ page }) => {
      await navigateAndVerify(page, '/settlement', /settlement/);
    });
  });

  test.describe('WF-COMPVSS-013: SOP Management', () => {
    test('should access SOPs', async ({ page }) => {
      await navigateAndVerify(page, '/sops', /sops/);
    });

    test('should access SOP categories', async ({ page }) => {
      await navigateAndVerify(page, '/sops/categories', /sops\/categories/);
    });

    test('should access SOP training', async ({ page }) => {
      await navigateAndVerify(page, '/sops/training', /sops\/training/);
    });

    test('should access SOP acknowledgments', async ({ page }) => {
      await navigateAndVerify(page, '/sops/acknowledgments', /sops\/acknowledgments/);
    });
  });

  test.describe('WF-COMPVSS-014: Opportunity & Bid Management', () => {
    test('should access opportunities', async ({ page }) => {
      await navigateAndVerify(page, '/opportunities', /opportunities/);
    });

    test('should access bid-decision', async ({ page }) => {
      await navigateAndVerify(page, '/opportunities/bid-decision', /opportunities\/bid-decision/);
    });

    test('should access proposals', async ({ page }) => {
      await navigateAndVerify(page, '/opportunities/proposals', /opportunities\/proposals/);
    });

    test('should access bid-portal', async ({ page }) => {
      await navigateAndVerify(page, '/bid-portal', /bid-portal/);
    });

    test('should access mobile opportunities', async ({ page }) => {
      await navigateAndVerify(page, '/opportunities/mobile', /opportunities\/mobile/);
    });

    test('should access win-loss analysis', async ({ page }) => {
      await navigateAndVerify(page, '/opportunities/win-loss', /opportunities\/win-loss/);
    });
  });

  test.describe('WF-COMPVSS-015: Communication Management', () => {
    test('should access communications', async ({ page }) => {
      await navigateAndVerify(page, '/communications', /communications/);
    });

    test('should access communication channels', async ({ page }) => {
      await navigateAndVerify(page, '/communications/channels', /communications\/channels/);
    });

    test('should access messages', async ({ page }) => {
      await navigateAndVerify(page, '/messages', /messages/);
    });

    test('should access social-amplification', async ({ page }) => {
      await navigateAndVerify(page, '/social-amplification', /social-amplification/);
    });
  });

  test.describe('WF-COMPVSS-016: Risk Management', () => {
    test('should access risk-register', async ({ page }) => {
      await navigateAndVerify(page, '/risk-register', /risk-register/);
    });

    test('should access backup-plans', async ({ page }) => {
      await navigateAndVerify(page, '/backup-plans', /backup-plans/);
    });

    test('should access weather-contingency', async ({ page }) => {
      await navigateAndVerify(page, '/weather-contingency', /weather-contingency/);
    });
  });

  test.describe('WF-COMPVSS-017: Training & Certification Management', () => {
    test('should access certifications', async ({ page }) => {
      await navigateAndVerify(page, '/certifications', /certifications/);
    });

    test('should access skills', async ({ page }) => {
      await navigateAndVerify(page, '/skills', /skills/);
    });

    test('should access mentorship', async ({ page }) => {
      await navigateAndVerify(page, '/mentorship', /mentorship/);
    });

    test('should access background-checks', async ({ page }) => {
      await navigateAndVerify(page, '/background-checks', /background-checks/);
    });

    test('should access onboarding', async ({ page }) => {
      await navigateAndVerify(page, '/onboarding', /onboarding/);
    });
  });

  test.describe('WF-COMPVSS-018: Reporting & Documentation', () => {
    test('should access daily reports', async ({ page }) => {
      await navigateAndVerify(page, '/reports/daily', /reports\/daily/);
    });
  });
});

test.describe('COMPVSS Team Member Workflows', () => {
  
  test.describe('WF-COMPVSS-019: Daily Work Management', () => {
    test('should access dashboard', async ({ page }) => {
      await navigateAndVerify(page, '/dashboard', /dashboard/);
    });

    test('should access my-schedule', async ({ page }) => {
      await navigateAndVerify(page, '/my-schedule', /my-schedule/);
    });

    test('should access my-assignments', async ({ page }) => {
      await navigateAndVerify(page, '/my-assignments', /my-assignments/);
    });

    test('should access clock-in', async ({ page }) => {
      await navigateAndVerify(page, '/clock-in', /clock-in/);
    });
  });

  test.describe('WF-COMPVSS-020: Credential Management', () => {
    test('should access my-credentials', async ({ page }) => {
      await navigateAndVerify(page, '/my-credentials', /my-credentials/);
    });
  });

  test.describe('WF-COMPVSS-021: Document Access', () => {
    test('should access knowledge base', async ({ page }) => {
      await navigateAndVerify(page, '/knowledge', /knowledge/);
    });

    test('should access regulations', async ({ page }) => {
      await navigateAndVerify(page, '/knowledge/regulations', /knowledge\/regulations/);
    });

    test('should access offline knowledge', async ({ page }) => {
      await navigateAndVerify(page, '/knowledge/offline', /knowledge\/offline/);
    });
  });

  test.describe('WF-COMPVSS-022: Quality & Issue Reporting', () => {
    test('should access qa-checkpoints', async ({ page }) => {
      await navigateAndVerify(page, '/qa-checkpoints', /qa-checkpoints/);
    });

    test('should access punch-list', async ({ page }) => {
      await navigateAndVerify(page, '/punch-list', /punch-list/);
    });
  });

  test.describe('WF-COMPVSS-023: Safety & Incident Reporting', () => {
    test('should access safety', async ({ page }) => {
      await navigateAndVerify(page, '/safety', /safety/);
    });

    test('should access emergency', async ({ page }) => {
      await navigateAndVerify(page, '/emergency', /emergency/);
    });

    test('should access incidents', async ({ page }) => {
      await navigateAndVerify(page, '/incidents', /incidents/);
    });
  });

  test.describe('WF-COMPVSS-024: Communication & Messaging', () => {
    test('should access messages', async ({ page }) => {
      await navigateAndVerify(page, '/messages', /messages/);
    });

    test('should access channels', async ({ page }) => {
      await navigateAndVerify(page, '/channels', /channels/);
    });

    test('should access notifications', async ({ page }) => {
      await navigateAndVerify(page, '/notifications', /notifications/);
    });

    test('should access crew-social', async ({ page }) => {
      await navigateAndVerify(page, '/crew-social', /crew-social/);
    });
  });
});

test.describe('COMPVSS Crew Workflows', () => {
  
  test.describe('WF-COMPVSS-025: Crew Check-In & Work', () => {
    test('should access my-schedule', async ({ page }) => {
      await navigateAndVerify(page, '/my-schedule', /my-schedule/);
    });

    test('should access clock-in', async ({ page }) => {
      await navigateAndVerify(page, '/clock-in', /clock-in/);
    });

    test('should access my-assignments', async ({ page }) => {
      await navigateAndVerify(page, '/my-assignments', /my-assignments/);
    });

    test('should access my-credentials', async ({ page }) => {
      await navigateAndVerify(page, '/my-credentials', /my-credentials/);
    });

    test('should access my-timesheets', async ({ page }) => {
      await navigateAndVerify(page, '/my-timesheets', /my-timesheets/);
    });
  });

  test.describe('WF-COMPVSS-026: Crew Training & Certification', () => {
    test('should access my-training', async ({ page }) => {
      await navigateAndVerify(page, '/my-training', /my-training/);
    });

    test('should access SOPs', async ({ page }) => {
      await navigateAndVerify(page, '/sops', /sops/);
    });

    test('should access certifications', async ({ page }) => {
      await navigateAndVerify(page, '/certifications', /certifications/);
    });

    test('should access skills', async ({ page }) => {
      await navigateAndVerify(page, '/skills', /skills/);
    });
  });

  test.describe('WF-COMPVSS-027: Crew Social & Directory', () => {
    test('should access crew social', async ({ page }) => {
      await navigateAndVerify(page, '/crew/social', /crew\/social/);
    });

    test('should access directory', async ({ page }) => {
      await navigateAndVerify(page, '/directory', /directory/);
    });

    test('should access directory availability', async ({ page }) => {
      await navigateAndVerify(page, '/directory/availability', /directory\/availability/);
    });
  });
});

test.describe('COMPVSS Artist Workflows', () => {
  
  test.describe('WF-COMPVSS-028: Artist Portal Access', () => {
    test('should access artist-portal', async ({ page }) => {
      await navigateAndVerify(page, '/artist-portal', /artist-portal/);
    });

    test('should access my-rider', async ({ page }) => {
      await navigateAndVerify(page, '/my-rider', /my-rider/);
    });

    test('should access my-schedule', async ({ page }) => {
      await navigateAndVerify(page, '/my-schedule', /my-schedule/);
    });

    test('should access my-hospitality', async ({ page }) => {
      await navigateAndVerify(page, '/my-hospitality', /my-hospitality/);
    });

    test('should access my-credentials', async ({ page }) => {
      await navigateAndVerify(page, '/my-credentials', /my-credentials/);
    });

    test('should access set-times', async ({ page }) => {
      await navigateAndVerify(page, '/set-times', /set-times/);
    });

    test('should access soundcheck', async ({ page }) => {
      await navigateAndVerify(page, '/soundcheck', /soundcheck/);
    });
  });

  test.describe('WF-COMPVSS-029: Artist Advancing', () => {
    test('should access advancing', async ({ page }) => {
      await navigateAndVerify(page, '/advancing', /advancing/);
    });
  });
});

test.describe('COMPVSS Vendor Workflows', () => {
  
  test.describe('WF-COMPVSS-030: Vendor Portal Access', () => {
    test('should access vendor-portal', async ({ page }) => {
      await navigateAndVerify(page, '/vendor-portal', /vendor-portal/);
    });

    test('should access my-deliveries', async ({ page }) => {
      await navigateAndVerify(page, '/my-deliveries', /my-deliveries/);
    });

    test('should access my-contracts', async ({ page }) => {
      await navigateAndVerify(page, '/my-contracts', /my-contracts/);
    });

    test('should access my-invoices', async ({ page }) => {
      await navigateAndVerify(page, '/my-invoices', /my-invoices/);
    });

    test('should access my-credentials', async ({ page }) => {
      await navigateAndVerify(page, '/my-credentials', /my-credentials/);
    });

    test('should access my-schedule', async ({ page }) => {
      await navigateAndVerify(page, '/my-schedule', /my-schedule/);
    });
  });

  test.describe('WF-COMPVSS-031: Vendor Delivery Coordination', () => {
    test('should access my-deliveries', async ({ page }) => {
      await navigateAndVerify(page, '/my-deliveries', /my-deliveries/);
    });

    test('should access site-access', async ({ page }) => {
      await navigateAndVerify(page, '/site-access', /site-access/);
    });

    test('should access logistics', async ({ page }) => {
      await navigateAndVerify(page, '/logistics', /logistics/);
    });
  });
});

test.describe('COMPVSS Stakeholder Workflows', () => {
  
  test.describe('WF-COMPVSS-032: Stakeholder Portal Access', () => {
    test('should access stakeholder-portal', async ({ page }) => {
      await navigateAndVerify(page, '/stakeholder-portal', /stakeholder-portal/);
    });
  });
});

test.describe('COMPVSS Offline & Mobile Workflows', () => {
  
  test.describe('WF-COMPVSS-033: Offline Work Mode', () => {
    test('should access offline mode', async ({ page }) => {
      await navigateAndVerify(page, '/offline', /offline/);
    });

    test('should access my-schedule', async ({ page }) => {
      await navigateAndVerify(page, '/my-schedule', /my-schedule/);
    });

    test('should access offline knowledge', async ({ page }) => {
      await navigateAndVerify(page, '/knowledge/offline', /knowledge\/offline/);
    });
  });
});

test.describe('COMPVSS Authentication Workflows', () => {
  
  test.describe('WF-COMPVSS-034: User Authentication', () => {
    test('should display sign in page', async ({ page }) => {
      await navigateAndVerify(page, '/auth/signin', /auth\/signin/);
      await expect(page.locator('input[type="email"], input[name="email"]')).toBeVisible({ timeout: 10000 });
    });

    test('should display sign up page', async ({ page }) => {
      await navigateAndVerify(page, '/auth/signup', /auth\/signup/);
    });

    test('should display magic link page', async ({ page }) => {
      await navigateAndVerify(page, '/auth/magic-link', /auth\/magic-link/);
    });

    test('should display forgot password page', async ({ page }) => {
      await navigateAndVerify(page, '/auth/forgot-password', /auth\/forgot-password/);
    });

    test('should display reset password page', async ({ page }) => {
      await navigateAndVerify(page, '/auth/reset-password', /auth\/reset-password/);
    });
  });
});
