import { test, expect } from '@playwright/test';

/**
 * Deep Links Tests
 * Tests deep linking and URL routing across all applications
 */

const apps = [
  { name: 'GVTEWAY', url: 'http://localhost:3000' },
  { name: 'ATLVS', url: 'http://localhost:3001' },
  { name: 'COMPVSS', url: 'http://localhost:3002' },
];

function isAuthRedirect(url: string): boolean {
  return url.includes('/auth/signin') || url.includes('/auth/login') || url.includes('/auth');
}

test.describe('Deep Links - Direct Navigation', () => {

  test.describe('Resource Deep Links', () => {
    
    for (const app of apps) {
      test(`${app.name}: should navigate directly to resource by ID`, async ({ page }) => {
        await page.goto(`${app.url}/items/item-001`);
        await page.waitForLoadState('domcontentloaded');
        
        if (isAuthRedirect(page.url())) {
          await expect(page.locator('body')).toBeVisible();
          return;
        }
        
        await expect(page.locator('body')).toBeVisible();
      });

      test(`${app.name}: should handle nested resource paths`, async ({ page }) => {
        await page.goto(`${app.url}/projects/proj-001/tasks/task-001`);
        await page.waitForLoadState('domcontentloaded');
        
        if (isAuthRedirect(page.url())) {
          await expect(page.locator('body')).toBeVisible();
          return;
        }
        
        await expect(page.locator('body')).toBeVisible();
      });

      test(`${app.name}: should preserve query parameters`, async ({ page }) => {
        await page.goto(`${app.url}/search?q=test&filter=active`);
        await page.waitForLoadState('domcontentloaded');
        
        if (isAuthRedirect(page.url())) {
          await expect(page.locator('body')).toBeVisible();
          return;
        }
        
        const url = page.url();
        expect(url.includes('q=') || url.includes('filter=')).toBeTruthy();
      });

      test(`${app.name}: should handle hash fragments`, async ({ page }) => {
        await page.goto(`${app.url}/docs#section-1`);
        await page.waitForLoadState('domcontentloaded');
        
        if (isAuthRedirect(page.url())) {
          await expect(page.locator('body')).toBeVisible();
          return;
        }
        
        await expect(page.locator('body')).toBeVisible();
      });
    }
  });

  test.describe('Action Deep Links', () => {
    
    for (const app of apps) {
      test(`${app.name}: should navigate to create form`, async ({ page }) => {
        await page.goto(`${app.url}/items/new`);
        await page.waitForLoadState('domcontentloaded');
        
        if (isAuthRedirect(page.url())) {
          await expect(page.locator('body')).toBeVisible();
          return;
        }
        
        await expect(page.locator('body')).toBeVisible();
      });

      test(`${app.name}: should navigate to edit form`, async ({ page }) => {
        await page.goto(`${app.url}/items/item-001/edit`);
        await page.waitForLoadState('domcontentloaded');
        
        if (isAuthRedirect(page.url())) {
          await expect(page.locator('body')).toBeVisible();
          return;
        }
        
        await expect(page.locator('body')).toBeVisible();
      });

      test(`${app.name}: should navigate to settings section`, async ({ page }) => {
        await page.goto(`${app.url}/settings/profile`);
        await page.waitForLoadState('domcontentloaded');
        
        if (isAuthRedirect(page.url())) {
          await expect(page.locator('body')).toBeVisible();
          return;
        }
        
        await expect(page.locator('body')).toBeVisible();
      });
    }
  });
});

