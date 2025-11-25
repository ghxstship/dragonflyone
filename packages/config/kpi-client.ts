/**
 * KPI Analytics Client
 * Functions for working with KPI data
 */

import type { TypedSupabaseClient } from './auth-helpers';
import type { KPIDataPoint } from './types/kpi-types';

/**
 * Record a new KPI data point
 */
export async function recordKPIDataPoint(
  supabase: TypedSupabaseClient,
  params: {
    kpi_code: string;
    kpi_name: string;
    value: number;
    unit: string;
    project_id?: string;
    event_id?: string;
    period_start?: string;
    period_end?: string;
    metadata?: Record<string, any>;
  }
) {
  const { data: orgData } = await (supabase as any)
    .from('user_organizations')
    .select('organization_id')
    .single();

  if (!orgData) throw new Error('Organization not found');

  const { data, error } = await (supabase as any).rpc('record_kpi_data_point', {
    p_organization_id: orgData.organization_id,
    p_kpi_code: params.kpi_code,
    p_kpi_name: params.kpi_name,
    p_value: params.value,
    p_unit: params.unit,
    p_project_id: params.project_id || null,
    p_event_id: params.event_id || null,
    p_period_start: params.period_start || null,
    p_period_end: params.period_end || null,
    p_metadata: params.metadata || {}
  });

  if (error) throw error;
  return data;
}

/**
 * Get KPI trend data
 */
export async function getKPITrend(
  supabase: TypedSupabaseClient,
  kpi_code: string,
  days: number = 30,
  project_id?: string
) {
  const { data: orgData } = await (supabase as any)
    .from('user_organizations')
    .select('organization_id')
    .single();

  if (!orgData) throw new Error('Organization not found');

  const { data, error } = await (supabase as any).rpc('get_kpi_trend', {
    p_organization_id: orgData.organization_id,
    p_kpi_code: kpi_code,
    p_days: days,
    p_project_id: project_id || null
  });

  if (error) throw error;
  return data;
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
) {
  let query = (supabase as any)
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
  return data as KPIDataPoint[];
}

/**
 * Get KPI summary statistics
 */
export async function getKPISummary(
  supabase: TypedSupabaseClient,
  kpi_code?: string
) {
  let query = (supabase as any)
    .from('analytics_kpi_summary')
    .select('*');

  if (kpi_code) {
    query = query.eq('kpi_code', kpi_code);
  }

  const { data, error } = await query;
  if (error) throw error;
  return data;
}

/**
 * Get KPI reports
 */
export async function getKPIReports(
  supabase: TypedSupabaseClient,
  category?: string,
  globalOnly?: boolean
) {
  let query = (supabase as any)
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
  return data;
}

/**
 * Create a custom KPI report
 */
export async function createKPIReport(
  supabase: TypedSupabaseClient,
  params: {
    name: string;
    description?: string;
    kpi_codes: string[];
    category?: string;
    filters?: Record<string, any>;
  }
) {
  const { data: orgData } = await (supabase as any)
    .from('user_organizations')
    .select('organization_id')
    .single();

  if (!orgData) throw new Error('Organization not found');

  const { data: userData } = await supabase.auth.getUser();
  if (!userData.user) throw new Error('User not authenticated');

  const { data, error } = await (supabase as any)
    .from('kpi_reports')
    .insert({
      organization_id: orgData.organization_id,
      name: params.name,
      description: params.description,
      kpi_codes: params.kpi_codes,
      category: params.category,
      filters: params.filters || {},
      created_by: userData.user.id
    })
    .select()
    .single();

  if (error) throw error;
  return data;
}
