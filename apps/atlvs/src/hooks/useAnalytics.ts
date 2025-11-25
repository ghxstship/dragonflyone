import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';

export interface AnalyticsMetric {
  id: string;
  metric_name: string;
  value: number;
  period: string;
  date: string;
  category: string;
  metadata?: Record<string, any>;
  created_at?: string;
  updated_at?: string;
}

export const useAnalytics = (filters?: { 
  period?: string; 
  category?: string;
  startDate?: string;
  endDate?: string;
}) => {
  return useQuery({
    queryKey: ['analytics', filters],
    queryFn: async () => {
      let query = supabase
        .from('analytics_metrics')
        .select('*')
        .order('date', { ascending: false });

      if (filters?.period) {
        query = query.eq('period', filters.period);
      }
      if (filters?.category) {
        query = query.eq('category', filters.category);
      }
      if (filters?.startDate) {
        query = query.gte('date', filters.startDate);
      }
      if (filters?.endDate) {
        query = query.lte('date', filters.endDate);
      }

      const { data, error } = await query;
      if (error) throw error;
      return data as unknown as AnalyticsMetric[];
    },
  });
};

export const useCreateMetric = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (metric: Omit<AnalyticsMetric, 'id' | 'created_at' | 'updated_at'>) => {
      const { data, error } = await supabase
        .from('analytics_metrics')
        .insert(metric)
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['analytics'] });
    },
  });
};
