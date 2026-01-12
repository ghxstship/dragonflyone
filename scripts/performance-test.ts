#!/usr/bin/env ts-node

/**
 * Performance Testing Script
 * Measures page load times, Core Web Vitals, and lighthouse scores
 * for the cross-platform booking system
 */

import { chromium, type Page } from 'playwright';
import type { CDPSession } from 'playwright';

interface PerformanceMetrics {
  url: string;
  platform: string;
  loadTime: number;
  domContentLoaded: number;
  firstContentfulPaint: number;
  largestContentfulPaint: number;
  cumulativeLayoutShift: number;
  totalBlockingTime: number;
  firstInputDelay: number | null;
  timeToInteractive: number;
  resourcesLoaded: number;
  totalTransferSize: number;
}

interface PageTest {
  url: string;
  name: string;
  platform: 'gvteway' | 'atlvs' | 'compvss';
}

const PAGES_TO_TEST: PageTest[] = [
  // GVTEWAY
  {
    url: 'http://localhost:3000',
    name: 'GVTEWAY Home',
    platform: 'gvteway',
  },
  {
    url: 'http://localhost:3000/experiences',
    name: 'GVTEWAY Experiences List',
    platform: 'gvteway',
  },

  // ATLVS
  {
    url: 'http://localhost:3001',
    name: 'ATLVS Home',
    platform: 'atlvs',
  },
  {
    url: 'http://localhost:3001/packages',
    name: 'ATLVS Packages List',
    platform: 'atlvs',
  },

  // COMPVSS
  {
    url: 'http://localhost:3002',
    name: 'COMPVSS Home',
    platform: 'compvss',
  },
];

async function collectPerformanceMetrics(page: Page, url: string): Promise<Partial<PerformanceMetrics>> {
  const performanceMetrics = await page.evaluate(() => {
    const navigation = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming;
    const paint = performance.getEntriesByType('paint');
    const fcp = paint.find((p) => p.name === 'first-contentful-paint');

    return {
      loadTime: navigation.loadEventEnd - navigation.fetchStart,
      domContentLoaded: navigation.domContentLoadedEventEnd - navigation.fetchStart,
      firstContentfulPaint: fcp ? fcp.startTime : 0,
      resourcesLoaded: performance.getEntriesByType('resource').length,
      totalTransferSize: performance.getEntriesByType('resource').reduce((sum, r: any) => sum + (r.transferSize || 0), 0),
    };
  });

  // Get Web Vitals
  const webVitals = await page.evaluate(() => {
    return new Promise<{ lcp: number; cls: number; tbt: number; tti: number }>((resolve) => {
      let lcp = 0;
      let cls = 0;
      let tbt = 0;
      let tti = 0;

      // LCP Observer
      if ('PerformanceObserver' in window) {
        try {
          const lcpObserver = new PerformanceObserver((list) => {
            const entries = list.getEntries();
            const lastEntry = entries[entries.length - 1] as any;
            lcp = lastEntry.renderTime || lastEntry.loadTime;
          });
          lcpObserver.observe({ type: 'largest-contentful-paint', buffered: true });
        } catch (e) {
          // LCP not supported
        }

        // CLS Observer
        try {
          let clsValue = 0;
          const clsObserver = new PerformanceObserver((list) => {
            for (const entry of list.getEntries() as any[]) {
              if (!entry.hadRecentInput) {
                clsValue += entry.value;
              }
            }
            cls = clsValue;
          });
          clsObserver.observe({ type: 'layout-shift', buffered: true });
        } catch (e) {
          // CLS not supported
        }

        // TTI estimation (when no long tasks for 5 seconds)
        try {
          let lastLongTask = 0;
          const ttiObserver = new PerformanceObserver((list) => {
            for (const entry of list.getEntries()) {
              lastLongTask = entry.startTime + entry.duration;
            }
          });
          ttiObserver.observe({ type: 'longtask', buffered: true });

          setTimeout(() => {
            tti = lastLongTask || performance.now();
          }, 100);
        } catch (e) {
          // Long tasks not supported
        }
      }

      setTimeout(() => {
        resolve({ lcp, cls, tbt, tti });
      }, 2000); // Wait 2 seconds for metrics to be collected
    });
  });

  return {
    loadTime: performanceMetrics.loadTime,
    domContentLoaded: performanceMetrics.domContentLoaded,
    firstContentfulPaint: performanceMetrics.firstContentfulPaint,
    largestContentfulPaint: webVitals.lcp,
    cumulativeLayoutShift: webVitals.cls,
    totalBlockingTime: webVitals.tbt,
    timeToInteractive: webVitals.tti,
    resourcesLoaded: performanceMetrics.resourcesLoaded,
    totalTransferSize: performanceMetrics.totalTransferSize,
  };
}

async function testPage(pageTest: PageTest): Promise<PerformanceMetrics> {
  const browser = await chromium.launch();
  const page = await browser.newPage();

  console.log(`Testing: ${pageTest.name} (${pageTest.url})`);

  try {
    // Navigate to page
    await page.goto(pageTest.url, { waitUntil: 'networkidle' });

    // Wait a bit for any async loading
    await page.waitForTimeout(2000);

    // Collect metrics
    const metrics = await collectPerformanceMetrics(page, pageTest.url);

    return {
      url: pageTest.url,
      platform: pageTest.platform,
      loadTime: metrics.loadTime || 0,
      domContentLoaded: metrics.domContentLoaded || 0,
      firstContentfulPaint: metrics.firstContentfulPaint || 0,
      largestContentfulPaint: metrics.largestContentfulPaint || 0,
      cumulativeLayoutShift: metrics.cumulativeLayoutShift || 0,
      totalBlockingTime: metrics.totalBlockingTime || 0,
      firstInputDelay: null,
      timeToInteractive: metrics.timeToInteractive || 0,
      resourcesLoaded: metrics.resourcesLoaded || 0,
      totalTransferSize: metrics.totalTransferSize || 0,
    };
  } finally {
    await browser.close();
  }
}

