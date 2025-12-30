'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';

// =============================================================================
// REPORTS HOOKS
// Manage daily and wrap reports for productions
// Event-level roles: Production Manager, Department Heads, Executive Producer
// =============================================================================

export interface DailyReport {
  id: string;
  production_id: string;
  show_id?: string;
  report_date: string;
  submitted_by: string;
  submitted_at: string;
  status: 'draft' | 'submitted' | 'reviewed' | 'approved';
  weather_conditions?: string;
  attendance?: number;
  revenue?: number;
  highlights?: string;
  challenges?: string;
  incidents_summary?: string;
  department_notes?: Record<string, string>;
  action_items?: string[];
  photos?: string[];
  reviewed_by?: string;
  reviewed_at?: string;
  notes?: string;
  created_at: string;
  updated_at: string;
  // Joined data
  show?: { id: string; title: string; show_date: string };
  submitter?: { id: string; first_name: string; last_name: string };
  reviewer?: { id: string; first_name: string; last_name: string };
}

export interface WrapReport {
  id: string;
  production_id: string;
  title: string;
  submitted_by: string;
  submitted_at: string;
  status: 'draft' | 'submitted' | 'reviewed' | 'approved';
  // Summary
  total_shows: number;
  total_attendance: number;
  total_revenue: number;
  total_expenses: number;
  net_profit?: number;
  // Performance
  avg_attendance?: number;
  peak_attendance?: number;
  capacity_utilization?: number;
  // Operations
  total_incidents: number;
  incident_summary?: string;
  safety_notes?: string;
  // Lessons Learned
  successes?: string[];
  challenges?: string[];
  recommendations?: string[];
  // Attachments
  financial_summary_url?: string;
  photos?: string[];
  documents?: string[];
  reviewed_by?: string;
  reviewed_at?: string;
  notes?: string;
  created_at: string;
  updated_at: string;
  // Joined data
  production?: { id: string; title: string };
  submitter?: { id: string; first_name: string; last_name: string };
  reviewer?: { id: string; first_name: string; last_name: string };
}

interface DailyReportFilters {
  productionId?: string;
  showId?: string;
  status?: string;
  dateFrom?: string;
  dateTo?: string;
}

interface WrapReportFilters {
  productionId?: string;
  status?: string;
}

// Fetch daily reports
export function useDailyReports(filters?: DailyReportFilters) {
  return useQuery({
    queryKey: ['daily_reports', filters],
    queryFn: async () => {
      let query = supabase
        .from('legend_documents')
        .select(`
          *,
          show:shows(id, title, show_date),
          submitter:contacts!submitted_by(id, first_name, last_name),
          reviewer:contacts!reviewed_by(id, first_name, last_name)
        `)
        .order('report_date', { ascending: false });

      if (filters?.productionId) {
        query = query.eq('production_id', filters.productionId);
      }
      if (filters?.showId) {
        query = query.eq('show_id', filters.showId);
      }
      if (filters?.status) {
        query = query.eq('status', filters.status);
      }
      if (filters?.dateFrom) {
        query = query.gte('report_date', filters.dateFrom);
      }
      if (filters?.dateTo) {
        query = query.lte('report_date', filters.dateTo);
      }

      const { data, error } = await query;
      if (error) throw error;
      return data as unknown as DailyReport[];
    },
  });
}

// Fetch single daily report
export function useDailyReport(id: string) {
  return useQuery({
    queryKey: ['daily_reports', id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('legend_documents')
        .select(`
          *,
          show:shows(id, title, show_date),
          submitter:contacts!submitted_by(id, first_name, last_name),
          reviewer:contacts!reviewed_by(id, first_name, last_name)
        `)
        .eq('id', id)
        .single();

      if (error) throw error;
      return data as unknown as DailyReport;
    },
    enabled: !!id,
  });
}

// Fetch wrap reports
export function useWrapReports(filters?: WrapReportFilters) {
  return useQuery({
    queryKey: ['wrap_reports', filters],
    queryFn: async () => {
      let query = supabase
        .from('legend_documents')
        .select(`
          *,
          production:productions(id, title),
          submitter:contacts!submitted_by(id, first_name, last_name),
          reviewer:contacts!reviewed_by(id, first_name, last_name)
        `)
        .order('created_at', { ascending: false });

      if (filters?.productionId) {
        query = query.eq('production_id', filters.productionId);
      }
      if (filters?.status) {
        query = query.eq('status', filters.status);
      }

      const { data, error } = await query;
      if (error) throw error;
      return data as unknown as WrapReport[];
    },
  });
}

