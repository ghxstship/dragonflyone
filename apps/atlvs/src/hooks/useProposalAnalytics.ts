import { useQuery } from '@tanstack/react-query';

export interface ProposalViewEvent {
  id: string;
  proposal_id: string;
  viewed_at: string;
  duration_seconds: number;
  ip_address?: string;
  user_agent?: string;
  sections_viewed: string[];
}

export interface ProposalAnalytics {
  proposal_id: string;
  total_views: number;
  unique_views: number;
  average_view_duration: number;
  total_view_time: number;
  last_viewed_at?: string;
  views_by_day: Array<{
    date: string;
    views: number;
  }>;
  section_engagement: Array<{
    section: string;
    views: number;
    percentage: number;
  }>;
  device_breakdown: {
    desktop: number;
    mobile: number;
    tablet: number;
  };
  conversion_funnel: {
    sent: boolean;
    viewed: boolean;
    time_to_first_view_hours?: number;
    accepted: boolean;
    time_to_accept_hours?: number;
  };
}

async function fetchProposalAnalytics(proposalId: string): Promise<ProposalAnalytics> {
  const response = await fetch(`/api/proposals/${proposalId}/analytics`);
  if (!response.ok) {
    throw new Error('Failed to fetch proposal analytics');
  }
  return response.json();
}

async function fetchProposalViews(proposalId: string): Promise<{ views: ProposalViewEvent[]; total: number }> {
  const response = await fetch(`/api/proposals/${proposalId}/views`);
  if (!response.ok) {
    throw new Error('Failed to fetch proposal views');
  }
  return response.json();
}

export function useProposalAnalytics(proposalId: string) {
  return useQuery({
    queryKey: ['proposal-analytics', proposalId],
    queryFn: () => fetchProposalAnalytics(proposalId),
    enabled: !!proposalId,
  });
}

export function useProposalViews(proposalId: string) {
  return useQuery({
    queryKey: ['proposal-views', proposalId],
    queryFn: () => fetchProposalViews(proposalId),
    enabled: !!proposalId,
  });
}
