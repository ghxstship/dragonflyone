import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';

export interface PortalMessage {
  id: string;
  portal_id: string;
  sender_type: 'client' | 'staff';
  sender_id: string;
  sender_name: string;
  subject?: string;
  message: string;
  attachments: Array<{
    name: string;
    url: string;
    type: string;
    size: number;
  }>;
  read_at?: string;
  replied_at?: string;
  is_important: boolean;
  related_to?: {
    type: 'booking' | 'invoice' | 'contract' | 'proposal';
    id: string;
    name: string;
  };
  created_at: string;
}

export interface MessageThread {
  id: string;
  subject: string;
  participants: Array<{
    id: string;
    name: string;
    type: 'client' | 'staff';
  }>;
  messages: PortalMessage[];
  unread_count: number;
  last_message_at: string;
}

export interface SendMessageInput {
  portal_id: string;
  subject?: string;
  message: string;
  attachments?: Array<{ name: string; url: string; type: string; size: number }>;
  is_important?: boolean;
  related_to?: PortalMessage['related_to'];
  reply_to_id?: string;
}

async function fetchPortalMessages(portalId: string): Promise<{
  threads: MessageThread[];
  unread_total: number;
}> {
  const response = await fetch(`/api/client-portal/${portalId}/messages`);
  if (!response.ok) {
    throw new Error('Failed to fetch portal messages');
  }
  return response.json();
}

async function fetchMessageThread(threadId: string): Promise<MessageThread> {
  const response = await fetch(`/api/client-portal/messages/${threadId}`);
  if (!response.ok) {
    throw new Error('Failed to fetch message thread');
  }
  return response.json();
}

async function sendMessage(input: SendMessageInput): Promise<PortalMessage> {
  const response = await fetch('/api/client-portal/messages', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(input),
  });
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Failed to send message');
  }
  return response.json();
}

async function markAsRead(messageId: string): Promise<PortalMessage> {
  const response = await fetch(`/api/client-portal/messages/${messageId}/read`, {
    method: 'POST',
  });
  if (!response.ok) {
    throw new Error('Failed to mark as read');
  }
  return response.json();
}

async function markThreadAsRead(threadId: string): Promise<{ updated: number }> {
  const response = await fetch(`/api/client-portal/messages/thread/${threadId}/read`, {
    method: 'POST',
  });
  if (!response.ok) {
    throw new Error('Failed to mark thread as read');
  }
  return response.json();
}

export function usePortalMessages(portalId: string) {
  return useQuery({
    queryKey: ['portal-messages', portalId],
    queryFn: () => fetchPortalMessages(portalId),
    enabled: !!portalId,
    refetchInterval: 30 * 1000, // Poll every 30 seconds for new messages
  });
}

export function useMessageThread(threadId: string) {
  return useQuery({
    queryKey: ['message-thread', threadId],
    queryFn: () => fetchMessageThread(threadId),
    enabled: !!threadId,
  });
}

export function useSendPortalMessage() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: sendMessage,
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['portal-messages', data.portal_id] });
    },
  });
}

export function useMarkMessageAsRead() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: markAsRead,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['portal-messages'] });
    },
  });
}

export function useMarkThreadAsRead() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: markThreadAsRead,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['portal-messages'] });
      queryClient.invalidateQueries({ queryKey: ['message-thread'] });
    },
  });
}
