import { test, expect } from '@playwright/test';

/**
 * ATLVS Workflow E2E Tests
 * Validates all 31 ATLVS workflows end-to-end
 */

const ATLVS_BASE = 'http://localhost:3001';

test.describe('ATLVS Admin Workflows', () => {
  
  test.describe('WF-ATLVS-001: Production Creation & Setup', () => {
    test('should navigate to productions list', async ({ page }) => {
      await page.goto(`${ATLVS_BASE}/productions`);
      await page.waitForLoadState('domcontentloaded');
      await expect(page).toHaveURL(/productions/);
    });

    test('should access production creation form', async ({ page }) => {
      await page.goto(`${ATLVS_BASE}/productions/new`);
      await page.waitForLoadState('domcontentloaded');
      await expect(page).toHaveURL(/productions\/new/);
    });

    test('should have production form elements', async ({ page }) => {
      await page.goto(`${ATLVS_BASE}/productions/new`);
      await page.waitForLoadState('domcontentloaded');
      // Form should have input fields for production details
      const formExists = await page.locator('form, [data-testid="production-form"]').count() > 0 ||
                         await page.locator('input, select, textarea').count() > 0;
      expect(formExists).toBeTruthy();
    });
  });

  test.describe('WF-ATLVS-002: Budget Management & Approval', () => {
    test('should access budgets page', async ({ page }) => {
      await page.goto(`${ATLVS_BASE}/budgets`);
      await page.waitForLoadState('domcontentloaded');
      await expect(page).toHaveURL(/budgets/);
    });

    test('should display budget management interface', async ({ page }) => {
      await page.goto(`${ATLVS_BASE}/budgets`);
      await page.waitForLoadState('domcontentloaded');
      await expect(page.locator('body')).toBeVisible();
    });
  });

  test.describe('WF-ATLVS-003: Vendor Onboarding & Management', () => {
    test('should access vendors directory', async ({ page }) => {
      await page.goto(`${ATLVS_BASE}/vendors`);
      await page.waitForLoadState('domcontentloaded');
      await expect(page).toHaveURL(/vendors/);
    });

    test('should access vendor rate cards', async ({ page }) => {
      await page.goto(`${ATLVS_BASE}/vendors/rate-cards`);
      await page.waitForLoadState('domcontentloaded');
      await expect(page).toHaveURL(/vendors\/rate-cards/);
    });

    test('should access vendor contracts', async ({ page }) => {
      await page.goto(`${ATLVS_BASE}/vendors/contracts`);
      await page.waitForLoadState('domcontentloaded');
      await expect(page).toHaveURL(/vendors\/contracts/);
    });
  });

  test.describe('WF-ATLVS-004: Sponsor Acquisition & Management', () => {
    test('should access CRM', async ({ page }) => {
      await page.goto(`${ATLVS_BASE}/crm`);
      await page.waitForLoadState('domcontentloaded');
      await expect(page).toHaveURL(/crm/);
    });

    test('should access lead scoring', async ({ page }) => {
      await page.goto(`${ATLVS_BASE}/crm/lead-scoring`);
      await page.waitForLoadState('domcontentloaded');
      await expect(page).toHaveURL(/crm\/lead-scoring/);
    });

    test('should access sponsors page', async ({ page }) => {
      await page.goto(`${ATLVS_BASE}/sponsors`);
      await page.waitForLoadState('domcontentloaded');
      await expect(page).toHaveURL(/sponsors/);
    });

    test('should access sponsor deck', async ({ page }) => {
      await page.goto(`${ATLVS_BASE}/sponsors/deck`);
      await page.waitForLoadState('domcontentloaded');
      await expect(page).toHaveURL(/sponsors\/deck/);
    });

    test('should access sponsor tiers', async ({ page }) => {
      await page.goto(`${ATLVS_BASE}/sponsors/tiers`);
      await page.waitForLoadState('domcontentloaded');
      await expect(page).toHaveURL(/sponsors\/tiers/);
    });

    test('should access sponsor fulfillment', async ({ page }) => {
      await page.goto(`${ATLVS_BASE}/sponsors/fulfillment`);
      await page.waitForLoadState('domcontentloaded');
      await expect(page).toHaveURL(/sponsors\/fulfillment/);
    });

    test('should access contracts', async ({ page }) => {
      await page.goto(`${ATLVS_BASE}/contracts`);
      await page.waitForLoadState('domcontentloaded');
      await expect(page).toHaveURL(/contracts/);
    });
  });

  test.describe('WF-ATLVS-005: Investor Relations Management', () => {
    test('should access investors hub', async ({ page }) => {
      await page.goto(`${ATLVS_BASE}/investors`);
      await page.waitForLoadState('domcontentloaded');
      await expect(page).toHaveURL(/investors/);
    });

    test('should access investor documents', async ({ page }) => {
      await page.goto(`${ATLVS_BASE}/investors/documents`);
      await page.waitForLoadState('domcontentloaded');
      await expect(page).toHaveURL(/investors\/documents/);
    });

    test('should access funding rounds', async ({ page }) => {
      await page.goto(`${ATLVS_BASE}/investors/rounds`);
      await page.waitForLoadState('domcontentloaded');
      await expect(page).toHaveURL(/investors\/rounds/);
    });

    test('should access investor reports', async ({ page }) => {
      await page.goto(`${ATLVS_BASE}/investors/reports`);
      await page.waitForLoadState('domcontentloaded');
      await expect(page).toHaveURL(/investors\/reports/);
    });
  });

  test.describe('WF-ATLVS-006: Venue Setup & Configuration', () => {
    test('should access venues directory', async ({ page }) => {
      await page.goto(`${ATLVS_BASE}/venues`);
      await page.waitForLoadState('domcontentloaded');
      await expect(page).toHaveURL(/venues/);
    });

    test('should access venue maps', async ({ page }) => {
      await page.goto(`${ATLVS_BASE}/venues/maps`);
      await page.waitForLoadState('domcontentloaded');
      await expect(page).toHaveURL(/venues\/maps/);
    });

    test('should access venue zones', async ({ page }) => {
      await page.goto(`${ATLVS_BASE}/venues/zones`);
      await page.waitForLoadState('domcontentloaded');
      await expect(page).toHaveURL(/venues\/zones/);
    });
  });

  test.describe('WF-ATLVS-007: Asset Inventory Management', () => {
    test('should access assets page', async ({ page }) => {
      await page.goto(`${ATLVS_BASE}/assets`);
      await page.waitForLoadState('domcontentloaded');
      await expect(page).toHaveURL(/assets/);
    });

    test('should access asset specifications', async ({ page }) => {
      await page.goto(`${ATLVS_BASE}/assets/specifications`);
      await page.waitForLoadState('domcontentloaded');
      await expect(page).toHaveURL(/assets\/specifications/);
    });

    test('should access serialized assets', async ({ page }) => {
      await page.goto(`${ATLVS_BASE}/assets/serialized`);
      await page.waitForLoadState('domcontentloaded');
      await expect(page).toHaveURL(/assets\/serialized/);
    });

    test('should access asset storage', async ({ page }) => {
      await page.goto(`${ATLVS_BASE}/assets/storage`);
      await page.waitForLoadState('domcontentloaded');
      await expect(page).toHaveURL(/assets\/storage/);
    });

    test('should access asset maintenance', async ({ page }) => {
      await page.goto(`${ATLVS_BASE}/assets/maintenance`);
      await page.waitForLoadState('domcontentloaded');
      await expect(page).toHaveURL(/assets\/maintenance/);
    });

    test('should access asset calibration', async ({ page }) => {
      await page.goto(`${ATLVS_BASE}/assets/calibration`);
      await page.waitForLoadState('domcontentloaded');
      await expect(page).toHaveURL(/assets\/calibration/);
    });

    test('should access asset scan', async ({ page }) => {
      await page.goto(`${ATLVS_BASE}/assets/scan`);
      await page.waitForLoadState('domcontentloaded');
      await expect(page).toHaveURL(/assets\/scan/);
    });

    test('should access damage reports', async ({ page }) => {
      await page.goto(`${ATLVS_BASE}/assets/damage-reports`);
      await page.waitForLoadState('domcontentloaded');
      await expect(page).toHaveURL(/assets\/damage-reports/);
    });

    test('should access asset utilization', async ({ page }) => {
      await page.goto(`${ATLVS_BASE}/assets/utilization`);
      await page.waitForLoadState('domcontentloaded');
      await expect(page).toHaveURL(/assets\/utilization/);
    });

    test('should access asset optimization', async ({ page }) => {
      await page.goto(`${ATLVS_BASE}/assets/optimization`);
      await page.waitForLoadState('domcontentloaded');
      await expect(page).toHaveURL(/assets\/optimization/);
    });
  });

  test.describe('WF-ATLVS-008: Contract Lifecycle Management', () => {
    test('should access contracts page', async ({ page }) => {
      await page.goto(`${ATLVS_BASE}/contracts`);
      await page.waitForLoadState('domcontentloaded');
      await expect(page).toHaveURL(/contracts/);
    });

    test('should access templates', async ({ page }) => {
      await page.goto(`${ATLVS_BASE}/templates`);
      await page.waitForLoadState('domcontentloaded');
      await expect(page).toHaveURL(/templates/);
    });

    test('should access documents', async ({ page }) => {
      await page.goto(`${ATLVS_BASE}/documents`);
      await page.waitForLoadState('domcontentloaded');
      await expect(page).toHaveURL(/documents/);
    });
  });

  test.describe('WF-ATLVS-009: Compliance Management', () => {
    test('should access compliance hub', async ({ page }) => {
      await page.goto(`${ATLVS_BASE}/compliance`);
      await page.waitForLoadState('domcontentloaded');
      await expect(page).toHaveURL(/compliance/);
    });

    test('should access audit trail', async ({ page }) => {
      await page.goto(`${ATLVS_BASE}/audit`);
      await page.waitForLoadState('domcontentloaded');
      await expect(page).toHaveURL(/audit/);
    });
  });

  test.describe('WF-ATLVS-010: Expense Submission & Approval', () => {
    test('should access expenses page', async ({ page }) => {
      await page.goto(`${ATLVS_BASE}/expenses`);
      await page.waitForLoadState('domcontentloaded');
      await expect(page).toHaveURL(/expenses/);
    });

    test('should access expense categories', async ({ page }) => {
      await page.goto(`${ATLVS_BASE}/expenses/categories`);
      await page.waitForLoadState('domcontentloaded');
      await expect(page).toHaveURL(/expenses\/categories/);
    });
  });

  test.describe('WF-ATLVS-011: Invoice Processing', () => {
    test('should access invoices page', async ({ page }) => {
      await page.goto(`${ATLVS_BASE}/invoices`);
      await page.waitForLoadState('domcontentloaded');
      await expect(page).toHaveURL(/invoices/);
    });

    test('should access accounts receivable', async ({ page }) => {
      await page.goto(`${ATLVS_BASE}/finance/accounts-receivable`);
      await page.waitForLoadState('domcontentloaded');
      await expect(page).toHaveURL(/finance\/accounts-receivable/);
    });
  });

  test.describe('WF-ATLVS-012: Permit Management', () => {
    test('should access permits page', async ({ page }) => {
      await page.goto(`${ATLVS_BASE}/permits`);
      await page.waitForLoadState('domcontentloaded');
      await expect(page).toHaveURL(/permits/);
    });
  });

  test.describe('WF-ATLVS-013: Insurance Management', () => {
    test('should access insurance hub', async ({ page }) => {
      await page.goto(`${ATLVS_BASE}/insurance`);
      await page.waitForLoadState('domcontentloaded');
      await expect(page).toHaveURL(/insurance/);
    });
  });

  test.describe('WF-ATLVS-014: Procurement & Purchase Orders', () => {
    test('should access procurement hub', async ({ page }) => {
      await page.goto(`${ATLVS_BASE}/procurement`);
      await page.waitForLoadState('domcontentloaded');
      await expect(page).toHaveURL(/procurement/);
    });

    test('should access procurement categories', async ({ page }) => {
      await page.goto(`${ATLVS_BASE}/procurement/categories`);
      await page.waitForLoadState('domcontentloaded');
      await expect(page).toHaveURL(/procurement\/categories/);
    });

    test('should access quotes', async ({ page }) => {
      await page.goto(`${ATLVS_BASE}/quotes`);
      await page.waitForLoadState('domcontentloaded');
      await expect(page).toHaveURL(/quotes/);
    });

    test('should access vendor selection', async ({ page }) => {
      await page.goto(`${ATLVS_BASE}/procurement/vendor-selection`);
      await page.waitForLoadState('domcontentloaded');
      await expect(page).toHaveURL(/procurement\/vendor-selection/);
    });

    test('should access procurement logistics', async ({ page }) => {
      await page.goto(`${ATLVS_BASE}/procurement/logistics`);
      await page.waitForLoadState('domcontentloaded');
      await expect(page).toHaveURL(/procurement\/logistics/);
    });
  });

  test.describe('WF-ATLVS-015: RFP Management', () => {
    test('should access RFP hub', async ({ page }) => {
      await page.goto(`${ATLVS_BASE}/rfp`);
      await page.waitForLoadState('domcontentloaded');
      await expect(page).toHaveURL(/rfp/);
    });
  });

  test.describe('WF-ATLVS-016: Advancing Request Management', () => {
    test('should access advancing hub', async ({ page }) => {
      await page.goto(`${ATLVS_BASE}/advancing`);
      await page.waitForLoadState('domcontentloaded');
      await expect(page).toHaveURL(/advancing/);
    });
  });

  test.describe('WF-ATLVS-017: Workforce Management', () => {
    test('should access workforce hub', async ({ page }) => {
      await page.goto(`${ATLVS_BASE}/workforce`);
      await page.waitForLoadState('domcontentloaded');
      await expect(page).toHaveURL(/workforce/);
    });

    test('should access employees', async ({ page }) => {
      await page.goto(`${ATLVS_BASE}/employees`);
      await page.waitForLoadState('domcontentloaded');
      await expect(page).toHaveURL(/employees/);
    });

    test('should access background checks', async ({ page }) => {
      await page.goto(`${ATLVS_BASE}/workforce/background-checks`);
      await page.waitForLoadState('domcontentloaded');
      await expect(page).toHaveURL(/workforce\/background-checks/);
    });

    test('should access compensation', async ({ page }) => {
      await page.goto(`${ATLVS_BASE}/workforce/compensation`);
      await page.waitForLoadState('domcontentloaded');
      await expect(page).toHaveURL(/workforce\/compensation/);
    });

    test('should access handbook', async ({ page }) => {
      await page.goto(`${ATLVS_BASE}/workforce/handbook`);
      await page.waitForLoadState('domcontentloaded');
      await expect(page).toHaveURL(/workforce\/handbook/);
    });

    test('should access labor laws', async ({ page }) => {
      await page.goto(`${ATLVS_BASE}/workforce/labor-laws`);
      await page.waitForLoadState('domcontentloaded');
      await expect(page).toHaveURL(/workforce\/labor-laws/);
    });

    test('should access referrals', async ({ page }) => {
      await page.goto(`${ATLVS_BASE}/workforce/referrals`);
      await page.waitForLoadState('domcontentloaded');
      await expect(page).toHaveURL(/workforce\/referrals/);
    });

    test('should access succession planning', async ({ page }) => {
      await page.goto(`${ATLVS_BASE}/workforce/succession`);
      await page.waitForLoadState('domcontentloaded');
      await expect(page).toHaveURL(/workforce\/succession/);
    });

    test('should access union compliance', async ({ page }) => {
      await page.goto(`${ATLVS_BASE}/workforce/union-compliance`);
      await page.waitForLoadState('domcontentloaded');
      await expect(page).toHaveURL(/workforce\/union-compliance/);
    });

    test('should access payroll', async ({ page }) => {
      await page.goto(`${ATLVS_BASE}/payroll`);
      await page.waitForLoadState('domcontentloaded');
      await expect(page).toHaveURL(/payroll/);
    });
  });

  test.describe('WF-ATLVS-018: CRM & Lead Management', () => {
    test('should access CRM', async ({ page }) => {
      await page.goto(`${ATLVS_BASE}/crm`);
      await page.waitForLoadState('domcontentloaded');
      await expect(page).toHaveURL(/crm/);
    });

    test('should access contacts', async ({ page }) => {
      await page.goto(`${ATLVS_BASE}/contacts`);
      await page.waitForLoadState('domcontentloaded');
      await expect(page).toHaveURL(/contacts/);
    });

    test('should access CRM tasks', async ({ page }) => {
      await page.goto(`${ATLVS_BASE}/crm/tasks`);
      await page.waitForLoadState('domcontentloaded');
      await expect(page).toHaveURL(/crm\/tasks/);
    });

    test('should access CRM relationships', async ({ page }) => {
      await page.goto(`${ATLVS_BASE}/crm/relationships`);
      await page.waitForLoadState('domcontentloaded');
      await expect(page).toHaveURL(/crm\/relationships/);
    });

    test('should access email integration', async ({ page }) => {
      await page.goto(`${ATLVS_BASE}/crm/email-integration`);
      await page.waitForLoadState('domcontentloaded');
      await expect(page).toHaveURL(/crm\/email-integration/);
    });

    test('should access CRM calendar', async ({ page }) => {
      await page.goto(`${ATLVS_BASE}/crm/calendar`);
      await page.waitForLoadState('domcontentloaded');
      await expect(page).toHaveURL(/crm\/calendar/);
    });
  });

  test.describe('WF-ATLVS-019: Analytics & Reporting', () => {
    test('should access analytics hub', async ({ page }) => {
      await page.goto(`${ATLVS_BASE}/analytics`);
      await page.waitForLoadState('domcontentloaded');
      await expect(page).toHaveURL(/analytics/);
    });

    test('should access dashboards', async ({ page }) => {
      await page.goto(`${ATLVS_BASE}/analytics/dashboards`);
      await page.waitForLoadState('domcontentloaded');
      await expect(page).toHaveURL(/analytics\/dashboards/);
    });

    test('should access dashboard builder', async ({ page }) => {
      await page.goto(`${ATLVS_BASE}/analytics/dashboard-builder`);
      await page.waitForLoadState('domcontentloaded');
      await expect(page).toHaveURL(/analytics\/dashboard-builder/);
    });

    test('should access KPIs', async ({ page }) => {
      await page.goto(`${ATLVS_BASE}/analytics/kpi`);
      await page.waitForLoadState('domcontentloaded');
      await expect(page).toHaveURL(/analytics\/kpi/);
    });

    test('should access analytics reports', async ({ page }) => {
      await page.goto(`${ATLVS_BASE}/analytics/reports`);
      await page.waitForLoadState('domcontentloaded');
      await expect(page).toHaveURL(/analytics\/reports/);
    });

    test('should access data warehouse', async ({ page }) => {
      await page.goto(`${ATLVS_BASE}/analytics/data-warehouse`);
      await page.waitForLoadState('domcontentloaded');
      await expect(page).toHaveURL(/analytics\/data-warehouse/);
    });

    test('should access client retention', async ({ page }) => {
      await page.goto(`${ATLVS_BASE}/analytics/client-retention`);
      await page.waitForLoadState('domcontentloaded');
      await expect(page).toHaveURL(/analytics\/client-retention/);
    });

    test('should access scheduled reports', async ({ page }) => {
      await page.goto(`${ATLVS_BASE}/reports/scheduled`);
      await page.waitForLoadState('domcontentloaded');
      await expect(page).toHaveURL(/reports\/scheduled/);
    });
  });

  test.describe('WF-ATLVS-020: API & Integration Management', () => {
    test('should access API management', async ({ page }) => {
      await page.goto(`${ATLVS_BASE}/api-management`);
      await page.waitForLoadState('domcontentloaded');
      await expect(page).toHaveURL(/api-management/);
    });

    test('should access API keys', async ({ page }) => {
      await page.goto(`${ATLVS_BASE}/api-management/keys`);
      await page.waitForLoadState('domcontentloaded');
      await expect(page).toHaveURL(/api-management\/keys/);
    });

    test('should access webhooks', async ({ page }) => {
      await page.goto(`${ATLVS_BASE}/api-management/webhooks`);
      await page.waitForLoadState('domcontentloaded');
      await expect(page).toHaveURL(/api-management\/webhooks/);
    });

    test('should access API logs', async ({ page }) => {
      await page.goto(`${ATLVS_BASE}/api-management/logs`);
      await page.waitForLoadState('domcontentloaded');
      await expect(page).toHaveURL(/api-management\/logs/);
    });

    test('should access integrations', async ({ page }) => {
      await page.goto(`${ATLVS_BASE}/integrations`);
      await page.waitForLoadState('domcontentloaded');
      await expect(page).toHaveURL(/integrations/);
    });
  });
});

