import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';

export interface CrmEmailThread {
  id: string;
  from: string;
  to: string;
  subject: string;
  preview: string;
  date: string;
  status: 'Unread' | 'Read' | 'Replied';
  linkedContact?: string;
  linkedDeal?: string;
  attachments?: number;
  created_at?: string;
  updated_at?: string;
}

const API_BASE = '/api/emails';

async function fetchEmails(params?: { status?: string }): Promise<CrmEmailThread[]> {
  const searchParams = new URLSearchParams();
  if (params?.status) searchParams.set('status', params.status);

  const url = `${API_BASE}${searchParams.toString() ? `?${searchParams.toString()}` : ''}`;
  const response = await fetch(url);

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Failed to fetch emails');
  }

  const { data } = await response.json();
  return data || [];
}

async function deleteEmails(ids: string[]): Promise<void> {
  const response = await fetch(`${API_BASE}/bulk`, {
    method: 'DELETE',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ ids }),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Failed to delete emails');
  }
}

async function archiveEmails(ids: string[]): Promise<void> {
  const response = await fetch(`${API_BASE}/bulk-archive`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ ids }),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Failed to archive emails');
  }
}

export function useCrmEmailsQuery(params?: { status?: string }) {
  return useQuery({
    queryKey: ['crm-emails', params],
    queryFn: () => fetchEmails(params),
    staleTime: 60000,
  });
}

export function useDeleteCrmEmails() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: deleteEmails,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['crm-emails'] }),
  });
}

export function useArchiveCrmEmails() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: archiveEmails,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['crm-emails'] }),
  });
}

export function useCrmEmails(params?: { status?: string }) {
  const query = useCrmEmailsQuery(params);
  const deleteMutation = useDeleteCrmEmails();
  const archiveMutation = useArchiveCrmEmails();

  const emails = query.data || [];

  return {
    emails,
    summary: {
      total: emails.length,
      unread: emails.filter(e => e.status === 'Unread').length,
      linked: emails.filter(e => e.linkedContact || e.linkedDeal).length,
    },
    isLoading: query.isLoading,
    error: query.error,
    refetch: query.refetch,
    deleteEmails: deleteMutation.mutate,
    deleteEmailsAsync: deleteMutation.mutateAsync,
    archiveEmails: archiveMutation.mutate,
    archiveEmailsAsync: archiveMutation.mutateAsync,
    isDeleting: deleteMutation.isPending,
    isArchiving: archiveMutation.isPending,
  };
}
