'use client';

import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';

// =============================================================================
// BRAND ASSETS HOOKS
// Brand standards and asset documentation
// =============================================================================

export interface BrandAsset {
  id: string;
  name: string;
  type: string;
  format?: string;
  usage: string;
}

export interface BrandGuideline {
  id: string;
  title: string;
  category: string;
  content: string;
}

// Fetch brand assets
export function useBrandAssets() {
  return useQuery({
    queryKey: ['brand-assets'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('legend_documents')
        .select('*')
        .order('name', { ascending: true });

      if (error) throw error;
      
      return (data || []).map(a => ({
        id: a.id,
        name: a.name || '',
        type: a.asset_type || a.type || 'Logo',
        format: a.format,
        usage: a.usage_guidelines || a.description || '',
      })) as BrandAsset[];
    },
  });
}

// Fetch brand guidelines
export function useBrandGuidelines() {
  return useQuery({
    queryKey: ['brand-guidelines'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('legend_documents')
        .select('*')
        .order('title', { ascending: true });

      if (error) throw error;
      
      return (data || []).map(g => ({
        id: g.id,
        title: g.title || '',
        category: g.category || '',
        content: g.content || g.description || '',
      })) as BrandGuideline[];
    },
  });
}