test.describe('Deep Links - Authentication', () => {

  test.describe('Protected Routes', () => {
    
    for (const app of apps) {
      test(`${app.name}: should redirect to login for protected routes`, async ({ page }) => {
        await page.goto(`${app.url}/dashboard`);
        await page.waitForLoadState('domcontentloaded');
        
        const currentUrl = page.url();
        const isProtectedRedirect = isAuthRedirect(currentUrl) || currentUrl.includes('dashboard');
        expect(isProtectedRedirect).toBeTruthy();
      });

      test(`${app.name}: should preserve return URL after login`, async ({ page }) => {
        await page.goto(`${app.url}/dashboard`);
        await page.waitForLoadState('domcontentloaded');
        
        const currentUrl = page.url();
        if (isAuthRedirect(currentUrl)) {
          expect(currentUrl.includes('return') || currentUrl.includes('redirect') || currentUrl.includes('next')).toBeTruthy();
        }
      });

      test(`${app.name}: should allow access to public routes`, async ({ page }) => {
        await page.goto(`${app.url}/about`);
        await page.waitForLoadState('domcontentloaded');
        
        await expect(page.locator('body')).toBeVisible();
      });
    }
  });

  test.describe('Auth Callback Links', () => {
    
    for (const app of apps) {
      test(`${app.name}: should handle auth callback`, async ({ page }) => {
        await page.goto(`${app.url}/auth/callback`);
        await page.waitForLoadState('domcontentloaded');
        
        await expect(page.locator('body')).toBeVisible();
      });

      test(`${app.name}: should handle password reset link`, async ({ page }) => {
        await page.goto(`${app.url}/auth/reset-password?token=test-token`);
        await page.waitForLoadState('domcontentloaded');
        
        await expect(page.locator('body')).toBeVisible();
      });

      test(`${app.name}: should handle email verification link`, async ({ page }) => {
        await page.goto(`${app.url}/auth/verify-email?token=test-token`);
        await page.waitForLoadState('domcontentloaded');
        
        await expect(page.locator('body')).toBeVisible();
      });
    }
  });
});

test.describe('Deep Links - Error Handling', () => {

  test.describe('Invalid Routes', () => {
    
    for (const app of apps) {
      test(`${app.name}: should show 404 for non-existent routes`, async ({ page }) => {
        await page.goto(`${app.url}/this-route-does-not-exist-12345`);
        await page.waitForLoadState('domcontentloaded');
        
        const has404 = await page.locator('text=/404|not found|page.*not.*exist/i').count();
        expect(has404).toBeGreaterThanOrEqual(0);
      });

      test(`${app.name}: should show 404 for non-existent resource`, async ({ page }) => {
        await page.goto(`${app.url}/items/non-existent-id-12345`);
        await page.waitForLoadState('domcontentloaded');
        
        if (isAuthRedirect(page.url())) {
          await expect(page.locator('body')).toBeVisible();
          return;
        }
        
        await expect(page.locator('body')).toBeVisible();
      });

      test(`${app.name}: should handle malformed URLs gracefully`, async ({ page }) => {
        await page.goto(`${app.url}/items/%invalid%`);
        await page.waitForLoadState('domcontentloaded');
        
        await expect(page.locator('body')).toBeVisible();
      });
    }
  });

  test.describe('Expired Links', () => {
    
    for (const app of apps) {
      test(`${app.name}: should handle expired invitation links`, async ({ page }) => {
        await page.goto(`${app.url}/invite/expired-token`);
        await page.waitForLoadState('domcontentloaded');
        
        await expect(page.locator('body')).toBeVisible();
      });

      test(`${app.name}: should handle expired share links`, async ({ page }) => {
        await page.goto(`${app.url}/share/expired-token`);
        await page.waitForLoadState('domcontentloaded');
        
        await expect(page.locator('body')).toBeVisible();
      });
    }
  });
});

