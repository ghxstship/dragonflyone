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
        venueCountResult,
      ] = await Promise.all([
        supabase.from('finance_expenses').select('amount, status').eq('production_id', productionId || ''),
        // 3NF: legend_organizations + orgs_profile_sponsor
        supabase.from('legend_organizations').select('*, orgs_profile_sponsor!org_id(contract_value, amount_paid, sponsorship_status)').not('orgs_profile_sponsor', 'is', null),
        // 3NF: legend_organizations + orgs_profile_investor (if exists) - using empty array as fallback
        Promise.resolve({ data: [], error: null }),
        supabase.from('projects').select('status, priority'),
        supabase.from('permits').select('status, expiration_date'),
        supabase.from('docs_profile_contract').select('coverage_amount, status'),
        supabase.from('legend_places')
          .select('*, places_profile_venue!place_id(capacity, rental_cost)')
          .not('places_profile_venue', 'is', null)
          .eq('production_id', productionId || ''),
      ]);

      const expenses = expensesResult.data || [];
      const sponsors = sponsorsResult.data || [];
      const investors = investorsResult.data || [];
      const tasks = tasksResult.data || [];
      const permits = permitsResult.data || [];
      const insurance = insuranceResult.data || [];
      const venues = (venueCountResult.data || []).map(v => {
        const profile = (v.places_profile_venue as Record<string, unknown>[])?.[0] || {};
        return {
          capacity: profile.capacity as number || 0,
          rental_cost: profile.rental_cost as number || 0,
        };
      });

      const now = new Date();
      const thirtyDaysFromNow = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000);

      const totalSpent = expenses.reduce((sum, e) => sum + (e.amount || 0), 0);
      // 3NF: Extract sponsor profile data
      const sponsorRevenue = sponsors.reduce((sum, s) => {
        const profile = (s.orgs_profile_sponsor as Record<string, unknown>[])?.[0] || {};
        return sum + ((profile.contract_value as number) || 0);
      }, 0);
      const sponsorsPaid = sponsors.reduce((sum, s) => {
        const profile = (s.orgs_profile_sponsor as Record<string, unknown>[])?.[0] || {};
        return sum + ((profile.amount_paid as number) || 0);
      }, 0);
      const totalRaised = investors.filter(i => i.status === 'funded').reduce((sum, i) => sum + (i.investment_amount || 0), 0);
      const tasksCompleted = tasks.filter(t => t.status === 'completed').length;
      const permitsApproved = permits.filter(p => p.status === 'approved').length;
      const activeCoverage = insurance.filter(i => i.status === 'active').reduce((sum, i) => sum + (i.coverage_amount || 0), 0);

      // Calculate budget from production settings or use default
      const totalBudget = production?.budget || 1000000;
      const targetRaise = production?.target_raise || 500000;
      
      // Calculate timeline from production dates
      const eventDate = production?.event_date ? new Date(production.event_date) : null;
      const startDate = production?.start_date ? new Date(production.start_date) : null;
      const daysUntilEvent = eventDate ? Math.max(0, Math.ceil((eventDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24))) : 30;
      const daysInProduction = startDate ? Math.ceil((now.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24)) : 60;
      const productionProgress = tasksCompleted > 0 && tasks.length > 0 ? Math.round((tasksCompleted / tasks.length) * 100) : 0;

      return {
        // Financial
        totalBudget,
        totalSpent,
        budgetRemaining: totalBudget - totalSpent,
        budgetUtilization: Math.round((totalSpent / totalBudget) * 100),
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
        targetRaise,
        fundingProgress: Math.round((totalRaised / targetRaise) * 100),
        
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
        daysUntilEvent,
        daysInProduction,
        productionProgress,
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
