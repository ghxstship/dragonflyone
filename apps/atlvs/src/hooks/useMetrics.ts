'use client';

import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';

// =============================================================================
// PRODUCTION METRICS HOOKS
// Aggregate metrics and KPIs for production performance tracking
// Event-level roles: Executive Producer, Production Manager, Finance Director
// =============================================================================

export interface ProductionMetrics {
  // Financial
  totalBudget: number;
  totalSpent: number;
  budgetRemaining: number;
  budgetUtilization: number;
  revenueProjected: number;
  revenueActual: number;
  
  // Sponsorship
  totalSponsors: number;
  sponsorRevenue: number;
  sponsorsPaid: number;
  sponsorsOutstanding: number;
  
  // Investment
  totalInvestors: number;
  totalRaised: number;
  targetRaise: number;
  fundingProgress: number;
  
  // Operations
  totalTasks: number;
  tasksCompleted: number;
  taskCompletionRate: number;
  criticalTasks: number;
  
  // Compliance
  totalPermits: number;
  permitsApproved: number;
  permitsExpiringSoon: number;
  insuranceCoverage: number;
  
  // Venues
  totalVenues: number;
  totalCapacity: number;
  venuesCost: number;
  
  // Timeline
  daysUntilEvent: number;
  daysInProduction: number;
  productionProgress: number;
}

export interface KPI {
  id: string;
  name: string;
  category: 'financial' | 'operational' | 'compliance' | 'engagement';
  value: number;
  target: number;
  unit: string;
  trend: 'up' | 'down' | 'stable';
  trendValue: number;
  status: 'on_track' | 'at_risk' | 'off_track';
}

// Fetch production metrics
export function useProductionMetrics(productionId?: string) {
  return useQuery({
    queryKey: ['production_metrics', productionId],
    queryFn: async () => {
      // Fetch data from multiple tables
      const [
        expensesResult,
        sponsorsResult,
        investorsResult,
        tasksResult,
        permitsResult,
        insuranceResult,
        venuesResult,
      ] = await Promise.all([
        supabase.from('expenses').select('amount, status').eq('production_id', productionId || ''),
        supabase.from('sponsors').select('contract_value, amount_paid, status'),
        supabase.from('investors').select('investment_amount, status'),
        supabase.from('schedule_tasks').select('status, priority'),
        supabase.from('permits').select('status, expiration_date'),
        supabase.from('insurance_policies').select('coverage_amount, status'),
        supabase.from('venues').select('capacity, rental_cost, status'),
      ]);

      const expenses = expensesResult.data || [];
      const sponsors = sponsorsResult.data || [];
      const investors = investorsResult.data || [];
      const tasks = tasksResult.data || [];
      const permits = permitsResult.data || [];
      const insurance = insuranceResult.data || [];
      const venues = venuesResult.data || [];

      const now = new Date();
      const thirtyDaysFromNow = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000);

      const totalSpent = expenses.reduce((sum, e) => sum + (e.amount || 0), 0);
      const sponsorRevenue = sponsors.reduce((sum, s) => sum + (s.contract_value || 0), 0);
      const sponsorsPaid = sponsors.reduce((sum, s) => sum + (s.amount_paid || 0), 0);
      const totalRaised = investors.filter(i => i.status === 'funded').reduce((sum, i) => sum + (i.investment_amount || 0), 0);
      const tasksCompleted = tasks.filter(t => t.status === 'completed').length;
      const permitsApproved = permits.filter(p => p.status === 'approved').length;
      const activeCoverage = insurance.filter(i => i.status === 'active').reduce((sum, i) => sum + (i.coverage_amount || 0), 0);

      return {
        // Financial
        totalBudget: 1000000, // TODO: Get from production settings
        totalSpent,
        budgetRemaining: 1000000 - totalSpent,
        budgetUtilization: Math.round((totalSpent / 1000000) * 100),
        revenueProjected: sponsorRevenue + totalRaised,
        revenueActual: sponsorsPaid + totalRaised,
        
        // Sponsorship
        totalSponsors: sponsors.length,
        sponsorRevenue,
        sponsorsPaid,
        sponsorsOutstanding: sponsorRevenue - sponsorsPaid,
        
        // Investment
        totalInvestors: investors.length,
        totalRaised,
        targetRaise: 500000, // TODO: Get from investment rounds
        fundingProgress: Math.round((totalRaised / 500000) * 100),
        
        // Operations
        totalTasks: tasks.length,
        tasksCompleted,
        taskCompletionRate: tasks.length > 0 ? Math.round((tasksCompleted / tasks.length) * 100) : 0,
        criticalTasks: tasks.filter(t => t.priority === 'critical' && t.status !== 'completed').length,
        
        // Compliance
        totalPermits: permits.length,
        permitsApproved,
        permitsExpiringSoon: permits.filter(p => {
          if (!p.expiration_date) return false;
          const expDate = new Date(p.expiration_date);
          return expDate >= now && expDate <= thirtyDaysFromNow;
        }).length,
        insuranceCoverage: activeCoverage,
        
        // Venues
        totalVenues: venues.length,
        totalCapacity: venues.reduce((sum, v) => sum + (v.capacity || 0), 0),
        venuesCost: venues.reduce((sum, v) => sum + (v.rental_cost || 0), 0),
        
        // Timeline
        daysUntilEvent: 30, // TODO: Calculate from production dates
        daysInProduction: 60, // TODO: Calculate from production dates
        productionProgress: 65, // TODO: Calculate based on milestones
      } as ProductionMetrics;
    },
    enabled: !!productionId,
  });
}

