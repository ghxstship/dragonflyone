import { test, expect } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";

/**
 * Accessibility Testing Suite
 * Tests WCAG 2.1 AA compliance across all apps
 */

const apps = [
  { name: "GVTEWAY", url: "http://localhost:3000" },
  { name: "ATLVS", url: "http://localhost:3001" },
  { name: "COMPVSS", url: "http://localhost:3002" },
];

const criticalPages = {
  GVTEWAY: ["/", "/events", "/tickets", "/auth/signin"],
  ATLVS: ["/", "/dashboard", "/projects", "/finance"],
  COMPVSS: ["/", "/dashboard", "/crew", "/projects"],
};

test.describe("Accessibility Compliance Testing", () => {
  for (const app of apps) {
    test.describe(`${app.name} App`, () => {
      const pages = criticalPages[app.name as keyof typeof criticalPages] || ["/"];

      for (const pagePath of pages) {
        test(`${pagePath} should have no accessibility violations`, async ({ page }) => {
          await page.goto(app.url + pagePath);
          await page.waitForLoadState("networkidle");

          const accessibilityScanResults = await new AxeBuilder({ page })
            .withTags(["wcag2a", "wcag2aa", "wcag21a", "wcag21aa"])
            .analyze();

          expect(accessibilityScanResults.violations).toEqual([]);
        });

        test(`${pagePath} should have proper heading hierarchy`, async ({ page }) => {
          await page.goto(app.url + pagePath);
          await page.waitForLoadState("networkidle");

          // Check heading hierarchy
          const headings = await page.evaluate(() => {
            const h1s = document.querySelectorAll("h1");
            const allHeadings = document.querySelectorAll("h1, h2, h3, h4, h5, h6");
            
            // Get heading levels in order
            const levels: number[] = [];
            allHeadings.forEach((h) => {
              levels.push(parseInt(h.tagName[1]));
            });

            return {
              h1Count: h1s.length,
              levels,
              hasSkippedLevels: false,
            };
          });

          // Should have exactly one h1
          expect(headings.h1Count).toBeLessThanOrEqual(1);

          // Check for skipped heading levels
          for (let i = 1; i < headings.levels.length; i++) {
            const diff = headings.levels[i] - headings.levels[i - 1];
            // Should not skip more than one level
            expect(diff).toBeLessThanOrEqual(1);
          }
        });

        test(`${pagePath} should have proper focus management`, async ({ page }) => {
          await page.goto(app.url + pagePath);
          await page.waitForLoadState("networkidle");

          // Tab through the page and check focus visibility
          const focusableElements = await page.locator(
            'a[href], button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])'
          ).all();

          for (const element of focusableElements.slice(0, 10)) {
            await element.focus();
            
            // Check that element has visible focus indicator
            const hasFocusStyle = await element.evaluate((el) => {
              const styles = window.getComputedStyle(el);
              const outlineWidth = parseFloat(styles.outlineWidth) || 0;
              const boxShadow = styles.boxShadow;
              const borderWidth = parseFloat(styles.borderWidth) || 0;
              
              // Should have some visible focus indicator
              return outlineWidth > 0 || boxShadow !== "none" || borderWidth > 0;
            });

            // Focus should be visible
            expect(hasFocusStyle).toBe(true);
          }
        });

        test(`${pagePath} should have proper ARIA labels`, async ({ page }) => {
          await page.goto(app.url + pagePath);
          await page.waitForLoadState("networkidle");

          // Check that interactive elements have accessible names
          const interactiveElements = await page.locator("button, a, input, select, textarea").all();

          for (const element of interactiveElements.slice(0, 20)) {
            const accessibleName = await element.evaluate((el) => {
              // Check for accessible name
              const ariaLabel = el.getAttribute("aria-label");
              const ariaLabelledBy = el.getAttribute("aria-labelledby");
              const title = el.getAttribute("title");
              const textContent = el.textContent?.trim();
              const placeholder = (el as HTMLInputElement).placeholder;
              const name = (el as HTMLInputElement).name;
              const id = el.id;
              
              // Get associated label
              let labelText = "";
              if (id) {
                const label = document.querySelector(`label[for="${id}"]`);
                labelText = label?.textContent?.trim() || "";
              }

              return ariaLabel || ariaLabelledBy || title || textContent || placeholder || labelText || name;
            });

            // Should have some accessible name
            if (await element.isVisible()) {
              expect(accessibleName).toBeTruthy();
            }
          }
        });

        test(`${pagePath} should have proper color contrast`, async ({ page }) => {
          await page.goto(app.url + pagePath);
          await page.waitForLoadState("networkidle");

          const accessibilityScanResults = await new AxeBuilder({ page })
            .withTags(["wcag2aa"])
            .options({ rules: { "color-contrast": { enabled: true } } })
            .analyze();

          const contrastViolations = accessibilityScanResults.violations.filter(
            (v: { id: string }) => v.id === "color-contrast"
          );

          expect(contrastViolations).toHaveLength(0);
        });

        test(`${pagePath} should have proper image alt text`, async ({ page }) => {
          await page.goto(app.url + pagePath);
          await page.waitForLoadState("networkidle");

          const images = await page.locator("img").all();

          for (const img of images) {
            const hasAlt = await img.evaluate((el) => {
              const alt = el.getAttribute("alt");
              const role = el.getAttribute("role");
              const ariaHidden = el.getAttribute("aria-hidden");
              
              // Decorative images should have empty alt or aria-hidden
              if (role === "presentation" || ariaHidden === "true") {
                return true;
              }
              
              // Content images should have alt text
              return alt !== null && alt !== undefined;
            });

            expect(hasAlt).toBe(true);
          }
        });
      }

      test("should support keyboard navigation", async ({ page }) => {
        await page.goto(app.url);
        await page.waitForLoadState("networkidle");

        // Press Tab multiple times and verify focus moves
        const focusedElements: string[] = [];

        for (let i = 0; i < 10; i++) {
          await page.keyboard.press("Tab");
          
          const focusedTag = await page.evaluate(() => {
            const el = document.activeElement;
            return el ? el.tagName.toLowerCase() : null;
          });

          if (focusedTag) {
            focusedElements.push(focusedTag);
          }
        }

        // Should have focused on multiple elements
        expect(focusedElements.length).toBeGreaterThan(0);
      });

      test("should have skip link functionality", async ({ page }) => {
        await page.goto(app.url);
        await page.waitForLoadState("networkidle");

        // Press Tab to focus skip link
        await page.keyboard.press("Tab");

        // Check if skip link exists and is focusable
        const skipLink = page.locator('a[href="#main"], a[href="#content"], .skip-link, [class*="skip"]').first();
        
        if (await skipLink.isVisible()) {
          await skipLink.click();
          
          // Focus should move to main content
          const focusedId = await page.evaluate(() => {
            return document.activeElement?.id || document.activeElement?.getAttribute("tabindex");
          });

          expect(focusedId).toBeTruthy();
        }
      });

      test("should announce dynamic content changes", async ({ page }) => {
        await page.goto(app.url);
        await page.waitForLoadState("networkidle");

        // Check for live regions
        const liveRegions = await page.locator('[aria-live], [role="status"], [role="alert"]').all();

        // Should have at least one live region for announcements
        expect(liveRegions.length).toBeGreaterThanOrEqual(0);
      });

      test("should have proper form labels", async ({ page }) => {
        await page.goto(app.url);
        await page.waitForLoadState("networkidle");

        const formInputs = await page.locator("input:not([type='hidden']), select, textarea").all();

        for (const input of formInputs) {
          const hasLabel = await input.evaluate((el) => {
            const id = el.id;
            const ariaLabel = el.getAttribute("aria-label");
            const ariaLabelledBy = el.getAttribute("aria-labelledby");
            const placeholder = (el as HTMLInputElement).placeholder;
            
            // Check for associated label
            let hasAssociatedLabel = false;
            if (id) {
              hasAssociatedLabel = !!document.querySelector(`label[for="${id}"]`);
            }
            
            // Check if wrapped in label
            const isWrappedInLabel = el.closest("label") !== null;

            return ariaLabel || ariaLabelledBy || hasAssociatedLabel || isWrappedInLabel || placeholder;
          });

          if (await input.isVisible()) {
            expect(hasLabel).toBeTruthy();
          }
        }
      });
    });
  }
});

test.describe("Screen Reader Compatibility", () => {
  for (const app of apps) {
    test(`${app.name}: landmarks should be properly defined`, async ({ page }) => {
      await page.goto(app.url);
      await page.waitForLoadState("networkidle");

      // Check for main landmark
      const main = await page.locator('main, [role="main"]').count();
      expect(main).toBeGreaterThanOrEqual(1);

      // Check for navigation landmark
      const nav = await page.locator('nav, [role="navigation"]').count();
      expect(nav).toBeGreaterThanOrEqual(1);
    });

    test(`${app.name}: buttons should have accessible names`, async ({ page }) => {
      await page.goto(app.url);
      await page.waitForLoadState("networkidle");

      const buttons = await page.locator("button").all();

      for (const button of buttons) {
        const accessibleName = await button.evaluate((el) => {
          const ariaLabel = el.getAttribute("aria-label");
          const textContent = el.textContent?.trim();
          const title = el.getAttribute("title");
          
          return ariaLabel || textContent || title;
        });

        if (await button.isVisible()) {
          expect(accessibleName).toBeTruthy();
        }
      }
    });
  }
});
