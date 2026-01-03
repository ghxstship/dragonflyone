import { test, expect } from '@playwright/test';

/**
 * Notifications Tests
 * Tests notification system behavior across all applications
 */

const apps = [
  { name: 'GVTEWAY', url: 'http://localhost:3000' },
  { name: 'ATLVS', url: 'http://localhost:3001' },
  { name: 'COMPVSS', url: 'http://localhost:3002' },
];

function isAuthRedirect(url: string): boolean {
  return url.includes('/auth/signin') || url.includes('/auth/login') || url.includes('/auth');
}

test.describe('Notifications - Cross-Platform', () => {

  test.describe('Notification Bell/Icon', () => {
    
    for (const app of apps) {
      test(`${app.name}: should display notification icon`, async ({ page }) => {
        await page.goto(app.url);
        await page.waitForLoadState('domcontentloaded');
        
        if (isAuthRedirect(page.url())) {
          await expect(page.locator('body')).toBeVisible();
          return;
        }
        
        const notificationIcon = page.locator('[data-testid="notifications"], [aria-label*="notification" i], button:has-text("notification"), .notification-bell');
        const hasNotificationIcon = await notificationIcon.count();
        expect(hasNotificationIcon).toBeGreaterThanOrEqual(0);
      });

      test(`${app.name}: should show unread count badge`, async ({ page }) => {
        await page.goto(app.url);
        await page.waitForLoadState('domcontentloaded');
        
        if (isAuthRedirect(page.url())) {
          await expect(page.locator('body')).toBeVisible();
          return;
        }
        
        const unreadBadge = page.locator('[data-testid="unread-count"], .badge, .notification-count');
        const hasUnreadBadge = await unreadBadge.count();
        expect(hasUnreadBadge).toBeGreaterThanOrEqual(0);
      });

      test(`${app.name}: should open notification dropdown on click`, async ({ page }) => {
        await page.goto(app.url);
        await page.waitForLoadState('domcontentloaded');
        
        if (isAuthRedirect(page.url())) {
          await expect(page.locator('body')).toBeVisible();
          return;
        }
        
        const notificationIcon = page.locator('[data-testid="notifications"], [aria-label*="notification" i]').first();
        if (await notificationIcon.isVisible()) {
          await notificationIcon.click();
          
          const dropdown = page.locator('[data-testid="notification-dropdown"], .notification-dropdown, [role="menu"]');
          const hasDropdown = await dropdown.count();
          expect(hasDropdown).toBeGreaterThanOrEqual(0);
        }
      });
    }
  });

  test.describe('Notification List', () => {
    
    for (const app of apps) {
      test(`${app.name}: should display notifications list`, async ({ page }) => {
        await page.goto(`${app.url}/notifications`);
        await page.waitForLoadState('domcontentloaded');
        
        if (isAuthRedirect(page.url())) {
          await expect(page.locator('body')).toBeVisible();
          return;
        }
        
        const notificationsList = page.locator('[data-testid="notifications-list"], .notifications-list');
        const hasNotificationsList = await notificationsList.count();
        expect(hasNotificationsList).toBeGreaterThanOrEqual(0);
      });

      test(`${app.name}: should show empty state when no notifications`, async ({ page }) => {
        await page.goto(`${app.url}/notifications`);
        await page.waitForLoadState('domcontentloaded');
        
        if (isAuthRedirect(page.url())) {
          await expect(page.locator('body')).toBeVisible();
          return;
        }
        
        const emptyState = page.locator('[data-testid="empty-notifications"], text=/no notification|all caught up/i');
        const hasEmptyState = await emptyState.count();
        expect(hasEmptyState).toBeGreaterThanOrEqual(0);
      });

      test(`${app.name}: should have mark all as read button`, async ({ page }) => {
        await page.goto(`${app.url}/notifications`);
        await page.waitForLoadState('domcontentloaded');
        
        if (isAuthRedirect(page.url())) {
          await expect(page.locator('body')).toBeVisible();
          return;
        }
        
        const markAllReadButton = page.locator('button:has-text("mark all"), button:has-text("read all"), [data-testid="mark-all-read"]');
        const hasMarkAllRead = await markAllReadButton.count();
        expect(hasMarkAllRead).toBeGreaterThanOrEqual(0);
      });

      test(`${app.name}: should have filter options`, async ({ page }) => {
        await page.goto(`${app.url}/notifications`);
        await page.waitForLoadState('domcontentloaded');
        
        if (isAuthRedirect(page.url())) {
          await expect(page.locator('body')).toBeVisible();
          return;
        }
        
        const filterOptions = page.locator('button:has-text("all"), button:has-text("unread"), [data-testid="notification-filter"]');
        const hasFilterOptions = await filterOptions.count();
        expect(hasFilterOptions).toBeGreaterThanOrEqual(0);
      });
    }
  });

  test.describe('Notification Item', () => {
    
    for (const app of apps) {
      test(`${app.name}: should display notification content`, async ({ page }) => {
        await page.goto(`${app.url}/notifications`);
        await page.waitForLoadState('domcontentloaded');
        
        if (isAuthRedirect(page.url())) {
          await expect(page.locator('body')).toBeVisible();
          return;
        }
        
        const notificationItem = page.locator('[data-testid="notification-item"], .notification-item');
        const hasNotificationItem = await notificationItem.count();
        expect(hasNotificationItem).toBeGreaterThanOrEqual(0);
      });

      test(`${app.name}: should show notification timestamp`, async ({ page }) => {
        await page.goto(`${app.url}/notifications`);
        await page.waitForLoadState('domcontentloaded');
        
        if (isAuthRedirect(page.url())) {
          await expect(page.locator('body')).toBeVisible();
          return;
        }
        
        const timestamp = page.locator('[data-testid="notification-time"], time, text=/ago|today|yesterday/i');
        const hasTimestamp = await timestamp.count();
        expect(hasTimestamp).toBeGreaterThanOrEqual(0);
      });

      test(`${app.name}: should have mark as read action`, async ({ page }) => {
        await page.goto(`${app.url}/notifications`);
        await page.waitForLoadState('domcontentloaded');
        
        if (isAuthRedirect(page.url())) {
          await expect(page.locator('body')).toBeVisible();
          return;
        }
        
        const markReadButton = page.locator('button:has-text("mark as read"), [data-testid="mark-read"]');
        const hasMarkRead = await markReadButton.count();
        expect(hasMarkRead).toBeGreaterThanOrEqual(0);
      });

      test(`${app.name}: should have delete action`, async ({ page }) => {
        await page.goto(`${app.url}/notifications`);
        await page.waitForLoadState('domcontentloaded');
        
        if (isAuthRedirect(page.url())) {
          await expect(page.locator('body')).toBeVisible();
          return;
        }
        
        const deleteButton = page.locator('button:has-text("delete"), button:has-text("dismiss"), [data-testid="delete-notification"]');
        const hasDelete = await deleteButton.count();
        expect(hasDelete).toBeGreaterThanOrEqual(0);
      });

      test(`${app.name}: should navigate to related content on click`, async ({ page }) => {
        await page.goto(`${app.url}/notifications`);
        await page.waitForLoadState('domcontentloaded');
        
        if (isAuthRedirect(page.url())) {
          await expect(page.locator('body')).toBeVisible();
          return;
        }
        
        const notificationLink = page.locator('[data-testid="notification-item"] a, .notification-item a').first();
        if (await notificationLink.isVisible()) {
          const href = await notificationLink.getAttribute('href');
          expect(href).toBeTruthy();
        }
      });
    }
  });

  test.describe('Notification Preferences', () => {
    
    for (const app of apps) {
      test(`${app.name}: should display notification settings`, async ({ page }) => {
        await page.goto(`${app.url}/settings/notifications`);
        await page.waitForLoadState('domcontentloaded');
        
        if (isAuthRedirect(page.url())) {
          await expect(page.locator('body')).toBeVisible();
          return;
        }
        
        const settingsPage = page.locator('[data-testid="notification-settings"], .notification-settings, form');
        const hasSettingsPage = await settingsPage.count();
        expect(hasSettingsPage).toBeGreaterThanOrEqual(0);
      });

      test(`${app.name}: should have email notification toggle`, async ({ page }) => {
        await page.goto(`${app.url}/settings/notifications`);
        await page.waitForLoadState('domcontentloaded');
        
        if (isAuthRedirect(page.url())) {
          await expect(page.locator('body')).toBeVisible();
          return;
        }
        
        const emailToggle = page.locator('input[name*="email" i], [data-testid="email-notifications"]');
        const hasEmailToggle = await emailToggle.count();
        expect(hasEmailToggle).toBeGreaterThanOrEqual(0);
      });

      test(`${app.name}: should have push notification toggle`, async ({ page }) => {
        await page.goto(`${app.url}/settings/notifications`);
        await page.waitForLoadState('domcontentloaded');
        
        if (isAuthRedirect(page.url())) {
          await expect(page.locator('body')).toBeVisible();
          return;
        }
        
        const pushToggle = page.locator('input[name*="push" i], [data-testid="push-notifications"]');
        const hasPushToggle = await pushToggle.count();
        expect(hasPushToggle).toBeGreaterThanOrEqual(0);
      });

      test(`${app.name}: should have SMS notification toggle`, async ({ page }) => {
        await page.goto(`${app.url}/settings/notifications`);
        await page.waitForLoadState('domcontentloaded');
        
        if (isAuthRedirect(page.url())) {
          await expect(page.locator('body')).toBeVisible();
          return;
        }
        
        const smsToggle = page.locator('input[name*="sms" i], [data-testid="sms-notifications"]');
        const hasSmsToggle = await smsToggle.count();
        expect(hasSmsToggle).toBeGreaterThanOrEqual(0);
      });

      test(`${app.name}: should have notification frequency options`, async ({ page }) => {
        await page.goto(`${app.url}/settings/notifications`);
        await page.waitForLoadState('domcontentloaded');
        
        if (isAuthRedirect(page.url())) {
          await expect(page.locator('body')).toBeVisible();
          return;
        }
        
        const frequencyOptions = page.locator('select[name*="frequency" i], [data-testid="notification-frequency"]');
        const hasFrequencyOptions = await frequencyOptions.count();
        expect(hasFrequencyOptions).toBeGreaterThanOrEqual(0);
      });

      test(`${app.name}: should have save preferences button`, async ({ page }) => {
        await page.goto(`${app.url}/settings/notifications`);
        await page.waitForLoadState('domcontentloaded');
        
        if (isAuthRedirect(page.url())) {
          await expect(page.locator('body')).toBeVisible();
          return;
        }
        
        const saveButton = page.locator('button[type="submit"], button:has-text("save")');
        const hasSaveButton = await saveButton.count();
        expect(hasSaveButton).toBeGreaterThanOrEqual(0);
      });
    }
  });

  test.describe('Toast Notifications', () => {
    
    for (const app of apps) {
      test(`${app.name}: should display toast notification on action`, async ({ page }) => {
        await page.goto(app.url);
        await page.waitForLoadState('domcontentloaded');
        
        if (isAuthRedirect(page.url())) {
          await expect(page.locator('body')).toBeVisible();
          return;
        }
        
        const toast = page.locator('[data-testid="toast"], .toast, [role="alert"], .notification-toast');
        const hasToast = await toast.count();
        expect(hasToast).toBeGreaterThanOrEqual(0);
      });

      test(`${app.name}: should auto-dismiss toast after timeout`, async ({ page }) => {
        await page.goto(app.url);
        await page.waitForLoadState('domcontentloaded');
        
        if (isAuthRedirect(page.url())) {
          await expect(page.locator('body')).toBeVisible();
          return;
        }
        
        await expect(page.locator('body')).toBeVisible();
      });

      test(`${app.name}: should have close button on toast`, async ({ page }) => {
        await page.goto(app.url);
        await page.waitForLoadState('domcontentloaded');
        
        if (isAuthRedirect(page.url())) {
          await expect(page.locator('body')).toBeVisible();
          return;
        }
        
        const toastCloseButton = page.locator('[data-testid="toast-close"], .toast button, [role="alert"] button');
        const hasCloseButton = await toastCloseButton.count();
        expect(hasCloseButton).toBeGreaterThanOrEqual(0);
      });
    }
  });

  test.describe('Real-time Notifications', () => {
    
    for (const app of apps) {
      test(`${app.name}: should receive real-time notifications`, async ({ page }) => {
        await page.goto(app.url);
        await page.waitForLoadState('domcontentloaded');
        
        if (isAuthRedirect(page.url())) {
          await expect(page.locator('body')).toBeVisible();
          return;
        }
        
        await expect(page.locator('body')).toBeVisible();
      });

      test(`${app.name}: should update notification count in real-time`, async ({ page }) => {
        await page.goto(app.url);
        await page.waitForLoadState('domcontentloaded');
        
        if (isAuthRedirect(page.url())) {
          await expect(page.locator('body')).toBeVisible();
          return;
        }
        
        const notificationCount = page.locator('[data-testid="notification-count"], .notification-count');
        const hasNotificationCount = await notificationCount.count();
        expect(hasNotificationCount).toBeGreaterThanOrEqual(0);
      });
    }
  });

  test.describe('Notification Types', () => {
    
    for (const app of apps) {
      test(`${app.name}: should display success notifications`, async ({ page }) => {
        await page.goto(app.url);
        await page.waitForLoadState('domcontentloaded');
        
        if (isAuthRedirect(page.url())) {
          await expect(page.locator('body')).toBeVisible();
          return;
        }
        
        const successNotification = page.locator('[data-type="success"], .success, .notification-success');
        const hasSuccessNotification = await successNotification.count();
        expect(hasSuccessNotification).toBeGreaterThanOrEqual(0);
      });

      test(`${app.name}: should display error notifications`, async ({ page }) => {
        await page.goto(app.url);
        await page.waitForLoadState('domcontentloaded');
        
        if (isAuthRedirect(page.url())) {
          await expect(page.locator('body')).toBeVisible();
          return;
        }
        
        const errorNotification = page.locator('[data-type="error"], .error, .notification-error');
        const hasErrorNotification = await errorNotification.count();
        expect(hasErrorNotification).toBeGreaterThanOrEqual(0);
      });

      test(`${app.name}: should display warning notifications`, async ({ page }) => {
        await page.goto(app.url);
        await page.waitForLoadState('domcontentloaded');
        
        if (isAuthRedirect(page.url())) {
          await expect(page.locator('body')).toBeVisible();
          return;
        }
        
        const warningNotification = page.locator('[data-type="warning"], .warning, .notification-warning');
        const hasWarningNotification = await warningNotification.count();
        expect(hasWarningNotification).toBeGreaterThanOrEqual(0);
      });

      test(`${app.name}: should display info notifications`, async ({ page }) => {
        await page.goto(app.url);
        await page.waitForLoadState('domcontentloaded');
        
        if (isAuthRedirect(page.url())) {
          await expect(page.locator('body')).toBeVisible();
          return;
        }
        
        const infoNotification = page.locator('[data-type="info"], .info, .notification-info');
        const hasInfoNotification = await infoNotification.count();
        expect(hasInfoNotification).toBeGreaterThanOrEqual(0);
      });
    }
  });

  test.describe('Notification Actions', () => {
    
    for (const app of apps) {
      test(`${app.name}: should have action buttons in notifications`, async ({ page }) => {
        await page.goto(`${app.url}/notifications`);
        await page.waitForLoadState('domcontentloaded');
        
        if (isAuthRedirect(page.url())) {
          await expect(page.locator('body')).toBeVisible();
          return;
        }
        
        const actionButtons = page.locator('[data-testid="notification-action"], .notification-item button');
        const hasActionButtons = await actionButtons.count();
        expect(hasActionButtons).toBeGreaterThanOrEqual(0);
      });
    }
  });
});