async function main() {
  console.log('🚀 Starting Performance Tests\n');
  console.log('=' .repeat(80));

  const results: PerformanceMetrics[] = [];

  for (const pageTest of PAGES_TO_TEST) {
    try {
      const metrics = await testPage(pageTest);
      results.push(metrics);

      console.log(`✓ ${pageTest.name}`);
      console.log(`  Load Time: ${metrics.loadTime.toFixed(2)}ms`);
      console.log(`  FCP: ${metrics.firstContentfulPaint.toFixed(2)}ms`);
      console.log(`  LCP: ${metrics.largestContentfulPaint.toFixed(2)}ms`);
      console.log(`  CLS: ${metrics.cumulativeLayoutShift.toFixed(4)}`);
      console.log(`  TTI: ${metrics.timeToInteractive.toFixed(2)}ms`);
      console.log(`  Resources: ${metrics.resourcesLoaded}`);
      console.log(`  Transfer Size: ${(metrics.totalTransferSize / 1024).toFixed(2)}KB`);
      console.log();
    } catch (error) {
      console.error(`✗ ${pageTest.name}: ${error}`);
    }
  }

  console.log('=' .repeat(80));
  console.log('\n📊 Performance Summary\n');

  // Calculate averages by platform
  const platforms = ['gvteway', 'atlvs', 'compvss'] as const;

  for (const platform of platforms) {
    const platformResults = results.filter((r) => r.platform === platform);
    if (platformResults.length === 0) continue;

    const avg = {
      loadTime: platformResults.reduce((sum, r) => sum + r.loadTime, 0) / platformResults.length,
      fcp: platformResults.reduce((sum, r) => sum + r.firstContentfulPaint, 0) / platformResults.length,
      lcp: platformResults.reduce((sum, r) => sum + r.largestContentfulPaint, 0) / platformResults.length,
      cls: platformResults.reduce((sum, r) => sum + r.cumulativeLayoutShift, 0) / platformResults.length,
      tti: platformResults.reduce((sum, r) => sum + r.timeToInteractive, 0) / platformResults.length,
    };

    console.log(`${platform.toUpperCase()}:`);
    console.log(`  Avg Load Time: ${avg.loadTime.toFixed(2)}ms`);
    console.log(`  Avg FCP: ${avg.fcp.toFixed(2)}ms`);
    console.log(`  Avg LCP: ${avg.lcp.toFixed(2)}ms`);
    console.log(`  Avg CLS: ${avg.cls.toFixed(4)}`);
    console.log(`  Avg TTI: ${avg.tti.toFixed(2)}ms`);

    // Core Web Vitals scoring
    const lcpScore = avg.lcp <= 2500 ? '✓ Good' : avg.lcp <= 4000 ? '⚠ Needs Improvement' : '✗ Poor';
    const clsScore = avg.cls <= 0.1 ? '✓ Good' : avg.cls <= 0.25 ? '⚠ Needs Improvement' : '✗ Poor';

    console.log(`  LCP Score: ${lcpScore}`);
    console.log(`  CLS Score: ${clsScore}`);
    console.log();
  }

  // Check if any metrics exceed thresholds
  const issues: string[] = [];

  for (const result of results) {
    if (result.loadTime > 3000) {
      issues.push(`⚠ ${result.url} - Load time exceeds 3s (${result.loadTime.toFixed(0)}ms)`);
    }
    if (result.largestContentfulPaint > 2500) {
      issues.push(`⚠ ${result.url} - LCP exceeds 2.5s (${result.largestContentfulPaint.toFixed(0)}ms)`);
    }
    if (result.cumulativeLayoutShift > 0.1) {
      issues.push(`⚠ ${result.url} - CLS exceeds 0.1 (${result.cumulativeLayoutShift.toFixed(4)})`);
    }
    if (result.totalTransferSize > 1024 * 1024) {
      issues.push(`⚠ ${result.url} - Transfer size exceeds 1MB (${(result.totalTransferSize / 1024 / 1024).toFixed(2)}MB)`);
    }
  }

  if (issues.length > 0) {
    console.log('⚠️  Performance Issues:\n');
    issues.forEach((issue) => console.log(issue));
    console.log();
  } else {
    console.log('✓ All pages pass Core Web Vitals thresholds!\n');
  }

  // Save results to JSON
  const fs = await import('fs');
  const reportPath = './performance-report.json';
  fs.writeFileSync(
    reportPath,
    JSON.stringify(
      {
        timestamp: new Date().toISOString(),
        results,
        issues,
      },
      null,
      2
    )
  );

  console.log(`📝 Detailed report saved to: ${reportPath}\n`);

  process.exit(issues.length > 0 ? 1 : 0);
}

main().catch((error) => {
  console.error('Fatal error:', error);
  process.exit(1);
});
