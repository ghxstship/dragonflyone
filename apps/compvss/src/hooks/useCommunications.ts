import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';

export interface Communication {
  id: string;
  type: 'radio' | 'phone' | 'email' | 'sms';
  from: string;
  to: string;
  message: string;
  timestamp: string;
  priority: 'normal' | 'urgent' | 'emergency';
  status: 'sent' | 'delivered' | 'read';
  metadata?: Record<string, any>;
  created_at?: string;
}

export const useCommunications = (filters?: { type?: string; priority?: string }) => {
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
      return data as Communication[];
    },
  });
};

export const useSendCommunication = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (comm: Omit<Communication, 'id' | 'created_at' | 'timestamp' | 'status'>) => {
      const { data, error } = await supabase
        .from('communications')
        .insert({
          ...comm,
          timestamp: new Date().toISOString(),
          status: 'sent',
        })
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
    mutationFn: async ({ id, ...updates }: Partial<Communication> & { id: string }) => {
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
