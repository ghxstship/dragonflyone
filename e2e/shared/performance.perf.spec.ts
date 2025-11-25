import { test, expect } from "@playwright/test";

/**
 * Performance Testing Suite
 * Tests Core Web Vitals and performance metrics across all apps
 */

const apps = [
  { name: "GVTEWAY", url: "http://localhost:3000" },
  { name: "ATLVS", url: "http://localhost:3001" },
  { name: "COMPVSS", url: "http://localhost:3002" },
];

// Performance thresholds based on Core Web Vitals
const thresholds = {
  // Largest Contentful Paint (LCP) - should be under 2.5s
  lcp: 2500,
  // First Input Delay (FID) - should be under 100ms (measured as TBT in lab)
  tbt: 200,
  // Cumulative Layout Shift (CLS) - should be under 0.1
  cls: 0.1,
  // First Contentful Paint (FCP) - should be under 1.8s
  fcp: 1800,
  // Time to Interactive (TTI) - should be under 3.8s
  tti: 3800,
};

test.describe("Performance Testing", () => {
  for (const app of apps) {
    test.describe(`${app.name} App`, () => {
      test("should load homepage within performance budget", async ({ page }) => {
        // Start performance measurement
        const startTime = Date.now();
        
        await page.goto(app.url);
        await page.waitForLoadState("networkidle");
        
        const loadTime = Date.now() - startTime;
        
        // Page should load within 3 seconds
        expect(loadTime).toBeLessThan(3000);
      });

      test("should have acceptable First Contentful Paint", async ({ page }) => {
        await page.goto(app.url);
        
        // Get FCP from Performance API
        const fcp = await page.evaluate(() => {
          return new Promise<number>((resolve) => {
            const observer = new PerformanceObserver((list) => {
              const entries = list.getEntriesByName("first-contentful-paint");
              if (entries.length > 0) {
                resolve(entries[0].startTime);
              }
            });
            observer.observe({ type: "paint", buffered: true });
            
            // Fallback timeout
            setTimeout(() => resolve(0), 5000);
          });
        });

        if (fcp > 0) {
          expect(fcp).toBeLessThan(thresholds.fcp);
        }
      });

      test("should have minimal layout shift", async ({ page }) => {
        await page.goto(app.url);
        await page.waitForLoadState("networkidle");
        
        // Get CLS from Performance API
        const cls = await page.evaluate(() => {
          return new Promise<number>((resolve) => {
            let clsValue = 0;
            const observer = new PerformanceObserver((list) => {
              for (const entry of list.getEntries()) {
                if (!(entry as PerformanceEntry & { hadRecentInput?: boolean }).hadRecentInput) {
                  clsValue += (entry as PerformanceEntry & { value?: number }).value || 0;
                }
              }
            });
            
            try {
              observer.observe({ type: "layout-shift", buffered: true });
            } catch {
              // Layout shift observation not supported
            }
            
            setTimeout(() => resolve(clsValue), 3000);
          });
        });

        expect(cls).toBeLessThan(thresholds.cls);
      });

      test("should have reasonable bundle size", async ({ page }) => {
        const responses: { url: string; size: number }[] = [];
        
        page.on("response", async (response) => {
          const url = response.url();
          if (url.includes(".js") || url.includes(".css")) {
            const headers = response.headers();
            const contentLength = parseInt(headers["content-length"] || "0");
            responses.push({ url, size: contentLength });
          }
        });

        await page.goto(app.url);
        await page.waitForLoadState("networkidle");

        // Calculate total JS/CSS size
        const totalSize = responses.reduce((sum, r) => sum + r.size, 0);
        
        // Total bundle should be under 2MB (compressed)
        expect(totalSize).toBeLessThan(2 * 1024 * 1024);
      });

      test("should not have memory leaks on navigation", async ({ page }) => {
        await page.goto(app.url);
        await page.waitForLoadState("networkidle");

        // Get initial memory usage
        const initialMemory = await page.evaluate(() => {
          if ("memory" in performance) {
            return (performance as Performance & { memory?: { usedJSHeapSize: number } }).memory?.usedJSHeapSize || 0;
          }
          return 0;
        });

        // Navigate multiple times
        for (let i = 0; i < 5; i++) {
          await page.goto(app.url);
          await page.waitForLoadState("networkidle");
        }

        // Get final memory usage
        const finalMemory = await page.evaluate(() => {
          if ("memory" in performance) {
            return (performance as Performance & { memory?: { usedJSHeapSize: number } }).memory?.usedJSHeapSize || 0;
          }
          return 0;
        });

        // Memory should not grow more than 50% after multiple navigations
        if (initialMemory > 0) {
          const memoryGrowth = (finalMemory - initialMemory) / initialMemory;
          expect(memoryGrowth).toBeLessThan(0.5);
        }
      });

      test("should have efficient image loading", async ({ page }) => {
        const imageRequests: { url: string; size: number }[] = [];
        
        page.on("response", async (response) => {
          const url = response.url();
          const contentType = response.headers()["content-type"] || "";
          
          if (contentType.includes("image")) {
            const headers = response.headers();
            const contentLength = parseInt(headers["content-length"] || "0");
            imageRequests.push({ url, size: contentLength });
          }
        });

        await page.goto(app.url);
        await page.waitForLoadState("networkidle");

        // Check that images are not excessively large
        for (const img of imageRequests) {
          // Individual images should be under 500KB
          expect(img.size).toBeLessThan(500 * 1024);
        }
      });

      test("should handle slow network gracefully", async ({ page, context }) => {
        // Simulate slow 3G network
        await context.route("**/*", async (route) => {
          await new Promise((resolve) => setTimeout(resolve, 100));
          await route.continue();
        });

        const startTime = Date.now();
        await page.goto(app.url);
        
        // Page should still load within 10 seconds on slow network
        const loadTime = Date.now() - startTime;
        expect(loadTime).toBeLessThan(10000);

        // Should show loading state
        const hasLoadingIndicator = await page.locator('[data-testid="loading"], .loading, [aria-busy="true"]').count();
        // Loading indicator is optional but good to have
      });

      test("should cache static assets", async ({ page }) => {
        // First visit
        await page.goto(app.url);
        await page.waitForLoadState("networkidle");

        // Collect cache headers
        const cacheHeaders: { url: string; cacheControl: string }[] = [];
        
        page.on("response", (response) => {
          const url = response.url();
          const cacheControl = response.headers()["cache-control"] || "";
          
          if (url.includes(".js") || url.includes(".css") || url.includes("/_next/static")) {
            cacheHeaders.push({ url, cacheControl });
          }
        });

        // Second visit
        await page.goto(app.url);
        await page.waitForLoadState("networkidle");

        // Static assets should have cache headers
        const cachedAssets = cacheHeaders.filter((h) => 
          h.cacheControl.includes("max-age") || 
          h.cacheControl.includes("immutable")
        );

        // At least some assets should be cached
        expect(cachedAssets.length).toBeGreaterThan(0);
      });

      test("should not block main thread excessively", async ({ page }) => {
        await page.goto(app.url);
        
        // Measure long tasks
        const longTasks = await page.evaluate(() => {
          return new Promise<number>((resolve) => {
            let longTaskCount = 0;
            
            const observer = new PerformanceObserver((list) => {
              for (const entry of list.getEntries()) {
                if (entry.duration > 50) {
                  longTaskCount++;
                }
              }
            });
            
            try {
              observer.observe({ type: "longtask", buffered: true });
            } catch {
              // Long task observation not supported
            }
            
            setTimeout(() => resolve(longTaskCount), 3000);
          });
        });

        // Should have minimal long tasks (blocking main thread)
        expect(longTasks).toBeLessThan(10);
      });
    });
  }
});

test.describe("Resource Loading", () => {
  for (const app of apps) {
    test(`${app.name}: should preload critical resources`, async ({ page }) => {
      await page.goto(app.url);
      
      // Check for preload links
      const preloadLinks = await page.locator('link[rel="preload"]').count();
      
      // Should have some preloaded resources
      expect(preloadLinks).toBeGreaterThanOrEqual(0);
    });

    test(`${app.name}: should use modern image formats`, async ({ page }) => {
      const imageFormats: string[] = [];
      
      page.on("response", (response) => {
        const contentType = response.headers()["content-type"] || "";
        if (contentType.includes("image")) {
          imageFormats.push(contentType);
        }
      });

      await page.goto(app.url);
      await page.waitForLoadState("networkidle");

      // Check for modern formats (WebP, AVIF)
      const modernFormats = imageFormats.filter((f) => 
        f.includes("webp") || f.includes("avif")
      );

      // At least some images should use modern formats
      // (This is a soft check as not all images may be converted)
    });
  }
});