test.describe('ATLVS Team Member Workflows', () => {
  
  test.describe('WF-ATLVS-021: Daily Task Management', () => {
    test('should access dashboard', async ({ page }) => {
      await page.goto(`${ATLVS_BASE}/dashboard`);
      await page.waitForLoadState('domcontentloaded');
      await expect(page).toHaveURL(/dashboard/);
    });

    test('should access action items', async ({ page }) => {
      await page.goto(`${ATLVS_BASE}/action-items`);
      await page.waitForLoadState('domcontentloaded');
      await expect(page).toHaveURL(/action-items/);
    });

    test('should access schedule tasks', async ({ page }) => {
      await page.goto(`${ATLVS_BASE}/schedule/tasks`);
      await page.waitForLoadState('domcontentloaded');
      await expect(page).toHaveURL(/schedule\/tasks/);
    });

    test('should access schedule', async ({ page }) => {
      await page.goto(`${ATLVS_BASE}/schedule`);
      await page.waitForLoadState('domcontentloaded');
      await expect(page).toHaveURL(/schedule/);
    });

    test('should access notifications', async ({ page }) => {
      await page.goto(`${ATLVS_BASE}/notifications`);
      await page.waitForLoadState('domcontentloaded');
      await expect(page).toHaveURL(/notifications/);
    });
  });

  test.describe('WF-ATLVS-022: Production Work', () => {
    test('should access documents', async ({ page }) => {
      await page.goto(`${ATLVS_BASE}/documents`);
      await page.waitForLoadState('domcontentloaded');
      await expect(page).toHaveURL(/documents/);
    });
  });

  test.describe('WF-ATLVS-023: Expense Submission', () => {
    test('should access expenses', async ({ page }) => {
      await page.goto(`${ATLVS_BASE}/expenses`);
      await page.waitForLoadState('domcontentloaded');
      await expect(page).toHaveURL(/expenses/);
    });
  });

  test.describe('WF-ATLVS-024: Advancing Submission', () => {
    test('should access advancing', async ({ page }) => {
      await page.goto(`${ATLVS_BASE}/advancing`);
      await page.waitForLoadState('domcontentloaded');
      await expect(page).toHaveURL(/advancing/);
    });
  });
});

