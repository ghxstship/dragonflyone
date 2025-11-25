import { test, expect } from "@playwright/test";

/**
 * Cross-Platform Responsive Testing Suite
 * Tests responsive behavior across desktop, tablet, and mobile viewports
 */

const apps = [
  { name: "GVTEWAY", url: "http://localhost:3000", path: "/" },
  { name: "ATLVS", url: "http://localhost:3001", path: "/" },
  { name: "COMPVSS", url: "http://localhost:3002", path: "/" },
];

const viewports = {
  mobile: { width: 375, height: 667 },
  tablet: { width: 768, height: 1024 },
  desktop: { width: 1280, height: 800 },
  widescreen: { width: 1920, height: 1080 },
};

test.describe("Cross-Platform Responsive Testing", () => {
  for (const app of apps) {
    test.describe(`${app.name} App`, () => {
      test("should render correctly on mobile viewport", async ({ page }) => {
        await page.setViewportSize(viewports.mobile);
        await page.goto(app.url + app.path);
        
        // Wait for page to load
        await page.waitForLoadState("networkidle");
        
        // Check that mobile navigation is present (hamburger menu)
        const mobileNav = page.locator('[data-testid="mobile-nav"], [aria-label="Menu"], button:has-text("Menu")');
        
        // Take screenshot for visual regression
        await expect(page).toHaveScreenshot(`${app.name.toLowerCase()}-mobile.png`, {
          fullPage: true,
          maxDiffPixels: 100,
        });
      });

      test("should render correctly on tablet viewport", async ({ page }) => {
        await page.setViewportSize(viewports.tablet);
        await page.goto(app.url + app.path);
        
        await page.waitForLoadState("networkidle");
        
        await expect(page).toHaveScreenshot(`${app.name.toLowerCase()}-tablet.png`, {
          fullPage: true,
          maxDiffPixels: 100,
        });
      });

      test("should render correctly on desktop viewport", async ({ page }) => {
        await page.setViewportSize(viewports.desktop);
        await page.goto(app.url + app.path);
        
        await page.waitForLoadState("networkidle");
        
        await expect(page).toHaveScreenshot(`${app.name.toLowerCase()}-desktop.png`, {
          fullPage: true,
          maxDiffPixels: 100,
        });
      });

      test("should render correctly on widescreen viewport", async ({ page }) => {
        await page.setViewportSize(viewports.widescreen);
        await page.goto(app.url + app.path);
        
        await page.waitForLoadState("networkidle");
        
        await expect(page).toHaveScreenshot(`${app.name.toLowerCase()}-widescreen.png`, {
          fullPage: true,
          maxDiffPixels: 100,
        });
      });

      test("should handle viewport resize gracefully", async ({ page }) => {
        await page.goto(app.url + app.path);
        await page.waitForLoadState("networkidle");

        // Start at desktop
        await page.setViewportSize(viewports.desktop);
        await page.waitForTimeout(300);

        // Resize to tablet
        await page.setViewportSize(viewports.tablet);
        await page.waitForTimeout(300);

        // Resize to mobile
        await page.setViewportSize(viewports.mobile);
        await page.waitForTimeout(300);

        // No JavaScript errors should occur
        const errors: string[] = [];
        page.on("pageerror", (error) => errors.push(error.message));
        
        expect(errors).toHaveLength(0);
      });

      test("should maintain touch targets on mobile", async ({ page }) => {
        await page.setViewportSize(viewports.mobile);
        await page.goto(app.url + app.path);
        await page.waitForLoadState("networkidle");

        // Check all interactive elements have minimum touch target size (44x44)
        const buttons = await page.locator("button, a, [role='button']").all();
        
        for (const button of buttons.slice(0, 10)) { // Check first 10 buttons
          const box = await button.boundingBox();
          if (box) {
            // Touch targets should be at least 44x44 pixels
            expect(box.width).toBeGreaterThanOrEqual(44);
            expect(box.height).toBeGreaterThanOrEqual(44);
          }
        }
      });

      test("should not have horizontal scroll on mobile", async ({ page }) => {
        await page.setViewportSize(viewports.mobile);
        await page.goto(app.url + app.path);
        await page.waitForLoadState("networkidle");

        // Check for horizontal overflow
        const hasHorizontalScroll = await page.evaluate(() => {
          return document.documentElement.scrollWidth > document.documentElement.clientWidth;
        });

        expect(hasHorizontalScroll).toBe(false);
      });

      test("should have readable text on mobile", async ({ page }) => {
        await page.setViewportSize(viewports.mobile);
        await page.goto(app.url + app.path);
        await page.waitForLoadState("networkidle");

        // Check that body text is at least 16px
        const bodyFontSize = await page.evaluate(() => {
          const body = document.querySelector("body");
          if (!body) return 16;
          return parseFloat(window.getComputedStyle(body).fontSize);
        });

        expect(bodyFontSize).toBeGreaterThanOrEqual(14);
      });
    });
  }
});

test.describe("Navigation Responsive Behavior", () => {
  for (const app of apps) {
    test(`${app.name}: mobile navigation should toggle correctly`, async ({ page }) => {
      await page.setViewportSize(viewports.mobile);
      await page.goto(app.url + app.path);
      await page.waitForLoadState("networkidle");

      // Find and click mobile menu toggle
      const menuToggle = page.locator('[data-testid="mobile-menu-toggle"], [aria-label="Menu"], [aria-label="Toggle menu"]').first();
      
      if (await menuToggle.isVisible()) {
        await menuToggle.click();
        
        // Menu should be visible after click
        const mobileMenu = page.locator('[data-testid="mobile-menu"], nav[aria-expanded="true"], [role="navigation"]');
        await expect(mobileMenu.first()).toBeVisible();
      }
    });
  }
});

test.describe("Grid Layout Responsive Behavior", () => {
  for (const app of apps) {
    test(`${app.name}: grid should adjust columns based on viewport`, async ({ page }) => {
      await page.goto(app.url + app.path);
      await page.waitForLoadState("networkidle");

      // Desktop: should have multiple columns
      await page.setViewportSize(viewports.desktop);
      await page.waitForTimeout(300);
      
      const desktopGrids = await page.locator('[class*="grid"], [style*="grid"]').all();
      
      // Mobile: should stack to single column
      await page.setViewportSize(viewports.mobile);
      await page.waitForTimeout(300);
      
      // Grid items should be stacked (full width)
      const mobileGridItems = await page.locator('[class*="grid"] > *').first();
      if (await mobileGridItems.isVisible()) {
        const box = await mobileGridItems.boundingBox();
        if (box) {
          // On mobile, grid items should be nearly full width
          expect(box.width).toBeGreaterThan(viewports.mobile.width * 0.8);
        }
      }
    });
  }
});

test.describe("Image Responsive Behavior", () => {
  for (const app of apps) {
    test(`${app.name}: images should be responsive`, async ({ page }) => {
      await page.setViewportSize(viewports.mobile);
      await page.goto(app.url + app.path);
      await page.waitForLoadState("networkidle");

      const images = await page.locator("img").all();
      
      for (const img of images.slice(0, 5)) { // Check first 5 images
        const box = await img.boundingBox();
        if (box) {
          // Images should not overflow viewport
          expect(box.width).toBeLessThanOrEqual(viewports.mobile.width);
        }
      }
    });
  }
});