// Fetch single wrap report
export function useWrapReport(id: string) {
  return useQuery({
    queryKey: ['wrap_reports', id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('legend_documents')
        .select(`
          *,
          production:productions(id, title),
          submitter:contacts!submitted_by(id, first_name, last_name),
          reviewer:contacts!reviewed_by(id, first_name, last_name)
        `)
        .eq('id', id)
        .single();

      if (error) throw error;
      return data as unknown as WrapReport;
    },
    enabled: !!id,
  });
}

// Create daily report
export function useCreateDailyReport() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (report: Omit<DailyReport, 'id' | 'created_at' | 'updated_at' | 'show' | 'submitter' | 'reviewer'>) => {
      const { data, error } = await supabase
        .from('legend_documents')
        .insert(report)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['daily_reports'] });
    },
  });
}

// Update daily report
export function useUpdateDailyReport() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, ...updates }: Partial<DailyReport> & { id: string }) => {
      const { data, error } = await supabase
        .from('legend_documents')
        .update(updates)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['daily_reports'] });
      queryClient.invalidateQueries({ queryKey: ['daily_reports', variables.id] });
    },
  });
}

// Submit daily report
export function useSubmitDailyReport() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const { data, error } = await supabase
        .from('legend_documents')
        .update({
          status: 'submitted',
          submitted_at: new Date().toISOString(),
        })
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: (_, id) => {
      queryClient.invalidateQueries({ queryKey: ['daily_reports'] });
      queryClient.invalidateQueries({ queryKey: ['daily_reports', id] });
    },
  });
}

// Approve daily report
export function useApproveDailyReport() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, reviewerId }: { id: string; reviewerId: string }) => {
      const { data, error } = await supabase
        .from('legend_documents')
        .update({
          status: 'approved',
          reviewed_by: reviewerId,
          reviewed_at: new Date().toISOString(),
        })
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['daily_reports'] });
      queryClient.invalidateQueries({ queryKey: ['daily_reports', variables.id] });
    },
  });
}

// Create wrap report
export function useCreateWrapReport() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (report: Omit<WrapReport, 'id' | 'created_at' | 'updated_at' | 'production' | 'submitter' | 'reviewer'>) => {
      const { data, error } = await supabase
        .from('legend_documents')
        .insert(report)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['wrap_reports'] });
    },
  });
}

// Update wrap report
export function useUpdateWrapReport() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, ...updates }: Partial<WrapReport> & { id: string }) => {
      const { data, error } = await supabase
        .from('legend_documents')
        .update(updates)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['wrap_reports'] });
      queryClient.invalidateQueries({ queryKey: ['wrap_reports', variables.id] });
    },
  });
}

// Get report statistics
export function useReportStats(productionId?: string) {
  return useQuery({
    queryKey: ['reports', 'stats', productionId],
    queryFn: async () => {
      let dailyQuery = supabase.from('legend_documents').select('status, attendance, revenue');
      let wrapQuery = supabase.from('legend_documents').select('status');
      
      if (productionId) {
        dailyQuery = dailyQuery.eq('production_id', productionId);
        wrapQuery = wrapQuery.eq('production_id', productionId);
      }

      const [dailyResult, wrapResult] = await Promise.all([
        dailyQuery,
        wrapQuery,
      ]);

      if (dailyResult.error) throw dailyResult.error;
      if (wrapResult.error) throw wrapResult.error;

      const dailyReports = dailyResult.data || [];
      const wrapReports = wrapResult.data || [];

      return {
        totalDaily: dailyReports.length,
        dailyPending: dailyReports.filter(r => r.status === 'submitted').length,
        dailyApproved: dailyReports.filter(r => r.status === 'approved').length,
        totalWrap: wrapReports.length,
        wrapPending: wrapReports.filter(r => r.status === 'submitted').length,
        wrapApproved: wrapReports.filter(r => r.status === 'approved').length,
        totalAttendance: dailyReports.reduce((sum, r) => sum + (r.attendance || 0), 0),
        totalRevenue: dailyReports.reduce((sum, r) => sum + (r.revenue || 0), 0),
      };
    },
  });
}
