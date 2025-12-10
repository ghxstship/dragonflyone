import { describe, it, expect } from 'vitest';
import { MARKETING_KPIS } from '../kpi-marketing';

describe('kpi-marketing', () => {
  describe('MARKETING_KPIS structure', () => {
    it('should export an array of KPI definitions', () => {
      expect(Array.isArray(MARKETING_KPIS)).toBe(true);
      expect(MARKETING_KPIS.length).toBeGreaterThan(0);
    });

    it('should have KPIs with required fields', () => {
      MARKETING_KPIS.forEach((kpi) => {
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
      const ids = MARKETING_KPIS.map((kpi) => kpi.id);
      const uniqueIds = new Set(ids);
      expect(uniqueIds.size).toBe(ids.length);
    });

    it('should have unique codes', () => {
      const codes = MARKETING_KPIS.map((kpi) => kpi.code);
      const uniqueCodes = new Set(codes);
      expect(uniqueCodes.size).toBe(codes.length);
    });

    it('should have all KPIs in MARKETING_ENGAGEMENT category', () => {
      MARKETING_KPIS.forEach((kpi) => {
        expect(kpi.category).toBe('MARKETING_ENGAGEMENT');
      });
    });
  });

  describe('Digital Marketing KPIs (146-155)', () => {
    const digitalKpis = MARKETING_KPIS.filter((kpi) => kpi.subcategory === 'DIGITAL_MARKETING');

    it('should have digital marketing KPIs', () => {
      expect(digitalKpis.length).toBeGreaterThan(0);
    });

    it('should have codes starting with MKT_DIG_', () => {
      digitalKpis.forEach((kpi) => {
        expect(kpi.code.startsWith('MKT_DIG_')).toBe(true);
      });
    });

    it('should include Social Media Engagement Rate', () => {
      const socialKpi = digitalKpis.find((kpi) => kpi.code === 'MKT_DIG_001');
      expect(socialKpi).toBeDefined();
      expect(socialKpi?.name).toBe('Social Media Engagement Rate');
      expect(socialKpi?.unit).toBe('PERCENTAGE');
    });

    it('should include Email Open Rate', () => {
      const emailKpi = digitalKpis.find((kpi) => kpi.code === 'MKT_DIG_005');
      expect(emailKpi).toBeDefined();
      expect(emailKpi?.name).toBe('Email Open Rate');
      expect(emailKpi?.targetValue).toBe(20);
    });
  });

  describe('Audience Insights KPIs (156-165)', () => {
    const audienceKpis = MARKETING_KPIS.filter((kpi) => kpi.subcategory === 'AUDIENCE_INSIGHTS');

    it('should have audience insights KPIs', () => {
      expect(audienceKpis.length).toBeGreaterThan(0);
    });

    it('should have codes starting with MKT_AUD_', () => {
      audienceKpis.forEach((kpi) => {
        expect(kpi.code.startsWith('MKT_AUD_')).toBe(true);
      });
    });
  });

  describe('Brand & Experience KPIs (166-175)', () => {
    const brandKpis = MARKETING_KPIS.filter((kpi) => kpi.subcategory === 'BRAND_EXPERIENCE');

    it('should have brand experience KPIs', () => {
      expect(brandKpis.length).toBeGreaterThan(0);
    });

    it('should have codes starting with MKT_BRAND_', () => {
      brandKpis.forEach((kpi) => {
        expect(kpi.code.startsWith('MKT_BRAND_')).toBe(true);
      });
    });
  });

  describe('Target directions', () => {
    it('should have valid target directions', () => {
      const validDirections = ['HIGHER_IS_BETTER', 'LOWER_IS_BETTER', 'TARGET_RANGE', 'INFORMATIONAL'];
      MARKETING_KPIS.forEach((kpi) => {
        expect(validDirections).toContain(kpi.targetDirection);
      });
    });
  });

  describe('Units', () => {
    it('should have valid units', () => {
      const validUnits = ['PERCENTAGE', 'COUNT', 'DAYS', 'HOURS', 'SCORE', 'RATIO', 'RATE', 'INDEX', 'CURRENCY'];
      MARKETING_KPIS.forEach((kpi) => {
        expect(validUnits).toContain(kpi.unit);
      });
    });
  });

  describe('Visualizations', () => {
    it('should have at least one visualization per KPI', () => {
      MARKETING_KPIS.forEach((kpi) => {
        expect(kpi.visualizations.length).toBeGreaterThan(0);
      });
    });
  });

  describe('Data sources', () => {
    it('should have at least one data source per KPI', () => {
      MARKETING_KPIS.forEach((kpi) => {
        expect(kpi.dataSources.length).toBeGreaterThan(0);
      });
    });

    it('should have valid data source structure', () => {
      MARKETING_KPIS.forEach((kpi) => {
        kpi.dataSources.forEach((ds) => {
          expect(ds.table).toBeDefined();
          expect(ds.fields).toBeDefined();
          expect(Array.isArray(ds.fields)).toBe(true);
        });
      });
    });
  });
});
