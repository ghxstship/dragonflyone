import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';

export interface InvestorUpdate {
  id: string;
  title: string;
  type: 'quarterly' | 'annual' | 'announcement' | 'document';
  date: string;
  summary: string;
  content?: string;
  is_read: boolean;
  has_attachment: boolean;
  attachment_url?: string;
  created_at: string;
  updated_at?: string;
}

const API_BASE = '/api/investor-updates';

async function fetchInvestorUpdates(params?: {
  type?: string;
  is_read?: boolean;
}): Promise<InvestorUpdate[]> {
  const searchParams = new URLSearchParams();
  if (params?.type) searchParams.set('type', params.type);
  if (params?.is_read !== undefined) searchParams.set('is_read', String(params.is_read));

  const url = `${API_BASE}${searchParams.toString() ? `?${searchParams.toString()}` : ''}`;
  const response = await fetch(url);

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Failed to fetch investor updates');
  }

  const { data } = await response.json();
  return data || [];
}

async function markUpdateAsRead(id: string): Promise<InvestorUpdate> {
  const response = await fetch(`${API_BASE}/${id}/read`, {
    method: 'POST',
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Failed to mark update as read');
  }

  const { data } = await response.json();
  return data;
}

export function useInvestorUpdatesQuery(params?: { type?: string; is_read?: boolean }) {
  return useQuery({
    queryKey: ['investor-updates', params],
    queryFn: () => fetchInvestorUpdates(params),
    staleTime: 60000,
  });
}

export function useMarkUpdateAsRead() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: markUpdateAsRead,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['investor-updates'] }),
  });
}

export function useInvestorUpdates(params?: { type?: string; is_read?: boolean }) {
  const query = useInvestorUpdatesQuery(params);
  const markReadMutation = useMarkUpdateAsRead();

  return {
    updates: query.data || [],
    isLoading: query.isLoading,
    error: query.error,
    refetch: query.refetch,
    markAsRead: markReadMutation.mutate,
    markAsReadAsync: markReadMutation.mutateAsync,
    isMarkingRead: markReadMutation.isPending,
  };
}
