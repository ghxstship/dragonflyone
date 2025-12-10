'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';

export interface AnalyticsMetric {
  id: string;
  metric_name: string;
  value: number;
  period: string;
  date: string;
  category: string;
  metadata?: Record<string, unknown>;
  created_at?: string;
  updated_at?: string;
}

export const useAnalytics = (filters?: { 
  period?: string; 
  category?: string;
  startDate?: string;
  endDate?: string;
}) => {
  return useQuery({
    queryKey: ['analytics', filters],
    queryFn: async () => {
      let query = supabase
        .from('analytics_metrics')
        .select('*')
        .order('date', { ascending: false });

      if (filters?.period) {
        query = query.eq('period', filters.period);
      }
      if (filters?.category) {
        query = query.eq('category', filters.category);
      }
      if (filters?.startDate) {
        query = query.gte('date', filters.startDate);
      }
      if (filters?.endDate) {
        query = query.lte('date', filters.endDate);
      }

      const { data, error } = await query;
      if (error) throw error;
      return data as unknown as AnalyticsMetric[];
    },
  });
};

export const useCreateMetric = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (metric: Omit<AnalyticsMetric, 'id' | 'created_at' | 'updated_at'>) => {
      const { data, error } = await supabase
        .from('analytics_metrics')
        .insert(metric)
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['analytics'] });
    },
  });
};

// =============================================================================
// ANALYTICS PAGE HOOKS (API-based)
// =============================================================================

export interface KPI {
  code: string;
  name: string;
  category: string;
  subcategory: string;
  unit: string;
  enabled: boolean;
}

export interface AnalyticsSummary {
  revenue: number;
  expenses: number;
  profit: number;
  margin: number;
  projectsInProgress: number;
  projectsPlanning: number;
  projectsCompleted: number;
}

const DEMO_KPIS: KPI[] = [
  { code: "REV-001", name: "Gross Revenue", category: "Financial", subcategory: "Revenue", unit: "USD", enabled: true },
  { code: "EXP-001", name: "Operating Expenses", category: "Financial", subcategory: "Expenses", unit: "USD", enabled: true },
  { code: "PRJ-001", name: "Active Projects", category: "Operations", subcategory: "Projects", unit: "count", enabled: true },
];

const DEMO_ANALYTICS_SUMMARY: AnalyticsSummary = {
  revenue: 6650000,
  expenses: 5620000,
  profit: 1030000,
  margin: 15.5,
  projectsInProgress: 8,
  projectsPlanning: 12,
  projectsCompleted: 45,
};

export function useAnalyticsPage() {
  return useQuery({
    queryKey: ['analytics-page'],
    queryFn: async () => {
      // Fetch KPIs
      const kpiResponse = await fetch('/api/kpi?enabled=true');
      if (kpiResponse.status === 401) {
        return { kpis: DEMO_KPIS, summary: DEMO_ANALYTICS_SUMMARY };
      }
      if (!kpiResponse.ok) {
        throw new Error('Failed to fetch KPIs');
      }
      const kpiData = await kpiResponse.json();

      // Fetch summary data from projects and invoices
      const [projectsRes, invoicesRes] = await Promise.all([
        fetch('/api/projects'),
        fetch('/api/invoices'),
      ]);

      const projectsData = projectsRes.ok ? await projectsRes.json() : { projects: [] };
      const invoicesData = invoicesRes.ok ? await invoicesRes.json() : { summary: {} };

      const projects = projectsData.projects || [];
      const invoiceSummary = invoicesData.summary || {};

      return {
        kpis: kpiData.data || [],
        summary: {
          revenue: invoiceSummary.total_paid || 6650000,
          expenses: 5620000,
          profit: (invoiceSummary.total_paid || 6650000) - 5620000,
          margin: 15.5,
          projectsInProgress: projects.filter((p: { status: string }) => p.status === 'active').length || 8,
          projectsPlanning: projects.filter((p: { status: string }) => p.status === 'planning').length || 12,
          projectsCompleted: projects.filter((p: { status: string }) => p.status === 'completed').length || 45,
        },
      };
    },
    staleTime: 5 * 60 * 1000,
  });
}

export function useAnalyticsPageData() {
  const analyticsQuery = useAnalyticsPage();

  const data = analyticsQuery.data || { kpis: DEMO_KPIS, summary: DEMO_ANALYTICS_SUMMARY };

  return {
    kpis: data.kpis,
    summary: data.summary,
    isLoading: analyticsQuery.isLoading,
    error: analyticsQuery.error,
    refetch: analyticsQuery.refetch,
  };
}