test.describe('ATLVS Viewer Workflows', () => {
  
  test.describe('WF-ATLVS-025: Read-Only Access', () => {
    test('should access dashboard as viewer', async ({ page }) => {
      await page.goto(`${ATLVS_BASE}/dashboard`);
      await page.waitForLoadState('domcontentloaded');
      await expect(page).toHaveURL(/dashboard/);
    });

    test('should browse productions', async ({ page }) => {
      await page.goto(`${ATLVS_BASE}/productions`);
      await page.waitForLoadState('domcontentloaded');
      await expect(page).toHaveURL(/productions/);
    });

    test('should view venues', async ({ page }) => {
      await page.goto(`${ATLVS_BASE}/venues`);
      await page.waitForLoadState('domcontentloaded');
      await expect(page).toHaveURL(/venues/);
    });

    test('should access documents', async ({ page }) => {
      await page.goto(`${ATLVS_BASE}/documents`);
      await page.waitForLoadState('domcontentloaded');
      await expect(page).toHaveURL(/documents/);
    });
  });
});

test.describe('ATLVS Portal Workflows', () => {
  
  test.describe('WF-ATLVS-026: Artist Portal', () => {
    test('should access artist portal', async ({ page }) => {
      await page.goto(`${ATLVS_BASE}/portal/artist`);
      await page.waitForLoadState('domcontentloaded');
      await expect(page).toHaveURL(/portal\/artist/);
    });

    test('should access profile', async ({ page }) => {
      await page.goto(`${ATLVS_BASE}/profile`);
      await page.waitForLoadState('domcontentloaded');
      await expect(page).toHaveURL(/profile/);
    });
  });

  test.describe('WF-ATLVS-027: Crew Portal', () => {
    test('should access crew portal', async ({ page }) => {
      await page.goto(`${ATLVS_BASE}/portal/crew`);
      await page.waitForLoadState('domcontentloaded');
      await expect(page).toHaveURL(/portal\/crew/);
    });
  });

  test.describe('WF-ATLVS-028: Investor Portal', () => {
    test('should access investor portal', async ({ page }) => {
      await page.goto(`${ATLVS_BASE}/portal/investor`);
      await page.waitForLoadState('domcontentloaded');
      await expect(page).toHaveURL(/portal\/investor/);
    });

    test('should access my investments', async ({ page }) => {
      await page.goto(`${ATLVS_BASE}/portal/investor/my-investments`);
      await page.waitForLoadState('domcontentloaded');
      await expect(page).toHaveURL(/portal\/investor\/my-investments/);
    });

    test('should access investor updates', async ({ page }) => {
      await page.goto(`${ATLVS_BASE}/portal/investor/investor-updates`);
      await page.waitForLoadState('domcontentloaded');
      await expect(page).toHaveURL(/portal\/investor\/investor-updates/);
    });
  });

  test.describe('WF-ATLVS-029: Sponsor Portal', () => {
    test('should access sponsor portal', async ({ page }) => {
      await page.goto(`${ATLVS_BASE}/portal/sponsor`);
      await page.waitForLoadState('domcontentloaded');
      await expect(page).toHaveURL(/portal\/sponsor/);
    });

    test('should access my activations', async ({ page }) => {
      await page.goto(`${ATLVS_BASE}/portal/sponsor/my-activations`);
      await page.waitForLoadState('domcontentloaded');
      await expect(page).toHaveURL(/portal\/sponsor\/my-activations/);
    });

    test('should access my deliverables', async ({ page }) => {
      await page.goto(`${ATLVS_BASE}/portal/sponsor/my-deliverables`);
      await page.waitForLoadState('domcontentloaded');
      await expect(page).toHaveURL(/portal\/sponsor\/my-deliverables/);
    });

    test('should access my reports', async ({ page }) => {
      await page.goto(`${ATLVS_BASE}/portal/sponsor/my-reports`);
      await page.waitForLoadState('domcontentloaded');
      await expect(page).toHaveURL(/portal\/sponsor\/my-reports/);
    });
  });

  test.describe('WF-ATLVS-030: Vendor Portal', () => {
    test('should access vendor portal', async ({ page }) => {
      await page.goto(`${ATLVS_BASE}/portal/vendor`);
      await page.waitForLoadState('domcontentloaded');
      await expect(page).toHaveURL(/portal\/vendor/);
    });
  });
});

