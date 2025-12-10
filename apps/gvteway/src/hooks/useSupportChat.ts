'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';

export interface Message {
  id: string;
  sender: 'user' | 'agent' | 'system';
  content: string;
  timestamp: string;
  agent_name?: string;
}

export interface Conversation {
  id: string;
  subject: string;
  status: 'open' | 'waiting' | 'resolved';
  event_id?: string;
  event_title?: string;
  created_at: string;
  messages: Message[];
}

const DEMO_CONVERSATIONS: Conversation[] = [
  {
    id: '1',
    subject: 'Ticket Issue',
    status: 'open',
    created_at: new Date().toISOString(),
    messages: [
      { id: 'm1', sender: 'user', content: 'I have a question about my tickets', timestamp: new Date().toISOString() },
      { id: 'm2', sender: 'agent', content: 'Hi! How can I help you today?', timestamp: new Date().toISOString(), agent_name: 'Support Agent' },
    ],
  },
];

export const supportChatKeys = {
  all: ['support-chat'] as const,
  conversations: () => [...supportChatKeys.all, 'conversations'] as const,
};

export function useConversations() {
  return useQuery({
    queryKey: supportChatKeys.conversations(),
    queryFn: async () => {
      const response = await fetch('/api/support/conversations');
      if (!response.ok) return DEMO_CONVERSATIONS;
      const data = await response.json();
      return data.conversations || DEMO_CONVERSATIONS;
    },
    staleTime: 30 * 1000,
  });
}

export function useSendMessage() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ conversationId, content }: { conversationId: string; content: string }) => {
      const response = await fetch(`/api/support/conversations/${conversationId}/messages`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content }),
      });
      if (!response.ok) throw new Error('Failed to send message');
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: supportChatKeys.all });
    },
  });
}

export function useCreateConversation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ subject, category, eventId, orderId }: { subject: string; category: string; eventId?: string; orderId?: string }) => {
      const response = await fetch('/api/support/conversations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ subject, category, event_id: eventId, order_id: orderId }),
      });
      if (!response.ok) throw new Error('Failed to create conversation');
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: supportChatKeys.all });
    },
  });
}

export function useSupportChatData() {
  const conversationsQuery = useConversations();
  const sendMutation = useSendMessage();
  const createMutation = useCreateConversation();

  return {
    conversations: conversationsQuery.data || [],
    isLoading: conversationsQuery.isLoading,
    error: conversationsQuery.error,
    refetch: conversationsQuery.refetch,
    sendMessage: sendMutation.mutateAsync,
    isSending: sendMutation.isPending,
    createConversation: createMutation.mutateAsync,
    isCreating: createMutation.isPending,
  };
}
