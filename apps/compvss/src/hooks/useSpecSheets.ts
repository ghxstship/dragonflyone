'use client';

import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';

// =============================================================================
// SPEC SHEETS HOOKS
// Manage equipment specification sheets
// =============================================================================

export interface SpecSheet {
  id: string;
  name: string;
  manufacturer: string;
  category: 'Audio' | 'Lighting' | 'Video' | 'Staging' | 'Rigging' | 'Power';
  model: string;
  version: string;
  lastUpdated: string;
  fileSize: string;
  downloads: number;
  specs: { label: string; value: string }[];
}

// Fetch spec sheets
export function useSpecSheets() {
  return useQuery({
    queryKey: ['spec-sheets'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('spec_sheets')
        .select('*')
        .order('name', { ascending: true });

      if (error) throw error;
      
      return (data || []).map(s => ({
        id: s.id,
        name: s.name || s.title || '',
        manufacturer: s.manufacturer || '',
        category: s.category || 'Audio',
        model: s.model || '',
        version: s.version || '1.0',
        lastUpdated: s.updated_at?.split('T')[0] || '',
        fileSize: s.file_size || '0 KB',
        downloads: s.downloads || 0,
        specs: s.specifications || s.specs || [],
      })) as SpecSheet[];
    },
  });
}
