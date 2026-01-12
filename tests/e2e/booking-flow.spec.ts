/**
 * E2E Tests for Cross-Platform Booking Flow
 * Tests the complete user journey across GVTEWAY, ATLVS, and COMPVSS
 */

import { test, expect, type Page } from '@playwright/test';

// Helper to fill guest details form
async function fillGuestDetails(page: Page, platform: 'gvteway' | 'atlvs' | 'compvss') {
  await page.fill('input[id="firstName"]', 'Test');
  await page.fill('input[id="lastName"]', 'User');
  await page.fill('input[id="email"]', `test.user+${Date.now()}@example.com`);
  await page.fill('input[id="phone"]', '555-1234');
  await page.fill('input[id="country"]', 'USA');
  await page.check('input[id="agreeToTerms"]');
}

test.describe('GVTEWAY Experience Booking Flow', () => {
  test('should complete full booking flow for an experience', async ({ page }) => {
    // Navigate to experience page
    await page.goto('http://localhost:3000/experiences/test-experience-id');

    // Wait for page load
    await expect(page.locator('h1')).toBeVisible();

    // Click "Book Now" button
    await page.click('text=Book Now');

    // Step 1: Review
    await expect(page.locator('text=Book Experience')).toBeVisible();
    await expect(page.locator('text=Continue to Details')).toBeVisible();

    // Verify pricing is displayed
    await expect(page.locator('text=Subtotal')).toBeVisible();
    await expect(page.locator('text=Total')).toBeVisible();

    // Continue to guest details
    await page.click('text=Continue to Details');

    // Step 2: Guest Details
    await expect(page.locator('text=Guest Information')).toBeVisible();

    // Fill form
    await fillGuestDetails(page, 'gvteway');

    // Continue to payment
    await page.click('text=Continue to Payment');

    // Step 3: Payment
    await expect(page.locator('[data-testid="stripe-wrapper"]')).toBeVisible();

    // Note: In real E2E tests, you would use Stripe test cards
    // For this demo, we'll just verify the payment form is present
    await expect(page.locator('[data-testid="payment-form"]')).toBeVisible();
  });

  test('should validate required fields in guest details', async ({ page }) => {
    await page.goto('http://localhost:3000/experiences/test-experience-id');
    await page.click('text=Book Now');
    await page.click('text=Continue to Details');

    // Try to submit without filling required fields
    await page.click('text=Continue to Payment');

    // Form should not advance (validation should prevent it)
    await expect(page.locator('text=Guest Information')).toBeVisible();
  });

  test('should allow navigation back through steps', async ({ page }) => {
    await page.goto('http://localhost:3000/experiences/test-experience-id');
    await page.click('text=Book Now');

    // Go to details
    await page.click('text=Continue to Details');
    await expect(page.locator('text=Guest Information')).toBeVisible();

    // Go back to review
    await page.click('text=Back');
    await expect(page.locator('text=Continue to Details')).toBeVisible();
  });

  test('should close modal when clicking close button', async ({ page }) => {
    await page.goto('http://localhost:3000/experiences/test-experience-id');
    await page.click('text=Book Now');

    await expect(page.locator('.booking-modal')).toBeVisible();

    // Click close button
    await page.click('button[aria-label="Close"]');

    // Modal should be closed
    await expect(page.locator('.booking-modal')).not.toBeVisible();
  });
});

test.describe('ATLVS Package Booking Flow', () => {
  test('should display package list page', async ({ page }) => {
    await page.goto('http://localhost:3001/packages');

    // Wait for packages to load
    await expect(page.locator('h1')).toContainText('Travel Packages');

    // Should display package cards
    await expect(page.locator('[href^="/packages/"]').first()).toBeVisible();
  });

  test('should complete booking flow for a travel package', async ({ page }) => {
    // Navigate to package detail page
    await page.goto('http://localhost:3001/packages/test-package-id');

    await expect(page.locator('h1')).toBeVisible();

    // Click "Book This Package"
    await page.click('text=Book This Package');

    // Step 1: Review
    await expect(page.locator('text=Book Package')).toBeVisible();
    await page.click('text=Continue to Details');

    // Step 2: Traveler Details
    await expect(page.locator('text=Traveler Information')).toBeVisible();

    await fillGuestDetails(page, 'atlvs');
    await page.click('text=Continue to Payment');

    // Step 3: Payment
    await expect(page.locator('[data-testid="stripe-wrapper"]')).toBeVisible();
  });

  test('should filter packages by featured', async ({ page }) => {
    await page.goto('http://localhost:3001/packages');

    // Click featured filter
    await page.check('text=Featured Only');

    // Wait for filtered results
    await page.waitForTimeout(500);

    // Should only show featured packages
    const featuredBadges = await page.locator('text=Featured').count();
    expect(featuredBadges).toBeGreaterThan(0);
  });
});

