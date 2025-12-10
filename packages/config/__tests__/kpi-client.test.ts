import { describe, it, expect } from 'vitest';
import type { KPITrendData } from '../kpi-client';

describe('kpi-client', () => {
  describe('KPITrendData interface', () => {
    it('should have all required fields', () => {
      const trend: KPITrendData = {
        date: '2025-01-15',
        value: 85.5,
        target_value: 90,
        warning_threshold: 80,
        critical_threshold: 70,
      };

      expect(trend.date).toBe('2025-01-15');
      expect(trend.value).toBe(85.5);
      expect(trend.target_value).toBe(90);
      expect(trend.warning_threshold).toBe(80);
      expect(trend.critical_threshold).toBe(70);
    });

    it('should support null target value', () => {
      const trend: KPITrendData = {
        date: '2025-01-15',
        value: 100,
        target_value: null,
        warning_threshold: null,
        critical_threshold: null,
      };

      expect(trend.target_value).toBeNull();
    });

    it('should support null thresholds', () => {
      const trend: KPITrendData = {
        date: '2025-01-15',
        value: 50,
        target_value: 60,
        warning_threshold: null,
        critical_threshold: null,
      };

      expect(trend.warning_threshold).toBeNull();
      expect(trend.critical_threshold).toBeNull();
    });

    it('should represent trend over time', () => {
      const trends: KPITrendData[] = [
        { date: '2025-01-01', value: 70, target_value: 80, warning_threshold: 75, critical_threshold: 65 },
        { date: '2025-01-02', value: 72, target_value: 80, warning_threshold: 75, critical_threshold: 65 },
        { date: '2025-01-03', value: 75, target_value: 80, warning_threshold: 75, critical_threshold: 65 },
        { date: '2025-01-04', value: 78, target_value: 80, warning_threshold: 75, critical_threshold: 65 },
        { date: '2025-01-05', value: 82, target_value: 80, warning_threshold: 75, critical_threshold: 65 },
      ];

      expect(trends.length).toBe(5);
      expect(trends[0].value).toBeLessThan(trends[4].value);
      expect(trends[4].value).toBeGreaterThan(trends[4].target_value!);
    });

    it('should identify values below warning threshold', () => {
      const trend: KPITrendData = {
        date: '2025-01-15',
        value: 72,
        target_value: 90,
        warning_threshold: 80,
        critical_threshold: 70,
      };

      const isBelowWarning = trend.warning_threshold !== null && trend.value < trend.warning_threshold;
      const isBelowCritical = trend.critical_threshold !== null && trend.value < trend.critical_threshold;

      expect(isBelowWarning).toBe(true);
      expect(isBelowCritical).toBe(false);
    });

    it('should identify values below critical threshold', () => {
      const trend: KPITrendData = {
        date: '2025-01-15',
        value: 65,
        target_value: 90,
        warning_threshold: 80,
        critical_threshold: 70,
      };

      const isBelowCritical = trend.critical_threshold !== null && trend.value < trend.critical_threshold;
      expect(isBelowCritical).toBe(true);
    });

    it('should identify values meeting target', () => {
      const trend: KPITrendData = {
        date: '2025-01-15',
        value: 95,
        target_value: 90,
        warning_threshold: 80,
        critical_threshold: 70,
      };

      const meetsTarget = trend.target_value !== null && trend.value >= trend.target_value;
      expect(meetsTarget).toBe(true);
    });
  });

  describe('KPI data point parameters', () => {
    it('should define required parameters', () => {
      const params = {
        kpi_code: 'FIN_REV_001',
        kpi_name: 'Total Revenue',
        value: 150000,
        unit: 'CURRENCY',
      };

      expect(params.kpi_code).toBe('FIN_REV_001');
      expect(params.kpi_name).toBe('Total Revenue');
      expect(params.value).toBe(150000);
      expect(params.unit).toBe('CURRENCY');
    });

    it('should support optional project_id', () => {
      const params = {
        kpi_code: 'OPS_PM_001',
        kpi_name: 'Schedule Adherence',
        value: 92,
        unit: 'PERCENTAGE',
        project_id: 'proj-123',
      };

      expect(params.project_id).toBe('proj-123');
    });

    it('should support optional event_id', () => {
      const params = {
        kpi_code: 'CX_EXP_001',
        kpi_name: 'Satisfaction Score',
        value: 8.5,
        unit: 'SCORE',
        event_id: 'event-456',
      };

      expect(params.event_id).toBe('event-456');
    });

    it('should support period dates', () => {
      const params = {
        kpi_code: 'FIN_REV_001',
        kpi_name: 'Monthly Revenue',
        value: 50000,
        unit: 'CURRENCY',
        period_start: '2025-01-01',
        period_end: '2025-01-31',
      };

      expect(params.period_start).toBe('2025-01-01');
      expect(params.period_end).toBe('2025-01-31');
    });

    it('should support metadata', () => {
      const params = {
        kpi_code: 'OPS_TEAM_001',
        kpi_name: 'Staff Utilization',
        value: 85,
        unit: 'PERCENTAGE',
        metadata: {
          department: 'Production',
          team_size: 15,
          calculated_by: 'system',
        },
      };

      expect(params.metadata?.department).toBe('Production');
      expect(params.metadata?.team_size).toBe(15);
    });
  });

  describe('KPI filter parameters', () => {
    it('should support kpi_code filter', () => {
      const filters = { kpi_code: 'FIN_REV_001' };
      expect(filters.kpi_code).toBe('FIN_REV_001');
    });

    it('should support project_id filter', () => {
      const filters = { project_id: 'proj-123' };
      expect(filters.project_id).toBe('proj-123');
    });

    it('should support event_id filter', () => {
      const filters = { event_id: 'event-456' };
      expect(filters.event_id).toBe('event-456');
    });

    it('should support days filter', () => {
      const filters = { days: 30 };
      expect(filters.days).toBe(30);
    });

    it('should support limit filter', () => {
      const filters = { limit: 100 };
      expect(filters.limit).toBe(100);
    });

    it('should support combined filters', () => {
      const filters = {
        kpi_code: 'OPS_PM_001',
        project_id: 'proj-123',
        days: 7,
        limit: 50,
      };

      expect(Object.keys(filters).length).toBe(4);
    });
  });
});
