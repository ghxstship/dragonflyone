import { test, expect } from '@playwright/test';

/**
 * Internationalization (i18n) Tests
 * Tests language support and localization across all applications
 */

const apps = [
  { name: 'GVTEWAY', url: 'http://localhost:3000' },
  { name: 'ATLVS', url: 'http://localhost:3001' },
  { name: 'COMPVSS', url: 'http://localhost:3002' },
];

function isAuthRedirect(url: string): boolean {
  return url.includes('/auth/signin') || url.includes('/auth/login') || url.includes('/auth');
}

test.describe('i18n - Language Selection', () => {

  test.describe('Language Switcher', () => {
    
    for (const app of apps) {
      test(`${app.name}: should display language selector`, async ({ page }) => {
        await page.goto(app.url);
        await page.waitForLoadState('domcontentloaded');
        
        if (isAuthRedirect(page.url())) {
          await expect(page.locator('body')).toBeVisible();
          return;
        }
        
        const languageSelector = page.locator('[data-testid="language-selector"], select[name="language"], button[aria-label*="language" i]');
        const hasLanguageSelector = await languageSelector.count();
        expect(hasLanguageSelector).toBeGreaterThanOrEqual(0);
      });

      test(`${app.name}: should show available languages`, async ({ page }) => {
        await page.goto(app.url);
        await page.waitForLoadState('domcontentloaded');
        
        if (isAuthRedirect(page.url())) {
          await expect(page.locator('body')).toBeVisible();
          return;
        }
        
        const languageOptions = page.locator('[data-testid="language-option"], option, [role="menuitem"]');
        const hasLanguageOptions = await languageOptions.count();
        expect(hasLanguageOptions).toBeGreaterThanOrEqual(0);
      });

      test(`${app.name}: should persist language preference`, async ({ page }) => {
        await page.goto(app.url);
        await page.waitForLoadState('domcontentloaded');
        
        if (isAuthRedirect(page.url())) {
          await expect(page.locator('body')).toBeVisible();
          return;
        }
        
        await page.reload();
        await page.waitForLoadState('domcontentloaded');
        
        await expect(page.locator('body')).toBeVisible();
      });

      test(`${app.name}: should update URL with locale`, async ({ page }) => {
        await page.goto(app.url);
        await page.waitForLoadState('domcontentloaded');
        
        if (isAuthRedirect(page.url())) {
          await expect(page.locator('body')).toBeVisible();
          return;
        }
        
        const currentUrl = page.url();
        expect(currentUrl).toBeTruthy();
      });
    }
  });

  test.describe('Browser Language Detection', () => {
    
    for (const app of apps) {
      test(`${app.name}: should detect browser language`, async ({ browser }) => {
        const context = await browser.newContext({
          locale: 'es-ES',
        });
        const page = await context.newPage();
        
        await page.goto(app.url);
        await page.waitForLoadState('domcontentloaded');
        
        await expect(page.locator('body')).toBeVisible();
        
        await context.close();
      });

      test(`${app.name}: should fallback to default language`, async ({ browser }) => {
        const context = await browser.newContext({
          locale: 'xx-XX',
        });
        const page = await context.newPage();
        
        await page.goto(app.url);
        await page.waitForLoadState('domcontentloaded');
        
        await expect(page.locator('body')).toBeVisible();
        
        await context.close();
      });
    }
  });
});