test.describe('COMPVSS Competition Entry Flow', () => {
  test('should display competition details', async ({ page }) => {
    await page.goto('http://localhost:3002/competitions/test-competition-id');

    await expect(page.locator('h1')).toBeVisible();

    // Should show competition status
    await expect(page.locator('text=/open|closed|draft/i')).toBeVisible();

    // Should show entry fee
    await expect(page.locator('text=Entry Fee')).toBeVisible();
  });

  test('should complete entry registration flow', async ({ page }) => {
    await page.goto('http://localhost:3002/competitions/test-competition-id');

    // Click "Register for Competition"
    await page.click('text=Register for Competition');

    // Step 1: Review
    await expect(page.locator('text=Book Entry')).toBeVisible();
    await page.click('text=Continue to Details');

    // Step 2: Participant Details
    await expect(page.locator('text=Participant Information')).toBeVisible();

    await fillGuestDetails(page, 'compvss');
    await page.click('text=Continue to Payment');

    // Step 3: Payment
    await expect(page.locator('[data-testid="stripe-wrapper"]')).toBeVisible();
  });

  test('should disable registration for closed competitions', async ({ page }) => {
    // This would need a closed competition ID
    await page.goto('http://localhost:3002/competitions/closed-competition-id');

    // Register button should be disabled or show "Registration Closed"
    await expect(page.locator('text=/Registration.*Closed/i')).toBeVisible();
  });
});

test.describe('Cross-Platform Consistency', () => {
  test('should have consistent UI across platforms', async ({ page }) => {
    const platforms = [
      { url: 'http://localhost:3000/experiences/test-id', title: 'Book Experience' },
      { url: 'http://localhost:3001/packages/test-id', title: 'Book Package' },
      { url: 'http://localhost:3002/competitions/test-id', title: 'Book Entry' },
    ];

    for (const platform of platforms) {
      await page.goto(platform.url);

      // Click booking button (different text per platform)
      const buttons = await page.locator('button').all();
      for (const button of buttons) {
        const text = await button.textContent();
        if (text?.includes('Book') || text?.includes('Register')) {
          await button.click();
          break;
        }
      }

      // All should have same modal structure
      await expect(page.locator('.booking-modal')).toBeVisible();
      await expect(page.locator('.booking-modal__header')).toBeVisible();
      await expect(page.locator('.booking-modal__progress')).toBeVisible();

      // Close modal
      await page.click('button[aria-label="Close"]');
    }
  });

  test('should show correct progress indicator steps', async ({ page }) => {
    await page.goto('http://localhost:3000/experiences/test-id');

    // Open modal
    await page.click('text=Book Now');

    // Should show 3 steps
    const steps = await page.locator('.booking-modal__progress-step').count();
    expect(steps).toBe(3);

    // Step 1 should be active
    await expect(
      page.locator('.booking-modal__progress-step--active').first()
    ).toContainText('1');

    // Navigate to step 2
    await page.click('text=Continue to Details');
    await expect(
      page.locator('.booking-modal__progress-step--active').first()
    ).toContainText('2');
  });
});

test.describe('Error Handling', () => {
  test('should display error when booking creation fails', async ({ page }) => {
    // Mock API failure
    await page.route('**/api/**/create', (route) => {
      route.fulfill({
        status: 500,
        body: JSON.stringify({ error: 'Internal server error' }),
      });
    });

    await page.goto('http://localhost:3000/experiences/test-id');
    await page.click('text=Book Now');
    await page.click('text=Continue to Details');

    await fillGuestDetails(page, 'gvteway');
    await page.click('text=Continue to Payment');

    // Should show error message
    await expect(page.locator('.booking-modal__error')).toBeVisible();
    await expect(page.locator('text=/error|failed/i')).toBeVisible();
  });

  test('should handle payment failures gracefully', async ({ page }) => {
    await page.goto('http://localhost:3000/experiences/test-id');
    await page.click('text=Book Now');
    await page.click('text=Continue to Details');

    await fillGuestDetails(page, 'gvteway');
    await page.click('text=Continue to Payment');

    // Simulate payment failure
    await page.click('text=Fail Payment');

    // Should show error
    await expect(page.locator('.booking-modal__error')).toBeVisible();
  });
});

test.describe('Accessibility', () => {
  test('should have proper ARIA labels', async ({ page }) => {
    await page.goto('http://localhost:3000/experiences/test-id');
    await page.click('text=Book Now');

    // Close button should have aria-label
    const closeButton = page.locator('button[aria-label="Close"]');
    await expect(closeButton).toBeVisible();

    // Form inputs should have labels
    await page.click('text=Continue to Details');
    const firstNameInput = page.locator('input[id="firstName"]');
    const label = page.locator('label[for="firstName"]');
    await expect(label).toBeVisible();
  });

  test('should be keyboard navigable', async ({ page }) => {
    await page.goto('http://localhost:3000/experiences/test-id');
    await page.click('text=Book Now');

    // Tab through form fields
    await page.click('text=Continue to Details');
    await page.keyboard.press('Tab');
    await page.keyboard.type('Test');

    await page.keyboard.press('Tab');
    await page.keyboard.type('User');

    // Form should receive input
    const firstName = await page.locator('input[id="firstName"]').inputValue();
    expect(firstName).toBe('Test');
  });
});
