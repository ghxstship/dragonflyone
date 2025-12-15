'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';

// =============================================================================
// CHANNELS HOOKS
// Manage messaging channels and messages for team communication
// =============================================================================

export interface ChannelMember {
  id: string;
  name: string;
  role: string;
  department?: string;
  is_online: boolean;
}

export interface Channel {
  id: string;
  name: string;
  type: 'department' | 'project' | 'broadcast' | 'private';
  department?: string;
  description: string;
  members: ChannelMember[];
  is_active: boolean;
  created_at: string;
  unread_count: number;
  production_id?: string;
}

export interface Message {
  id: string;
  channel_id: string;
  sender: ChannelMember;
  content: string;
  timestamp: string;
  is_priority: boolean;
}

// Fetch all channels
export function useChannels(productionId?: string) {
  return useQuery({
    queryKey: ['channels', productionId],
    queryFn: async () => {
      let query = supabase
        .from('messaging_channels')
        .select('*')
        .order('name', { ascending: true });

      if (productionId) {
        query = query.eq('production_id', productionId);
      }

      const { data, error } = await query;
      if (error) throw error;
      return (data || []) as Channel[];
    },
  });
}

// Fetch single channel
export function useChannel(id: string) {
  return useQuery({
    queryKey: ['channels', id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('messaging_channels')
        .select('*')
        .eq('id', id)
        .single();

      if (error) throw error;
      return data as Channel;
    },
    enabled: !!id,
  });
}

// Fetch messages for a channel
export function useChannelMessages(channelId: string) {
  return useQuery({
    queryKey: ['channel-messages', channelId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('channel_messages')
        .select('*')
        .eq('channel_id', channelId)
        .order('timestamp', { ascending: true });

      if (error) throw error;
      return (data || []) as Message[];
    },
    enabled: !!channelId,
  });
}

// Fetch channel members
export function useChannelMembers() {
  return useQuery({
    queryKey: ['channel-members'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('crew_members')
        .select('id, full_name, role, department')
        .order('full_name', { ascending: true });

      if (error) throw error;
      return (data || []).map(m => ({
        id: m.id,
        name: m.full_name,
        role: m.role,
        department: m.department,
        is_online: false, // Would be populated by realtime presence
      })) as ChannelMember[];
    },
  });
}

// Create channel
export function useCreateChannel() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (channel: Omit<Channel, 'id' | 'created_at' | 'unread_count' | 'members'>) => {
      const { data, error } = await supabase
        .from('messaging_channels')
        .insert({
          name: channel.name,
          type: channel.type,
          department: channel.department,
          description: channel.description,
          is_active: channel.is_active,
          production_id: channel.production_id,
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['channels'] });
    },
  });
}

// Send message
export function useSendMessage() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (message: Omit<Message, 'id' | 'timestamp'>) => {
      const { data, error } = await supabase
        .from('channel_messages')
        .insert({
          channel_id: message.channel_id,
          sender_id: message.sender.id,
          content: message.content,
          is_priority: message.is_priority,
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['channel-messages', variables.channel_id] });
    },
  });
}

// Delete channel
export function useDeleteChannel() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from('messaging_channels').delete().eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['channels'] });
    },
  });
}
