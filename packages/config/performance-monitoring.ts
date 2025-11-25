/**
 * Performance Monitoring Utilities
 * Real-time performance tracking, Core Web Vitals, and optimization tools
 */

export interface WebVitalsMetric {
  name: 'CLS' | 'FID' | 'FCP' | 'LCP' | 'TTFB' | 'INP';
  value: number;
  rating: 'good' | 'needs-improvement' | 'poor';
  delta: number;
  id: string;
  navigationType: 'navigate' | 'reload' | 'back-forward' | 'prerender';
}

export interface PerformanceReport {
  url: string;
  timestamp: string;
  metrics: WebVitalsMetric[];
  resources: PerformanceResourceTiming[];
  navigation: PerformanceNavigationTiming | null;
  memory?: any;
}

/**
 * Core Web Vitals Tracker
 */
export class WebVitalsTracker {
  private metrics: Map<string, WebVitalsMetric> = new Map();
  private reportCallback?: (metric: WebVitalsMetric) => void;

  constructor(onReport?: (metric: WebVitalsMetric) => void) {
    this.reportCallback = onReport;
    this.initTracking();
  }

  /**
   * Initialize web vitals tracking
   */
  private initTracking() {
    if (typeof window === 'undefined') return;

    // Track CLS (Cumulative Layout Shift)
    this.trackCLS();

    // Track FID/INP (First Input Delay / Interaction to Next Paint)
    this.trackFID();

    // Track LCP (Largest Contentful Paint)
    this.trackLCP();

    // Track FCP (First Contentful Paint)
    this.trackFCP();

    // Track TTFB (Time to First Byte)
    this.trackTTFB();
  }

  /**
   * Track Cumulative Layout Shift (CLS)
   * Good: < 0.1, Needs Improvement: < 0.25, Poor: >= 0.25
   */
  private trackCLS() {
    if (!('PerformanceObserver' in window)) return;

    let clsValue = 0;
    let clsEntries: PerformanceEntry[] = [];

    const observer = new PerformanceObserver((entryList) => {
      for (const entry of entryList.getEntries()) {
        if (!(entry as any).hadRecentInput) {
          clsValue += (entry as any).value;
          clsEntries.push(entry);
        }
      }
    });

    observer.observe({ type: 'layout-shift', buffered: true });

    // Report final CLS value on page hide
    window.addEventListener('visibilitychange', () => {
      if (document.visibilityState === 'hidden') {
        this.reportMetric({
          name: 'CLS',
          value: clsValue,
          rating: this.getCLSRating(clsValue),
          delta: clsValue,
          id: this.generateId(),
          navigationType: this.getNavigationType(),
        });
      }
    });
  }

  /**
   * Track First Input Delay (FID) / Interaction to Next Paint (INP)
   * Good FID: < 100ms, Needs Improvement: < 300ms, Poor: >= 300ms
   */
  private trackFID() {
    if (!('PerformanceObserver' in window)) return;

    const observer = new PerformanceObserver((entryList) => {
      const firstInput = entryList.getEntries()[0] as PerformanceEventTiming;
      const processingTime = firstInput.processingStart - firstInput.startTime;

      this.reportMetric({
        name: 'FID',
        value: processingTime,
        rating: this.getFIDRating(processingTime),
        delta: processingTime,
        id: this.generateId(),
        navigationType: this.getNavigationType(),
      });
    });

    observer.observe({ type: 'first-input', buffered: true });
  }

  /**
   * Track Largest Contentful Paint (LCP)
   * Good: < 2.5s, Needs Improvement: < 4s, Poor: >= 4s
   */
  private trackLCP() {
    if (!('PerformanceObserver' in window)) return;

    const observer = new PerformanceObserver((entryList) => {
      const entries = entryList.getEntries();
      const lastEntry = entries[entries.length - 1] as PerformancePaintTiming;

      this.reportMetric({
        name: 'LCP',
        value: lastEntry.startTime,
        rating: this.getLCPRating(lastEntry.startTime),
        delta: lastEntry.startTime,
        id: this.generateId(),
        navigationType: this.getNavigationType(),
      });
    });

    observer.observe({ type: 'largest-contentful-paint', buffered: true });
  }

