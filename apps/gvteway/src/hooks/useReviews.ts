'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';

export interface Review {
  id: string;
  event_id: string;
  user_id: string;
  rating: number;
  title: string;
  comment: string;
  verified_purchase: boolean;
  helpful_count: number;
  status: 'pending' | 'approved' | 'rejected';
  created_at?: string;
  updated_at?: string;
}

export const useReviews = (eventId?: string) => {
  return useQuery({
    queryKey: ['reviews', eventId],
    queryFn: async () => {
      let query = supabase
        .from('reviews')
        .select('*')
        .eq('status', 'approved')
        .order('created_at', { ascending: false });

      if (eventId) {
        query = query.eq('event_id', eventId);
      }

      const { data, error } = await query;
      if (error) throw error;
      return data as Review[];
    },
  });
};

export const useCreateReview = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (review: Omit<Review, 'id' | 'created_at' | 'updated_at' | 'helpful_count'>) => {
      const { data, error } = await supabase
        .from('reviews')
        .insert({ ...review, helpful_count: 0 })
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['reviews'] });
    },
  });
};

export const useUpdateReview = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, ...updates }: Partial<Review> & { id: string }) => {
      const { data, error } = await supabase
        .from('reviews')
        .update(updates)
        .eq('id', id)
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['reviews'] });
    },
  });
};

export const useDeleteReview = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('reviews')
        .delete()
        .eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['reviews'] });
    },
  });
};
