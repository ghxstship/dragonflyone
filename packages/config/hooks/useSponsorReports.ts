import { useQuery } from '@tanstack/react-query';

export interface SponsorReport {
  id: string;
  name: string;
  event: string;
  period: string;
  generated_at: string;
  impressions: number;
  engagements: number;
  roi: number;
  status: 'draft' | 'final';
  sponsor_id?: string;
  download_url?: string;
}

const API_BASE = '/api/sponsors/reports';

async function fetchSponsorReports(params?: {
  sponsor_id?: string;
  status?: string;
}): Promise<SponsorReport[]> {
  const searchParams = new URLSearchParams();
  if (params?.sponsor_id) searchParams.set('sponsor_id', params.sponsor_id);
  if (params?.status) searchParams.set('status', params.status);

  const url = `${API_BASE}${searchParams.toString() ? `?${searchParams.toString()}` : ''}`;
  const response = await fetch(url);

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Failed to fetch sponsor reports');
  }

  const { data } = await response.json();
  return data || [];
}

export function useSponsorReportsQuery(params?: { sponsor_id?: string; status?: string }) {
  return useQuery({
    queryKey: ['sponsor-reports', params],
    queryFn: () => fetchSponsorReports(params),
    staleTime: 60000,
  });
}

export function useSponsorReports(params?: { sponsor_id?: string; status?: string }) {
  const query = useSponsorReportsQuery(params);

  const reports = query.data || [];
  const totalImpressions = reports.reduce((sum, r) => sum + r.impressions, 0);
  const totalEngagements = reports.reduce((sum, r) => sum + r.engagements, 0);
  const avgRoi = reports.filter(r => r.roi > 0).length > 0
    ? reports.filter(r => r.roi > 0).reduce((sum, r) => sum + r.roi, 0) / reports.filter(r => r.roi > 0).length
    : 0;

  return {
    reports,
    summary: {
      totalReports: reports.length,
      totalImpressions,
      totalEngagements,
      avgRoi,
    },
    isLoading: query.isLoading,
    error: query.error,
    refetch: query.refetch,
  };
}
