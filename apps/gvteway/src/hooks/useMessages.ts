'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';

export interface Message {
  id: string;
  sender_id: string;
  sender_name: string;
  sender_avatar?: string;
  content: string;
  created_at: string;
  read: boolean;
}

export interface Conversation {
  id: string;
  participant_id: string;
  participant_name: string;
  participant_avatar?: string;
  participant_verified: boolean;
  last_message?: string;
  last_message_at?: string;
  unread_count: number;
}

const DEMO_CONVERSATIONS: Conversation[] = [
  { id: 'c1', participant_id: 'u1', participant_name: 'Alex Johnson', participant_verified: true, last_message: 'See you at the show!', last_message_at: new Date().toISOString(), unread_count: 2 },
  { id: 'c2', participant_id: 'u2', participant_name: 'Sarah Chen', participant_verified: false, last_message: 'Thanks for the tickets!', last_message_at: new Date(Date.now() - 86400000).toISOString(), unread_count: 0 },
];

const DEMO_MESSAGES: Message[] = [
  { id: 'm1', sender_id: 'u1', sender_name: 'Alex Johnson', content: 'Hey, are you going to the festival?', created_at: new Date(Date.now() - 3600000).toISOString(), read: true },
  { id: 'm2', sender_id: 'me', sender_name: 'Me', content: 'Yes! Got my tickets yesterday', created_at: new Date(Date.now() - 1800000).toISOString(), read: true },
  { id: 'm3', sender_id: 'u1', sender_name: 'Alex Johnson', content: 'See you at the show!', created_at: new Date().toISOString(), read: false },
];

export const messagesKeys = {
  all: ['messages'] as const,
  conversations: () => [...messagesKeys.all, 'conversations'] as const,
  messages: (conversationId: string) => [...messagesKeys.all, 'messages', conversationId] as const,
};

export function useConversationsList() {
  return useQuery({
    queryKey: messagesKeys.conversations(),
    queryFn: async () => {
      const response = await fetch('/api/messages/conversations');
      if (response.status === 401) {
        return DEMO_CONVERSATIONS;
      }
      if (!response.ok) {
        throw new Error('Failed to fetch conversations');
      }
      const data = await response.json();
      return data.conversations || [];
    },
    staleTime: 1 * 60 * 1000,
  });
}

export function useMessagesList(conversationId?: string) {
  return useQuery({
    queryKey: messagesKeys.messages(conversationId || ''),
    queryFn: async () => {
      if (!conversationId) return [];
      const response = await fetch(`/api/messages/${conversationId}`);
      if (response.status === 401) {
        return DEMO_MESSAGES;
      }
      if (!response.ok) {
        throw new Error('Failed to fetch messages');
      }
      const data = await response.json();
      return data.messages || [];
    },
    enabled: !!conversationId,
    staleTime: 30 * 1000,
  });
}

export function useSendMessage() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ conversationId, content }: { conversationId: string; content: string }) => {
      const response = await fetch(`/api/messages/${conversationId}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content }),
      });
      if (!response.ok) {
        throw new Error('Failed to send message');
      }
      return response.json();
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: messagesKeys.messages(variables.conversationId) });
      queryClient.invalidateQueries({ queryKey: messagesKeys.conversations() });
    },
  });
}

export function useMessagesData(conversationId?: string) {
  const conversationsQuery = useConversationsList();
  const messagesQuery = useMessagesList(conversationId);
  const sendMessageMutation = useSendMessage();

  return {
    conversations: conversationsQuery.data || [],
    messages: messagesQuery.data || [],
    isLoading: conversationsQuery.isLoading,
    isLoadingMessages: messagesQuery.isLoading,
    error: conversationsQuery.error,
    refetchConversations: conversationsQuery.refetch,
    refetchMessages: messagesQuery.refetch,
    sendMessage: sendMessageMutation.mutateAsync,
    isSending: sendMessageMutation.isPending,
  };
}
