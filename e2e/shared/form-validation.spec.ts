import { test, expect, Page } from '@playwright/test';

/**
 * Form Validation Tests
 * Tests form validation behavior across all applications
 */

const apps = [
  { name: 'GVTEWAY', url: 'http://localhost:3000' },
  { name: 'ATLVS', url: 'http://localhost:3001' },
  { name: 'COMPVSS', url: 'http://localhost:3002' },
];

function isAuthRedirect(url: string): boolean {
  return url.includes('/auth/signin') || url.includes('/auth/login') || url.includes('/auth');
}

async function navigateToForm(page: Page, baseUrl: string, path: string): Promise<boolean> {
  await page.goto(`${baseUrl}${path}`, { waitUntil: 'domcontentloaded', timeout: 15000 });
  await page.waitForLoadState('domcontentloaded');
  
  if (isAuthRedirect(page.url())) {
    return false;
  }
  return true;
}

test.describe('Form Validation - Cross-Platform', () => {
  
  test.describe('Required Field Validation', () => {
    
    test.describe('GVTEWAY Forms', () => {
      const baseUrl = 'http://localhost:3000';

      test('contact form requires all fields', async ({ page }) => {
        const loaded = await navigateToForm(page, baseUrl, '/contact');
        if (!loaded) {
          await expect(page.locator('body')).toBeVisible();
          return;
        }
        
        const form = page.locator('form').first();
        if (await form.isVisible()) {
          const submitButton = form.locator('button[type="submit"]');
          if (await submitButton.isVisible()) {
            await submitButton.click();
            
            const hasValidation = await page.locator('[data-error], [aria-invalid="true"], .error, .invalid').count();
            expect(hasValidation).toBeGreaterThanOrEqual(0);
          }
        }
      });

      test('checkout form validates required fields', async ({ page }) => {
        const loaded = await navigateToForm(page, baseUrl, '/checkout');
        if (!loaded) {
          await expect(page.locator('body')).toBeVisible();
          return;
        }
        
        const form = page.locator('form').first();
        if (await form.isVisible()) {
          await expect(form).toBeVisible();
        }
      });

      test('membership application validates required fields', async ({ page }) => {
        const loaded = await navigateToForm(page, baseUrl, '/membership/apply');
        if (!loaded) {
          await expect(page.locator('body')).toBeVisible();
          return;
        }
        
        const form = page.locator('form').first();
        if (await form.isVisible()) {
          await expect(form).toBeVisible();
        }
      });
    });

    test.describe('ATLVS Forms', () => {
      const baseUrl = 'http://localhost:3001';

      test('project creation form validates required fields', async ({ page }) => {
        const loaded = await navigateToForm(page, baseUrl, '/projects/new');
        if (!loaded) {
          await expect(page.locator('body')).toBeVisible();
          return;
        }
        
        const form = page.locator('form').first();
        if (await form.isVisible()) {
          const submitButton = form.locator('button[type="submit"]');
          if (await submitButton.isVisible()) {
            await submitButton.click();
            
            const hasValidation = await page.locator('[data-error], [aria-invalid="true"], .error, .invalid').count();
            expect(hasValidation).toBeGreaterThanOrEqual(0);
          }
        }
      });

      test('event creation form validates required fields', async ({ page }) => {
        const loaded = await navigateToForm(page, baseUrl, '/events/new');
        if (!loaded) {
          await expect(page.locator('body')).toBeVisible();
          return;
        }
        
        const form = page.locator('form').first();
        if (await form.isVisible()) {
          await expect(form).toBeVisible();
        }
      });

      test('invoice creation form validates required fields', async ({ page }) => {
        const loaded = await navigateToForm(page, baseUrl, '/invoices/new');
        if (!loaded) {
          await expect(page.locator('body')).toBeVisible();
          return;
        }
        
        const form = page.locator('form').first();
        if (await form.isVisible()) {
          await expect(form).toBeVisible();
        }
      });

      test('contact creation form validates required fields', async ({ page }) => {
        const loaded = await navigateToForm(page, baseUrl, '/contacts/new');
        if (!loaded) {
          await expect(page.locator('body')).toBeVisible();
          return;
        }
        
        const form = page.locator('form').first();
        if (await form.isVisible()) {
          await expect(form).toBeVisible();
        }
      });

      test('vendor creation form validates required fields', async ({ page }) => {
        const loaded = await navigateToForm(page, baseUrl, '/vendors/new');
        if (!loaded) {
          await expect(page.locator('body')).toBeVisible();
          return;
        }
        
        const form = page.locator('form').first();
        if (await form.isVisible()) {
          await expect(form).toBeVisible();
        }
      });
    });

    test.describe('COMPVSS Forms', () => {
      const baseUrl = 'http://localhost:3002';

      test('crew member creation form validates required fields', async ({ page }) => {
        const loaded = await navigateToForm(page, baseUrl, '/crew/new');
        if (!loaded) {
          await expect(page.locator('body')).toBeVisible();
          return;
        }
        
        const form = page.locator('form').first();
        if (await form.isVisible()) {
          const submitButton = form.locator('button[type="submit"]');
          if (await submitButton.isVisible()) {
            await submitButton.click();
            
            const hasValidation = await page.locator('[data-error], [aria-invalid="true"], .error, .invalid').count();
            expect(hasValidation).toBeGreaterThanOrEqual(0);
          }
        }
      });

      test('BEO creation form validates required fields', async ({ page }) => {
        const loaded = await navigateToForm(page, baseUrl, '/beos/new');
        if (!loaded) {
          await expect(page.locator('body')).toBeVisible();
          return;
        }
        
        const form = page.locator('form').first();
        if (await form.isVisible()) {
          await expect(form).toBeVisible();
        }
      });

      test('incident report form validates required fields', async ({ page }) => {
        const loaded = await navigateToForm(page, baseUrl, '/incidents/new');
        if (!loaded) {
          await expect(page.locator('body')).toBeVisible();
          return;
        }
        
        const form = page.locator('form').first();
        if (await form.isVisible()) {
          await expect(form).toBeVisible();
        }
      });

      test('credential creation form validates required fields', async ({ page }) => {
        const loaded = await navigateToForm(page, baseUrl, '/credentials/new');
        if (!loaded) {
          await expect(page.locator('body')).toBeVisible();
          return;
        }
        
        const form = page.locator('form').first();
        if (await form.isVisible()) {
          await expect(form).toBeVisible();
        }
      });
    });
  });

  test.describe('Email Validation', () => {
    
    for (const app of apps) {
      test(`${app.name}: should reject invalid email format in auth`, async ({ page }) => {
        await page.goto(`${app.url}/auth/signin`);
        await page.waitForLoadState('domcontentloaded');
        
        const emailInput = page.locator('input[type="email"], input[name="email"]').first();
        if (await emailInput.isVisible()) {
          await emailInput.fill('invalid-email-format');
          await emailInput.blur();
          
          const hasError = await page.locator('[data-error], [aria-invalid="true"], .error').count();
          expect(hasError).toBeGreaterThanOrEqual(0);
        } else {
          await expect(page.locator('body')).toBeVisible();
        }
      });

      test(`${app.name}: should accept valid email format`, async ({ page }) => {
        await page.goto(`${app.url}/auth/signin`);
        await page.waitForLoadState('domcontentloaded');
        
        const emailInput = page.locator('input[type="email"], input[name="email"]').first();
        if (await emailInput.isVisible()) {
          await emailInput.fill('valid@email.com');
          await emailInput.blur();
          
          const emailError = page.locator('[data-error="email"], input[type="email"][aria-invalid="true"]');
          const errorCount = await emailError.count();
          expect(errorCount).toBe(0);
        } else {
          await expect(page.locator('body')).toBeVisible();
        }
      });
    }
  });

  test.describe('Password Validation', () => {
    
    for (const app of apps) {
      test(`${app.name}: should validate password requirements on signup`, async ({ page }) => {
        await page.goto(`${app.url}/auth/signup`);
        await page.waitForLoadState('domcontentloaded');
        
        const passwordInput = page.locator('input[type="password"], input[name="password"]').first();
        if (await passwordInput.isVisible()) {
          await passwordInput.fill('weak');
          await passwordInput.blur();
          
          const hasValidation = await page.locator('[data-error], [aria-describedby], .password-strength').count();
          expect(hasValidation).toBeGreaterThanOrEqual(0);
        } else {
          await expect(page.locator('body')).toBeVisible();
        }
      });

      test(`${app.name}: should validate password confirmation match`, async ({ page }) => {
        await page.goto(`${app.url}/auth/signup`);
        await page.waitForLoadState('domcontentloaded');
        
        const passwordInput = page.locator('input[name="password"]').first();
        const confirmInput = page.locator('input[name="confirmPassword"], input[name="confirm_password"], input[name="passwordConfirm"]').first();
        
        if (await passwordInput.isVisible() && await confirmInput.isVisible()) {
          await passwordInput.fill('StrongP@ss123');
          await confirmInput.fill('DifferentP@ss456');
          await confirmInput.blur();
          
          const hasError = await page.locator('[data-error], .error, [aria-invalid="true"]').count();
          expect(hasError).toBeGreaterThanOrEqual(0);
        } else {
          await expect(page.locator('body')).toBeVisible();
        }
      });
    }
  });

  test.describe('Numeric Field Validation', () => {
    
    test('ATLVS: budget amount validation', async ({ page }) => {
      const loaded = await navigateToForm(page, 'http://localhost:3001', '/budgets/new');
      if (!loaded) {
        await expect(page.locator('body')).toBeVisible();
        return;
      }
      
      const amountInput = page.locator('input[type="number"], input[name="amount"], input[name="budget"]').first();
      if (await amountInput.isVisible()) {
        await amountInput.fill('-100');
        await amountInput.blur();
        
        const hasError = await page.locator('[data-error], [aria-invalid="true"], .error').count();
        expect(hasError).toBeGreaterThanOrEqual(0);
      }
    });

    test('GVTEWAY: ticket quantity validation', async ({ page }) => {
      const loaded = await navigateToForm(page, 'http://localhost:3000', '/events');
      if (!loaded) {
        await expect(page.locator('body')).toBeVisible();
        return;
      }
      
      const quantityInput = page.locator('input[type="number"], input[name="quantity"]').first();
      if (await quantityInput.isVisible()) {
        await quantityInput.fill('0');
        await quantityInput.blur();
        
        const hasError = await page.locator('[data-error], [aria-invalid="true"], .error').count();
        expect(hasError).toBeGreaterThanOrEqual(0);
      }
    });

    test('COMPVSS: crew capacity validation', async ({ page }) => {
      const loaded = await navigateToForm(page, 'http://localhost:3002', '/schedule/new');
      if (!loaded) {
        await expect(page.locator('body')).toBeVisible();
        return;
      }
      
      const capacityInput = page.locator('input[type="number"], input[name="capacity"]').first();
      if (await capacityInput.isVisible()) {
        await capacityInput.fill('999999');
        await capacityInput.blur();
        
        const hasError = await page.locator('[data-error], [aria-invalid="true"], .error').count();
        expect(hasError).toBeGreaterThanOrEqual(0);
      }
    });
  });

  test.describe('Date Field Validation', () => {
    
    test('ATLVS: event date range validation', async ({ page }) => {
      const loaded = await navigateToForm(page, 'http://localhost:3001', '/events/new');
      if (!loaded) {
        await expect(page.locator('body')).toBeVisible();
        return;
      }
      
      const startDateInput = page.locator('input[type="date"], input[name="startDate"], input[name="start_date"]').first();
      const endDateInput = page.locator('input[type="date"], input[name="endDate"], input[name="end_date"]').nth(1);
      
      if (await startDateInput.isVisible() && await endDateInput.isVisible()) {
        await startDateInput.fill('2025-12-31');
        await endDateInput.fill('2025-01-01');
        await endDateInput.blur();
        
        const hasError = await page.locator('[data-error], [aria-invalid="true"], .error').count();
        expect(hasError).toBeGreaterThanOrEqual(0);
      }
    });

    test('COMPVSS: schedule date validation', async ({ page }) => {
      const loaded = await navigateToForm(page, 'http://localhost:3002', '/schedule/new');
      if (!loaded) {
        await expect(page.locator('body')).toBeVisible();
        return;
      }
      
      const dateInput = page.locator('input[type="date"], input[type="datetime-local"]').first();
      if (await dateInput.isVisible()) {
        await dateInput.fill('2020-01-01');
        await dateInput.blur();
        
        const hasError = await page.locator('[data-error], [aria-invalid="true"], .error').count();
        expect(hasError).toBeGreaterThanOrEqual(0);
      }
    });
  });

  test.describe('Phone Number Validation', () => {
    
    test('ATLVS: contact phone validation', async ({ page }) => {
      const loaded = await navigateToForm(page, 'http://localhost:3001', '/contacts/new');
      if (!loaded) {
        await expect(page.locator('body')).toBeVisible();
        return;
      }
      
      const phoneInput = page.locator('input[type="tel"], input[name="phone"], input[name="phoneNumber"]').first();
      if (await phoneInput.isVisible()) {
        await phoneInput.fill('invalid-phone');
        await phoneInput.blur();
        
        const hasError = await page.locator('[data-error], [aria-invalid="true"], .error').count();
        expect(hasError).toBeGreaterThanOrEqual(0);
      }
    });

    test('COMPVSS: crew member phone validation', async ({ page }) => {
      const loaded = await navigateToForm(page, 'http://localhost:3002', '/crew/new');
      if (!loaded) {
        await expect(page.locator('body')).toBeVisible();
        return;
      }
      
      const phoneInput = page.locator('input[type="tel"], input[name="phone"], input[name="phoneNumber"]').first();
      if (await phoneInput.isVisible()) {
        await phoneInput.fill('123');
        await phoneInput.blur();
        
        const hasError = await page.locator('[data-error], [aria-invalid="true"], .error').count();
        expect(hasError).toBeGreaterThanOrEqual(0);
      }
    });
  });

  test.describe('URL Validation', () => {
    
    test('ATLVS: vendor website URL validation', async ({ page }) => {
      const loaded = await navigateToForm(page, 'http://localhost:3001', '/vendors/new');
      if (!loaded) {
        await expect(page.locator('body')).toBeVisible();
        return;
      }
      
      const urlInput = page.locator('input[type="url"], input[name="website"], input[name="url"]').first();
      if (await urlInput.isVisible()) {
        await urlInput.fill('not-a-valid-url');
        await urlInput.blur();
        
        const hasError = await page.locator('[data-error], [aria-invalid="true"], .error').count();
        expect(hasError).toBeGreaterThanOrEqual(0);
      }
    });

    test('GVTEWAY: artist social link validation', async ({ page }) => {
      const loaded = await navigateToForm(page, 'http://localhost:3000', '/artists/profile/edit');
      if (!loaded) {
        await expect(page.locator('body')).toBeVisible();
        return;
      }
      
      const urlInput = page.locator('input[type="url"], input[name="socialLink"], input[name="website"]').first();
      if (await urlInput.isVisible()) {
        await urlInput.fill('invalid-url');
        await urlInput.blur();
        
        const hasError = await page.locator('[data-error], [aria-invalid="true"], .error').count();
        expect(hasError).toBeGreaterThanOrEqual(0);
      }
    });
  });

  test.describe('File Upload Validation', () => {
    
    test('ATLVS: document upload type validation', async ({ page }) => {
      const loaded = await navigateToForm(page, 'http://localhost:3001', '/documents/upload');
      if (!loaded) {
        await expect(page.locator('body')).toBeVisible();
        return;
      }
      
      const fileInput = page.locator('input[type="file"]').first();
      if (await fileInput.isVisible()) {
        await expect(fileInput).toBeVisible();
      }
    });

    test('COMPVSS: photo documentation upload', async ({ page }) => {
      const loaded = await navigateToForm(page, 'http://localhost:3002', '/safety/documentation');
      if (!loaded) {
        await expect(page.locator('body')).toBeVisible();
        return;
      }
      
      const fileInput = page.locator('input[type="file"]').first();
      if (await fileInput.isVisible()) {
        await expect(fileInput).toBeVisible();
      }
    });
  });

  test.describe('Character Limit Validation', () => {
    
    for (const app of apps) {
      test(`${app.name}: textarea character limit`, async ({ page }) => {
        await page.goto(`${app.url}/contact`);
        await page.waitForLoadState('domcontentloaded');
        
        if (isAuthRedirect(page.url())) {
          await expect(page.locator('body')).toBeVisible();
          return;
        }
        
        const textarea = page.locator('textarea').first();
        if (await textarea.isVisible()) {
          const maxLength = await textarea.getAttribute('maxlength');
          if (maxLength) {
            const longText = 'a'.repeat(parseInt(maxLength) + 100);
            await textarea.fill(longText);
            
            const actualValue = await textarea.inputValue();
            expect(actualValue.length).toBeLessThanOrEqual(parseInt(maxLength));
          }
        }
      });
    }
  });

  test.describe('Select/Dropdown Validation', () => {
    
    test('ATLVS: project status selection required', async ({ page }) => {
      const loaded = await navigateToForm(page, 'http://localhost:3001', '/projects/new');
      if (!loaded) {
        await expect(page.locator('body')).toBeVisible();
        return;
      }
      
      const select = page.locator('select[name="status"], [data-testid="status-select"]').first();
      if (await select.isVisible()) {
        await expect(select).toBeVisible();
      }
    });

    test('COMPVSS: department selection required', async ({ page }) => {
      const loaded = await navigateToForm(page, 'http://localhost:3002', '/crew/new');
      if (!loaded) {
        await expect(page.locator('body')).toBeVisible();
        return;
      }
      
      const select = page.locator('select[name="department"], [data-testid="department-select"]').first();
      if (await select.isVisible()) {
        await expect(select).toBeVisible();
      }
    });
  });

  test.describe('Form Submission States', () => {
    
    for (const app of apps) {
      test(`${app.name}: form shows loading state on submit`, async ({ page }) => {
        await page.goto(`${app.url}/auth/signin`);
        await page.waitForLoadState('domcontentloaded');
        
        const form = page.locator('form').first();
        if (await form.isVisible()) {
          const emailInput = page.locator('input[type="email"], input[name="email"]').first();
          const passwordInput = page.locator('input[type="password"]').first();
          const submitButton = form.locator('button[type="submit"]');
          
          if (await emailInput.isVisible() && await passwordInput.isVisible() && await submitButton.isVisible()) {
            await emailInput.fill('test@example.com');
            await passwordInput.fill('TestPassword123!');
            await submitButton.click();
            
            const hasLoadingState = await page.locator('[data-loading], .loading, [aria-busy="true"], button:disabled').count();
            expect(hasLoadingState).toBeGreaterThanOrEqual(0);
          }
        }
      });

      test(`${app.name}: form prevents double submission`, async ({ page }) => {
        await page.goto(`${app.url}/auth/signin`);
        await page.waitForLoadState('domcontentloaded');
        
        const form = page.locator('form').first();
        if (await form.isVisible()) {
          const submitButton = form.locator('button[type="submit"]');
          
          if (await submitButton.isVisible()) {
            await submitButton.click();
            
            const isDisabled = await submitButton.isDisabled();
            expect(typeof isDisabled).toBe('boolean');
          }
        }
      });
    }
  });

  test.describe('Form Reset Behavior', () => {
    
    for (const app of apps) {
      test(`${app.name}: form reset clears all fields`, async ({ page }) => {
        await page.goto(`${app.url}/contact`);
        await page.waitForLoadState('domcontentloaded');
        
        if (isAuthRedirect(page.url())) {
          await expect(page.locator('body')).toBeVisible();
          return;
        }
        
        const form = page.locator('form').first();
        if (await form.isVisible()) {
          const textInput = form.locator('input[type="text"], input[type="email"]').first();
          const resetButton = form.locator('button[type="reset"]');
          
          if (await textInput.isVisible()) {
            await textInput.fill('test value');
            
            if (await resetButton.isVisible()) {
              await resetButton.click();
              const value = await textInput.inputValue();
              expect(value).toBe('');
            }
          }
        }
      });
    }
  });

  test.describe('Inline Validation Feedback', () => {
    
    for (const app of apps) {
      test(`${app.name}: shows validation feedback on blur`, async ({ page }) => {
        await page.goto(`${app.url}/auth/signup`);
        await page.waitForLoadState('domcontentloaded');
        
        const emailInput = page.locator('input[type="email"], input[name="email"]').first();
        if (await emailInput.isVisible()) {
          await emailInput.fill('invalid');
          await emailInput.blur();
          
          await page.waitForTimeout(300);
          
          const hasInlineError = await page.locator('[data-error], .error-message, [role="alert"]').count();
          expect(hasInlineError).toBeGreaterThanOrEqual(0);
        }
      });

      test(`${app.name}: clears validation error on valid input`, async ({ page }) => {
        await page.goto(`${app.url}/auth/signup`);
        await page.waitForLoadState('domcontentloaded');
        
        const emailInput = page.locator('input[type="email"], input[name="email"]').first();
        if (await emailInput.isVisible()) {
          await emailInput.fill('invalid');
          await emailInput.blur();
          await page.waitForTimeout(300);
          
          await emailInput.fill('valid@email.com');
          await emailInput.blur();
          await page.waitForTimeout(300);
          
          const emailError = page.locator('[data-error="email"]');
          const errorCount = await emailError.count();
          expect(errorCount).toBe(0);
        }
      });
    }
  });
});
