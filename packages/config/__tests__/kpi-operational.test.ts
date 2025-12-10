import { describe, it, expect } from 'vitest';
import { OPERATIONAL_KPIS } from '../kpi-operational';

describe('kpi-operational', () => {
  describe('OPERATIONAL_KPIS structure', () => {
    it('should export an array of KPI definitions', () => {
      expect(Array.isArray(OPERATIONAL_KPIS)).toBe(true);
      expect(OPERATIONAL_KPIS.length).toBeGreaterThan(0);
    });

    it('should have KPIs with required fields', () => {
      OPERATIONAL_KPIS.forEach((kpi) => {
        expect(kpi.id).toBeDefined();
        expect(kpi.code).toBeDefined();
        expect(kpi.name).toBeDefined();
        expect(kpi.description).toBeDefined();
        expect(kpi.category).toBeDefined();
        expect(kpi.subcategory).toBeDefined();
        expect(kpi.unit).toBeDefined();
        expect(kpi.targetDirection).toBeDefined();
        expect(kpi.dataSources).toBeDefined();
        expect(kpi.calculation).toBeDefined();
        expect(kpi.updateFrequency).toBeDefined();
        expect(kpi.visualizations).toBeDefined();
        expect(kpi.enabled).toBeDefined();
      });
    });

    it('should have unique IDs', () => {
      const ids = OPERATIONAL_KPIS.map((kpi) => kpi.id);
      const uniqueIds = new Set(ids);
      expect(uniqueIds.size).toBe(ids.length);
    });

    it('should have unique codes', () => {
      const codes = OPERATIONAL_KPIS.map((kpi) => kpi.code);
      const uniqueCodes = new Set(codes);
      expect(uniqueCodes.size).toBe(codes.length);
    });

    it('should have all KPIs in OPERATIONAL_EFFICIENCY category', () => {
      OPERATIONAL_KPIS.forEach((kpi) => {
        expect(kpi.category).toBe('OPERATIONAL_EFFICIENCY');
      });
    });
  });

  describe('Project Management KPIs (91-110)', () => {
    const projectKpis = OPERATIONAL_KPIS.filter((kpi) => kpi.subcategory === 'PROJECT_MANAGEMENT');

    it('should have project management KPIs', () => {
      expect(projectKpis.length).toBeGreaterThan(0);
    });

    it('should have codes starting with OPS_PM_', () => {
      projectKpis.forEach((kpi) => {
        expect(kpi.code.startsWith('OPS_PM_')).toBe(true);
      });
    });

    it('should include Schedule Adherence Rate', () => {
      const scheduleKpi = projectKpis.find((kpi) => kpi.code === 'OPS_PM_001');
      expect(scheduleKpi).toBeDefined();
      expect(scheduleKpi?.name).toBe('Schedule Adherence Rate');
      expect(scheduleKpi?.unit).toBe('PERCENTAGE');
    });

    it('should include Project Health Score', () => {
      const healthKpi = projectKpis.find((kpi) => kpi.code === 'OPS_PM_020');
      expect(healthKpi).toBeDefined();
      expect(healthKpi?.name).toBe('Project Health Score');
      expect(healthKpi?.unit).toBe('SCORE');
    });
  });

  describe('Team Performance KPIs (111-130)', () => {
    const teamKpis = OPERATIONAL_KPIS.filter((kpi) => kpi.subcategory === 'TEAM_PERFORMANCE');

    it('should have team performance KPIs', () => {
      expect(teamKpis.length).toBeGreaterThan(0);
    });

    it('should have codes starting with OPS_TEAM_', () => {
      teamKpis.forEach((kpi) => {
        expect(kpi.code.startsWith('OPS_TEAM_')).toBe(true);
      });
    });

    it('should include Staff Utilization Rate', () => {
      const utilizationKpi = teamKpis.find((kpi) => kpi.code === 'OPS_TEAM_001');
      expect(utilizationKpi).toBeDefined();
      expect(utilizationKpi?.name).toBe('Staff Utilization Rate');
      expect(utilizationKpi?.targetDirection).toBe('TARGET_RANGE');
    });

    it('should include Staff Turnover Rate', () => {
      const turnoverKpi = teamKpis.find((kpi) => kpi.code === 'OPS_TEAM_005');
      expect(turnoverKpi).toBeDefined();
      expect(turnoverKpi?.name).toBe('Staff Turnover Rate');
      expect(turnoverKpi?.targetDirection).toBe('LOWER_IS_BETTER');
    });
  });

  describe('Vendor & Supply Chain KPIs (131-145)', () => {
    const vendorKpis = OPERATIONAL_KPIS.filter((kpi) => kpi.subcategory === 'VENDOR_SUPPLY_CHAIN');

    it('should have vendor KPIs', () => {
      expect(vendorKpis.length).toBeGreaterThan(0);
    });

    it('should have codes starting with OPS_VENDOR_', () => {
      vendorKpis.forEach((kpi) => {
        expect(kpi.code.startsWith('OPS_VENDOR_')).toBe(true);
      });
    });

    it('should include Vendor Reliability Score', () => {
      const reliabilityKpi = vendorKpis.find((kpi) => kpi.code === 'OPS_VENDOR_001');
      expect(reliabilityKpi).toBeDefined();
      expect(reliabilityKpi?.name).toBe('Vendor Reliability Score');
      expect(reliabilityKpi?.targetValue).toBe(95);
    });

    it('should include Supply Chain Risk Score', () => {
      const riskKpi = vendorKpis.find((kpi) => kpi.code === 'OPS_VENDOR_015');
      expect(riskKpi).toBeDefined();
      expect(riskKpi?.name).toBe('Supply Chain Risk Score');
      expect(riskKpi?.targetDirection).toBe('LOWER_IS_BETTER');
    });
  });

  describe('Target directions', () => {
    it('should have valid target directions', () => {
      const validDirections = ['HIGHER_IS_BETTER', 'LOWER_IS_BETTER', 'TARGET_RANGE', 'INFORMATIONAL'];
      OPERATIONAL_KPIS.forEach((kpi) => {
        expect(validDirections).toContain(kpi.targetDirection);
      });
    });
  });

  describe('Units', () => {
    it('should have valid units', () => {
      const validUnits = ['PERCENTAGE', 'COUNT', 'DAYS', 'HOURS', 'SCORE', 'RATIO', 'RATE', 'INDEX'];
      OPERATIONAL_KPIS.forEach((kpi) => {
        expect(validUnits).toContain(kpi.unit);
      });
    });
  });

  describe('Visualizations', () => {
    it('should have at least one visualization per KPI', () => {
      OPERATIONAL_KPIS.forEach((kpi) => {
        expect(kpi.visualizations.length).toBeGreaterThan(0);
      });
    });

    it('should have valid visualization types', () => {
      const validVisualizations = [
        'GAUGE', 'LINE_CHART', 'BAR_CHART', 'PIE_CHART', 'NUMBER',
        'TREND_INDICATOR', 'PROGRESS_BAR', 'DISTRIBUTION'
      ];
      OPERATIONAL_KPIS.forEach((kpi) => {
        kpi.visualizations.forEach((viz) => {
          expect(validVisualizations).toContain(viz);
        });
      });
    });
  });

  describe('Data sources', () => {
    it('should have at least one data source per KPI', () => {
      OPERATIONAL_KPIS.forEach((kpi) => {
        expect(kpi.dataSources.length).toBeGreaterThan(0);
      });
    });

    it('should have valid data source structure', () => {
      OPERATIONAL_KPIS.forEach((kpi) => {
        kpi.dataSources.forEach((ds) => {
          expect(ds.table).toBeDefined();
          expect(ds.fields).toBeDefined();
          expect(Array.isArray(ds.fields)).toBe(true);
        });
      });
    });
  });

  describe('Thresholds', () => {
    it('should have warning threshold less than or equal to critical threshold when both exist', () => {
      OPERATIONAL_KPIS.forEach((kpi) => {
        if (kpi.warningThreshold !== undefined && kpi.criticalThreshold !== undefined) {
          if (kpi.targetDirection === 'HIGHER_IS_BETTER') {
            expect(kpi.warningThreshold).toBeGreaterThanOrEqual(kpi.criticalThreshold);
          } else if (kpi.targetDirection === 'LOWER_IS_BETTER') {
            expect(kpi.warningThreshold).toBeLessThanOrEqual(kpi.criticalThreshold);
          }
        }
      });
    });
  });
});
