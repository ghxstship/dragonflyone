import { describe, it, expect, vi, beforeEach } from 'vitest';
import {
  performanceMonitor,
  measurePerformance,
  measureAsyncPerformance,
} from '../monitoring';

// Mock the logger
vi.mock('../logger', () => ({
  logger: {
    debug: vi.fn(),
    info: vi.fn(),
    warn: vi.fn(),
    error: vi.fn(),
    performance: vi.fn(),
  },
}));

describe('monitoring', () => {
  beforeEach(() => {
    performanceMonitor.clearMetrics();
    vi.clearAllMocks();
  });

  describe('performanceMonitor', () => {
    describe('recordMetric', () => {
      it('should record a metric', () => {
        performanceMonitor.recordMetric({
          name: 'test_metric',
          value: 100,
          unit: 'ms',
        });

        const metrics = performanceMonitor.getMetrics();
        expect(metrics).toHaveLength(1);
        expect(metrics[0].name).toBe('test_metric');
        expect(metrics[0].value).toBe(100);
        expect(metrics[0].unit).toBe('ms');
      });

      it('should add timestamp to metric', () => {
        const before = Date.now();
        performanceMonitor.recordMetric({
          name: 'test',
          value: 50,
          unit: 'ms',
        });
        const after = Date.now();

        const metrics = performanceMonitor.getMetrics();
        expect(metrics[0].timestamp).toBeGreaterThanOrEqual(before);
        expect(metrics[0].timestamp).toBeLessThanOrEqual(after);
      });

      it('should include tags', () => {
        performanceMonitor.recordMetric({
          name: 'test',
          value: 50,
          unit: 'ms',
          tags: { component: 'Button', action: 'click' },
        });

        const metrics = performanceMonitor.getMetrics();
        expect(metrics[0].tags).toEqual({ component: 'Button', action: 'click' });
      });

      it('should support different units', () => {
        performanceMonitor.recordMetric({ name: 'time', value: 100, unit: 'ms' });
        performanceMonitor.recordMetric({ name: 'size', value: 1024, unit: 'bytes' });
        performanceMonitor.recordMetric({ name: 'requests', value: 5, unit: 'count' });

        const metrics = performanceMonitor.getMetrics();
        expect(metrics[0].unit).toBe('ms');
        expect(metrics[1].unit).toBe('bytes');
        expect(metrics[2].unit).toBe('count');
      });
    });

    describe('getMetrics', () => {
      it('should return all metrics when no name provided', () => {
        performanceMonitor.recordMetric({ name: 'metric1', value: 10, unit: 'ms' });
        performanceMonitor.recordMetric({ name: 'metric2', value: 20, unit: 'ms' });

        const metrics = performanceMonitor.getMetrics();
        expect(metrics).toHaveLength(2);
      });

      it('should filter by name when provided', () => {
        performanceMonitor.recordMetric({ name: 'metric1', value: 10, unit: 'ms' });
        performanceMonitor.recordMetric({ name: 'metric2', value: 20, unit: 'ms' });
        performanceMonitor.recordMetric({ name: 'metric1', value: 30, unit: 'ms' });

        const metrics = performanceMonitor.getMetrics('metric1');
        expect(metrics).toHaveLength(2);
        expect(metrics.every(m => m.name === 'metric1')).toBe(true);
      });

      it('should return empty array for non-existent name', () => {
        performanceMonitor.recordMetric({ name: 'metric1', value: 10, unit: 'ms' });

        const metrics = performanceMonitor.getMetrics('nonexistent');
        expect(metrics).toHaveLength(0);
      });
    });

    describe('getAverageMetric', () => {
      it('should calculate average for metric', () => {
        performanceMonitor.recordMetric({ name: 'test', value: 10, unit: 'ms' });
        performanceMonitor.recordMetric({ name: 'test', value: 20, unit: 'ms' });
        performanceMonitor.recordMetric({ name: 'test', value: 30, unit: 'ms' });

        const average = performanceMonitor.getAverageMetric('test');
        expect(average).toBe(20);
      });

      it('should return null for non-existent metric', () => {
        const average = performanceMonitor.getAverageMetric('nonexistent');
        expect(average).toBeNull();
      });

      it('should return single value when only one metric', () => {
        performanceMonitor.recordMetric({ name: 'single', value: 42, unit: 'ms' });

        const average = performanceMonitor.getAverageMetric('single');
        expect(average).toBe(42);
      });
    });

    describe('clearMetrics', () => {
      it('should clear all metrics', () => {
        performanceMonitor.recordMetric({ name: 'test1', value: 10, unit: 'ms' });
        performanceMonitor.recordMetric({ name: 'test2', value: 20, unit: 'ms' });

        performanceMonitor.clearMetrics();

        const metrics = performanceMonitor.getMetrics();
        expect(metrics).toHaveLength(0);
      });
    });
  });

  describe('measurePerformance', () => {
    it('should measure sync function execution time', () => {
      const result = measurePerformance('test_fn', () => {
        return 'result';
      });

      expect(result).toBe('result');
      const metrics = performanceMonitor.getMetrics('test_fn');
      expect(metrics).toHaveLength(1);
      expect(metrics[0].unit).toBe('ms');
    });

    it('should include tags in metric', () => {
      measurePerformance('tagged_fn', () => 'result', { component: 'Test' });

      const metrics = performanceMonitor.getMetrics('tagged_fn');
      expect(metrics[0].tags).toEqual({ component: 'Test' });
    });

    it('should record error metric on failure', () => {
      expect(() => {
        measurePerformance('failing_fn', () => {
          throw new Error('Test error');
        });
      }).toThrow('Test error');

      const metrics = performanceMonitor.getMetrics('failing_fn_error');
      expect(metrics).toHaveLength(1);
      expect(metrics[0].tags?.error).toBe('true');
    });
  });

  describe('measureAsyncPerformance', () => {
    it('should measure async function execution time', async () => {
      const result = await measureAsyncPerformance('async_fn', async () => {
        return 'async result';
      });

      expect(result).toBe('async result');
      const metrics = performanceMonitor.getMetrics('async_fn');
      expect(metrics).toHaveLength(1);
    });

    it('should include tags in async metric', async () => {
      await measureAsyncPerformance('tagged_async', async () => 'result', { type: 'api' });

      const metrics = performanceMonitor.getMetrics('tagged_async');
      expect(metrics[0].tags).toEqual({ type: 'api' });
    });

    it('should record error metric on async failure', async () => {
      await expect(
        measureAsyncPerformance('failing_async', async () => {
          throw new Error('Async error');
        })
      ).rejects.toThrow('Async error');

      const metrics = performanceMonitor.getMetrics('failing_async_error');
      expect(metrics).toHaveLength(1);
      expect(metrics[0].tags?.error).toBe('true');
    });

    it('should measure actual async delay', async () => {
      await measureAsyncPerformance('delayed_fn', async () => {
        await new Promise(resolve => setTimeout(resolve, 15));
        return 'done';
      });

      const metrics = performanceMonitor.getMetrics('delayed_fn');
      expect(metrics[0].value).toBeGreaterThanOrEqual(10);
    });
  });
});
