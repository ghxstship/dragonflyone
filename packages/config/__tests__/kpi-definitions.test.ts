import { describe, it, expect } from 'vitest';
import { FINANCIAL_KPIS, TICKET_ATTENDANCE_KPIS } from '../kpi-definitions';
import { OPERATIONAL_KPIS } from '../kpi-operational';
import { MARKETING_KPIS } from '../kpi-marketing';
import { CUSTOMER_EXPERIENCE_KPIS } from '../kpi-customer-experience';

describe('kpi-definitions', () => {
  describe('FINANCIAL_KPIS', () => {
    it('should have KPI definitions', () => {
      expect(FINANCIAL_KPIS).toBeDefined();
      expect(Array.isArray(FINANCIAL_KPIS)).toBe(true);
      expect(FINANCIAL_KPIS.length).toBeGreaterThan(0);
    });

    it('should have required fields for each KPI', () => {
      FINANCIAL_KPIS.forEach(kpi => {
        expect(kpi.id).toBeDefined();
        expect(kpi.code).toBeDefined();
        expect(kpi.name).toBeDefined();
        expect(kpi.category).toBe('FINANCIAL_PERFORMANCE');
        expect(kpi.unit).toBeDefined();
        expect(kpi.enabled).toBeDefined();
      });
    });

    it('should have unique IDs', () => {
      const ids = FINANCIAL_KPIS.map(kpi => kpi.id);
      const uniqueIds = new Set(ids);
      expect(uniqueIds.size).toBe(ids.length);
    });

    it('should have unique codes', () => {
      const codes = FINANCIAL_KPIS.map(kpi => kpi.code);
      const uniqueCodes = new Set(codes);
      expect(uniqueCodes.size).toBe(codes.length);
    });

    it('should have valid target directions', () => {
      const validDirections = ['HIGHER_IS_BETTER', 'LOWER_IS_BETTER', 'TARGET_RANGE', 'INFORMATIONAL'];
      FINANCIAL_KPIS.forEach(kpi => {
        expect(validDirections).toContain(kpi.targetDirection);
      });
    });

    it('should have valid units', () => {
      const validUnits = ['CURRENCY', 'PERCENTAGE', 'COUNT', 'RATIO', 'DAYS', 'INDEX', 'HOURS', 'SCORE'];
      FINANCIAL_KPIS.forEach(kpi => {
        expect(validUnits).toContain(kpi.unit);
      });
    });
  });

  describe('TICKET_ATTENDANCE_KPIS', () => {
    it('should have KPI definitions', () => {
      expect(TICKET_ATTENDANCE_KPIS).toBeDefined();
      expect(Array.isArray(TICKET_ATTENDANCE_KPIS)).toBe(true);
      expect(TICKET_ATTENDANCE_KPIS.length).toBeGreaterThan(0);
    });

    it('should have required fields for each KPI', () => {
      TICKET_ATTENDANCE_KPIS.forEach(kpi => {
        expect(kpi.id).toBeDefined();
        expect(kpi.code).toBeDefined();
        expect(kpi.name).toBeDefined();
        expect(kpi.category).toBe('TICKET_ATTENDANCE');
        expect(kpi.enabled).toBeDefined();
      });
    });

    it('should have unique IDs', () => {
      const ids = TICKET_ATTENDANCE_KPIS.map(kpi => kpi.id);
      const uniqueIds = new Set(ids);
      expect(uniqueIds.size).toBe(ids.length);
    });
  });

  describe('OPERATIONAL_KPIS', () => {
    it('should have KPI definitions', () => {
      expect(OPERATIONAL_KPIS).toBeDefined();
      expect(Array.isArray(OPERATIONAL_KPIS)).toBe(true);
      expect(OPERATIONAL_KPIS.length).toBeGreaterThan(0);
    });

    it('should have required fields for each KPI', () => {
      OPERATIONAL_KPIS.forEach(kpi => {
        expect(kpi.id).toBeDefined();
        expect(kpi.code).toBeDefined();
        expect(kpi.name).toBeDefined();
        expect(kpi.enabled).toBeDefined();
      });
    });

    it('should have unique IDs', () => {
      const ids = OPERATIONAL_KPIS.map(kpi => kpi.id);
      const uniqueIds = new Set(ids);
      expect(uniqueIds.size).toBe(ids.length);
    });
  });

  describe('MARKETING_KPIS', () => {
    it('should have KPI definitions', () => {
      expect(MARKETING_KPIS).toBeDefined();
      expect(Array.isArray(MARKETING_KPIS)).toBe(true);
      expect(MARKETING_KPIS.length).toBeGreaterThan(0);
    });

    it('should have required fields for each KPI', () => {
      MARKETING_KPIS.forEach(kpi => {
        expect(kpi.id).toBeDefined();
        expect(kpi.code).toBeDefined();
        expect(kpi.name).toBeDefined();
        expect(kpi.enabled).toBeDefined();
      });
    });

    it('should have unique IDs', () => {
      const ids = MARKETING_KPIS.map(kpi => kpi.id);
      const uniqueIds = new Set(ids);
      expect(uniqueIds.size).toBe(ids.length);
    });
  });

  describe('CUSTOMER_EXPERIENCE_KPIS', () => {
    it('should have KPI definitions', () => {
      expect(CUSTOMER_EXPERIENCE_KPIS).toBeDefined();
      expect(Array.isArray(CUSTOMER_EXPERIENCE_KPIS)).toBe(true);
      expect(CUSTOMER_EXPERIENCE_KPIS.length).toBeGreaterThan(0);
    });

    it('should have required fields for each KPI', () => {
      CUSTOMER_EXPERIENCE_KPIS.forEach(kpi => {
        expect(kpi.id).toBeDefined();
        expect(kpi.code).toBeDefined();
        expect(kpi.name).toBeDefined();
        expect(kpi.enabled).toBeDefined();
      });
    });

    it('should have unique IDs', () => {
      const ids = CUSTOMER_EXPERIENCE_KPIS.map(kpi => kpi.id);
      const uniqueIds = new Set(ids);
      expect(uniqueIds.size).toBe(ids.length);
    });
  });

  describe('Cross-category validation', () => {
    it('should have no duplicate IDs across all categories', () => {
      const allKpis = [
        ...FINANCIAL_KPIS,
        ...TICKET_ATTENDANCE_KPIS,
        ...OPERATIONAL_KPIS,
        ...MARKETING_KPIS,
        ...CUSTOMER_EXPERIENCE_KPIS,
      ];
      const ids = allKpis.map(kpi => kpi.id);
      const uniqueIds = new Set(ids);
      expect(uniqueIds.size).toBe(ids.length);
    });

    it('should have no duplicate codes across all categories', () => {
      const allKpis = [
        ...FINANCIAL_KPIS,
        ...TICKET_ATTENDANCE_KPIS,
        ...OPERATIONAL_KPIS,
        ...MARKETING_KPIS,
        ...CUSTOMER_EXPERIENCE_KPIS,
      ];
      const codes = allKpis.map(kpi => kpi.code);
      const uniqueCodes = new Set(codes);
      expect(uniqueCodes.size).toBe(codes.length);
    });

    it('should have visualizations array for each KPI', () => {
      const allKpis = [
        ...FINANCIAL_KPIS,
        ...TICKET_ATTENDANCE_KPIS,
        ...OPERATIONAL_KPIS,
        ...MARKETING_KPIS,
        ...CUSTOMER_EXPERIENCE_KPIS,
      ];
      allKpis.forEach(kpi => {
        expect(Array.isArray(kpi.visualizations)).toBe(true);
        expect(kpi.visualizations.length).toBeGreaterThan(0);
      });
    });

    it('should have data sources for each KPI', () => {
      const allKpis = [
        ...FINANCIAL_KPIS,
        ...TICKET_ATTENDANCE_KPIS,
        ...OPERATIONAL_KPIS,
        ...MARKETING_KPIS,
        ...CUSTOMER_EXPERIENCE_KPIS,
      ];
      allKpis.forEach(kpi => {
        expect(Array.isArray(kpi.dataSources)).toBe(true);
        expect(kpi.dataSources.length).toBeGreaterThan(0);
      });
    });
  });
});
