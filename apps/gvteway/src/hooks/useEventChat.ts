'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';

export interface ChatMessage {
  id: string;
  user_id: string;
  user_name: string;
  user_avatar?: string;
  content: string;
  created_at: string;
  is_pinned?: boolean;
  is_moderator?: boolean;
}

export interface EventChatRoom {
  id: string;
  event_id: string;
  event_title: string;
  event_date: string;
  status: 'active' | 'archived' | 'closed';
  participant_count: number;
  rules?: string[];
}

const DEMO_CHAT_ROOM: EventChatRoom = {
  id: 'chat-1',
  event_id: 'e1',
  event_title: 'Summer Festival 2024',
  event_date: new Date(Date.now() + 7 * 86400000).toISOString(),
  status: 'active',
  participant_count: 156,
  rules: ['Be respectful', 'No spam', 'Keep it on topic'],
};

const DEMO_MESSAGES: ChatMessage[] = [
  { id: 'm1', user_id: 'u1', user_name: 'John', content: 'So excited for this event!', created_at: new Date(Date.now() - 60000).toISOString() },
  { id: 'm2', user_id: 'u2', user_name: 'Sarah', content: 'Anyone know the setlist?', created_at: new Date(Date.now() - 30000).toISOString() },
];

export const eventChatKeys = {
  all: ['event-chat'] as const,
  room: (eventId: string) => [...eventChatKeys.all, eventId] as const,
};

export function useEventChatRoom(eventId: string) {
  return useQuery({
    queryKey: eventChatKeys.room(eventId),
    queryFn: async () => {
      const response = await fetch(`/api/events/${eventId}/chat`);
      if (!response.ok) return { chat_room: DEMO_CHAT_ROOM, messages: DEMO_MESSAGES };
      return response.json();
    },
    enabled: !!eventId,
    refetchInterval: 5000,
    staleTime: 0,
  });
}

export function useSendChatMessage() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ eventId, content }: { eventId: string; content: string }) => {
      const response = await fetch(`/api/events/${eventId}/chat`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content }),
      });
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to send message');
      }
      return response.json();
    },
    onSuccess: (_, { eventId }) => {
      queryClient.invalidateQueries({ queryKey: eventChatKeys.room(eventId) });
    },
  });
}

export function useEventChatData(eventId: string) {
  const chatQuery = useEventChatRoom(eventId);
  const sendMutation = useSendChatMessage();

  return {
    chatRoom: chatQuery.data?.chat_room || null,
    messages: chatQuery.data?.messages || [],
    isLoading: chatQuery.isLoading,
    error: chatQuery.error,
    sendMessage: (content: string) => sendMutation.mutateAsync({ eventId, content }),
    isSending: sendMutation.isPending,
  };
}
