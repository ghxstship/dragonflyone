import type { TypedSupabaseClient } from './auth-helpers';

export async function createDealWithContact(
  supabase: TypedSupabaseClient,
  orgId: string,
  contact: {
    company?: string;
    first_name: string;
    last_name: string;
    email: string;
    phone?: string;
    metadata?: Record<string, unknown>;
  },
  deal: {
    title: string;
    status?: string;
    value?: number;
    expected_close_date?: string;
    probability?: number;
    notes?: string;
  }
) {
  const { data, error } = await (supabase as any).rpc('rpc_create_deal_with_contact', {
    p_org_id: orgId,
    p_contact: contact,
    p_deal: deal,
  });
  if (error) throw error;
  return data;
}

export async function createProjectFromDeal(
  supabase: TypedSupabaseClient,
  dealId: string,
  projectCode: string,
  projectName: string,
  budget?: number,
  startDate?: string
) {
  const { data, error } = await (supabase as any).rpc('rpc_create_project_from_deal', {
    p_deal_id: dealId,
    p_project_code: projectCode,
    p_project_name: projectName,
    p_budget: budget,
    p_start_date: startDate,
  });
  if (error) throw error;
  return data;
}

export async function checkAssetAvailability(
  supabase: TypedSupabaseClient,
  assetIds: string[],
  startDate: string,
  endDate: string
) {
  const { data, error } = await (supabase as any).rpc('rpc_check_asset_availability', {
    p_asset_ids: assetIds,
    p_start_date: startDate,
    p_end_date: endDate,
  });
  if (error) throw error;
  return data;
}

export async function assignAssetsToProject(
  supabase: TypedSupabaseClient,
  projectId: string,
  assetIds: string[]
) {
  const { data, error } = await (supabase as any).rpc('rpc_assign_assets_to_project', {
    p_project_id: projectId,
    p_asset_ids: assetIds,
  });
  if (error) throw error;
  return data;
}

export async function getProjectFinancialSummary(
  supabase: TypedSupabaseClient,
  projectId: string
) {
  const { data, error } = await (supabase as any).rpc('rpc_project_financial_summary', {
    p_project_id: projectId,
  });
  if (error) throw error;
  return data;
}

export async function getWorkforceUtilization(
  supabase: TypedSupabaseClient,
  orgId: string,
  startDate: string,
  endDate: string
) {
  const { data, error } = await (supabase as any).rpc('rpc_workforce_utilization', {
    p_org_id: orgId,
    p_start_date: startDate,
    p_end_date: endDate,
  });
  if (error) throw error;
  return data;
}

export async function getDashboardMetrics(
  supabase: TypedSupabaseClient,
  orgId: string
) {
  const { data, error } = await (supabase as any).rpc('rpc_dashboard_metrics', {
    p_org_id: orgId,
  });
  if (error) throw error;
  return data;
}

export async function batchUpdateDealStatus(
  supabase: TypedSupabaseClient,
  dealIds: string[],
  status: string
) {
  const { data, error } = await (supabase as any).rpc('rpc_batch_update_deal_status', {
    p_deal_ids: dealIds,
    p_status: status,
  });
  if (error) throw error;
  return data;
}

export async function getProjectTimeline(
  supabase: TypedSupabaseClient,
  projectId: string
) {
  const { data, error } = await (supabase as any).rpc('rpc_project_timeline', {
    p_project_id: projectId,
  });
  if (error) throw error;
  return data;
}

export async function searchContacts(
  supabase: TypedSupabaseClient,
  orgId: string,
  query?: string,
  limit = 50
) {
  const { data, error } = await (supabase as any).rpc('rpc_search_contacts', {
    p_org_id: orgId,
    p_query: query,
    p_limit: limit,
  });
  if (error) throw error;
  return data;
}

export async function getAssetCalendar(
  supabase: TypedSupabaseClient,
  orgId: string,
  startDate: string,
  endDate: string,
  category?: string
) {
  const { data, error } = await (supabase as any).rpc('rpc_asset_calendar', {
    p_org_id: orgId,
    p_start_date: startDate,
    p_end_date: endDate,
    p_category: category,
  });
  if (error) throw error;
  return data;
}

export async function getWorkforceCapacity(
  supabase: TypedSupabaseClient,
  orgId: string,
  startDate: string,
  endDate: string
) {
  const { data, error } = await (supabase as any).rpc('rpc_workforce_capacity', {
    p_org_id: orgId,
    p_start_date: startDate,
    p_end_date: endDate,
  });
  if (error) throw error;
  return data;
}
