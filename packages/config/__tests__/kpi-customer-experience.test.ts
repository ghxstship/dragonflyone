import { describe, it, expect } from 'vitest';
import { CUSTOMER_EXPERIENCE_KPIS } from '../kpi-customer-experience';

describe('kpi-customer-experience', () => {
  describe('CUSTOMER_EXPERIENCE_KPIS structure', () => {
    it('should export an array of KPI definitions', () => {
      expect(Array.isArray(CUSTOMER_EXPERIENCE_KPIS)).toBe(true);
      expect(CUSTOMER_EXPERIENCE_KPIS.length).toBeGreaterThan(0);
    });

    it('should have KPIs with required fields', () => {
      CUSTOMER_EXPERIENCE_KPIS.forEach((kpi) => {
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
      const ids = CUSTOMER_EXPERIENCE_KPIS.map((kpi) => kpi.id);
      const uniqueIds = new Set(ids);
      expect(uniqueIds.size).toBe(ids.length);
    });

    it('should have unique codes', () => {
      const codes = CUSTOMER_EXPERIENCE_KPIS.map((kpi) => kpi.code);
      const uniqueCodes = new Set(codes);
      expect(uniqueCodes.size).toBe(codes.length);
    });

    it('should have all KPIs in CUSTOMER_EXPERIENCE category', () => {
      CUSTOMER_EXPERIENCE_KPIS.forEach((kpi) => {
        expect(kpi.category).toBe('CUSTOMER_EXPERIENCE');
      });
    });
  });

  describe('Experience Quality KPIs (176-190)', () => {
    const experienceKpis = CUSTOMER_EXPERIENCE_KPIS.filter((kpi) => kpi.subcategory === 'EXPERIENCE_QUALITY');

    it('should have experience quality KPIs', () => {
      expect(experienceKpis.length).toBeGreaterThan(0);
    });

    it('should have codes starting with CX_EXP_', () => {
      experienceKpis.forEach((kpi) => {
        expect(kpi.code.startsWith('CX_EXP_')).toBe(true);
      });
    });

    it('should include Overall Satisfaction Score', () => {
      const satisfactionKpi = experienceKpis.find((kpi) => kpi.code === 'CX_EXP_001');
      expect(satisfactionKpi).toBeDefined();
      expect(satisfactionKpi?.name).toBe('Overall Satisfaction Score');
      expect(satisfactionKpi?.unit).toBe('SCORE');
      expect(satisfactionKpi?.targetValue).toBe(8);
    });

    it('should include Likelihood to Recommend', () => {
      const recommendKpi = experienceKpis.find((kpi) => kpi.code === 'CX_EXP_002');
      expect(recommendKpi).toBeDefined();
      expect(recommendKpi?.name).toBe('Likelihood to Recommend');
      expect(recommendKpi?.unit).toBe('PERCENTAGE');
    });
  });

  describe('Customer Service KPIs (191-200)', () => {
    const serviceKpis = CUSTOMER_EXPERIENCE_KPIS.filter((kpi) => kpi.subcategory === 'CUSTOMER_SERVICE');

    it('should have customer service KPIs', () => {
      expect(serviceKpis.length).toBeGreaterThan(0);
    });

    it('should have codes starting with CX_SVC_', () => {
      serviceKpis.forEach((kpi) => {
        expect(kpi.code.startsWith('CX_SVC_')).toBe(true);
      });
    });
  });

  describe('Target directions', () => {
    it('should have valid target directions', () => {
      const validDirections = ['HIGHER_IS_BETTER', 'LOWER_IS_BETTER', 'TARGET_RANGE', 'INFORMATIONAL'];
      CUSTOMER_EXPERIENCE_KPIS.forEach((kpi) => {
        expect(validDirections).toContain(kpi.targetDirection);
      });
    });
  });

  describe('Units', () => {
    it('should have valid units', () => {
      const validUnits = ['PERCENTAGE', 'COUNT', 'DAYS', 'HOURS', 'SCORE', 'RATIO', 'RATE', 'INDEX', 'CURRENCY', 'MINUTES', 'SECONDS'];
      CUSTOMER_EXPERIENCE_KPIS.forEach((kpi) => {
        expect(validUnits).toContain(kpi.unit);
      });
    });
  });

  describe('Visualizations', () => {
    it('should have at least one visualization per KPI', () => {
      CUSTOMER_EXPERIENCE_KPIS.forEach((kpi) => {
        expect(kpi.visualizations.length).toBeGreaterThan(0);
      });
    });
  });

  describe('Data sources', () => {
    it('should have at least one data source per KPI', () => {
      CUSTOMER_EXPERIENCE_KPIS.forEach((kpi) => {
        expect(kpi.dataSources.length).toBeGreaterThan(0);
      });
    });

    it('should have valid data source structure', () => {
      CUSTOMER_EXPERIENCE_KPIS.forEach((kpi) => {
        kpi.dataSources.forEach((ds) => {
          expect(ds.table).toBeDefined();
          expect(ds.fields).toBeDefined();
          expect(Array.isArray(ds.fields)).toBe(true);
        });
      });
    });
  });
});