  /**
   * Track First Contentful Paint (FCP)
   * Good: < 1.8s, Needs Improvement: < 3s, Poor: >= 3s
   */
  private trackFCP() {
    if (!('PerformanceObserver' in window)) return;

    const observer = new PerformanceObserver((entryList) => {
      for (const entry of entryList.getEntriesByName('first-contentful-paint')) {
        this.reportMetric({
          name: 'FCP',
          value: entry.startTime,
          rating: this.getFCPRating(entry.startTime),
          delta: entry.startTime,
          id: this.generateId(),
          navigationType: this.getNavigationType(),
        });
      }
    });

    observer.observe({ type: 'paint', buffered: true });
  }

  /**
   * Track Time to First Byte (TTFB)
   * Good: < 800ms, Needs Improvement: < 1800ms, Poor: >= 1800ms
   */
  private trackTTFB() {
    if (typeof window === 'undefined' || !window.performance) return;

    window.addEventListener('load', () => {
      const navEntry = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming;
      if (navEntry) {
        const ttfb = navEntry.responseStart - navEntry.requestStart;
        this.reportMetric({
          name: 'TTFB',
          value: ttfb,
          rating: this.getTTFBRating(ttfb),
          delta: ttfb,
          id: this.generateId(),
          navigationType: this.getNavigationType(),
        });
      }
    });
  }

  /**
   * Report metric
   */
  private reportMetric(metric: WebVitalsMetric) {
    this.metrics.set(metric.name, metric);
    if (this.reportCallback) {
      this.reportCallback(metric);
    }
  }

  /**
   * Get all tracked metrics
   */
  getMetrics(): WebVitalsMetric[] {
    return Array.from(this.metrics.values());
  }

  /**
   * Rating helpers
   */
  private getCLSRating(value: number): 'good' | 'needs-improvement' | 'poor' {
    if (value < 0.1) return 'good';
    if (value < 0.25) return 'needs-improvement';
    return 'poor';
  }

  private getFIDRating(value: number): 'good' | 'needs-improvement' | 'poor' {
    if (value < 100) return 'good';
    if (value < 300) return 'needs-improvement';
    return 'poor';
  }

  private getLCPRating(value: number): 'good' | 'needs-improvement' | 'poor' {
    if (value < 2500) return 'good';
    if (value < 4000) return 'needs-improvement';
    return 'poor';
  }

  private getFCPRating(value: number): 'good' | 'needs-improvement' | 'poor' {
    if (value < 1800) return 'good';
    if (value < 3000) return 'needs-improvement';
    return 'poor';
  }

  private getTTFBRating(value: number): 'good' | 'needs-improvement' | 'poor' {
    if (value < 800) return 'good';
    if (value < 1800) return 'needs-improvement';
    return 'poor';
  }

  private generateId(): string {
    return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }

  private getNavigationType(): 'navigate' | 'reload' | 'back-forward' | 'prerender' {
    if (typeof window === 'undefined') return 'navigate';
    const navEntry = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming;
    return (navEntry?.type as any) || 'navigate';
  }
}

/**
 * Performance Budget Monitor
 */
export class PerformanceBudgetMonitor {
  private budgets: Map<string, number> = new Map();

  constructor(budgets?: Record<string, number>) {
    if (budgets) {
      Object.entries(budgets).forEach(([key, value]) => {
        this.budgets.set(key, value);
      });
    } else {
      // Default budgets
      this.setDefaultBudgets();
    }
  }

  private setDefaultBudgets() {
    this.budgets.set('LCP', 2500); // 2.5s
    this.budgets.set('FID', 100); // 100ms
    this.budgets.set('CLS', 0.1);
    this.budgets.set('FCP', 1800); // 1.8s
    this.budgets.set('TTFB', 800); // 800ms
    this.budgets.set('totalBundleSize', 300000); // 300KB
    this.budgets.set('imageBudget', 500000); // 500KB
  }

  /**
   * Check if metric is within budget
   */
  isWithinBudget(metricName: string, value: number): boolean {
    const budget = this.budgets.get(metricName);
    return budget ? value <= budget : true;
  }

  /**
   * Get budget violations
   */
  getViolations(metrics: WebVitalsMetric[]): Array<{
    metric: string;
    value: number;
    budget: number;
    overage: number;
  }> {
    const violations: Array<{
      metric: string;
      value: number;
      budget: number;
      overage: number;
    }> = [];

    metrics.forEach((metric) => {
      const budget = this.budgets.get(metric.name);
      if (budget && metric.value > budget) {
        violations.push({
          metric: metric.name,
          value: metric.value,
          budget,
          overage: metric.value - budget,
        });
      }
    });

    return violations;
  }