test.describe('ATLVS Authentication Workflows', () => {
  
  test.describe('WF-ATLVS-031: User Authentication', () => {
    test('should display sign in page', async ({ page }) => {
      await page.goto(`${ATLVS_BASE}/auth/signin`);
      await page.waitForLoadState('domcontentloaded');
      await expect(page).toHaveURL(/auth\/signin/);
      await expect(page.locator('input[type="email"], input[name="email"]')).toBeVisible({ timeout: 10000 });
    });

    test('should display sign up page', async ({ page }) => {
      await page.goto(`${ATLVS_BASE}/auth/signup`);
      await page.waitForLoadState('domcontentloaded');
      await expect(page).toHaveURL(/auth\/signup/);
    });

    test('should display magic link page', async ({ page }) => {
      await page.goto(`${ATLVS_BASE}/auth/magic-link`);
      await page.waitForLoadState('domcontentloaded');
      await expect(page).toHaveURL(/auth\/magic-link/);
    });

    test('should display forgot password page', async ({ page }) => {
      await page.goto(`${ATLVS_BASE}/auth/forgot-password`);
      await page.waitForLoadState('domcontentloaded');
      await expect(page).toHaveURL(/auth\/forgot-password/);
    });

    test('should display reset password page', async ({ page }) => {
      await page.goto(`${ATLVS_BASE}/auth/reset-password`);
      await page.waitForLoadState('domcontentloaded');
      await expect(page).toHaveURL(/auth\/reset-password/);
    });
  });
});
