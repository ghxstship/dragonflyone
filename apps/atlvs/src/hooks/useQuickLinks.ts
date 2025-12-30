'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import { log } from '@ghxstship/config';

// =============================================================================
// QUICK LINKS HOOKS
// User-favorited quick links for dashboard shortcuts
// =============================================================================

export interface QuickLink {
  id: string;
  name: string;
  description?: string;
  href: string;
  icon: string;
  category: 'projects' | 'finance' | 'assets' | 'crm' | 'reports' | 'settings' | 'general';
  is_active: boolean;
  sort_order: number;
  created_at: string;
  updated_at: string;
}

export interface UserQuickLinkFavorite {
  id: string;
  user_id: string;
  quick_link_id: string;
  sort_order: number;
  created_at: string;
  quick_link?: QuickLink;
}

interface QuickLinkFilters {
  category?: string;
  limit?: number;
}

// Default quick links for fallback when database is empty
const defaultQuickLinks: QuickLink[] = [
  { id: 'default-1', name: 'Create New Project', description: 'Start a new project from scratch', href: '/projects/new', icon: 'FolderPlus', category: 'projects', is_active: true, sort_order: 1, created_at: '', updated_at: '' },
  { id: 'default-2', name: 'Submit Expense Report', description: 'Submit a new expense for reimbursement', href: '/expenses/new', icon: 'Receipt', category: 'finance', is_active: true, sort_order: 10, created_at: '', updated_at: '' },
  { id: 'default-3', name: 'Check Asset Availability', description: 'View asset availability calendar', href: '/assets/availability', icon: 'Calendar', category: 'assets', is_active: true, sort_order: 20, created_at: '', updated_at: '' },
  { id: 'default-4', name: 'Generate Financial Report', description: 'Create financial summary report', href: '/reports/financial/new', icon: 'FileBarChart', category: 'reports', is_active: true, sort_order: 40, created_at: '', updated_at: '' },
];

// Fetch all quick links (master forms library)
export function useQuickLinks(filters?: QuickLinkFilters) {
  return useQuery({
    queryKey: ['quick_links', filters],
    queryFn: async () => {
      let query = supabase
        .from('dashboard_configs')
        .select('*')
        .eq('is_active', true)
        .order('sort_order', { ascending: true });

      if (filters?.category) {
        query = query.eq('category', filters.category);
      }
      if (filters?.limit) {
        query = query.limit(filters.limit);
      }

      const { data, error } = await query;
      
      // Return default links if table doesn't exist or is empty
      if (error || !data || data.length === 0) {
        return defaultQuickLinks;
      }
      
      return data as QuickLink[];
    },
  });
}

// Fetch user's favorite quick links
export function useUserQuickLinkFavorites(userId?: string) {
  return useQuery({
    queryKey: ['user_quick_link_favorites', userId],
    queryFn: async () => {
      if (!userId) {
        // Return default favorites for demo
        return defaultQuickLinks.slice(0, 4).map((link, index) => ({
          id: `fav-${index}`,
          user_id: 'demo',
          quick_link_id: link.id,
          sort_order: index,
          created_at: '',
          quick_link: link,
        })) as UserQuickLinkFavorite[];
      }

      const { data, error } = await supabase
        .from('user_favorites')
        .select(`
          *,
          quick_link:quick_links(*)
        `)
        .eq('user_id', userId)
        .order('sort_order', { ascending: true });

      if (error) {
        log.error('Error fetching favorites:', error instanceof Error ? error : undefined);
        // Return default favorites on error
        return defaultQuickLinks.slice(0, 4).map((link, index) => ({
          id: `fav-${index}`,
          user_id: userId,
          quick_link_id: link.id,
          sort_order: index,
          created_at: '',
          quick_link: link,
        })) as UserQuickLinkFavorite[];
      }

      // If no favorites, return defaults
      if (!data || data.length === 0) {
        return defaultQuickLinks.slice(0, 4).map((link, index) => ({
          id: `fav-${index}`,
          user_id: userId,
          quick_link_id: link.id,
          sort_order: index,
          created_at: '',
          quick_link: link,
        })) as UserQuickLinkFavorite[];
      }

      return data as UserQuickLinkFavorite[];
    },
    enabled: true,
  });
}

// Add quick link to favorites
export function useAddQuickLinkFavorite() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ userId, quickLinkId }: { userId: string; quickLinkId: string }) => {
      // Get current count to set sort order
      const { data: existing } = await supabase
        .from('user_favorites')
        .select('id')
        .eq('user_id', userId);

      const sortOrder = (existing?.length || 0) + 1;

      const { data, error } = await supabase
        .from('user_favorites')
        .insert({
          user_id: userId,
          quick_link_id: quickLinkId,
          sort_order: sortOrder,
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['user_quick_link_favorites', variables.userId] });
    },
  });
}

// Remove quick link from favorites
export function useRemoveQuickLinkFavorite() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ userId, quickLinkId }: { userId: string; quickLinkId: string }) => {
      const { error } = await supabase
        .from('user_favorites')
        .delete()
        .eq('user_id', userId)
        .eq('quick_link_id', quickLinkId);

      if (error) throw error;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['user_quick_link_favorites', variables.userId] });
    },
  });
}

// Toggle quick link favorite
export function useToggleQuickLinkFavorite() {
  const addFavorite = useAddQuickLinkFavorite();
  const removeFavorite = useRemoveQuickLinkFavorite();

  return useMutation({
    mutationFn: async ({ 
      userId, 
      quickLinkId, 
      isFavorited 
    }: { 
      userId: string; 
      quickLinkId: string; 
      isFavorited: boolean;
    }) => {
      if (isFavorited) {
        return removeFavorite.mutateAsync({ userId, quickLinkId });
      } else {
        return addFavorite.mutateAsync({ userId, quickLinkId });
      }
    },
  });
}

// Get quick link stats
export function useQuickLinkStats() {
  return useQuery({
    queryKey: ['quick_links', 'stats'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('dashboard_configs')
        .select('category')
        .eq('is_active', true);

      if (error) {
        return {
          total: defaultQuickLinks.length,
          byCategory: {
            projects: 1,
            finance: 1,
            assets: 1,
            crm: 0,
            reports: 1,
            settings: 0,
            general: 0,
          },
        };
      }

      const links = data || [];
      const byCategory = links.reduce((acc, link) => {
        acc[link.category] = (acc[link.category] || 0) + 1;
        return acc;
      }, {} as Record<string, number>);

      return {
        total: links.length,
        byCategory,
      };
    },
  });
}