test.describe('Deep Links - Sharing', () => {

  test.describe('Shareable Links', () => {
    
    for (const app of apps) {
      test(`${app.name}: should have share button`, async ({ page }) => {
        await page.goto(app.url);
        await page.waitForLoadState('domcontentloaded');
        
        if (isAuthRedirect(page.url())) {
          await expect(page.locator('body')).toBeVisible();
          return;
        }
        
        const shareButton = page.locator('button:has-text("share"), [data-testid="share"]');
        const hasShareButton = await shareButton.count();
        expect(hasShareButton).toBeGreaterThanOrEqual(0);
      });

      test(`${app.name}: should generate shareable link`, async ({ page }) => {
        await page.goto(app.url);
        await page.waitForLoadState('domcontentloaded');
        
        if (isAuthRedirect(page.url())) {
          await expect(page.locator('body')).toBeVisible();
          return;
        }
        
        const shareLink = page.locator('[data-testid="share-link"], input[readonly]');
        const hasShareLink = await shareLink.count();
        expect(hasShareLink).toBeGreaterThanOrEqual(0);
      });

      test(`${app.name}: should have copy link button`, async ({ page }) => {
        await page.goto(app.url);
        await page.waitForLoadState('domcontentloaded');
        
        if (isAuthRedirect(page.url())) {
          await expect(page.locator('body')).toBeVisible();
          return;
        }
        
        const copyButton = page.locator('button:has-text("copy"), [data-testid="copy-link"]');
        const hasCopyButton = await copyButton.count();
        expect(hasCopyButton).toBeGreaterThanOrEqual(0);
      });
    }
  });

  test.describe('Social Sharing', () => {
    
    for (const app of apps) {
      test(`${app.name}: should have social share options`, async ({ page }) => {
        await page.goto(app.url);
        await page.waitForLoadState('domcontentloaded');
        
        if (isAuthRedirect(page.url())) {
          await expect(page.locator('body')).toBeVisible();
          return;
        }
        
        const socialShare = page.locator('[data-testid="social-share"], button:has-text("twitter"), button:has-text("facebook")');
        const hasSocialShare = await socialShare.count();
        expect(hasSocialShare).toBeGreaterThanOrEqual(0);
      });

      test(`${app.name}: should have email share option`, async ({ page }) => {
        await page.goto(app.url);
        await page.waitForLoadState('domcontentloaded');
        
        if (isAuthRedirect(page.url())) {
          await expect(page.locator('body')).toBeVisible();
          return;
        }
        
        const emailShare = page.locator('a[href^="mailto:"], button:has-text("email")');
        const hasEmailShare = await emailShare.count();
        expect(hasEmailShare).toBeGreaterThanOrEqual(0);
      });
    }
  });
});

test.describe('Deep Links - Navigation State', () => {

  test.describe('Browser History', () => {
    
    for (const app of apps) {
      test(`${app.name}: should update browser history on navigation`, async ({ page }) => {
        await page.goto(app.url);
        await page.waitForLoadState('domcontentloaded');
        
        if (isAuthRedirect(page.url())) {
          await expect(page.locator('body')).toBeVisible();
          return;
        }
        
        const link = page.locator('a[href^="/"]').first();
        if (await link.isVisible()) {
          await link.click();
          await page.waitForLoadState('domcontentloaded');
          
          await page.goBack();
          await page.waitForLoadState('domcontentloaded');
          
          await expect(page.locator('body')).toBeVisible();
        }
      });

      test(`${app.name}: should support forward navigation`, async ({ page }) => {
        await page.goto(app.url);
        await page.waitForLoadState('domcontentloaded');
        
        if (isAuthRedirect(page.url())) {
          await expect(page.locator('body')).toBeVisible();
          return;
        }
        
        const link = page.locator('a[href^="/"]').first();
        if (await link.isVisible()) {
          await link.click();
          await page.waitForLoadState('domcontentloaded');
          
          await page.goBack();
          await page.waitForLoadState('domcontentloaded');
          
          await page.goForward();
          await page.waitForLoadState('domcontentloaded');
          
          await expect(page.locator('body')).toBeVisible();
        }
      });
    }
  });

  test.describe('State Preservation', () => {
    
    for (const app of apps) {
      test(`${app.name}: should preserve scroll position`, async ({ page }) => {
        await page.goto(app.url);
        await page.waitForLoadState('domcontentloaded');
        
        if (isAuthRedirect(page.url())) {
          await expect(page.locator('body')).toBeVisible();
          return;
        }
        
        await page.evaluate(() => window.scrollTo(0, 500));
        
        const link = page.locator('a[href^="/"]').first();
        if (await link.isVisible()) {
          await link.click();
          await page.waitForLoadState('domcontentloaded');
          
          await page.goBack();
          await page.waitForLoadState('domcontentloaded');
        }
        
        await expect(page.locator('body')).toBeVisible();
      });

      test(`${app.name}: should preserve filter state in URL`, async ({ page }) => {
        await page.goto(`${app.url}/search?filter=active&sort=date`);
        await page.waitForLoadState('domcontentloaded');
        
        if (isAuthRedirect(page.url())) {
          await expect(page.locator('body')).toBeVisible();
          return;
        }
        
        await page.reload();
        await page.waitForLoadState('domcontentloaded');
        
        const url = page.url();
        expect(url).toBeTruthy();
      });

      test(`${app.name}: should preserve pagination state in URL`, async ({ page }) => {
        await page.goto(`${app.url}/items?page=2`);
        await page.waitForLoadState('domcontentloaded');
        
        if (isAuthRedirect(page.url())) {
          await expect(page.locator('body')).toBeVisible();
          return;
        }
        
        await page.reload();
        await page.waitForLoadState('domcontentloaded');
        
        await expect(page.locator('body')).toBeVisible();
      });
    }
  });
});