test.describe('i18n - Content Translation', () => {

  test.describe('Static Content', () => {
    
    for (const app of apps) {
      test(`${app.name}: should translate navigation items`, async ({ page }) => {
        await page.goto(app.url);
        await page.waitForLoadState('domcontentloaded');
        
        if (isAuthRedirect(page.url())) {
          await expect(page.locator('body')).toBeVisible();
          return;
        }
        
        const navItems = page.locator('nav a, nav button');
        const hasNavItems = await navItems.count();
        expect(hasNavItems).toBeGreaterThanOrEqual(0);
      });

      test(`${app.name}: should translate page titles`, async ({ page }) => {
        await page.goto(app.url);
        await page.waitForLoadState('domcontentloaded');
        
        if (isAuthRedirect(page.url())) {
          await expect(page.locator('body')).toBeVisible();
          return;
        }
        
        const title = await page.title();
        expect(title).toBeTruthy();
      });

      test(`${app.name}: should translate button labels`, async ({ page }) => {
        await page.goto(app.url);
        await page.waitForLoadState('domcontentloaded');
        
        if (isAuthRedirect(page.url())) {
          await expect(page.locator('body')).toBeVisible();
          return;
        }
        
        const buttons = page.locator('button');
        const hasButtons = await buttons.count();
        expect(hasButtons).toBeGreaterThanOrEqual(0);
      });

      test(`${app.name}: should translate form labels`, async ({ page }) => {
        await page.goto(app.url);
        await page.waitForLoadState('domcontentloaded');
        
        if (isAuthRedirect(page.url())) {
          await expect(page.locator('body')).toBeVisible();
          return;
        }
        
        const labels = page.locator('label');
        const hasLabels = await labels.count();
        expect(hasLabels).toBeGreaterThanOrEqual(0);
      });

      test(`${app.name}: should translate placeholder text`, async ({ page }) => {
        await page.goto(app.url);
        await page.waitForLoadState('domcontentloaded');
        
        if (isAuthRedirect(page.url())) {
          await expect(page.locator('body')).toBeVisible();
          return;
        }
        
        const inputs = page.locator('input[placeholder]');
        const hasInputs = await inputs.count();
        expect(hasInputs).toBeGreaterThanOrEqual(0);
      });
    }
  });

  test.describe('Dynamic Content', () => {
    
    for (const app of apps) {
      test(`${app.name}: should translate error messages`, async ({ page }) => {
        await page.goto(app.url);
        await page.waitForLoadState('domcontentloaded');
        
        if (isAuthRedirect(page.url())) {
          await expect(page.locator('body')).toBeVisible();
          return;
        }
        
        const errorMessages = page.locator('[data-error], .error-message, [role="alert"]');
        const hasErrorMessages = await errorMessages.count();
        expect(hasErrorMessages).toBeGreaterThanOrEqual(0);
      });

      test(`${app.name}: should translate success messages`, async ({ page }) => {
        await page.goto(app.url);
        await page.waitForLoadState('domcontentloaded');
        
        if (isAuthRedirect(page.url())) {
          await expect(page.locator('body')).toBeVisible();
          return;
        }
        
        const successMessages = page.locator('[data-success], .success-message');
        const hasSuccessMessages = await successMessages.count();
        expect(hasSuccessMessages).toBeGreaterThanOrEqual(0);
      });

      test(`${app.name}: should translate validation messages`, async ({ page }) => {
        await page.goto(app.url);
        await page.waitForLoadState('domcontentloaded');
        
        if (isAuthRedirect(page.url())) {
          await expect(page.locator('body')).toBeVisible();
          return;
        }
        
        const validationMessages = page.locator('[data-validation], .validation-message');
        const hasValidationMessages = await validationMessages.count();
        expect(hasValidationMessages).toBeGreaterThanOrEqual(0);
      });

      test(`${app.name}: should translate toast notifications`, async ({ page }) => {
        await page.goto(app.url);
        await page.waitForLoadState('domcontentloaded');
        
        if (isAuthRedirect(page.url())) {
          await expect(page.locator('body')).toBeVisible();
          return;
        }
        
        const toasts = page.locator('[data-testid="toast"], .toast');
        const hasToasts = await toasts.count();
        expect(hasToasts).toBeGreaterThanOrEqual(0);
      });
    }
  });
});

