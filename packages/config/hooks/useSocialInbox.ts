import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';

export interface SocialMessage {
  id: string;
  platform: 'Twitter' | 'Instagram' | 'Facebook' | 'TikTok';
  type: string;
  author: string;
  authorHandle: string;
  content: string;
  timestamp: string;
  sentiment: 'Positive' | 'Neutral' | 'Negative';
  status: 'New' | 'In Progress' | 'Resolved' | 'Escalated';
  priority: 'High' | 'Medium' | 'Low';
  created_at?: string;
  updated_at?: string;
}

const API_BASE = '/api/social/inbox';

async function fetchSocialMessages(): Promise<SocialMessage[]> {
  const response = await fetch(API_BASE);
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Failed to fetch social messages');
  }
  const { data } = await response.json();
  return data || [];
}

async function updateMessageStatus(id: string, status: string): Promise<SocialMessage> {
  const response = await fetch(`${API_BASE}/${id}/status`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ status }),
  });
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Failed to update message status');
  }
  return response.json();
}

async function replyToMessage(id: string, reply: string): Promise<SocialMessage> {
  const response = await fetch(`${API_BASE}/${id}/reply`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ reply }),
  });
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Failed to reply to message');
  }
  return response.json();
}

export function useSocialMessagesQuery() {
  return useQuery({
    queryKey: ['social-messages'],
    queryFn: fetchSocialMessages,
    staleTime: 30000,
  });
}

export function useUpdateMessageStatus() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, status }: { id: string; status: string }) => updateMessageStatus(id, status),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['social-messages'] });
    },
  });
}

export function useReplyToMessage() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, reply }: { id: string; reply: string }) => replyToMessage(id, reply),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['social-messages'] });
    },
  });
}

export function useSocialInbox() {
  const queryClient = useQueryClient();
  const query = useSocialMessagesQuery();
  const updateStatusMutation = useUpdateMessageStatus();
  const replyMutation = useReplyToMessage();

  const messages = query.data || [];
  const newCount = messages.filter(m => m.status === 'New').length;
  const escalatedCount = messages.filter(m => m.status === 'Escalated').length;
  const negativeCount = messages.filter(m => m.sentiment === 'Negative').length;

  return {
    messages,
    summary: {
      newCount,
      escalatedCount,
      negativeCount,
      totalMessages: messages.length,
    },
    isLoading: query.isLoading,
    error: query.error,
    refetch: query.refetch,
    updateStatus: updateStatusMutation.mutateAsync,
    reply: replyMutation.mutateAsync,
    invalidate: () => queryClient.invalidateQueries({ queryKey: ['social-messages'] }),
  };
}