// Fetch KPIs
export function useKPIs(productionId?: string) {
  const { data: metrics } = useProductionMetrics(productionId);
  
  return useQuery({
    queryKey: ['kpis', productionId, metrics],
    queryFn: async () => {
      if (!metrics) return [];
      
      const kpis: KPI[] = [
        {
          id: 'budget_utilization',
          name: 'Budget Utilization',
          category: 'financial',
          value: metrics.budgetUtilization,
          target: 100,
          unit: '%',
          trend: 'up',
          trendValue: 5,
          status: metrics.budgetUtilization <= 80 ? 'on_track' : metrics.budgetUtilization <= 95 ? 'at_risk' : 'off_track',
        },
        {
          id: 'sponsor_collection',
          name: 'Sponsor Collection Rate',
          category: 'financial',
          value: metrics.sponsorRevenue > 0 ? Math.round((metrics.sponsorsPaid / metrics.sponsorRevenue) * 100) : 0,
          target: 100,
          unit: '%',
          trend: 'up',
          trendValue: 10,
          status: metrics.sponsorsPaid >= metrics.sponsorRevenue * 0.8 ? 'on_track' : metrics.sponsorsPaid >= metrics.sponsorRevenue * 0.5 ? 'at_risk' : 'off_track',
        },
        {
          id: 'funding_progress',
          name: 'Funding Progress',
          category: 'financial',
          value: metrics.fundingProgress,
          target: 100,
          unit: '%',
          trend: 'up',
          trendValue: 15,
          status: metrics.fundingProgress >= 80 ? 'on_track' : metrics.fundingProgress >= 50 ? 'at_risk' : 'off_track',
        },
        {
          id: 'task_completion',
          name: 'Task Completion Rate',
          category: 'operational',
          value: metrics.taskCompletionRate,
          target: 100,
          unit: '%',
          trend: 'up',
          trendValue: 8,
          status: metrics.taskCompletionRate >= 70 ? 'on_track' : metrics.taskCompletionRate >= 40 ? 'at_risk' : 'off_track',
        },
        {
          id: 'permit_approval',
          name: 'Permit Approval Rate',
          category: 'compliance',
          value: metrics.totalPermits > 0 ? Math.round((metrics.permitsApproved / metrics.totalPermits) * 100) : 0,
          target: 100,
          unit: '%',
          trend: 'stable',
          trendValue: 0,
          status: metrics.permitsApproved === metrics.totalPermits ? 'on_track' : metrics.permitsApproved >= metrics.totalPermits * 0.8 ? 'at_risk' : 'off_track',
        },
        {
          id: 'production_progress',
          name: 'Production Progress',
          category: 'operational',
          value: metrics.productionProgress,
          target: 100,
          unit: '%',
          trend: 'up',
          trendValue: 5,
          status: metrics.productionProgress >= 60 ? 'on_track' : metrics.productionProgress >= 40 ? 'at_risk' : 'off_track',
        },
      ];
      
      return kpis;
    },
    enabled: !!metrics,
  });
}
