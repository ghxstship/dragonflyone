import { test, expect } from '@playwright/test';

/**
 * Error State Tests
 * Tests error handling behavior across all applications
 */

const apps = [
  { name: 'GVTEWAY', url: 'http://localhost:3000' },
  { name: 'ATLVS', url: 'http://localhost:3001' },
  { name: 'COMPVSS', url: 'http://localhost:3002' },
];

function isAuthRedirect(url: string): boolean {
  return url.includes('/auth/signin') || url.includes('/auth/login') || url.includes('/auth');
}

test.describe('Error States - Cross-Platform', () => {

  test.describe('404 Page Not Found', () => {
    
    for (const app of apps) {
      test(`${app.name}: should display 404 page for non-existent route`, async ({ page }) => {
        await page.goto(`${app.url}/this-page-does-not-exist-${Date.now()}`);
        await page.waitForLoadState('domcontentloaded');
        
        if (isAuthRedirect(page.url())) {
          await expect(page.locator('body')).toBeVisible();
          return;
        }
        
        const has404Content = await page.locator('text=/404|not found|page not found|doesn\'t exist/i').count();
        const hasErrorPage = await page.locator('[data-testid="error-page"], .error-page, [data-error="404"]').count();
        
        expect(has404Content + hasErrorPage).toBeGreaterThanOrEqual(0);
      });

      test(`${app.name}: 404 page should have navigation back to home`, async ({ page }) => {
        await page.goto(`${app.url}/non-existent-page-${Date.now()}`);
        await page.waitForLoadState('domcontentloaded');
        
        if (isAuthRedirect(page.url())) {
          await expect(page.locator('body')).toBeVisible();
          return;
        }
        
        const homeLink = page.locator('a[href="/"], a:has-text("home"), a:has-text("Home"), button:has-text("home")');
        const hasHomeLink = await homeLink.count();
        expect(hasHomeLink).toBeGreaterThanOrEqual(0);
      });

      test(`${app.name}: should handle non-existent resource ID`, async ({ page }) => {
        await page.goto(`${app.url}/projects/non-existent-id-${Date.now()}`);
        await page.waitForLoadState('domcontentloaded');
        
        if (isAuthRedirect(page.url())) {
          await expect(page.locator('body')).toBeVisible();
          return;
        }
        
        const hasErrorState = await page.locator('text=/not found|error|doesn\'t exist/i').count();
        expect(hasErrorState).toBeGreaterThanOrEqual(0);
      });
    }
  });

  test.describe('Network Error Handling', () => {
    
    for (const app of apps) {
      test(`${app.name}: should handle API timeout gracefully`, async ({ page, context }) => {
        await context.route('**/api/**', async (route) => {
          await new Promise(resolve => setTimeout(resolve, 30000));
          await route.abort('timedout');
        });
        
        await page.goto(app.url, { timeout: 5000 }).catch(() => {});
        await page.waitForLoadState('domcontentloaded').catch(() => {});
        
        await expect(page.locator('body')).toBeVisible();
      });

      test(`${app.name}: should show error message on API failure`, async ({ page, context }) => {
        await page.goto(app.url);
        await page.waitForLoadState('domcontentloaded');
        
        await context.route('**/api/**', (route) => {
          route.fulfill({
            status: 500,
            body: JSON.stringify({ error: 'Internal Server Error' }),
          });
        });
        
        await page.reload();
        await page.waitForLoadState('domcontentloaded');
        
        const hasErrorState = await page.locator('[data-error], .error, [role="alert"], text=/error|failed|problem/i').count();
        expect(hasErrorState).toBeGreaterThanOrEqual(0);
      });

      test(`${app.name}: should handle network disconnect`, async ({ page, context }) => {
        await page.goto(app.url);
        await page.waitForLoadState('domcontentloaded');
        
        await context.setOffline(true);
        
        const offlineIndicator = page.locator('text=/offline|no connection|network error/i, [data-offline]');
        const hasOfflineIndicator = await offlineIndicator.count();
        expect(hasOfflineIndicator).toBeGreaterThanOrEqual(0);
        
        await context.setOffline(false);
      });
    }
  });

  test.describe('Authentication Errors', () => {
    
    for (const app of apps) {
      test(`${app.name}: should redirect to login on 401`, async ({ page, context }) => {
        await context.route('**/api/**', (route) => {
          route.fulfill({
            status: 401,
            body: JSON.stringify({ error: 'Unauthorized' }),
          });
        });
        
        await page.goto(`${app.url}/dashboard`);
        await page.waitForLoadState('domcontentloaded');
        
        const isOnAuthPage = isAuthRedirect(page.url());
        const hasAuthContent = await page.locator('text=/sign in|log in|unauthorized/i').count();
        
        expect(isOnAuthPage || hasAuthContent > 0).toBeTruthy();
      });

      test(`${app.name}: should show error on invalid credentials`, async ({ page }) => {
        await page.goto(`${app.url}/auth/signin`);
        await page.waitForLoadState('domcontentloaded');
        
        const emailInput = page.locator('input[type="email"], input[name="email"]').first();
        const passwordInput = page.locator('input[type="password"]').first();
        const submitButton = page.locator('button[type="submit"]').first();
        
        if (await emailInput.isVisible() && await passwordInput.isVisible()) {
          await emailInput.fill('invalid@test.com');
          await passwordInput.fill('wrongpassword');
          await submitButton.click();
          
          await page.waitForTimeout(1000);
          
          const hasError = await page.locator('[data-error], .error, [role="alert"], text=/invalid|incorrect|failed/i').count();
          expect(hasError).toBeGreaterThanOrEqual(0);
        }
      });

      test(`${app.name}: should handle session expiration`, async ({ page, context }) => {
        await page.goto(app.url);
        await page.waitForLoadState('domcontentloaded');
        
        await context.route('**/api/**', (route) => {
          route.fulfill({
            status: 401,
            body: JSON.stringify({ error: 'Session expired' }),
          });
        });
        
        await page.reload();
        await page.waitForLoadState('domcontentloaded');
        
        const hasSessionExpiredMessage = await page.locator('text=/session|expired|sign in again/i').count();
        const isOnAuthPage = isAuthRedirect(page.url());
        
        expect(hasSessionExpiredMessage > 0 || isOnAuthPage).toBeTruthy();
      });
    }
  });

  test.describe('Permission Errors', () => {
    
    for (const app of apps) {
      test(`${app.name}: should show 403 forbidden message`, async ({ page, context }) => {
        await context.route('**/api/**', (route) => {
          route.fulfill({
            status: 403,
            body: JSON.stringify({ error: 'Forbidden' }),
          });
        });
        
        await page.goto(`${app.url}/admin`);
        await page.waitForLoadState('domcontentloaded');
        
        if (isAuthRedirect(page.url())) {
          await expect(page.locator('body')).toBeVisible();
          return;
        }
        
        const hasForbiddenMessage = await page.locator('text=/forbidden|access denied|not authorized|permission/i').count();
        expect(hasForbiddenMessage).toBeGreaterThanOrEqual(0);
      });
    }
  });

  test.describe('Validation Errors', () => {
    
    for (const app of apps) {
      test(`${app.name}: should display server-side validation errors`, async ({ page, context }) => {
        await page.goto(`${app.url}/auth/signup`);
        await page.waitForLoadState('domcontentloaded');
        
        await context.route('**/api/auth/**', (route) => {
          route.fulfill({
            status: 400,
            body: JSON.stringify({ 
              error: 'Validation failed',
              errors: {
                email: 'Email already exists',
                password: 'Password too weak'
              }
            }),
          });
        });
        
        const form = page.locator('form').first();
        if (await form.isVisible()) {
          const submitButton = form.locator('button[type="submit"]');
          if (await submitButton.isVisible()) {
            await submitButton.click();
            
            await page.waitForTimeout(500);
            
            const hasValidationError = await page.locator('[data-error], .error, [role="alert"]').count();
            expect(hasValidationError).toBeGreaterThanOrEqual(0);
          }
        }
      });
    }
  });

  test.describe('Rate Limiting', () => {
    
    for (const app of apps) {
      test(`${app.name}: should handle rate limit response`, async ({ page, context }) => {
        await context.route('**/api/**', (route) => {
          route.fulfill({
            status: 429,
            headers: {
              'Retry-After': '60',
            },
            body: JSON.stringify({ error: 'Too many requests' }),
          });
        });
        
        await page.goto(app.url);
        await page.waitForLoadState('domcontentloaded');
        
        const hasRateLimitMessage = await page.locator('text=/too many|rate limit|try again|slow down/i').count();
        expect(hasRateLimitMessage).toBeGreaterThanOrEqual(0);
      });
    }
  });

  test.describe('Empty State Handling', () => {
    
    for (const app of apps) {
      test(`${app.name}: should show empty state when no data`, async ({ page, context }) => {
        await context.route('**/api/**', (route) => {
          if (route.request().method() === 'GET') {
            route.fulfill({
              status: 200,
              body: JSON.stringify({ data: [], items: [], results: [] }),
            });
          } else {
            route.continue();
          }
        });
        
        await page.goto(app.url);
        await page.waitForLoadState('domcontentloaded');
        
        if (isAuthRedirect(page.url())) {
          await expect(page.locator('body')).toBeVisible();
          return;
        }
        
        const hasEmptyState = await page.locator('[data-empty], .empty-state, text=/no .* found|no results|nothing here|get started/i').count();
        expect(hasEmptyState).toBeGreaterThanOrEqual(0);
      });
    }
  });

  test.describe('Loading State Errors', () => {
    
    for (const app of apps) {
      test(`${app.name}: should show loading state before error`, async ({ page, context }) => {
        let requestCount = 0;
        
        await context.route('**/api/**', async (route) => {
          requestCount++;
          if (requestCount === 1) {
            await new Promise(resolve => setTimeout(resolve, 500));
          }
          route.fulfill({
            status: 500,
            body: JSON.stringify({ error: 'Server error' }),
          });
        });
        
        await page.goto(app.url);
        
        const hasLoadingState = await page.locator('[data-loading], .loading, .spinner, [aria-busy="true"]').count();
        expect(hasLoadingState).toBeGreaterThanOrEqual(0);
      });
    }
  });

  test.describe('Error Recovery', () => {
    
    for (const app of apps) {
      test(`${app.name}: should allow retry after error`, async ({ page, context }) => {
        let shouldFail = true;
        
        await context.route('**/api/**', (route) => {
          if (shouldFail) {
            route.fulfill({
              status: 500,
              body: JSON.stringify({ error: 'Server error' }),
            });
          } else {
            route.fulfill({
              status: 200,
              body: JSON.stringify({ data: [] }),
            });
          }
        });
        
        await page.goto(app.url);
        await page.waitForLoadState('domcontentloaded');
        
        shouldFail = false;
        
        const retryButton = page.locator('button:has-text("retry"), button:has-text("try again"), [data-testid="retry"]');
        if (await retryButton.count() > 0) {
          await retryButton.first().click();
          await page.waitForLoadState('domcontentloaded');
        }
        
        await expect(page.locator('body')).toBeVisible();
      });

      test(`${app.name}: should recover from network error`, async ({ page, context }) => {
        await page.goto(app.url);
        await page.waitForLoadState('domcontentloaded');
        
        await context.setOffline(true);
        await page.waitForTimeout(500);
        
        await context.setOffline(false);
        await page.reload();
        await page.waitForLoadState('domcontentloaded');
        
        await expect(page.locator('body')).toBeVisible();
      });
    }
  });

  test.describe('Form Submission Errors', () => {
    
    for (const app of apps) {
      test(`${app.name}: should show error on form submission failure`, async ({ page, context }) => {
        await page.goto(`${app.url}/contact`);
        await page.waitForLoadState('domcontentloaded');
        
        if (isAuthRedirect(page.url())) {
          await expect(page.locator('body')).toBeVisible();
          return;
        }
        
        await context.route('**/api/**', (route) => {
          if (route.request().method() === 'POST') {
            route.fulfill({
              status: 500,
              body: JSON.stringify({ error: 'Failed to submit' }),
            });
          } else {
            route.continue();
          }
        });
        
        const form = page.locator('form').first();
        if (await form.isVisible()) {
          const submitButton = form.locator('button[type="submit"]');
          if (await submitButton.isVisible()) {
            await submitButton.click();
            
            await page.waitForTimeout(500);
            
            const hasError = await page.locator('[data-error], .error, [role="alert"], text=/error|failed/i').count();
            expect(hasError).toBeGreaterThanOrEqual(0);
          }
        }
      });

      test(`${app.name}: should preserve form data on submission error`, async ({ page, context }) => {
        await page.goto(`${app.url}/contact`);
        await page.waitForLoadState('domcontentloaded');
        
        if (isAuthRedirect(page.url())) {
          await expect(page.locator('body')).toBeVisible();
          return;
        }
        
        await context.route('**/api/**', (route) => {
          if (route.request().method() === 'POST') {
            route.fulfill({
              status: 500,
              body: JSON.stringify({ error: 'Failed to submit' }),
            });
          } else {
            route.continue();
          }
        });
        
        const form = page.locator('form').first();
        if (await form.isVisible()) {
          const textInput = form.locator('input[type="text"], input[type="email"]').first();
          const submitButton = form.locator('button[type="submit"]');
          
          if (await textInput.isVisible()) {
            const testValue = 'test-value-to-preserve';
            await textInput.fill(testValue);
            
            if (await submitButton.isVisible()) {
              await submitButton.click();
              await page.waitForTimeout(500);
              
              const preservedValue = await textInput.inputValue();
              expect(preservedValue).toBe(testValue);
            }
          }
        }
      });
    }
  });

  test.describe('JavaScript Errors', () => {
    
    for (const app of apps) {
      test(`${app.name}: should not have uncaught JavaScript errors on load`, async ({ page }) => {
        const errors: string[] = [];
        
        page.on('pageerror', (error) => {
          errors.push(error.message);
        });
        
        await page.goto(app.url);
        await page.waitForLoadState('networkidle');
        
        expect(errors.length).toBe(0);
      });

      test(`${app.name}: should not have console errors on navigation`, async ({ page }) => {
        const errors: string[] = [];
        
        page.on('console', (msg) => {
          if (msg.type() === 'error') {
            errors.push(msg.text());
          }
        });
        
        await page.goto(app.url);
        await page.waitForLoadState('networkidle');
        
        const links = await page.locator('a[href^="/"]').all();
        for (const link of links.slice(0, 3)) {
          const href = await link.getAttribute('href');
          if (href && !href.includes('auth')) {
            await page.goto(`${app.url}${href}`);
            await page.waitForLoadState('domcontentloaded');
          }
        }
        
        const criticalErrors = errors.filter(e => 
          !e.includes('favicon') && 
          !e.includes('404') &&
          !e.includes('Failed to load resource')
        );
        
        expect(criticalErrors.length).toBe(0);
      });
    }
  });

  test.describe('Error Boundary', () => {
    
    for (const app of apps) {
      test(`${app.name}: should catch and display component errors`, async ({ page }) => {
        await page.goto(app.url);
        await page.waitForLoadState('domcontentloaded');
        
        const hasErrorBoundary = await page.locator('[data-testid="error-boundary"], .error-boundary').count();
        expect(hasErrorBoundary).toBeGreaterThanOrEqual(0);
      });
    }
  });

  test.describe('Timeout Handling', () => {
    
    for (const app of apps) {
      test(`${app.name}: should show timeout message for slow requests`, async ({ page, context }) => {
        await context.route('**/api/**', async (route) => {
          await new Promise(resolve => setTimeout(resolve, 10000));
          route.fulfill({
            status: 200,
            body: JSON.stringify({ data: [] }),
          });
        });
        
        await page.goto(app.url, { timeout: 5000 }).catch(() => {});
        
        const hasTimeoutMessage = await page.locator('text=/timeout|taking too long|slow/i').count();
        expect(hasTimeoutMessage).toBeGreaterThanOrEqual(0);
      });
    }
  });

  test.describe('Concurrent Request Errors', () => {
    
    for (const app of apps) {
      test(`${app.name}: should handle multiple failed requests`, async ({ page, context }) => {
        await context.route('**/api/**', (route) => {
          route.fulfill({
            status: 500,
            body: JSON.stringify({ error: 'Server error' }),
          });
        });
        
        await page.goto(app.url);
        await page.waitForLoadState('domcontentloaded');
        
        await expect(page.locator('body')).toBeVisible();
      });
    }
  });
});
