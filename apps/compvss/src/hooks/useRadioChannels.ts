'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';

// =============================================================================
// RADIO CHANNELS HOOKS
// Manage radio channels and communications
// =============================================================================

export interface RadioChannel {
  id: string;
  name: string;
  frequency: string;
  priority: 'critical' | 'normal' | 'low';
  status: 'active' | 'standby' | 'inactive';
  users: number;
  production_id?: string;
  created_at?: string;
}

export interface RadioMessage {
  id: string;
  channel: string;
  channel_id: string;
  sender: string;
  message: string;
  timestamp: string;
  priority?: boolean;
}

// Fetch all radio channels
export function useRadioChannels(productionId?: string) {
  return useQuery({
    queryKey: ['radio-channels', productionId],
    queryFn: async () => {
      let query = supabase
        .from('radio_channels')
        .select('*')
        .order('priority', { ascending: true });

      if (productionId) {
        query = query.eq('production_id', productionId);
      }

      const { data, error } = await query;
      if (error) throw error;
      return (data || []) as RadioChannel[];
    },
  });
}

// Fetch radio messages
export function useRadioMessages(channelId?: string) {
  return useQuery({
    queryKey: ['radio-messages', channelId],
    queryFn: async () => {
      let query = supabase
        .from('radio_messages')
        .select('*')
        .order('timestamp', { ascending: false })
        .limit(50);

      if (channelId) {
        query = query.eq('channel_id', channelId);
      }

      const { data, error } = await query;
      if (error) throw error;
      return (data || []) as RadioMessage[];
    },
  });
}

// Send radio message
export function useSendRadioMessage() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (message: Omit<RadioMessage, 'id' | 'timestamp'>) => {
      const { data, error } = await supabase
        .from('radio_messages')
        .insert({
          channel_id: message.channel_id,
          channel: message.channel,
          sender: message.sender,
          message: message.message,
          priority: message.priority,
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['radio-messages'] });
    },
  });
}
