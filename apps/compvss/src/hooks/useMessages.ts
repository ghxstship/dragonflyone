'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';

// =============================================================================
// MESSAGES HOOKS
// Manage direct messages and conversations
// =============================================================================

export interface Conversation {
  id: string;
  participantName: string;
  participantRole: string;
  participantId: string;
  lastMessage: string;
  timestamp: string;
  unread: number;
  online: boolean;
}

export interface DirectMessage {
  id: string;
  conversationId: string;
  senderId: string;
  content: string;
  timestamp: string;
  read: boolean;
}

// Fetch conversations
export function useConversations() {
  return useQuery({
    queryKey: ['conversations'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('conversations')
        .select('*')
        .order('updated_at', { ascending: false });

      if (error) throw error;
      
      return (data || []).map(c => ({
        id: c.id,
        participantName: c.title || 'Conversation',
        participantRole: c.conversation_type || '',
        participantId: c.created_by || '',
        lastMessage: c.last_message_preview || '',
        timestamp: c.last_message_at?.split('T')[1]?.substring(0, 5) || '',
        unread: 0,
        online: false,
      })) as Conversation[];
    },
  });
}

// Fetch messages for a conversation
export function useDirectMessages(conversationId: string) {
  return useQuery({
    queryKey: ['direct-messages', conversationId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('direct_messages')
        .select('*')
        .eq('conversation_id', conversationId)
        .order('created_at', { ascending: true });

      if (error) throw error;
      
      return (data || []).map(m => ({
        id: m.id,
        conversationId: m.conversation_id,
        senderId: m.sender_id,
        content: m.content,
        timestamp: m.created_at?.split('T')[1]?.substring(0, 5) || '',
        read: m.read || false,
      })) as DirectMessage[];
    },
    enabled: !!conversationId,
  });
}

// Send message
export function useSendDirectMessage() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (message: { conversationId: string; content: string }) => {
      const { data, error } = await supabase
        .from('direct_messages')
        .insert({
          conversation_id: message.conversationId,
          content: message.content,
          sender_id: 'me',
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['direct-messages', data.conversation_id] });
      queryClient.invalidateQueries({ queryKey: ['conversations'] });
    },
  });
}
