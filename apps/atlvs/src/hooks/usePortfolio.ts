'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';

export interface PortfolioItem {
  id: string;
  portfolio_id: string;
  item_type: string;
  title: string;
  description?: string;
  image_url?: string;
  video_url?: string;
  project_url?: string;
  client_name?: string;
  date_completed?: string;
  tags?: string[];
  display_order: number;
  is_featured: boolean;
  created_at: string;
  updated_at: string;
}

export interface Portfolio {
  id: string;
  user_id?: string;
  organization_id?: string;
  name: string;
  description?: string;
  is_public: boolean;
  is_default: boolean;
  view_count: number;
  created_at: string;
  updated_at: string;
  items?: PortfolioItem[];
}

export function usePortfolios(filters?: {
  is_public?: boolean;
}) {
  return useQuery({
    queryKey: ['portfolios', filters],
    queryFn: async () => {
      let query = supabase
        .from('portfolios')
        .select('*')
        .order('created_at', { ascending: false });

      if (filters?.is_public !== undefined) {
        query = query.eq('is_public', filters.is_public);
      }

      const { data, error } = await query;

      if (error) throw error;
      return (data || []) as Portfolio[];
    },
  });
}

export function usePortfolioItems(filters?: {
  portfolio_id?: string;
  is_featured?: boolean;
  item_type?: string;
}) {
  return useQuery({
    queryKey: ['portfolio_items', filters],
    queryFn: async () => {
      let query = supabase
        .from('portfolio_items')
        .select('*')
        .order('display_order', { ascending: true });

      if (filters?.portfolio_id) {
        query = query.eq('portfolio_id', filters.portfolio_id);
      }
      if (filters?.is_featured !== undefined) {
        query = query.eq('is_featured', filters.is_featured);
      }
      if (filters?.item_type && filters.item_type !== 'all') {
        query = query.eq('item_type', filters.item_type);
      }

      const { data, error } = await query;

      if (error) throw error;
      return (data || []) as PortfolioItem[];
    },
  });
}

export function usePortfolioItem(id: string) {
  return useQuery({
    queryKey: ['portfolio_items', id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('portfolio_items')
        .select('*')
        .eq('id', id)
        .single();

      if (error) throw error;
      return data as PortfolioItem;
    },
    enabled: !!id,
  });
}

export function useCreatePortfolioItem() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (item: {
      portfolio_id: string;
      item_type: string;
      title: string;
      description?: string;
      image_url?: string;
      video_url?: string;
      project_url?: string;
      client_name?: string;
      date_completed?: string;
      tags?: string[];
      display_order?: number;
      is_featured?: boolean;
    }) => {
      const { data, error } = await supabase
        .from('portfolio_items')
        .insert([item])
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['portfolio_items'] });
    },
  });
}

export function useUpdatePortfolioItem() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, ...updates }: Partial<PortfolioItem> & { id: string }) => {
      const { data, error } = await supabase
        .from('portfolio_items')
        .update({ ...updates, updated_at: new Date().toISOString() })
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['portfolio_items'] });
      queryClient.invalidateQueries({ queryKey: ['portfolio_items', data.id] });
    },
  });
}

export function useDeletePortfolioItem() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('portfolio_items')
        .delete()
        .eq('id', id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['portfolio_items'] });
    },
  });
}

export function useTogglePortfolioItemFeatured() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, is_featured }: { id: string; is_featured: boolean }) => {
      const { data, error } = await supabase
        .from('portfolio_items')
        .update({ is_featured, updated_at: new Date().toISOString() })
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['portfolio_items'] });
      queryClient.invalidateQueries({ queryKey: ['portfolio_items', data.id] });
    },
  });
}
