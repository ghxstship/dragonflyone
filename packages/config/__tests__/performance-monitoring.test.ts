import { describe, it, expect } from 'vitest';
import { PerformanceBudgetMonitor, WebVitalsMetric } from '../performance-monitoring';

describe('performance-monitoring', () => {
  describe('PerformanceBudgetMonitor', () => {
    describe('constructor', () => {
      it('should create with default budgets', () => {
        const monitor = new PerformanceBudgetMonitor();
        expect(monitor.isWithinBudget('LCP', 2000)).toBe(true);
        expect(monitor.isWithinBudget('LCP', 3000)).toBe(false);
      });

      it('should accept custom budgets', () => {
        const monitor = new PerformanceBudgetMonitor({
          LCP: 3000,
          FID: 200,
        });
        expect(monitor.isWithinBudget('LCP', 2800)).toBe(true);
        expect(monitor.isWithinBudget('FID', 150)).toBe(true);
      });
    });

    describe('isWithinBudget', () => {
      it('should return true when value is under budget', () => {
        const monitor = new PerformanceBudgetMonitor();
        expect(monitor.isWithinBudget('LCP', 2000)).toBe(true);
        expect(monitor.isWithinBudget('FID', 50)).toBe(true);
        expect(monitor.isWithinBudget('CLS', 0.05)).toBe(true);
      });

      it('should return true when value equals budget', () => {
        const monitor = new PerformanceBudgetMonitor();
        expect(monitor.isWithinBudget('LCP', 2500)).toBe(true);
        expect(monitor.isWithinBudget('FID', 100)).toBe(true);
      });

      it('should return false when value exceeds budget', () => {
        const monitor = new PerformanceBudgetMonitor();
        expect(monitor.isWithinBudget('LCP', 3000)).toBe(false);
        expect(monitor.isWithinBudget('FID', 150)).toBe(false);
        expect(monitor.isWithinBudget('CLS', 0.2)).toBe(false);
      });

      it('should return true for unknown metrics', () => {
        const monitor = new PerformanceBudgetMonitor();
        expect(monitor.isWithinBudget('unknown', 9999)).toBe(true);
      });
    });

    describe('getViolations', () => {
      it('should return empty array when all metrics within budget', () => {
        const monitor = new PerformanceBudgetMonitor();
        const metrics: WebVitalsMetric[] = [
          { name: 'LCP', value: 2000, rating: 'good', delta: 2000, id: '1', navigationType: 'navigate' },
          { name: 'FID', value: 50, rating: 'good', delta: 50, id: '2', navigationType: 'navigate' },
        ];
        
        const violations = monitor.getViolations(metrics);
        expect(violations).toHaveLength(0);
      });

      it('should return violations for metrics exceeding budget', () => {
        const monitor = new PerformanceBudgetMonitor();
        const metrics: WebVitalsMetric[] = [
          { name: 'LCP', value: 3000, rating: 'needs-improvement', delta: 3000, id: '1', navigationType: 'navigate' },
          { name: 'FID', value: 50, rating: 'good', delta: 50, id: '2', navigationType: 'navigate' },
        ];
        
        const violations = monitor.getViolations(metrics);
        expect(violations).toHaveLength(1);
        expect(violations[0].metric).toBe('LCP');
        expect(violations[0].value).toBe(3000);
        expect(violations[0].budget).toBe(2500);
        expect(violations[0].overage).toBe(500);
      });

      it('should return multiple violations', () => {
        const monitor = new PerformanceBudgetMonitor();
        const metrics: WebVitalsMetric[] = [
          { name: 'LCP', value: 5000, rating: 'poor', delta: 5000, id: '1', navigationType: 'navigate' },
          { name: 'FID', value: 200, rating: 'needs-improvement', delta: 200, id: '2', navigationType: 'navigate' },
          { name: 'CLS', value: 0.3, rating: 'poor', delta: 0.3, id: '3', navigationType: 'navigate' },
        ];
        
        const violations = monitor.getViolations(metrics);
        expect(violations).toHaveLength(3);
      });

      it('should calculate correct overage', () => {
        const monitor = new PerformanceBudgetMonitor();
        const metrics: WebVitalsMetric[] = [
          { name: 'TTFB', value: 1000, rating: 'needs-improvement', delta: 1000, id: '1', navigationType: 'navigate' },
        ];
        
        const violations = monitor.getViolations(metrics);
        expect(violations[0].overage).toBe(200); // 1000 - 800
      });
    });

    describe('setBudget', () => {
      it('should set custom budget', () => {
        const monitor = new PerformanceBudgetMonitor();
        
        // Default LCP budget is 2500
        expect(monitor.isWithinBudget('LCP', 3000)).toBe(false);
        
        // Set new budget
        monitor.setBudget('LCP', 4000);
        expect(monitor.isWithinBudget('LCP', 3000)).toBe(true);
      });

      it('should add new budget for custom metric', () => {
        const monitor = new PerformanceBudgetMonitor();
        
        monitor.setBudget('customMetric', 500);
        expect(monitor.isWithinBudget('customMetric', 400)).toBe(true);
        expect(monitor.isWithinBudget('customMetric', 600)).toBe(false);
      });
    });

    describe('default budgets', () => {
      it('should have correct default LCP budget', () => {
        const monitor = new PerformanceBudgetMonitor();
        expect(monitor.isWithinBudget('LCP', 2500)).toBe(true);
        expect(monitor.isWithinBudget('LCP', 2501)).toBe(false);
      });

      it('should have correct default FID budget', () => {
        const monitor = new PerformanceBudgetMonitor();
        expect(monitor.isWithinBudget('FID', 100)).toBe(true);
        expect(monitor.isWithinBudget('FID', 101)).toBe(false);
      });

      it('should have correct default CLS budget', () => {
        const monitor = new PerformanceBudgetMonitor();
        expect(monitor.isWithinBudget('CLS', 0.1)).toBe(true);
        expect(monitor.isWithinBudget('CLS', 0.11)).toBe(false);
      });

      it('should have correct default FCP budget', () => {
        const monitor = new PerformanceBudgetMonitor();
        expect(monitor.isWithinBudget('FCP', 1800)).toBe(true);
        expect(monitor.isWithinBudget('FCP', 1801)).toBe(false);
      });

      it('should have correct default TTFB budget', () => {
        const monitor = new PerformanceBudgetMonitor();
        expect(monitor.isWithinBudget('TTFB', 800)).toBe(true);
        expect(monitor.isWithinBudget('TTFB', 801)).toBe(false);
      });

      it('should have correct default totalBundleSize budget', () => {
        const monitor = new PerformanceBudgetMonitor();
        expect(monitor.isWithinBudget('totalBundleSize', 300000)).toBe(true);
        expect(monitor.isWithinBudget('totalBundleSize', 300001)).toBe(false);
      });

      it('should have correct default imageBudget', () => {
        const monitor = new PerformanceBudgetMonitor();
        expect(monitor.isWithinBudget('imageBudget', 500000)).toBe(true);
        expect(monitor.isWithinBudget('imageBudget', 500001)).toBe(false);
      });
    });
  });
});
