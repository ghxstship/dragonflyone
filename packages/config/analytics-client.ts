import type { TypedSupabaseClient } from './auth-helpers';

export async function getRevenueByMonth(supabase: TypedSupabaseClient, orgId: string, months = 12) {
  const { data, error } = await supabase.rpc('rpc_revenue_by_month', { p_org_id: orgId, p_months: months });
  if (error) throw error;
  return data;
}

export async function getTopClientsByRevenue(supabase: TypedSupabaseClient, orgId: string, limit = 10) {
  const { data, error } = await supabase.rpc('rpc_top_clients_by_revenue', { p_org_id: orgId, p_limit: limit });
  if (error) throw error;
  return data;
}

export async function getEmployeeProductivity(supabase: TypedSupabaseClient, orgId: string, startDate: string, endDate: string) {
  const { data, error } = await supabase.rpc('rpc_employee_productivity', { p_org_id: orgId, p_start_date: startDate, p_end_date: endDate });
  if (error) throw error;
  return data;
}

export async function getDealPipelineAnalysis(supabase: TypedSupabaseClient, orgId: string) {
  const { data, error } = await supabase.rpc('rpc_deal_pipeline_analysis', { p_org_id: orgId });
  if (error) throw error;
  return data;
}

export async function getAssetROIAnalysis(supabase: TypedSupabaseClient, orgId: string) {
  const { data, error } = await supabase.rpc('rpc_asset_roi_analysis', { p_org_id: orgId });
  if (error) throw error;
  return data;
}

export async function getExecutiveDashboard(supabase: TypedSupabaseClient, orgId: string) {
  const { data, error } = await supabase.from('mv_executive_dashboard').select('*').eq('organization_id', orgId).single();
  if (error) throw error;
  return data;
}

export async function getProjectFinancials(supabase: TypedSupabaseClient, projectId: string) {
  const { data, error } = await supabase.from('mv_project_financials').select('*').eq('project_id', projectId).single();
  if (error) throw error;
  return data;
}

export async function getAssetUtilization(supabase: TypedSupabaseClient, orgId: string) {
  const { data, error } = await supabase.from('mv_asset_utilization').select('*').eq('organization_id', orgId);
  if (error) throw error;
  return data;
}

// KPI Analytics Functions
export { 
  recordKPIDataPoint,
  getKPITrend,
  getKPIDataPoints,
  getKPISummary,
  getKPIReports,
  createKPIReport
} from './kpi-client';