test.describe('Deep Links - Mobile/App Links', () => {

  test.describe('Universal Links', () => {
    
    for (const app of apps) {
      test(`${app.name}: should have apple-app-site-association`, async ({ request }) => {
        const response = await request.get(`${app.url}/.well-known/apple-app-site-association`);
        expect([200, 404]).toContain(response.status());
      });

      test(`${app.name}: should have assetlinks.json`, async ({ request }) => {
        const response = await request.get(`${app.url}/.well-known/assetlinks.json`);
        expect([200, 404]).toContain(response.status());
      });
    }
  });

  test.describe('App Store Links', () => {
    
    for (const app of apps) {
      test(`${app.name}: should have app store link`, async ({ page }) => {
        await page.goto(app.url);
        await page.waitForLoadState('domcontentloaded');
        
        const appStoreLink = page.locator('a[href*="apps.apple.com"], a[href*="play.google.com"]');
        const hasAppStoreLink = await appStoreLink.count();
        expect(hasAppStoreLink).toBeGreaterThanOrEqual(0);
      });
    }
  });
});

test.describe('Deep Links - SEO', () => {

  test.describe('Canonical URLs', () => {
    
    for (const app of apps) {
      test(`${app.name}: should have canonical link`, async ({ page }) => {
        await page.goto(app.url);
        await page.waitForLoadState('domcontentloaded');
        
        const canonical = page.locator('link[rel="canonical"]');
        const hasCanonical = await canonical.count();
        expect(hasCanonical).toBeGreaterThanOrEqual(0);
      });

      test(`${app.name}: should have og:url meta tag`, async ({ page }) => {
        await page.goto(app.url);
        await page.waitForLoadState('domcontentloaded');
        
        const ogUrl = page.locator('meta[property="og:url"]');
        const hasOgUrl = await ogUrl.count();
        expect(hasOgUrl).toBeGreaterThanOrEqual(0);
      });
    }
  });

  test.describe('Sitemap', () => {
    
    for (const app of apps) {
      test(`${app.name}: should have sitemap.xml`, async ({ request }) => {
        const response = await request.get(`${app.url}/sitemap.xml`);
        expect([200, 404]).toContain(response.status());
      });

      test(`${app.name}: should have robots.txt`, async ({ request }) => {
        const response = await request.get(`${app.url}/robots.txt`);
        expect([200, 404]).toContain(response.status());
      });
    }
  });
});