  /**
   * Set custom budget
   */
  setBudget(metric: string, value: number) {
    this.budgets.set(metric, value);
  }
}

/**
 * Resource Timing Analyzer
 */
export class ResourceTimingAnalyzer {
  /**
   * Get all resource timings
   */
  getResourceTimings(): PerformanceResourceTiming[] {
    if (typeof window === 'undefined') return [];
    return performance.getEntriesByType('resource') as PerformanceResourceTiming[];
  }

  /**
   * Analyze resources by type
   */
  analyzeByType(): Record<string, { count: number; totalSize: number; avgDuration: number }> {
    const resources = this.getResourceTimings();
    const byType: Record<string, { count: number; totalSize: number; totalDuration: number }> = {};

    resources.forEach((resource) => {
      const type = this.getResourceType(resource.name);
      if (!byType[type]) {
        byType[type] = { count: 0, totalSize: 0, totalDuration: 0 };
      }
      byType[type].count++;
      byType[type].totalSize += resource.transferSize || 0;
      byType[type].totalDuration += resource.duration;
    });

    // Calculate averages
    return Object.entries(byType).reduce((acc, [type, data]) => {
      acc[type] = {
        count: data.count,
        totalSize: data.totalSize,
        avgDuration: data.totalDuration / data.count,
      };
      return acc;
    }, {} as Record<string, { count: number; totalSize: number; avgDuration: number }>);
  }

  /**
   * Find slow resources
   */
  findSlowResources(thresholdMs: number = 1000): PerformanceResourceTiming[] {
    return this.getResourceTimings().filter((resource) => resource.duration > thresholdMs);
  }

  /**
   * Find large resources
   */
  findLargeResources(thresholdBytes: number = 100000): PerformanceResourceTiming[] {
    return this.getResourceTimings().filter(
      (resource) => (resource.transferSize || 0) > thresholdBytes
    );
  }

  private getResourceType(url: string): string {
    const extension = url.split('.').pop()?.split('?')[0];
    const typeMap: Record<string, string> = {
      js: 'script',
      css: 'stylesheet',
      jpg: 'image',
      jpeg: 'image',
      png: 'image',
      gif: 'image',
      svg: 'image',
      webp: 'image',
      woff: 'font',
      woff2: 'font',
      ttf: 'font',
      otf: 'font',
    };
    return typeMap[extension || ''] || 'other';
  }
}

/**
 * Memory Monitor
 */
export class MemoryMonitor {
  /**
   * Get memory usage
   */
  getMemoryUsage(): any | null {
    if (typeof window === 'undefined' || !(performance as any).memory) return null;
    return {
      usedJSHeapSize: (performance as any).memory.usedJSHeapSize,
      totalJSHeapSize: (performance as any).memory.totalJSHeapSize,
      jsHeapSizeLimit: (performance as any).memory.jsHeapSizeLimit,
      usagePercentage:
        ((performance as any).memory.usedJSHeapSize / (performance as any).memory.jsHeapSizeLimit) *
        100,
    };
  }

  /**
   * Monitor memory leaks
   */
  startLeakDetection(intervalMs: number = 5000): () => void {
    const samples: number[] = [];
    let increasing = 0;

    const interval = setInterval(() => {
      const usage = this.getMemoryUsage();
      if (usage) {
        samples.push(usage.usedJSHeapSize);

        // Keep only last 10 samples
        if (samples.length > 10) samples.shift();

        // Check if memory is consistently increasing
        if (samples.length >= 5) {
          const isIncreasing = samples.every((val, idx, arr) => idx === 0 || val > arr[idx - 1]);
          if (isIncreasing) {
            increasing++;
            if (increasing >= 3) {
              console.warn('Potential memory leak detected');
            }
          } else {
            increasing = 0;
          }
        }
      }
    }, intervalMs);

    return () => clearInterval(interval);
  }
}

/**
 * Export utilities
 */
export const performanceMonitoring = {
  createWebVitalsTracker: (onReport?: (metric: WebVitalsMetric) => void) =>
    new WebVitalsTracker(onReport),
  createBudgetMonitor: (budgets?: Record<string, number>) => new PerformanceBudgetMonitor(budgets),
  createResourceAnalyzer: () => new ResourceTimingAnalyzer(),
  createMemoryMonitor: () => new MemoryMonitor(),
};

export default performanceMonitoring;
