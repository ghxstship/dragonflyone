/**
 * KPI Analytics Client
 * Functions for working with KPI data in Supabase
 */

import type { SupabaseClient } from '@supabase/supabase-js';
import type { Database, Json } from './supabase-types';
import type { KPIDataPoint } from './types/kpi-types';

type TypedSupabaseClient = SupabaseClient<Database>;

// Type aliases for KPI tables
type KPIDataPointRow = Database['public']['Tables']['kpi_data_points']['Row'];
type KPIReportRow = Database['public']['Tables']['kpi_reports']['Row'];
type KPIReportInsert = Database['public']['Tables']['kpi_reports']['Insert'];
type KPITargetRow = Database['public']['Tables']['kpi_targets']['Row'];

/**
 * Record a new KPI data point
 */
export async function recordKPIDataPoint(
  supabase: TypedSupabaseClient,
  organizationId: string,
  params: {
    kpi_code: string;
    kpi_name: string;
    value: number;
    unit: string;
    project_id?: string;
    event_id?: string;
    period_start?: string;
    period_end?: string;
    metadata?: Record<string, unknown>;
  }
): Promise<string> {
  const { data, error } = await supabase.rpc('record_kpi_data_point', {
    p_organization_id: organizationId,
    p_kpi_code: params.kpi_code,
    p_kpi_name: params.kpi_name,
    p_value: params.value,
    p_unit: params.unit,
    p_project_id: params.project_id || null,
    p_event_id: params.event_id || null,
    p_period_start: params.period_start || null,
    p_period_end: params.period_end || null,
    p_metadata: (params.metadata || {}) as Json
  });

  if (error) throw error;
  return data as string;
}

/**
 * Get KPI trend data
 */
export async function getKPITrend(
  supabase: TypedSupabaseClient,
  organizationId: string,
  kpi_code: string,
  days: number = 30,
  project_id?: string
): Promise<KPITrendData[]> {
  const { data, error } = await supabase.rpc('get_kpi_trend', {
    p_organization_id: organizationId,
    p_kpi_code: kpi_code,
    p_days: days,
    p_project_id: project_id || null
  });

  if (error) throw error;
  return (data || []) as KPITrendData[];
}

/**
 * KPI Trend data point
 */
export interface KPITrendData {
  date: string;
  value: number;
  target_value: number | null;
  warning_threshold: number | null;
  critical_threshold: number | null;
}

/**
 * Get KPI data points with filtering
 */
export async function getKPIDataPoints(
  supabase: TypedSupabaseClient,
  filters?: {
    kpi_code?: string;
    project_id?: string;
    event_id?: string;
    days?: number;
    limit?: number;
  }
): Promise<KPIDataPointRow[]> {
  let query = supabase
    .from('kpi_data_points')
    .select('*')
    .order('calculated_at', { ascending: false });

  if (filters?.kpi_code) {
    query = query.eq('kpi_code', filters.kpi_code);
  }

  if (filters?.project_id) {
    query = query.eq('project_id', filters.project_id);
  }

  if (filters?.event_id) {
    query = query.eq('event_id', filters.event_id);
  }

  if (filters?.days) {
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - filters.days);
    query = query.gte('calculated_at', startDate.toISOString());
  }

  if (filters?.limit) {
    query = query.limit(filters.limit);
  }

  const { data, error } = await query;
  if (error) throw error;
  return data || [];
}

/**
 * KPI Summary statistics
 */
export interface KPISummary {
  organization_id: string;
  kpi_code: string;
  kpi_name: string;
  unit: string;
  data_point_count: number;
  avg_value: number;
  min_value: number;
  max_value: number;
  stddev_value: number | null;
  last_calculated: string;
  target_value: number | null;
  warning_threshold: number | null;
  critical_threshold: number | null;
}

/**
 * Get KPI summary statistics
 */
export async function getKPISummary(
  supabase: TypedSupabaseClient,
  kpi_code?: string
): Promise<KPISummary[]> {
  // analytics_kpi_summary is a view, query it directly
  const { data, error } = await supabase
    .from('analytics_kpi_summary' as 'kpi_data_points') // View not in types, use workaround
    .select('*');

  if (error) throw error;
  
  const results = (data || []) as unknown as KPISummary[];
  if (kpi_code) {
    return results.filter(r => r.kpi_code === kpi_code);
  }
  return results;
}

/**
 * Get KPI reports
 */
export async function getKPIReports(
  supabase: TypedSupabaseClient,
  category?: string,
  globalOnly?: boolean
): Promise<KPIReportRow[]> {
  let query = supabase
    .from('kpi_reports')
    .select('*')
    .order('name');

  if (category) {
    query = query.eq('category', category);
  }

  if (globalOnly) {
    query = query.eq('is_global', true);
  }

  const { data, error } = await query;
  if (error) throw error;
  return data || [];
}

/**
 * Create a custom KPI report
 */
export async function createKPIReport(
  supabase: TypedSupabaseClient,
  organizationId: string,
  params: {
    name: string;
    description?: string;
    kpi_codes: string[];
    category?: string;
    filters?: Record<string, unknown>;
  }
): Promise<KPIReportRow> {
  const { data: userData } = await supabase.auth.getUser();
  if (!userData.user) throw new Error('User not authenticated');

  const insertData: KPIReportInsert = {
    organization_id: organizationId,
    name: params.name,
    description: params.description,
    kpi_codes: params.kpi_codes,
    category: params.category,
    filters: (params.filters || {}) as Json,
    created_by: userData.user.id
  };

  const { data, error } = await supabase
    .from('kpi_reports')
    .insert(insertData)
    .select()
    .single();

  if (error) throw error;
  return data;
}

/**
 * Get KPI targets for an organization
 */
export async function getKPITargets(
  supabase: TypedSupabaseClient,
  kpi_code?: string
): Promise<KPITargetRow[]> {
  let query = supabase
    .from('kpi_targets')
    .select('*')
    .order('kpi_code');

  if (kpi_code) {
    query = query.eq('kpi_code', kpi_code);
  }

  const { data, error } = await query;
  if (error) throw error;
  return data || [];
}

/**
 * Export type for external use
 */
export type { TypedSupabaseClient, KPIDataPointRow, KPIReportRow, KPITargetRow };
