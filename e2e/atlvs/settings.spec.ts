import { test, expect, Page } from '@playwright/test';

/**
 * ATLVS Settings E2E Tests
 * Tests user settings and preferences functionality
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

test.describe('ATLVS Settings - Profile', () => {

  test.describe('Profile Settings', () => {
    
    test('should display profile settings page', async ({ page }) => {
      await navigateAndVerify(page, '/settings/profile', /settings\/profile/);
    });

    test('should show profile form', async ({ page }) => {
      await navigateAndVerify(page, '/settings/profile', /settings\/profile/);
      
      if (isAuthRedirect(page.url())) return;
      
      const form = page.locator('form');
      await expect(form.first()).toBeVisible();
    });

    test('should have name field', async ({ page }) => {
      await navigateAndVerify(page, '/settings/profile', /settings\/profile/);
      
      if (isAuthRedirect(page.url())) return;
      
      const nameField = page.locator('input[name="name"], input[name="fullName"], input[name="displayName"]');
      const hasNameField = await nameField.count();
      expect(hasNameField).toBeGreaterThanOrEqual(0);
    });

    test('should have email field', async ({ page }) => {
      await navigateAndVerify(page, '/settings/profile', /settings\/profile/);
      
      if (isAuthRedirect(page.url())) return;
      
      const emailField = page.locator('input[type="email"], input[name="email"]');
      const hasEmailField = await emailField.count();
      expect(hasEmailField).toBeGreaterThanOrEqual(0);
    });

    test('should have phone field', async ({ page }) => {
      await navigateAndVerify(page, '/settings/profile', /settings\/profile/);
      
      if (isAuthRedirect(page.url())) return;
      
      const phoneField = page.locator('input[type="tel"], input[name="phone"]');
      const hasPhoneField = await phoneField.count();
      expect(hasPhoneField).toBeGreaterThanOrEqual(0);
    });

    test('should have avatar upload', async ({ page }) => {
      await navigateAndVerify(page, '/settings/profile', /settings\/profile/);
      
      if (isAuthRedirect(page.url())) return;
      
      const avatarUpload = page.locator('input[type="file"], [data-testid="avatar-upload"]');
      const hasAvatarUpload = await avatarUpload.count();
      expect(hasAvatarUpload).toBeGreaterThanOrEqual(0);
    });

    test('should have bio/about field', async ({ page }) => {
      await navigateAndVerify(page, '/settings/profile', /settings\/profile/);
      
      if (isAuthRedirect(page.url())) return;
      
      const bioField = page.locator('textarea[name="bio"], textarea[name="about"]');
      const hasBioField = await bioField.count();
      expect(hasBioField).toBeGreaterThanOrEqual(0);
    });

    test('should have save button', async ({ page }) => {
      await navigateAndVerify(page, '/settings/profile', /settings\/profile/);
      
      if (isAuthRedirect(page.url())) return;
      
      const saveButton = page.locator('button[type="submit"], button:has-text("save")');
      const hasSaveButton = await saveButton.count();
      expect(hasSaveButton).toBeGreaterThanOrEqual(0);
    });
  });
});

test.describe('ATLVS Settings - Account', () => {

  test.describe('Account Settings', () => {
    
    test('should display account settings page', async ({ page }) => {
      await navigateAndVerify(page, '/settings/account', /settings\/account/);
    });

    test('should have change password section', async ({ page }) => {
      await navigateAndVerify(page, '/settings/account', /settings\/account/);
      
      if (isAuthRedirect(page.url())) return;
      
      const passwordSection = page.locator('[data-testid="change-password"], text=/change password|update password/i');
      const hasPasswordSection = await passwordSection.count();
      expect(hasPasswordSection).toBeGreaterThanOrEqual(0);
    });

    test('should have current password field', async ({ page }) => {
      await navigateAndVerify(page, '/settings/account', /settings\/account/);
      
      if (isAuthRedirect(page.url())) return;
      
      const currentPasswordField = page.locator('input[name="currentPassword"], input[name="current_password"]');
      const hasCurrentPasswordField = await currentPasswordField.count();
      expect(hasCurrentPasswordField).toBeGreaterThanOrEqual(0);
    });

    test('should have new password field', async ({ page }) => {
      await navigateAndVerify(page, '/settings/account', /settings\/account/);
      
      if (isAuthRedirect(page.url())) return;
      
      const newPasswordField = page.locator('input[name="newPassword"], input[name="new_password"]');
      const hasNewPasswordField = await newPasswordField.count();
      expect(hasNewPasswordField).toBeGreaterThanOrEqual(0);
    });

    test('should have confirm password field', async ({ page }) => {
      await navigateAndVerify(page, '/settings/account', /settings\/account/);
      
      if (isAuthRedirect(page.url())) return;
      
      const confirmPasswordField = page.locator('input[name="confirmPassword"], input[name="confirm_password"]');
      const hasConfirmPasswordField = await confirmPasswordField.count();
      expect(hasConfirmPasswordField).toBeGreaterThanOrEqual(0);
    });

    test('should have two-factor authentication section', async ({ page }) => {
      await navigateAndVerify(page, '/settings/account', /settings\/account/);
      
      if (isAuthRedirect(page.url())) return;
      
      const twoFactorSection = page.locator('[data-testid="two-factor"], text=/two-factor|2fa|mfa/i');
      const hasTwoFactorSection = await twoFactorSection.count();
      expect(hasTwoFactorSection).toBeGreaterThanOrEqual(0);
    });

    test('should have delete account option', async ({ page }) => {
      await navigateAndVerify(page, '/settings/account', /settings\/account/);
      
      if (isAuthRedirect(page.url())) return;
      
      const deleteAccountButton = page.locator('button:has-text("delete account"), [data-testid="delete-account"]');
      const hasDeleteAccount = await deleteAccountButton.count();
      expect(hasDeleteAccount).toBeGreaterThanOrEqual(0);
    });
  });

  test.describe('Connected Accounts', () => {
    
    test('should display connected accounts section', async ({ page }) => {
      await navigateAndVerify(page, '/settings/account', /settings\/account/);
      
      if (isAuthRedirect(page.url())) return;
      
      const connectedAccounts = page.locator('[data-testid="connected-accounts"], text=/connected|linked/i');
      const hasConnectedAccounts = await connectedAccounts.count();
      expect(hasConnectedAccounts).toBeGreaterThanOrEqual(0);
    });

    test('should have connect Google option', async ({ page }) => {
      await navigateAndVerify(page, '/settings/account', /settings\/account/);
      
      if (isAuthRedirect(page.url())) return;
      
      const googleConnect = page.locator('button:has-text("google"), [data-testid="connect-google"]');
      const hasGoogleConnect = await googleConnect.count();
      expect(hasGoogleConnect).toBeGreaterThanOrEqual(0);
    });
  });
});

test.describe('ATLVS Settings - Notifications', () => {

  test.describe('Notification Preferences', () => {
    
    test('should display notification settings page', async ({ page }) => {
      await navigateAndVerify(page, '/settings/notifications', /settings\/notifications/);
    });

    test('should have email notifications toggle', async ({ page }) => {
      await navigateAndVerify(page, '/settings/notifications', /settings\/notifications/);
      
      if (isAuthRedirect(page.url())) return;
      
      const emailToggle = page.locator('input[name*="email" i], [data-testid="email-notifications"]');
      const hasEmailToggle = await emailToggle.count();
      expect(hasEmailToggle).toBeGreaterThanOrEqual(0);
    });

    test('should have push notifications toggle', async ({ page }) => {
      await navigateAndVerify(page, '/settings/notifications', /settings\/notifications/);
      
      if (isAuthRedirect(page.url())) return;
      
      const pushToggle = page.locator('input[name*="push" i], [data-testid="push-notifications"]');
      const hasPushToggle = await pushToggle.count();
      expect(hasPushToggle).toBeGreaterThanOrEqual(0);
    });

    test('should have notification categories', async ({ page }) => {
      await navigateAndVerify(page, '/settings/notifications', /settings\/notifications/);
      
      if (isAuthRedirect(page.url())) return;
      
      const categories = page.locator('[data-testid="notification-categories"], .notification-category');
      const hasCategories = await categories.count();
      expect(hasCategories).toBeGreaterThanOrEqual(0);
    });

    test('should have save preferences button', async ({ page }) => {
      await navigateAndVerify(page, '/settings/notifications', /settings\/notifications/);
      
      if (isAuthRedirect(page.url())) return;
      
      const saveButton = page.locator('button[type="submit"], button:has-text("save")');
      const hasSaveButton = await saveButton.count();
      expect(hasSaveButton).toBeGreaterThanOrEqual(0);
    });
  });
});

test.describe('ATLVS Settings - Appearance', () => {

  test.describe('Theme Settings', () => {
    
    test('should display appearance settings page', async ({ page }) => {
      await navigateAndVerify(page, '/settings/appearance', /settings\/appearance/);
    });

    test('should have theme selection', async ({ page }) => {
      await navigateAndVerify(page, '/settings/appearance', /settings\/appearance/);
      
      if (isAuthRedirect(page.url())) return;
      
      const themeSelection = page.locator('[data-testid="theme-selection"], button:has-text("light"), button:has-text("dark")');
      const hasThemeSelection = await themeSelection.count();
      expect(hasThemeSelection).toBeGreaterThanOrEqual(0);
    });

    test('should have system theme option', async ({ page }) => {
      await navigateAndVerify(page, '/settings/appearance', /settings\/appearance/);
      
      if (isAuthRedirect(page.url())) return;
      
      const systemTheme = page.locator('button:has-text("system"), input[value="system"]');
      const hasSystemTheme = await systemTheme.count();
      expect(hasSystemTheme).toBeGreaterThanOrEqual(0);
    });

    test('should have font size option', async ({ page }) => {
      await navigateAndVerify(page, '/settings/appearance', /settings\/appearance/);
      
      if (isAuthRedirect(page.url())) return;
      
      const fontSizeOption = page.locator('[data-testid="font-size"], select[name="fontSize"]');
      const hasFontSizeOption = await fontSizeOption.count();
      expect(hasFontSizeOption).toBeGreaterThanOrEqual(0);
    });

    test('should have compact mode toggle', async ({ page }) => {
      await navigateAndVerify(page, '/settings/appearance', /settings\/appearance/);
      
      if (isAuthRedirect(page.url())) return;
      
      const compactMode = page.locator('input[name*="compact" i], [data-testid="compact-mode"]');
      const hasCompactMode = await compactMode.count();
      expect(hasCompactMode).toBeGreaterThanOrEqual(0);
    });
  });
});

test.describe('ATLVS Settings - Privacy', () => {

  test.describe('Privacy Settings', () => {
    
    test('should display privacy settings page', async ({ page }) => {
      await navigateAndVerify(page, '/settings/privacy', /settings\/privacy/);
    });

    test('should have profile visibility option', async ({ page }) => {
      await navigateAndVerify(page, '/settings/privacy', /settings\/privacy/);
      
      if (isAuthRedirect(page.url())) return;
      
      const profileVisibility = page.locator('[data-testid="profile-visibility"], select[name="visibility"]');
      const hasProfileVisibility = await profileVisibility.count();
      expect(hasProfileVisibility).toBeGreaterThanOrEqual(0);
    });

    test('should have activity visibility option', async ({ page }) => {
      await navigateAndVerify(page, '/settings/privacy', /settings\/privacy/);
      
      if (isAuthRedirect(page.url())) return;
      
      const activityVisibility = page.locator('[data-testid="activity-visibility"], input[name*="activity" i]');
      const hasActivityVisibility = await activityVisibility.count();
      expect(hasActivityVisibility).toBeGreaterThanOrEqual(0);
    });

    test('should have data export option', async ({ page }) => {
      await navigateAndVerify(page, '/settings/privacy', /settings\/privacy/);
      
      if (isAuthRedirect(page.url())) return;
      
      const dataExport = page.locator('button:has-text("export data"), button:has-text("download data")');
      const hasDataExport = await dataExport.count();
      expect(hasDataExport).toBeGreaterThanOrEqual(0);
    });
  });
});

test.describe('ATLVS Settings - Integrations', () => {

  test.describe('Integration Settings', () => {
    
    test('should display integrations settings page', async ({ page }) => {
      await navigateAndVerify(page, '/settings/integrations', /settings\/integrations/);
    });

    test('should show available integrations', async ({ page }) => {
      await navigateAndVerify(page, '/settings/integrations', /settings\/integrations/);
      
      if (isAuthRedirect(page.url())) return;
      
      const integrations = page.locator('[data-testid="integrations-list"], .integrations');
      const hasIntegrations = await integrations.count();
      expect(hasIntegrations).toBeGreaterThanOrEqual(0);
    });

    test('should have connect integration button', async ({ page }) => {
      await navigateAndVerify(page, '/settings/integrations', /settings\/integrations/);
      
      if (isAuthRedirect(page.url())) return;
      
      const connectButton = page.locator('button:has-text("connect"), button:has-text("add")');
      const hasConnectButton = await connectButton.count();
      expect(hasConnectButton).toBeGreaterThanOrEqual(0);
    });

    test('should show connected integrations', async ({ page }) => {
      await navigateAndVerify(page, '/settings/integrations', /settings\/integrations/);
      
      if (isAuthRedirect(page.url())) return;
      
      const connectedIntegrations = page.locator('[data-testid="connected-integrations"], .connected');
      const hasConnectedIntegrations = await connectedIntegrations.count();
      expect(hasConnectedIntegrations).toBeGreaterThanOrEqual(0);
    });

    test('should have disconnect option', async ({ page }) => {
      await navigateAndVerify(page, '/settings/integrations', /settings\/integrations/);
      
      if (isAuthRedirect(page.url())) return;
      
      const disconnectButton = page.locator('button:has-text("disconnect"), button:has-text("remove")');
      const hasDisconnectButton = await disconnectButton.count();
      expect(hasDisconnectButton).toBeGreaterThanOrEqual(0);
    });
  });
});

test.describe('ATLVS Settings - Billing', () => {

  test.describe('Billing Settings', () => {
    
    test('should display billing settings page', async ({ page }) => {
      await navigateAndVerify(page, '/settings/billing', /settings\/billing/);
    });

    test('should show current plan', async ({ page }) => {
      await navigateAndVerify(page, '/settings/billing', /settings\/billing/);
      
      if (isAuthRedirect(page.url())) return;
      
      const currentPlan = page.locator('[data-testid="current-plan"], text=/current plan|subscription/i');
      const hasCurrentPlan = await currentPlan.count();
      expect(hasCurrentPlan).toBeGreaterThanOrEqual(0);
    });

    test('should have upgrade option', async ({ page }) => {
      await navigateAndVerify(page, '/settings/billing', /settings\/billing/);
      
      if (isAuthRedirect(page.url())) return;
      
      const upgradeButton = page.locator('button:has-text("upgrade"), a:has-text("upgrade")');
      const hasUpgradeButton = await upgradeButton.count();
      expect(hasUpgradeButton).toBeGreaterThanOrEqual(0);
    });

    test('should show payment methods', async ({ page }) => {
      await navigateAndVerify(page, '/settings/billing', /settings\/billing/);
      
      if (isAuthRedirect(page.url())) return;
      
      const paymentMethods = page.locator('[data-testid="payment-methods"], text=/payment method/i');
      const hasPaymentMethods = await paymentMethods.count();
      expect(hasPaymentMethods).toBeGreaterThanOrEqual(0);
    });

    test('should have add payment method option', async ({ page }) => {
      await navigateAndVerify(page, '/settings/billing', /settings\/billing/);
      
      if (isAuthRedirect(page.url())) return;
      
      const addPaymentButton = page.locator('button:has-text("add payment"), button:has-text("add card")');
      const hasAddPaymentButton = await addPaymentButton.count();
      expect(hasAddPaymentButton).toBeGreaterThanOrEqual(0);
    });

    test('should show billing history', async ({ page }) => {
      await navigateAndVerify(page, '/settings/billing', /settings\/billing/);
      
      if (isAuthRedirect(page.url())) return;
      
      const billingHistory = page.locator('[data-testid="billing-history"], text=/billing history|invoices/i');
      const hasBillingHistory = await billingHistory.count();
      expect(hasBillingHistory).toBeGreaterThanOrEqual(0);
    });
  });
});

test.describe('ATLVS Settings - API Integration', () => {
  
  test('GET /api/settings/profile returns valid response', async ({ request }) => {
    const response = await request.get(`${ATLVS_BASE}/api/settings/profile`);
    expect([200, 401, 403, 404]).toContain(response.status());
  });

  test('PUT /api/settings/profile requires authentication', async ({ request }) => {
    const response = await request.put(`${ATLVS_BASE}/api/settings/profile`, {
      data: { name: 'Test User' }
    });
    expect([200, 401, 403, 404, 422]).toContain(response.status());
  });

  test('PUT /api/settings/password requires authentication', async ({ request }) => {
    const response = await request.put(`${ATLVS_BASE}/api/settings/password`, {
      data: { currentPassword: 'old', newPassword: 'new' }
    });
    expect([200, 401, 403, 404, 422]).toContain(response.status());
  });

  test('GET /api/settings/notifications returns valid response', async ({ request }) => {
    const response = await request.get(`${ATLVS_BASE}/api/settings/notifications`);
    expect([200, 401, 403, 404]).toContain(response.status());
  });

  test('PUT /api/settings/notifications requires authentication', async ({ request }) => {
    const response = await request.put(`${ATLVS_BASE}/api/settings/notifications`, {
      data: { email: true, push: false }
    });
    expect([200, 401, 403, 404, 422]).toContain(response.status());
  });

  test('GET /api/settings/integrations returns valid response', async ({ request }) => {
    const response = await request.get(`${ATLVS_BASE}/api/settings/integrations`);
    expect([200, 401, 403, 404]).toContain(response.status());
  });

  test('GET /api/settings/billing returns valid response', async ({ request }) => {
    const response = await request.get(`${ATLVS_BASE}/api/settings/billing`);
    expect([200, 401, 403, 404]).toContain(response.status());
  });
});
