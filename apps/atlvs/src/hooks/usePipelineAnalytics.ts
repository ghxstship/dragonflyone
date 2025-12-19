import { useQuery } from '@tanstack/react-query';

export interface PipelineAnalytics {
  total_deals: number;
  total_value: number;
  weighted_value: number;
  average_deal_size: number;
  deals_by_stage: Array<{
    stage_id: string;
    stage_name: string;
    count: number;
    value: number;
    probability: number;
  }>;
  conversion_rates: Array<{
    from_stage: string;
    to_stage: string;
    rate: number;
  }>;
  velocity: {
    average_days_to_close: number;
    average_days_per_stage: Record<string, number>;
  };
  win_loss: {
    won: number;
    lost: number;
    win_rate: number;
  };
  trends: {
    deals_created_this_month: number;
    deals_created_last_month: number;
    deals_closed_this_month: number;
    deals_closed_last_month: number;
    value_this_month: number;
    value_last_month: number;
  };
}

export interface DealActivity {
  id: string;
  deal_id: string;
  activity_type: 'stage_change' | 'value_change' | 'note_added' | 'task_completed' | 'email_sent' | 'call_logged';
  description: string;
  old_value?: string;
  new_value?: string;
  user_id: string;
  user_name?: string;
  created_at: string;
}

async function fetchPipelineAnalytics(dateRange?: { from: string; to: string }): Promise<PipelineAnalytics> {
  const params = new URLSearchParams();
  if (dateRange?.from) {
    params.set('date_from', dateRange.from);
  }
  if (dateRange?.to) {
    params.set('date_to', dateRange.to);
  }

  const response = await fetch(`/api/pipeline/analytics?${params}`);
  if (!response.ok) {
    throw new Error('Failed to fetch pipeline analytics');
  }
  return response.json();
}

async function fetchDealActivities(dealId: string): Promise<{ activities: DealActivity[]; total: number }> {
  const response = await fetch(`/api/pipeline/deals/${dealId}/activities`);
  if (!response.ok) {
    throw new Error('Failed to fetch deal activities');
  }
  return response.json();
}

async function fetchRecentActivities(limit?: number): Promise<{ activities: DealActivity[]; total: number }> {
  const params = new URLSearchParams();
  if (limit) {
    params.set('limit', limit.toString());
  }

  const response = await fetch(`/api/pipeline/activities?${params}`);
  if (!response.ok) {
    throw new Error('Failed to fetch recent activities');
  }
  return response.json();
}

export function usePipelineAnalytics(dateRange?: { from: string; to: string }) {
  return useQuery({
    queryKey: ['pipeline-analytics', dateRange],
    queryFn: () => fetchPipelineAnalytics(dateRange),
  });
}

export function useDealActivities(dealId: string) {
  return useQuery({
    queryKey: ['deal-activities', dealId],
    queryFn: () => fetchDealActivities(dealId),
    enabled: !!dealId,
  });
}

export function useRecentPipelineActivities(limit?: number) {
  return useQuery({
    queryKey: ['pipeline-activities', limit],
    queryFn: () => fetchRecentActivities(limit),
  });
}
