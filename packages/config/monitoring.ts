import { logger } from './logger';

interface PerformanceMetric {
  name: string;
  value: number;
  unit: 'ms' | 'bytes' | 'count';
  timestamp: number;
  tags?: Record<string, string>;
}

class PerformanceMonitor {
  private metrics: PerformanceMetric[] = [];
  private readonly maxMetrics = 1000;

  recordMetric(metric: Omit<PerformanceMetric, 'timestamp'>): void {
    this.metrics.push({
      ...metric,
      timestamp: Date.now(),
    });

    if (this.metrics.length > this.maxMetrics) {
      this.metrics.shift();
    }

    logger.debug('Performance metric recorded', { metric });
  }

  getMetrics(name?: string): PerformanceMetric[] {
    if (name) {
      return this.metrics.filter((m) => m.name === name);
    }
    return [...this.metrics];
  }

  getAverageMetric(name: string): number | null {
    const metrics = this.getMetrics(name);
    if (metrics.length === 0) return null;

    const sum = metrics.reduce((acc, m) => acc + m.value, 0);
    return sum / metrics.length;
  }

  clearMetrics(): void {
    this.metrics = [];
  }
}

export const performanceMonitor = new PerformanceMonitor();

export function measurePerformance<T>(
  name: string,
  fn: () => T,
  tags?: Record<string, string>
): T {
  const start = performance.now();
  try {
    const result = fn();
    const duration = performance.now() - start;
    
    performanceMonitor.recordMetric({
      name,
      value: duration,
      unit: 'ms',
      tags,
    });
    
    return result;
  } catch (error) {
    const duration = performance.now() - start;
    performanceMonitor.recordMetric({
      name: `${name}_error`,
      value: duration,
      unit: 'ms',
      tags: { ...tags, error: 'true' },
    });
    throw error;
  }
}

export async function measureAsyncPerformance<T>(
  name: string,
  fn: () => Promise<T>,
  tags?: Record<string, string>
): Promise<T> {
  const start = performance.now();
  try {
    const result = await fn();
    const duration = performance.now() - start;
    
    performanceMonitor.recordMetric({
      name,
      value: duration,
      unit: 'ms',
      tags,
    });
    
    return result;
  } catch (error) {
    const duration = performance.now() - start;
    performanceMonitor.recordMetric({
      name: `${name}_error`,
      value: duration,
      unit: 'ms',
      tags: { ...tags, error: 'true' },
    });
    throw error;
  }
}

export function trackPageLoad(): void {
  if (typeof window === 'undefined') return;

  window.addEventListener('load', () => {
    const perfData = window.performance.timing;
    const pageLoadTime = perfData.loadEventEnd - perfData.navigationStart;
    const domReadyTime = perfData.domContentLoadedEventEnd - perfData.navigationStart;
    const firstPaintTime = perfData.responseStart - perfData.navigationStart;

    performanceMonitor.recordMetric({
      name: 'page_load_time',
      value: pageLoadTime,
      unit: 'ms',
    });

    performanceMonitor.recordMetric({
      name: 'dom_ready_time',
      value: domReadyTime,
      unit: 'ms',
    });

    performanceMonitor.recordMetric({
      name: 'first_paint_time',
      value: firstPaintTime,
      unit: 'ms',
    });

    logger.performance('Page Load', pageLoadTime, {
      domReadyTime,
      firstPaintTime,
    });
  });
}

export function trackResourceTiming(): void {
  if (typeof window === 'undefined') return;

  window.addEventListener('load', () => {
    const resources = window.performance.getEntriesByType('resource');
    
    resources.forEach((resource: any) => {
      performanceMonitor.recordMetric({
        name: 'resource_load_time',
        value: resource.duration,
        unit: 'ms',
        tags: {
          resource: resource.name,
          type: resource.initiatorType,
        },
      });
    });
  });
}

export function getWebVitals(): void {
  if (typeof window === 'undefined') return;

  const observer = new PerformanceObserver((list) => {
    for (const entry of list.getEntries()) {
      const metricName = entry.entryType === 'paint' ? entry.name : entry.entryType;
      
      performanceMonitor.recordMetric({
        name: metricName,
        value: entry.startTime,
        unit: 'ms',
      });

      logger.debug('Web Vital', {
        metric: metricName,
        value: entry.startTime,
      });
    }
  });

  observer.observe({ entryTypes: ['paint', 'largest-contentful-paint'] });
}

export function initMonitoring(): void {
  if (typeof window !== 'undefined') {
    trackPageLoad();
    trackResourceTiming();
    getWebVitals();
  }
}
