'use client';

import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';

// =============================================================================
// OFFLINE CONTENT HOOKS
// Download content for mobile-optimized offline access
// =============================================================================

export interface OfflineContent {
  id: string;
  title: string;
  category: string;
  size: string;
  priority: string;
  lastSynced: string;
  status: 'Synced' | 'Pending' | 'Outdated' | 'Error';
}

export interface OfflinePackage {
  id: string;
  name: string;
  description: string;
  contentCount: number;
  totalSize: string;
  lastUpdated: string;
  downloaded: boolean;
}

// Fetch offline content
export function useOfflineContent() {
  return useQuery({
    queryKey: ['offline-content'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('legend_documents')
        .select('*')
        .order('title', { ascending: true });

      if (error) throw error;
      
      return (data || []).map(c => ({
        id: c.id,
        title: c.title || '',
        category: c.category || '',
        size: c.size || '0 MB',
        priority: c.priority || 'Normal',
        lastSynced: c.last_synced || c.updated_at || '',
        status: (c.status || 'Synced') as OfflineContent['status'],
      })) as OfflineContent[];
    },
  });
}

// Fetch offline packages
export function useOfflinePackages() {
  return useQuery({
    queryKey: ['offline-packages'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('legend_documents')
        .select('*')
        .order('name', { ascending: true });

      if (error) throw error;
      
      return (data || []).map(p => ({
        id: p.id,
        name: p.name || '',
        description: p.description || '',
        contentCount: p.content_count || 0,
        totalSize: p.total_size || '0 MB',
        lastUpdated: p.updated_at || '',
        downloaded: p.downloaded === true,
      })) as OfflinePackage[];
    },
  });
}