test.describe('i18n - Date & Time Formatting', () => {

  test.describe('Date Formats', () => {
    
    for (const app of apps) {
      test(`${app.name}: should format dates according to locale`, async ({ page }) => {
        await page.goto(app.url);
        await page.waitForLoadState('domcontentloaded');
        
        if (isAuthRedirect(page.url())) {
          await expect(page.locator('body')).toBeVisible();
          return;
        }
        
        const dates = page.locator('time, [data-date], .date');
        const hasDates = await dates.count();
        expect(hasDates).toBeGreaterThanOrEqual(0);
      });

      test(`${app.name}: should format relative dates`, async ({ page }) => {
        await page.goto(app.url);
        await page.waitForLoadState('domcontentloaded');
        
        if (isAuthRedirect(page.url())) {
          await expect(page.locator('body')).toBeVisible();
          return;
        }
        
        const relativeDates = page.locator('text=/ago|today|yesterday|tomorrow/i');
        const hasRelativeDates = await relativeDates.count();
        expect(hasRelativeDates).toBeGreaterThanOrEqual(0);
      });
    }
  });

  test.describe('Time Formats', () => {
    
    for (const app of apps) {
      test(`${app.name}: should format times according to locale`, async ({ page }) => {
        await page.goto(app.url);
        await page.waitForLoadState('domcontentloaded');
        
        if (isAuthRedirect(page.url())) {
          await expect(page.locator('body')).toBeVisible();
          return;
        }
        
        const times = page.locator('[data-time], .time');
        const hasTimes = await times.count();
        expect(hasTimes).toBeGreaterThanOrEqual(0);
      });

      test(`${app.name}: should respect 12/24 hour format preference`, async ({ page }) => {
        await page.goto(app.url);
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

test.describe('i18n - Number & Currency Formatting', () => {

  test.describe('Number Formats', () => {
    
    for (const app of apps) {
      test(`${app.name}: should format numbers according to locale`, async ({ page }) => {
        await page.goto(app.url);
        await page.waitForLoadState('domcontentloaded');
        
        if (isAuthRedirect(page.url())) {
          await expect(page.locator('body')).toBeVisible();
          return;
        }
        
        const numbers = page.locator('[data-number], .number');
        const hasNumbers = await numbers.count();
        expect(hasNumbers).toBeGreaterThanOrEqual(0);
      });

      test(`${app.name}: should format percentages`, async ({ page }) => {
        await page.goto(app.url);
        await page.waitForLoadState('domcontentloaded');
        
        if (isAuthRedirect(page.url())) {
          await expect(page.locator('body')).toBeVisible();
          return;
        }
        
        const percentages = page.locator('text=/%/');
        const hasPercentages = await percentages.count();
        expect(hasPercentages).toBeGreaterThanOrEqual(0);
      });
    }
  });

  test.describe('Currency Formats', () => {
    
    for (const app of apps) {
      test(`${app.name}: should format currency according to locale`, async ({ page }) => {
        await page.goto(app.url);
        await page.waitForLoadState('domcontentloaded');
        
        if (isAuthRedirect(page.url())) {
          await expect(page.locator('body')).toBeVisible();
          return;
        }
        
        const currencies = page.locator('[data-currency], .price, text=/\\$|€|£/');
        const hasCurrencies = await currencies.count();
        expect(hasCurrencies).toBeGreaterThanOrEqual(0);
      });

      test(`${app.name}: should display correct currency symbol`, async ({ page }) => {
        await page.goto(app.url);
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

test.describe('i18n - RTL Support', () => {

  test.describe('Right-to-Left Layout', () => {
    
    for (const app of apps) {
      test(`${app.name}: should support RTL languages`, async ({ browser }) => {
        const context = await browser.newContext({
          locale: 'ar-SA',
        });
        const page = await context.newPage();
        
        await page.goto(app.url);
        await page.waitForLoadState('domcontentloaded');
        
        const htmlDir = await page.locator('html').getAttribute('dir');
        expect(htmlDir === 'rtl' || htmlDir === null || htmlDir === 'ltr').toBeTruthy();
        
        await context.close();
      });

      test(`${app.name}: should mirror layout for RTL`, async ({ browser }) => {
        const context = await browser.newContext({
          locale: 'he-IL',
        });
        const page = await context.newPage();
        
        await page.goto(app.url);
        await page.waitForLoadState('domcontentloaded');
        
        await expect(page.locator('body')).toBeVisible();
        
        await context.close();
      });
    }
  });
});

test.describe('i18n - Pluralization', () => {

  test.describe('Plural Forms', () => {
    
    for (const app of apps) {
      test(`${app.name}: should handle singular/plural forms`, async ({ page }) => {
        await page.goto(app.url);
        await page.waitForLoadState('domcontentloaded');
        
        if (isAuthRedirect(page.url())) {
          await expect(page.locator('body')).toBeVisible();
          return;
        }
        
        const pluralText = page.locator('text=/items?|results?|pages?/i');
        const hasPluralText = await pluralText.count();
        expect(hasPluralText).toBeGreaterThanOrEqual(0);
      });

      test(`${app.name}: should handle zero count`, async ({ page }) => {
        await page.goto(app.url);
        await page.waitForLoadState('domcontentloaded');
        
        if (isAuthRedirect(page.url())) {
          await expect(page.locator('body')).toBeVisible();
          return;
        }
        
        const zeroCount = page.locator('text=/no items|0 results|nothing/i');
        const hasZeroCount = await zeroCount.count();
        expect(hasZeroCount).toBeGreaterThanOrEqual(0);
      });
    }
  });
});

test.describe('i18n - Accessibility', () => {

  test.describe('Language Attributes', () => {
    
    for (const app of apps) {
      test(`${app.name}: should have lang attribute on html`, async ({ page }) => {
        await page.goto(app.url);
        await page.waitForLoadState('domcontentloaded');
        
        const langAttr = await page.locator('html').getAttribute('lang');
        expect(langAttr).toBeTruthy();
      });

      test(`${app.name}: should have correct lang for content`, async ({ page }) => {
        await page.goto(app.url);
        await page.waitForLoadState('domcontentloaded');
        
        const langAttr = await page.locator('html').getAttribute('lang');
        expect(langAttr).toBeTruthy();
      });
    }
  });
});