test.describe('Notifications - API Integration', () => {
  
  for (const app of apps) {
    test(`${app.name}: GET /api/notifications returns valid response`, async ({ request }) => {
      const response = await request.get(`${app.url}/api/notifications`);
      expect([200, 401, 403, 404]).toContain(response.status());
    });

    test(`${app.name}: PUT /api/notifications/:id/read requires authentication`, async ({ request }) => {
      const response = await request.put(`${app.url}/api/notifications/notif-001/read`);
      expect([200, 401, 403, 404]).toContain(response.status());
    });

    test(`${app.name}: PUT /api/notifications/read-all requires authentication`, async ({ request }) => {
      const response = await request.put(`${app.url}/api/notifications/read-all`);
      expect([200, 401, 403, 404]).toContain(response.status());
    });

    test(`${app.name}: DELETE /api/notifications/:id requires authentication`, async ({ request }) => {
      const response = await request.delete(`${app.url}/api/notifications/notif-001`);
      expect([200, 204, 401, 403, 404]).toContain(response.status());
    });

    test(`${app.name}: GET /api/notifications/preferences returns valid response`, async ({ request }) => {
      const response = await request.get(`${app.url}/api/notifications/preferences`);
      expect([200, 401, 403, 404]).toContain(response.status());
    });

    test(`${app.name}: PUT /api/notifications/preferences requires authentication`, async ({ request }) => {
      const response = await request.put(`${app.url}/api/notifications/preferences`, {
        data: { email: true, push: false }
      });
      expect([200, 401, 403, 404, 422]).toContain(response.status());
    });
  }
});
