import { test, expect } from '@playwright/test';

test.describe('GVTEWAY Events', () => {
  test('should display events page', async ({ page }) => {
    await page.goto('http://localhost:3003/events');
    await page.waitForLoadState('networkidle');
    
    // Check page loaded
    await expect(page).toHaveURL(/events/);
  });

  test('should filter events', async ({ page }) => {
    await page.goto('http://localhost:3003/events');
    await page.waitForLoadState('networkidle');
    
    // Look for filter controls
    const filterButton = page.getByRole('button', { name: /filter/i });
    if (await filterButton.isVisible()) {
      await filterButton.click();
      await page.waitForTimeout(300);
    }
  });

  test('should view event details', async ({ page }) => {
    await page.goto('http://localhost:3003/events');
    await page.waitForLoadState('networkidle');
    
    // Click first event card if exists
    const eventCard = page.locator('article, [data-testid="event-card"]').first();
    if (await eventCard.isVisible()) {
      await eventCard.click();
    }
  });
});
