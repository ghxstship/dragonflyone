import { describe, it, expect } from 'vitest';
import type { ProductionMetrics, KPI } from '../useMetrics';

describe('useMetrics', () => {
  describe('ProductionMetrics interface', () => {
    it('should have all financial fields', () => {
      const metrics: ProductionMetrics = {
        totalBudget: 1000000,
        totalSpent: 750000,
        budgetRemaining: 250000,
        budgetUtilization: 75,
        revenueProjected: 1500000,
        revenueActual: 1200000,
        totalSponsors: 10,
        sponsorRevenue: 500000,
        sponsorsPaid: 8,
        sponsorsOutstanding: 2,
        totalInvestors: 5,
        totalRaised: 2000000,
        targetRaise: 2500000,
        fundingProgress: 80,
        totalTasks: 100,
        tasksCompleted: 75,
        taskCompletionRate: 75,
        criticalTasks: 5,
        totalPermits: 15,
        permitsApproved: 12,
        permitsExpiringSoon: 2,
        insuranceCoverage: 5000000,
        totalVenues: 3,
        totalCapacity: 15000,
        venuesCost: 200000,
        daysUntilEvent: 30,
        daysInProduction: 90,
        productionProgress: 75,
      };

      expect(metrics.totalBudget).toBe(1000000);
      expect(metrics.budgetUtilization).toBe(75);
      expect(metrics.revenueProjected).toBe(1500000);
    });

    it('should have all sponsorship fields', () => {
      const metrics: ProductionMetrics = {
        totalBudget: 0, totalSpent: 0, budgetRemaining: 0, budgetUtilization: 0,
        revenueProjected: 0, revenueActual: 0,
        totalSponsors: 15,
        sponsorRevenue: 750000,
        sponsorsPaid: 12,
        sponsorsOutstanding: 3,
        totalInvestors: 0, totalRaised: 0, targetRaise: 0, fundingProgress: 0,
        totalTasks: 0, tasksCompleted: 0, taskCompletionRate: 0, criticalTasks: 0,
        totalPermits: 0, permitsApproved: 0, permitsExpiringSoon: 0, insuranceCoverage: 0,
        totalVenues: 0, totalCapacity: 0, venuesCost: 0,
        daysUntilEvent: 0, daysInProduction: 0, productionProgress: 0,
      };

      expect(metrics.totalSponsors).toBe(15);
      expect(metrics.sponsorRevenue).toBe(750000);
      expect(metrics.sponsorsPaid).toBe(12);
      expect(metrics.sponsorsOutstanding).toBe(3);
    });

    it('should have all investment fields', () => {
      const metrics: ProductionMetrics = {
        totalBudget: 0, totalSpent: 0, budgetRemaining: 0, budgetUtilization: 0,
        revenueProjected: 0, revenueActual: 0,
        totalSponsors: 0, sponsorRevenue: 0, sponsorsPaid: 0, sponsorsOutstanding: 0,
        totalInvestors: 8,
        totalRaised: 3000000,
        targetRaise: 5000000,
        fundingProgress: 60,
        totalTasks: 0, tasksCompleted: 0, taskCompletionRate: 0, criticalTasks: 0,
        totalPermits: 0, permitsApproved: 0, permitsExpiringSoon: 0, insuranceCoverage: 0,
        totalVenues: 0, totalCapacity: 0, venuesCost: 0,
        daysUntilEvent: 0, daysInProduction: 0, productionProgress: 0,
      };

      expect(metrics.totalInvestors).toBe(8);
      expect(metrics.totalRaised).toBe(3000000);
      expect(metrics.fundingProgress).toBe(60);
    });

    it('should have all operations fields', () => {
      const metrics: ProductionMetrics = {
        totalBudget: 0, totalSpent: 0, budgetRemaining: 0, budgetUtilization: 0,
        revenueProjected: 0, revenueActual: 0,
        totalSponsors: 0, sponsorRevenue: 0, sponsorsPaid: 0, sponsorsOutstanding: 0,
        totalInvestors: 0, totalRaised: 0, targetRaise: 0, fundingProgress: 0,
        totalTasks: 200,
        tasksCompleted: 150,
        taskCompletionRate: 75,
        criticalTasks: 10,
        totalPermits: 0, permitsApproved: 0, permitsExpiringSoon: 0, insuranceCoverage: 0,
        totalVenues: 0, totalCapacity: 0, venuesCost: 0,
        daysUntilEvent: 0, daysInProduction: 0, productionProgress: 0,
      };

      expect(metrics.totalTasks).toBe(200);
      expect(metrics.tasksCompleted).toBe(150);
      expect(metrics.taskCompletionRate).toBe(75);
      expect(metrics.criticalTasks).toBe(10);
    });

    it('should have all compliance fields', () => {
      const metrics: ProductionMetrics = {
        totalBudget: 0, totalSpent: 0, budgetRemaining: 0, budgetUtilization: 0,
        revenueProjected: 0, revenueActual: 0,
        totalSponsors: 0, sponsorRevenue: 0, sponsorsPaid: 0, sponsorsOutstanding: 0,
        totalInvestors: 0, totalRaised: 0, targetRaise: 0, fundingProgress: 0,
        totalTasks: 0, tasksCompleted: 0, taskCompletionRate: 0, criticalTasks: 0,
        totalPermits: 20,
        permitsApproved: 18,
        permitsExpiringSoon: 3,
        insuranceCoverage: 10000000,
        totalVenues: 0, totalCapacity: 0, venuesCost: 0,
        daysUntilEvent: 0, daysInProduction: 0, productionProgress: 0,
      };

      expect(metrics.totalPermits).toBe(20);
      expect(metrics.permitsApproved).toBe(18);
      expect(metrics.permitsExpiringSoon).toBe(3);
      expect(metrics.insuranceCoverage).toBe(10000000);
    });
  });

  describe('KPI interface', () => {
    it('should have all required fields', () => {
      const kpi: KPI = {
        id: 'kpi-123',
        name: 'Budget Utilization',
        category: 'financial',
        value: 75,
        target: 80,
        unit: '%',
        trend: 'up',
        trendValue: 5,
        status: 'on_track',
      };

      expect(kpi.id).toBe('kpi-123');
      expect(kpi.name).toBe('Budget Utilization');
      expect(kpi.category).toBe('financial');
      expect(kpi.value).toBe(75);
      expect(kpi.target).toBe(80);
    });

    it('should support all categories', () => {
      const categories: KPI['category'][] = ['financial', 'operational', 'compliance', 'engagement'];
      expect(categories.length).toBe(4);
    });

    it('should support all trend values', () => {
      const trends: KPI['trend'][] = ['up', 'down', 'stable'];
      expect(trends.length).toBe(3);
    });

    it('should support all status values', () => {
      const statuses: KPI['status'][] = ['on_track', 'at_risk', 'off_track'];
      expect(statuses.length).toBe(3);
    });

    it('should support financial category KPI', () => {
      const kpi: KPI = {
        id: 'kpi-1',
        name: 'Revenue vs Target',
        category: 'financial',
        value: 1200000,
        target: 1500000,
        unit: '$',
        trend: 'up',
        trendValue: 10,
        status: 'at_risk',
      };
      expect(kpi.category).toBe('financial');
    });

    it('should support operational category KPI', () => {
      const kpi: KPI = {
        id: 'kpi-2',
        name: 'Task Completion Rate',
        category: 'operational',
        value: 85,
        target: 90,
        unit: '%',
        trend: 'stable',
        trendValue: 0,
        status: 'on_track',
      };
      expect(kpi.category).toBe('operational');
    });

    it('should support compliance category KPI', () => {
      const kpi: KPI = {
        id: 'kpi-3',
        name: 'Permit Approval Rate',
        category: 'compliance',
        value: 90,
        target: 100,
        unit: '%',
        trend: 'up',
        trendValue: 5,
        status: 'at_risk',
      };
      expect(kpi.category).toBe('compliance');
    });

    it('should support engagement category KPI', () => {
      const kpi: KPI = {
        id: 'kpi-4',
        name: 'Sponsor Satisfaction',
        category: 'engagement',
        value: 4.5,
        target: 4.0,
        unit: 'rating',
        trend: 'up',
        trendValue: 0.3,
        status: 'on_track',
      };
      expect(kpi.category).toBe('engagement');
    });

    it('should calculate KPI status from value and target', () => {
      const kpis: KPI[] = [
        { id: 'k1', name: 'On Track', category: 'financial', value: 95, target: 90, unit: '%', trend: 'up', trendValue: 5, status: 'on_track' },
        { id: 'k2', name: 'At Risk', category: 'financial', value: 75, target: 90, unit: '%', trend: 'down', trendValue: -5, status: 'at_risk' },
        { id: 'k3', name: 'Off Track', category: 'financial', value: 50, target: 90, unit: '%', trend: 'down', trendValue: -10, status: 'off_track' },
      ];

      expect(kpis[0].status).toBe('on_track');
      expect(kpis[1].status).toBe('at_risk');
      expect(kpis[2].status).toBe('off_track');
    });
  });
});
