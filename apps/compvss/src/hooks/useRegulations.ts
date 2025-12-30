'use client';

import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';

// =============================================================================
// REGULATIONS HOOKS
// Compliance documentation and regulatory references
// =============================================================================

export interface Regulation {
  id: string;
  title: string;
  category: string;
  jurisdiction: string;
  summary: string;
  status: 'Current' | 'Updated' | 'Review Required';
  lastUpdated: string;
}

// Fetch regulations
export function useRegulations() {
  return useQuery({
    queryKey: ['regulations'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('legend_documents')
        .select('*')
        .order('title', { ascending: true });

      if (error) throw error;
      
      return (data || []).map(r => ({
        id: r.id,
        title: r.title || '',
        category: r.category || '',
        jurisdiction: r.jurisdiction || '',
        summary: r.summary || r.description || '',
        status: (r.status || 'Current') as Regulation['status'],
        lastUpdated: r.updated_at || '',
      })) as Regulation[];
    },
  });
}
