import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { PerformanceMonitor, debounce, throttle } from '../performance.js';

describe('PerformanceMonitor', () => {
  beforeEach(() => {
    vi.stubGlobal('performance', {
      now: vi.fn().mockReturnValue(0),
    });
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  describe('mark', () => {
    it('stores a performance mark', () => {
      PerformanceMonitor.mark('test-mark');
      expect(performance.now).toHaveBeenCalled();
    });
  });

  describe('measure', () => {
    it('returns null if start mark does not exist', () => {
      const result = PerformanceMonitor.measure('test', 'nonexistent');
      expect(result).toBeNull();
    });

    it('calculates duration between marks', () => {
      vi.mocked(performance.now).mockReturnValueOnce(100).mockReturnValueOnce(200);
      
      PerformanceMonitor.mark('start');
      const duration = PerformanceMonitor.measure('test', 'start');
      
      expect(duration).toBe(100);
    });
  });

  describe('measureAsync', () => {
    it('measures async function execution time', async () => {
      vi.mocked(performance.now).mockReturnValueOnce(0).mockReturnValueOnce(50);
      
      const result = await PerformanceMonitor.measureAsync('async-test', async () => {
        return 'result';
      });
      
      expect(result).toBe('result');
    });

    it('measures failed async function', async () => {
      vi.mocked(performance.now).mockReturnValueOnce(0).mockReturnValueOnce(50);
      
      await expect(
        PerformanceMonitor.measureAsync('async-test', async () => {
          throw new Error('Test error');
        })
      ).rejects.toThrow('Test error');
    });
  });

  describe('reportWebVitals', () => {
    it('handles metric reporting', () => {
      const metric = { name: 'LCP', value: 2500, id: 'test-id' };
      expect(() => PerformanceMonitor.reportWebVitals(metric)).not.toThrow();
    });

    it('handles CLS metric with multiplier', () => {
      const metric = { name: 'CLS', value: 0.1, id: 'test-id' };
      expect(() => PerformanceMonitor.reportWebVitals(metric)).not.toThrow();
    });
  });
});

describe('debounce', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('delays function execution', () => {
    const fn = vi.fn();
    const debouncedFn = debounce(fn, 100);

    debouncedFn();
    expect(fn).not.toHaveBeenCalled();

    vi.advanceTimersByTime(100);
    expect(fn).toHaveBeenCalledTimes(1);
  });

  it('resets timer on subsequent calls', () => {
    const fn = vi.fn();
    const debouncedFn = debounce(fn, 100);

    debouncedFn();
    vi.advanceTimersByTime(50);
    debouncedFn();
    vi.advanceTimersByTime(50);
    
    expect(fn).not.toHaveBeenCalled();

    vi.advanceTimersByTime(50);
    expect(fn).toHaveBeenCalledTimes(1);
  });

  it('passes arguments to debounced function', () => {
    const fn = vi.fn();
    const debouncedFn = debounce(fn, 100);

    debouncedFn('arg1', 'arg2');
    vi.advanceTimersByTime(100);

    expect(fn).toHaveBeenCalledWith('arg1', 'arg2');
  });

  it('uses latest arguments when called multiple times', () => {
    const fn = vi.fn();
    const debouncedFn = debounce(fn, 100);

    debouncedFn('first');
    debouncedFn('second');
    debouncedFn('third');
    vi.advanceTimersByTime(100);

    expect(fn).toHaveBeenCalledTimes(1);
    expect(fn).toHaveBeenCalledWith('third');
  });
});

describe('throttle', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('executes function immediately on first call', () => {
    const fn = vi.fn();
    const throttledFn = throttle(fn, 100);

    throttledFn();
    expect(fn).toHaveBeenCalledTimes(1);
  });

  it('ignores calls within throttle period', () => {
    const fn = vi.fn();
    const throttledFn = throttle(fn, 100);

    throttledFn();
    throttledFn();
    throttledFn();

    expect(fn).toHaveBeenCalledTimes(1);
  });

  it('allows execution after throttle period', () => {
    const fn = vi.fn();
    const throttledFn = throttle(fn, 100);

    throttledFn();
    expect(fn).toHaveBeenCalledTimes(1);

    vi.advanceTimersByTime(100);
    throttledFn();
    expect(fn).toHaveBeenCalledTimes(2);
  });

  it('passes arguments to throttled function', () => {
    const fn = vi.fn();
    const throttledFn = throttle(fn, 100);

    throttledFn('arg1', 'arg2');
    expect(fn).toHaveBeenCalledWith('arg1', 'arg2');
  });
});
