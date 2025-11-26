'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import type { Tables, TablesInsert, TablesUpdate } from '@ghxstship/config';

export type Communication = Tables<'communications'>;
export type CommunicationInsert = TablesInsert<'communications'>;
export type CommunicationUpdate = TablesUpdate<'communications'>;

export const useCommunications = (filters?: { 
  type?: Communication['type']; 
  priority?: Communication['priority'];
}) => {
  return useQuery({
    queryKey: ['communications', filters],
    queryFn: async () => {
      let query = supabase
        .from('communications')
        .select('*')
        .order('timestamp', { ascending: false })
        .limit(100);

      if (filters?.type) {
        query = query.eq('type', filters.type);
      }
      if (filters?.priority) {
        query = query.eq('priority', filters.priority);
      }

      const { data, error } = await query;
      if (error) throw error;
      return data;
    },
  });
};

export const useSendCommunication = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (comm: CommunicationInsert) => {
      const { data, error } = await supabase
        .from('communications')
        .insert(comm)
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['communications'] });
    },
  });
};

export const useUpdateCommunication = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, ...updates }: CommunicationUpdate & { id: string }) => {
      const { data, error } = await supabase
        .from('communications')
        .update(updates)
        .eq('id', id)
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['communications'] });
    },
  });
};

export const useDeleteCommunication = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('communications')
        .delete()
        .eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['communications'] });
    },
  });
};
