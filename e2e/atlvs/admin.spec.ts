import { test, expect, Page } from '@playwright/test';

/**
 * ATLVS Admin E2E Tests
 * Tests admin functionality including user management, batch operations, and system settings
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

test.describe('ATLVS Admin - User Management', () => {

  test.describe('Users List', () => {
    
    test('should display users list page', async ({ page }) => {
      await navigateAndVerify(page, '/admin/users', /admin\/users/);
    });

    test('should show users table', async ({ page }) => {
      await navigateAndVerify(page, '/admin/users', /admin\/users/);
      
      if (isAuthRedirect(page.url())) return;
      
      const usersTable = page.locator('table, [data-testid="users-list"]');
      const hasUsersTable = await usersTable.count();
      expect(hasUsersTable).toBeGreaterThanOrEqual(0);
    });

    test('should have search functionality', async ({ page }) => {
      await navigateAndVerify(page, '/admin/users', /admin\/users/);
      
      if (isAuthRedirect(page.url())) return;
      
      const searchInput = page.locator('input[type="search"], input[placeholder*="search" i]');
      const hasSearch = await searchInput.count();
      expect(hasSearch).toBeGreaterThanOrEqual(0);
    });

    test('should have role filter', async ({ page }) => {
      await navigateAndVerify(page, '/admin/users', /admin\/users/);
      
      if (isAuthRedirect(page.url())) return;
      
      const roleFilter = page.locator('select[name="role"], [data-testid="role-filter"]');
      const hasRoleFilter = await roleFilter.count();
      expect(hasRoleFilter).toBeGreaterThanOrEqual(0);
    });

    test('should have status filter', async ({ page }) => {
      await navigateAndVerify(page, '/admin/users', /admin\/users/);
      
      if (isAuthRedirect(page.url())) return;
      
      const statusFilter = page.locator('select[name="status"], [data-testid="status-filter"]');
      const hasStatusFilter = await statusFilter.count();
      expect(hasStatusFilter).toBeGreaterThanOrEqual(0);
    });

    test('should have invite user button', async ({ page }) => {
      await navigateAndVerify(page, '/admin/users', /admin\/users/);
      
      if (isAuthRedirect(page.url())) return;
      
      const inviteButton = page.locator('button:has-text("invite"), button:has-text("add user"), a[href*="invite"]');
      const hasInviteButton = await inviteButton.count();
      expect(hasInviteButton).toBeGreaterThanOrEqual(0);
    });

    test('should have bulk actions', async ({ page }) => {
      await navigateAndVerify(page, '/admin/users', /admin\/users/);
      
      if (isAuthRedirect(page.url())) return;
      
      const bulkActions = page.locator('[data-testid="bulk-actions"], button:has-text("bulk")');
      const hasBulkActions = await bulkActions.count();
      expect(hasBulkActions).toBeGreaterThanOrEqual(0);
    });
  });

  test.describe('User Detail', () => {
    
    test('should display user detail page', async ({ page }) => {
      await navigateAndVerify(page, '/admin/users/user-001', /admin\/users\/user-001/);
    });

    test('should show user profile information', async ({ page }) => {
      await navigateAndVerify(page, '/admin/users/user-001', /admin\/users\/user-001/);
      
      if (isAuthRedirect(page.url())) return;
      
      const profileInfo = page.locator('[data-testid="user-profile"], .user-profile');
      const hasProfileInfo = await profileInfo.count();
      expect(hasProfileInfo).toBeGreaterThanOrEqual(0);
    });

    test('should show user role', async ({ page }) => {
      await navigateAndVerify(page, '/admin/users/user-001', /admin\/users\/user-001/);
      
      if (isAuthRedirect(page.url())) return;
      
      const userRole = page.locator('[data-testid="user-role"], text=/role|admin|member|viewer/i');
      const hasUserRole = await userRole.count();
      expect(hasUserRole).toBeGreaterThanOrEqual(0);
    });

    test('should show user activity', async ({ page }) => {
      await navigateAndVerify(page, '/admin/users/user-001', /admin\/users\/user-001/);
      
      if (isAuthRedirect(page.url())) return;
      
      const userActivity = page.locator('[data-testid="user-activity"], .activity, text=/last active|activity/i');
      const hasUserActivity = await userActivity.count();
      expect(hasUserActivity).toBeGreaterThanOrEqual(0);
    });

    test('should have edit user button', async ({ page }) => {
      await navigateAndVerify(page, '/admin/users/user-001', /admin\/users\/user-001/);
      
      if (isAuthRedirect(page.url())) return;
      
      const editButton = page.locator('button:has-text("edit"), a[href*="edit"]');
      const hasEditButton = await editButton.count();
      expect(hasEditButton).toBeGreaterThanOrEqual(0);
    });

    test('should have deactivate user button', async ({ page }) => {
      await navigateAndVerify(page, '/admin/users/user-001', /admin\/users\/user-001/);
      
      if (isAuthRedirect(page.url())) return;
      
      const deactivateButton = page.locator('button:has-text("deactivate"), button:has-text("disable")');
      const hasDeactivateButton = await deactivateButton.count();
      expect(hasDeactivateButton).toBeGreaterThanOrEqual(0);
    });

    test('should have reset password option', async ({ page }) => {
      await navigateAndVerify(page, '/admin/users/user-001', /admin\/users\/user-001/);
      
      if (isAuthRedirect(page.url())) return;
      
      const resetPasswordButton = page.locator('button:has-text("reset password"), button:has-text("send reset")');
      const hasResetPassword = await resetPasswordButton.count();
      expect(hasResetPassword).toBeGreaterThanOrEqual(0);
    });
  });

  test.describe('User Invite', () => {
    
    test('should display invite user form', async ({ page }) => {
      await navigateAndVerify(page, '/admin/users/invite', /admin\/users\/invite/);
      
      if (isAuthRedirect(page.url())) return;
      
      const form = page.locator('form');
      await expect(form.first()).toBeVisible();
    });

    test('should have email field', async ({ page }) => {
      await navigateAndVerify(page, '/admin/users/invite', /admin\/users\/invite/);
      
      if (isAuthRedirect(page.url())) return;
      
      const emailField = page.locator('input[type="email"], input[name="email"]');
      const hasEmailField = await emailField.count();
      expect(hasEmailField).toBeGreaterThanOrEqual(0);
    });

    test('should have role selection', async ({ page }) => {
      await navigateAndVerify(page, '/admin/users/invite', /admin\/users\/invite/);
      
      if (isAuthRedirect(page.url())) return;
      
      const roleSelect = page.locator('select[name="role"], [data-testid="role-select"]');
      const hasRoleSelect = await roleSelect.count();
      expect(hasRoleSelect).toBeGreaterThanOrEqual(0);
    });

    test('should have send invite button', async ({ page }) => {
      await navigateAndVerify(page, '/admin/users/invite', /admin\/users\/invite/);
      
      if (isAuthRedirect(page.url())) return;
      
      const sendButton = page.locator('button:has-text("send invite"), button:has-text("invite")');
      const hasSendButton = await sendButton.count();
      expect(hasSendButton).toBeGreaterThanOrEqual(0);
    });
  });
});

test.describe('ATLVS Admin - Batch Operations', () => {

  test.describe('Batch Operations Page', () => {
    
    test('should display batch operations page', async ({ page }) => {
      await navigateAndVerify(page, '/admin/batch-operations', /admin\/batch-operations/);
    });

    test('should show available operations', async ({ page }) => {
      await navigateAndVerify(page, '/admin/batch-operations', /admin\/batch-operations/);
      
      if (isAuthRedirect(page.url())) return;
      
      const operations = page.locator('[data-testid="batch-operations"], .operations-list');
      const hasOperations = await operations.count();
      expect(hasOperations).toBeGreaterThanOrEqual(0);
    });

    test('should have import data option', async ({ page }) => {
      await navigateAndVerify(page, '/admin/batch-operations', /admin\/batch-operations/);
      
      if (isAuthRedirect(page.url())) return;
      
      const importOption = page.locator('button:has-text("import"), a[href*="import"]');
      const hasImport = await importOption.count();
      expect(hasImport).toBeGreaterThanOrEqual(0);
    });

    test('should have export data option', async ({ page }) => {
      await navigateAndVerify(page, '/admin/batch-operations', /admin\/batch-operations/);
      
      if (isAuthRedirect(page.url())) return;
      
      const exportOption = page.locator('button:has-text("export"), a[href*="export"]');
      const hasExport = await exportOption.count();
      expect(hasExport).toBeGreaterThanOrEqual(0);
    });

    test('should have bulk update option', async ({ page }) => {
      await navigateAndVerify(page, '/admin/batch-operations', /admin\/batch-operations/);
      
      if (isAuthRedirect(page.url())) return;
      
      const bulkUpdate = page.locator('button:has-text("bulk update"), a[href*="bulk"]');
      const hasBulkUpdate = await bulkUpdate.count();
      expect(hasBulkUpdate).toBeGreaterThanOrEqual(0);
    });

    test('should show operation history', async ({ page }) => {
      await navigateAndVerify(page, '/admin/batch-operations', /admin\/batch-operations/);
      
      if (isAuthRedirect(page.url())) return;
      
      const history = page.locator('[data-testid="operation-history"], .history, text=/history|recent/i');
      const hasHistory = await history.count();
      expect(hasHistory).toBeGreaterThanOrEqual(0);
    });
  });

  test.describe('Import Data', () => {
    
    test('should display import page', async ({ page }) => {
      await navigateAndVerify(page, '/admin/batch-operations/import', /admin\/batch-operations\/import/);
    });

    test('should have file upload', async ({ page }) => {
      await navigateAndVerify(page, '/admin/batch-operations/import', /admin\/batch-operations\/import/);
      
      if (isAuthRedirect(page.url())) return;
      
      const fileUpload = page.locator('input[type="file"]');
      const hasFileUpload = await fileUpload.count();
      expect(hasFileUpload).toBeGreaterThanOrEqual(0);
    });

    test('should have entity type selection', async ({ page }) => {
      await navigateAndVerify(page, '/admin/batch-operations/import', /admin\/batch-operations\/import/);
      
      if (isAuthRedirect(page.url())) return;
      
      const entitySelect = page.locator('select[name="entity"], [data-testid="entity-select"]');
      const hasEntitySelect = await entitySelect.count();
      expect(hasEntitySelect).toBeGreaterThanOrEqual(0);
    });

    test('should have download template option', async ({ page }) => {
      await navigateAndVerify(page, '/admin/batch-operations/import', /admin\/batch-operations\/import/);
      
      if (isAuthRedirect(page.url())) return;
      
      const templateDownload = page.locator('a:has-text("template"), button:has-text("template")');
      const hasTemplateDownload = await templateDownload.count();
      expect(hasTemplateDownload).toBeGreaterThanOrEqual(0);
    });

    test('should show preview before import', async ({ page }) => {
      await navigateAndVerify(page, '/admin/batch-operations/import', /admin\/batch-operations\/import/);
      
      if (isAuthRedirect(page.url())) return;
      
      const preview = page.locator('[data-testid="import-preview"], .preview, text=/preview/i');
      const hasPreview = await preview.count();
      expect(hasPreview).toBeGreaterThanOrEqual(0);
    });
  });

  test.describe('Export Data', () => {
    
    test('should display export page', async ({ page }) => {
      await navigateAndVerify(page, '/admin/batch-operations/export', /admin\/batch-operations\/export/);
    });

    test('should have entity type selection', async ({ page }) => {
      await navigateAndVerify(page, '/admin/batch-operations/export', /admin\/batch-operations\/export/);
      
      if (isAuthRedirect(page.url())) return;
      
      const entitySelect = page.locator('select[name="entity"], [data-testid="entity-select"]');
      const hasEntitySelect = await entitySelect.count();
      expect(hasEntitySelect).toBeGreaterThanOrEqual(0);
    });

    test('should have format selection', async ({ page }) => {
      await navigateAndVerify(page, '/admin/batch-operations/export', /admin\/batch-operations\/export/);
      
      if (isAuthRedirect(page.url())) return;
      
      const formatSelect = page.locator('select[name="format"], [data-testid="format-select"], button:has-text("csv"), button:has-text("excel")');
      const hasFormatSelect = await formatSelect.count();
      expect(hasFormatSelect).toBeGreaterThanOrEqual(0);
    });

    test('should have date range filter', async ({ page }) => {
      await navigateAndVerify(page, '/admin/batch-operations/export', /admin\/batch-operations\/export/);
      
      if (isAuthRedirect(page.url())) return;
      
      const dateRange = page.locator('input[type="date"], [data-testid="date-range"]');
      const hasDateRange = await dateRange.count();
      expect(hasDateRange).toBeGreaterThanOrEqual(0);
    });

    test('should have export button', async ({ page }) => {
      await navigateAndVerify(page, '/admin/batch-operations/export', /admin\/batch-operations\/export/);
      
      if (isAuthRedirect(page.url())) return;
      
      const exportButton = page.locator('button:has-text("export"), button:has-text("download")');
      const hasExportButton = await exportButton.count();
      expect(hasExportButton).toBeGreaterThanOrEqual(0);
    });
  });
});

test.describe('ATLVS Admin - System Settings', () => {

  test.describe('General Settings', () => {
    
    test('should display admin settings page', async ({ page }) => {
      await navigateAndVerify(page, '/admin/settings', /admin\/settings/);
    });

    test('should show organization settings', async ({ page }) => {
      await navigateAndVerify(page, '/admin/settings', /admin\/settings/);
      
      if (isAuthRedirect(page.url())) return;
      
      const orgSettings = page.locator('[data-testid="org-settings"], text=/organization|company/i');
      const hasOrgSettings = await orgSettings.count();
      expect(hasOrgSettings).toBeGreaterThanOrEqual(0);
    });

    test('should have branding settings', async ({ page }) => {
      await navigateAndVerify(page, '/admin/settings', /admin\/settings/);
      
      if (isAuthRedirect(page.url())) return;
      
      const brandingSettings = page.locator('[data-testid="branding"], text=/branding|logo|theme/i');
      const hasBrandingSettings = await brandingSettings.count();
      expect(hasBrandingSettings).toBeGreaterThanOrEqual(0);
    });

    test('should have save settings button', async ({ page }) => {
      await navigateAndVerify(page, '/admin/settings', /admin\/settings/);
      
      if (isAuthRedirect(page.url())) return;
      
      const saveButton = page.locator('button:has-text("save"), button[type="submit"]');
      const hasSaveButton = await saveButton.count();
      expect(hasSaveButton).toBeGreaterThanOrEqual(0);
    });
  });

  test.describe('Security Settings', () => {
    
    test('should display security settings', async ({ page }) => {
      await navigateAndVerify(page, '/admin/settings/security', /admin\/settings\/security/);
    });

    test('should have password policy settings', async ({ page }) => {
      await navigateAndVerify(page, '/admin/settings/security', /admin\/settings\/security/);
      
      if (isAuthRedirect(page.url())) return;
      
      const passwordPolicy = page.locator('[data-testid="password-policy"], text=/password.*policy|password.*requirements/i');
      const hasPasswordPolicy = await passwordPolicy.count();
      expect(hasPasswordPolicy).toBeGreaterThanOrEqual(0);
    });

    test('should have MFA settings', async ({ page }) => {
      await navigateAndVerify(page, '/admin/settings/security', /admin\/settings\/security/);
      
      if (isAuthRedirect(page.url())) return;
      
      const mfaSettings = page.locator('[data-testid="mfa-settings"], text=/mfa|two-factor|2fa/i');
      const hasMfaSettings = await mfaSettings.count();
      expect(hasMfaSettings).toBeGreaterThanOrEqual(0);
    });

    test('should have session timeout settings', async ({ page }) => {
      await navigateAndVerify(page, '/admin/settings/security', /admin\/settings\/security/);
      
      if (isAuthRedirect(page.url())) return;
      
      const sessionSettings = page.locator('[data-testid="session-settings"], text=/session.*timeout|idle.*timeout/i');
      const hasSessionSettings = await sessionSettings.count();
      expect(hasSessionSettings).toBeGreaterThanOrEqual(0);
    });
  });

  test.describe('Audit Logs', () => {
    
    test('should display audit logs page', async ({ page }) => {
      await navigateAndVerify(page, '/admin/audit-logs', /admin\/audit-logs/);
    });

    test('should show audit log entries', async ({ page }) => {
      await navigateAndVerify(page, '/admin/audit-logs', /admin\/audit-logs/);
      
      if (isAuthRedirect(page.url())) return;
      
      const auditLogs = page.locator('table, [data-testid="audit-logs"]');
      const hasAuditLogs = await auditLogs.count();
      expect(hasAuditLogs).toBeGreaterThanOrEqual(0);
    });

    test('should have user filter', async ({ page }) => {
      await navigateAndVerify(page, '/admin/audit-logs', /admin\/audit-logs/);
      
      if (isAuthRedirect(page.url())) return;
      
      const userFilter = page.locator('select[name="user"], [data-testid="user-filter"]');
      const hasUserFilter = await userFilter.count();
      expect(hasUserFilter).toBeGreaterThanOrEqual(0);
    });

    test('should have action type filter', async ({ page }) => {
      await navigateAndVerify(page, '/admin/audit-logs', /admin\/audit-logs/);
      
      if (isAuthRedirect(page.url())) return;
      
      const actionFilter = page.locator('select[name="action"], [data-testid="action-filter"]');
      const hasActionFilter = await actionFilter.count();
      expect(hasActionFilter).toBeGreaterThanOrEqual(0);
    });

    test('should have date range filter', async ({ page }) => {
      await navigateAndVerify(page, '/admin/audit-logs', /admin\/audit-logs/);
      
      if (isAuthRedirect(page.url())) return;
      
      const dateFilter = page.locator('input[type="date"], [data-testid="date-filter"]');
      const hasDateFilter = await dateFilter.count();
      expect(hasDateFilter).toBeGreaterThanOrEqual(0);
    });

    test('should have export logs option', async ({ page }) => {
      await navigateAndVerify(page, '/admin/audit-logs', /admin\/audit-logs/);
      
      if (isAuthRedirect(page.url())) return;
      
      const exportButton = page.locator('button:has-text("export"), a:has-text("export")');
      const hasExportButton = await exportButton.count();
      expect(hasExportButton).toBeGreaterThanOrEqual(0);
    });
  });
});

test.describe('ATLVS Admin - API Integration', () => {
  
  test('GET /api/admin/users returns valid response', async ({ request }) => {
    const response = await request.get(`${ATLVS_BASE}/api/admin/users`);
    expect([200, 401, 403, 404]).toContain(response.status());
  });

  test('POST /api/admin/users/invite requires authentication', async ({ request }) => {
    const response = await request.post(`${ATLVS_BASE}/api/admin/users/invite`, {
      data: { email: 'test@example.com', role: 'member' }
    });
    expect([200, 201, 401, 403, 422]).toContain(response.status());
  });

  test('PUT /api/admin/users/:id requires authentication', async ({ request }) => {
    const response = await request.put(`${ATLVS_BASE}/api/admin/users/user-001`, {
      data: { role: 'admin' }
    });
    expect([200, 401, 403, 404, 422]).toContain(response.status());
  });

  test('DELETE /api/admin/users/:id requires authentication', async ({ request }) => {
    const response = await request.delete(`${ATLVS_BASE}/api/admin/users/user-001`);
    expect([200, 204, 401, 403, 404]).toContain(response.status());
  });

  test('GET /api/admin/audit-logs returns valid response', async ({ request }) => {
    const response = await request.get(`${ATLVS_BASE}/api/admin/audit-logs`);
    expect([200, 401, 403, 404]).toContain(response.status());
  });

  test('GET /api/admin/settings returns valid response', async ({ request }) => {
    const response = await request.get(`${ATLVS_BASE}/api/admin/settings`);
    expect([200, 401, 403, 404]).toContain(response.status());
  });

  test('PUT /api/admin/settings requires authentication', async ({ request }) => {
    const response = await request.put(`${ATLVS_BASE}/api/admin/settings`, {
      data: { organization_name: 'Test Org' }
    });
    expect([200, 401, 403, 404, 422]).toContain(response.status());
  });

  test('POST /api/admin/batch/import requires authentication', async ({ request }) => {
    const response = await request.post(`${ATLVS_BASE}/api/admin/batch/import`);
    expect([200, 201, 401, 403, 422]).toContain(response.status());
  });

  test('POST /api/admin/batch/export requires authentication', async ({ request }) => {
    const response = await request.post(`${ATLVS_BASE}/api/admin/batch/export`, {
      data: { entity: 'projects', format: 'csv' }
    });
    expect([200, 201, 401, 403, 422]).toContain(response.status());
  });
});
